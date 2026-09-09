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
