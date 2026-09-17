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
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Train
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.clickable
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.BusMarker
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.K75PModel
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.data.TrainRow

/**
 * Material 3 路線頁：K75P 實時班次卡 + 港鐵各路線可展開站表，
 * 點站以 **M3 ModalBottomSheet** 顯示班次與首尾班（獨立實作，僅共用 data 層）。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaterialRoutesPane(onOpenK75P: () -> Unit = {}) {
    var k75p by remember { mutableStateOf<List<BusMarker>>(emptyList()) }
    var expandedLine by remember { mutableStateOf<String?>(null) }
    var sheetStation by remember { mutableStateOf<Pair<String, String>?>(null) }
    var sheetTrains by remember { mutableStateOf<List<TrainRow>>(emptyList()) }
    var sheetSpan by remember { mutableStateOf<Pair<String, String>?>(null) }
    var sheetLoading by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()

    LaunchedEffect(Unit) {
        if (!DebugFlags.staticUi) {
            runCatching {
                Api.mtrBusSchedule("K75P")?.let { k75p = K75PModel.build(it, emptyMap()) }
            }
        }
    }

    LaunchedEffect(sheetStation) {
        val st = sheetStation ?: return@LaunchedEffect
        sheetLoading = true
        sheetTrains = emptyList()
        sheetSpan = null
        runCatching {
            val item = SearchItem(
                kind = Kind.MTR,
                no = "MTR",
                name = st.second,
                stationCode = st.first,
                stationName = st.second,
            )
            sheetTrains = SearchRepo.stationTrains(item)
            sheetSpan = SearchRepo.stationFirstLast(item)
        }
        sheetLoading = false
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text("K75P · 天瑞 ↺ 洪水橋") },
                        supportingContent = { Text("輕鐵接駁巴士 · 23 站") },
                        leadingContent = {
                            Icon(
                                Icons.Filled.DirectionsBus,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                            )
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    Row(
                        Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        androidx.compose.material3.FilledTonalButton(onClick = onOpenK75P) {
                            Text("查看地圖")
                        }
                    }
                    HorizontalDivider()
                    if (k75p.isEmpty()) {
                        ListItem(
                            headlineContent = { Text("暫無實時班次") },
                            supportingContent = { Text("需要網路連線") },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                    } else {
                        k75p.take(3).forEach { m ->
                            ListItem(
                                headlineContent = { Text("巴士 ${m.id}") },
                                supportingContent = { Text("下一站 ${m.nextName}") },
                                trailingContent = {
                                    Text(
                                        if (m.mins <= 0) "即將" else "${m.mins} 分",
                                        style = MaterialTheme.typography.titleMedium,
                                    )
                                },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            )
                        }
                    }
                }
            }
        }

        item {
            Text(
                "港鐵路線",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(top = 8.dp),
            )
        }

        items(StaticData.mtrLines.keys.toList()) { code ->
            val name = StaticData.mtrLines[code] ?: code
            val stations = StaticData.mtrLineStops[code] ?: emptyList()
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text(name) },
                        supportingContent = { Text("${stations.size} 站") },
                        leadingContent = {
                            Icon(
                                Icons.Filled.Train,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                            )
                        },
                        trailingContent = {
                            Icon(
                                if (expandedLine == code) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                                contentDescription = if (expandedLine == code) "收起" else "展開",
                            )
                        },
                        modifier = Modifier.clickableRow {
                            expandedLine = if (expandedLine == code) null else code
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    if (expandedLine == code) {
                        HorizontalDivider()
                        stations.take(40).forEach { st ->
                            ListItem(
                                headlineContent = { Text(st.name) },
                                supportingContent = { Text(st.code) },
                                modifier = Modifier.clickableRow { sheetStation = st.code to st.name },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            )
                        }
                    }
                }
            }
        }

        item { Spacer(Modifier.height(24.dp)) }
    }

    sheetStation?.let { st ->
        ModalBottomSheet(onDismissRequest = { sheetStation = null }, sheetState = sheetState) {
            Column(Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 8.dp)) {
                Text(st.second, style = MaterialTheme.typography.headlineSmall)
                sheetSpan?.let { (first, last) ->
                    Text(
                        "首班 $first · 尾班 $last（由全日班表推算）",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.height(12.dp))
                if (sheetLoading) {
                    CircularProgressIndicator(Modifier.padding(16.dp))
                } else if (sheetTrains.isEmpty()) {
                    Text(
                        "暫無班次資料",
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.padding(vertical = 16.dp),
                    )
                } else {
                    sheetTrains.take(12).forEach { tr ->
                        ListItem(
                            headlineContent = { Text("${tr.dirLabel} → ${tr.dest}") },
                            supportingContent = { Text(if (tr.plat.isNotBlank()) "月台 ${tr.plat}" else "") },
                            trailingContent = {
                                Text(
                                    tr.mins?.let { if (it <= 0) "即將" else "$it 分" } ?: "—",
                                    style = MaterialTheme.typography.titleMedium,
                                )
                            },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

/** M3 的可點清單列（ListItem 本身不吃 onClick，需自行加 clickable） */
private fun Modifier.clickableRow(onClick: () -> Unit): Modifier =
    this.clickable(onClick = onClick)
