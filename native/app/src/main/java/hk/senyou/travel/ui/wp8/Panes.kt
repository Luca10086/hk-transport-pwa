package hk.senyou.travel.ui.wp8

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.Cache
import hk.senyou.travel.data.CrashGuard
import hk.senyou.travel.data.CrashLog
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.Fav
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.MtrRepo
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.Sushiro
import hk.senyou.travel.data.SushiroStore
import hk.senyou.travel.data.Weather
import hk.senyou.travel.data.displayName
import hk.senyou.travel.data.matchKey
import hk.senyou.travel.data.toFav
import hk.senyou.travel.ui.LocalAdaptive
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val MODES = listOf("bus" to "公交", "mtrbus" to "港鐵巴士", "mtr" to "港鐵", "lrt" to "輕鐵")

/* ==================================================================
   首頁全景（Panorama）：面板 1 磁貼牆 / 面板 2 搜尋 / 面板 3 天氣 + K75P
   ================================================================== */

@Composable
fun Wp8HomePane(
    refreshSec: Int,
    refreshTick: Int,
    onOpenK75P: () -> Unit,
    onGoPane: (Int) -> Unit,
    onOpenDetail: (SearchItem) -> Unit,
    startPanel: Int = 0,
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val pano = rememberPagerState(initialPage = startPanel.coerceIn(0, 2), pageCount = { 3 })

    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    var k75pMins by remember { mutableStateOf<Int?>(Cache.k75pMins) }
    var k75pLive by remember { mutableIntStateOf(Cache.k75pLive) }
    var weather by remember { mutableStateOf<Weather?>(null) }
    var favEta by remember { mutableStateOf<Int?>(null) }
    var updated by remember { mutableStateOf("") }

    // 週期刷新（磁貼數據）
    LaunchedEffect(refreshSec, refreshTick) {
        if (DebugFlags.staticUi || refreshSec <= 0) {
            weather = runCatching { Hko.fetch() }.getOrNull()
            return@LaunchedEffect
        }
        while (true) {
            runCatching {
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
                Cache.k75pMins = best
                Cache.k75pLive = live
                weather = Hko.fetch()
                val first = favs.firstOrNull()
                favEta = first?.let { SearchRepo.favEta(it) }
                updated = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault())
                    .format(java.util.Date())
            }
            delay(refreshSec * 1000L)
        }
    }

    val expanded = LocalAdaptive.current.isExpanded
    if (expanded) {
        // 大屏（摺疊機內屏 / 平板）：概念圖規範「首頁全景同屏並列兩塊面板」
        Row(Modifier.fillMaxSize()) {
            PaneScroll(Modifier.weight(1f).fillMaxHeight()) {
                TilesPanel(
                    favCount = favs.size,
                    favEta = favEta,
                    favName = favs.firstOrNull()?.displayName() ?: "",
                    weather = weather,
                    k75pMins = k75pMins,
                    k75pLive = k75pLive,
                    onOpenK75P = onOpenK75P,
                    onGoPane = onGoPane,
                )
                WeatherK75PPanel(weather = weather, updated = updated, onOpenK75P = onOpenK75P)
            }
            PaneScroll(Modifier.weight(1f).fillMaxHeight()) {
                SearchPanel(onOpenDetail = onOpenDetail)
            }
        }
    } else {
        Column(Modifier.fillMaxSize()) {
            HorizontalPager(state = pano, modifier = Modifier.weight(1f)) { page ->
                when (page) {
                    0 -> PaneScroll(Modifier.fillMaxSize()) {
                        TilesPanel(
                            favCount = favs.size,
                            favEta = favEta,
                            favName = favs.firstOrNull()?.displayName() ?: "",
                            weather = weather,
                            k75pMins = k75pMins,
                            k75pLive = k75pLive,
                            onOpenK75P = onOpenK75P,
                            onGoPane = onGoPane,
                        )
                    }
                    1 -> PaneScroll(Modifier.fillMaxSize()) { SearchPanel(onOpenDetail = onOpenDetail) }
                    else -> PaneScroll(Modifier.fillMaxSize()) {
                        WeatherK75PPanel(weather = weather, updated = updated, onOpenK75P = onOpenK75P)
                    }
                }
            }
            Wp8PanoDots(count = 3, current = pano.currentPage) { i -> scope.launch { pano.animateScrollToPage(i) } }
        }
    }
}

