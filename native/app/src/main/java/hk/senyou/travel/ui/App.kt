package hk.senyou.travel.ui

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
    val glassCfg = GlassCfg(alpha = alpha, sheen = settings.fx != "off", motion = settings.fx == "full")
    val baseDensity = LocalDensity.current

    CompositionLocalProvider(
        LocalGlassCfg provides glassCfg,
        LocalDeepNight provides settings.deep,
        LocalDensity provides Density(baseDensity.density, if (settings.big) 1.15f else 1f),
    ) {
        Box(Modifier.fillMaxSize().background(V3.Bg)) {
            LiquidBackground(Modifier.fillMaxSize(), deepNight = settings.deep)

            Column(Modifier.fillMaxSize()) {
                TopBar()
                Box(Modifier.weight(1f)) {
                    when (tab) {
                        0 -> HomeScreen(
                            onOpenK75P = { k75pOpen = true },
                            onOpenRoute = { detail = it },
                            onOpenWeather = { weatherOpen = true },
                        )
                        1 -> FavoritesScreen(onOpenRoute = { detail = it })
                        2 -> SushiScreen()
                        3 -> Placeholder("路線圖 · 語義色")
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

@Composable
private fun TopBar() {
    val status = WindowInsets.statusBars.asPaddingValues()
    GlassSurface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = status.calculateTopPadding()),
        shape = RoundedCornerShape(0.dp),
        strong = true,
    ) {
        Column(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 18.dp, vertical = 12.dp)
                .height(76.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Text("SENYOU · HK TRANSPORT", color = Color.White.copy(alpha = 0.5f), fontSize = 10.sp, letterSpacing = 3.sp)
            Row(verticalAlignment = Alignment.Bottom) {
                Text("森友", color = V3.Text1, fontSize = 32.sp, fontWeight = FontWeight.Light)
                Text("出行", color = V3.Accent, fontSize = 32.sp, fontWeight = FontWeight.Light)
            }
            Text("原生 v3 · M3 資料層", color = V3.Text2, fontSize = 12.sp)
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
