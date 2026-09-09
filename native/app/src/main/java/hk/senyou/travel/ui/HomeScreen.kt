package hk.senyou.travel.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.Fav
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Store
import hk.senyou.travel.ui.theme.V3
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val MODES = listOf("bus" to "公交", "mtrbus" to "港鐵巴士", "mtr" to "港鐵", "lrt" to "輕鐵")

/** 首頁（M3：真實搜索 + 收藏 + 天氣 + K75P 實時） */
@Composable
fun HomeScreen(onOpenK75P: () -> Unit, onOpenRoute: (SearchItem) -> Unit, onOpenWeather: () -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())

    var mode by remember { mutableIntStateOf(0) }
    var query by remember { mutableStateOf("") }
    var items by remember { mutableStateOf<List<SearchItem>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var k75pMins by remember { mutableStateOf<Int?>(null) }
    var k75pLive by remember { mutableIntStateOf(0) }
    var weatherTemp by remember { mutableStateOf<Int?>(null) }
    var weatherCap by remember { mutableStateOf("載入中") }
    var favMins by remember { mutableStateOf<Int?>(null) }

    // K75P 實時
    LaunchedEffect(Unit) {
        while (true) {
            val d = Api.mtrBusSchedule("K75P")
            val arr = d?.optJSONArray("busStop")
            var best: Int? = null
            var live = 0
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    val buses = arr.optJSONObject(i)?.optJSONArray("bus") ?: continue
                    for (j in 0 until buses.length()) {
                        val b = buses.optJSONObject(j) ?: continue
                        val sec = b.optInt("arrivalTimeInSecond", 0)
                        if (sec in 1 until 108000) {
                            val m = (sec + 59) / 60
                            if (best == null || m < best) best = m
                        }
                        val loc = b.optJSONObject("busLocation")
                        if (loc != null && loc.optDouble("latitude", 0.0) != 0.0) live++
                    }
                }
            }
            k75pMins = best
            k75pLive = live
            delay(30_000)
        }
    }

    // 天氣 + 收藏首條 ETA
    LaunchedEffect(favs) {
        val w = Hko.fetch()
        weatherTemp = w.temp
        weatherCap = buildString {
            if (w.emoji.isNotBlank()) append(w.emoji).append(' ')
            append(w.days.joinToString(" ") { d -> d.label.take(1) + (d.max?.let { "$it°" } ?: "") })
            if (isEmpty()) append(w.desc)
        }
        val first = favs.firstOrNull()
        favMins = first?.let { SearchRepo.favEta(it) }
    }

    // 搜索
    LaunchedEffect(query, mode) {
        if (query.isBlank()) {
            items = emptyList()
            loading = false
            return@LaunchedEffect
        }
        delay(350)
        loading = true
        val base = SearchRepo.search(query, MODES[mode].first)
        items = base
        items = SearchRepo.fillEtas(base)
        loading = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 110.dp),
    ) {
        Tile(
            label = "K75P 天瑞 ↺ 洪水橋 · 實時 $k75pLive 班在路",
            value = k75pMins?.toString() ?: "—",
            unit = " 分鐘",
            valueColor = V3.Accent,
            live = k75pLive > 0,
            modifier = Modifier.fillMaxWidth(),
            onClick = onOpenK75P,
            extra = { K75PMiniMap(Modifier.fillMaxWidth().height(62.dp)) },
        )
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tile(
                label = "我的收藏",
                value = favs.size.toString(),
                unit = " 條",
                cap = favMins?.let { "下一班 $it 分" } ?: "點星標加入",
                valueColor = V3.Accent,
                modifier = Modifier.weight(1f),
            )
            Tile(
                label = "天氣 · 三天",
                value = weatherTemp?.toString() ?: "--",
                unit = "°",
                cap = weatherCap,
                modifier = Modifier.weight(1f),
                onClick = onOpenWeather,
            )
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tile(label = "壽司郎", value = "—", unit = " 組", cap = "分頁查看", modifier = Modifier.weight(1f))
            Tile(label = "路線圖", value = "屯馬", unit = "綫", cap = "全線候車", valueColor = V3.CoMtr, modifier = Modifier.weight(1f))
        }

        Spacer(Modifier.height(16.dp))
        SearchPill(
            placeholder = "輸入路線、站名或港鐵車站",
            value = query,
            onValueChange = { query = it },
        )
        Spacer(Modifier.height(10.dp))
        ChipRow(MODES.map { it.second }, mode) { mode = it }
        Spacer(Modifier.height(6.dp))

        when {
            loading -> Text("搜尋中…", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 18.dp))
            query.isNotBlank() && items.isEmpty() -> Text("沒有結果", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 18.dp))
            else -> items.forEach { it ->
                val starred = favs.any { f -> favKeyOf(f) == favKeyOfItem(it) }
                ResultRow(
                    no = it.no,
                    co = it.kind.toCo(),
                    name = it.name,
                    cap = it.cap,
                    etaMins = it.etaMins,
                    star = starred,
                    onStar = {
                        scope.launch {
                            val next = if (starred) favs.filterNot { f -> favKeyOf(f) == favKeyOfItem(it) }
                            else favs + itemToFav(it)
                            Store.saveFavorites(ctx, next)
                        }
                    },
                ) { onOpenRoute(it) }
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

fun Kind.toCo(): Co = when (this) {
    Kind.KMB -> Co.KMB
    Kind.CTB -> Co.CTB
    Kind.NLB -> Co.NLB
    Kind.MTR -> Co.MTR
    Kind.LRT -> Co.LRT
    Kind.MTRBUS -> Co.MTRBUS
    Kind.BUSSTOP -> Co.KMB
}

private fun favKeyOf(f: Fav): String = listOf(f.type, f.company, f.route, f.dir, f.stopId ?: f.stationCode ?: f.routeId ?: "").joinToString("|")

private fun favKeyOfItem(it: SearchItem): String = listOf(
    when (it.kind) {
        Kind.KMB, Kind.BUSSTOP -> "bus"
        Kind.CTB -> "bus"
        Kind.NLB -> "bus"
        Kind.MTRBUS -> "mtrbus"
        Kind.MTR -> "mtr"
        Kind.LRT -> "lrt"
    },
    when (it.kind) {
        Kind.CTB -> "ctb"
        Kind.NLB -> "nlb"
        else -> "kmb"
    },
    it.route ?: "",
    it.dir ?: "outbound",
    it.stopId ?: it.stationCode ?: it.routeId ?: "",
).joinToString("|")

private fun itemToFav(it: SearchItem): Fav = when (it.kind) {
    Kind.MTRBUS -> Fav(type = "mtrbus", company = "mtrbus", route = it.route ?: "", stopName = it.name)
    Kind.MTR -> Fav(type = "mtr", company = "mtr", stationCode = it.stationCode, stationName = it.stationName ?: it.name)
    Kind.LRT -> Fav(type = "lrt", company = "lrt", stationCode = it.stationCode, stationName = it.stationName ?: it.name, stopName = it.stationName ?: it.name)
    Kind.CTB -> Fav(type = "bus", company = "ctb", route = it.route ?: "", dir = it.dir ?: "outbound", stopName = it.name)
    Kind.NLB -> Fav(type = "bus", company = "nlb", route = it.route ?: "", routeId = it.routeId, dir = it.dir ?: "outbound", stopName = it.name)
    else -> Fav(type = "bus", company = "kmb", route = it.route ?: "", dir = it.dir ?: "outbound", stopId = it.stopId, stopName = it.name)
}
