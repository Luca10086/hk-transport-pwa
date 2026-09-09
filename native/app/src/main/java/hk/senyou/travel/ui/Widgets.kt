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
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.ui.theme.V3

/* ---------------- 首页磁贴 ---------------- */

@Composable
fun Tile(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    unit: String? = null,
    cap: String? = null,
    valueColor: Color = V3.Text1,
    live: Boolean = false,
    onClick: (() -> Unit)? = null,
    extra: (@Composable () -> Unit)? = null,
) {
    GlassSurface(
        modifier = modifier
            .height(120.dp)
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
        content = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp)
                    .height(92.dp),
                verticalArrangement = Arrangement.Bottom,
            ) {
                if (extra != null) {
                    Box(modifier = Modifier.weight(1f).fillMaxWidth()) { extra() }
                } else {
                    Spacer(Modifier.weight(1f))
                }
                Text(label, color = V3.Text2, fontSize = 12.sp, maxLines = 1)
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(value, color = valueColor, fontSize = 42.sp, fontWeight = FontWeight.Light, maxLines = 1)
                    if (unit != null) Text(unit, color = V3.Text2, fontSize = 15.sp, modifier = Modifier.padding(start = 2.dp, bottom = 6.dp))
                }
                if (cap != null) Text(cap, color = V3.Text2, fontSize = 12.sp, maxLines = 1)
            }
            if (live) {
                Box(
                    Modifier
                        .padding(12.dp)
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(V3.Success)
                )
            }
        },
    )
}

/* ---------------- K75P 迷你 U 形实时图 ---------------- */

/** U 形路径参数（与 Web 版同几何：左臂去程 → 底边折返 → 右臂回程） */
private fun uPoint(t: Float, w: Float, h: Float): Offset {
    val xL = w * 0.075f
    val xR = w * 0.925f
    val yT = h * 0.22f
    val yA = h * 0.72f
    val yC = h * 0.86f
    val a = 0.5909f // 13/22
    val b = 0.6818f // 15/22
    return when {
        t <= a -> Offset(xL, yT + (t / a) * (yA - yT))
        t >= b -> Offset(xR, yA - ((t - b) / (1f - b)) * (yA - yT))
        else -> {
            val u = (t - a) / (b - a)
            if (u < 0.5f) {
                val k = u * 2f
                Offset(xL + (xL - xL) * k, yA + (yC - yA) * k)
            } else {
                val k = (u - 0.5f) * 2f
                Offset(xL + (xR - xL) * k, yC)
            }
        }
    }
}

@Composable
fun K75PMiniMap(modifier: Modifier = Modifier) {
    val trans = rememberInfiniteTransition(label = "k75p")
    val t by trans.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(durationMillis = 14000, easing = LinearEasing)),
        label = "busT",
    )
    Canvas(modifier) {
        val w = size.width
        val h = size.height
        val xL = w * 0.075f
        val xR = w * 0.925f
        val yT = h * 0.22f
        val yA = h * 0.72f
        val yC = h * 0.86f

        val path = Path().apply {
            moveTo(xL, yT)
            lineTo(xL, yA)
            lineTo(xL, yC)
            lineTo(xR, yC)
            lineTo(xR, yA)
            lineTo(xR, yT)
        }
        drawPath(path, color = Color.White.copy(alpha = 0.5f), style = Stroke(width = 5.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
        drawPath(path, color = V3.Accent, style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))

        // 站点
        val stops = listOf(0f, 0.18f, 0.36f, 0.5f, 0.64f, 0.82f, 1f)
        stops.forEach { st ->
            val p = uPoint(st, w, h)
            drawCircle(Color.White, radius = 2.6.dp.toPx(), center = p)
            drawCircle(V3.Accent, radius = 2.6.dp.toPx(), center = p, style = Stroke(width = 1.2.dp.toPx()))
        }

        // 实时巴士（沿 U 线滑行）
        val p = uPoint(t, w, h)
        drawCircle(V3.Accent.copy(alpha = 0.28f), radius = 8.dp.toPx(), center = p)
        val bw = 18.dp.toPx()
        val bh = 7.dp.toPx()
        drawRoundRect(
            color = Color(0xFFF4F6F8),
            topLeft = Offset(p.x - bw / 2f, p.y - bh / 2f),
            size = androidx.compose.ui.geometry.Size(bw, bh),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(2.dp.toPx()),
        )
        drawRect(
            color = V3.Accent,
            topLeft = Offset(p.x - bw / 2f, p.y - 1.2.dp.toPx()),
            size = androidx.compose.ui.geometry.Size(bw, 1.6.dp.toPx()),
        )
    }
}

