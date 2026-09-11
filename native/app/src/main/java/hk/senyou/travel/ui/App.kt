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
import androidx.compose.foundation.layout.widthIn
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.nestedscroll.nestedScroll
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
import hk.senyou.travel.ui.wp8.Wp8DetailSheet
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

private val PANE_LABELS = listOf("首頁", "收藏", "壽司郎", "路線", "設定", "待機鬧鐘")
private val PANE_GLYPHS = listOf("⌂", "♡", "◎", "⇄", "⚙", "⏰")

/** 官方 NavigationView：展開態完整面板寬 / 中等態圖標欄寬 */
private val NAV_PANE_W = 268.dp
private val NAV_RAIL_W = 48.dp

/** 超寬螢幕內容最大寬度（避免文字行過長） */
private val CONTENT_MAX_W = 1080.dp

/**
 * 森友出行 · **Windows 10 Mobile（UWP）** 外殼。
 *
 * 依官方 UWP 規範（見 native/WIN10-MOBILE-DESIGN.md）：
 * · 導覽＝**NavigationView** 三種顯示模式：
 *   Compact(<600dp) = **LeftMinimal**：只顯示漢堡，面板 overlay + 煙霧層
 *   Medium(600–840dp) = **LeftCompact**：常駐 **48dp 圖標欄**，漢堡仍可開完整面板
 *   Expanded(≥840dp) = **LeftMode**：常駐 **268dp 完整面板**，內容讓位、不畫煙霧
 * · 大屏 **Master-Detail**：展開態點開詳情時左列表右詳情並排，不再全屏覆蓋
 * · 超寬螢幕內容**最大寬度限制**並置中
 * · 底欄＝**CommandBar**（48px；平時只顯示圖標，按 ⋯ 顯示標籤並滑出次要命令）
 * · 分頁切換＝**Page refresh**（上滑＋淡入）；深入下一層＝**Drill**（右滑入＋淡入）
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
    var alarmOpen by remember { mutableStateOf(false) }
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
        enabled = navOpen || cmdOpen || k75pOpen || detail != null || galleryOpen || win10Open || alarmOpen,
    ) {
        when {
            cmdOpen -> cmdOpen = false
            navOpen -> navOpen = false
            alarmOpen -> alarmOpen = false
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

                val permanentPane = sizeClass == SizeClass.Expanded     // LeftMode
                val rail = sizeClass == SizeClass.Medium                // LeftCompact
                // 大屏 master-detail：展開態且已選詳情 → 左右並排
                val masterDetail = permanentPane && detail != null

                CompositionLocalProvider(LocalAdaptive provides adaptive) {
                    key(settings.theme, settings.contrast) {
                    var refreshToken by remember { mutableIntStateOf(0) }
                    LaunchedEffect(pane) { refreshToken++ }
                    val refresh = remember { androidx.compose.animation.core.Animatable(1f) }
                    LaunchedEffect(refreshToken) {
                        refresh.snapTo(0f)
                        refresh.animateTo(1f, tween(300, easing = Wp8.EaseTurnstile))
                    }

                    CompositionLocalProvider(hk.senyou.travel.ui.wp8.LocalWp8Busy provides busy) {
                        Row(Modifier.fillMaxSize()) {
                            if (permanentPane) {
                                NavPane(
                                    current = pane,
                                    width = NAV_PANE_W,
                                    onSelect = { if (it == 5) alarmOpen = true else pane = it },
                                    modifier = Modifier.fillMaxHeight(),
                                )
                            } else if (rail) {
                                NavRail(current = pane) { if (it == 5) alarmOpen = true else pane = it }
                            }

                            Column(Modifier.weight(1f).fillMaxHeight()) {
                                UwpTopBar(
                                    title = PANE_LABELS[pane],
                                    busy = busy.value,
                                    onMenu = if (permanentPane) null else ({ navOpen = true }),
                                    onClose = null,
                                )
                                Box(Modifier.weight(1f).fillMaxWidth()) {
                                    if (masterDetail) {
                                        Row(Modifier.fillMaxSize()) {
                                            ContentArea(
                                                modifier = Modifier.weight(1f).fillMaxHeight(),
                                                maxWidth = null,
                                                dim = true,
                                                refreshValue = 1f,
                                                nested = scrollConn,
                                            ) { PaneBody(pane, refreshTick, settings, scope, ctx, onDetail = { detail = it }, onGoPane = { pane = it }, onOpenK75P = { k75pOpen = true }, onOpenGallery = { galleryOpen = true }) }
                                            Box(Modifier.width(1.dp).fillMaxHeight().background(Wp8.Line))
                                            Box(Modifier.weight(1f).fillMaxHeight()) {
                                                Wp8DetailSheet(item = detail!!) { detail = null }
                                            }
                                        }
                                    } else {
                                        ContentArea(
                                            modifier = Modifier.fillMaxSize(),
                                            maxWidth = if (permanentPane) CONTENT_MAX_W else null,
                                            dim = false,
                                            refreshValue = refresh.value,
                                            nested = scrollConn,
                                        ) { PaneBody(pane, refreshTick, settings, scope, ctx, onDetail = { detail = it }, onGoPane = { pane = it }, onOpenK75P = { k75pOpen = true }, onOpenGallery = { galleryOpen = true }) }
                                    }
                                }
                                CommandBar(
                                    current = pane,
                                    open = cmdOpen && !barHidden,
                                    hidden = barHidden,
                                    onToggle = { cmdOpen = !cmdOpen },
                                    onSelect = { if (it == 5) alarmOpen = true else pane = it; cmdOpen = false },
                                    secondary = listOf(
                                        "重新整理" to { refreshTick++ },
                                        "介面規範（WP8 元件）" to { galleryOpen = true },
                                        "Windows 10 Mobile 演示" to { win10Open = true },
                                        "待機顯示模式・鬧鐘（發表會展示）" to { alarmOpen = true },
                                        if (safeMode) "安全模式：開" to { CrashGuard.setSafeMode(ctx, false) }
                                        else "安全模式：關" to { CrashGuard.setSafeMode(ctx, true) },
                                    ),
                                )
                            }
                        }
                    }

                    /* ---- LeftMinimal / LeftCompact 的完整面板：overlay + 煙霧層 ---- */
                    if (navOpen && !permanentPane) {
                        val status = WindowInsets.statusBars.asPaddingValues()
                        Box(Modifier.fillMaxSize()) {
                            Box(
                                Modifier
                                    .fillMaxSize()
                                    .background(Color.Black.copy(alpha = 0.5f))
                                    .clickable { navOpen = false },
                            )
                            NavPane(
                                current = pane,
                                width = NAV_PANE_W,
                                onSelect = { if (it == 5) { alarmOpen = true; navOpen = false } else { pane = it; navOpen = false } },
                                modifier = Modifier.fillMaxHeight(),
                                topInsetDp = status.calculateTopPadding(),
                            )
                        }
                    }

                    /* ---- 覆蓋層（官方 Drill）---- */
                    if (k75pOpen) UwpDrill { Wp8K75PPage(onClose = { k75pOpen = false }) }
                    if (!masterDetail) {
                        detail?.let { d -> UwpDrill { Wp8DetailSheet(item = d) { detail = null } } }
                    }
                    if (win10Open) UwpDrill { Win10DemoScreen(onClose = { win10Open = false }) }
                    if (alarmOpen) {
                        UwpDrill {
                            DuoAlarmScreen(
                                greeting = "GOOD MORNING",
                                onStop = { alarmOpen = false },
                                onSnooze = { alarmOpen = false },
                            )
                        }
                    }
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

