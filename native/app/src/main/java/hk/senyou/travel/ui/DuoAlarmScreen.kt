package hk.senyou.travel.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
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
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.DebugFlags
import kotlinx.coroutines.delay
import java.util.Calendar
import java.util.Locale

/**
 * iPhone Duo 鬧鐘（1:1 復刻自使用者提供的設計圖）。
 *
 * 設計規格（逐項對應原圖）：
 * · 背景：**純黑 `#000000`**（原圖像素取樣為 (3,3,3)，非暖黑；修正自 v4.3.0 的 #0D0D0F）
 * · 左上：經典線性鬧鐘圖示（白描邊、帶兩側鈴鐺與兩支腳，約屏寬 3%）＋ 正下方兩行全大寫
 *   「GOOD / MORNING」琥珀 `#E8A630`，**Light 字重**（原圖字面偏細）、行距 1.27
 * · 右側：超大白色時間，Medium 字重、幾何圓潤；冒號為**小圓點**（間距收緊）
 * · 圖示＋問候與時間**共用同一垂直帶**（原圖兩者垂直中心對齊），整體略高於畫面中線
 * · 下方置中：兩枚**等寬膠囊**按鈕（cornerRadius = 高度/2，合計約屏寬 72%）
 *   ——`stop` 深暖灰 `#2E2B27`、`snooze` 琥珀 `#F5A623`（主要 CTA），底距約屏高 10%
 * · 微動效：snooze 輕微脈動提示（原圖為靜態，依此類鬧鐘慣例補上）
 *
 * 適配小米 MIX Fold 4：
 * · 展開內屏（≈953×852dp，近橫向）→ **1:1 原圖佈局**（左資訊 / 右時間 / 下方雙鈕）
 * · 摺疊外屏（≈414×965dp，豎向）→ 堆疊版（資訊左對齊在上、時間居中、雙鈕並排在下）
 */
