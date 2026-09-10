package hk.senyou.travel.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.MtrLineRow
import hk.senyou.travel.data.MtrRepo
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.ui.theme.V3

/** 路線圖頁：港鐵各線（每站上下行）+ 輕鐵分區站表（點站看實時） */
@Composable
fun LineMapScreen() {
    var mode by remember { mutableIntStateOf(0) }          // 0 港鐵 / 1 輕鐵
    val lines = remember { StaticData.mtrLines.keys.toList() }
    var lineIdx by remember { mutableIntStateOf(0) }
    var rows by remember { mutableStateOf<List<MtrLineRow>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var lrtSel by remember { mutableStateOf<Pair<Int, String>?>(null) }
    val singleColumn = LocalAdaptive.current.listColumns == 1

    LaunchedEffect(mode, lineIdx) {
        if (mode != 0) return@LaunchedEffect
        val code = lines.getOrNull(lineIdx) ?: return@LaunchedEffect
        loading = true
        rows = runCatching { MtrRepo.lineRows(code) }.getOrDefault(emptyList())
        loading = false
    }

    Column(Modifier.fillMaxSize()) {
        // 模式切換
        Row(Modifier.padding(horizontal = 16.dp, vertical = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("港鐵", "輕鐵").forEachIndexed { i, label ->
                val on = mode == i
                GlassSurface(
                    modifier = Modifier.heightIn(min = 40.dp).clickable { mode = i },
                    shape = V3.Shape,
                    strong = on,
                ) {
                    Box(
                        Modifier.background(if (on) V3.Accent else Color.Transparent).padding(horizontal = 18.dp),
                        contentAlignment = Alignment.Center,
                    ) { Text(label, color = if (on) Color.White else V3.Text2, fontSize = 13.sp) }
                }
            }
        }

        if (mode == 0) {
            // 線路選擇（橫向滾動，避免窄屏溢出裁切）
            Row(
                Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                lines.forEachIndexed { i, code ->
                    val on = i == lineIdx
                    GlassSurface(
                        modifier = Modifier.heightIn(min = 38.dp).clickable { lineIdx = i },
                        shape = V3.Shape,
                        strong = on,
                    ) {
                        Box(
                            Modifier.background(if (on) V3.Accent else Color.Transparent).padding(horizontal = 14.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                StaticData.mtrLines[code] ?: code,
                                color = if (on) Color.White else V3.Text2,
                                fontSize = 12.sp, maxLines = 1,
                            )
                        }
                    }
                }
            }
            if (loading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("載入中…", color = V3.Text2, fontSize = 14.sp) }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(LocalAdaptive.current.listColumns),
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    itemsIndexed(rows) { idx, r ->
                        Row(Modifier.fillMaxWidth().heightIn(min = 58.dp), verticalAlignment = Alignment.CenterVertically) {
                            // 站間連接線（僅單列模式；多列時每格獨立，畫線會錯亂）
                            Box(Modifier.width(36.dp).fillMaxHeight()) {
                                if (singleColumn) {
                                    Canvas(Modifier.fillMaxSize()) {
                                        val cx = size.width / 2f
                                        val top = if (idx == 0) size.height / 2f else 0f
                                        val bottom = if (idx == rows.lastIndex) size.height / 2f else size.height
                                        drawLine(
                                            color = V3.CoMtr,
                                            start = Offset(cx, top),
                                            end = Offset(cx, bottom),
                                            strokeWidth = 4.dp.toPx(),
                                            cap = StrokeCap.Round,
                                        )
                                    }
                                }
                                Box(
                                    Modifier.size(28.dp).align(Alignment.Center).clip(CircleShape).background(V3.CoMtr),
                                    contentAlignment = Alignment.Center,
                                ) { Text(r.code.take(3), color = Color.White, fontSize = 8.sp) }
                            }
                            Spacer(Modifier.size(10.dp))
                            Text(r.name, color = V3.Text1, fontSize = 15.sp, modifier = Modifier.weight(1f), maxLines = 1)
                            Column(horizontalAlignment = Alignment.End) {
                                // 0 分（即 <60 秒）顯示「即將」，與輕鐵到站表一致
                                Text(
                                    r.upMins?.let { if (it <= 0) "上行 即將" else "上行 $it 分" } ?: "上行 —",
                                    color = r.upMins?.let { tierColor(it) } ?: V3.Text2, fontSize = 13.sp,
                                )
                                Text(
                                    r.downMins?.let { if (it <= 0) "下行 即將" else "下行 $it 分" } ?: "下行 —",
                                    color = r.downMins?.let { tierColor(it) } ?: V3.Text2, fontSize = 13.sp,
                                )
                            }
                        }
                    }
                    item(span = { GridItemSpan(maxLineSpan) }) { Spacer(Modifier.height(110.dp)) }
                }
            }
        } else {
            // 輕鐵
            LazyVerticalGrid(
                columns = GridCells.Fixed(LocalAdaptive.current.listColumns),
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                MtrRepo.lrtGroups().forEach { (group, list) ->
                    item(key = "g-$group", span = { GridItemSpan(maxLineSpan) }) {
                        Text(group, color = V3.Aux, fontSize = 13.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 12.dp, bottom = 6.dp))
                    }
                    itemsIndexed(list, key = { _, s -> "lrt-${s.id}" }) { idx, s ->
                        Row(
                            Modifier.fillMaxWidth().heightIn(min = 52.dp).clickable { lrtSel = s.id to s.name },
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(Modifier.width(36.dp).fillMaxHeight()) {
                                if (singleColumn) {
                                    Canvas(Modifier.fillMaxSize()) {
                                        val cx = size.width / 2f
                                        val top = if (idx == 0) size.height / 2f else 0f
                                        val bottom = if (idx == list.lastIndex) size.height / 2f else size.height
                                        drawLine(
                                            color = V3.CoLrt,
                                            start = Offset(cx, top),
                                            end = Offset(cx, bottom),
                                            strokeWidth = 4.dp.toPx(),
                                            cap = StrokeCap.Round,
                                        )
                                    }
                                }
                                Box(
                                    Modifier.size(26.dp).align(Alignment.Center).clip(CircleShape).background(V3.CoLrt),
                                    contentAlignment = Alignment.Center,
                                ) { Text("${s.id}", color = Color.White, fontSize = 7.sp) }
                            }
                            Spacer(Modifier.size(10.dp))
                            Text(s.name, color = V3.Text1, fontSize = 15.sp, modifier = Modifier.weight(1f), maxLines = 1)
                            Text("看班次 ›", color = V3.Text2, fontSize = 12.sp)
                        }
                    }
                }
                item { Spacer(Modifier.height(110.dp)) }
            }
        }
    }

    lrtSel?.let { (id, name) -> LrtEtaSheet(id, name) { lrtSel = null } }
}