/** WP8 統一分頁容器：24/44 邊距 + 可捲動 + 底部留白 */
@Composable
private fun PaneScroll(modifier: Modifier, content: @Composable () -> Unit) {
    Column(
        modifier
            .verticalScroll(rememberScrollState())
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 24.dp),
    ) { content() }
}

/* ---------- 面板 1：Live Tiles 磁貼牆（概念版配色：cobalt/magenta/teal/cyan） ---------- */

@Composable
private fun TilesPanel(
    favCount: Int,
    favEta: Int?,
    favName: String,
    weather: Weather?,
    k75pMins: Int?,
    k75pLive: Int,
    onOpenK75P: () -> Unit,
    onGoPane: (Int) -> Unit,
) {
    var weatherFlipped by remember { mutableStateOf(false) }
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            while (true) {
                delay(6000)
                weatherFlipped = !weatherFlipped
            }
        }
    }
    Column(Modifier.fillMaxWidth()) {
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(Wp8.Gap)) {
            Wp8Tile(
                modifier = Modifier.weight(2f).height(100.dp),
                color = Wp8.TileCobalt,
                value = "$favCount", trailing = "條",
                title = "我的收藏",
                sub = "點按查看全部",
                onClick = { onGoPane(1) },
            )
            Wp8Tile(
                modifier = Modifier.weight(2f).height(100.dp),
                color = Wp8.TileMagenta,
                title = "壽司郎",
                sub = "即時排隊組數",
                onClick = { onGoPane(2) },
            )
        }
        Spacer(Modifier.height(Wp8.Gap))
        Wp8Tile(
            modifier = Modifier.fillMaxWidth().height(76.dp),
            color = Wp8.TileTeal,
            value = weather?.temp?.let { "$it°" } ?: "—",
            title = "天氣",
            sub = weather?.desc ?: "載入中…",
            back = weather?.let { w ->
                w.days.take(3).joinToString("\n") { d -> "${d.label} ${d.emoji} ${d.min ?: "-"}~${d.max ?: "-"}°" }
            } ?: "載入中…",
            flipped = weatherFlipped,
            onClick = { weatherFlipped = !weatherFlipped },
        )
        Spacer(Modifier.height(Wp8.Gap))
        Wp8Tile(
            modifier = Modifier.fillMaxWidth().height(76.dp),
            color = Wp8.TileCyan,
            value = k75pMins?.let { if (it <= 0) "即將" else "$it" } ?: "—",
            trailing = if (k75pMins != null && k75pMins > 0) "分" else "",
            title = "K75P · 天瑞 ↺ 洪水橋",
            sub = "實時 $k75pLive 班在路",
            onClick = onOpenK75P,
        )
        Spacer(Modifier.height(Wp8.Gap))
        Wp8Tile(
            modifier = Modifier.fillMaxWidth().height(76.dp),
            color = Wp8.TileCyan,
            value = favEta?.let { if (it <= 0) "即將" else "$it" } ?: "—",
            trailing = if (favEta != null && favEta > 0) "分" else "",
            title = if (favName.isBlank()) "收藏 · 下一班" else "收藏 · $favName",
            sub = if (favName.isBlank()) "暫無收藏" else "下一班",
            onClick = { onGoPane(1) },
        )
        Spacer(Modifier.height(Wp8.Gap))
        Row(horizontalArrangement = Arrangement.spacedBy(Wp8.Gap)) {
            Wp8Tile(
                modifier = Modifier.weight(1f).height(100.dp),
                color = Wp8.TileCyan,
                title = "路線圖",
                sub = "全線候車",
                onClick = { onGoPane(3) },
            )
            Wp8Tile(
                modifier = Modifier.weight(1f).height(100.dp),
                color = Wp8.TileTeal,
                title = "設定",
                sub = "主題 · 強調色",
                onClick = { onGoPane(4) },
            )
        }
    }
}

