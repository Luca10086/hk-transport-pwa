package hk.senyou.travel.ui.wp8

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
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
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.Cache
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.Fav
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.displayName
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val PANES = listOf("start", "favourites", "routes", "settings")

/**
 * Windows Phone 8 風格演示（原生移植自 Web 版 `css/wp8-strict.css`）。
 *
 * 忠實還原：Pivot 橫滑分頁 + 48px Light 大標題、Live Tiles 磁貼牆（純色/直角/3D 翻面）、
 * Metro 下劃線輸入框、扁平列表行（強調色路線號 + 等寬數字 ETA）、
 * App Bar 裸字形按鈕、按下縮放不變色、詳情頁 rotateY(-12°) 3D 滑入。
 */
@Composable
fun Wp8DemoScreen(onClose: () -> Unit, startPage: Int = 0) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val status = WindowInsets.statusBars.asPaddingValues()
    val nav = WindowInsets.navigationBars.asPaddingValues()
    val pager = rememberPagerState(initialPage = startPage.coerceIn(0, PANES.size - 1), pageCount = { PANES.size })

    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    var weatherTemp by remember { mutableStateOf<Int?>(null) }
    var weatherDesc by remember { mutableStateOf("載入中…") }
    var query by remember { mutableStateOf("") }
    var mode by remember { mutableIntStateOf(0) }
    var results by remember { mutableStateOf<List<hk.senyou.travel.data.SearchItem>>(emptyList()) }
    var searching by remember { mutableStateOf(false) }
    var detailOpen by remember { mutableStateOf(false) }
    var detailTitle by remember { mutableStateOf("") }
    var detailSub by remember { mutableStateOf("") }
    var weatherFlipped by remember { mutableStateOf(false) }
    val modes = listOf("公交", "港鐵巴士", "港鐵", "輕鐵")

    // 天氣（失敗不影響演示）
    LaunchedEffect(Unit) {
        if (DebugFlags.staticUi) { weatherTemp = 24; weatherDesc = "多雲 · 濕度 78%"; return@LaunchedEffect }
        runCatching {
            val w = Hko.fetch()
            weatherTemp = w.temp
            weatherDesc = if (w.temp == null) "暫無資料" else w.desc.ifBlank { "香港天文台" }
        }
    }
    // 磁貼翻面演示（WP Live Tile 招牌動效）
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            while (true) {
                delay(6000)
                weatherFlipped = !weatherFlipped
            }
        }
    }
    // 搜尋
    LaunchedEffect(query, mode) {
        if (query.isBlank()) { results = emptyList(); searching = false; return@LaunchedEffect }
        delay(320)
        searching = true
        runCatching {
            val base = SearchRepo.search(query, listOf("bus", "mtrbus", "mtr", "lrt")[mode])
            results = SearchRepo.fillEtas(base)
        }
        searching = false
    }

    Box(Modifier.fillMaxSize().background(Wp8.Bg)) {
        Column(Modifier.fillMaxSize()) {
            /* ---------- 頂欄：Pivot 大標題（48px Light）+ 圓形操作 ---------- */
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(
                        start = Wp8.Gutter,
                        end = Wp8.Gutter,
                        top = status.calculateTopPadding() + 26.dp,
                        bottom = 14.dp,
                    ),
                verticalAlignment = Alignment.Bottom,
            ) {
                Text(
                    "‹",
                    color = Wp8.Text1,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Light,
                    modifier = Modifier.clickable { onClose() }.padding(end = 10.dp),
                )
                Text(
                    PANES[pager.currentPage],
                    color = Wp8.Text1,
                    fontSize = 46.sp,
                    fontWeight = FontWeight.Light,
                    fontFamily = FontFamily.SansSerif,
                    letterSpacing = (-0.5).sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Wp8CircleButton("⌕", "搜尋") { scope.launch { pager.animateScrollToPage(1) } }
                    Wp8CircleButton("↻", "重新整理") { }
                }
            }
            Wp8ProgressBar(searching)

            /* ---------- Pivot：橫滑分頁 ---------- */
            HorizontalPager(
                state = pager,
                modifier = Modifier.weight(1f),
                pageSpacing = 0.dp,
            ) { page ->
                when (page) {
                    0 -> StartPane(
                        favCount = favs.size,
                        weatherTemp = weatherTemp,
                        weatherDesc = weatherDesc,
                        weatherFlipped = weatherFlipped,
                        query = query,
                        onQuery = { query = it },
                        modes = modes,
                        mode = mode,
                        onMode = { mode = it },
                        results = results,
                        searching = searching,
                        onOpenDetail = { no, sub ->
                            detailTitle = no
                            detailSub = sub
                            detailOpen = true
                        },
                         onFlipWeather = { weatherFlipped = !weatherFlipped },
                    )
                    1 -> FavouritesPane(favs)
                    2 -> RoutesPane()
                    else -> SettingsPane()
                }
            }

            /* ---------- App Bar：裸字形圖標 ---------- */
            Row(
                Modifier
                    .fillMaxWidth()
                    .background(Wp8.Surface)
                    .padding(bottom = nav.calculateBottomPadding())
                    .heightIn(min = Wp8.AppBarH),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                PANES.forEachIndexed { i, _ ->
                    Wp8AppBarButton(
                        glyph = listOf("⌂", "♡", "⇄", "⚙")[i],
                        label = listOf("開始", "收藏", "路線", "設定")[i],
                        active = pager.currentPage == i,
                    ) { scope.launch { pager.animateScrollToPage(i) } }
                }
                Wp8AppBarButton("⋯", "更多", false) { }
            }
        }

        /* ---------- 詳情頁：WP 3D 滑入 ---------- */
        if (detailOpen) {
            Wp8DetailSheet(
                title = detailTitle,
                sub = detailSub,
                onClose = { detailOpen = false },
            )
        }
    }
}

