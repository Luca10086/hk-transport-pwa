package hk.senyou.travel.data

import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import org.json.JSONObject

enum class Kind { KMB, CTB, NLB, BUSSTOP, MTR, LRT, MTRBUS }

data class SearchItem(
    val kind: Kind,
    val no: String,
    val name: String,
    val cap: String = "",
    val route: String? = null,
    val dir: String? = null,
    val stopId: String? = null,
    val stationCode: String? = null,
    val stationName: String? = null,
    val routeId: String? = null,
    val group: String = "",
    val etaMins: Int? = null,
)

data class StopRow(val seq: Int, val name: String, val stopId: String, val mins: Int?)

/** 搜索 + ETA 補全（對應 Web 版 doSearch / renderSearch） */
object SearchRepo {

    suspend fun search(qRaw: String, mode: String): List<SearchItem> {
        val q = qRaw.trim()
        if (q.isEmpty()) return emptyList()
        return when (mode) {
            "mtrbus" -> mtrBus(q)
            "mtr" -> mtr(q)
            "lrt" -> lrt(q)
            else -> bus(q)
        }
    }

    /* ---------------- 公交（九巴 + 城巴 + 嶼巴） ---------------- */
    private suspend fun bus(q: String): List<SearchItem> = coroutineScope {
        val out = mutableListOf<SearchItem>()
        val upper = q.uppercase()

        // 九巴：一個路線號只出一張卡（優先 service_type=1 + 去程）
        val kmb = Api.kmbRoutes(upper)
            .sortedWith(compareBy({ if (it.optString("service_type", "1") == "1") 0 else 1 }, { if (it.optString("bound") == "O") 0 else 1 }))
        val seen = mutableSetOf<String>()
        for (r in kmb) {
            val key = r.optString("route").uppercase()
            if (!seen.add(key)) continue
            val dir = if (r.optString("bound") == "I") "inbound" else "outbound"
            out += SearchItem(
                kind = Kind.KMB, no = r.optString("route"),
                name = r.optString("orig_tc") + " → " + r.optString("dest_tc"),
                cap = "九巴 · " + if (dir == "inbound") "回程" else "去程",
                route = r.optString("route"), dir = dir, group = "九巴 KMB",
            )
            if (out.count { it.kind == Kind.KMB } >= 6) break
        }

        // 站名搜索（非純路線號時）
        if (q.any { !it.isLetterOrDigit() } || q.length >= 2) {
            val stops = Api.kmbStopsByName(q).take(6)
            stops.forEach { s ->
                val nm = s.optString("name_tc").ifBlank { s.optString("name_en") }
                out += SearchItem(
                    kind = Kind.BUSSTOP, no = "站", name = nm,
                    cap = "九巴站牌", stopId = s.optString("stop"), group = "巴士站",
                )
            }
        }

        // 城巴
        Api.ctbRoutes(upper).take(4).forEach { r ->
            out += SearchItem(
                kind = Kind.CTB, no = r.optString("route"),
                name = r.optString("orig_tc") + " → " + r.optString("dest_tc"),
                cap = "城巴", route = r.optString("route"), dir = "outbound", group = "城巴 CTB",
            )
        }

        // 嶼巴
        Api.nlbRoutes(upper).take(4).forEach { r ->
            val nm = r.optString("routeName_c").replace(" > ", " → ")
            out += SearchItem(
                kind = Kind.NLB, no = r.optString("routeNo"),
                name = nm, cap = "嶼巴",
                routeId = r.optString("routeId"), route = r.optString("routeId"), group = "嶼巴 NLB",
            )
        }
        out
    }

    private fun mtrBus(q: String): List<SearchItem> =
        StaticData.mtrBusRoutes.entries
            .filter { it.key.contains(q, ignoreCase = true) }
            .take(8)
            .map { (no, info) ->
                SearchItem(
                    kind = Kind.MTRBUS, no = no,
                    name = info["orig"] + " → " + info["dest"],
                    cap = "港鐵巴士", route = no, group = "港鐵巴士",
                )
            }