/* ---------- 面板 2：搜尋（Metro 輸入框 + chips + 扁平行結果） ---------- */

@Composable
private fun SearchPanel(onOpenDetail: (SearchItem) -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var query by remember { mutableStateOf("") }
    var mode by remember { mutableIntStateOf(0) }
    var items by remember { mutableStateOf<List<SearchItem>>(emptyList()) }
    var searching by remember { mutableStateOf(false) }
    val recent by Store.recent(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())

    LaunchedEffect(query, mode) {
        if (query.isBlank()) { items = emptyList(); searching = false; return@LaunchedEffect }
        delay(320)
        searching = true
        runCatching {
            val base = SearchRepo.search(query, MODES[mode].first)
            items = SearchRepo.fillEtas(base)
            if (base.isNotEmpty()) Store.pushRecent(ctx, query)
        }
        searching = false
    }

    Column(Modifier.fillMaxWidth()) {
        Spacer(Modifier.height(10.dp))
        Wp8Input(query, "輸入巴士路線、站名或港鐵車站") { query = it }
        Spacer(Modifier.height(Wp8.Gap))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MODES.forEachIndexed { i, (_, label) -> Wp8Chip(label, i == mode) { mode = i } }
        }
        Spacer(Modifier.height(Wp8.Gap))
        Wp8PrimaryButton(if (searching) "搜尋中…" else "搜尋") { }

        if (query.isBlank() && recent.isNotEmpty()) {
            Wp8SectionTitle("最近搜尋")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                recent.take(5).forEach { q -> Wp8Chip(q, false) { query = q } }
            }
        }

        if (query.isNotBlank()) {
            Wp8SectionTitle(if (items.isEmpty() && !searching) "沒有結果" else "搜尋結果")
        }
        items.forEach { it ->
            val starred = favs.any { f -> f.matchKey() == it.matchKey() }
            Wp8Row(
                no = it.no.take(4),
                name = it.name,
                sub = it.cap.ifBlank { "實時到站" },
                eta = etaText(it.etaMins),
                etaColor = etaColor(it.etaMins),
                star = starred,
                onStar = {
                    scope.launch {
                        val next = if (starred) favs.filterNot { f -> f.matchKey() == it.matchKey() }
                        else favs + it.toFav()
                        Store.saveFavorites(ctx, next)
                    }
                },
            ) { onOpenDetail(it) }
        }
    }
}

/* ---------- 面板 3：天氣 + K75P 入口 ---------- */

@Composable
private fun WeatherK75PPanel(weather: Weather?, updated: String, onOpenK75P: () -> Unit) {
    Column(Modifier.fillMaxWidth()) {
        Wp8PaneTitle("天氣")
        weather?.severe?.forEach { Wp8WarningBar(it, severe = true) }
        weather?.mild?.forEach { Wp8WarningBar(it, severe = false) }
        Wp8WeatherBar(
            text = weather?.let { w ->
                buildString {
                    if (w.emoji.isNotBlank()) append(w.emoji).append(' ')
                    append(w.temp?.let { "$it°" } ?: "—")
                    if (w.humid != null) append("  濕度 ${w.humid}%")
                    if (w.uv != null) append("  UV ${w.uv}")
                }
            } ?: "載入中…",
            cap = weather?.let { "${it.desc}${if (updated.isNotBlank()) " · 更新 $updated" else ""}" } ?: "",
        )
        if (weather != null && weather.days.isNotEmpty()) {
            Wp8SectionTitle("未來三天")
            weather.days.take(3).forEach { d ->
                Wp8Row(
                    no = d.emoji.ifBlank { "·" },
                    name = "${d.label} ${d.week}",
                    sub = d.desc,
                    eta = "${d.min ?: "-"}~${d.max ?: "-"}°",
                ) {}
            }
        }
        Wp8SectionTitle("K75P 全線實時")
        Wp8LinkRow("實時路線圖", "每班車位置 · 點站查三班") { onOpenK75P() }
    }
}

/* ==================================================================
   收藏
   ================================================================== */

