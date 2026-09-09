package hk.senyou.travel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.Store
import hk.senyou.travel.ui.theme.V3
import kotlinx.coroutines.launch

private val ACCENTS = listOf(
    0xFF0078D7L to "藍",
    0xFF00ABA9L to "青綠",
    0xFFAA00FFL to "紫",
    0xFF6A00FFL to "靛",
)

/** 設定頁（v3 全項） */
@Composable
fun SettingsScreen(s: Settings) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    fun set(block: Settings.() -> Settings) = scope.launch { Store.save(ctx, s.block()) }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 110.dp),
    ) {
        GroupTitle("外觀")
        SegRow("玻璃強度", "0 無玻璃 → 4 濃郁",
            listOf("0" to "無", "1" to "淡", "2" to "標準", "3" to "深", "4" to "濃"),
            s.glass.toString()) { v -> set { copy(glass = v.toInt()) } }
        SegRow("動效模式", "完整 / 簡約 / 關閉",
            listOf("full" to "完整", "simple" to "簡約", "off" to "關閉"), s.fx) { v -> set { copy(fx = v) } }
        SwitchRow("大字模式", "全局字體 +15%", s.big) { set { copy(big = it) } }
        SwitchRow("深夜模式", "冷色數字 · 背景轉暗", s.deep) { set { copy(deep = it) } }
        SegRow("夜間情境", "跟隨系統 / 手動 / 定時",
            listOf("system" to "系統", "manual" to "手動", "auto" to "定時"), s.night) { v -> set { copy(night = v) } }
        Row(
            Modifier.fillMaxWidth().padding(vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text("強調色", color = V3.Text1, fontSize = 15.sp)
                Text("藍 · 青綠 · 紫 · 靛", color = V3.Text2, fontSize = 12.sp)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ACCENTS.forEach { (value, name) ->
                    val on = s.accent == value
                    Box(
                        Modifier
                            .size(if (on) 34.dp else 30.dp)
                            .clip(CircleShape)
                            .background(Color(value))
                            .clickable { set { copy(accent = value) } },
                        contentAlignment = Alignment.Center,
                    ) {
                        if (on) Text("✓", color = Color.White, fontSize = 13.sp)
                    }
                }
            }
        }

        GroupTitle("出行")
        SegRow("自動重新整理", "首頁磁貼",
            listOf("30" to "30s", "60" to "60s", "0" to "關"), s.refresh.toString()) { v -> set { copy(refresh = v.toInt()) } }
        Row(
            Modifier.fillMaxWidth().padding(vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("版本", color = V3.Text1, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Text("原生 v3 · M3", color = V3.Text2, fontSize = 13.sp)
        }
        Spacer(Modifier.height(20.dp))
    }
}

@Composable
private fun GroupTitle(t: String) {
    Text(
        t, color = V3.Aux, fontSize = 13.sp, fontWeight = FontWeight.Bold,
        letterSpacing = 0.5.sp, modifier = Modifier.padding(top = 14.dp, bottom = 6.dp),
    )
}

@Composable
private fun SegRow(title: String, cap: String, options: List<Pair<String, String>>, current: String, onPick: (String) -> Unit) {
    Column(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(title, color = V3.Text1, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Text(cap, color = V3.Text2, fontSize = 12.sp)
        }
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            options.forEach { (value, label) ->
                val on = value == current
                GlassSurface(
                    modifier = Modifier.weight(1f).height(38.dp).clickable { onPick(value) },
                    shape = RoundedCornerShape(999.dp),
                    strong = on,
                ) {
                    Box(
                        Modifier.background(if (on) V3.Accent else Color.Transparent),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(label, color = if (on) Color.White else V3.Text2, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun SwitchRow(title: String, cap: String, on: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, color = V3.Text1, fontSize = 15.sp)
            Text(cap, color = V3.Text2, fontSize = 12.sp)
        }
        Box(
            Modifier
                .size(width = 48.dp, height = 28.dp)
                .clip(RoundedCornerShape(999.dp))
                .background(if (on) V3.Accent.copy(alpha = 0.45f) else Color.White.copy(alpha = 0.10f))
                .clickable { onChange(!on) },
        ) {
            Box(
                Modifier
                    .padding(start = if (on) 22.dp else 3.dp, top = 3.dp)
                    .size(22.dp)
                    .clip(CircleShape)
                    .background(if (on) V3.Accent else V3.Text2)
            )
        }
    }
}
