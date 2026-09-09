package hk.senyou.travel.ui

import android.graphics.Paint
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.BusMarker
import hk.senyou.travel.data.K75PModel
import hk.senyou.travel.ui.theme.V3
import kotlinx.coroutines.delay

private val K75P_NAMES = listOf(
    "天瑞", "天水圍公園", "天耀邨耀盛樓", "輕鐵天耀站", "天盛苑", "石埗路", "沙洲里村", "廈村市",
    "新屋村", "李屋村", "新生村", "新李屋村", "田心", "鄉事委員會", "輕鐵洪水橋站",
    "洪水橋巴士廠", "洪福邨", "石埗村", "天盛苑", "天水圍警署", "賞湖居", "天水圍公園", "天瑞",
)
private const val KN = 23
private const val K_TURN = 14

/** U 形路線幾何：回傳 23 個站點座標（stop-index 空間） */
private fun kPts(w: Float, h: Float): List<Offset> {
    val xL = w * 0.17f
    val xR = w * 0.83f
    val xM = w * 0.5f
    val yT = h * 0.135f
    val yA = h * 0.68f
    val yC = h * 0.78f
    return List(KN) { i ->
        when {
            i == K_TURN -> Offset(xM, yC)
            i < K_TURN -> Offset(xL, yT + (i.toFloat() / (K_TURN - 1)) * (yA - yT))
            else -> Offset(xR, yA - ((i - K_TURN - 1).toFloat() / (KN - 1 - K_TURN - 1)) * (yA - yT))
        }
    }
}

/** 巴士位置（pos ∈ [0, KN-1]）：連續插值，底部經直角過渡點 */
private fun kPos(pos: Float, w: Float, h: Float): Offset {
    val pts = kPts(w, h)
    val i = pos.toInt().coerceIn(0, KN - 2)
    val f = pos - i
    val a = pts[i]
    val b = pts[i + 1]
    val xL = w * 0.17f
    val xR = w * 0.83f
    val yC = h * 0.80f
    return when {
        i == K_TURN - 1 -> if (f < 0.5f) lerp(a, Offset(xL, yC), f * 2f) else lerp(Offset(xL, yC), b, f * 2f - 1f)
        i == K_TURN -> if (f < 0.5f) lerp(a, Offset(xR, yC), f * 2f) else lerp(Offset(xR, yC), b, f * 2f - 1f)
        else -> lerp(a, b, f)
    }
}

private fun lerp(a: Offset, b: Offset, t: Float) = Offset(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)

