package hk.senyou.travel.ui.material

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
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
import hk.senyou.travel.data.Fav
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.data.StopRow
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.displayName
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Material 3 收藏頁：M3 卡片清單 + 即時 ETA + **完整操作對等**（釘選／換站／上移／下移／提示／移除）。
 *
 * 功能與 W10M 版一致，但視覺與元件全部使用 M3（`FilterChip` 表達可切換狀態、`AssistChip`
 * 表達動作、`ModalBottomSheet` 選站），不共用任何 W10M 視覺程式碼。
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun MaterialFavsPane(settings: Settings) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    var etas by remember { mutableStateOf<Map<String, Int?>>(emptyMap()) }

    // 換站：目前開啟站表的收藏；巴士站表需連網，港鐵／輕鐵走本機 StaticData
    var stopsFav by remember { mutableStateOf<Fav?>(null) }
    var stops by remember { mutableStateOf<List<StopRow>>(emptyList()) }
    var stopsLoading by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()

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
            val i = favs.indexOfFirst { it.key == f.key }
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
                    FlowRow(
                        Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        // 釘選與提示是「狀態」→ M3 FilterChip（selected 語意；選中以前置勾號表示）
                        FilterChip(
                            selected = settings.pinnedFav == f.key,
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
                                    if (settings.pinnedFav == f.key) Icons.Filled.Check else Icons.Filled.Star,
                                    contentDescription = null,
                                )
                            },
                        )
                        FilterChip(
                            selected = f.alertMins > 0,
                            onClick = {
                                scope.launch {
                                    val next = when (f.alertMins) {
                                        0 -> 3; 3 -> 5; 5 -> 10; else -> 0
                                    }
                                    Store.saveFavorites(
                                        ctx,
                                        favs.map { if (it.key == f.key) it.copy(alertMins = next) else it },
                                    )
                                }
                            },
                            label = { Text(if (f.alertMins > 0) "提示 ${f.alertMins} 分" else "提示 關") },
                            leadingIcon = {
                                Icon(
                                    if (f.alertMins > 0) Icons.Filled.Check else Icons.Filled.NotificationsActive,
                                    contentDescription = null,
                                )
                            },
                        )
                        // 動作 → M3 AssistChip（M3 外框樣式：surface 底 + outline 描邊）
                        AssistChip(
                            onClick = {
                                val local = f.localStationChoices()
                                stopsFav = f
                                if (local != null) {
                                    // 港鐵／輕鐵站表在本機（StaticData），即時展開不需連網
                                    stops = local
                                    stopsLoading = false
                                } else {
                                    stops = emptyList()
                                    stopsLoading = true
                                    scope.launch {
                                        stops = runCatching {
                                            SearchRepo.routeStops(f.route, f.favKind(), f.dir, f.routeId)
                                        }.getOrDefault(emptyList())
                                        stopsLoading = false
                                    }
                                }
                            },
                            label = { Text("換站") },
                            leadingIcon = { Icon(Icons.Filled.Place, contentDescription = null) },
                            border = AssistChipDefaults.assistChipBorder(enabled = true),
                        )
                        if (i > 0) {
                            AssistChip(
                                onClick = {
                                    scope.launch { Store.saveFavorites(ctx, favs.toMutableList().also { it.add(i - 1, it.removeAt(i)) }) }
                                },
                                label = { Text("上移") },
                                leadingIcon = { Icon(Icons.Filled.ArrowUpward, contentDescription = null) },
                                border = AssistChipDefaults.assistChipBorder(enabled = true),
                            )
                        }
                        if (i in 0 until favs.lastIndex) {
                            AssistChip(
                                onClick = {
                                    scope.launch { Store.saveFavorites(ctx, favs.toMutableList().also { it.add(i + 1, it.removeAt(i)) }) }
                                },
                                label = { Text("下移") },
                                leadingIcon = { Icon(Icons.Filled.ArrowDownward, contentDescription = null) },
                                border = AssistChipDefaults.assistChipBorder(enabled = true),
                            )
                        }
                        AssistChip(
                            onClick = {
                                scope.launch { Store.saveFavorites(ctx, favs.filterNot { it.key == f.key }) }
                            },
                            label = { Text("移除") },
                            leadingIcon = { Icon(Icons.Filled.Delete, contentDescription = null) },
                            colors = AssistChipDefaults.assistChipColors(
                                labelColor = MaterialTheme.colorScheme.error,
                                leadingIconContentColor = MaterialTheme.colorScheme.error,
                            ),
                            border = AssistChipDefaults.assistChipBorder(
                                enabled = true,
                                borderColor = MaterialTheme.colorScheme.outlineVariant,
                            ),
                        )
                    }
                }
            }
        }
    }

    stopsFav?.let { f ->
        ModalBottomSheet(onDismissRequest = { stopsFav = null }, sheetState = sheetState) {
            Column(Modifier.fillMaxWidth().padding(horizontal = 24.dp).padding(bottom = 24.dp)) {
                Text("選擇新車站", style = MaterialTheme.typography.titleLarge)
                Text(
                    f.displayName(),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(12.dp))
                when {
                    stopsLoading -> CircularProgressIndicator(Modifier.padding(16.dp))
                    stops.isEmpty() -> Text(
                        "暫無站表資料（請檢查網路後重試）",
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.padding(vertical = 16.dp),
                    )
                    else -> LazyColumn(Modifier.fillMaxWidth().heightIn(max = 420.dp)) {
                        items(stops, key = { it.stopId }) { row ->
                            ListItem(
                                headlineContent = { Text(row.name) },
                                supportingContent = { Text("第 ${row.seq} 站") },
                                modifier = Modifier.clickable {
                                    scope.launch { applyStopChange(ctx, settings, favs, f, row) }
                                    stopsFav = null
                                    stops = emptyList()
                                },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            )
                            HorizontalDivider()
                        }
                    }
                }
            }
        }
    }
}

