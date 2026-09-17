package hk.senyou.travel.ui.material

import android.content.Intent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.Store
import hk.senyou.travel.ui.LocalAdaptive
import hk.senyou.travel.ui.StandbyActivity
import kotlinx.coroutines.launch

/** Material 3 導覽目的（NavigationBar／NavigationRail／NavigationDrawer 共用同一份定義） */
private data class M3Dest(val label: String, val icon: ImageVector)

private val M3_DESTS = listOf(
    M3Dest("首頁", Icons.Filled.Home),
    M3Dest("收藏", Icons.Filled.Favorite),
    M3Dest("壽司郎", Icons.Filled.Restaurant),
    M3Dest("路線", Icons.Filled.Map),
    M3Dest("設定", Icons.Filled.Settings),
)

/**
 * **Material 3 應用外殼**（獨立的 Material 實作，不與 W10M 共用任何 UI 程式碼）。
 *
 * 依 M3 自適應導覽規範：
 * · **Compact（<600dp）**：`Scaffold` + 底部 `NavigationBar`
 * · **Medium（600–840dp）**：左側 `NavigationRail`
 * · **Expanded（≥840dp）**：`ModalNavigationDrawer` 常駐（`DrawerValue.Open`，不可滑動關閉）
 *
 * 尺寸類別沿用專案的 `LocalAdaptive`（那是版面尺寸判定，屬基礎設施，不是 W10M 視覺程式碼）。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaterialApp() {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val settings by Store.settings(ctx).collectAsStateWithLifecycle(initialValue = Settings())
    val adaptive = LocalAdaptive.current

    var pane by remember { mutableIntStateOf(0) }
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<hk.senyou.travel.data.SearchItem>>(emptyList()) }
    var searching by remember { mutableStateOf(false) }
    val drawer = rememberDrawerState(DrawerValue.Open)

    SenyouMaterialTheme(dark = settings.theme != "light") {
        val save: (Settings) -> Unit = { s -> scope.launch { Store.save(ctx, s) } }

        val scaffold: @Composable () -> Unit = {
            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text(M3_DESTS[pane].label) },
                        actions = {
                            IconButton(onClick = { pane = 0 }) {
                                Icon(Icons.Filled.Search, contentDescription = "搜尋")
                            }
                            IconButton(
                                onClick = {
                                    ctx.startActivity(Intent(ctx, StandbyActivity::class.java))
                                },
                            ) {
                                Icon(Icons.Filled.Alarm, contentDescription = "待機鬧鐘")
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = MaterialTheme.colorScheme.surface,
                        ),
                    )
                },
                bottomBar = {
                    if (!adaptive.isWide) {
                        NavigationBar {
                            M3_DESTS.forEachIndexed { i, d ->
                                NavigationBarItem(
                                    selected = i == pane,
                                    onClick = { pane = i },
                                    icon = { Icon(d.icon, contentDescription = null) },
                                    label = { Text(d.label) },
                                )
                            }
                        }
                    }
                },
            ) { padding ->
                Row(Modifier.padding(padding).fillMaxSize()) {
                    if (adaptive.sizeClass == hk.senyou.travel.ui.SizeClass.Medium) {
                        NavigationRail {
                            M3_DESTS.forEachIndexed { i, d ->
                                NavigationRailItem(
                                    selected = i == pane,
                                    onClick = { pane = i },
                                    icon = { Icon(d.icon, contentDescription = null) },
                                    label = { Text(d.label) },
                                )
                            }
                        }
                    }
                    Box(Modifier.weight(1f).fillMaxSize()) {
                        when (pane) {
                            0 -> MaterialHomePane(
                                settings = settings,
                                query = query,
                                onQuery = { q ->
                                    query = q
                                    if (q.isBlank()) {
                                        results = emptyList()
                                    } else {
                                        scope.launch {
                                            searching = true
                                            results = runCatching { hk.senyou.travel.data.SearchRepo.search(q, "bus") }
                                                .getOrDefault(emptyList())
                                            searching = false
                                        }
                                    }
                                },
                                results = results,
                                searching = searching,
                                onOpenStandby = {
                                    ctx.startActivity(Intent(ctx, StandbyActivity::class.java))
                                },
                            )

                            1 -> MaterialFavsPane(settings = settings)
                            2 -> MaterialSushiPane()
                            3 -> MaterialRoutesPane()
                            else -> MaterialSettingsPane(settings = settings, onSettings = save)
                        }
                    }
                }
            }
        }

        if (adaptive.isExpanded) {
            /* Expanded：M3 **常駐導覽抽屜** —— 抽屜與內容並排，內容讓位而非被覆蓋
               （先前誤用 ModalNavigationDrawer，抽屜會蓋住內容左半，導致文字整片看不到） */
            Row(Modifier.fillMaxSize()) {
                androidx.compose.material3.PermanentDrawerSheet {
                    Text(
                        "森友出行",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(start = 28.dp, top = 24.dp, bottom = 16.dp),
                    )
                    M3_DESTS.forEachIndexed { i, d ->
                        NavigationDrawerItem(
                            label = { Text(d.label) },
                            icon = { Icon(d.icon, contentDescription = null) },
                            selected = i == pane,
                            onClick = { pane = i },
                            modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding),
                        )
                    }
                }
                Box(Modifier.weight(1f)) { scaffold() }
            }
        } else {
            scaffold()
        }    }
}