/** 目前分頁內容（供單欄與 master-detail 左欄共用） */
@Composable
private fun PaneBody(
    pane: Int,
    refreshTick: Int,
    settings: Settings,
    scope: kotlinx.coroutines.CoroutineScope,
    ctx: android.content.Context,
    onDetail: (SearchItem?) -> Unit,
    onGoPane: (Int) -> Unit,
    onOpenK75P: () -> Unit,
    onOpenGallery: () -> Unit,
) {
    when (pane) {
        0 -> Wp8HomePane(
            refreshSec = settings.refresh,
            refreshTick = refreshTick,
            settings = settings,
            onSettings = { s -> scope.launch { Store.save(ctx, s) } },
            onOpenK75P = onOpenK75P,
            onGoPane = onGoPane,
            onOpenDetail = onDetail,
        )
        1 -> Wp8FavsPane(onOpenDetail = onDetail)
        2 -> Wp8SushiPane()
        3 -> Wp8MapPane(onOpenDetail = onDetail)
        else -> Wp8SettingsPane(
            settings = settings,
            onSettings = { s -> scope.launch { Store.save(ctx, s) } },
            onOpenGallery = onOpenGallery,
        )
    }
}

/** 內容容器：Page refresh 動畫 +（大屏）最大寬度置中 + 滾動上報讓 CommandBar 自動收起 */
@Composable
private fun ContentArea(
    modifier: Modifier,
    maxWidth: androidx.compose.ui.unit.Dp?,
    dim: Boolean,
    refreshValue: Float,
    nested: androidx.compose.ui.input.nestedscroll.NestedScrollConnection,
    content: @Composable () -> Unit,
) {
    Box(modifier.nestedScroll(nested), contentAlignment = Alignment.TopCenter) {
        Box(
            Modifier
                .then(if (maxWidth != null) Modifier.widthIn(max = maxWidth) else Modifier.fillMaxWidth())
                .fillMaxHeight()
                .graphicsLayer {
                    alpha = (if (dim) 0.55f else 1f) * refreshValue
                    translationY = (1f - refreshValue) * 40f
                },
        ) { content() }
    }
}