/* ================= 開始畫面：磁貼牆 + 搜尋 + 列表 ================= */

@Composable
private fun StartPane(
    favCount: Int,
    weatherTemp: Int?,
    weatherDesc: String,
    weatherFlipped: Boolean,
    query: String,
    onQuery: (String) -> Unit,
    modes: List<String>,
    mode: Int,
    onMode: (Int) -> Unit,
    results: List<hk.senyou.travel.data.SearchItem>,
    searching: Boolean,
    onOpenDetail: (String, String) -> Unit,
    onFlipWeather: () -> Unit,
) {
    val scroll = rememberScrollState()
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(scroll)
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 40.dp),
    ) {
        /* --- Live Tiles 磁貼牆（WP8：小=1 格、中=2 格、寬=4 格） --- */
        Spacer(Modifier.height(20.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(Wp8.Gap)) {
            // 中磁貼：K75P 實時（2 格寬、172dp 高）
            Wp8Tile(
                modifier = Modifier.weight(2f).height(172.dp),
                color = Wp8.TileCobalt,
                value = Cache.k75pMins?.let { if (it <= 0) "即將" else "$it" } ?: "—",
                trailing = "分",
                title = "K75P 天瑞 ↺ 洪水橋",
                sub = "實時 ${Cache.k75pLive} 班在路",
                back = "K75P 循環線\n天瑞 → 洪水橋 → 天瑞\n每 20 秒更新實時位置",
                onClick = {},
            )
            // 右側兩個小磁貼
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(Wp8.Gap)) {
                Wp8Tile(
                    modifier = Modifier.fillMaxWidth().height(80.dp),
                    color = Wp8.TileCyan,
                    value = "$favCount",
                    trailing = "條",
                    title = "我的收藏",
                    onClick = {},
                )
                Wp8Tile(
                    modifier = Modifier.fillMaxWidth().height(80.dp),
                    color = Wp8.TileMagenta,
                    value = weatherTemp?.let { "$it°" } ?: "—",
                    title = "天氣 · 三天",
                    back = weatherDesc,
                    flipped = weatherFlipped,
                    onClick = onFlipWeather,
                )
            }
        }
        Spacer(Modifier.height(Wp8.Gap))
        // 寬磁貼（全寬、76dp）
        Wp8Tile(
            modifier = Modifier.fillMaxWidth().height(76.dp),
            color = Wp8.TileTeal,
            title = "路線圖 · 港鐵 + 輕鐵全線候車",
            sub = "點按進入 Metro 列表",
            onClick = {},
        )

        /* --- 搜尋區（Metro 下劃線輸入框） --- */
        Spacer(Modifier.height(18.dp))
        Wp8Input(value = query, placeholder = "輸入路線、站名或港鐵車站", onValueChange = onQuery)
        Spacer(Modifier.height(Wp8.Gap))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            modes.forEachIndexed { i, m -> Wp8Chip(m, i == mode) { onMode(i) } }
        }
        Spacer(Modifier.height(Wp8.Gap))
        Wp8PrimaryButton(if (searching) "搜尋中…" else "搜尋") { }

        /* --- 結果 / Metro 扁平列表 --- */
        if (results.isNotEmpty()) {
            Spacer(Modifier.height(8.dp))
            Wp8Group("搜尋結果")
            results.take(8).forEach { r ->
                val eta = r.etaMins
                Wp8Row(
                    no = r.no.take(4),
                    name = r.name,
                    sub = r.cap.ifBlank { "實時到站" },
                    eta = when {
                        eta == null -> "—"
                        eta <= 0 -> "即將"
                        else -> "$eta 分"
                    },
                    etaColor = when {
                        eta == null -> Wp8.Text2
                        eta <= 2 -> Wp8.Soon
                        eta <= 10 -> Wp8.Medium
                        else -> Wp8.Text1
                    },
                    star = false,
                    onStar = {},
                ) { onOpenDetail(r.no, r.name) }
            }
        } else {
            Spacer(Modifier.height(8.dp))
            Wp8Group("常用路線")
            SAMPLE_ROUTES.forEach { (no, name, sub, eta) ->
                Wp8Row(
                    no = no,
                    name = name,
                    sub = sub,
                    eta = eta,
                    etaColor = when {
                        eta == "即將" -> Wp8.Soon
                        eta.endsWith("分") && (eta.dropLast(2).toIntOrNull() ?: 99) <= 10 -> Wp8.Medium
                        else -> Wp8.Text1
                    },
                ) { onOpenDetail(no, name) }
            }
        }
    }
}

