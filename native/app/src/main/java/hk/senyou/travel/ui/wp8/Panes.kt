package hk.senyou.travel.ui.wp8

import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.heightIn
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
import hk.senyou.travel.data.AlarmRepo
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
import hk.senyou.travel.data.StopRow
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.Sushiro
import hk.senyou.travel.data.SushiroStore
import hk.senyou.travel.data.Weather
import hk.senyou.travel.data.displayName
import hk.senyou.travel.data.matchKey
import hk.senyou.travel.data.toFav
import hk.senyou.travel.ui.LocalAdaptive
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/** 搜尋模式（順序 = 模式選擇器的順序；"overnight" = 通宵路線） */
private val MODES = listOf(
    "bus" to "公交", "mtrbus" to "港鐵巴士", "mtr" to "港鐵", "lrt" to "輕鐵", "overnight" to "通宵",
)

/* ==================================================================
   首頁全景（Panorama）：面板 1 磁貼牆 / 面板 2 搜尋 / 面板 3 天氣 + K75P
   ================================================================== */

@Composable
fun Wp8HomePane(
    refreshSec: Int,
    refreshTick: Int,
    settings: Settings,
    onSettings: (Settings) -> Unit,
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

    // 週期刷新（磁貼數據）；釘選變更時重啟迴圈，令磁貼立即改用新釘選
    LaunchedEffect(refreshSec, refreshTick, settings.pinnedFav) {
        if (DebugFlags.staticUi || refreshSec <= 0) {
            weather = runCatching { Hko.fetch(prefer = settings.weatherPlace) }.getOrNull()
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
                weather = Hko.fetch(prefer = settings.weatherPlace)
                val first = favs.firstOrNull { it.key == settings.pinnedFav } ?: favs.firstOrNull()
                favEta = first?.let { SearchRepo.favEta(it) }
                updated = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault())
                    .format(java.util.Date())
            }
            delay(refreshSec * 1000L)
        }
    }

    // 首頁磁貼的「收藏 · 下一班」：釘選優先，否則第一條
    val homeFav = favs.firstOrNull { it.key == settings.pinnedFav } ?: favs.firstOrNull()

    val expanded = LocalAdaptive.current.isExpanded
    if (expanded) {
        // 大屏（摺疊機內屏 / 平板）：概念圖規範「首頁全景同屏並列兩塊面板」
        Row(Modifier.fillMaxSize()) {
            PaneScroll(Modifier.weight(1f).fillMaxHeight()) {
                TilesPanel(
                    favCount = favs.size,
                    favEta = favEta,
                    favName = homeFav?.displayName() ?: "",
                    weather = weather,
                    k75pMins = k75pMins,
                    k75pLive = k75pLive,
                    tileLayout = settings.tileLayout,
                    settings = settings,
                    onSettings = onSettings,
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
                            favName = homeFav?.displayName() ?: "",
                            weather = weather,
                            k75pMins = k75pMins,
                            k75pLive = k75pLive,
                            tileLayout = settings.tileLayout,
                            settings = settings,
                            onSettings = onSettings,
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

/** 首頁磁貼定義（key 作為版面持久化鍵；span = 佔幾格，4 格制） */
@Composable
private fun tileItems(
    favCount: Int,
    favEta: Int?,
    favName: String,
    weather: Weather?,
    k75pMins: Int?,
    k75pLive: Int,
    weatherFlipped: Boolean,
    onFlipWeather: () -> Unit,
    onOpenK75P: () -> Unit,
    onGoPane: (Int) -> Unit,
): List<TileItem> = listOf(
    TileItem("favs", 2) { m ->
        Wp8Tile(m, Wp8.TileCobalt, "我的收藏", value = "$favCount", trailing = "條", sub = "點按查看全部", badge = if (favCount > 0) "$favCount" else null) { onGoPane(1) }
    },
    TileItem("sushi", 2) { m ->
        Wp8Tile(m, Wp8.TileMagenta, "壽司郎", sub = "即時排隊組數") { onGoPane(2) }
    },
    TileItem("weather", 4) { m ->
        Wp8Tile(
            m, Wp8.TileTeal,
            title = weather?.place?.takeIf { it.isNotBlank() }?.let { "天氣 · $it" } ?: "天氣",
            value = weather?.temp?.let { "$it°" } ?: "—",
            sub = weather?.desc ?: "載入中…",
            // 天氣圖示為彩色 emoji，WP8 一律改用文字描述（desc），磁貼背面只留日期與溫度
            back = weather?.days?.take(3)?.joinToString("\n") { d -> "${d.label} ${d.min ?: "-"}~${d.max ?: "-"}°" } ?: "載入中…",
            flipped = weatherFlipped,
            onClick = onFlipWeather,
        )
    },
    TileItem("k75p", 4) { m ->
        Wp8Tile(
            m, Wp8.TileCyan,
            title = "K75P · 天瑞 ↺ 洪水橋",
            value = k75pMins?.let { if (it <= 0) "即將" else "$it" } ?: "—",
            trailing = if (k75pMins != null && k75pMins > 0) "分" else "",
            sub = "實時 $k75pLive 班在路",
            badge = if (k75pLive > 0) "$k75pLive" else null,
            onClick = onOpenK75P,
        )
    },
    TileItem("favlive", 4) { m ->
        Wp8Tile(
            m, Wp8.TileCyan,
            title = if (favName.isBlank()) "收藏 · 下一班" else "收藏 · $favName",
            value = favEta?.let { if (it <= 0) "即將" else "$it" } ?: "—",
            trailing = if (favEta != null && favEta > 0) "分" else "",
            sub = if (favName.isBlank()) "暫無收藏" else "下一班",
        ) { onGoPane(1) }
    },
    TileItem("map", 1) { m ->
        Wp8Tile(m, Wp8.TileCyan, title = "路線圖", sub = "全線候車") { onGoPane(3) }
    },
    TileItem("settings", 1) { m ->
        Wp8Tile(m, Wp8.TileTeal, title = "設定", sub = "主題 · 強調色") { onGoPane(4) }
    },
)

@Composable
private fun TilesPanel(
    favCount: Int,
    favEta: Int?,
    favName: String,
    weather: Weather?,
    k75pMins: Int?,
    k75pLive: Int,
    tileLayout: String,
    settings: Settings,
    onSettings: (Settings) -> Unit,
    onOpenK75P: () -> Unit,
    onGoPane: (Int) -> Unit,
) {
    var weatherFlipped by remember { mutableStateOf(false) }
    // WP8 開始畫面編輯模式（長按磁貼進入）
    var editMode by remember { mutableStateOf(false) }
    // WP8 語意縮放：捏合縮小 → 列出分組標題；雙擊亦可切換（便於無觸控/測試）
    var zoomedOut by remember { mutableStateOf(false) }
    val zoomScale by androidx.compose.animation.core.animateFloatAsState(
        if (zoomedOut) 0.55f else 1f,
        androidx.compose.animation.core.tween(280, easing = Wp8.Ease),
        label = "semanticZoom",
    )
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            while (true) {
                delay(6000)
                weatherFlipped = !weatherFlipped
            }
        }
    }
    Box(
        Modifier
            .fillMaxWidth()
            .pointerInput(Unit) {
                detectTransformGestures { _, _, zoom, _ ->
                    if (zoom < 0.88f) zoomedOut = true
                    else if (zoom > 1.12f) zoomedOut = false
                }
            }
            .pointerInput(Unit) {
                detectTapGestures(
                    onDoubleTap = { zoomedOut = !zoomedOut },
                    // 長按進入磁貼編輯模式（WP8 開始畫面）
                    onLongPress = { editMode = true },
                    onTap = { if (editMode) editMode = false },
                )
            },
    ) {
    Column(
        Modifier
            .fillMaxWidth()
            .graphicsLayer {
                scaleX = zoomScale
                scaleY = zoomScale
                transformOrigin = androidx.compose.ui.graphics.TransformOrigin(0f, 0f)
                alpha = if (zoomedOut) 0.28f else 1f
            },
    ) {
        Spacer(Modifier.height(10.dp))
        val tileDefaults = tileItems(
            favCount = favCount, favEta = favEta, favName = favName, weather = weather,
            k75pMins = k75pMins, k75pLive = k75pLive, weatherFlipped = weatherFlipped,
            onFlipWeather = { weatherFlipped = !weatherFlipped },
            onOpenK75P = onOpenK75P, onGoPane = onGoPane,
        )
        val tileOrder = parseTileLayout(tileLayout, tileDefaults)
        Wp8TileWall(
            items = tileDefaults,
            layout = tileOrder,
            editMode = editMode,
            onCycleSize = { key ->
                val next = tileOrder.map { (k, s) ->
                    if (k != key) k to s else k to when (s) { 1 -> 2; 2 -> 4; else -> 1 }
                }
                onSettings(settings.copy(tileLayout = serializeTileLayout(next)))
            },
            onMove = { key, dir ->
                val cur = tileOrder.toMutableList()
                val i = cur.indexOfFirst { it.first == key }
                val j = i + dir
                if (i >= 0 && j in cur.indices) { val t = cur[i]; cur[i] = cur[j]; cur[j] = t }
                onSettings(settings.copy(tileLayout = serializeTileLayout(cur)))
            },
        )
        // 語意縮放：分組標題層（蓋在縮小的磁貼牆上）
        if (zoomedOut) {
            Wp8SemanticZoomOverlay(
                groups = listOf("交通", "生活", "系統"),
                onPick = { zoomedOut = false },
            )
        }
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
    val appSettings by Store.settings(ctx).collectAsStateWithLifecycle(initialValue = Settings())
    var aiQuery by remember { mutableStateOf("") }
    var aiReply by remember { mutableStateOf("") }
    var aiOptions by remember { mutableStateOf<List<hk.senyou.travel.data.AiOption>>(emptyList()) }
    var aiError by remember { mutableStateOf<String?>(null) }
    var aiLoading by remember { mutableStateOf(false) }
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())

    Wp8ReportBusy(searching)

    /** 手動搜尋與 AI 建議共用同一條查詢流程（AI 只是代填關鍵字與模式） */
    val runSearch: suspend (String, String) -> Unit = { q, m ->
        if (q.isBlank()) {
            items = emptyList()
            searching = false
        } else {
            searching = true
            runCatching {
                val base = SearchRepo.search(q, m)
                items = SearchRepo.fillEtas(base)
                if (base.isNotEmpty()) Store.pushRecent(ctx, q)
            }
            searching = false
        }
    }

    LaunchedEffect(query, mode) {
        if (query.isBlank()) { items = emptyList(); searching = false; return@LaunchedEffect }
        delay(320)
        runSearch(query, MODES[mode].first)
    }

    Column(Modifier.fillMaxWidth()) {
        Spacer(Modifier.height(10.dp))
        Wp8SectionTitle("AI 建議 · MiMo v2.5")
        Wp8Input(aiQuery, "用一句話問，例如「天水圍去銅鑼灣，唔想搭地鐵」") { aiQuery = it }
        Spacer(Modifier.height(Wp8.Gap))
        PaneGhostButton(if (aiLoading) "思考中…" else "問 AI") {
            if (aiQuery.isNotBlank() && !aiLoading) {
                scope.launch {
                    aiLoading = true
                    aiError = null
                    val r = runCatching { hk.senyou.travel.data.AiRepo.ask(aiQuery, appSettings) }.getOrNull()
                    aiReply = r?.reply ?: ""
                    aiOptions = r?.options ?: emptyList()
                    aiError = r?.error
                    aiLoading = false
                }
            }
        }
        if (aiLoading) Wp8LoadingDots("MiMo 思考中")
        aiError?.let { Text(it, color = Wp8.Soon, fontSize = 12.sp, lineHeight = 18.sp, modifier = Modifier.padding(vertical = 6.dp)) }
        if (aiReply.isNotBlank()) {
            Text(aiReply, color = Wp8.Text1, fontSize = 14.sp, lineHeight = 20.sp, modifier = Modifier.padding(vertical = 8.dp))
        }
        aiOptions.forEach { o ->
            Wp8Row(
                no = o.keyword,
                name = o.why.ifBlank { "點按用本機資料查班次" },
                sub = when (o.mode) {
                    "mtr" -> "港鐵車站"
                    "lrt" -> "輕鐵站"
                    "mrtbus" -> "港鐵巴士"
                    else -> "巴士路線"
                },
                eta = "查班次 ›",
                etaColor = Wp8.Accent,
            ) {
                query = o.keyword
                mode = when (o.mode) { "mtr" -> 2; "lrt" -> 3; "mrtbus" -> 1; else -> 0 }
            }
        }
        Spacer(Modifier.height(24.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Wp8SectionTitle("手動搜尋")
        Wp8Input(query, "輸入巴士路線、站名或港鐵車站") { query = it }
        Spacer(Modifier.height(Wp8.Gap))
        Row(
            Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            MODES.forEachIndexed { i, (_, label) -> Wp8Chip(label, i == mode) { mode = i } }
        }
        Spacer(Modifier.height(Wp8.Gap))
        Wp8PrimaryButton(if (searching) "搜尋中…" else "搜尋") {
            scope.launch { runSearch(query, MODES[mode].first) }
        }

        if (query.isBlank() && recent.isNotEmpty()) {
            Wp8SectionTitle("最近搜尋")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                recent.take(5).forEach { q -> Wp8Chip(q, false) { query = q } }
            }
        }

        if (query.isNotBlank()) {
            Wp8SectionTitle(if (items.isEmpty() && !searching) "沒有結果" else "搜尋結果")
        }
        items.forEachIndexed { idx, it ->
            // 分組標題：只在連續結果換組時出現；group 空白 = 不顯示
            val group = it.group
            if (group.isNotBlank() && group != items.getOrNull(idx - 1)?.group.orEmpty()) {
                Wp8SectionTitle(group)
            }
            val starred = favs.any { f -> f.matchKey() == it.matchKey() }
            Wp8Row(
                no = it.no.take(4),
                name = it.name,
                sub = it.cap.ifBlank { "實時到站" },
                eta = etaText(it.etaMins),
                etaColor = etaColor(it.etaMins),
                star = starred,
                index = idx,
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
                    // 不再輸出彩色 emoji；天氣描述一律走下方 cap 的中文 desc
                    append(w.temp?.let { "$it°" } ?: "—")
                    if (w.humid != null) append("  濕度 ${w.humid}%")
                    if (w.uv != null) append("  UV ${w.uv}")
                }
            } ?: "載入中…",
                cap = weather?.let { w ->
                    listOfNotNull(
                        w.place.takeIf { it.isNotBlank() },
                        w.desc.takeIf { it.isNotBlank() },
                        if (updated.isNotBlank()) "更新 $updated" else null,
                    ).joinToString(" · ")
                } ?: "",
            )
        if (weather != null && weather.days.isNotEmpty()) {
            Wp8SectionTitle("未來三天")
            weather.days.take(3).forEach { d ->
                Wp8Row(
                    // 原本放彩色 emoji，改用日期（中性文字）；無日期則用「·」
                    no = d.date.ifBlank { "·" },
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
    val cfg by Store.settings(ctx).collectAsStateWithLifecycle(initialValue = Settings())
    var etas by remember { mutableStateOf<Map<String, Int?>>(emptyMap()) }
    // 「換站」：正在展開站表的收藏 key + 該路線站表
    var stopsFor by remember { mutableStateOf<String?>(null) }
    var stops by remember { mutableStateOf<List<StopRow>>(emptyList()) }
    var stopsLoading by remember { mutableStateOf(false) }

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

    /** 釘選切換：重新讀取設定再寫入，避免覆蓋同時改動的其他欄位 */
    val togglePin: (Fav) -> Unit = { f ->
        scope.launch {
            val cur = runCatching { Store.settings(ctx).first() }.getOrDefault(cfg)
            Store.save(ctx, cur.copy(pinnedFav = if (cur.pinnedFav == f.key) "" else f.key))
        }
    }

    /** 排序：以「上移／下移」調整收藏順序（W10M 編輯模式作法，取代 iOS 式長按拖拽），立即持久化 */
    val moveFav: (Int, Int) -> Unit = { from, to ->
        scope.launch {
            val list = favs.toMutableList()
            if (from in list.indices && to in list.indices) {
                val moved = list.removeAt(from)
                list.add(to, moved)
                Store.saveFavorites(ctx, list)
            }
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
        favs.forEachIndexed { i, f ->
            // 公司分組標題（SearchRepo.favGroup 原本沒有呼叫端）
            val group = SearchRepo.favGroup(f)
            if (i == 0 || group != SearchRepo.favGroup(favs[i - 1])) {
                Wp8SectionTitle(favGroupTitle(group))
            }
            FavBlock(
                fav = f,
                mins = etas[f.key] ?: Cache.etaCache(f.key)?.first,
                stale = etas[f.key] == null && Cache.etaCache(f.key) != null,
                cachedAt = Cache.etaCache(f.key)?.second ?: 0L,
                pinned = cfg.pinnedFav == f.key,
                stopsOpen = stopsFor == f.key,
                stopsLoading = stopsLoading && stopsFor == f.key,
                stops = if (stopsFor == f.key) stops else emptyList(),
                onOpen = { onOpenDetail(SearchRepo.favToSearchItem(f)) },
                onPin = { togglePin(f) },
                onMoveUp = if (i > 0) ({ moveFav(i, i - 1) }) else null,
                onMoveDown = if (i < favs.size - 1) ({ moveFav(i, i + 1) }) else null,
                onChangeStop = {
                    if (stopsFor == f.key) {
                        stopsFor = null
                        stops = emptyList()
                    } else {
                        stopsFor = f.key
                        val local = f.localStationChoices()
                        if (local != null) {
                            // 港鐵 / 輕鐵：站表在本機（StaticData），即時展開
                            stops = local
                            stopsLoading = false
                        } else {
                            stops = emptyList()
                            stopsLoading = true
                            scope.launch {
                                stops = runCatching {
                                    SearchRepo.routeStops(f.route, f.favKind(), f.dir, f.routeId)
                                }.getOrDefault(emptyList())
                                stopsLoading = false
                            }
                        }
                    }
                },
                onPickStop = { row ->
                    val updated = when (f.type) {
                        "mtr" -> {
                            // 轉站後所屬綫路可能改變，標籤跟著更新（無資料則沿用原值）
                            val ln = StaticData.mtrLinesOf(row.stopId).firstOrNull()
                            f.copy(
                                stationCode = row.stopId,
                                stationName = row.name,
                                line = ln ?: f.line,
                                lineName = ln?.let { StaticData.mtrLines[it] }?.takeIf { it.isNotBlank() }
                                    ?: f.lineName,
                            )
                        }
                        "lrt" -> f.copy(stationCode = row.stopId, stationName = row.name, stopName = row.name)
                        else -> f.copy(stopId = row.stopId, stopName = row.name)
                    }
                    stopsFor = null
                    stops = emptyList()
                    scope.launch {
                        Store.saveFavorites(ctx, favs.map { if (it.key == f.key) updated else it })
                        // 站名變更會改變 Fav.key，釘選要跟著搬
                        val cur = runCatching { Store.settings(ctx).first() }.getOrDefault(cfg)
                        if (cur.pinnedFav == f.key) Store.save(ctx, cur.copy(pinnedFav = updated.key))
                    }
                },
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
    pinned: Boolean,
    stopsOpen: Boolean,
    stopsLoading: Boolean,
    stops: List<StopRow>,
    onOpen: () -> Unit,
    onPin: () -> Unit,
    onChangeStop: () -> Unit,
    onPickStop: (StopRow) -> Unit,
    onMoveUp: (() -> Unit)? = null,
    onMoveDown: (() -> Unit)? = null,
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
                    if (fav.alertMins > 0) "提示 ${fav.alertMins} 分" else "提示 關",
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
        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Wp8Chip(if (pinned) "已釘選" else "釘選", pinned) { onPin() }
            // 港鐵巴士收藏代表整條路線，沒有「換站」概念
            if (fav.type != "mtrbus") {
                Wp8Chip(if (stopsOpen) "收起站表" else "換站", stopsOpen) { onChangeStop() }
                if (onMoveUp != null) Wp8Chip("上移", false) { onMoveUp() }
                if (onMoveDown != null) Wp8Chip("下移", false) { onMoveDown() }
            }
        }
        // 換站：內嵌站表（巴士走 SearchRepo.routeStops，港鐵／輕鐵走 StaticData 站表）
        if (stopsOpen) {
            Spacer(Modifier.height(8.dp))
            when {
                stopsLoading -> Wp8LoadingDots("載入站表")
                stops.isEmpty() -> Text("暫無站表資料", color = Wp8.Text2, fontSize = 12.sp)
                else -> stops.take(60).forEachIndexed { i, s ->
                    Wp8Row(
                        no = s.seq.toString(),
                        name = s.name,
                        sub = if (s.stopId == fav.currentStopId()) "目前選用" else "",
                        eta = s.mins?.let { etaText(it) } ?: "",
                        etaColor = etaColor(s.mins),
                        index = i,
                    ) { onPickStop(s) }
                }
            }
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

    Wp8ReportBusy(loading)

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
        if (loading) Wp8LoadingDots("載入中")
        else if (shown.isEmpty()) Wp8Empty("暫無資料")
        shown.forEachIndexed { idx, s ->
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
                index = idx,
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

    Wp8ReportBusy(loading)

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
            if (loading) Wp8LoadingDots("載入中")
            rows.forEachIndexed { idx, r ->
                Wp8Row(
                    no = r.code,
                    name = r.name,
                    sub = buildString {
                        append("上行 ").append(etaText(r.upMins))
                        append("  ·  下行 ").append(etaText(r.downMins))
                    },
                    eta = "",
                    index = idx,
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
                list.forEachIndexed { idx, s ->
                    Wp8Row(
                        no = "${s.id}",
                        name = s.name,
                        sub = "輕鐵站",
                        eta = "看班次 ›",
                        index = idx,
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
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    var exported by remember { mutableStateOf(false) }
    // 版本號取自 PackageManager（讀取失敗退回「—」，不因查詢失敗崩潰）
    val versionName = remember(ctx) {
        runCatching { ctx.packageManager.getPackageInfo(ctx.packageName, 0) }.getOrNull()
            ?.versionName?.takeIf { it.isNotBlank() } ?: "—"
    }

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
            Wp8Toggle(settings.contrast, if (settings.contrast) "開" else "關") {
                onSettings(settings.copy(contrast = it))
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Wp8SectionTitle("天氣")
        Text("顯示哪個實測站（香港天文台）", color = Wp8.Text2, fontSize = 12.sp, lineHeight = 18.sp)
        Spacer(Modifier.height(8.dp))
        val places = remember {
            listOf(
                "天水圍", "元朗公園", "屯門", "荃灣城門谷", "沙田", "大埔", "上水", "西貢",
                "將軍澳", "觀塘", "黃大仙", "九龍城", "深水埗", "香港公園", "跑馬地", "赤鱲角", "長洲", "山頂",
            )
        }
        Row(
            Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            places.forEach { p ->
                Wp8Chip(p, settings.weatherPlace == p) { onSettings(settings.copy(weatherPlace = p)) }
            }
        }
        Spacer(Modifier.height(14.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Wp8SectionTitle("鬧鐘")
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("待機鬧鐘", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Toggle(settings.alarmOn, if (settings.alarmOn) "開" else "關") { on ->
                onSettings(settings.copy(alarmOn = on))
                if (on) AlarmRepo.schedule(ctx, settings.alarmHour, settings.alarmMinute)
                else AlarmRepo.cancel(ctx)
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(
                if (settings.alarmOn)
                    "響鈴時間 ${String.format(java.util.Locale.getDefault(), "%02d:%02d", settings.alarmHour, settings.alarmMinute)}（每天）"
                else "鬧鐘已關閉",
                color = Wp8.Text2,
                fontSize = 14.sp,
                modifier = Modifier.weight(1f),
            )
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        if (!AlarmRepo.canScheduleExact(ctx)) {
            /* 系統未授權精確鬧鐘（API 31+）：提供一鍵前往設定，否則排程會退化为不精確 */
            Wp8LinkRow("允許精確鬧鐘", "系統尚未授權") { AlarmRepo.requestExactPermission(ctx) }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        }
        Wp8LinkRow("開啟待機鬧鐘畫面", "調整時間與響鈴") {
            ctx.startActivity(
                android.content.Intent(ctx, hk.senyou.travel.ui.StandbyActivity::class.java),
            )
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Wp8SectionTitle("行為")
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("折起立放進入待機顯示", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Toggle(settings.standbyAuto, if (settings.standbyAuto) "開" else "關") {
                onSettings(settings.copy(standbyAuto = it))
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("減少動畫", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Toggle(settings.fx != "off", if (settings.fx != "off") "開" else "關") {
                onSettings(settings.copy(fx = if (it) "full" else "off"))
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

        Wp8SectionTitle("收藏")
        Wp8LinkRow(
            "匯出收藏",
            when {
                exported -> "已複製"
                favs.isEmpty() -> "暫無"
                else -> "${favs.size} 條"
            },
        ) {
            val text = buildString {
                append("森友出行 收藏（").append(favs.size.toString()).append(" 條）")
                favs.forEach { f -> append('\n').append(f.exportLine()) }
            }
            val cm = ctx.getSystemService(android.content.Context.CLIPBOARD_SERVICE)
                as? android.content.ClipboardManager
            if (cm != null) {
                runCatching { cm.setPrimaryClip(android.content.ClipData.newPlainText("森友出行 收藏", text)) }
                exported = true
            }
        }

        Wp8SectionTitle("AI 建議（MiMo v2.5）")
        Text("API 金鑰僅儲存在本機，不會上傳。留空則停用 AI 建議。", color = Wp8.Text2, fontSize = 12.sp, lineHeight = 18.sp)
        Spacer(Modifier.height(8.dp))
        Wp8Input(settings.aiKey, "API 金鑰（api-key / Bearer）") { onSettings(settings.copy(aiKey = it)) }
        Spacer(Modifier.height(8.dp))
        Wp8Input(settings.aiBase, "API 位址") { onSettings(settings.copy(aiBase = it)) }
        Spacer(Modifier.height(8.dp))
        Wp8Input(settings.aiModel, "模型名稱") { onSettings(settings.copy(aiModel = it)) }
        Spacer(Modifier.height(14.dp))

        Wp8SectionTitle("診斷")
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("安全模式", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Toggle(safeMode, if (safeMode) "開" else "關") {
                CrashGuard.setSafeMode(ctx, it)
                safeMode = it
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
            /* 設計參考畫面：僅 debug 建置可見（上市版本不暴露開發者內容） */
            if (hk.senyou.travel.BuildConfig.DEBUG) {
                Wp8LinkRow("介面規範", "WP8 元件畫廊 · 動效演示", onOpenGallery)
            }
            Row(Modifier.fillMaxWidth().padding(vertical = 11.dp)) {
                Text("地圖資料", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
                Text("© OpenStreetMap contributors", color = Wp8.Text1, fontSize = 14.sp)
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
            Row(Modifier.fillMaxWidth().padding(vertical = 11.dp)) {
                Text("天氣資料", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
                Text("香港天文台（HKO）", color = Wp8.Text1, fontSize = 14.sp)
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
            Row(Modifier.fillMaxWidth().padding(vertical = 11.dp)) {
                Text("授權", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
                Text("data.gov.hk 開放數據", color = Wp8.Text1, fontSize = 14.sp)
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp)) {
            Text("資料來源", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Text("data.gov.hk", color = Wp8.Text1, fontSize = 15.sp)
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Row(Modifier.fillMaxWidth().padding(vertical = 11.dp)) {
            Text("版本", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Text("$versionName · Windows 10 Mobile", color = Wp8.Text1, fontSize = 14.sp)
        }
    }
}

/* ---------- 共用：收藏分組 / 匯出 / 次要按鈕 ---------- */

/** SearchRepo.favGroup 代碼 → 顯示用分組標題 */
private fun favGroupTitle(group: String): String = when (group) {
    "kmb" -> "九巴"
    "ctb" -> "城巴"
    "nlb" -> "嶼巴"
    "mtrbus" -> "港鐵巴士"
    "mtr" -> "港鐵"
    "lrt" -> "輕鐵"
    else -> "其他"
}

/** 收藏 → SearchRepo.routeStops 需要的公司分流（mtr / lrt 無站表） */
private fun Fav.favKind(): Kind = if (type == "mtrbus") Kind.MTRBUS else when (company) {
    "ctb" -> Kind.CTB
    "nlb" -> Kind.NLB
    else -> Kind.KMB
}

/** 目前選用的站碼（巴士用 stopId，港鐵／輕鐵用 stationCode） */
private fun Fav.currentStopId(): String? = if (type == "mtr" || type == "lrt") stationCode else stopId

/**
 * 免網絡的換站候選：港鐵 = 同綫各站，輕鐵 = 全部輕鐵站。
 * 巴士路線站表需查 API，回傳 null 交由呼叫端以 SearchRepo.routeStops 取得。
 */
private fun Fav.localStationChoices(): List<StopRow>? = when (type) {
    "mtr" -> StaticData.mtrLinesOf(stationCode.orEmpty())
        .flatMap { StaticData.mtrLineStops[it].orEmpty() }
        .distinctBy { it.code }
        .mapIndexed { i, st -> StopRow(i + 1, st.name, st.code, null) }
    "lrt" -> StaticData.lrtStations.entries.sortedBy { it.key }
        .mapIndexed { i, (id, name) -> StopRow(i + 1, name, id.toString(), null) }
    else -> null
}

/** 匯出用單行文案：公司路線 · 站名（重複欄位去重） */
private fun Fav.exportLine(): String {
    /* 以「子字串包含」去重：巴士站收藏的 favMeta 已是「九巴 · 天瑞總站」，
       若再附上 stopName 會出現「…天瑞總站 · 天瑞總站」 */
    val parts = mutableListOf<String>()
    for (raw in listOf(SearchRepo.favMeta(this), stopName, stationName)) {
        val s = raw.trim()
        if (s.isEmpty()) continue
        if (parts.any { it.contains(s) }) continue
        parts += s
    }
    return parts.joinToString(" · ")
}

/** WP 次要按鈕：細框透明底（與實心強調色主按鈕區分 AI / 手動兩條流程） */
@Composable
private fun PaneGhostButton(text: String, onClick: () -> Unit) {
    Box(
        Modifier
            .fillMaxWidth()
            .border(1.dp, Wp8.Accent)
            .clickable { onClick() }
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = Wp8.Accent, fontSize = 14.sp, letterSpacing = 1.sp)
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
