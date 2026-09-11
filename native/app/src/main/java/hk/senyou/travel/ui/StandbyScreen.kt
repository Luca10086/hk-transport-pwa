package hk.senyou.travel.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.Weather
import kotlinx.coroutines.delay
import java.util.Calendar
import java.util.Locale

/**
 * iPhone Duo「**待機顯示模式**」多畫面（依 2026-09-10 Apple 秋季發表會官方展示）。
 *
 * 官方展示的待機畫面（見 native 內文與發表會報導）：
 * · **時間**：大鐘（本 App 為鬧鐘畫面，即使用者提供之展示圖的 1:1 復刻）
 * · **日曆**：月曆格，今日以紅圈標示
 * · **音樂**：專輯圖 + 曲名 + 進度條
 * · 天氣（官方文案列為待機畫面之一，本 App 以香港天文台實時資料實作）
 *
 * 切換方式對齊官方：**左右滑動**，底部為頁面指示點；官方強調「折起立放即進入待機」，
 * 對應邏輯在 [hk.senyou.travel.data.FoldPosture] 與 App 外殼。
 */
@Composable
fun StandbyScreen(onExit: () -> Unit, initialPage: Int = 0) {
    val pager = rememberPagerState(initialPage = initialPage) { STANDBY_FACE_COUNT }
    Box(Modifier.fillMaxSize().background(Standby.Bg)) {
        HorizontalPager(state = pager, modifier = Modifier.fillMaxSize()) { i ->
            StandbyFace(page = i, onExit = onExit)
        }
        /* 頁面指示點（官方待機畫面底部） */
        Row(
            Modifier.align(Alignment.BottomCenter).padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            repeat(STANDBY_FACE_COUNT) { i ->
                Box(
                    Modifier
                        .size(if (i == pager.currentPage) 7.dp else 6.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color.White.copy(alpha = if (i == pager.currentPage) 0.92f else 0.28f)),
                )
            }
        }
    }
}

/** 待機畫面的頁數（鬧鐘 / 日曆 / 天氣 / 音樂） */
const val STANDBY_FACE_COUNT = 4

/**
 * 單一待機畫面（抽離 pager 以便截圖測試逐頁驗證）。
 * page：0 鬧鐘（發表會展示圖 1:1 復刻）、1 日曆、2 天氣、3 音樂。
 */
@Composable
fun StandbyFace(page: Int, onExit: () -> Unit) {
    when (page) {
        0 -> DuoAlarmScreen(onStop = onExit, onSnooze = { /* 貪睡：維持待機畫面 */ })
        1 -> StandbyCalendarFace()
        2 -> StandbyWeatherFace()
        else -> StandbyMusicFace()
    }
}

/* ---------------- 共用小標頭（官方待機畫面左上日期、右上時間） ---------------- */

@Composable
private fun StandbyHeader() {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(
            weekdayDay(),
            color = Standby.Dim,
            fontSize = 15.sp,
            fontWeight = FontWeight.Medium,
            letterSpacing = 1.sp,
            modifier = Modifier.weight(1f),
        )
        Text(
            hhmm(),
            color = Standby.Dim,
            fontSize = 15.sp,
            fontWeight = FontWeight.Medium,
        )
    }
}

/* ---------------- 日曆 ---------------- */