private val SAMPLE_ROUTES = listOf(
    Quad("69X", "天瑞 ↔ 高鐵西九龍站", "九巴 · 經天水圍站", "3 分"),
    Quad("969", "天水圍市中心 → 銅鑼灣", "城巴 · 經西隧", "8 分"),
    Quad("K75P", "天瑞 ↺ 洪水橋", "港鐵巴士 · 循環線", "即將"),
    Quad("268C", "朗屏站 → 觀塘碼頭", "九巴 · 經大老山", "14 分"),
    Quad("A37", "朗屏站 → 機場", "龍運 · 經港珠澳大橋", "22 分"),
)

private data class Quad(val a: String, val b: String, val c: String, val d: String)

/* ================= 收藏（WP8 卡片式扁平） ================= */

@Composable
private fun FavouritesPane(favs: List<Fav>) {
    val scroll = rememberScrollState()
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(scroll)
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 40.dp),
    ) {
        Spacer(Modifier.height(18.dp))
        if (favs.isEmpty()) {
            Text("尚未加入收藏", color = Wp8.Text1, fontSize = 22.sp, fontWeight = FontWeight.Light)
            Spacer(Modifier.height(8.dp))
            Text("在搜尋結果點 ☆ 加入，這裡會用 Live Tile 顯示下一班", color = Wp8.Text2, fontSize = 14.sp)
        } else {
            Wp8Group("我的收藏 · ${favs.size} 條")
            favs.forEach { f ->
                Column(Modifier.fillMaxWidth().padding(vertical = 15.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            f.displayName(),
                            color = Wp8.Accent,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Light,
                        )
                        Spacer(Modifier.width(10.dp))
                        Box(Modifier.border(1.dp, Wp8.Line).padding(horizontal = 8.dp, vertical = 1.dp)) {
                            Text(SearchRepo.favMeta(f), color = Wp8.Text2, fontSize = 11.sp)
                        }
                    }
                    Spacer(Modifier.height(9.dp))
                    Text(
                        Cache.etaCache(f.key)?.first?.let { if (it <= 0) "即將" else "$it 分鐘" } ?: "—",
                        color = Wp8.Text1,
                        fontSize = 35.sp,
                        fontWeight = FontWeight.Light,
                    )
                    if (f.stopName.isNotBlank()) {
                        Spacer(Modifier.height(3.dp))
                        Text(f.stopName, color = Wp8.Text2, fontSize = 12.sp, maxLines = 1)
                    }
                }
                Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
            }
        }
    }
}

/* ================= 路線圖（Metro 分組 + 扁平行） ================= */

@Composable
private fun RoutesPane() {
    val scroll = rememberScrollState()
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(scroll)
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 40.dp),
    ) {
        Spacer(Modifier.height(18.dp))
        listOf(
            "屯馬線" to listOf(
                Triple("天水圍", "上行 往屯門 · 1 號月台", "3 分"),
                Triple("天水圍", "下行 往烏溪沙 · 2 號月台", "6 分"),
                Triple("朗屏", "上行 往屯門 · 2 號月台", "9 分"),
            ),
            "輕鐵" to listOf(
                Triple("761P", "往天逸 · 1 號月台", "2 分"),
                Triple("706", "天水圍循環綫 · 1 號月台", "7 分"),
                Triple("705", "天水圍循環綫 · 2 號月台", "即將"),
            ),
            "港鐵巴士" to listOf(
                Triple("K75P", "天瑞 ↺ 洪水橋", "4 分"),
                Triple("K76", "天恆 → 天水圍站", "11 分"),
            ),
        ).forEach { (group, rows) ->
            Wp8Group(group)
            rows.forEach { (no, name, eta) ->
                Wp8Row(
                    no = no,
                    name = name,
                    eta = eta,
                    etaColor = when {
                        eta == "即將" -> Wp8.Soon
                        (eta.dropLast(2).toIntOrNull() ?: 99) <= 10 -> Wp8.Medium
                        else -> Wp8.Text1
                    },
                ) {}
            }
        }
    }
}

