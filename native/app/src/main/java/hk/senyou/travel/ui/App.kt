package hk.senyou.travel.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
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
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
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
import hk.senyou.travel.ui.wp8.Wp8FavsPane
import hk.senyou.travel.ui.wp8.Wp8Gallery
import hk.senyou.travel.ui.wp8.Wp8HomePane
import hk.senyou.travel.ui.wp8.Wp8K75PPage
import hk.senyou.travel.ui.wp8.Wp8MapPane
import hk.senyou.travel.ui.wp8.Wp8SettingsPane
import hk.senyou.travel.ui.wp8.Wp8SushiPane
import hk.senyou.travel.ui.wp8.Win10DemoScreen
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val PANE_LABELS = listOf("首頁", "收藏", "壽司郎", "路線", "設定")
private val PANE_GLYPHS = listOf("⌂", "♡", "◎", "⇄", "⚙")

/**
 * 森友出行 · **Windows 10 Mobile（UWP）** 外殼。
 *
 * 依官方 UWP 規範（見 native/WIN10-MOBILE-DESIGN.md）：
 * · 導覽＝**NavigationView 漢堡**（窄螢幕 LeftMinimal：面板 overlay + 煙霧層），取代 WP8 的 Pivot
 * · 底欄＝**CommandBar**（48px；平時只顯示圖標，按 ⋯ 顯示標籤並滑出次要命令），取代 WP8 的 72px 圓形 App Bar
 * · 分頁切換＝**Page refresh**（上滑＋淡入）；深入下一層＝**Drill**（右滑入＋淡入）——官方兩種頁面轉場
 * · 標題＝**Semibold**、Sentence case；深色主題純黑底；強調色 #0078D7
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

    Wp8.light = settings.theme == "light"
    Wp8.contrast = settings.contrast
    Wp8.accentIndex = Wp8.Accents.indexOfFirst { it.first == settings.accent }.takeIf { it >= 0 } ?: 0

    val safeMode = remember { CrashGuard.isSafeMode(ctx) }
    LaunchedEffect(Unit) {
        delay(12_000)
        CrashGuard.onHealthy(ctx)
    }
    // 系統狀態列／導覽列圖示明暗跟隨主題
    val view = androidx.compose.ui.platform.LocalView.current
    LaunchedEffect(settings.theme) {
        val act = view.context as? android.app.Activity ?: return@LaunchedEffect
        val ctrl = androidx.core.view.WindowCompat.getInsetsController(act.window, view)
        ctrl.isAppearanceLightStatusBars = Wp8.light
        ctrl.isAppearanceLightNavigationBars = Wp8.light
    }

    var pane by remember { mutableIntStateOf(0) }
    var navOpen by remember { mutableStateOf(false) }
    var cmdOpen by remember { mutableStateOf(false) }
    var k75pOpen by remember { mutableStateOf(false) }
    var detail by remember { mutableStateOf<SearchItem?>(null) }
    var galleryOpen by remember { mutableStateOf(false) }
    var win10Open by remember { mutableStateOf(false) }
    var refreshTick by remember { mutableIntStateOf(0) }
    var barHidden by remember { mutableStateOf(false) }
    val busy = remember { mutableStateOf(false) }

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

    val (posture, hinge) = rememberFoldInfo()
    val baseDensity = LocalDensity.current
    val fontScale = (1f + (settings.fontLevel - 3) * 0.06f) * baseDensity.fontScale

    val deep by DeepLink.flow.collectAsStateWithLifecycle()
    LaunchedEffect(deep) {
        deep?.let {
            detail = it
            DeepLink.flow.value = null
        }
    }

    androidx.activity.compose.BackHandler(
        enabled = navOpen || cmdOpen || k75pOpen || detail != null || galleryOpen || win10Open,
    ) {
        when {
            cmdOpen -> cmdOpen = false
            navOpen -> navOpen = false
            win10Open -> win10Open = false
            galleryOpen -> galleryOpen = false
            detail != null -> detail = null
            k75pOpen -> k75pOpen = false
        }
    }

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
                Wp8.Gutter = if (adaptive.isExpanded) 44.dp else 24.dp

                CompositionLocalProvider(LocalAdaptive provides adaptive) {
                    key(settings.theme, settings.contrast) {
                    // 官方 Page refresh：切換左側導覽項時「上滑 + 淡入」
                    var refreshToken by remember { mutableIntStateOf(0) }
                    LaunchedEffect(pane) { refreshToken++ }
                    val refresh = remember { androidx.compose.animation.core.Animatable(1f) }
                    LaunchedEffect(refreshToken) {
                        refresh.snapTo(0f)
                        refresh.animateTo(1f, tween(300, easing = Wp8.EaseTurnstile))
                    }

                    CompositionLocalProvider(hk.senyou.travel.ui.wp8.LocalWp8Busy provides busy) {
                        Column(Modifier.fillMaxSize()) {
                            UwpTopBar(
                                title = PANE_LABELS[pane],
                                busy = busy.value,
                                onMenu = { navOpen = true },
                                onClose = null,
                            )
                            Box(Modifier.weight(1f).fillMaxWidth()) {
                                Column(
                                    Modifier
                                        .fillMaxSize()
                                        .graphicsLayer {
                                            alpha = refresh.value
                                            translationY = (1f - refresh.value) * 40f
                                        },
                                ) {
                                    PaneContent(
                                        pane = pane,
                                        refreshTick = refreshTick,
                                        refreshSec = settings.refresh,
                                        settings = settings,
                                        onOpenK75P = { k75pOpen = true },
                                        onGoPane = { pane = it },
                                        onOpenDetail = { detail = it },
                                        onSettings = { s -> scope.launch { Store.save(ctx, s) } },
                                        onOpenGallery = { galleryOpen = true },
                                    )
                                }
                            }
                            CommandBar(
                                current = pane,
                                open = cmdOpen && !barHidden,
                                hidden = barHidden,
                                onToggle = { cmdOpen = !cmdOpen },
                                onSelect = { pane = it; cmdOpen = false },
                                secondary = listOf(
                                    "重新整理" to { refreshTick++ },
                                    "介面規範（WP8 元件）" to { galleryOpen = true },
                                    "Windows 10 Mobile 演示" to { win10Open = true },
                                    if (safeMode) "安全模式：開" to { CrashGuard.setSafeMode(ctx, false) }
                                    else "安全模式：關" to { CrashGuard.setSafeMode(ctx, true) },
                                ),
                            )
                        }
                    }

                    // ---- NavigationView 左側面板（官方 LeftMinimal：overlay + 煙霧層）----
                    if (navOpen) {
                        val status = WindowInsets.statusBars.asPaddingValues()
                        Box(Modifier.fillMaxSize()) {
                            Box(
                                Modifier
                                    .fillMaxSize()
                                    .background(androidx.compose.ui.graphics.Color.Black.copy(alpha = 0.5f))
                                    .clickable { navOpen = false },
                            )
                            Column(
                                Modifier
                                    .width(268.dp)
                                    .fillMaxHeight()
                                    .background(Wp8.Surface)
                                    .padding(top = status.calculateTopPadding() + 12.dp),
                            ) {
                                Text(
                                    "森友出行",
                                    color = Wp8.Text1,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(start = 16.dp, bottom = 16.dp),
                                )
                                PANE_LABELS.forEachIndexed { i, label ->
                                    Row(
                                        Modifier
                                            .fillMaxWidth()
                                            .height(48.dp)
                                            .background(if (i == pane) Wp8.Accent.copy(alpha = 0.35f) else androidx.compose.ui.graphics.Color.Transparent)
                                            .clickable { pane = i; navOpen = false },
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Box(
                                            Modifier
                                                .width(4.dp)
                                                .fillMaxHeight()
                                                .background(if (i == pane) Wp8.Accent else androidx.compose.ui.graphics.Color.Transparent),
                                        )
                                        Spacer(Modifier.width(12.dp))
                                        Text(PANE_GLYPHS[i], color = Wp8.Text1, fontSize = 16.sp)
                                        Spacer(Modifier.width(12.dp))
                                        Text(label, color = Wp8.Text1, fontSize = 14.sp)
                                    }
                                }
                                Spacer(Modifier.height(12.dp))
                                Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
                                Spacer(Modifier.height(12.dp))
                                Text(
                                    "⋯ 更多可開啟 WP8 元件規範與 Win10 演示",
                                    color = Wp8.Text2,
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(horizontal = 16.dp),
                                )
                            }
                        }
                    }

                    // ---- 覆蓋層（官方 Drill：右滑入 + 淡入）----
                    if (k75pOpen) UwpDrill { Wp8K75PPage(onClose = { k75pOpen = false }) }
                    detail?.let { d -> UwpDrill { hk.senyou.travel.ui.wp8.Wp8DetailSheet(item = d) { detail = null } } }
                    if (win10Open) UwpDrill { Win10DemoScreen(onClose = { win10Open = false }) }
                    if (galleryOpen) {
                        UwpDrill {
                            Box(Modifier.fillMaxSize().background(Wp8.Bg)) {
                                Column(Modifier.fillMaxSize()) {
                                    UwpTopBar(
                                        title = "介面規範",
                                        busy = false,
                                        onMenu = null,
                                        onClose = { galleryOpen = false },
                                    )
                                    Box(Modifier.weight(1f)) { Wp8Gallery() }
                                }
                            }
                        }
                    }
                    }
                }
            }
        }
    }
}

/** 官方 **Page refresh** 轉場容器（上滑 + 淡入），用於切換左側導覽項 */
@Composable
private fun PaneContent(
    pane: Int,
    refreshTick: Int,
    refreshSec: Int,
    settings: Settings,
    onOpenK75P: () -> Unit,
    onGoPane: (Int) -> Unit,
    onOpenDetail: (SearchItem) -> Unit,
    onSettings: (Settings) -> Unit,
    onOpenGallery: () -> Unit,
) {
    when (pane) {
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

/**
 * 官方 **Drill** 轉場：使用者深入下一層時使用（右滑入 + 淡入）。
 * 對照 Page refresh（回到導覽堆疊頂部，上滑）。
 */
@Composable
private fun UwpDrill(content: @Composable () -> Unit) {
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { shown = true }
    val t by animateFloatAsState(if (shown) 1f else 0f, tween(300, easing = Wp8.EaseTurnstile), label = "drill")
    Box(
        Modifier
            .fillMaxSize()
            .graphicsLayer {
                alpha = t
                translationX = (1f - t) * 120f
            },
    ) { content() }
}

/** 頂欄：漢堡（官方 NavigationView LeftMinimal）+ 頁面標題（Subtitle 20 semibold） */
@Composable
private fun UwpTopBar(
    title: String,
    busy: Boolean,
    onMenu: (() -> Unit)?,
    onClose: (() -> Unit)?,
) {
    val status = WindowInsets.statusBars.asPaddingValues()
    Column {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(start = 4.dp, end = 12.dp, top = status.calculateTopPadding() + 4.dp, bottom = 4.dp)
                .heightIn(min = 48.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (onMenu != null) {
                Box(
                    Modifier.size(48.dp).clickable { onMenu() },
                    contentAlignment = Alignment.Center,
                ) { Text("☰", color = Wp8.Text1, fontSize = 20.sp) }
            } else {
                Spacer(Modifier.width(12.dp))
            }
            Spacer(Modifier.width(8.dp))
            Text(
                title,
                color = Wp8.Text1,
                fontSize = 20.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f),
            )
            if (onClose != null) {
                Box(Modifier.size(48.dp).clickable { onClose() }, contentAlignment = Alignment.Center) {
                    Text("✕", color = Wp8.Text1, fontSize = 18.sp)
                }
            }
        }
        hk.senyou.travel.ui.wp8.Wp8ProgressBar(active = busy)
    }
}

/**
 * 官方 **CommandBar**：平時只顯示圖標；按 ⋯ 後顯示標籤，次要命令由下往上滑出。
 * 高度 48px；向下捲動時自動收起（WP/Win10 皆然）。
 */
@Composable
private fun CommandBar(
    current: Int,
    open: Boolean,
    hidden: Boolean,
    onToggle: () -> Unit,
    onSelect: (Int) -> Unit,
    secondary: List<Pair<String, () -> Unit>>,
) {
    val nav = WindowInsets.navigationBars.asPaddingValues()
    val density = LocalDensity.current
    val barH by androidx.compose.animation.core.animateDpAsState(
        if (hidden) 0.dp else Wp8.AppBarH,
        tween(200, easing = Wp8.EaseTurnstile),
        label = "cmdH",
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
            // 溢出：次要命令由下往上滑出（官方 CommandBar 行為）
            if (open) {
                secondary.forEach { (label, action) ->
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .clickable { action(); onToggle() }
                            .padding(horizontal = 16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(label, color = Wp8.Text1, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                }
                Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
            }
            Row(
                Modifier.fillMaxWidth().height(Wp8.AppBarH),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                PANE_LABELS.forEachIndexed { i, label ->
                    Row(
                        Modifier
                            .height(48.dp)
                            .clickable { onSelect(i) }
                            .padding(horizontal = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            PANE_GLYPHS[i],
                            color = if (i == current) Wp8.Accent else Wp8.Text1,
                            fontSize = 17.sp,
                        )
                        if (open) {
                            Spacer(Modifier.width(8.dp))
                            Text(
                                label,
                                color = if (i == current) Wp8.Accent else Wp8.Text1,
                                fontSize = 12.sp,
                                maxLines = 1,
                            )
                        }
                    }
                }
                Box(Modifier.size(48.dp).clickable { onToggle() }, contentAlignment = Alignment.Center) {
                    Text(
                        if (open) "⌄" else "⋯",
                        color = if (open) Wp8.Accent else Wp8.Text1,
                        fontSize = 18.sp,
                    )
                }
            }
        }
    }
}
