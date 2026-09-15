package hk.senyou.travel

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import hk.senyou.travel.data.AlarmRepo
import hk.senyou.travel.data.CrashLog
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.MtrRepo
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.StandbyAudio
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.data.TradSimp
import hk.senyou.travel.data.displayName
import hk.senyou.travel.data.matchKey
import hk.senyou.travel.data.toFav
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.util.Calendar

/**
 * 2026-09 評審後補的「盲區測試」。
 *
 * 這些正是評審指出「完全沒有測試覆蓋」的部分，其中數項是已修 bug 的回歸鎖：
 * · 鬧鐘排程（AlarmRepo.nextTrigger）
 * · 崩潰日誌本體（CrashLog.write）—— **以 sdk 26 與 34 雙跑**，這正是能抓到
 *   「minSdk 26 卻呼叫 API 28 的 PackageInfo.longVersionCode」那個 bug 的配置
 * · 巴士站收藏的顯示名稱（先前為空白）
 * · 輕鐵分區不得漏站或重複（先前漏 10 站、重複 1 站）
 * · 通宵線過濾、簡繁轉換
 * · 內建合成音在離開待機畫面後仍能重新播放（先前永久無聲）
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [26, 34])
class AuditGuardTest {

    private val ctx: Context get() = ApplicationProvider.getApplicationContext()

    /* ---------------- 鬧鐘排程 ---------------- */

    private fun at(y: Int, mo: Int, d: Int, h: Int, mi: Int): Long =
        Calendar.getInstance().apply {
            set(y, mo, d, h, mi, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

    @Test
    fun alarmNextTrigger_firesLaterTodayWhenTimeIsStillAhead() {
        val from = at(2026, Calendar.JANUARY, 15, 10, 0)
        val t = AlarmRepo.nextTrigger(23, 30, from)
        assertTrue("必須晚於 now", t > from)
        val c = Calendar.getInstance().apply { timeInMillis = t }
        assertEquals(23, c.get(Calendar.HOUR_OF_DAY))
        assertEquals(30, c.get(Calendar.MINUTE))
        assertEquals(Calendar.JANUARY, c.get(Calendar.MONTH))
        assertEquals(15, c.get(Calendar.DAY_OF_MONTH))
    }

    @Test
    fun alarmNextTrigger_rollsToTomorrowWhenTimeHasPassed() {
        val from = at(2026, Calendar.JANUARY, 15, 10, 0)
        val t = AlarmRepo.nextTrigger(6, 0, from)
        assertTrue(t > from)
        val c = Calendar.getInstance().apply { timeInMillis = t }
        assertEquals(6, c.get(Calendar.HOUR_OF_DAY))
        assertEquals(0, c.get(Calendar.MINUTE))
        assertEquals(16, c.get(Calendar.DAY_OF_MONTH))
    }

    @Test
    fun alarmNextTrigger_handlesMidnightBoundary() {
        val from = at(2026, Calendar.JANUARY, 15, 23, 59)
        val t = AlarmRepo.nextTrigger(0, 0, from)
        assertTrue("00:00 已過 → 必須順延到隔天", t > from)
        val c = Calendar.getInstance().apply { timeInMillis = t }
        assertEquals(0, c.get(Calendar.HOUR_OF_DAY))
        assertEquals(0, c.get(Calendar.MINUTE))
        assertEquals(16, c.get(Calendar.DAY_OF_MONTH))
    }

    /* ---------------- 搜尋：通宵線與簡繁 ---------------- */

    @Test
    fun overnightRouteDetection() {
        assertTrue(SearchRepo.isOvernightRoute("N969"))
        assertTrue(SearchRepo.isOvernightRoute("n11"))
        assertTrue(SearchRepo.isOvernightRoute(" N368 "))
        assertFalse(SearchRepo.isOvernightRoute("969"))
        assertFalse(SearchRepo.isOvernightRoute(""))
    }

    @Test
    fun tradSimpPreservesStructureAndPassesAsciiThrough() {
        val ascii = "69X to TSW"
        assertEquals(ascii, TradSimp.toTrad(ascii))
        assertEquals(ascii, TradSimp.toSimp(ascii))

        val simplified = "东涌线"
        val trad = TradSimp.toTrad(simplified)
        assertEquals("轉換不得改變長度（逐字對照表）", simplified.length, trad.length)

        val traditional = "東涌綫"
        val simp = TradSimp.toSimp(traditional)
        assertEquals("轉換不得改變長度（逐字對照表）", traditional.length, simp.length)
    }

    /* ---------------- 收藏：巴士站不再是死路 ---------------- */

    @Test
    fun busStopFavouriteHasNonBlankTitleAndKey() {
        val stop = SearchItem(kind = Kind.BUSSTOP, no = "69X", name = "天瑞總站", stopId = "1A2B3C")
        val fav = stop.toFav()
        assertTrue("巴士站收藏的顯示名稱不得為空（先前為空白）", fav.displayName().isNotBlank())
        assertTrue("收藏鍵不得為空", fav.matchKey().isNotBlank())
    }

    /* ---------------- 輕鐵分區：不漏站、不重複 ---------------- */

    @Test
    fun lrtGroupingCoversEveryStationExactlyOnce() {
        StaticData.load(ctx)
        val ids = StaticData.lrtStations.keys
        assertTrue("靜態資料應載入輕鐵站表", ids.isNotEmpty())

        val unassigned = ids.filter { MtrRepo.lrtGroupOf(it) == null }
        assertTrue("每個輕鐵站都必須有分區，未歸類：$unassigned", unassigned.isEmpty())

        val listed = MtrRepo.lrtGroups().flatMap { it.second }.map { it.id }
        assertEquals("分區聯集不得漏站（先前漏 10 站、重複 1 站）", ids.size, listed.size)
        assertEquals("不得有重複收錄", listed.size, listed.toSet().size)
        assertEquals("分區聯集必須等於站表", ids.toSet(), listed.toSet())
    }

    /* ---------------- 崩潰日誌本體（sdk 26 + 34 雙跑） ---------------- */

    @Test
    fun crashLogWritesReadableHeaderOnThisSdk() {
        CrashLog.clear(ctx)
        val write = CrashLog::class.java.getDeclaredMethod(
            "write",
            Context::class.java,
            String::class.java,
            Throwable::class.java,
        )
        write.isAccessible = true
        write.invoke(CrashLog, ctx, "main", IllegalStateException("audit-guard"))

        val text = CrashLog.latestText(ctx)
        assertNotNull("崩潰日誌必須真的寫出檔案（API 26/27 曾因 longVersionCode 而永遠寫不出）", text)
        assertTrue("需含可辨識的 App 版本行", text!!.contains("App："))
        assertTrue("需含系統／機型行", text.contains("系統："))
        assertTrue("需含原始例外", text.contains("audit-guard"))
        assertTrue("需含堆疊", text.contains("IllegalStateException"))
        CrashLog.clear(ctx)
    }

    /* ---------------- 內建合成音：離開待機後仍能再播 ---------------- */

    @Test
    fun standbyAudioCanRestartAfterRelease() {
        StandbyAudio.releaseAll()
        assertFalse(StandbyAudio.isPlaying)

        StandbyAudio.play()
        assertTrue("play() 後應為播放中", StandbyAudio.isPlaying)

        StandbyAudio.releaseAll()
        assertFalse("releaseAll() 後應停止", StandbyAudio.isPlaying)

        /* 回歸鎖：先前離開待機畫面（StandbyActivity.onDestroy → releaseAll）之後，
           pump 執行緒因迴圈條件恆真而不結束，play() 不再重建 → 音樂與鬧鐘永久無聲。 */
        StandbyAudio.play()
        assertTrue("離開待機後必須仍能重新播放（否則鬧鐘會響鈴卻無聲）", StandbyAudio.isPlaying)

        StandbyAudio.toggle()
        assertFalse("toggle() 應能暫停", StandbyAudio.isPlaying)
        StandbyAudio.releaseAll()
    }
}