    private fun mtr(q: String): List<SearchItem> {
        val upper = q.uppercase()
        val out = mutableListOf<SearchItem>()
        val seen = mutableSetOf<String>()
        for ((_, stations) in StaticData.mtrLineStops) {
            for (st in stations) {
                if (!(st.name.contains(q) || q.contains(st.name) || st.code == upper)) continue
                if (!seen.add(st.code)) continue
                val lines = StaticData.mtrLinesOf(st.code).mapNotNull { StaticData.mtrLines[it] }
                out += SearchItem(
                    kind = Kind.MTR, no = "MTR", name = st.name,
                    cap = lines.joinToString(" · ") + " 線",
                    stationCode = st.code, stationName = st.name, group = "港鐵車站",
                )
            }
        }
        return out.take(10)
    }

    private fun lrt(q: String): List<SearchItem> =
        StaticData.lrtStations.entries
            .filter { it.value.contains(q) }
            .take(8)
            .map { (id, name) ->
                SearchItem(
                    kind = Kind.LRT, no = "輕鐵", name = name,
                    cap = "輕鐵站 · 編號 $id",
                    stationCode = id.toString(), stationName = name, group = "輕鐵車站",
                )
            }

    /* ---------------- ETA 補全（並發，分塊限流） ---------------- */
    suspend fun fillEtas(items: List<SearchItem>): List<SearchItem> = coroutineScope {
        items.chunked(6).fold(emptyList<SearchItem>()) { acc, chunk ->
            val done = chunk.map { item ->
                async { item.copy(etaMins = etaFor(item), cap = item.cap.ifBlank { capFor(item) }) }
            }.awaitAll()
            acc + done
        }
    }

    private suspend fun etaFor(it: SearchItem): Int? = when (it.kind) {
        Kind.KMB -> {
            val dir = it.dir ?: "outbound"
            val stops = Api.kmbStops(it.route!!, dir)
            val sid = it.stopId ?: stops.firstOrNull()?.optString("stop")
            if (sid == null) null else {
                val want = if (dir == "inbound") "I" else "O"
                Api.kmbEta(sid)
                    .filter { e -> e.optString("route") == it.route && e.optString("dir").uppercase() == want }
                    .mapNotNull { e -> Api.minsUntil(e.optString("eta")) }
                    .minOrNull()
            }
        }
        Kind.CTB -> {
            val stops = Api.ctbStops(it.route!!, it.dir ?: "outbound").take(6)
            var best: Int? = null
            for (s in stops) {
                val sid = s.optString("stop").ifBlank { s.optString("stop_id") }
                val mins = Api.ctbEta(sid, it.route)
                    .filter { e -> e.optString("dir").uppercase() == "O" }
                    .mapNotNull { e -> Api.minsUntil(e.optString("eta")) }
                    .minOrNull()
                if (mins != null) { best = mins; break }
            }
            best
        }
        Kind.NLB -> {
            val rid = it.routeId ?: return null
            val stops = Api.nlbStops(rid)
            val first = stops.firstOrNull()?.optString("stopId") ?: return null
            Api.nlbEtaMins(rid, first)
        }
        Kind.MTRBUS -> {
            val d = Api.mtrBusSchedule(it.route!!) ?: return null
            val arr = d.optJSONArray("busStop") ?: return null
            var best: Int? = null
            for (i in 0 until arr.length()) {
                val stop = arr.optJSONObject(i) ?: continue
                val buses = stop.optJSONArray("bus") ?: continue
                for (j in 0 until buses.length()) {
                    val sec = buses.optJSONObject(j)?.optInt("arrivalTimeInSecond", 0) ?: 0
                    if (sec in 1 until 108000) {
                        val m = (sec + 59) / 60
                        if (best == null || m < best) best = m
                    }
                }
            }
            best
        }
        Kind.MTR -> {
            val code = it.stationCode ?: return null
            var best: Int? = null
            for (line in StaticData.mtrLinesOf(code)) {
                val d = Api.mtrSchedule(line, code) ?: continue
                val dd = d.optJSONObject("$line-$code") ?: continue
                for (dirKey in listOf("UP", "DOWN")) {
                    val arr = dd.optJSONArray(dirKey) ?: continue
                    for (i in 0 until arr.length()) {
                        val t = arr.optJSONObject(i)?.optString("time") ?: continue
                        val mins = Api.minsUntil(t)
                        if (mins != null && (best == null || mins < best)) best = mins
                    }
                }
            }
            best
        }
        Kind.LRT -> {
            val id = it.stationCode?.toIntOrNull() ?: return null
            Api.lrtEta(id).firstOrNull()?.mins
        }
        Kind.BUSSTOP -> null
    }

