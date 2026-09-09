package hk.senyou.travel.data

import org.json.JSONObject
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

/** 交通數據 API 層（對應 Web 版 js/api.js，原生直連無需 CORS 代理） */
object Api {
    const val KMB = "https://data.etabus.gov.hk/v1/transport/kmb"
    const val CTB = "https://rt.data.gov.hk/v2/transport/citybus"
    const val NLB = "https://rt.data.gov.hk/v2/transport/nlb"
    const val MTR = "https://rt.data.gov.hk/v1/transport/mtr"
    const val LRT = "https://rt.data.gov.hk/v1/transport/mtr/lrt"
    const val MTR_BUS = "https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule"

    /* ---------------- 時間 ---------------- */
    private val FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX")
    private val FMT_SPACE = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

    /** 解析時間：支援 KMB ISO(+08:00) 與港鐵 "yyyy-MM-dd HH:mm:ss" 兩種格式 */
    fun parseIso(s: String?): Long? {
        if (s.isNullOrBlank()) return null
        val t = s.trim()
        return runCatching { OffsetDateTime.parse(t, FMT).toInstant().toEpochMilli() }.getOrNull()
            ?: runCatching { OffsetDateTime.parse(t).toInstant().toEpochMilli() }.getOrNull()
            ?: runCatching {
                java.time.LocalDateTime.parse(t, FMT_SPACE)
                    .atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
            }.getOrNull()
    }

    /** 距離現在的分鐘數（向上取整）；已過期回傳 null（與 Web 版一致：sec ≤ 0 → 無資料） */
    fun minsUntil(iso: String?): Int? = parseIso(iso)?.let {
        val sec = (it - System.currentTimeMillis()) / 1000.0
        if (sec <= 0) null else kotlin.math.ceil(sec / 60.0).toInt()
    }

    /** ETA 文案（與 Web 版一致）：null → —；0（不足 1 分鐘）→ 即將；否則 n 分 */
    fun etaText(mins: Int?): String = when {
        mins == null -> "—"
        mins <= 0 -> "即將"
        else -> "$mins 分"
    }

    /* ---------------- KMB ---------------- */
    private var kmbRouteCache: List<JSONObject>? = null
    private var kmbStopCache: List<JSONObject>? = null
    private val kmbNameCache = mutableMapOf<String, String>()

