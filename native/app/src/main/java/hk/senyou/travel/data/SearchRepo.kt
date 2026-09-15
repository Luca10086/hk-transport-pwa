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

/** 車站即時班次（港鐵 / 輕鐵收藏與通知深鏈用） */
data class TrainRow(val dirLabel: String, val dest: String, val plat: String, val mins: Int?)

/** 搜索 + ETA 補全（對應 Web 版 doSearch / renderSearch） */
object SearchRepo {

    /**
     * 搜尋入口。mode：bus（預設）/ mtrbus / mtr / lrt / overnight（通宵）。
     * 查詢一律以「原文 + 繁體 + 簡體」三種寫法比對（沿用 Web 版 qList 做法），
     * 因此簡體輸入也能找到繁體站名。
     */
    suspend fun search(qRaw: String, mode: String): List<SearchItem> {
        val q = qRaw.trim()
        if (q.isEmpty()) return emptyList()
        val qs = queryVariants(q)
        val upper = q.uppercase()

        // 港鐵／輕鐵路線搜尋（荃灣綫 / TWL / 輕鐵）優先於車站與路線號搜尋
        if (mode != "mtrbus") lineSearch(qs)?.let { return it }

        val night = mode == "overnight" || upper.startsWith("N")
        return when (mode) {
            "mtrbus" -> mtrBus(qs)
            "mtr" -> mtr(qs, upper)
            "lrt" -> lrt(qs)
            else -> bus(qs, night)
        }
    }

    /** 原文 + 簡繁轉換結果（去重）；供各分支同時比對 */
    private fun queryVariants(q: String): List<String> =
        listOf(q, TradSimp.toTrad(q), TradSimp.toSimp(q)).distinct()

    /** 通宵路線（路線號 N 字頭，對應 Web 版 renderResults 的 /^N\d/i 過濾） */
    fun isOvernightRoute(no: String): Boolean = no.trim().uppercase().startsWith("N")

    /**
     * 路線名（荃灣綫 / 荃灣線）或 3 字母線路代碼（TWL）→ 該線全部車站；
     * 「輕鐵」/ LRT → 輕鐵全網車站。非路線查詢回傳 null（交回一般搜尋）。
     */
    private fun lineSearch(qs: List<String>): List<SearchItem>? {
        // 異體字正規化：靜態站表用「線」，使用者常打「綫」
        val keys = qs.map { it.replace('綫', '線').uppercase() }.distinct()
        val code = StaticData.mtrLines.keys.firstOrNull { it in keys }
            ?: StaticData.mtrLines.entries.firstOrNull { it.value.replace('綫', '線').uppercase() in keys }?.key
        if (code != null) {
            val stations = StaticData.mtrLineStops[code] ?: return emptyList()   // 站表缺失：略過不崩
            val cap = "全線 ${stations.size} 站候車"
            return stations.map { st ->
                SearchItem(
                    kind = Kind.MTR, no = "MTR", name = st.name, cap = cap,
                    stationCode = st.code, stationName = st.name, group = "港鐵",
                )
            }
        }
        if (keys.any { it == "輕鐵" || it == "LRT" }) {
            val lrt = StaticData.lrtStations.entries.sortedBy { it.key }
            if (lrt.isEmpty()) return emptyList()
            val cap = "全線 ${lrt.size} 站候車"
            return lrt.map { (id, name) ->
                SearchItem(
                    kind = Kind.LRT, no = "輕鐵", name = name, cap = cap,
                    stationCode = id.toString(), stationName = name, group = "輕鐵",
                )
            }
        }
        return null
    }