@Composable
fun Wp8FavsPane(onOpenDetail: (SearchItem) -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    var etas by remember { mutableStateOf<Map<String, Int?>>(emptyMap()) }

    LaunchedEffect(favs) {
        if (favs.isEmpty()) { etas = emptyMap(); return@LaunchedEffect }
        if (DebugFlags.staticUi) return@LaunchedEffect
        runCatching {
            val map = mutableMapOf<String, Int?>()
            favs.forEach { f -> map[f.key] = runCatching { SearchRepo.favEta(f) }.getOrNull() }
            etas = map
            map.forEach { (k, m) -> if (m != null) Cache.putEtaCache(k, m) }
        }
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 24.dp),
    ) {
        Wp8PaneTitle("收藏")
        if (favs.isEmpty()) {
            Wp8Empty("暫無收藏，在搜尋結果按 ☆ 加入")
        }
        favs.forEach { f ->
            FavBlock(
                fav = f,
                mins = etas[f.key] ?: Cache.etaCache(f.key)?.first,
                stale = etas[f.key] == null && Cache.etaCache(f.key) != null,
                cachedAt = Cache.etaCache(f.key)?.second ?: 0L,
                onOpen = { onOpenDetail(SearchRepo.favToSearchItem(f)) },
                onCycleAlert = {
                    scope.launch {
                        val next = when (f.alertMins) {
                            0 -> 3; 3 -> 5; 5 -> 10; else -> 0
                        }
                        Store.saveFavorites(ctx, favs.map { if (it.key == f.key) it.copy(alertMins = next) else it })
                    }
                },
                onRemove = { scope.launch { Store.saveFavorites(ctx, favs.filterNot { it.key == f.key }) } },
            )
        }
    }
}

@Composable
private fun FavBlock(
    fav: Fav,
    mins: Int?,
    stale: Boolean,
    cachedAt: Long,
    onOpen: () -> Unit,
    onCycleAlert: () -> Unit,
    onRemove: () -> Unit,
) {
    Column(
        Modifier
            .fillMaxWidth()
            .clickable { onOpen() }
            .padding(vertical = 15.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                fav.displayName(),
                color = Wp8.Accent,
                fontSize = 24.sp,
                fontWeight = FontWeight.Light,
                maxLines = 1,
            )
            Spacer(Modifier.width(10.dp))
            Wp8Tag(SearchRepo.favMeta(fav))
            Spacer(Modifier.weight(1f))
            Box(
                Modifier
                    .clickable { onCycleAlert() }
                    .padding(horizontal = 6.dp, vertical = 2.dp),
            ) {
                Text(
                    if (fav.alertMins > 0) "🔔 ${fav.alertMins}分" else "🔕",
                    color = if (fav.alertMins > 0) Wp8.Medium else Wp8.Text2,
                    fontSize = 13.sp,
                )
            }
            Box(Modifier.clickable { onRemove() }.padding(horizontal = 6.dp, vertical = 2.dp)) {
                Text("✕", color = Wp8.Text2, fontSize = 14.sp)
            }
        }
        Spacer(Modifier.height(6.dp))
        Text(
            when {
                mins == null -> "—"
                mins <= 0 -> "即將"
                else -> "$mins 分鐘"
            },
            color = when {
                mins == null -> Wp8.Text2
                mins <= 0 -> Wp8.Soon
                mins <= 10 -> Wp8.Medium
                else -> Wp8.Text1
            },
            fontSize = 35.sp,
            fontWeight = FontWeight.Light,
        )
        if (stale && cachedAt > 0) {
            val hhmm = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault()).format(java.util.Date(cachedAt))
            Text("（上次 $hhmm）", color = Wp8.Text2, fontSize = 12.sp)
        }
        if (fav.stopName.isNotBlank() && fav.type != "mtr" && fav.type != "lrt") {
            Spacer(Modifier.height(3.dp))
            Text(fav.stopName, color = Wp8.Text2, fontSize = 12.sp, maxLines = 1)
        }
        if (fav.type == "bus") {
            Spacer(Modifier.height(3.dp))
            Text(if (fav.dir == "inbound") "回程" else "去程", color = Wp8.Text2, fontSize = 12.sp)
        }
    }
    Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
}

