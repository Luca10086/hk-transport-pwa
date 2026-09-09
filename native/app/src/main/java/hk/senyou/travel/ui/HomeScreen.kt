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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import hk.senyou.travel.ui.theme.V3

private data class DemoRow(val no: String, val co: Co, val name: String, val cap: String, val eta: Int, val star: Boolean)

/** 首頁（M1：佈局 + 視覺全量；真實數據在 M2 接入） */
@Composable
fun HomeScreen(onOpenK75P: () -> Unit) {
    var chip by remember { mutableIntStateOf(0) }
    val rows = remember {
        listOf(
            DemoRow("69X", Co.KMB, "天瑞 → 高鐵(西九龍站)", "去程 · 天瑞總站", 480, true),
            DemoRow("969", Co.CTB, "天水圍市中心 → 銅鑼灣(摩頓台)", "去程 · 大欖隧道直達", 840, true),
            DemoRow("K75P", Co.MTRBUS, "天瑞 ↺ 洪水橋", "實時 GPS · 3 班在路", 62, true),
            DemoRow("B2", Co.NLB, "元朗站 → 深圳灣口岸", "去程", 180, false),
            DemoRow("屯馬綫", Co.MTR, "天水圍 → 尖東", "上行 · 3 分鐘後", 168, false),
            DemoRow("710", Co.LRT, "天瑞 → 元朗", "輕鐵 · 11 班/時", 120, false),
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 110.dp),
    ) {
        // K75P 實時磁貼（寬）
        Tile(
            label = "K75P 天瑞 ↺ 洪水橋 · 實時 3 班在路",
            value = "9",
            unit = " 分鐘",
            valueColor = V3.Accent,
            live = true,
            modifier = Modifier.fillMaxWidth(),
            onClick = onOpenK75P,
            extra = { K75PMiniMap(Modifier.fillMaxWidth().height(62.dp)) },
        )
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tile(
                label = "我的收藏",
                value = "7",
                unit = " 條",
                cap = "下一班 69X · 8 分",
                valueColor = V3.Accent,
                live = true,
                modifier = Modifier.weight(1f),
            )
            Tile(
                label = "天氣 · 三天",
                value = "35",
                unit = "°",
                cap = "🌤️ 今31° 明31° 後31°",
                live = true,
                modifier = Modifier.weight(1f),
            )
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Tile(label = "壽司郎", value = "46", unit = " 組", modifier = Modifier.weight(1f))
            Tile(label = "路線圖", value = "屯馬", unit = "綫", cap = "全線候車", valueColor = V3.CoMtr, modifier = Modifier.weight(1f))
        }

        Spacer(Modifier.height(16.dp))
        SearchPill("輸入路線、站名或港鐵車站")
        Spacer(Modifier.height(10.dp))
        ChipRow(listOf("公交", "港鐵巴士", "港鐵", "輕鐵", "通宵"), chip) { chip = it }
        Spacer(Modifier.height(6.dp))

        rows.forEach { r ->
            ResultRow(r.no, r.co, r.name, r.cap, r.eta, r.star) { }
            Spacer(Modifier.height(8.dp))
        }
    }
}