    /* ---------------- 公交（九巴 + 城巴 + 嶼巴） ---------------- */
    private suspend fun bus(qs: List<String>, night: Boolean = false): List<SearchItem> = coroutineScope {
        val out = mutableListOf<SearchItem>()
        val seen = mutableSetOf<String>()
        // 通宵：查 N… 之餘，輸入 969 亦一併查 N969（只保留 N 字頭路線）
        val probes = if (night && qs.none { it.uppercase().startsWith("N") }) qs + qs.map { "N$it" } else qs

        for (probe in probes.map { it.uppercase() }.distinct()) {
            // 九巴：一個路線號只出一張卡（優先 service_type=1 + 去程）
            val kmb = Api.kmbRoutes(probe)
                .sortedWith(compareBy({ if (it.optString("service_type", "1") == "1") 0 else 1 }, { if (it.optString("bound") == "O") 0 else 1 }))
            for (r in kmb) {
                if (out.count { it.kind == Kind.KMB } >= 6) break
                if (!seen.add("KMB|" + r.optString("route").uppercase())) continue
                val dir = if (r.optString("bound") == "I") "inbound" else "outbound"
                out += SearchItem(
                    kind = Kind.KMB, no = r.optString("route"),
                    name = r.optString("orig_tc") + " → " + r.optString("dest_tc"),
                    cap = "九巴 · " + if (dir == "inbound") "回程" else "去程",
                    route = r.optString("route"), dir = dir, group = "九巴",
                )
            }

            // 城巴
            Api.ctbRoutes(probe).take(4).forEach { r ->
                if (out.count { it.kind == Kind.CTB } < 4 && seen.add("CTB|" + r.optString("route").uppercase())) {
                    out += SearchItem(
                        kind = Kind.CTB, no = r.optString("route"),
                        name = r.optString("orig_tc") + " → " + r.optString("dest_tc"),
                        cap = "城巴", route = r.optString("route"), dir = "outbound", group = "城巴",
                    )
                }
            }

            // 嶼巴
            Api.nlbRoutes(probe).take(4).forEach { r ->
                if (out.count { it.kind == Kind.NLB } < 4 && seen.add("NLB|" + r.optString("routeNo").uppercase())) {
                    out += SearchItem(
                        kind = Kind.NLB, no = r.optString("routeNo"),
                        name = r.optString("routeName_c").replace(" > ", " → "), cap = "嶼巴",
                        routeId = r.optString("routeId"), route = r.optString("routeId"), group = "嶼巴",
                    )
                }
            }
        }

        // 站名搜索：只在含中日韓字元或非英數輸入時啟用（純路線號不必下載全量站牌）
        val text = qs.first()
        if (!night && (text.any { it.code >= 0x2E80 } || text.none { it.isLetterOrDigit() })) {
            val seenStop = mutableSetOf<String>()
            qs.flatMap { Api.kmbStopsByName(it) }
                .filter { it.optString("stop").isNotBlank() && seenStop.add(it.optString("stop")) }
                .take(6)
                .forEach { s ->
                    out += SearchItem(
                        kind = Kind.BUSSTOP, no = "站",
                        name = s.optString("name_tc").ifBlank { s.optString("name_en") },
                        // cap 留空：由 fillEtas 惰性補上「未來 3 班」摘要（不拖慢搜尋）
                        cap = "", stopId = s.optString("stop"), group = "巴士站",
                    )
                }
        }

        // 通宵模式：只保留 N 字頭路線
        if (night) out.filter { isOvernightRoute(it.no) } else out
    }

    private fun mtrBus(qs: List<String>): List<SearchItem> =
        StaticData.mtrBusRoutes.entries
            .filter { (no, _) -> qs.any { no.contains(it, ignoreCase = true) } }
            .take(8)
            .map { (no, info) ->
                SearchItem(
                    kind = Kind.MTRBUS, no = no,
                    name = info["orig"] + " → " + info["dest"],
                    cap = "港鐵巴士", route = no, group = "港鐵巴士",
                )
            }

    private fun mtr(qs: List<String>, upper: String): List<SearchItem> {
        val out = mutableListOf<SearchItem>()
        val seen = mutableSetOf<String>()
        for ((_, stations) in StaticData.mtrLineStops) {
            for (st in stations) {
                if (st.name.isBlank()) continue
                if (!(qs.any { st.name.contains(it) || it.contains(st.name) } || st.code == upper)) continue
                if (!seen.add(st.code)) continue
                val lines = StaticData.mtrLinesOf(st.code).mapNotNull { StaticData.mtrLines[it] }
                out += SearchItem(
                    kind = Kind.MTR, no = "MTR", name = st.name,
                    cap = lines.joinToString(" · "),   // 線名已含「線」字，勿再拼後綴
                    stationCode = st.code, stationName = st.name, group = "港鐵",
                )
            }
        }
        return out.take(10)
    }

