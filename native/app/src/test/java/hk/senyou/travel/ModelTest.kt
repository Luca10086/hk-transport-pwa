package hk.senyou.travel

import androidx.test.core.app.ApplicationProvider
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.K75PModel
import hk.senyou.travel.data.LatLng
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.ui.AdaptiveInfo
import hk.senyou.travel.ui.FoldPosture
import hk.senyou.travel.ui.SizeClass
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

/** 核心邏輯單元測試（防回歸）：時間解析、K75P 投影、自適應斷點 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ModelTest {

    @Before
    fun loadStatic() {
        StaticData.load(ApplicationProvider.getApplicationContext())
    }

    /* ---------- 時間解析 ---------- */

    @Test
    fun parseIso_kmbFormat() {
        val ms = Api.parseIso("2026-09-09T19:37:00+08:00")
        assertNotNull("KMB ISO(+08:00) 應可解析", ms)
    }

    @Test
    fun parseIso_mtrSpaceFormat() {
        val ms = Api.parseIso("2026-09-09 19:37:06")
        assertNotNull("港鐵 yyyy-MM-dd HH:mm:ss 應可解析", ms)
    }

    @Test
    fun parseIso_invalid() {
        assertNull(Api.parseIso(null))
        assertNull(Api.parseIso(""))
        assertNull(Api.parseIso("not-a-time"))
    }

    @Test
    fun minsUntil_futureAndPast() {
        val fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX")
        val in10 = OffsetDateTime.now().plusMinutes(10).format(fmt)
        val m = Api.minsUntil(in10)
        assertNotNull(m)
        assertTrue("10 分鐘後應為 9..11，實際 $m", m!! in 9..11)

        val past = OffsetDateTime.now().minusMinutes(5).format(fmt)
        assertNull("已過時間應為 null（顯示 —），與 Web 版一致", Api.minsUntil(past))
    }

    /* ---------- K75P 投影（窗口錨定：以「下一班到站」為準） ---------- */

    @Test
    fun gpsPos_atStartStop_returnsZero() {
        val c = StaticData.k75pCoords["D010"]!!
        // 下一站 = 站 1（D020 之前的站），公車在站 0 → 段 0 內
        val pos = K75PModel.gpsPos(LatLng(c.lat, c.lng), 1, 0.0f, null)
        assertNotNull(pos)
        assertTrue("起點站應投影到 0 附近，實際 $pos", pos!! < 0.6f)
    }

    @Test
    fun gpsPos_midSegment_returnsHalf() {
        val a = StaticData.k75pCoords["D010"]!!
        val b = StaticData.k75pCoords["D020"]!!
        val mid = LatLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2)
        val pos = K75PModel.gpsPos(mid, 1, 0.5f, null)
        assertNotNull(pos)
        assertTrue("段中點應投影到 0.5 附近，實際 $pos", pos!! in 0.2f..0.8f)
    }

    @Test
    fun gpsPos_farAway_rejected() {
        // 遠離路線（香港島）→ 窗口內都找不到合理距離 → 拒絕（改用 ETA 推估）
        assertNull(K75PModel.gpsPos(LatLng(22.28, 114.16), 1, 0f, null))
    }

    /** 回歸測試：U 形循環線的兩臂相距很近，GPS 不得跳到對面那條臂 */
    @Test
    fun gpsPos_neverJumpsToOppositeArm() {
        // 取「回程臂」某站座標，但 AVL 說下一班是「去程」第 5 站 → 只能在 1..5 之間
        val stop = StaticData.k75pStops[17]
        val c = StaticData.k75pCoords[stop.id]!!
        val pos = K75PModel.gpsPos(LatLng(c.lat, c.lng), 5, 4.5f, 4.0f)
        // 回傳 null 亦可（窗口內無可信段 → 改用 ETA 推估），重點是絕不能落在對面臂（≈17）
        if (pos != null) {
            assertTrue("投影必須落在窗口 1..5 內（不得跳到站 17 的對面臂），實際 $pos", pos >= 0.9f && pos <= 5.1f)
        }
    }

    /** 循環線首尾同點：站 22 應歸一到站 0，否則標記會畫到地圖另一端 */
    @Test
    fun gpsPos_loopEndNormalisedToStart() {
        val last = StaticData.k75pStops[22]
        val c = StaticData.k75pCoords[last.id]!!
        val pos = K75PModel.gpsPos(LatLng(c.lat, c.lng), 1, 0.0f, null)
        assertNotNull(pos)
        assertTrue("天瑞應投影到起點 0 附近（或 21.x 進站），實際 $pos", pos!! < 0.6f || pos > 20.5f)
    }

    /** 回歸測試：GPS 為準，不得只走 55% 造成落後好幾站 */
    @Test
    fun build_gpsFollowsPromptly() {
        val d = StaticData.k75pStops[10]
        val c = StaticData.k75pCoords[d.id]!!
        val payload = JSONObject().put(
            "busStop",
            JSONArray().put(
                JSONObject().put("busStopId", "K75P-${d.id}").put(
                    "bus",
                    JSONArray().put(
                        JSONObject()
                            .put("busId", "GPS1")
                            .put("arrivalTimeInSecond", 120)
                            .put("busLocation", JSONObject().put("latitude", c.lat).put("longitude", c.lng)),
                    ),
                ),
            ),
        )
        // 上次顯示在站 2，GPS 實測在站 10 → 一次更新應前進絕大部分（舊版只走 55%）
        val m = K75PModel.build(payload, mapOf("GPS1" to 2f)).first()
        assertTrue("GPS 實測位置應迅速跟上（實際 ${m.pos}）", m.pos > 8f)
    }

    @Test
    fun build_fromPayload_producesMarker() {
        val d010 = StaticData.k75pCoords["D010"]!!
        val payload = JSONObject().put(
            "busStop",
            JSONArray().put(
                JSONObject().put("busStopId", "K75P-D010").put(
                    "bus",
                    JSONArray().put(
                        JSONObject()
                            .put("busId", "TEST1")
                            .put("arrivalTimeInSecond", 600)
                            .put("busLocation", JSONObject().put("latitude", d010.lat).put("longitude", d010.lng)),
                    ),
                ),
            ),
        )
        val markers = K75PModel.build(payload, emptyMap())
        assertEquals(1, markers.size)
        val m = markers.first()
        assertEquals("TEST1", m.id)
        assertEquals("600 秒應為 10 分", 10, m.mins)
        assertTrue("有 GPS 座標應標記 gps=true", m.gps)
        assertEquals("下一站應為天瑞", "天瑞", m.nextName)
    }

    @Test
    fun build_ignoresInvalidSec() {
        val payload = JSONObject().put(
            "busStop",
            JSONArray().put(
                JSONObject().put("busStopId", "K75P-D010").put(
                    "bus",
                    JSONArray().put(JSONObject().put("busId", "X").put("arrivalTimeInSecond", 108000)),
                ),
            ),
        )
        assertTrue(">=108000 秒（未營運）應被忽略", K75PModel.build(payload, emptyMap()).isEmpty())
    }

    /* ---------- 自適應斷點 ---------- */

    @Test
    fun adaptive_breakpoints() {
        assertEquals(1, AdaptiveInfo(SizeClass.Compact).listColumns)
        assertEquals(2, AdaptiveInfo(SizeClass.Medium).listColumns)
        assertEquals(3, AdaptiveInfo(SizeClass.Expanded).listColumns)
        assertTrue(AdaptiveInfo(SizeClass.Expanded).isExpanded)
        assertTrue(!AdaptiveInfo(SizeClass.Compact).isExpanded)
    }

    @Test
    fun adaptive_flexMode() {
        val flat = AdaptiveInfo(SizeClass.Compact, posture = FoldPosture.Flat, hingeTopPx = 100, hingeBottomPx = 140, density = 3f)
        assertTrue("非分隔姿態不應是半折", !flat.flexMode)
        val sep = AdaptiveInfo(SizeClass.Compact, posture = FoldPosture.Separating, hingeTopPx = 900, hingeBottomPx = 1000, density = 3f)
        assertTrue("分隔姿態 + 鉸鏈高度 → 半折", sep.flexMode)
        assertEquals(33, sep.hingeHeightDp)
    }

    /* ---------- 靜態資料 ---------- */

    @Test
    fun staticData_loaded() {
        assertEquals("K75P 應有 23 站", 23, StaticData.k75pStops.size)
        assertEquals("應有 23 站座標", 23, StaticData.k75pCoords.size)
        assertTrue("港鐵各線應已載入", StaticData.mtrLineStops.isNotEmpty())
        assertTrue("輕鐵站應已載入", StaticData.lrtStations.isNotEmpty())
        assertTrue("壽司郎快照應已載入", StaticData.sushiro.isNotEmpty())
    }
}
