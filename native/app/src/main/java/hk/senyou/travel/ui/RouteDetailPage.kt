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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.StopRow
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.TrainRow
import hk.senyou.travel.data.matchKey
import hk.senyou.travel.data.toFav
import hk.senyou.travel.ui.theme.V3
import kotlinx.coroutines.launch

/** 路線詳情（原生）：去程/回程分頁 + 每站 ETA */
@Composable
fun RouteDetailPage(item: SearchItem, onClose: () -> Unit) {
    var tab by remember { mutableIntStateOf(0) }
    var rows by remember { mutableStateOf<List<StopRow>>(emptyList()) }
    var trains by remember { mutableStateOf<List<TrainRow>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    val twoWay = item.kind == Kind.KMB || item.kind == Kind.CTB
    val isStation = item.kind == Kind.MTR || item.kind == Kind.LRT
    val status = WindowInsets.statusBars.asPaddingValues()
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    val starred = favs.any { it.matchKey() == item.matchKey() }

    LaunchedEffect(tab, item) {
        loading = true
        rows = emptyList()
        trains = emptyList()
        // 港鐵 / 輕鐵站：直接列上下行班次（收藏卡片與到站通知都走這裡）
        if (isStation) {
            trains = SearchRepo.stationTrains(item)
            loading = false
            return@LaunchedEffect
        }
        val route = item.route
        if (route.isNullOrBlank()) {
            loading = false
            return@LaunchedEffect
        }
        val dir = if (tab == 0) "outbound" else "inbound"
        rows = SearchRepo.routeStops(route, item.kind, dir, item.routeId)
        loading = false
    }

    Box(
        Modifier
            .fillMaxSize()
            .background(Color(0xF0090A0F)),
    ) {
        Column(Modifier.fillMaxSize().padding(top = status.calculateTopPadding())) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
                    .height(56.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier.size(40.dp).clip(CircleShape).background(coColor(item.kind.toCo())),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(item.no.take(4), color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.size(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        if (isStation) "${item.stationName ?: item.name} 站" else "${item.no} 路線詳情",
                        color = V3.Text1, fontSize = 19.sp, fontWeight = FontWeight.Light, maxLines = 1,
                    )
                    Text(if (isStation) item.cap else item.name, color = V3.Text2, fontSize = 12.sp, maxLines = 1)
                }
                // 語音播報
                GlassSurface(
                    modifier = Modifier.size(40.dp).semantics { contentDescription = "語音播報" }
                        .clickable {
                            if (isStation) {
                                val t = trains.firstOrNull()
                                val tm = t?.mins
                                Tts.speak(
                                    if (t != null) {
                                        "${item.stationName ?: item.name}，${t.dirLabel}，往 ${t.dest}，" +
                                            if (tm == null || tm <= 0) "即將到站" else "$tm 分鐘"
                                    } else "${item.stationName ?: item.name}，暫無班次"
                                )
                            } else {
                                val first = rows.firstOrNull { it.mins != null }
                                val firstMins = first?.mins
                                Tts.speak(
                                    if (first != null && firstMins != null) {
                                        "${item.no}，${first.name}，${if (firstMins <= 0) "即將到站" else "$firstMins 分鐘"}"
                                    } else "${item.no}，暫無班次"
                                )
                            }
                        },
                    shape = CircleShape,
                ) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("🔊", fontSize = 15.sp)
                    }
                }
                Spacer(Modifier.size(8.dp))
                // 收藏本路線
                GlassSurface(
                    modifier = Modifier.size(40.dp).semantics {
                        contentDescription = if (starred) "取消收藏" else "收藏路線"
                    }.clickable {
                        scope.launch {
                            val next = if (starred) favs.filterNot { it.matchKey() == item.matchKey() }
                            else favs + item.toFav()
                            Store.saveFavorites(ctx, next)
                        }
                    },
                    shape = CircleShape,
                    strong = starred,
                ) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(
                            if (starred) "★" else "☆",
                            color = if (starred) V3.Warning else V3.Text2,
                            fontSize = 18.sp,
                        )
                    }
                }
                Spacer(Modifier.size(8.dp))
                GlassSurface(modifier = Modifier.size(40.dp).clickable { onClose() }, shape = CircleShape) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("✕", color = V3.Text1, fontSize = 15.sp)
                    }
                }
            }

            if (twoWay) {
                Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("去程", "回程").forEachIndexed { i, label ->
                        val on = tab == i
                        GlassSurface(
                            modifier = Modifier.height(40.dp).clickable { tab = i },
                            shape = RoundedCornerShape(999.dp),
                            strong = on,
                        ) {
                            Box(
                                Modifier.background(if (on) V3.Accent else Color.Transparent).padding(horizontal = 18.dp),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(label, color = if (on) Color.White else V3.Text2, fontSize = 13.sp)
                            }
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
            }

            when {
                loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("載入中…", color = V3.Text2, fontSize = 14.sp)
                }
                isStation -> {
                    if (trains.isEmpty()) {
                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("暫無班次資料", color = V3.Text2, fontSize = 14.sp)
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                        ) {
                            itemsIndexed(trains) { _, t ->
                                Row(
                                    Modifier.fillMaxWidth().height(60.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Box(
                                        Modifier.widthIn(min = 44.dp).height(26.dp)
                                            .clip(RoundedCornerShape(999.dp))
                                            .background(V3.CoMtr.copy(alpha = 0.22f)),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        Box(Modifier.padding(horizontal = 8.dp)) {
                                            Text(t.dirLabel, color = V3.Text1, fontSize = 11.sp, maxLines = 1)
                                        }
                                    }
                                    Spacer(Modifier.size(12.dp))
                                    Column(Modifier.weight(1f)) {
                                        Text("往 ${t.dest}", color = V3.Text1, fontSize = 15.sp, maxLines = 1)
                                        if (t.plat.isNotBlank()) {
                                            Text("${t.plat} 號月台", color = V3.Text2, fontSize = 11.sp)
                                        }
                                    }
                                    if (t.mins != null && t.mins <= 0) {
                                        Text("即將", color = V3.Danger, fontSize = 16.sp, fontWeight = FontWeight.Light)
                                    } else {
                                        val c = when {
                                            t.mins == null -> V3.Text2
                                            t.mins <= 2 -> V3.Danger
                                            t.mins <= 10 -> V3.Warning
                                            else -> V3.Success
                                        }
                                        Row(verticalAlignment = Alignment.Bottom) {
                                            Text("${t.mins}", color = c, fontSize = 20.sp, fontWeight = FontWeight.Light)
                                            Text(" 分", color = V3.Text2, fontSize = 11.sp, modifier = Modifier.padding(bottom = 3.dp))
                                        }
                                    }
                                }
                            }
                            item { Spacer(Modifier.height(24.dp)) }
                        }
                    }
                }
                rows.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("無法載入站點", color = V3.Text2, fontSize = 14.sp)
                }
                else -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                ) {
                    itemsIndexed(rows) { _, r ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .height(60.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(
                                Modifier.size(32.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.08f)),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text("${r.seq}", color = V3.Text2, fontSize = 11.sp)
                            }
                            Spacer(Modifier.size(12.dp))
                            Text(r.name, color = V3.Text1, fontSize = 15.sp, modifier = Modifier.weight(1f), maxLines = 1)
                            if (r.mins != null) {
                                if (r.mins <= 0) {
                                    Text("即將", color = V3.Danger, fontSize = 16.sp, fontWeight = FontWeight.Light)
                                } else {
                                    val c = when {
                                        r.mins <= 2 -> V3.Danger
                                        r.mins <= 10 -> V3.Warning
                                        else -> V3.Success
                                    }
                                    Row(verticalAlignment = Alignment.Bottom) {
                                        Text("${r.mins}", color = c, fontSize = 20.sp, fontWeight = FontWeight.Light)
                                        Text(" 分", color = V3.Text2, fontSize = 11.sp, modifier = Modifier.padding(bottom = 3.dp))
                                    }
                                }
                            } else {
                                Text("—", color = V3.Text2, fontSize = 18.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