/* ---------------- 搜索 / 筛选 / 结果行 ---------------- */

@Composable
fun SearchPill(placeholder: String, value: String, onValueChange: (String) -> Unit, modifier: Modifier = Modifier) {
    GlassSurface(modifier = modifier.fillMaxWidth().height(50.dp), shape = RoundedCornerShape(999.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 18.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("⌕", color = V3.Text2, fontSize = 20.sp)
            Spacer(Modifier.width(10.dp))
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                singleLine = true,
                textStyle = TextStyle(color = V3.Text1, fontSize = 16.sp),
                cursorBrush = SolidColor(V3.Accent),
                modifier = Modifier.weight(1f),
                decorationBox = { inner ->
                    Box {
                        if (value.isEmpty()) Text(placeholder, color = V3.Text2, fontSize = 16.sp, maxLines = 1)
                        inner()
                    }
                },
            )
        }
    }
}

@Composable
fun ChipRow(chips: List<String>, selected: Int, onSelect: (Int) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        chips.forEachIndexed { i, c ->
            val on = i == selected
            GlassSurface(
                modifier = Modifier
                    .height(40.dp)
                    .clickable { onSelect(i) },
                shape = RoundedCornerShape(999.dp),
                strong = on,
            ) {
                Box(
                    Modifier
                        .background(if (on) V3.Accent else Color.Transparent)
                        .padding(horizontal = 16.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(c, color = if (on) Color.White else V3.Text2, fontSize = 13.sp)
                }
            }
        }
    }
}

enum class Co { KMB, CTB, NLB, MTR, LRT, MTRBUS }

fun coColor(co: Co): Color = when (co) {
    Co.KMB -> V3.CoKmb
    Co.CTB -> V3.CoCtb
    Co.NLB -> V3.CoNlb
    Co.MTR -> V3.CoMtr
    Co.LRT -> V3.CoLrt
    Co.MTRBUS -> V3.CoMtrBus
}

@Composable
fun ResultRow(no: String, co: Co, name: String, cap: String, etaMins: Int?, star: Boolean, onClick: () -> Unit) {
    GlassSurface(modifier = Modifier.fillMaxWidth().height(72.dp).clickable { onClick() }) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier.size(42.dp).clip(CircleShape).background(coColor(co)),
                contentAlignment = Alignment.Center,
            ) {
                Text(no.take(4), color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(name, color = V3.Text1, fontSize = 16.sp, maxLines = 1)
                if (cap.isNotBlank()) Text(cap, color = V3.Text2, fontSize = 12.sp, maxLines = 1)
            }
            if (etaMins != null) {
                val etaColor = when {
                    etaMins <= 2 -> V3.Danger
                    etaMins <= 10 -> V3.Warning
                    else -> V3.Success
                }
                Row(verticalAlignment = Alignment.Bottom) {
                    Text("$etaMins", color = etaColor, fontSize = 26.sp, fontWeight = FontWeight.Light)
                    Text("分", color = V3.Text2, fontSize = 12.sp, modifier = Modifier.padding(start = 2.dp, bottom = 4.dp))
                }
            } else {
                Text("—", color = V3.Text2, fontSize = 22.sp, fontWeight = FontWeight.Light)
            }
            Spacer(Modifier.width(8.dp))
            Text(if (star) "★" else "☆", color = if (star) V3.Warning else V3.Text2, fontSize = 20.sp)
        }
    }
}