private fun tierColor(mins: Int): Color = when {
    mins <= 2 -> V3.Danger
    mins <= 10 -> V3.Warning
    else -> V3.Success
}

@Composable
private fun LrtEtaSheet(stationId: Int, name: String, onClose: () -> Unit) {
    var list by remember { mutableStateOf<List<Api.LrtEta>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(stationId) {
        list = runCatching { Api.lrtEta(stationId) }.getOrDefault(emptyList())
        loading = false
    }
    Box(
        Modifier.fillMaxSize().background(Color(0xC0000000)).clickable { onClose() },
        contentAlignment = Alignment.BottomCenter,
    ) {
        GlassSurface(
            modifier = Modifier.fillMaxWidth().padding(14.dp),
            shape = V3.Shape,
            strong = true,
        ) {
            Column(Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(name, color = V3.Text1, fontSize = 20.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
                    Text("輕鐵 $stationId", color = V3.Text2, fontSize = 12.sp)
                }
                Spacer(Modifier.height(10.dp))
                if (loading) {
                    Text("載入中…", color = V3.Text2, fontSize = 13.sp)
                } else if (list.isEmpty()) {
                    Text("暫無到站資料", color = V3.Text2, fontSize = 13.sp)
                } else {
                    list.take(6).forEach { e ->
                        Row(Modifier.fillMaxWidth().heightIn(min = 46.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                Modifier.size(34.dp).clip(V3.Shape).background(V3.CoLrt.copy(alpha = 0.25f)),
                                contentAlignment = Alignment.Center,
                            ) { Text(e.routeNo, color = V3.Text1, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                            Spacer(Modifier.size(10.dp))
                            Column(Modifier.weight(1f)) {
                                Text("往 ${e.dest}", color = V3.Text1, fontSize = 14.sp, maxLines = 1)
                                Text("${e.platformId} 號月台" + if (e.departing) " · 已離站" else "", color = V3.Text2, fontSize = 11.sp)
                            }
                            Text(
                                if (e.mins <= 0) "即將" else "${e.mins} 分",
                                color = tierColor(e.mins), fontSize = 18.sp, fontWeight = FontWeight.Light,
                            )
                        }
                    }
                }
            }
        }
    }
}