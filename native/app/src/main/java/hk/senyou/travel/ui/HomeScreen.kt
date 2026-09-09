package hk.senyou.travel.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.ui.theme.V3
import kotlinx.coroutines.delay

private val MODES = listOf("bus" to "公交", "mtrbus" to "港鐵巴士", "mtr" to "港鐵", "lrt" to "輕鐵")

/** 首頁（M2：真實搜索 + ETA） */
@Composable
fun HomeScreen(onOpenK75P: () -> Unit, onOpenRoute: (SearchItem) -> Unit) {
    var mode by remember { mutableIntStateOf(0) }
    var query by remember { mutableStateOf("") }
    var items by remember { mutableStateOf<List<SearchItem>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var k75pMins by remember { mutableStateOf<Int?>(null) }
    var k75pLive by remember { mutableStateOf(0) }

    LaunchedEffect(Unit) {
        while (true) {
            val d = Api.mtrBusSchedule("K75P")
            val arr = d?.optJSONArray("busStop")
            var best: Int? = null
            var live = 0
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    val stop = arr.optJSONObject(i) ?: continue
                    val buses = stop.optJSONArray("bus") ?: continue
                    for (j in 0 until buses.length()) {
                        val b = buses.optJSONObject(j) ?: continue
                        val sec = b.optInt("arrivalTimeInSecond", 0)
                        if (sec in 1 until 108000) {
                            val m = (sec + 59) / 60
                            if (best == null || m < best) best = m
                        }
                        val loc = b.optJSONObject("busLocation")
                        if (loc != null && loc.optDouble("latitude", 0.0) != 0.0) live++
                    }
                }
            }
            k75pMins = best
            k75pLive = live
            delay(30_000)
        }
    }

    LaunchedEffect(query, mode) {
        if (query.isBlank()) {
            items = emptyList()
            loading = false
            return@LaunchedEffect
        }
        delay(350)
        loading = true
        val base = SearchRepo.search(query, MODES[mode].first)
        items = base
        items = SearchRepo.fillEtas(base)
        loading = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 110.dp),
    ) {
        Tile(
            label = "K75P 天瑞 ↺ 洪水橋 · 實時 $k75pLive 班在路",
            value = k75pMins?.toString() ?: "—",
            unit = " 分鐘",
            valueColor = V3.Accent,
            live = k75pLive > 0,
            modifier = Modifier.fillMaxWidth(),
            onClick = onOpenK75P,
            extra = { K75PMiniMap(Modifier.fillMaxWidth().height(62.dp)) },
        )
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tile(
                label = "我的收藏",
                value = "0",
                unit = " 條",
                cap = "M3 接入",
                valueColor = V3.Accent,
                modifier = Modifier.weight(1f),
            )
            Tile(
                label = "天氣 · 三天",
                value = "--",
                unit = "°",
                cap = "M3 接入",
                modifier = Modifier.weight(1f),
            )
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tile(label = "壽司郎", value = "—", unit = " 組", modifier = Modifier.weight(1f))
            Tile(label = "路線圖", value = "屯馬", unit = "綫", cap = "全線候車", valueColor = V3.CoMtr, modifier = Modifier.weight(1f))
        }

        Spacer(Modifier.height(16.dp))
        SearchPill(
            placeholder = "輸入路線、站名或港鐵車站",
            value = query,
            onValueChange = { query = it },
        )
        Spacer(Modifier.height(10.dp))
        ChipRow(MODES.map { it.second }, mode) { mode = it }
        Spacer(Modifier.height(6.dp))

        when {
            loading -> Text("搜尋中…", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 18.dp))
            query.isNotBlank() && items.isEmpty() -> Text("沒有結果", color = V3.Text2, fontSize = 13.sp, modifier = Modifier.padding(vertical = 18.dp))
            else -> items.forEach { it ->
                ResultRow(
                    no = it.no,
                    co = it.kind.toCo(),
                    name = it.name,
                    cap = it.cap,
                    etaMins = it.etaMins,
                    star = false,
                ) { onOpenRoute(it) }
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

fun Kind.toCo(): Co = when (this) {
    Kind.KMB -> Co.KMB
    Kind.CTB -> Co.CTB
    Kind.NLB -> Co.NLB
    Kind.MTR -> Co.MTR
    Kind.LRT -> Co.LRT
    Kind.MTRBUS -> Co.MTRBUS
    Kind.BUSSTOP -> Co.KMB
}