    private fun lrt(qs: List<String>): List<SearchItem> =
        StaticData.lrtStations.entries
            .filter { (_, name) -> name.isNotBlank() && qs.any { name.contains(it) || it.contains(name) } }
            .sortedBy { it.key }
            .take(8)
            .map { (id, name) ->
                SearchItem(
                    kind = Kind.LRT, no = "輕鐵", name = name,
                    cap = "輕鐵站 · 編號 $id",
                    stationCode = id.toString(), stationName = name, group = "輕鐵",
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
            // 下次 3 班摘要（沿用 station 級 stop-eta，一次請求覆蓋全站路線）
            val sid = it.stopId ?: return "九巴站牌"
            val byRoute = mutableMapOf<String, Int>()
            Api.kmbEta(sid).forEach { e ->
                val m = Api.minsUntil(e.optString("eta")) ?: return@forEach
                val r = e.optString("route")
                if (byRoute[r] == null || m < byRoute.getValue(r)) byRoute[r] = m
            }
            byRoute.entries.sortedBy { it.value }.take(3)
                .joinToString(" · ") { (r, m) -> "$r " + if (m <= 1) "即將" else "$m 分" }
                .ifBlank { "九巴站牌" }
        }
        Kind.MTRBUS -> "港鐵巴士"
        else -> it.cap
    }

    /** 站牌（無路線號）各路線最近到站；供站牌收藏詳情頁列出各班次 */
    suspend fun stopArrivals(item: SearchItem): List<StopRow> {
        val sid = item.stopId?.takeIf { it.isNotBlank() } ?: return emptyList()
        val byRoute = linkedMapOf<String, Pair<String, Int>>()
        Api.kmbEta(sid).forEach { e ->
            val m = Api.minsUntil(e.optString("eta")) ?: return@forEach
            val r = e.optString("route")
            val dest = e.optString("dest_tc")
            val cur = byRoute[r]
            if (cur == null || m < cur.second) byRoute[r] = dest to m
        }
        return byRoute.entries.sortedBy { it.value.second }
            .mapIndexed { i, (route, dm) ->
                StopRow(i + 1, if (dm.first.isBlank()) route else "$route → ${dm.first}", route, dm.second)
            }
    }

    /* ---------------- 收藏 ETA ---------------- */

    /** 站牌（無路線號）最早到站：路線號 + 分鐘 */
    data class StopEta(val route: String, val mins: Int)

    /**
     * 站牌收藏（route 為空，僅有 stopId）→ 該站最早到站班次。
     * 九巴 stop-eta 一次回傳全站路線，故一次請求便能取最早一班；
     * 嶼巴/城巴的 ETA 接口必須帶路線號，缺路線時無資料。
     */
    suspend fun favStopEta(f: Fav): StopEta? {
        if (f.company == "nlb") return null
        val sid = f.stopId?.takeIf { it.isNotBlank() } ?: return null
        var best: StopEta? = null
        Api.kmbEta(sid).forEach { e ->
            val m = Api.minsUntil(e.optString("eta")) ?: return@forEach
            val cur = best
            if (cur == null || m < cur.mins) best = StopEta(e.optString("route"), m)
        }
        return best
    }

    /** 站牌收藏的即時標籤（如「69X 3 分」）；非站牌收藏或無資料回傳 "" */
    suspend fun favEtaLabel(f: Fav): String {
        if (f.type != "bus" || f.route.isNotBlank()) return ""
        val e = favStopEta(f) ?: return ""
        return e.route + " " + if (e.mins <= 1) "即將" else "${e.mins} 分"
    }

