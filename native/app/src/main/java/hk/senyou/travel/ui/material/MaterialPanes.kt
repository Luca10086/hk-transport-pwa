package hk.senyou.travel.ui.material

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.Cache
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.displayName
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/** Material 3 收藏頁：M3 卡片清單 + 即時 ETA 徽章 + 釘選／刪除。 */
@Composable
fun MaterialFavsPane(settings: Settings) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    var etas by remember { mutableStateOf<Map<String, Int?>>(emptyMap()) }

    LaunchedEffect(favs) {
        if (DebugFlags.staticUi || favs.isEmpty()) return@LaunchedEffect
        runCatching {
            val m = mutableMapOf<String, Int?>()
            favs.forEach { f -> m[f.key] = runCatching { SearchRepo.favEta(f) }.getOrNull() }
            etas = m
        }
    }

    if (favs.isEmpty()) {
        Column(
            Modifier.fillMaxWidth().padding(32.dp),
            horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
        ) {
            Text("尚未加入收藏", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            Text(
                "在首頁搜尋後按 ☆ 即可加入；收藏會顯示即時到站時間",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(favs, key = { it.key }) { f ->
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text(f.displayName()) },
                        supportingContent = { Text(SearchRepo.favMeta(f)) },
                        trailingContent = {
                            val mins = etas[f.key] ?: Cache.etaCache(f.key)?.first
                            Text(
                                mins?.let { if (it <= 0) "即將" else "$it 分" } ?: "—",
                                style = MaterialTheme.typography.headlineSmall,
                            )
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    HorizontalDivider()
                    Row(
                        Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        AssistChip(
                            onClick = {
                                scope.launch {
                                    val cur = runCatching { Store.settings(ctx).first() }.getOrDefault(settings)
                                    Store.save(
                                        ctx,
                                        cur.copy(pinnedFav = if (cur.pinnedFav == f.key) "" else f.key),
                                    )
                                }
                            },
                            label = { Text(if (settings.pinnedFav == f.key) "已釘選" else "釘選") },
                            leadingIcon = {
                                Icon(
                                    Icons.Filled.Star,
                                    contentDescription = null,
                                    tint = if (settings.pinnedFav == f.key) {
                                        MaterialTheme.colorScheme.primary
                                    } else {
                                        MaterialTheme.colorScheme.onSurfaceVariant
                                    },
                                )
                            },
                        )
                        AssistChip(
                            onClick = {
                                scope.launch { Store.saveFavorites(ctx, favs.filterNot { it.key == f.key }) }
                            },
                            label = { Text("移除") },
                            leadingIcon = { Icon(Icons.Filled.Delete, contentDescription = null) },
                        )
                    }
                }
            }
        }
    }
}

/** Material 3 壽司郎排隊頁。 */
@Composable
fun MaterialSushiPane() {
    var stores by remember { mutableStateOf<List<hk.senyou.travel.data.SushiroStore>>(emptyList()) }
    var live by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        runCatching {
            val (list, isLive) = hk.senyou.travel.data.Sushiro.fetch()
            stores = list
            live = isLive
        }
    }
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text(
                if (live) "即時排隊組數" else "離線快照",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 4.dp),
            )
        }
        items(stores.size) { i ->
            val s = stores[i]
            Card(Modifier.fillMaxWidth()) {
                ListItem(
                    headlineContent = { Text(s.name) },
                    supportingContent = { Text(listOf(s.area, s.status).filter { it.isNotBlank() }.joinToString(" · ")) },
                    trailingContent = {
                        Text("${s.waiting} 組", style = MaterialTheme.typography.titleLarge)
                    },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                )
            }
        }
    }
}
