package hk.senyou.travel

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.Cache
import hk.senyou.travel.data.CrashLog
import hk.senyou.travel.data.Fav
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.deepLinkItem
import hk.senyou.travel.data.displayName
import hk.senyou.travel.data.matchKey
import hk.senyou.travel.data.toFav
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File

/** 資料層邏輯測試：序列化往返、搜尋歷史、快取、崩潰日誌、映射 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LogicTest {

    private lateinit var ctx: Context

    @Before
    fun setUp() {
        ctx = ApplicationProvider.getApplicationContext()
    }

    /* ---------- 收藏序列化往返 ---------- */

    @Test
    fun favorites_roundTrip_includingAlertMins() = runBlocking {
        val list = listOf(
            Fav(type = "bus", company = "kmb", route = "69X", dir = "inbound", stopId = "ABC123", stopName = "天瑞總站", alertMins = 10),
            Fav(type = "mtr", company = "mtr", stationCode = "TIS", stationName = "天水圍", lineName = "屯馬線", alertMins = 3),
        )
        Store.saveFavorites(ctx, list)
        val back = Store.favorites(ctx).first()
        assertEquals(2, back.size)
        assertEquals(10, back[0].alertMins)
        assertEquals("ABC123", back[0].stopId)
        assertEquals("inbound", back[0].dir)
        assertEquals("屯馬線", back[1].lineName)
        assertEquals(3, back[1].alertMins)
        assertEquals(list[0].matchKey(), back[0].matchKey())
        assertEquals(list[0].key, back[0].key)
    }

    @Test
    fun favorites_saveEmptyClears() = runBlocking {
        Store.saveFavorites(ctx, listOf(Fav(type = "bus", route = "69X")))
        assertEquals(1, Store.favorites(ctx).first().size)
        Store.saveFavorites(ctx, emptyList())
        assertTrue(Store.favorites(ctx).first().isEmpty())
    }

    /* ---------- 設定序列化往返 ---------- */

    @Test
    fun settings_roundTrip() = runBlocking {
        val s = Settings(
            theme = "light", glass = 4, fx = "simple", big = true, deep = true,
            night = "manual", accent = 0xFFAA00FF, fontLevel = 7, refresh = 60,
        )
        Store.save(ctx, s)
        assertEquals(s, Store.settings(ctx).first())
    }

    @Test
    fun settings_defaultsRoundTrip() = runBlocking {
        Store.save(ctx, Settings())
        val d = Store.settings(ctx).first()
        assertEquals("dark", d.theme)
        assertEquals(2, d.glass)
        assertEquals(3, d.fontLevel)
        assertEquals(30, d.refresh)
    }

    /* ---------- 搜尋歷史 ---------- */

    @Test
    fun recent_dedupeMovesToFront() = runBlocking {
        Store.pushRecent(ctx, "69X")
        Store.pushRecent(ctx, "969")
        Store.pushRecent(ctx, "69X")
        val r = Store.recent(ctx).first()
        assertEquals("69X", r[0])
        assertEquals("969", r[1])
        assertEquals(1, r.count { it == "69X" })   // 去重：只保留一條
    }

    @Test
    fun recent_limitTenAndSkipBlank() = runBlocking {
        for (i in 1..12) Store.pushRecent(ctx, "R$i")
        val r = Store.recent(ctx).first()
        assertEquals(10, r.size)
        assertEquals("R12", r.first())
        val before = r.size
        Store.pushRecent(ctx, "   ")
        assertEquals(before, Store.recent(ctx).first().size)
        // 空白應被 trim
        Store.pushRecent(ctx, "  A11  ")
        assertEquals("A11", Store.recent(ctx).first().first())
    }

    /* ---------- 離線緩存 ---------- */

    @Test
    fun etaCache_roundTripAndNullNoop() {
        val key = "bus|kmb|69X|outbound|||test"
        assertNull(Cache.etaCache(key))
        Cache.putEtaCache(key, 7)
        val got = Cache.etaCache(key)
        assertNotNull(got)
        assertEquals(7, got!!.first)
        assertTrue("時間戳應為近期", System.currentTimeMillis() - got.second < 5000)
        Cache.putEtaCache(key, null)          // null 不覆寫
        assertEquals(7, Cache.etaCache(key)!!.first)
        Cache.putEtaCache(key, 0)             // 0 也要能存
        assertEquals(0, Cache.etaCache(key)!!.first)
    }

    @Test
    fun alertSent_marksTimestamp() {
        val key = "alert-key-" + System.nanoTime()
        assertEquals(0L, Cache.alertSentAt(key))
        Cache.markAlertSent(key)
        assertTrue(Cache.alertSentAt(key) > 0)
    }

    /* ---------- 崩潰日誌 ---------- */

    @Test
    fun crashLog_countLatestClear() {
        val dir = File(ctx.filesDir, "crashes").apply { mkdirs() }
        dir.listFiles()?.forEach { it.delete() }
        assertEquals(0, CrashLog.count(ctx))
        assertNull(CrashLog.latestText(ctx))

        File(dir, "crash-20260101-000001.txt").writeText("first")
        File(dir, "crash-20260101-000002.txt").writeText("second")
        assertEquals(2, CrashLog.count(ctx))
        assertEquals("second", CrashLog.latestText(ctx))   // 最新（檔名倒序）

        CrashLog.clear(ctx)
        assertEquals(0, CrashLog.count(ctx))
    }

    /* ---------- 映射函數 ---------- */

    @Test
    fun favMeta_mtrLineNameNotDuplicated() {
        assertEquals("屯馬線", SearchRepo.favMeta(Fav(type = "mtr", company = "mtr", lineName = "屯馬線")))
        assertEquals("屯馬 綫", SearchRepo.favMeta(Fav(type = "mtr", company = "mtr", lineName = "屯馬")))
        assertEquals("TML 綫", SearchRepo.favMeta(Fav(type = "mtr", company = "mtr", line = "TML")))
        assertEquals("港鐵 綫", SearchRepo.favMeta(Fav(type = "mtr", company = "mtr")))
        assertEquals("九巴 69X", SearchRepo.favMeta(Fav(type = "bus", company = "kmb", route = "69X")))
        assertEquals("城巴 969", SearchRepo.favMeta(Fav(type = "bus", company = "ctb", route = "969")))
        assertEquals("嶼巴 11", SearchRepo.favMeta(Fav(type = "bus", company = "nlb", route = "11")))
        assertEquals("港鐵巴士 K75P", SearchRepo.favMeta(Fav(type = "mtrbus", route = "K75P")))
        assertEquals("天瑞", SearchRepo.favMeta(Fav(type = "lrt", stopName = "天瑞")))
    }

    @Test
    fun favGroup_buckets() {
        assertEquals("kmb", SearchRepo.favGroup(Fav(type = "bus", company = "kmb")))
        assertEquals("ctb", SearchRepo.favGroup(Fav(type = "bus", company = "ctb")))
        assertEquals("nlb", SearchRepo.favGroup(Fav(type = "bus", company = "nlb")))
        assertEquals("mtrbus", SearchRepo.favGroup(Fav(type = "mtrbus")))
        assertEquals("mtr", SearchRepo.favGroup(Fav(type = "mtr")))
        assertEquals("lrt", SearchRepo.favGroup(Fav(type = "lrt")))
        assertEquals("other", SearchRepo.favGroup(Fav(type = "unknown")))
    }

    @Test
    fun displayName_priority() {
        assertEquals("69X", Fav(type = "bus", route = "69X").displayName())
        assertEquals("天水圍", Fav(type = "mtr", stationName = "天水圍").displayName())
        assertEquals("天瑞", Fav(type = "lrt", stopName = "天瑞").displayName())
        assertEquals("K75P", Fav(type = "mtrbus", route = "K75P").displayName())
        assertEquals("收藏", Fav(type = "mtr").displayName())
    }

    @Test
    fun searchItem_toFav_mappingAndMatchKey() {
        val kmb = SearchItem(kind = Kind.KMB, no = "69X", name = "天瑞 → 高鐵", route = "69X", dir = "outbound")
        val ctb = SearchItem(kind = Kind.CTB, no = "969", name = "天水圍 → 銅鑼灣", route = "969", dir = "outbound")
        val nlb = SearchItem(kind = Kind.NLB, no = "11", name = "東涌", route = "11", routeId = "R11", dir = "outbound")
        val mtr = SearchItem(kind = Kind.MTR, no = "MTR", name = "天水圍", stationCode = "TIS", stationName = "天水圍")
        val lrt = SearchItem(kind = Kind.LRT, no = "輕鐵", name = "天瑞", stationCode = "460", stationName = "天瑞")
        val mtrbus = SearchItem(kind = Kind.MTRBUS, no = "K75P", name = "天瑞 ↺ 洪水橋", route = "K75P")

        assertEquals("bus", kmb.toFav().type)
        assertEquals("kmb", kmb.toFav().company)
        assertEquals("ctb", ctb.toFav().company)
        assertEquals("nlb", nlb.toFav().company)
        assertEquals("R11", nlb.toFav().routeId)
        assertEquals("mtr", mtr.toFav().type)
        assertEquals("TIS", mtr.toFav().stationCode)
        assertEquals("lrt", lrt.toFav().type)
        assertEquals("mtrbus", mtrbus.toFav().type)

        // matchKey 應一致（收藏去重靠它）
        assertEquals(kmb.matchKey(), kmb.toFav().matchKey())
        assertEquals(mtr.matchKey(), mtr.toFav().matchKey())
        assertEquals(lrt.matchKey(), lrt.toFav().matchKey())
        assertEquals(nlb.matchKey(), nlb.toFav().matchKey())
        // 不同路線 / 不同站不應同鍵
        assertTrue(kmb.matchKey() != ctb.matchKey())
        assertTrue(mtr.matchKey() != lrt.matchKey())
    }

    /* ---------- 到站通知深鏈 ---------- */

    @Test
    fun deepLink_busTypes() {
        val kmb = deepLinkItem("bus", "69X", null, null, "kmb", "inbound", "ABC", null)
        assertEquals(Kind.KMB, kmb!!.kind)
        assertEquals("inbound", kmb.dir)
        assertEquals("ABC", kmb.stopId)

        assertEquals(Kind.CTB, deepLinkItem("bus", "969", null, null, "ctb", null, null, null)!!.kind)
        assertEquals(Kind.NLB, deepLinkItem("bus", "11", null, null, "nlb", null, null, "R11")!!.kind)
        assertEquals("R11", deepLinkItem("bus", "11", null, null, "nlb", null, null, "R11")!!.routeId)
        // 預設方向
        assertEquals("outbound", deepLinkItem("bus", "69X", null, null, "kmb", null, null, null)!!.dir)
        // 缺路線 → null（不開空白頁）
        assertNull(deepLinkItem("bus", "", null, null, "kmb", null, null, null))
        assertNull(deepLinkItem(null, null, null, null, null, null, null, null))
    }

    @Test
    fun deepLink_stationTypes() {
        val mtr = deepLinkItem("mtr", "", "TIS", "天水圍", "mtr", null, null, null)
        assertEquals(Kind.MTR, mtr!!.kind)
        assertEquals("TIS", mtr.stationCode)
        assertEquals("天水圍", mtr.stationName)

        val lrt = deepLinkItem("lrt", "", "460", "天瑞", "lrt", null, null, null)
        assertEquals(Kind.LRT, lrt!!.kind)
        assertEquals("460", lrt.stationCode)

        val bus = deepLinkItem("mtrbus", "K75P", null, null, "mtrbus", null, null, null)
        assertEquals(Kind.MTRBUS, bus!!.kind)
        assertEquals("K75P", bus.route)

        // 車站代碼缺失 → null（港鐵/輕鐵通知必須帶站碼）
        assertNull(deepLinkItem("mtr", "", "", null, "mtr", null, null, null))
        assertNull(deepLinkItem("lrt", "", null, null, "lrt", null, null, null))
        assertNull(deepLinkItem("mtrbus", "", null, null, "mtrbus", null, null, null))
        // 站名缺失時退回站碼
        assertEquals("TIS", deepLinkItem("mtr", "", "TIS", "", "mtr", null, null, null)!!.stationName)
    }

    /* ---------- 語義色分級 ---------- */

    @Test
    fun etaTier_thresholds() {
        assertEquals(2, Api.etaTier(0))
        assertEquals(2, Api.etaTier(60))
        assertEquals(2, Api.etaTier(120))
        assertEquals(1, Api.etaTier(121))
        assertEquals(1, Api.etaTier(600))
        assertEquals(0, Api.etaTier(601))
        assertEquals(-1, Api.etaTier(null))
    }

    /* ---------- ETA 文案（與 Web 版一致） ---------- */

    @Test
    fun etaText_rules() {
        assertEquals("—", Api.etaText(null))
        assertEquals("即將", Api.etaText(0))
        assertEquals("即將", Api.etaText(-2))
        assertEquals("1 分", Api.etaText(1))
        assertEquals("12 分", Api.etaText(12))
    }

    @Test
    fun minsUntil_pastIsNull_futureRoundsUp() {
        val fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX")
        val now = java.time.OffsetDateTime.now()
        assertNull(Api.minsUntil(now.minusMinutes(2).format(fmt)))   // 已過期 → 無資料
        assertEquals(1, Api.minsUntil(now.plusSeconds(45).format(fmt)))   // <1 分鐘 → 1
        assertEquals(6, Api.minsUntil(now.plusMinutes(5).plusSeconds(30).format(fmt)))
        assertNull(Api.minsUntil(null))
        assertNull(Api.minsUntil("not-a-time"))
        // 港鐵格式（無時區）也要能解析
        val space = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        assertEquals(9, Api.minsUntil(now.plusMinutes(8).plusSeconds(30).format(space)))
    }
}