/* ==================================================================
   壽司郎
   ================================================================== */

@Composable
fun Wp8SushiPane() {
    var stores by remember { mutableStateOf<List<SushiroStore>>(emptyList()) }
    var live by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        runCatching {
            val (list, isLive) = Sushiro.fetch()
            stores = list.sortedByDescending { it.waiting }
            live = isLive
        }
        loading = false
    }

    val local = stores.filter { it.area.contains("元朗") || it.area.contains("屯門") || it.area.contains("天水圍") }
    val shown = local + stores.filter { s -> local.none { it.name == s.name } }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 24.dp),
    ) {
        Row(verticalAlignment = Alignment.Bottom) {
            Wp8PaneTitle("壽司郎", Modifier.weight(1f))
            Box(
                Modifier
                    .background(if (live) Wp8.Success.copy(alpha = 0.22f) else Wp8.Text2.copy(alpha = 0.15f))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
            ) {
                Text(if (live) "實時" else "快照", color = if (live) Wp8.Success else Wp8.Text2, fontSize = 11.sp)
            }
        }
        if (loading) Wp8Empty("載入中…")
        else if (shown.isEmpty()) Wp8Empty("暫無資料")
        shown.forEach { s ->
            Wp8Row(
                no = "",
                name = s.name,
                sub = s.area + if (s.status.isNotBlank() && s.status != "OPEN") " · ${s.status}" else "",
                eta = "${s.waiting} 組",
                etaColor = when {
                    s.waiting >= 40 -> Wp8.Soon
                    s.waiting >= 20 -> Wp8.Medium
                    else -> Wp8.Text1
                },
            ) {}
        }
    }
}

/* ==================================================================
   路線圖（港鐵 / 輕鐵）
   ================================================================== */

@Composable
fun Wp8MapPane(onOpenDetail: (SearchItem) -> Unit) {
    var mode by remember { mutableIntStateOf(0) }
    val lines = remember { StaticData.mtrLines.keys.toList() }
    var lineIdx by remember { mutableIntStateOf(0) }
    var rows by remember { mutableStateOf<List<MtrRepoRow>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }

    LaunchedEffect(mode, lineIdx) {
        if (mode != 0) return@LaunchedEffect
        val code = lines.getOrNull(lineIdx) ?: return@LaunchedEffect
        loading = true
        rows = runCatching { MtrRepo.lineRows(code).map { MtrRepoRow(it.code, it.name, it.upMins, it.downMins) } }
            .getOrDefault(emptyList())
        loading = false
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 24.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Wp8PaneTitle("路線圖", Modifier.weight(1f))
            Wp8Seg(listOf("港鐵", "輕鐵"), mode) { mode = it }
        }

        if (mode == 0) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                lines.forEachIndexed { i, code ->
                    Wp8Chip(StaticData.mtrLines[code] ?: code, i == lineIdx) { lineIdx = i }
                }
            }
            if (loading) Wp8Empty("載入中…")
            rows.forEach { r ->
                Wp8Row(
                    no = r.code,
                    name = r.name,
                    sub = buildString {
                        append("上行 ").append(etaText(r.upMins))
                        append("  ·  下行 ").append(etaText(r.downMins))
                    },
                    eta = "",
                ) {
                    onOpenDetail(
                        SearchItem(
                            kind = Kind.MTR, no = "MTR", name = r.name,
                            stationCode = r.code, stationName = r.name,
                        )
                    )
                }
            }
        } else {
            MtrRepo.lrtGroups().forEach { (group, list) ->
                Wp8SectionTitle(group)
                list.forEach { s ->
                    Wp8Row(
                        no = "${s.id}",
                        name = s.name,
                        sub = "輕鐵站",
                        eta = "看班次 ›",
                        onClick = {
                            onOpenDetail(
                                SearchItem(
                                    kind = Kind.LRT, no = "輕鐵", name = s.name, cap = "輕鐵",
                                    stationCode = "${s.id}", stationName = s.name,
                                )
                            )
                        },
                    )
                }
            }
        }
    }
}