/** K75P 全屏頁（原生版）：U 形路線圖 + 實時巴士 + 班次卡（真實數據） */
@Composable
fun K75PPage(onClose: () -> Unit) {
    var markers by remember { mutableStateOf<List<BusMarker>>(emptyList()) }
    var allMins by remember { mutableStateOf<List<Int>>(emptyList()) }
    val smooth = remember { mutableStateMapOf<String, Float>() }
    val status = WindowInsets.statusBars.asPaddingValues()

    LaunchedEffect(Unit) {
        if (hk.senyou.travel.data.DebugFlags.staticUi) return@LaunchedEffect
        while (true) {
            val data = Api.mtrBusSchedule("K75P")
            val built = K75PModel.build(data, smooth.toMap())
            markers = built
            allMins = built.map { it.mins }.sorted()
            // 平滑過渡到新位置（0.9s 線性），僅在有變動時跑
            if (built.isNotEmpty()) {
                val from = built.associate { it.id to (smooth[it.id] ?: it.pos) }
                val t0 = System.currentTimeMillis()
                while (true) {
                    val t = ((System.currentTimeMillis() - t0) / 900.0).toFloat().coerceAtMost(1f)
                    built.forEach { m -> smooth[m.id] = from.getValue(m.id) + (m.pos - from.getValue(m.id)) * t }
                    if (t >= 1f) break
                    withFrameNanos { }
                }
            }
            delay(20_000)
        }
    }

    val live = markers.count { it.gps }
    val lead = markers.firstOrNull { it.gps } ?: markers.firstOrNull()

    Box(
        Modifier
            .fillMaxSize()
            .background(Color(0xF0090A0F)),
    ) {
        Column(Modifier.fillMaxSize().padding(top = status.calculateTopPadding())) {
            // 頂欄
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
                    .height(56.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("K75P · 天瑞 ↺ 洪水橋", color = V3.Text1, fontSize = 20.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
                Box(
                    Modifier
                        .clip(RoundedCornerShape(999.dp))
                        .background(V3.Accent)
                        .padding(horizontal = 12.dp, vertical = 5.dp),
                ) { Text("實時 $live 班", color = Color.White, fontSize = 11.sp) }
                Spacer(Modifier.size(8.dp))
                GlassSurface(
                    modifier = Modifier.size(40.dp).semantics { contentDescription = "語音播報下一班" }
                        .clickable {
                            Tts.speak(
                                lead?.let { "K75P，下一班 ${it.mins} 分鐘，前往 ${it.nextName}" }
                                    ?: "K75P，暫無實時班次"
                            )
                        },
                    shape = CircleShape,
                ) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("🔊", fontSize = 15.sp) }
                }
                Spacer(Modifier.size(8.dp))
                GlassSurface(modifier = Modifier.size(40.dp).clickable { onClose() }, shape = CircleShape) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("✕", color = V3.Text1, fontSize = 15.sp)
                    }
                }
            }

            // U 形路線圖 + 班次（半折時上下分屏，鉸鏈處留空）
            val adaptive = LocalAdaptive.current
            val mapComposable: @Composable (Modifier) -> Unit = { m ->
                GlassSurface(modifier = m.padding(horizontal = 14.dp)) {
                    K75PBigMap(
                        buses = markers.filter { it.gps }.map { it.id to (smooth[it.id] ?: it.pos) },
                        modifier = Modifier.fillMaxSize().padding(10.dp),
                    )
                }
            }
            val cardsComposable: @Composable () -> Unit = {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 14.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    val labels = listOf("下一班", "再下一班", "第三班")
                    for (i in 0 until 3) {
                        val m = markers.getOrNull(i)
                        KCard(
                            label = labels[i],
                            mins = m?.mins?.toString() ?: "—",
                            sub = m?.nextName ?: "暫無資料",
                            gps = m?.gps == true,
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
                Spacer(Modifier.height(10.dp))
                GlassSurface(modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp)) {
                    Row(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(8.dp).clip(CircleShape).background(V3.Accent))
                        Spacer(Modifier.size(8.dp))
                        Text(
                            lead?.let { "巴士 ${it.id} · 下一站 ${it.nextName}" } ?: "暫無實時班次",
                            color = V3.Text1, fontSize = 13.sp, maxLines = 1,
                        )
                    }
                }
            }

            if (adaptive.flexMode) {
                mapComposable(Modifier.fillMaxWidth().weight(0.42f))
                Box(Modifier.height(adaptive.hingeHeightPx.dp))
                Column(Modifier.fillMaxWidth().weight(0.58f).padding(top = 8.dp)) { cardsComposable() }
            } else {
                mapComposable(Modifier.fillMaxWidth().height(470.dp))
                Spacer(Modifier.height(12.dp))
                cardsComposable()
            }
        }
    }
}

@Composable
private fun KCard(label: String, mins: String, sub: String, gps: Boolean, modifier: Modifier = Modifier) {
    GlassSurface(modifier = modifier.height(104.dp)) {
        Column(Modifier.fillMaxSize().padding(12.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(label, color = V3.Text2, fontSize = 12.sp)
                Spacer(Modifier.size(4.dp))
                Text(
                    if (gps) "GPS" else "無GPS",
                    color = if (gps) V3.Accent else V3.Text2,
                    fontSize = 9.sp,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (gps) V3.Accent.copy(alpha = 0.18f) else Color.Transparent)
                        .padding(horizontal = 4.dp),
                )
            }
            Row(verticalAlignment = Alignment.Bottom) {
                Text(mins, color = V3.Accent, fontSize = 26.sp, fontWeight = FontWeight.Light)
                Text(" 分", color = V3.Text2, fontSize = 12.sp, modifier = Modifier.padding(bottom = 4.dp))
            }
            Text(sub, color = V3.Text2, fontSize = 11.sp, maxLines = 1)
        }
    }
}