/** 換站套用：港鐵需同步所屬綫路標籤；站名變更會改變 Fav.key，釘選要跟著搬。 */
private suspend fun applyStopChange(
    ctx: android.content.Context,
    settings: Settings,
    favs: List<Fav>,
    f: Fav,
    row: StopRow,
) {
    val updated = when (f.type) {
        "mtr" -> {
            val ln = StaticData.mtrLinesOf(row.stopId).firstOrNull()
            f.copy(
                stationCode = row.stopId,
                stationName = row.name,
                line = ln ?: f.line,
                lineName = ln?.let { StaticData.mtrLines[it] }?.takeIf { it.isNotBlank() } ?: f.lineName,
            )
        }
        "lrt" -> f.copy(stationCode = row.stopId, stationName = row.name, stopName = row.name)
        else -> f.copy(stopId = row.stopId, stopName = row.name)
    }
    Store.saveFavorites(ctx, favs.map { if (it.key == f.key) updated else it })
    val cur = runCatching { Store.settings(ctx).first() }.getOrDefault(settings)
    if (cur.pinnedFav == f.key) Store.save(ctx, cur.copy(pinnedFav = updated.key))
}

/** 收藏 → `SearchRepo.routeStops` 需要的公司分流（mtr / lrt 走本機站表）。 */
private fun Fav.favKind(): Kind = if (type == "mtrbus") Kind.MTRBUS else when (company) {
    "ctb" -> Kind.CTB
    "nlb" -> Kind.NLB
    else -> Kind.KMB
}

/** 港鐵／輕鐵可選站（本機靜態站表）；巴士回傳 null 表示需連網取站表。 */
private fun Fav.localStationChoices(): List<StopRow>? = when (type) {
    "mtr" -> StaticData.mtrLinesOf(stationCode.orEmpty())
        .flatMap { StaticData.mtrLineStops[it].orEmpty() }
        .distinctBy { it.code }
        .mapIndexed { i, st -> StopRow(i + 1, st.name, st.code, null) }
    "lrt" -> StaticData.lrtStations.entries.sortedBy { it.key }
        .mapIndexed { i, (id, name) -> StopRow(i + 1, name, id.toString(), null) }
    else -> null
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
