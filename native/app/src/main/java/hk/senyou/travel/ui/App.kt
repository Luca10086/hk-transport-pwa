package hk.senyou.travel.ui

import androidx.compose.animation.core.animateDpAsState
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
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.data.Store
import hk.senyou.travel.ui.theme.SenyouTheme
import hk.senyou.travel.ui.theme.V3

private val TABS = listOf("首頁", "收藏", "壽司郎", "路線圖", "設定")
private val TAB_ICONS = listOf("⌂", "♡", "◎", "⌖", "⚙")

@Composable
fun SenyouApp() {
    val ctx = LocalContext.current
    LaunchedEffect(Unit) { StaticData.load(ctx); Tts.init(ctx) }
    val settings by Store.settings(ctx).collectAsStateWithLifecycle(initialValue = Settings())

    // 主題 + 強調色：在組樹重建前套用（key() 令切換時整體重組）
    V3.apply(settings.theme, settings.accent)

    var tab by remember { mutableIntStateOf(0) }
    var k75pOpen by remember { mutableStateOf(false) }
    var weatherOpen by remember { mutableStateOf(false) }
    var detail by remember { mutableStateOf<SearchItem?>(null) }
    val homeScroll = rememberScrollState()
    val (posture, hinge) = rememberFoldInfo()
    val deep by DeepLink.flow.collectAsStateWithLifecycle()

    // 通知點擊 → 直接打開路線詳情
    LaunchedEffect(deep) {
        deep?.let {
            detail = it
            DeepLink.flow.value = null
        }
    }

    val alpha = when (settings.glass) {
        0 -> 0f; 1 -> 0.03f; 2 -> 0.07f; 3 -> 0.10f; else -> 0.14f
    }
    val blurPx = when (settings.glass) {
        0 -> 0f; 1 -> 12f; 2 -> 26f; 3 -> 36f; else -> 48f
    }
    val glassCfg = GlassCfg(
        alpha = alpha,
        blurPx = blurPx,
        refractPx = if (settings.glass == 0) 0f else 20f,
        sheen = settings.fx != "off",
        motion = settings.fx == "full",
        light = V3.isLight,
    )
    val baseDensity = LocalDensity.current

    key(settings.theme, settings.accent) {
    SenyouTheme {
    CompositionLocalProvider(
        LocalDeepNight provides settings.deep,
        LocalDensity provides Density(baseDensity.density, if (settings.big) 1.15f else 1f),
    ) {
        BoxWithConstraints(Modifier.fillMaxSize().background(V3.Bg)) {
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

            CompositionLocalProvider(LocalAdaptive provides adaptive) {
                LiquidBackgroundHost(
                    modifier = Modifier.fillMaxSize(),
                    deepNight = settings.deep,
                    snapshot = settings.glass > 0,
                    light = V3.isLight,
                ) {
                    CompositionLocalProvider(LocalGlassCfg provides glassCfg) {
                        val content: @Composable () -> Unit = {
                            ScreenContent(
                                tab = tab,
                                homeScroll = homeScroll,
                                onOpenK75P = { k75pOpen = true },
                                onOpenRoute = { detail = it },
                                onOpenWeather = { weatherOpen = true },
                                settings = settings,
                            )
                        }

                        if (adaptive.isExpanded) {
                            // 展開態（MIX Fold 4 內屏 / 平板）：左側導航欄 + 內容區
                            Row(Modifier.fillMaxSize()) {
                                GlassRail(tab) { tab = it }
                                Column(Modifier.weight(1f).fillMaxHeight()) {
                                    TopBar(collapsed = false)
                                    Box(Modifier.weight(1f)) { content() }
                                }
                            }
                        } else if (adaptive.flexMode && tab != 0) {
                            // 半折分屏：內容留在上半屏（避開鉸鏈），下半屏放提示
                            Column(Modifier.fillMaxSize()) {
                                TopBar(collapsed = false)
                                Box(Modifier.weight(0.45f)) { content() }
                                Box(Modifier.height(adaptive.hingeHeightPx.dp))
                                Box(Modifier.weight(0.55f), contentAlignment = Alignment.Center) {
                                    GlassSurface(modifier = Modifier.padding(24.dp)) {
                                        Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                            Text("半折模式", color = V3.Text1, fontSize = 16.sp)
                                            Spacer(Modifier.height(6.dp))
                                            Text("展開內屏可獲得完整雙欄體驗", color = V3.Text2, fontSize = 12.sp)
                                        }
                                    }
                                }
                            }
                        } else {
                            Column(Modifier.fillMaxSize()) {
                                TopBar(collapsed = tab == 0 && homeScroll.value > 80)
                                Box(Modifier.weight(1f)) { content() }
                                if (!adaptive.flexMode) BottomNav(tab) { tab = it }
                            }
                        }

                        if (k75pOpen) K75PPage(onClose = { k75pOpen = false })
                        if (weatherOpen) WeatherPage(onClose = { weatherOpen = false })
                        detail?.let { d -> RouteDetailPage(item = d, onClose = { detail = null }) }
                    }
                }
            }
        }
    }
    }
    }
}