@Composable
private fun StandbyCalendarFace() {
    val cal = remember { Calendar.getInstance() }
    val year = cal.get(Calendar.YEAR)
    val month = cal.get(Calendar.MONTH)
    val today = cal.get(Calendar.DAY_OF_MONTH)
    val first = remember { (cal.clone() as Calendar).apply { set(Calendar.DAY_OF_MONTH, 1) } }
    // 以週日為第一欄
    val leading = (first.get(Calendar.DAY_OF_WEEK) - Calendar.SUNDAY + 7) % 7
    val days = cal.getActualMaximum(Calendar.DAY_OF_MONTH)

    Column(Modifier.fillMaxSize().padding(horizontal = 26.dp, vertical = 22.dp)) {
        StandbyHeader()
        Spacer(Modifier.height(14.dp))
        Text(
            "${year} 年 ${month + 1} 月",
            color = Standby.Text,
            fontSize = 30.sp,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(Modifier.height(16.dp))
        Row(Modifier.fillMaxWidth()) {
            listOf("日", "一", "二", "三", "四", "五", "六").forEach { d ->
                Text(
                    d,
                    color = Standby.Dim,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        Spacer(Modifier.height(8.dp))
        for (row in 0 until 6) {
            Row(Modifier.fillMaxWidth().weight(1f)) {
                for (col in 0 until 7) {
                    val day = row * 7 + col - leading + 1
                    Box(Modifier.weight(1f).fillMaxHeight(), contentAlignment = Alignment.Center) {
                        if (day in 1..days) {
                            val isToday = day == today
                            Box(
                                Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(50))
                                    .background(if (isToday) Standby.Red else Color.Transparent),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(
                                    "$day",
                                    color = if (isToday) Color.White else Standby.Text,
                                    fontSize = 17.sp,
                                    fontWeight = if (isToday) FontWeight.SemiBold else FontWeight.Normal,
                                )
                            }
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(
            "待機顯示 · 日曆",
            color = Standby.Dim,
            fontSize = 12.sp,
        )
    }
}

/* ---------------- 天氣（香港天文台實時資料） ---------------- */

@Composable
private fun StandbyWeatherFace() {
    var w by remember { mutableStateOf<Weather?>(null) }
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) { runCatching { w = Hko.fetch() } }
    }
    val cur = w
    Column(Modifier.fillMaxSize().padding(horizontal = 26.dp, vertical = 22.dp)) {
        StandbyHeader()
        Spacer(Modifier.height(20.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                cur?.emoji?.takeIf { it.isNotBlank() } ?: "☁",
                color = Standby.Text,
                fontSize = 54.sp,
            )
            Spacer(Modifier.width(18.dp))
            Text(
                cur?.temp?.let { "$it°" } ?: "—°",
                color = Standby.Text,
                fontSize = 76.sp,
                fontWeight = FontWeight.Medium,
            )
        }
        Spacer(Modifier.height(6.dp))
        Text(
            cur?.desc?.takeIf { it.isNotBlank() } ?: "香港天文台・天水圍",
            color = Standby.Text,
            fontSize = 20.sp,
            fontWeight = FontWeight.Light,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            listOfNotNull(
                cur?.humid?.let { "濕度 $it%" },
                cur?.uv?.let { "紫外線 $it" },
                cur?.updated?.takeIf { it.isNotBlank() }?.let { "更新 $it" },
            ).joinToString(" · ").ifBlank { "—" },
            color = Standby.Dim,
            fontSize = 14.sp,
        )
        Spacer(Modifier.height(14.dp))
        Column(Modifier.fillMaxWidth().weight(1f)) {
            val days = cur?.days ?: emptyList()
            val labels = listOf("今天", "明天", "後天")
            if (days.isEmpty()) {
                labels.forEach { l ->
                    Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.CenterStart) {
                        StandbyForecastRow(l, "—", "—", "—")
                    }
                }
            } else {
                days.take(3).forEach { d ->
                    Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.CenterStart) {
                        StandbyForecastRow(
                            d.label.ifBlank { d.week },
                            "${d.min ?: "—"}° ~ ${d.max ?: "—"}°",
                            d.desc.ifBlank { "—" },
                            d.emoji,
                        )
                    }
                }
            }
        }
        Spacer(Modifier.height(6.dp))
        Text("待機顯示 · 天氣", color = Standby.Dim, fontSize = 12.sp)
    }
}

@Composable
private fun StandbyForecastRow(label: String, range: String, desc: String, emoji: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 9.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label, color = Standby.Text, fontSize = 16.sp, modifier = Modifier.width(64.dp))
        Text(emoji, color = Standby.Text, fontSize = 18.sp, modifier = Modifier.width(40.dp))
        Text(range, color = Standby.Text, fontSize = 16.sp, modifier = Modifier.weight(1f))
        Text(desc, color = Standby.Dim, fontSize = 13.sp, maxLines = 1)
    }
}

/* ---------------- 音樂（官方待機畫面示範元件；本版本未接駁音訊） ---------------- */

@Composable
private fun StandbyMusicFace() {
    Column(Modifier.fillMaxSize().padding(horizontal = 26.dp, vertical = 22.dp)) {
        StandbyHeader()
        Spacer(Modifier.height(20.dp))
        Spacer(Modifier.weight(1f))
        Row(verticalAlignment = Alignment.CenterVertically) {
            /* 專輯圖（純色平面 + 音符，無漸層） */
            Box(
                Modifier
                    .size(112.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF1F1F1F)),
                contentAlignment = Alignment.Center,
            ) {
                Text("♪", color = Standby.Amber, fontSize = 46.sp)
            }
            Spacer(Modifier.width(20.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    "示範曲目",
                    color = Standby.Text,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                )
                Spacer(Modifier.height(4.dp))
                Text("森友出行 · 本版本未接駁音訊播放", color = Standby.Dim, fontSize = 14.sp, maxLines = 1)
                Spacer(Modifier.height(16.dp))
                /* 進度條 */
                Box(
                    Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(Color.White.copy(alpha = 0.22f)),
                ) {
                    Box(
                        Modifier
                            .fillMaxWidth(0.0f)
                            .height(4.dp)
                            .background(Standby.Amber),
                    )
                }
                Spacer(Modifier.height(8.dp))
                Row(Modifier.fillMaxWidth()) {
                    Text("0:00", color = Standby.Dim, fontSize = 12.sp, modifier = Modifier.weight(1f))
                    Text("-3:00", color = Standby.Dim, fontSize = 12.sp)
                }
            }
        }
        Spacer(Modifier.weight(1f))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
            listOf("⏮", "⏸", "⏭").forEach { g ->
                Box(Modifier.size(52.dp), contentAlignment = Alignment.Center) {
                    Text(g, color = Standby.Text, fontSize = 26.sp)
                }
            }
        }
        Spacer(Modifier.height(28.dp))
        Text("待機顯示 · 音樂", color = Standby.Dim, fontSize = 12.sp)
    }
}

/* ---------------- 色票與時間 ---------------- */

private object Standby {
    val Bg = Color(0xFF000000)          // 與鬧鐘畫面一致的純黑
    val Text = Color(0xFFFFFFFF)
    val Dim = Color(0x99FFFFFF)
    val Red = Color(0xFFE23B30)         // 官方日曆「今日」紅圈
    val Amber = Color(0xFFF5A623)
}

private fun hhmm(): String {
    val c = Calendar.getInstance()
    return String.format(Locale.getDefault(), "%d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE))
}

private fun weekdayDay(): String {
    val c = Calendar.getInstance()
    val w = listOf("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT")[c.get(Calendar.DAY_OF_WEEK) - 1]
    return "$w ${c.get(Calendar.DAY_OF_MONTH)}"
}