    private suspend fun capFor(it: SearchItem): String = when (it.kind) {
        Kind.BUSSTOP -> {
            val sid = it.stopId ?: return ""
            val byRoute = mutableMapOf<String, Int>()
            Api.kmbEta(sid).forEach { e ->
                val m = Api.minsUntil(e.optString("eta")) ?: return@forEach
                val r = e.optString("route")
                if (byRoute[r] == null || m < byRoute.getValue(r)) byRoute[r] = m
            }
            byRoute.entries.sortedBy { it.value }.take(3)
                .joinToString(" · ") { (r, m) -> "$r " + if (m <= 1) "即將" else "$m 分" }
        }
        Kind.MTRBUS -> "港鐵巴士"
        else -> it.cap
    }

    /* ---------------- 收藏 ETA ---------------- */
    suspend fun favEta(f: Fav): Int? = when (f.type) {
        "bus" -> if (f.company == "ctb") {
            val sid = f.stopId ?: Api.ctbStops(f.route, f.dir).firstOrNull()?.optString("stop")
            if (sid == null) null else Api.ctbEta(sid, f.route)
                .filter { it.optString("dir").uppercase() == (if (f.dir == "inbound") "I" else "O") }
                .mapNotNull { Api.minsUntil(it.optString("eta")) }.minOrNull()
        } else if (f.company == "nlb") {
            val rid = f.routeId ?: f.route
            val sid = f.stopId ?: Api.nlbStops(rid).firstOrNull()?.optString("stopId")
            if (sid == null) null else Api.nlbEtaMins(rid, sid)
        } else {
            val sid = f.stopId ?: Api.kmbStops(f.route, f.dir).firstOrNull()?.optString("stop")
            if (sid == null) null else Api.kmbEta(sid)
                .filter { it.optString("route") == f.route && it.optString("dir").uppercase() == (if (f.dir == "inbound") "I" else "O") }
                .mapNotNull { Api.minsUntil(it.optString("eta")) }.minOrNull()
        }
        "mtr" -> {
            val code = f.stationCode ?: return null
            var best: Int? = null
            for (line in StaticData.mtrLinesOf(code)) {
                val d = Api.mtrSchedule(line, code) ?: continue
                val dd = d.optJSONObject("$line-$code") ?: continue
                for (k in listOf("UP", "DOWN")) {
                    val arr = dd.optJSONArray(k) ?: continue
                    for (i in 0 until arr.length()) {
                        val m = Api.minsUntil(arr.optJSONObject(i)?.optString("time")) ?: continue
                        if (best == null || m < best) best = m
                    }
                }
            }
            best
        }
        "lrt" -> f.stationCode?.toIntOrNull()?.let { Api.lrtEta(it).firstOrNull()?.mins }
        "mtrbus" -> {
            val d = Api.mtrBusSchedule(f.route) ?: return null
            val arr = d.optJSONArray("busStop") ?: return null
            var best: Int? = null
            for (i in 0 until arr.length()) {
                val buses = arr.optJSONObject(i)?.optJSONArray("bus") ?: continue
                for (j in 0 until buses.length()) {
                    val sec = buses.optJSONObject(j)?.optInt("arrivalTimeInSecond", 0) ?: 0
                    if (sec in 1 until 108000) {
                        val m = (sec + 59) / 60
                        if (best == null || m < best) best = m
                    }
                }
            }
            best
        }
        else -> null
    }