/** 官方 NavigationView 左側面板（LeftMode 常駐 / overlay 共用） */
@Composable
private fun NavPane(
    current: Int,
    width: androidx.compose.ui.unit.Dp,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
    topInsetDp: androidx.compose.ui.unit.Dp = 0.dp,
) {
    Column(
        modifier
            .width(width)
            .background(Wp8.Surface)
            .padding(top = topInsetDp),
    ) {
        Spacer(Modifier.height(12.dp))
        Text(
            "森友出行",
            color = Wp8.Text1,
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(start = 16.dp, bottom = 16.dp),
        )
        PANE_LABELS.forEachIndexed { i, label ->
            if (i == 5) {
                Spacer(Modifier.height(12.dp))
                Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
                Spacer(Modifier.height(4.dp))
            }
            Row(
                Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .background(if (i == current) Wp8.Accent.copy(alpha = 0.35f) else Color.Transparent)
                    .clickable { onSelect(i) },
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier
                        .width(4.dp)
                        .fillMaxHeight()
                        .background(if (i == current) Wp8.Accent else Color.Transparent),
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

/** 官方 LeftCompact：常駐 48dp 圖標欄（僅圖標，點按切頁） */
@Composable
private fun NavRail(current: Int, onSelect: (Int) -> Unit) {
    Column(
        Modifier
            .width(NAV_RAIL_W)
            .fillMaxHeight()
            .background(Wp8.Surface),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(12.dp))
        PANE_LABELS.forEachIndexed { i, _ ->
            Box(
                Modifier
                    .width(NAV_RAIL_W)
                    .height(48.dp)
                    .clickable { onSelect(i) },
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    Modifier
                        .width(4.dp)
                        .height(20.dp)
                        .align(Alignment.CenterStart)
                        .background(if (i == current) Wp8.Accent else Color.Transparent),
                )
                Text(
                    PANE_GLYPHS[i],
                    color = if (i == current) Wp8.Accent else Wp8.Text1,
                    fontSize = 18.sp,
                )
            }
        }
    }
}

/** 官方 Drill 轉場：深入下一層（右滑入 + 淡入）；對照 Page refresh（上滑） */
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

/** 頂欄：漢堡（LeftMinimal 才需要）+ 頁面標題（Subtitle 20 semibold） */
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
                Spacer(Modifier.width(14.dp))
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

/** 官方 CommandBar：平時只顯示圖標；按 ⋯ 顯示標籤，次要命令由下往上滑出 */
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
                        Text(PANE_GLYPHS[i], color = if (i == current) Wp8.Accent else Wp8.Text1, fontSize = 17.sp)
                        if (open) {
                            Spacer(Modifier.width(8.dp))
                            Text(label, color = if (i == current) Wp8.Accent else Wp8.Text1, fontSize = 12.sp, maxLines = 1)
                        }
                    }
                }
                Box(Modifier.size(48.dp).clickable { onToggle() }, contentAlignment = Alignment.Center) {
                    Text(if (open) "⌄" else "⋯", color = if (open) Wp8.Accent else Wp8.Text1, fontSize = 18.sp)
                }
            }
        }
    }
}
