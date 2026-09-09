package hk.senyou.travel.ui

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import hk.senyou.travel.data.matchKey
import hk.senyou.travel.data.toFav
import hk.senyou.travel.ui.theme.V3
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val MODES = listOf("bus" to "公交", "mtrbus" to "港鐵巴士", "mtr" to "港鐵", "lrt" to "輕鐵")

/** 首頁：緊湊態單欄；展開態（≥840dp，如 MIX Fold 4 內屏）磁貼 | 搜索結果 雙欄 */
@Composable
fun HomeScreen(
    scroll: ScrollState,
    onOpenK75P: () -> Unit,
    onOpenRoute: (SearchItem) -> Unit,
    onOpenWeather: () -> Unit,
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    val recent by Store.recent(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    val adaptive = LocalAdaptive.current

    var mode by remember { mutableIntStateOf(0) }
    var query by remember { mutableStateOf("") }
    var items by remember { mutableStateOf<List<SearchItem>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var k75pMins by remember { mutableStateOf<Int?>(null) }
    var k75pLive by remember { mutableIntStateOf(0) }
    var weatherTemp by remember { mutableStateOf<Int?>(null) }
    var weatherCap by remember { mutableStateOf("載入中…") }
    var favMins by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(Unit) {
        if (hk.senyou.travel.data.DebugFlags.staticUi) return@LaunchedEffect
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

    LaunchedEffect(favs) {
        val w = Hko.fetch()
        weatherTemp = w.temp
        weatherCap = if (w.temp == null) "載入中…" else buildString {
            if (w.emoji.isNotBlank()) append(w.emoji).append(' ')
            append(w.days.joinToString(" ") { d -> d.label.take(1) + (d.max?.let { "$it°" } ?: "") })
            if (isEmpty()) append(w.desc)
        }
        val first = favs.firstOrNull()
        favMins = first?.let { SearchRepo.favEta(it) }
    }

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
        if (base.isNotEmpty()) Store.pushRecent(ctx, query)
    }

    val tiles: @Composable () -> Unit = {
        Tile(
            label = "K75P 天瑞 ↺ 洪水橋 · 實時 $k75pLive 班在路",
            value = if (k75pMins == null) "—" else if (k75pMins!! <= 0) "即將" else "$k75pMins",
            unit = if (k75pMins != null && k75pMins!! > 0) " 分鐘" else null,
            valueColor = V3.Accent,
            live = k75pLive > 0,
            modifier = Modifier.fillMaxWidth(),
            onClick = onOpenK75P,
            extra = { K75PMiniMap(Modifier.fillMaxWidth().height(62.dp)) },
        )
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tile(
                label = "我的收藏", value = favs.size.toString(), unit = " 條",
                cap = favMins?.let { "下一班 ${Api.etaText(it)}" } ?: "點星標加入",
                valueColor = V3.Accent, modifier = Modifier.weight(1f),
            )
            Tile(
                label = "天氣 · 三天", value = weatherTemp?.toString() ?: "—",
                unit = if (weatherTemp != null) "°" else null, cap = weatherCap,
                modifier = Modifier.weight(1f), onClick = onOpenWeather,
            )
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tile(label = "壽司郎", value = "—", unit = " 組", cap = "分頁查看", modifier = Modifier.weight(1f))
            Tile(label = "路線圖", value = "屯馬綫", cap = "全線候車", valueColor = V3.CoMtr, modifier = Modifier.weight(1f))
        }
    }

    val searchBox: @Composable () -> Unit = {
        SearchPill(placeholder = "輸入路線、站名或港鐵車站", value = query, onValueChange = { query = it })
        Spacer(Modifier.height(10.dp))
        ChipRow(MODES.map { it.second }, mode) { mode = it }
        Spacer(Modifier.height(6.dp))
    }

    val resultRow: @Composable (SearchItem) -> Unit = { it ->
        val starred = favs.any { f -> f.matchKey() == it.matchKey() }
        ResultRow(
            no = it.no, co = it.kind.toCo(), name = it.name, cap = it.cap,
            etaMins = it.etaMins, star = starred,
            onStar = {
                scope.launch {
                    val next = if (starred) favs.filterNot { f -> f.matchKey() == it.matchKey() }
                    else favs + it.toFav()
                    Store.saveFavorites(ctx, next)
                }
            },
        ) { onOpenRoute(it) }
        Spacer(Modifier.height(8.dp))
    }

    // 最近搜尋（查詢為空時顯示）
    val recentChips: @Composable () -> Unit = {
        if (query.isBlank() && recent.isNotEmpty()) {
            Spacer(Modifier.height(14.dp))
            Text("最近搜尋", color = V3.Aux, fontSize = 13.sp)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                recent.take(5).forEach { q ->
                    GlassSurface(
                        modifier = Modifier.height(38.dp).clickable { query = q },
                        shape = androidx.compose.foundation.shape.RoundedCornerShape(999.dp),
                    ) {
                        Box(Modifier.padding(horizontal = 14.dp), contentAlignment = androidx.compose.ui.Alignment.Center) {
                            Text(q, color = V3.Text1, fontSize = 13.sp, maxLines = 1)
                        }
                    }
                }
            }
        }
    }

    if (adaptive.flexMode) {
        // 半折分屏：上半磁貼 / 下半搜索結果（鉸鏈處留空）
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.weight(0.45f)) {
                Column(Modifier.verticalScroll(scroll).padding(horizontal = 16.dp, vertical = 8.dp)) { tiles() }
            }
            Box(Modifier.height(adaptive.hingeHeightPx.dp))
            Box(Modifier.weight(0.55f)) {
                Column(Modifier.padding(horizontal = 16.dp)) {
                    searchBox()
                    recentChips()
                    LazyColumn(Modifier.fillMaxSize()) {
                        if (loading) item { Text("搜尋中…", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 12.dp)) }
                        else if (query.isNotBlank() && items.isEmpty()) item { Text("沒有結果", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 12.dp)) }
                        items(items, key = { "${it.kind}-${it.no}-${it.route}-${it.stationCode}" }) { it -> resultRow(it) }
                    }
                }
            }
        }
    } else if (adaptive.isExpanded) {
        // 展開態：左磁貼 / 右搜索結果
        Row(
            Modifier.fillMaxSize().padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            Column(Modifier.weight(1f).verticalScroll(scroll)) {
                tiles()
                Spacer(Modifier.height(24.dp))
            }
            Column(Modifier.weight(1f)) {
                searchBox()
                recentChips()
                if (query.isBlank() && recent.isEmpty()) {
                    // 展開態右欄空閒時給搜索引導（避免大面積空白）
                    Spacer(Modifier.height(24.dp))
                    Text("快速搜尋", color = V3.Aux, fontSize = 13.sp)
                    Spacer(Modifier.height(10.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("69X", "969", "K75P", "天水圍", "元朗").forEach { q ->
                            GlassSurface(
                                modifier = Modifier.fillMaxWidth().height(52.dp)
                                    .clickable { query = q },
                            ) {
                                Row(
                                    Modifier.fillMaxSize().padding(horizontal = 16.dp),
                                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                                ) {
                                    Text("⌕", color = V3.Text2, fontSize = 16.sp)
                                    Spacer(Modifier.width(10.dp))
                                    Text("搜尋 $q", color = V3.Text1, fontSize = 15.sp, modifier = Modifier.weight(1f))
                                    Text("›", color = V3.Text2, fontSize = 18.sp)
                                }
                            }
                        }
                    }
                }
                LazyColumn(Modifier.fillMaxSize()) {
                    if (loading) item { Text("搜尋中…", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 18.dp)) }
                    else if (query.isNotBlank() && items.isEmpty()) item { Text("沒有結果", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 18.dp)) }
                    items(items, key = { "${it.kind}-${it.no}-${it.route}-${it.stationCode}" }) { it -> resultRow(it) }
                }
            }
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scroll)
                .padding(horizontal = 16.dp)
                .padding(bottom = 110.dp),
        ) {
            tiles()
            Spacer(Modifier.height(16.dp))
            searchBox()
            recentChips()
            when {
                loading -> Text("搜尋中…", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 18.dp))
                query.isNotBlank() && items.isEmpty() -> Text("沒有結果", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 18.dp))
                else -> items.forEach { it -> resultRow(it) }
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