@Composable
private fun ScreenContent(
    tab: Int,
    homeScroll: androidx.compose.foundation.ScrollState,
    onOpenK75P: () -> Unit,
    onOpenRoute: (SearchItem) -> Unit,
    onOpenWeather: () -> Unit,
    settings: Settings,
) {
    when (tab) {
        0 -> HomeScreen(
            scroll = homeScroll,
            onOpenK75P = onOpenK75P,
            onOpenRoute = onOpenRoute,
            onOpenWeather = onOpenWeather,
        )
        1 -> FavoritesScreen(onOpenRoute = onOpenRoute)
        2 -> SushiScreen()
        3 -> LineMapScreen()
        else -> SettingsScreen(settings)
    }
}

/** 展開態左側玻璃導航欄（替代底部導航） */
@Composable
private fun GlassRail(selected: Int, onSelect: (Int) -> Unit) {
    val status = WindowInsets.statusBars.asPaddingValues()
    val nav = WindowInsets.navigationBars.asPaddingValues()
    GlassSurface(
        modifier = Modifier
            .width(104.dp)
            .fillMaxHeight()
            .padding(top = status.calculateTopPadding(), bottom = nav.calculateBottomPadding()),
        shape = RoundedCornerShape(0.dp),
        strong = true,
    ) {
        Column(
            Modifier
                .fillMaxSize()
                .padding(vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            TABS.forEachIndexed { i, t ->
                val on = i == selected
                Column(
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .semantics { contentDescription = t }
                        .clickable { onSelect(i) }
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(TAB_ICONS[i], color = if (on) V3.Text1 else V3.Text2, fontSize = 22.sp)
                    Spacer(Modifier.height(4.dp))
                    Text(t, color = if (on) V3.Text1 else V3.Text2, fontSize = 12.sp)
                    Spacer(Modifier.height(4.dp))
                    Box(
                        Modifier
                            .width(32.dp)
                            .height(3.dp)
                            .clip(CircleShape)
                            .background(if (on) V3.Accent else Color.Transparent)
                    )
                }
            }
        }
    }
}

@Composable
private fun TopBar(collapsed: Boolean) {
    val status = WindowInsets.statusBars.asPaddingValues()
    val h by animateDpAsState(if (collapsed) 64.dp else 96.dp, tween(280, easing = V3.EasePress), label = "tbH")
    val radius by animateDpAsState(if (collapsed) 20.dp else 0.dp, tween(280, easing = V3.EasePress), label = "tbR")
    val hPad by animateDpAsState(if (collapsed) 16.dp else 0.dp, tween(280, easing = V3.EasePress), label = "tbP")
    val titleSize by animateFloatAsState(if (collapsed) 22f else 32f, tween(280, easing = V3.EasePress), label = "tbT")

    GlassSurface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = status.calculateTopPadding())
            .padding(horizontal = hPad, vertical = if (collapsed) 6.dp else 0.dp)
            .height(h),
        shape = RoundedCornerShape(radius),
        strong = true,
    ) {
        Row(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.Center) {
                if (!collapsed) {
                    Text("SENYOU · HK TRANSPORT", color = Color.White.copy(alpha = 0.5f), fontSize = 10.sp, letterSpacing = 3.sp)
                }
                Row(verticalAlignment = Alignment.Bottom) {
                    Text("森友", color = V3.Text1, fontSize = titleSize.sp, fontWeight = FontWeight.Light)
                    Text("出行", color = V3.Accent, fontSize = titleSize.sp, fontWeight = FontWeight.Light)
                }
                if (!collapsed) Text("原生 v3 · 大屏自適應", color = V3.Text2, fontSize = 12.sp)
            }
            GlassSurface(modifier = Modifier.size(if (collapsed) 36.dp else 40.dp), shape = CircleShape) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("↻", color = V3.Text1, fontSize = 16.sp)
                }
            }
        }
    }
}

@Composable
private fun BottomNav(selected: Int, onSelect: (Int) -> Unit) {
    val nav = WindowInsets.navigationBars.asPaddingValues()
    GlassSurface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = nav.calculateBottomPadding()),
        shape = RoundedCornerShape(0.dp),
        strong = true,
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .height(72.dp)
                .padding(horizontal = 6.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TABS.forEachIndexed { i, t ->
                val on = i == selected
                Column(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .semantics { contentDescription = t }
                        .clickable { onSelect(i) }
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(TAB_ICONS[i], color = if (on) V3.Text1 else V3.Text2, fontSize = 20.sp)
                    Spacer(Modifier.height(3.dp))
                    Text(t, color = if (on) V3.Text1 else V3.Text2, fontSize = 11.sp)
                    Spacer(Modifier.height(3.dp))
                    Box(
                        Modifier
                            .width(28.dp)
                            .height(3.dp)
                            .clip(CircleShape)
                            .background(if (on) V3.Accent else Color.Transparent)
                    )
                }
            }
        }
    }
}

@Composable
private fun Placeholder(name: String) {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        GlassSurface(modifier = Modifier.padding(24.dp)) {
            Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(name, color = V3.Text1, fontSize = 22.sp, fontWeight = FontWeight.Light)
                Spacer(Modifier.height(6.dp))
                Text("後續里程碑接入", color = V3.Text2, fontSize = 13.sp)
            }
        }
    }
}