@Composable
private fun K75PBigMap(buses: List<Pair<String, Float>>, modifier: Modifier = Modifier) {
    val namePaint = remember {
        Paint().apply { isAntiAlias = true; color = Color.White.copy(alpha = 0.78f).toArgb() }
    }
    val mainPaint = remember {
        Paint().apply { isAntiAlias = true; color = Color.White.toArgb(); isFakeBoldText = true }
    }
    val tagPaint = remember {
        Paint().apply { isAntiAlias = true; color = V3.Accent.toArgb(); isFakeBoldText = true }
    }
    Canvas(modifier) {
        val w = size.width
        val h = size.height
        val pts = kPts(w, h)
        val xL = w * 0.17f
        val xR = w * 0.83f
        val yC = h * 0.80f

        // 路線（白底 + 主色芯，圓角）
        val path = Path().apply {
            moveTo(pts[0].x, pts[0].y)
            for (i in 1 until K_TURN) lineTo(pts[i].x, pts[i].y)
            lineTo(xL, yC)
            lineTo(pts[K_TURN].x, pts[K_TURN].y)
            lineTo(xR, yC)
            for (i in K_TURN + 1 until KN) lineTo(pts[i].x, pts[i].y)
        }
        drawPath(path, color = Color.White.copy(alpha = 0.85f), style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
        drawPath(path, color = V3.Accent, style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))

        // 站點 + 站名
        namePaint.textSize = 10.dp.toPx()
        mainPaint.textSize = 12.dp.toPx()
        pts.forEachIndexed { i, p ->
            val main = i == 0 || i == KN - 1 || i == K_TURN
            val r = if (main) (if (i == K_TURN) 7.5.dp.toPx() else 6.5.dp.toPx()) else 5.dp.toPx()
            drawCircle(color = if (main) Color.White else V3.Accent, radius = r, center = p)
            drawCircle(
                color = if (main) V3.Accent else Color.White,
                radius = r,
                center = p,
                style = Stroke(width = 2.dp.toPx()),
            )
            val paint = if (main) mainPaint else namePaint
            when {
                i == K_TURN -> {
                    paint.textAlign = Paint.Align.CENTER
                    drawContext.canvas.nativeCanvas.drawText(K75P_NAMES[i], p.x, p.y + 22.dp.toPx(), paint)
                }
                i < K_TURN -> {
                    paint.textAlign = Paint.Align.RIGHT
                    drawContext.canvas.nativeCanvas.drawText(K75P_NAMES[i], p.x - 13.dp.toPx(), p.y + 3.5.dp.toPx(), paint)
                }
                else -> {
                    paint.textAlign = Paint.Align.LEFT
                    drawContext.canvas.nativeCanvas.drawText(K75P_NAMES[i], p.x + 13.dp.toPx(), p.y + 3.5.dp.toPx(), paint)
                }
            }
        }

        // 起點 / 終點標籤（加大與首站名的間距，避免重疊）
        tagPaint.textSize = 11.dp.toPx()
        tagPaint.textAlign = Paint.Align.RIGHT
        drawContext.canvas.nativeCanvas.drawText("起點 天瑞", pts[0].x - 13.dp.toPx(), pts[0].y - 26.dp.toPx(), tagPaint)
        tagPaint.textAlign = Paint.Align.LEFT
        drawContext.canvas.nativeCanvas.drawText("終點 天瑞", pts[KN - 1].x + 13.dp.toPx(), pts[KN - 1].y - 26.dp.toPx(), tagPaint)

        // 實時巴士（僅 GPS 車上圖；重疊自動錯開）
        buses.sortedBy { it.second }.forEachIndexed { idx, (_, pos) ->
            val p = kPos(pos, w, h)
            val prev = buses.sortedBy { it.second }.getOrNull(idx - 1)
            val dy = if (prev != null && pos - prev.second < 0.6f) (if (idx % 2 == 1) 10.dp.toPx() else -10.dp.toPx()) else 0f
            val c = Offset(p.x, p.y + dy)
            drawCircle(V3.Accent.copy(alpha = 0.28f), radius = 10.dp.toPx(), center = c)
            val bw = 24.dp.toPx()
            val bh = 9.dp.toPx()
            drawRoundRect(
                color = Color(0xFFF4F6F8),
                topLeft = Offset(c.x - bw / 2f, c.y - bh / 2f),
                size = Size(bw, bh),
                cornerRadius = CornerRadius(2.dp.toPx()),
            )
            drawRect(
                color = V3.Accent,
                topLeft = Offset(c.x - bw / 2f, c.y - 1.dp.toPx()),
                size = Size(bw, 2.dp.toPx()),
            )
        }
    }
}