/* ================= 設定（Metro 設定列表） ================= */

@Composable
private fun SettingsPane() {
    val scroll = rememberScrollState()
    var theme by remember { mutableIntStateOf(if (Wp8.light) 1 else 0) }
    var motion by remember { mutableIntStateOf(0) }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(scroll)
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 40.dp),
    ) {
        Spacer(Modifier.height(18.dp))
        Wp8Group("外觀")
        Row(
            Modifier.fillMaxWidth().padding(vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("主題", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Seg(listOf("深色", "淺色"), theme) {
                theme = it
                Wp8.light = it == 1
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Row(
            Modifier.fillMaxWidth().padding(vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("強調色", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Wp8.Accents.forEachIndexed { i, (v, _) ->
                    Box(
                        Modifier
                            .size(if (Wp8.accentIndex == i) 34.dp else 30.dp)
                            .background(Color(v))
                            .clickable { Wp8.accentIndex = i },
                        contentAlignment = Alignment.Center,
                    ) { if (Wp8.accentIndex == i) Text("✓", color = Color.White, fontSize = 13.sp) }
                }
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Row(
            Modifier.fillMaxWidth().padding(vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("動效", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Seg(listOf("完整", "簡約", "關閉"), motion) { motion = it }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Wp8Group("WP8 元素對照")
        Wp8SettingRow("Pivot 標題", "46sp Light · lowercase")
        Wp8SettingRow("磁貼網格", "4 列 · 間距 12dp · 直角")
        Wp8SettingRow("App Bar", "62dp · 裸字形圖標")
        Wp8SettingRow("列表行", "1px 下分隔線 · 強調色路線號")
        Wp8SettingRow("按壓回饋", "縮放 0.96–0.98 · 不變色")
        Wp8SettingRow("頁面轉場", "rotateY(-12°) 3D 滑入")
        Spacer(Modifier.height(16.dp))
        Text(
            "以上數值逐項對應 Web 版 css/wp8-strict.css",
            color = Wp8.Text2,
            fontSize = 12.sp,
        )
    }
}

/* ================= 詳情頁：rotateY(-12°) 3D 滑入 ================= */

@Composable
private fun Wp8DetailSheet(title: String, sub: String, onClose: () -> Unit) {
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { shown = true }
    val t by animateFloatAsState(if (shown) 1f else 0f, tween(380, easing = Wp8.Ease), label = "sheet")
    val density = androidx.compose.ui.platform.LocalDensity.current.density
    val status = WindowInsets.statusBars.asPaddingValues()

    Box(
        Modifier
            .fillMaxSize()
            .background(Wp8.Bg)
            .graphicsLayer {
                rotationY = -12f * (1f - t)
                translationX = size.width * 0.26f * (1f - t)
                transformOrigin = androidx.compose.ui.graphics.TransformOrigin(0f, 0.5f)
                cameraDistance = 30f * density
            },
    ) {
        Column(Modifier.fillMaxSize()) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(start = 12.dp, end = 16.dp, top = status.calculateTopPadding() + 8.dp, bottom = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier.size(44.dp).clickable { onClose() },
                    contentAlignment = Alignment.Center,
                ) { Text("‹", color = Wp8.Text1, fontSize = 30.sp, fontWeight = FontWeight.Light) }
                Spacer(Modifier.width(6.dp))
                Column(Modifier.weight(1f)) {
                    Text(title, color = Wp8.Text1, fontSize = 24.sp, fontWeight = FontWeight.Light, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    if (sub.isNotBlank()) Text(sub, color = Wp8.Text2, fontSize = 12.sp, maxLines = 1)
                }
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
            Column(
                Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = Wp8.Gutter)
                    .padding(top = 8.dp, bottom = 40.dp),
            ) {
                SAMPLE_ROUTES.forEachIndexed { i, (no, name, cap, eta) ->
                    Row(
                        Modifier.fillMaxWidth().padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("${i + 1}", color = Wp8.Text2, fontSize = 13.sp, modifier = Modifier.width(30.dp))
                        Text(name, color = Wp8.Text1, fontSize = 15.sp, maxLines = 1, modifier = Modifier.weight(1f))
                        Text(
                            eta,
                            color = if (eta == "即將") Wp8.Soon else Wp8.Text1,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Light,
                        )
                    }
                    Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
                    if (i == 0) Spacer(Modifier.height(0.dp))
                }
            }
        }
    }
}