    suspend fun favEta(f: Fav): Int? = when (f.type) {
        "bus" -> if (f.route.isBlank()) {
            // 站牌收藏：不按路線過濾，取該站最早到站
            favStopEta(f)?.mins
        } else if (f.company == "ctb") {
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
        "bus" -> {
            val co = when (f.company) {
                "ctb" -> "城巴"
                "nlb" -> "嶼巴"
                else -> "九巴"
            }
            when {
                f.route.isNotBlank() -> "$co ${f.route}"
                // 站牌收藏（無路線號）：改用站名，不留尾隨空格
                f.stopName.isNotBlank() -> "$co · ${f.stopName}"
                else -> co
            }
        }
        "mtr" -> {
            val n = f.lineName.ifBlank { f.line ?: "港鐵" }
            if (n.endsWith("綫") || n.endsWith("線")) n else "$n 綫"
        }
        "lrt" -> f.stopName.ifBlank { "輕鐵站" }
        "mtrbus" -> if (f.route.isNotBlank()) "港鐵巴士 ${f.route}" else "港鐵巴士"
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
        // 站牌收藏：無路線號 → 以站牌呈現（詳情頁可列該站各班次）
        "bus" -> if (f.route.isBlank()) SearchItem(
            kind = Kind.BUSSTOP, no = "站", name = f.stopName.ifBlank { "巴士站" },
            cap = favMeta(f), stopId = f.stopId, group = "巴士站",
        ) else SearchItem(
            kind = if (f.company == "ctb") Kind.CTB else if (f.company == "nlb") Kind.NLB else Kind.KMB,
            no = f.route, name = f.stopName.ifBlank { f.route }, cap = favMeta(f),
            route = f.route, dir = f.dir, stopId = f.stopId, routeId = f.routeId,
            group = when (f.company) {
                "ctb" -> "城巴"
                "nlb" -> "嶼巴"
                else -> "九巴"
            },
        )
        "mtrbus" -> SearchItem(kind = Kind.MTRBUS, no = f.route, name = f.stopName.ifBlank { f.route }, cap = "港鐵巴士", route = f.route, group = "港鐵巴士")
        "mtr" -> SearchItem(kind = Kind.MTR, no = "MTR", name = f.stationName, cap = favMeta(f), stationCode = f.stationCode, stationName = f.stationName, group = "港鐵")
        "lrt" -> SearchItem(kind = Kind.LRT, no = "輕鐵", name = f.stopName, cap = favMeta(f), stationCode = f.stationCode, stationName = f.stationName, group = "輕鐵")
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
            Kind.MTRBUS -> {
                // 港鐵巴士：按班次聚合最近到站時間（與 Web 版一致）
                val d = Api.mtrBusSchedule(route) ?: return@coroutineScope emptyList()
                val arr = d.optJSONArray("busStop") ?: return@coroutineScope emptyList()
                val best = linkedMapOf<String, Int>()
                for (i in 0 until arr.length()) {
                    val buses = arr.optJSONObject(i)?.optJSONArray("bus") ?: continue
                    for (j in 0 until buses.length()) {
                        val b = buses.optJSONObject(j) ?: continue
                        val id = b.optString("busId").ifBlank { "?" }
                        val sec = b.optInt("arrivalTimeInSecond", 0)
                        if (sec !in 1 until 108000) continue
                        val m = (sec + 59) / 60
                        if (best[id] == null || m < best.getValue(id)) best[id] = m
                    }
                }
                best.entries.sortedBy { it.value }.mapIndexed { i, (id, m) -> StopRow(i + 1, "班次 $id", id, m) }
            }
            else -> emptyList()
        }
    }

    /**
     * 車站即時班次（港鐵上下行 / 輕鐵各線）。
     * 供收藏中的港鐵站、輕鐵站，以及到站提醒通知點擊後直接查看班次。
     */
    /**
     * 港鐵車站首班／尾班：由該站全日班表（UP+DOWN 全部班次）取時間極值推算，
     * 與舊 WebView 版 renderMTRStationDetail 的做法一致（資料來源同 getSchedule.php）。
     */
    suspend fun stationFirstLast(item: SearchItem): Pair<String, String>? = coroutineScope {
        if (item.kind != Kind.MTR) return@coroutineScope null
        val code = item.stationCode ?: return@coroutineScope null
        val all = StaticData.mtrLinesOf(code).map { line ->
            async {
                val dd = Api.mtrSchedule(line, code)?.optJSONObject("$line-$code")
                    ?: return@async emptyList<String>()
                buildList {
                    for (key in listOf("UP", "DOWN")) {
                        val arr = dd.optJSONArray(key) ?: continue
                        for (i in 0 until arr.length()) {
                            val t = arr.optJSONObject(i)?.optString("time").orEmpty()
                            if (t.isNotBlank()) add(t)
                        }
                    }
                }
            }
        }.awaitAll().flatten().mapNotNull { Api.hhmmHk(it) }
        if (all.isEmpty()) return@coroutineScope null
        all.minOrNull()!! to all.maxOrNull()!!
    }

