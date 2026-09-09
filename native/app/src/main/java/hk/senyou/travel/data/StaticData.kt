package hk.senyou.travel.data

import android.content.Context
import org.json.JSONObject

data class MtrStation(val code: String, val name: String)
data class K75PStop(val id: String, val name: String)
data class LatLng(val lat: Double, val lng: Double)
data class SushiroStore(val name: String, val area: String, val waiting: Int, val status: String)

/** 靜態資料（由 tools/export-static-data.mjs 從 Web 版 data.js/api.js 導出為 assets/static.json） */
object StaticData {
    private var loaded = false

    var mtrLines: Map<String, String> = emptyMap(); private set
    var mtrLineStops: Map<String, List<MtrStation>> = emptyMap(); private set
    var mtrStationNames: Map<String, String> = emptyMap(); private set
    var mtrBusRoutes: Map<String, Map<String, String>> = emptyMap(); private set
    var lrtStations: Map<Int, String> = emptyMap(); private set
    var k75pStops: List<K75PStop> = emptyList(); private set
    var k75pCoords: Map<String, LatLng> = emptyMap(); private set
    var sushiro: List<SushiroStore> = emptyList(); private set
    var sushiroAt: String = ""; private set
    var hkoIcons: Map<String, String> = emptyMap(); private set
    var hkoEmoji: Map<String, String> = emptyMap(); private set

    @Synchronized
    fun load(ctx: Context) {
        if (loaded) return
        loaded = true
        val text = runCatching {
            ctx.assets.open("static.json").bufferedReader().use { it.readText() }
        }.getOrNull() ?: return
        val o = runCatching { JSONObject(text) }.getOrNull() ?: return

        mtrLines = o.optJSONObject("mtrLines").toStringMap()
        mtrStationNames = o.optJSONObject("mtrStationNames").toStringMap()
        hkoIcons = o.optJSONObject("hkoIcons").toStringMap()
        hkoEmoji = o.optJSONObject("hkoIconEmoji").toStringMap()
        sushiroAt = o.optString("sushiroSnapshotAt", "")

        // 港鐵各線車站
        val ls = mutableMapOf<String, List<MtrStation>>()
        o.optJSONObject("mtrLineStops")?.let { lines ->
            for (lc in lines.keys()) {
                val arr = lines.optJSONArray(lc) ?: continue
                ls[lc] = (0 until arr.length()).mapNotNull { i ->
                    val s = arr.optJSONObject(i) ?: return@mapNotNull null
                    MtrStation(s.optString("code"), s.optString("name"))
                }
            }
        }
        mtrLineStops = ls

        // 港鐵巴士路線
        val mb = mutableMapOf<String, Map<String, String>>()
        o.optJSONObject("mtrBusRoutes")?.let { j ->
            for (k in j.keys()) {
                val r = j.optJSONObject(k) ?: continue
                mb[k] = mapOf("orig" to r.optString("orig"), "dest" to r.optString("dest"))
            }
        }
        mtrBusRoutes = mb

        // 輕鐵站
        val lrt = mutableMapOf<Int, String>()
        o.optJSONObject("lrtStations")?.let { j ->
            for (k in j.keys()) k.toIntOrNull()?.let { id -> lrt[id] = j.optString(k) }
        }
        lrtStations = lrt

        // K75P 站表 + 座標
        val stops = mutableListOf<K75PStop>()
        o.optJSONArray("k75pStops")?.let { arr ->
            for (i in 0 until arr.length()) {
                val s = arr.optJSONObject(i) ?: continue
                stops.add(K75PStop(s.optString("id"), s.optString("name")))
            }
        }
        k75pStops = stops
        val coords = mutableMapOf<String, LatLng>()
        o.optJSONObject("k75pStopCoords")?.let { j ->
            for (k in j.keys()) {
                val c = j.optJSONObject(k) ?: continue
                coords[k] = LatLng(c.optDouble("lat"), c.optDouble("lng"))
            }
        }
        k75pCoords = coords

        // 壽司郎快照
        val stores = mutableListOf<SushiroStore>()
        o.optJSONArray("sushiroSnapshot")?.let { arr ->
            for (i in 0 until arr.length()) {
                val s = arr.optJSONObject(i) ?: continue
                stores.add(
                    SushiroStore(
                        name = s.optString("name"),
                        area = s.optString("area"),
                        waiting = s.optInt("waitingGroup", s.optInt("wait", 0)),
                        status = s.optString("storeStatus"),
                    )
                )
            }
        }
        sushiro = stores
    }

    fun mtrLinesOf(stationCode: String): List<String> =
        mtrLineStops.filterValues { list -> list.any { it.code == stationCode } }.keys.toList()

    /** 車站代碼 → 中文站名（港鐵班次的 dest 為代碼，顯示時需轉名） */
    val stationNames: Map<String, String> by lazy {
        mtrLineStops.values.flatten().associate { it.code to it.name }
    }

    private fun JSONObject?.toStringMap(): Map<String, String> {
        if (this == null) return emptyMap()
        val m = mutableMapOf<String, String>()
        for (k in keys()) m[k] = optString(k)
        return m
    }
}
