package hk.senyou.travel.data

/** SearchItem ↔ Fav 映射（收藏邏輯共用） */
fun SearchItem.toFav(): Fav = when (kind) {
    Kind.MTRBUS -> Fav(type = "mtrbus", company = "mtrbus", route = route ?: "", stopName = name)
    Kind.MTR -> Fav(type = "mtr", company = "mtr", stationCode = stationCode, stationName = stationName ?: name)
    Kind.LRT -> Fav(type = "lrt", company = "lrt", stationCode = stationCode, stationName = stationName ?: name, stopName = stationName ?: name)
    Kind.CTB -> Fav(type = "bus", company = "ctb", route = route ?: "", dir = dir ?: "outbound", stopName = name)
    Kind.NLB -> Fav(type = "bus", company = "nlb", route = route ?: "", routeId = routeId, dir = dir ?: "outbound", stopName = name)
    Kind.BUSSTOP -> Fav(type = "bus", company = "kmb", route = "", dir = "outbound", stopId = stopId, stopName = name)
    else -> Fav(type = "bus", company = "kmb", route = route ?: "", dir = dir ?: "outbound", stopId = stopId, stopName = name)
}

/** 收藏比對鍵（忽略提醒設定） */
fun Fav.matchKey(): String =
    listOf(type, company, route, dir, stopId ?: stationCode ?: routeId ?: "").joinToString("|")

fun SearchItem.matchKey(): String = toFav().matchKey()

fun Fav.displayName(): String = when {
    type == "bus" || type == "mtrbus" -> route
    stationName.isNotBlank() -> stationName
    stopName.isNotBlank() -> stopName
    else -> "收藏"
}

/**
 * 到站提醒通知的 extras → SearchItem（純函數，便於測試）。
 * 依收藏類型分流：bus 需要 route；mtr/lrt 需要車站代碼；mtrbus 需要路線。
 * 缺必要欄位時回傳 null（呼叫端忽略，不開空白頁）。
 */
fun deepLinkItem(
    type: String?,
    route: String?,
    station: String?,
    stationName: String?,
    company: String?,
    dir: String?,
    stopId: String?,
    routeId: String?,
): SearchItem? {
    val r = route.orEmpty().trim()
    val code = station.orEmpty().trim()
    val name = stationName.orEmpty().trim().ifBlank { code }
    return when (type) {
        "mtr" -> if (code.isBlank()) null else SearchItem(
            kind = Kind.MTR, no = "MTR", name = name,
            stationCode = code, stationName = name,
        )
        "lrt" -> if (code.isBlank()) null else SearchItem(
            kind = Kind.LRT, no = "輕鐵", name = name, cap = "輕鐵",
            stationCode = code, stationName = name,
        )
        "mtrbus" -> if (r.isBlank()) null else SearchItem(
            kind = Kind.MTRBUS, no = r, name = r, cap = "港鐵巴士", route = r,
        )
        else -> if (r.isBlank()) null else SearchItem(
            kind = when (company) {
                "ctb" -> Kind.CTB
                "nlb" -> Kind.NLB
                else -> Kind.KMB
            },
            no = r,
            name = r,
            cap = "到站提醒",
            route = r,
            dir = dir?.ifBlank { null } ?: "outbound",
            stopId = stopId?.ifBlank { null },
            routeId = routeId?.ifBlank { null },
        )
    }
}