    suspend fun stationTrains(item: SearchItem): List<TrainRow> = coroutineScope {
        val code = item.stationCode ?: return@coroutineScope emptyList()
        when (item.kind) {
            Kind.MTR -> {
                val lines = StaticData.mtrLinesOf(code)
                val parts = lines.map { line ->
                    async {
                        val out = mutableListOf<TrainRow>()
                        val d = Api.mtrSchedule(line, code)
                        val dd = d?.optJSONObject("$line-$code")
                        if (dd != null) {
                            for ((key, label) in listOf("UP" to "上行", "DOWN" to "下行")) {
                                val arr = dd.optJSONArray(key) ?: continue
                                for (i in 0 until arr.length()) {
                                    val e = arr.optJSONObject(i) ?: continue
                                    val mins = Api.minsUntil(e.optString("time")) ?: continue
                                    val destCode = e.optString("dest")
                                    out += TrainRow(
                                        dirLabel = label,
                                        dest = StaticData.stationNames[destCode] ?: destCode,
                                        plat = e.optString("plat"),
                                        mins = mins,
                                    )
                                }
                            }
                        }
                        out
                    }
                }.awaitAll()
                parts.flatten().sortedBy { it.mins }
            }
            Kind.LRT -> Api.lrtEta(code.toIntOrNull() ?: return@coroutineScope emptyList())
                .map { TrainRow(dirLabel = it.routeNo, dest = it.dest, plat = it.platformId, mins = it.mins) }
            else -> emptyList()
        }
    }
}

/**
 * 簡繁轉換（港鐵／巴士站名常見用字，移植自 Web 版 js/util.js 的 SIMP2TRAD）。
 * 目的是搜尋兼容：簡體輸入（观塘、铜锣湾）也要能找到繁體站名。
 * 反向表由正向表推導，與 Web 版一致。
 */
object TradSimp {
    private val SIMP2TRAD: Map<Char, Char> = mapOf(
        '环' to '環', '铜' to '銅', '锣' to '鑼', '湾' to '灣', '钟' to '鐘', '观' to '觀', '龙' to '龍', '围' to '圍', '东' to '東',
        '将' to '將', '军' to '軍', '宝' to '寶', '黄' to '黃', '钻' to '鑽', '乐' to '樂', '启' to '啟', '红' to '紅', '长' to '長',
        '蓝' to '藍', '调' to '調', '岭' to '嶺', '窝' to '窩', '荫' to '蔭', '显' to '顯', '车' to '車', '门' to '門', '恒' to '恆',
        '乌' to '烏', '湿' to '濕', '头' to '頭', '铁' to '鐵', '线' to '線', '码' to '碼', '学' to '學', '罗' to '羅', '马' to '馬',
        '庙' to '廟', '径' to '徑', '园' to '園', '鲗' to '鰂', '鱼' to '魚', '营' to '營', '盘' to '盤', '坚' to '堅', '台' to '臺',
        '灵' to '靈', '场' to '場', '际' to '際', '馆' to '館', '图' to '圖', '华' to '華', '凤' to '鳳', '丽' to '麗', '凯' to '凱',
        '伟' to '偉', '侨' to '僑', '汇' to '匯', '宁' to '寧', '卫' to '衛', '发' to '發', '达' to '達', '运' to '運', '逊' to '遜',
        '尔' to '爾', '时' to '時', '间' to '間', '问' to '問', '广' to '廣', '边' to '邊', '让' to '讓', '议' to '議', '认' to '認',
        '证' to '證', '记' to '記', '计' to '計', '说' to '說', '语' to '語', '邮' to '郵', '银' to '銀', '农' to '農',
    )
    private val TRAD2SIMP: Map<Char, Char> = SIMP2TRAD.entries.associate { (s, t) -> t to s }

    fun toTrad(s: String): String = buildString(s.length) { for (c in s) append(SIMP2TRAD[c] ?: c) }

    fun toSimp(s: String): String = buildString(s.length) { for (c in s) append(TRAD2SIMP[c] ?: c) }
}