private data class MtrRepoRow(val code: String, val name: String, val upMins: Int?, val downMins: Int?)

/* ==================================================================
   設定（Metro 設定列表）
   ================================================================== */

@Composable
fun Wp8SettingsPane(
    settings: Settings,
    onSettings: (Settings) -> Unit,
    onOpenGallery: () -> Unit,
) {
    val ctx = LocalContext.current
    var crashCount by remember { mutableIntStateOf(CrashLog.count(ctx)) }
    var logText by remember { mutableStateOf<String?>(null) }
    var safeMode by remember { mutableStateOf(CrashGuard.isSafeMode(ctx)) }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 24.dp),
    ) {
        Wp8PaneTitle("設定")

        Wp8SectionTitle("外觀")
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("主題", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Seg(listOf("深色", "淺色"), if (settings.theme == "light") 1 else 0) {
                onSettings(settings.copy(theme = if (it == 1) "light" else "dark"))
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("強調色", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Wp8.Accents.forEachIndexed { i, (v, name) ->
                    val on = Wp8.accentIndex == i
                    Box(
                        Modifier
                            .background(Color(v))
                            .clickable { Wp8.accentIndex = i; onSettings(settings.copy(accent = v)) }
                            .padding(horizontal = 10.dp, vertical = 5.dp),
                    ) {
                        Text(
                            name,
                            color = if (on) Color.White else Color.White.copy(alpha = 0.8f),
                            fontSize = 12.sp,
                            fontWeight = if (on) FontWeight.Medium else FontWeight.Normal,
                        )
                    }
                }
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("字體大小", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8FontSizeRow(settings.fontLevel) { onSettings(settings.copy(fontLevel = it)) }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("高對比", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Seg(listOf("開", "關"), if (settings.contrast) 0 else 1) {
                onSettings(settings.copy(contrast = it == 0))
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Wp8SectionTitle("行為")
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("減少動畫", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Seg(listOf("開", "關"), if (settings.fx == "off") 0 else 1) {
                onSettings(settings.copy(fx = if (it == 0) "off" else "full"))
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("自動重新整理", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Seg(listOf("15s", "30s", "60s", "關"), when (settings.refresh) {
                15 -> 0; 30 -> 1; 60 -> 2; else -> 3
            }) {
                onSettings(settings.copy(refresh = listOf(15, 30, 60, 0)[it]))
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Wp8SectionTitle("診斷")
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("安全模式", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Seg(listOf("開", "關"), if (safeMode) 0 else 1) {
                CrashGuard.setSafeMode(ctx, it == 0)
                safeMode = it == 0
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Wp8LinkRow(
            "崩潰日誌",
            if (crashCount > 0) "$crashCount 份" else "暫無",
        ) {
            if (crashCount > 0) {
                logText = CrashLog.latestText(ctx) ?: "（讀取失敗）"
            }
        }
        logText?.let { text ->
            Text(
                text.take(1200),
                color = Wp8.Text2,
                fontSize = 11.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .verticalScroll(rememberScrollState())
                    .padding(vertical = 6.dp),
            )
            Wp8Chip("清除日誌", false) {
                CrashLog.clear(ctx)
                crashCount = 0
                logText = null
            }
        }

        Wp8SectionTitle("關於")
        Wp8LinkRow("介面規範", "WP7 / WP8 元件畫廊", onOpenGallery)
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp)) {
            Text("資料來源", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Text("data.gov.hk", color = Wp8.Text1, fontSize = 15.sp)
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp)) {
            Text("版本", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Text("3.2.0 · WP8", color = Wp8.Text1, fontSize = 15.sp)
        }
    }
}

/* ---------- 共用：ETA 文案與顏色 ---------- */

internal fun etaText(mins: Int?): String = when {
    mins == null -> "—"
    mins <= 0 -> "即將"
    else -> "$mins 分"
}

internal fun etaColor(mins: Int?): Color = when {
    mins == null -> Wp8.Text2
    mins <= 2 -> Wp8.Soon
    mins <= 10 -> Wp8.Medium
    else -> Wp8.Text1
}