@Composable
fun DuoAlarmScreen(
    greeting: String = "GOOD MORNING",
    onStop: () -> Unit,
    onSnooze: () -> Unit,
) {
    // 大屏（展開內屏）→ 原圖橫向佈局；否則豎向堆疊
    BoxWithConstraints(Modifier.fillMaxSize().background(DuoAlarm.Bg)) {
        val boxW = maxWidth
        val boxH = maxHeight
        val wide = boxW >= 700.dp
        val hhmm = rememberLiveClock()

        val lines = greeting.trim().uppercase(Locale.getDefault()).split(" ")
            .filter { it.isNotBlank() }
            .ifEmpty { listOf("GOOD", "MORNING") }

        if (wide) {
            // 時間字級：同時受高度與寬度約束，位數增加時自動縮小（不會溢出到問候語上）
            val availW = (boxW - 96.dp).value
            val digitCount = hhmm.count { it.isDigit() }.coerceAtLeast(4)
            val byWidth = availW / (digitCount * 0.55f + 0.20f)
            val clockSp = minOf(boxH.value * 0.42f, byWidth).coerceIn(40f, 420f)

            Box(Modifier.fillMaxSize().padding(horizontal = 48.dp)) {
                // ---- 圖示＋問候（左）與時間（右）共用同一垂直帶 ----
                Row(
                    Modifier.align(Alignment.Center).padding(bottom = boxH * 0.10f),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(horizontalAlignment = Alignment.Start) {
                        AlarmGlyph(Modifier.size(boxW * 0.030f))
                        Spacer(Modifier.height(boxH * 0.024f))
                        lines.forEach { line ->
                            Text(
                                line,
                                color = DuoAlarm.Greeting,
                                fontSize = (boxH.value * 0.055f).sp,
                                lineHeight = (boxH.value * 0.070f).sp,
                                fontWeight = FontWeight.Light,
                                letterSpacing = 1.5.sp,
                            )
                        }
                    }
                    Spacer(Modifier.weight(1f))
                    BigClock(hhmm, clockSp.sp)
                }
                // ---- 下方置中：兩枚等寬膠囊按鈕（底距約屏高 10%）----
                Row(
                    Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth(0.72f)
                        .padding(bottom = boxH * 0.10f),
                    horizontalArrangement = Arrangement.spacedBy(boxW * 0.030f),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    DuoPillButton("stop", DuoAlarm.StopBg, DuoAlarm.Text, boxH) { onStop() }
                    DuoPillButton("snooze", DuoAlarm.Amber, DuoAlarm.Text, boxH, pulse = true) { onSnooze() }
                }
            }
        } else {
            Column(
                Modifier.fillMaxSize().padding(horizontal = 28.dp),
            ) {
                Spacer(Modifier.height(boxH * 0.08f))
                AlarmGlyph(Modifier.size(boxW * 0.072f))
                Spacer(Modifier.height(boxH * 0.022f))
                lines.forEach { line ->
                    Text(
                        line,
                        color = DuoAlarm.Greeting,
                        fontSize = (boxH.value * 0.045f).sp,
                        lineHeight = (boxH.value * 0.057f).sp,
                        fontWeight = FontWeight.Light,
                        letterSpacing = 1.5.sp,
                    )
                }
                Spacer(Modifier.weight(1f))
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    BigClock(hhmm, minOf(boxW.value * 0.30f, boxH.value * 0.16f).sp)
                }
                Spacer(Modifier.weight(1f))
                Row(
                    Modifier
                        .fillMaxWidth(0.92f)
                        .align(Alignment.CenterHorizontally)
                        .padding(bottom = boxH * 0.10f),
                    horizontalArrangement = Arrangement.spacedBy(boxW * 0.035f),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    DuoPillButton("stop", DuoAlarm.StopBg, DuoAlarm.Text, boxH) { onStop() }
                    DuoPillButton("snooze", DuoAlarm.Amber, DuoAlarm.Text, boxH, pulse = true) { onSnooze() }
                }
            }
        }
    }
}

/** 原圖色票（逐項取自圖面／像素取樣） */
private object DuoAlarm {
    val Bg = Color(0xFF000000)        // 純黑，純平面（原圖取樣 (3,3,3)）
    val Text = Color(0xFFFFFFFF)
    val Amber = Color(0xFFF5A623)     // snooze 按鈕
    val Greeting = Color(0xFFE8A630)  // GOOD / MORNING（較按鈕暖一階）
    val StopBg = Color(0xFF2E2B27)    // 深暖灰（較 v4.3.0 更沉，貼近原圖）
}

