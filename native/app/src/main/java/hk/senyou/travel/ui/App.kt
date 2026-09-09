package hk.senyou.travel.ui

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.data.Store
import hk.senyou.travel.ui.theme.V3

private val TABS = listOf("首頁", "收藏", "壽司郎", "路線圖", "設定")
private val TAB_ICONS = listOf("⌂", "♡", "◎", "⌖", "⚙")

@Composable
fun SenyouApp() {
    val ctx = LocalContext.current
    LaunchedEffect(Unit) { StaticData.load(ctx) }
    val settings by Store.settings(ctx).collectAsStateWithLifecycle(initialValue = Settings())

    var tab by remember { mutableIntStateOf(0) }
    var k75pOpen by remember { mutableStateOf(false) }
    var weatherOpen by remember { mutableStateOf(false) }
    var detail by remember { mutableStateOf<SearchItem?>(null) }

    val alpha = when (settings.glass) {
        0 -> 0f
        1 -> 0.03f
        2 -> 0.07f
        3 -> 0.10f
        else -> 0.14f
    }
    val blurPx = when (settings.glass) {
        0 -> 0f
        1 -> 12f
        2 -> 26f
        3 -> 36f
        else -> 48f
    }
    val glassCfg = GlassCfg(
        alpha = alpha,
        blurPx = blurPx,
        refractPx = if (settings.glass == 0) 0f else 20f,
        sheen = settings.fx != "off",
        motion = settings.fx == "full",
    )
    val baseDensity = LocalDensity.current
    val homeScroll = rememberScrollState()

    CompositionLocalProvider(
        LocalDeepNight provides settings.deep,
        LocalDensity provides Density(baseDensity.density, if (settings.big) 1.15f else 1f),
    ) {
        LiquidBackgroundHost(
            modifier = Modifier.fillMaxSize().background(V3.Bg),
            deepNight = settings.deep,
            snapshot = settings.glass > 0,
        ) {
            CompositionLocalProvider(LocalGlassCfg provides glassCfg) {
                Column(Modifier.fillMaxSize()) {
                    TopBar(collapsed = tab == 0 && homeScroll.value > 80)
                    Box(Modifier.weight(1f)) {
                        when (tab) {
                            0 -> HomeScreen(
                                scroll = homeScroll,
                                onOpenK75P = { k75pOpen = true },
                                onOpenRoute = { detail = it },
                                onOpenWeather = { weatherOpen = true },
                            )
                            1 -> FavoritesScreen(onOpenRoute = { detail = it })
                            2 -> SushiScreen()
                            3 -> LineMapScreen()
                            else -> SettingsScreen(settings)
                        }
                    }
                    BottomNav(tab) { tab = it }
                }

                if (k75pOpen) K75PPage(onClose = { k75pOpen = false })
                if (weatherOpen) WeatherPage(onClose = { weatherOpen = false })
                detail?.let { d -> RouteDetailPage(item = d, onClose = { detail = null }) }
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
                if (!collapsed) Text("原生 v3 · M4 真折射", color = V3.Text2, fontSize = 12.sp)
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
