package hk.senyou.travel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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

    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
        Column(
            Modifier
                .widthIn(max = 760.dp)
                .fillMaxHeight()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp)
                .padding(bottom = 110.dp),
        ) {
        GroupTitle("外觀")
        SegRow("主題", "深色 / 淺色",
            listOf("dark" to "深色", "light" to "淺色"), s.theme) { v -> set { copy(theme = v) } }
        SegRow("玻璃強度", "面板色調濃度（不再做 GPU 模糊，避免閃退）",
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
                            .clip(V3.Shape)
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

        GroupTitle("診斷")
        // 閃退守護：連續異常自動進安全模式，可在這裡手動關閉
        var safeMode by remember { mutableStateOf(hk.senyou.travel.data.CrashGuard.isSafeMode(ctx)) }
        SwitchRow(
            "安全模式",
            if (safeMode) "已開啟：關閉玻璃與動效（連續閃退自動啟用）" else "關閉：保留玻璃與動效",
            safeMode,
        ) { on ->
            hk.senyou.travel.data.CrashGuard.setSafeMode(ctx, on)
            safeMode = on
        }
        var crashCount by remember { mutableIntStateOf(hk.senyou.travel.data.CrashLog.count(ctx)) }
        var logText by remember { mutableStateOf<String?>(null) }
        Row(
            Modifier.fillMaxWidth().padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text("崩潰日誌", color = V3.Text1, fontSize = 15.sp)
                Text(
                    if (crashCount > 0) "最近 $crashCount 份（僅本地，不上傳）" else "暫無記錄（僅本地，不上傳）",
                    color = V3.Text2, fontSize = 12.sp,
                )
            }
            if (crashCount > 0) {
                GlassSurface(modifier = Modifier.heightIn(min = 38.dp).clickable {
                    logText = hk.senyou.travel.data.CrashLog.latestText(ctx) ?: "（讀取失敗）"
                }, shape = V3.Shape) {
                    Box(Modifier.padding(horizontal = 16.dp), contentAlignment = Alignment.Center) {
                        Text("查看", color = V3.Text1, fontSize = 13.sp)
                    }
                }
                Spacer(Modifier.size(8.dp))
                GlassSurface(modifier = Modifier.heightIn(min = 38.dp).clickable {
                    hk.senyou.travel.data.CrashLog.clear(ctx)
                    crashCount = 0
                }, shape = V3.Shape) {
                    Box(Modifier.padding(horizontal = 16.dp), contentAlignment = Alignment.Center) {
                        Text("清除", color = V3.Text2, fontSize = 13.sp)
                    }
                }
            }
        }
        logText?.let { text ->
            GlassSurface(modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
                Column(Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("最近一次崩潰", color = V3.Text1, fontSize = 14.sp, modifier = Modifier.weight(1f))
                        Text("✕", color = V3.Text2, fontSize = 14.sp, modifier = Modifier.clickable { logText = null })
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text.take(2000),
                        color = V3.Text2, fontSize = 11.sp,
                        modifier = Modifier.heightIn(max = 260.dp).verticalScroll(rememberScrollState()),
                    )
                }
            }
        }
        Row(
            Modifier.fillMaxWidth().padding(vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("版本", color = V3.Text1, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Text("原生 v3 · M5 大屏自適應", color = V3.Text2, fontSize = 13.sp)
        }
        Spacer(Modifier.height(20.dp))
        }
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
                    modifier = Modifier.weight(1f).heightIn(min = 38.dp).clickable { onPick(value) },
                    shape = V3.Shape,
                    strong = on,
                ) {
                    Box(
                        Modifier
                            .fillMaxSize()
                            .background(if (on) V3.Accent else Color.Transparent)
                            .padding(horizontal = 4.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            label,
                            color = if (on) Color.White else V3.Text2,
                            fontSize = 12.sp,
                            maxLines = 1,
                            softWrap = false,
                        )
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
                .clip(V3.Shape)
                .background(if (on) V3.Accent.copy(alpha = 0.55f) else Color.White.copy(alpha = 0.18f))
                .clickable { onChange(!on) },
        ) {
            Box(
                Modifier
                    .padding(start = if (on) 22.dp else 3.dp, top = 3.dp)
                    .size(22.dp)
                    .clip(V3.Shape)
                    .background(if (on) V3.Accent else Color.White.copy(alpha = 0.75f))
            )
        }
    }
}