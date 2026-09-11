package hk.senyou.travel.ui

import hk.senyou.travel.ui.wp8.Wp8PivotStrip

import androidx.compose.ui.input.nestedscroll.nestedScroll

import androidx.compose.ui.draw.clipToBounds

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
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
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.CrashGuard
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.data.Store
import hk.senyou.travel.ui.theme.SenyouTheme
import hk.senyou.travel.ui.wp8.Wp8
import hk.senyou.travel.ui.wp8.Wp8AppBarButton
import hk.senyou.travel.ui.wp8.Wp8CircleButton
import hk.senyou.travel.ui.wp8.Wp8DetailSheet
import hk.senyou.travel.ui.wp8.Wp8FavsPane
import hk.senyou.travel.ui.wp8.Wp8Gallery
import hk.senyou.travel.ui.wp8.Wp8HomePane
import hk.senyou.travel.ui.wp8.Wp8K75PPage
import hk.senyou.travel.ui.wp8.Wp8MapPane
import hk.senyou.travel.ui.wp8.Wp8MoreMenu
import hk.senyou.travel.ui.wp8.Wp8SettingsPane
import hk.senyou.travel.ui.wp8.Wp8SushiPane
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val PANE_KEYS = listOf("start", "favourites", "sushi", "routes", "settings")
private val PANE_LABELS = listOf("首頁", "收藏", "壽司郎", "路線", "設定")
private val PANE_GLYPHS = listOf("⌂", "♡", "◎", "⇄", "⚙")

/**
 * 森友出行 · 原生 WP8（Metro）外殼。
 *
 * 結構對應概念圖 wp8-concept.html：
 *   Pivot 大標題頂欄（＋圓形搜尋/重新整理）→ 5 個橫滑分頁 → App Bar（裸字形圖標 ＋ ⋯）
 * 首頁為 Panorama（磁貼牆 / 搜尋 / 天氣＋K75P 三面板）。
 */