    fun favMeta(f: Fav): String = when (f.type) {
        "bus" -> when (f.company) {
            "ctb" -> "城巴 ${f.route}"
            "nlb" -> "嶼巴 ${f.route}"
            else -> "九巴 ${f.route}"
        }
        "mtr" -> {
            val n = f.lineName.ifBlank { f.line ?: "港鐵" }
            if (n.endsWith("綫") || n.endsWith("線")) n else "$n 綫"
        }
        "lrt" -> f.stopName.ifBlank { "輕鐵站" }
        "mtrbus" -> "港鐵巴士 ${f.route}"
        else -> "收藏"
    }

    fun favGroup(f: Fav): String = when (f.type) {
        "bus" -> f.company
        "mtrbus" -> "mtrbus"
        "mtr" -> "mtr"
        "lrt" -> "lrt"
        else -> "other"
    }

    fun favToSearchItem(f: Fav): SearchItem = when (f.type) {
        "bus" -> SearchItem(
            kind = if (f.company == "ctb") Kind.CTB else if (f.company == "nlb") Kind.NLB else Kind.KMB,
            no = f.route, name = f.stopName.ifBlank { f.route }, cap = favMeta(f),
            route = f.route, dir = f.dir, stopId = f.stopId, routeId = f.routeId,
        )
        "mtrbus" -> SearchItem(kind = Kind.MTRBUS, no = f.route, name = f.stopName.ifBlank { f.route }, cap = "港鐵巴士", route = f.route)
        "mtr" -> SearchItem(kind = Kind.MTR, no = "MTR", name = f.stationName, cap = favMeta(f), stationCode = f.stationCode, stationName = f.stationName)
        "lrt" -> SearchItem(kind = Kind.LRT, no = "輕鐵", name = f.stopName, cap = favMeta(f), stationCode = f.stationCode, stationName = f.stationName)
        else -> SearchItem(kind = Kind.KMB, no = f.route, name = f.stopName)
    }

    /* ---------------- 路線詳情（站表 + 各站 ETA） ---------------- */
    suspend fun routeStops(route: String, company: Kind, dir: String, routeId: String? = null): List<StopRow> = coroutineScope {
        when (company) {
            Kind.KMB -> {
                val stops = Api.kmbStops(route, dir)
                val want = if (dir == "inbound") "I" else "O"
                stops.mapIndexed { i, s ->
                    async {
                        val sid = s.optString("stop")
                        val name = Api.kmbStopName(sid)
                        val mins = Api.kmbEta(sid)
                            .filter { e -> e.optString("route") == route && e.optString("dir").uppercase() == want }
                            .mapNotNull { e -> Api.minsUntil(e.optString("eta")) }
                            .minOrNull()
                        StopRow(i + 1, name, sid, mins)
                    }
                }.chunked(6).flatMap { it.awaitAll() }
            }
            Kind.CTB -> {
                val stops = Api.ctbStops(route, dir)
                val want = if (dir == "inbound") "I" else "O"
                stops.mapIndexed { i, s ->
                    async {
                        val sid = s.optString("stop").ifBlank { s.optString("stop_id") }
                        val name = s.optString("name_tc").ifBlank { Api.ctbStopName(sid) }
                        val mins = Api.ctbEta(sid, route)
                            .filter { e -> e.optString("dir").uppercase() == want }
                            .mapNotNull { e -> Api.minsUntil(e.optString("eta")) }
                            .minOrNull()
                        StopRow(i + 1, name, sid, mins)
                    }
                }.chunked(6).flatMap { it.awaitAll() }
            }
            Kind.NLB -> {
                val stops = Api.nlbStops(routeId ?: route)
                stops.mapIndexed { i, s ->
                    async {
                        val sid = s.optString("stopId")
                        StopRow(i + 1, s.optString("stopName_c").ifBlank { s.optString("stopName_s") }, sid, Api.nlbEtaMins(routeId ?: route, sid))
                    }
                }.chunked(6).flatMap { it.awaitAll() }
            }
            else -> emptyList()
        }
    }
}