/** 超大時間：冒號為**小圓點**（原圖特徵） */
@Composable
private fun BigClock(hhmm: String, size: TextUnit) {
    val parts = hhmm.split(":")
    val h = parts.getOrNull(0) ?: "--"
    val m = parts.getOrNull(1) ?: "--"
    val dot = (size.value * 0.062f).dp
    Row(verticalAlignment = Alignment.CenterVertically) {
        ClockDigits(h, size)
        Column(
            Modifier.padding(horizontal = (size.value * 0.055f).dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(Modifier.size(dot).clip(RoundedCornerShape(50)).background(DuoAlarm.Text))
            Spacer(Modifier.height((size.value * 0.105f).dp))
            Box(Modifier.size(dot).clip(RoundedCornerShape(50)).background(DuoAlarm.Text))
        }
        ClockDigits(m, size)
    }
}

@Composable
private fun ClockDigits(text: String, size: TextUnit) {
    Text(
        text,
        color = DuoAlarm.Text,
        fontSize = size,
        lineHeight = size,
        fontWeight = FontWeight.Medium,
        letterSpacing = (-size.value * 0.02f).sp,
    )
}

/** 膠囊按鈕（cornerRadius = 高度/2）；pulse = 輕微脈動（主要 CTA） */
@Composable
private fun RowScope.DuoPillButton(
    label: String,
    bg: Color,
    fg: Color,
    boxH: Dp,
    pulse: Boolean = false,
    onClick: () -> Unit,
) {
    val scale = if (pulse && !DebugFlags.staticUi) {
        val tr = rememberInfiniteTransition(label = "pulse")
        tr.animateFloat(
            initialValue = 1f,
            targetValue = 1.035f,
            animationSpec = infiniteRepeatable(tween(1600, easing = LinearEasing), repeatMode = androidx.compose.animation.core.RepeatMode.Reverse),
            label = "pulseS",
        ).value
    } else 1f
    val h = (boxH.value * 0.105f).dp
    Box(
        Modifier
            .weight(1f)
            .height(h)
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .clip(RoundedCornerShape(h / 2))
            .background(bg)
            .clickable { onClick() }
            .padding(horizontal = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            label,
            color = fg,
            fontSize = (boxH.value * 0.028f).sp,
            fontWeight = FontWeight.Medium,
        )
    }
}

/** 經典線性鬧鐘圖示：鐘面 + 兩側鈴鐺（弧形）+ 兩支腳，純描邊白色 */
@Composable
private fun AlarmGlyph(modifier: Modifier = Modifier) {
    Canvas(modifier) {
        val w = size.width
        val h = size.height
        val stroke = w * 0.085f
        val cx = w / 2f
        val cy = h * 0.56f
        val r = w * 0.30f
        // 兩側鈴鐺（上方外側弧形，原圖為圓潤鐘形而非斜線）
        val bell = r * 0.46f
        val bellTop = Offset(cx - r * 0.72f - bell, cy - r * 0.72f - bell)
        drawArc(
            color = DuoAlarm.Text,
            startAngle = 145f,
            sweepAngle = 125f,
            useCenter = false,
            topLeft = bellTop,
            size = Size(bell * 2, bell * 2),
            style = Stroke(width = stroke, cap = StrokeCap.Round),
        )
        drawArc(
            color = DuoAlarm.Text,
            startAngle = 270f,
            sweepAngle = 125f,
            useCenter = false,
            topLeft = Offset(cx + r * 0.72f - bell, cy - r * 0.72f - bell),
            size = Size(bell * 2, bell * 2),
            style = Stroke(width = stroke, cap = StrokeCap.Round),
        )
        // 鐘面
        drawCircle(
            color = DuoAlarm.Text,
            radius = r,
            center = Offset(cx, cy),
            style = Stroke(width = stroke),
        )
        // 指針
        drawLine(DuoAlarm.Text, Offset(cx, cy), Offset(cx, cy - r * 0.55f), strokeWidth = stroke, cap = StrokeCap.Round)
        drawLine(DuoAlarm.Text, Offset(cx, cy), Offset(cx + r * 0.45f, cy), strokeWidth = stroke, cap = StrokeCap.Round)
        // 兩支腳
        drawLine(
            DuoAlarm.Text,
            Offset(cx - r * 0.70f, cy + r * 0.76f),
            Offset(cx - r * 0.95f, cy + r * 1.10f),
            strokeWidth = stroke,
            cap = StrokeCap.Round,
        )
        drawLine(
            DuoAlarm.Text,
            Offset(cx + r * 0.70f, cy + r * 0.76f),
            Offset(cx + r * 0.95f, cy + r * 1.10f),
            strokeWidth = stroke,
            cap = StrokeCap.Round,
        )
    }
}

/** 每秒更新的 HH:mm */
@Composable
private fun rememberLiveClock(): String {
    var text by remember { mutableStateOf(nowHhmm()) }
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            while (true) {
                text = nowHhmm()
                delay(1000)
            }
        }
    }
    return text
}

private fun nowHhmm(): String {
    val c = Calendar.getInstance()
    return String.format(Locale.getDefault(), "%d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE))
}