@Composable
fun SenyouApp() {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    LaunchedEffect(Unit) {
        runCatching { StaticData.load(ctx) }
        runCatching { Tts.init(ctx) }
    }
    val settings by Store.settings(ctx).collectAsStateWithLifecycle(initialValue = Settings())

    // ---- 套用 WP8 主題令牌（靜態可變令牌，於組樹重組前設定）----
    Wp8.light = settings.theme == "light"
    Wp8.contrast = settings.contrast
    Wp8.accentIndex = Wp8.Accents.indexOfFirst { it.first == settings.accent }.takeIf { it >= 0 } ?: 0

    val safeMode = remember { CrashGuard.isSafeMode(ctx) }
    LaunchedEffect(Unit) {
        delay(12_000)
        CrashGuard.onHealthy(ctx)
    }

    // 系統狀態列／導覽列圖示明暗跟隨主題（WP 的系統 chrome 一致性）
    val view = androidx.compose.ui.platform.LocalView.current
    LaunchedEffect(settings.theme) {
        val act = view.context as? android.app.Activity ?: return@LaunchedEffect
        val ctrl = androidx.core.view.WindowCompat.getInsetsController(act.window, view)
        ctrl.isAppearanceLightStatusBars = Wp8.light
        ctrl.isAppearanceLightNavigationBars = Wp8.light
    }

    var pane by remember { mutableIntStateOf(0) }
    var k75pOpen by remember { mutableStateOf(false) }
    var detail by remember { mutableStateOf<SearchItem?>(null) }
    var galleryOpen by remember { mutableStateOf(false) }
    var win10Open by remember { mutableStateOf(false) }
    var moreOpen by remember { mutableStateOf(false) }
    var refreshTick by remember { mutableIntStateOf(0) }
    var barHidden by remember { mutableStateOf(false) }
    val busy = remember { mutableStateOf(false) }
    // App Bar 隨滾動自動隱藏／顯示（WP 行為：向下捲動收起、向上捲動回來）
    val scrollConn = remember {
        object : androidx.compose.ui.input.nestedscroll.NestedScrollConnection {
            private var acc = 0f
            override fun onPreScroll(
                available: androidx.compose.ui.geometry.Offset,
                source: androidx.compose.ui.input.nestedscroll.NestedScrollSource,
            ): androidx.compose.ui.geometry.Offset {
                val dy = available.y
                acc = if (acc * dy < 0f) dy else acc + dy
                if (acc < -48f) { barHidden = true; acc = 0f }
                else if (acc > 48f) { barHidden = false; acc = 0f }
                return androidx.compose.ui.geometry.Offset.Zero
            }
        }
    }

    val pager = rememberPagerState(pageCount = { PANE_KEYS.size })
    val (posture, hinge) = rememberFoldInfo()
    val baseDensity = LocalDensity.current
    // 字體大小（WP 8 級）＋ 尊重系統字體縮放
    val fontScale = (1f + (settings.fontLevel - 3) * 0.06f) * baseDensity.fontScale

    // 通知深鏈
    val deep by DeepLink.flow.collectAsStateWithLifecycle()
    LaunchedEffect(deep) {
        deep?.let {
            detail = it
            DeepLink.flow.value = null
        }
    }
    LaunchedEffect(pager.currentPage) { pane = pager.currentPage }

    SenyouTheme {
        CompositionLocalProvider(LocalDensity provides Density(baseDensity.density, fontScale)) {
            BoxWithConstraints(Modifier.fillMaxSize().background(Wp8.Bg)) {
                val widthDp = maxWidth.value.toInt()
                val heightDp = maxHeight.value.toInt()
                val sizeClass = when {
                    widthDp >= 840 -> SizeClass.Expanded
                    widthDp >= 600 -> SizeClass.Medium
                    else -> SizeClass.Compact
                }
                val adaptive = AdaptiveInfo(
                    sizeClass = sizeClass,
                    widthDp = widthDp,
                    heightDp = heightDp,
                    posture = posture,
                    hingeTopPx = hinge?.first ?: 0,
                    hingeBottomPx = hinge?.last ?: 0,
                    density = baseDensity.density,
                )
                // WP8 響應式：大屏加大邊距（css: @media min-width 700px → 44px）
                Wp8.Gutter = if (adaptive.isExpanded) 44.dp else 24.dp

                CompositionLocalProvider(LocalAdaptive provides adaptive) {
                    key(settings.theme, settings.contrast) {
                    CompositionLocalProvider(
                        hk.senyou.travel.ui.wp8.LocalWp8Busy provides busy,
                    ) {
                    Column(Modifier.fillMaxSize()) {
                        PivotTopBar(
                            titles = PANE_KEYS,
                            current = pager.currentPage,
                            offsetFraction = pager.currentPageOffsetFraction,
                            onSelect = { i -> scope.launch { pager.animateScrollToPage(i) } },
                            onBack = null,
                            onSearch = { scope.launch { pager.animateScrollToPage(0) } },
                            onRefresh = { refreshTick++ },
                            busy = busy.value,
                        )

                        if (adaptive.flexMode) {
                            // 半折：內容置於鉸鏈上方，下方給提示
                            Box(Modifier.weight(0.55f).fillMaxWidth()) {
                                PaneHost(
                                    pager = pager,
                                    pane = pane,
                                    refreshTick = refreshTick,
                                    refreshSec = settings.refresh,
                                    onOpenK75P = { k75pOpen = true },
                                    onGoPane = { i -> scope.launch { pager.animateScrollToPage(i) } },
                                    onOpenDetail = { detail = it },
                                    settings = settings,
                                    onSettings = { s -> scope.launch { Store.save(ctx, s) } },
                                    onOpenGallery = { galleryOpen = true },
                                )
                            }
                            Box(Modifier.height(adaptive.hingeHeightPx.dp))
                            Box(Modifier.weight(0.45f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                                Text("展開內屏可獲得完整體驗", color = Wp8.Text2, fontSize = 14.sp)
                            }
                        } else {
                            Box(Modifier.weight(1f).fillMaxWidth()) {
                                PaneHost(
                                    pager = pager,
                                    pane = pane,
                                    refreshTick = refreshTick,
                                    refreshSec = settings.refresh,
                                    onOpenK75P = { k75pOpen = true },
                                    onGoPane = { i -> scope.launch { pager.animateScrollToPage(i) } },
                                    onOpenDetail = { detail = it },
                                    settings = settings,
                                    onSettings = { s -> scope.launch { Store.save(ctx, s) } },
                                    onOpenGallery = { galleryOpen = true },
                                )
                            }
                            AppBar(
                                current = pager.currentPage,
                                moreOpen = moreOpen,
                                hidden = barHidden,
                                onMore = { moreOpen = !moreOpen },
                                onSearch = { scope.launch { pager.animateScrollToPage(0) } },
                                onRefresh = { refreshTick++ },
                            ) { i -> scope.launch { pager.animateScrollToPage(i) } }
                        }
                    }
                    }
                    }
                }

                // 官方精神：所有手機都有專用返回鍵，用於「向後導覽」而非離開 App。
                // Android 對應系統返回鍵／返回手勢：依「最上層 UI」逐層關閉。
                androidx.activity.compose.BackHandler(
                    enabled = k75pOpen || detail != null || galleryOpen || moreOpen || win10Open,
                ) {
                    when {
                        moreOpen -> moreOpen = false
                        galleryOpen -> galleryOpen = false
                        detail != null -> detail = null
                        k75pOpen -> k75pOpen = false
                    }
                }

                // ---- 覆蓋層（WP Turnstile：全屏頁繞 Y 軸 90° 轉入，總時長 ≤ 300ms）----
                if (k75pOpen) {
                    Wp8Turnstile { Wp8K75PPage(onClose = { k75pOpen = false }) }
                }
                detail?.let { d -> Wp8DetailSheet(item = d) { detail = null } }
                if (win10Open) {
                    hk.senyou.travel.ui.wp8.Win10DemoScreen(onClose = { win10Open = false })
                }
                if (galleryOpen) {
                    Wp8Turnstile {
                        Box(Modifier.fillMaxSize().background(Wp8.Bg)) {
                            Column(Modifier.fillMaxSize()) {
                                PivotTopBar(
                                    titles = null,
                                    current = 0,
                                    offsetFraction = 0f,
                                    onSelect = {},
                                    onBack = { galleryOpen = false },
                                    onSearch = null,
                                    onRefresh = null,
                                    busy = false,
                                )
                                Box(Modifier.weight(1f)) { Wp8Gallery() }
                            }
                        }
                    }
                }
                if (moreOpen && !k75pOpen && detail == null && !galleryOpen) {
                    Box(Modifier.fillMaxSize().clickable { moreOpen = false }) {
                        Wp8MoreMenu(
                            items = listOf(
                                "設定" to { scope.launch { pager.animateScrollToPage(4) } },
                                "搜尋" to { scope.launch { pager.animateScrollToPage(0) } },
                                "重新整理" to { refreshTick++ },
                                "介面規範" to { galleryOpen = true },
                                "Win10 Mobile 演示" to { win10Open = true },
                                if (safeMode) "安全模式：開" to { CrashGuard.setSafeMode(ctx, false) }
                                else "安全模式：關" to { CrashGuard.setSafeMode(ctx, true) },
                            ),
                            onDismiss = { moreOpen = false },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PaneHost(
    pager: androidx.compose.foundation.pager.PagerState,
    pane: Int,
    refreshTick: Int,
    refreshSec: Int,
    onOpenK75P: () -> Unit,
    onGoPane: (Int) -> Unit,
    onOpenDetail: (SearchItem) -> Unit,
    settings: Settings,
    onSettings: (Settings) -> Unit,
    onOpenGallery: () -> Unit,
) {
    HorizontalPager(state = pager, modifier = Modifier.fillMaxSize()) { page ->
        // WP Pivot / Turnstile 轉場：內容視差 + 輕微 3D 旋轉進出（比單純滑動更有 WP 味）
        val density = LocalDensity.current.density
        val offset = (pager.currentPage - page) + pager.currentPageOffsetFraction
        Box(
            Modifier
                .fillMaxSize()
                .graphicsLayer {
                    val o = offset.coerceIn(-1.2f, 1.2f)
                    alpha = (1f - kotlin.math.abs(o) * 0.5f).coerceIn(0.15f, 1f)
                    translationX = -o * size.width * 0.16f
                    rotationY = -o * 9f
                    transformOrigin = TransformOrigin(if (o > 0f) 1f else 0f, 0.5f)
                    cameraDistance = 24f * density
                },
        ) {
            when (page) {
                0 -> Wp8HomePane(
                    refreshSec = refreshSec,
                    refreshTick = refreshTick,
                    settings = settings,
                    onSettings = onSettings,
                    onOpenK75P = onOpenK75P,
                    onGoPane = onGoPane,
                    onOpenDetail = onOpenDetail,
                )
                1 -> Wp8FavsPane(onOpenDetail = onOpenDetail)
                2 -> Wp8SushiPane()
                3 -> Wp8MapPane(onOpenDetail = onOpenDetail)
                else -> Wp8SettingsPane(settings = settings, onSettings = onSettings, onOpenGallery = onOpenGallery)
            }
        }
    }
}

/** WP turnstile：全屏頁以 rotateY 3D 滑入（非硬切） */
@Composable
private fun Wp8Turnstile(backward: Boolean = false, content: @Composable () -> Unit) {
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { shown = true }
    val t by androidx.compose.animation.core.animateFloatAsState(
        if (shown) 1f else 0f,
        tween(380, easing = Wp8.Ease),
        label = "turnstile",
    )
    val density = LocalDensity.current.density
    Box(
        Modifier
            .fillMaxSize()
            .graphicsLayer {
                rotationY = (if (backward) -90f else 90f) * (1f - t)
                transformOrigin = TransformOrigin(if (backward) 1f else 0f, 0.5f)
                cameraDistance = 10f * density
                alpha = 0.4f + 0.6f * t
            },
    ) { content() }
}

/** 頂欄：WP8 Pivot 標題條（titles=null 時為單標題模式，用於覆蓋層）＋ WP 進度條 */
@Composable
private fun PivotTopBar(
    titles: List<String>?,
    current: Int,
    offsetFraction: Float,
    onSelect: (Int) -> Unit,
    onBack: (() -> Unit)?,
    onSearch: (() -> Unit)?,
    onRefresh: (() -> Unit)?,
    busy: Boolean,
) {
    val status = WindowInsets.statusBars.asPaddingValues()
    Column {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(
                    start = Wp8.Gutter,
                    end = Wp8.Gutter,
                    top = status.calculateTopPadding() + 22.dp,
                    bottom = 12.dp,
                ),
            verticalAlignment = Alignment.Bottom,
        ) {
            if (onBack != null) {
                Text(
                    "‹",
                    color = Wp8.Text1,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Light,
                    modifier = Modifier.clickable { onBack() }.padding(end = 10.dp),
                )
            }
            if (titles != null) {
                Wp8PivotStrip(
                    titles = titles,
                    current = current,
                    offsetFraction = offsetFraction,
                    onSelect = onSelect,
                    modifier = Modifier.weight(1f),
                )
            } else {
                Text(
                    "介面規範",
                    color = Wp8.Text1,
                    fontSize = 46.sp,
                    fontWeight = FontWeight.Light,
                    fontFamily = FontFamily.SansSerif,
                    letterSpacing = (-0.5).sp,
                    maxLines = 1,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        // WP 不確定進度條（3px，載入時才出現）
        hk.senyou.travel.ui.wp8.Wp8ProgressBar(active = busy)
    }
}

/** App Bar：5 個裸字形圖標 ＋ ⋯；向下捲動時自動收起（WP 行為） */
@Composable
private fun AppBar(
    current: Int,
    moreOpen: Boolean,
    hidden: Boolean,
    onMore: () -> Unit,
    onSearch: () -> Unit,
    onRefresh: () -> Unit,
    onSelect: (Int) -> Unit,
) {
    val nav = WindowInsets.navigationBars.asPaddingValues()
    val density = LocalDensity.current
    val barH by androidx.compose.animation.core.animateDpAsState(
        if (hidden) 0.dp else Wp8.AppBarH,
        tween(220, easing = Wp8.Ease),
        label = "barH",
    )
    Box(Modifier.fillMaxWidth().height(barH).clipToBounds()) {
        Column(
            Modifier
                .fillMaxWidth()
                .graphicsLayer { translationY = with(density) { (Wp8.AppBarH - barH).toPx() } }
                .background(Wp8.Surface)
                .padding(bottom = nav.calculateBottomPadding()),
        ) {
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
            Row(
                Modifier.fillMaxWidth().heightIn(min = Wp8.AppBarH),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // 官方：圖標按鈕只放「最主要、最常用」的動作；其餘放 ⋯ 選單。
                // 因此只保留 4 個主導覽，設定與搜尋/重新整理移入選單（官方選單上限 5 項）。
                listOf(0, 1, 2, 3).forEach { i ->
                    Wp8AppBarButton(
                        glyph = PANE_GLYPHS[i],
                        label = PANE_LABELS[i],
                        active = current == i,
                        modifier = Modifier.weight(1f),
                        showLabel = moreOpen,
                    ) { onSelect(i) }
                }
                Wp8AppBarButton(
                    glyph = "⋯",
                    label = "更多",
                    active = moreOpen,
                    modifier = Modifier.weight(1f),
                    showLabel = moreOpen,
                    onClick = onMore,
                )
            }
        }
    }
}
