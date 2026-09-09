package hk.senyou.travel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.Sushiro
import hk.senyou.travel.data.SushiroStore
import hk.senyou.travel.ui.theme.V3

/** 壽司郎排隊（實時優先，快照兜底） */
@Composable
fun SushiScreen() {
    var stores by remember { mutableStateOf<List<SushiroStore>>(emptyList()) }
    var live by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        val (list, isLive) = Sushiro.fetch()
        stores = list.sortedByDescending { it.waiting }
        live = isLive
        loading = false
    }

    val local = stores.filter { it.area.contains("元朗") || it.area.contains("屯門") || it.area.contains("天水圍") }
    val shown = if (local.isNotEmpty()) local else stores

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.padding(horizontal = 16.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("壽司郎排隊", color = V3.Text1, fontSize = 22.sp, fontWeight = FontWeight.Light)
            Spacer(Modifier.weight(1f))
            Box(
                Modifier.clip(RoundedCornerShape(999.dp))
                    .background(if (live) V3.Success.copy(alpha = 0.2f) else V3.Text2.copy(alpha = 0.15f))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(if (live) "實時" else "快照", color = if (live) V3.Success else V3.Text2, fontSize = 11.sp)
            }
        }
        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("載入中…", color = V3.Text2, fontSize = 14.sp) }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
            ) {
                items(shown) { s ->
                    Row(
                        Modifier.fillMaxWidth().height(64.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            Modifier.size(40.dp).clip(CircleShape).background(V3.Accent.copy(alpha = 0.18f)),
                            contentAlignment = Alignment.Center,
                        ) { Text(s.name.take(1), color = V3.Text1, fontSize = 15.sp) }
                        Spacer(Modifier.size(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(s.name, color = V3.Text1, fontSize = 15.sp, maxLines = 1)
                            Text(s.area, color = V3.Text2, fontSize = 12.sp, maxLines = 1)
                        }
                        if (s.status.isNotBlank() && s.status != "OPEN") {
                            Text("休息", color = V3.Text2, fontSize = 13.sp)
                        } else {
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text("${s.waiting}", color = if (s.waiting >= 40) V3.Danger else V3.Success, fontSize = 22.sp, fontWeight = FontWeight.Light)
                                Text(" 組", color = V3.Text2, fontSize = 11.sp, modifier = Modifier.padding(bottom = 3.dp))
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(110.dp)) }
            }
        }
    }
}