    private suspend fun kmbAllRoutes(): List<JSONObject> {
        kmbRouteCache?.let { return it }
        val o = Http.getJson("$KMB/route/") ?: return emptyList()
        val arr = o.optJSONArray("data") ?: return emptyList()
        val list = (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
        if (list.isNotEmpty()) kmbRouteCache = list
        return list
    }

    suspend fun kmbRoutes(q: String): List<JSONObject> =
        kmbAllRoutes().filter { it.optString("route").equals(q, ignoreCase = true) }

    suspend fun kmbStops(route: String, dir: String, serviceType: String = "1"): List<JSONObject> {
        val o = Http.getJson("$KMB/route-stop/$route/$dir/$serviceType") ?: return emptyList()
        val arr = o.optJSONArray("data") ?: return emptyList()
        return (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
    }

    suspend fun kmbEta(stopId: String): List<JSONObject> {
        val o = Http.getJson("$KMB/stop-eta/$stopId") ?: return emptyList()
        val arr = o.optJSONArray("data") ?: return emptyList()
        return (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
    }

    /** route-stop 只回站碼，站名需另取 /stop/{id}（帶快取） */
    suspend fun kmbStopName(stopId: String): String {
        kmbNameCache[stopId]?.let { return it }
        val o = Http.getJson("$KMB/stop/$stopId")
        val d = o?.optJSONObject("data")
        val name = d?.optString("name_tc")?.takeIf { it.isNotBlank() }
            ?: d?.optString("name_en")?.takeIf { it.isNotBlank() }
            ?: "站 $stopId"
        kmbNameCache[stopId] = name
        return name
    }

    suspend fun kmbAllStops(): List<JSONObject> {
        kmbStopCache?.let { return it }
        val o = Http.getJson("$KMB/stop/") ?: return emptyList()
        val arr = o.optJSONArray("data") ?: return emptyList()
        val list = (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
        if (list.isNotEmpty()) kmbStopCache = list
        return list
    }

    suspend fun kmbStopsByName(q: String): List<JSONObject> {
        val all = kmbAllStops()
        if (all.isEmpty()) return emptyList()
        val upper = q.uppercase()
        return all.filter { s ->
            val hay = (s.optString("name_tc") + "|" + s.optString("name_en") + "|" + s.optString("name_sc")).uppercase()
            hay.contains(upper)
        }.take(50)
    }

    /* ---------------- 城巴 CTB ---------------- */
    private var ctbRouteCache: List<JSONObject>? = null
    private val ctbNameCache = mutableMapOf<String, String>()

    private suspend fun ctbAllRoutes(): List<JSONObject> {
        ctbRouteCache?.let { return it }
        val o = Http.getJson("$CTB/route/ctb") ?: return emptyList()
        val arr = o.optJSONArray("data") ?: return emptyList()
        val list = (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
        if (list.isNotEmpty()) ctbRouteCache = list
        return list
    }

    suspend fun ctbRoutes(q: String): List<JSONObject> =
        ctbAllRoutes().filter { it.optString("route").equals(q, ignoreCase = true) }

    suspend fun ctbStops(route: String, dir: String): List<JSONObject> {
        val o = Http.getJson("$CTB/route-stop/ctb/$route/$dir") ?: return emptyList()
        val arr = o.optJSONArray("data") ?: return emptyList()
        return (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
    }

    suspend fun ctbEta(stopId: String, route: String): List<JSONObject> {
        val o = Http.getJson("$CTB/eta/ctb/$stopId/$route") ?: return emptyList()
        val arr = o.optJSONArray("data") ?: return emptyList()
        return (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
    }

    suspend fun ctbStopName(stopId: String): String {
        ctbNameCache[stopId]?.let { return it }
        val d = Http.getJson("$CTB/stop/$stopId")?.optJSONObject("data")
        val name = d?.optString("name_tc")?.takeIf { it.isNotBlank() }
            ?: d?.optString("name_en")?.takeIf { it.isNotBlank() }
            ?: "站 $stopId"
        ctbNameCache[stopId] = name
        return name
    }

    /* ---------------- 嶼巴 NLB ---------------- */
    private var nlbRouteCache: List<JSONObject>? = null

    suspend fun nlbRoutes(q: String): List<JSONObject> {
        val list = nlbRouteCache ?: run {
            val o = Http.getJson("$NLB/route.php?action=list") ?: return emptyList()
            val arr = o.optJSONArray("routes") ?: return emptyList()
            (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }.also { if (it.isNotEmpty()) nlbRouteCache = it }
        }
        return list.filter { it.optString("routeNo").equals(q, ignoreCase = true) }
    }

    suspend fun nlbStops(routeId: String): List<JSONObject> {
        val o = Http.getJson("$NLB/stop.php?action=list&routeId=$routeId") ?: return emptyList()
        val arr = o.optJSONArray("stops") ?: return emptyList()
        return (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
    }

    suspend fun nlbEtaMins(routeId: String, stopId: String): Int? {
        val o = Http.getJson("$NLB/stop.php?action=estimatedArrivals&routeId=$routeId&stopId=$stopId&language=zh") ?: return null
        val arr = o.optJSONArray("estimatedArrivals") ?: return null
        var best: Int? = null
        for (i in 0 until arr.length()) {
            val e = arr.optJSONObject(i) ?: continue
            if (e.optBoolean("departed")) continue
            val m = minsUntil(e.optString("estimatedArrivalTime")) ?: continue
            if (best == null || m < best) best = m
        }
        return best
    }

    /* ---------------- 港鐵 ---------------- */
    suspend fun mtrSchedule(line: String, station: String): JSONObject? =
        Http.getJson("$MTR/getSchedule.php?line=$line&sta=$station")?.optJSONObject("data")

    /** 港鐵巴士：POST 取班次 */
    suspend fun mtrBusSchedule(routeName: String): JSONObject? =
        Http.postJson(MTR_BUS, JSONObject().put("language", "zh").put("routeName", routeName))

    /* ---------------- 輕鐵 ---------------- */
    data class LrtEta(val platformId: String, val routeNo: String, val dest: String, val mins: Int, val departing: Boolean)

    suspend fun lrtEta(stationId: Int): List<LrtEta> {
        val o = Http.getJson("$LRT/getSchedule?station_id=$stationId&with_special=1") ?: return emptyList()
        val platforms = o.optJSONArray("platform_list") ?: return emptyList()
        val out = mutableListOf<LrtEta>()
        for (i in 0 until platforms.length()) {
            val p = platforms.optJSONObject(i) ?: continue
            val routes = p.optJSONArray("route_list") ?: continue
            for (j in 0 until routes.length()) {
                val r = routes.optJSONObject(j) ?: continue
                val special = r.optInt("special", 0) == 1
                val routeNo = if (special) r.optString("additionalInfo1", "?") else r.optString("route_no", "?")
                val tc = r.optString("time_ch", "").trim()
                val mins = Regex("(\\d+)\\s*分鐘").find(tc)?.groupValues?.get(1)?.toIntOrNull()
                    ?: if (tc.contains("即將抵達") || tc.contains("正在離開") || tc == "-") 0 else null
                    ?: Regex("(\\d+)\\s*mins?").find(r.optString("time_en", ""))?.groupValues?.get(1)?.toIntOrNull()
                    ?: 0
                out.add(LrtEta(p.optString("platform_id"), routeNo, r.optString("dest_ch", r.optString("dest_en")), mins, r.optString("arrival_departure") == "D"))
            }
        }
        return out.sortedBy { it.mins }
    }

    /* ---------------- 語義色分級（與 Web 版一致） ---------------- */
    fun etaTier(sec: Int?): Int = when {
        sec == null -> -1
        sec <= 120 -> 2   // 紅
        sec <= 600 -> 1   // 橙
        else -> 0         // 綠
    }

    /** 兩點距離（米，Haversine） */
    fun haversine(a: LatLng, b: LatLng): Double {
        val r = 6371000.0
        val dLat = Math.toRadians(b.lat - a.lat)
        val dLng = Math.toRadians(b.lng - a.lng)
        val s = kotlin.math.sin(dLat / 2).let { it * it } +
            kotlin.math.cos(Math.toRadians(a.lat)) * kotlin.math.cos(Math.toRadians(b.lat)) *
            kotlin.math.sin(dLng / 2).let { it * it }
        return 2 * r * kotlin.math.asin(kotlin.math.sqrt(s))
    }
}
