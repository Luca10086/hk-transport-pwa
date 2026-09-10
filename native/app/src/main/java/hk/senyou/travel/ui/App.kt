package hk.senyou.travel.ui

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

    var pane by remember { mutableIntStateOf(0) }
    var k75pOpen by remember { mutableStateOf(false) }
    var detail by remember { mutableStateOf<SearchItem?>(null) }
    var galleryOpen by remember { mutableStateOf(false) }
    var moreOpen by remember { mutableStateOf(false) }
    var refreshTick by remember { mutableIntStateOf(0) }

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
                    Column(Modifier.fillMaxSize()) {
                        PivotTopBar(
                            title = PANE_KEYS[pager.currentPage],
                            onBack = null,
                            onSearch = { scope.launch { pager.animateScrollToPage(0) } },
                            onRefresh = { refreshTick++ },
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
                                onMore = { moreOpen = !moreOpen },
                            ) { i -> scope.launch { pager.animateScrollToPage(i) } }
                        }
                    }
                    }
                }

                // ---- 覆蓋層 ----
                if (k75pOpen) Wp8K75PPage(onClose = { k75pOpen = false })
                detail?.let { d -> Wp8DetailSheet(item = d) { detail = null } }
                if (galleryOpen) {
                    Box(Modifier.fillMaxSize().background(Wp8.Bg)) {
                        Column(Modifier.fillMaxSize()) {
                            PivotTopBar(
                                title = "介面規範",
                                onBack = { galleryOpen = false },
                                onSearch = null,
                                onRefresh = null,
                            )
                            Box(Modifier.weight(1f)) { Wp8Gallery() }
                        }
                    }
                }
                if (moreOpen && !k75pOpen && detail == null && !galleryOpen) {
                    Box(Modifier.fillMaxSize().clickable { moreOpen = false }) {
                        Wp8MoreMenu(
                            items = listOf(
                                "重新整理" to { refreshTick++ },
                                "路線圖" to { scope.launch { pager.animateScrollToPage(3) } },
                                "介面規範" to { galleryOpen = true },
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
        when (page) {
            0 -> Wp8HomePane(
                refreshSec = refreshSec,
                refreshTick = refreshTick,
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

/** 頂欄：Pivot 大標題（切頁時淡出左移，與 WP 同款）＋ 圓形操作 */
@Composable
private fun PivotTopBar(
    title: String,
    onBack: (() -> Unit)?,
    onSearch: (() -> Unit)?,
    onRefresh: (() -> Unit)?,
) {
    val status = WindowInsets.statusBars.asPaddingValues()
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
        AnimatedContent(
            targetState = title,
            transitionSpec = {
                (fadeIn(tween(300, easing = Wp8.Ease)) + slideInHorizontally(tween(300, easing = Wp8.Ease)) { -18 })
                    .togetherWith(fadeOut(tween(120)))
            },
            label = "pivotTitle",
            modifier = Modifier.weight(1f),
        ) { t ->
            Text(
                t,
                color = Wp8.Text1,
                fontSize = 46.sp,
                fontWeight = FontWeight.Light,
                fontFamily = FontFamily.SansSerif,
                letterSpacing = (-0.5).sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            if (onSearch != null) Wp8CircleButton("⌕", "搜尋") { onSearch() }
            if (onRefresh != null) Wp8CircleButton("↻", "重新整理") { onRefresh() }
        }
    }
    Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
}

/** App Bar：5 個裸字形圖標 ＋ ⋯ */
@Composable
private fun AppBar(current: Int, moreOpen: Boolean, onMore: () -> Unit, onSelect: (Int) -> Unit) {
    val nav = WindowInsets.navigationBars.asPaddingValues()
    Column(
        Modifier
            .fillMaxWidth()
            .background(Wp8.Surface)
            .padding(bottom = nav.calculateBottomPadding()),
    ) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Row(
            Modifier.fillMaxWidth().heightIn(min = Wp8.AppBarH),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            PANE_LABELS.forEachIndexed { i, label ->
                Wp8AppBarButton(
                    glyph = PANE_GLYPHS[i],
                    label = label,
                    active = current == i,
                ) { onSelect(i) }
            }
            Wp8AppBarButton("⋯", "更多", moreOpen, onMore)
        }
    }
}
