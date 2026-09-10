package hk.senyou.travel.ui.wp8

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.BusMarker
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.K75PModel
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.TrainRow
import hk.senyou.travel.data.StopRow
import kotlinx.coroutines.delay

private val K75P_NAMES = listOf(
    "天瑞", "天水圍公園", "天耀邨耀盛樓", "輕鐵天耀站", "天盛苑", "石埗路", "沙洲里村", "廈村市",
    "新屋村", "李屋村", "新生村", "新李屋村", "田心", "鄉事委員會", "輕鐵洪水橋站",
    "洪水橋巴士廠", "洪福邨", "石埗村", "天盛苑", "天水圍警署", "賞湖居", "天水圍公園", "天瑞",
)
private const val KN = 23
private const val K_TURN = 14

private fun kPts(w: Float, h: Float): List<Offset> {
    val xL = w * 0.17f
    val xR = w * 0.83f
    val yT = h * 0.135f
    val yA = h * 0.68f
    val yC = h * 0.78f
    return List(KN) { i ->
        when {
            i == K_TURN -> Offset(w * 0.5f, yC)
            i < K_TURN -> Offset(xL, yT + (i.toFloat() / (K_TURN - 1)) * (yA - yT))
            else -> Offset(xR, yA - ((i - K_TURN - 1).toFloat() / (KN - 1 - K_TURN - 1)) * (yA - yT))
        }
    }
}

private fun kPos(pos: Float, w: Float, h: Float): Offset {
    val pts = kPts(w, h)
    val i = pos.toInt().coerceIn(0, KN - 2)
    val f = pos - i
    val a = pts[i]; val b = pts[i + 1]
    val xL = w * 0.17f; val xR = w * 0.83f; val yC = h * 0.80f
    fun lerp(p: Offset, q: Offset, t: Float) = Offset(p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t)
    return when {
        i == K_TURN - 1 -> if (f < 0.5f) lerp(a, Offset(xL, yC), f * 2f) else lerp(Offset(xL, yC), b, f * 2f - 1f)
        i == K_TURN -> if (f < 0.5f) lerp(a, Offset(xR, yC), f * 2f) else lerp(Offset(xR, yC), b, f * 2f - 1f)
        else -> lerp(a, b, f)
    }
}

/**
 * K75P 全屏實時頁（WP8 版）：頂欄 + U 形路線圖 + 三班卡 + 狀態列。
 * 幾何與數據沿用原生模型，視覺改為 Metro 純色平面。
 */
@Composable
fun Wp8K75PPage(onClose: () -> Unit) {
    var markers by remember { mutableStateOf<List<BusMarker>>(emptyList()) }
    val smooth = remember { mutableStateMapOf<String, Float>() }
    val status = WindowInsets.statusBars.asPaddingValues()
    var selected by remember { mutableStateOf<BusMarker?>(null) }

    LaunchedEffect(Unit) {
        if (DebugFlags.staticUi) return@LaunchedEffect
        while (true) {
            runCatching {
                val data = Api.mtrBusSchedule("K75P")
                val built = K75PModel.build(data, smooth.toMap())
                markers = built
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
            }
            delay(20_000)
        }
    }

    val live = markers.count { it.gps }
    val lead = markers.firstOrNull { it.gps } ?: markers.firstOrNull()

    Column(Modifier.fillMaxSize().background(Wp8.Bg)) {
        /* 頂欄：✕ + 標題 + ● 實時 */
        Row(
            Modifier
                .fillMaxWidth()
                .padding(start = 12.dp, end = 16.dp, top = status.calculateTopPadding() + 8.dp, bottom = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.size(44.dp).clickable { onClose() }, contentAlignment = Alignment.Center) {
                Text("✕", color = Wp8.Text1, fontSize = 20.sp)
            }
            Text(
                "K75P 實時路線",
                color = Wp8.Text1,
                fontSize = 24.sp,
                fontWeight = FontWeight.Light,
                modifier = Modifier.weight(1f),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                "● 實時 $live 班",
                color = if (live > 0) Wp8.Accent else Wp8.Text2,
                fontSize = 13.sp,
            )
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

        Row(
            Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = Wp8.Gutter),
        ) {
            Column(Modifier.weight(1f)) {
                /* U 形路線圖（Canvas，Metro 配色） */
                Box(
                    Modifier
                        .fillMaxWidth()
                        .height(320.dp)
                        .background(Wp8.Surface),
                ) {
                    K75PMap(
                        buses = markers.filter { it.gps }.map { it.id to (smooth[it.id] ?: it.pos) },
                        modifier = Modifier.fillMaxSize().padding(6.dp),
                    )
                }
                Spacer(Modifier.height(10.dp))

                /* 三班卡（Metro 扁平行，非卡片） */
                Wp8SectionTitle("下一班")
                val labels = listOf("下一班", "再下一班", "第三班")
                for (i in 0 until 3) {
                    val m = markers.getOrNull(i)
                    Wp8Row(
                        no = labels[i].take(2),
                        name = m?.nextName ?: "暫無資料",
                        sub = if (m?.gps == true) "GPS 實時" else "定時預報",
                        eta = m?.mins?.let { if (it <= 0) "即將" else "$it 分" } ?: "—",
                        etaColor = etaColor(m?.mins),
                    ) { selected = m }
                }

                /* 狀態列 */
                Wp8SectionTitle("狀態")
                Text(
                    lead?.let { "巴士 ${it.id} · 下一站 ${it.nextName}" } ?: "暫無實時班次",
                    color = Wp8.Text1,
                    fontSize = 15.sp,
                    modifier = Modifier.padding(vertical = 6.dp),
                )
                Text(
                    "全程 23 站 · 天水圍 · 循環線（天瑞 ↺ 洪水橋）",
                    color = Wp8.Text2,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(bottom = 24.dp),
                )
            }
        }
    }
}

/** U 形路線圖：純色平面（無漸變、無陰影），站名沿用原本繪製 */
@Composable
private fun K75PMap(buses: List<Pair<String, Float>>, modifier: Modifier = Modifier) {
    val namePaint = remember {
        android.graphics.Paint().apply {
            isAntiAlias = true
            color = android.graphics.Color.argb(200, 255, 255, 255)
        }
    }
    val mainPaint = remember {
        android.graphics.Paint().apply {
            isAntiAlias = true
            color = android.graphics.Color.WHITE
            isFakeBoldText = true
        }
    }
    val tagPaint = remember {
        android.graphics.Paint().apply {
            isAntiAlias = true
            color = Wp8.Accent.toArgb()
            isFakeBoldText = true
        }
    }
    Canvas(modifier) {
        val w = size.width
        val h = size.height
        val pts = kPts(w, h)
        val xL = w * 0.17f
        val xR = w * 0.83f
        val yC = h * 0.80f

        val path = Path().apply {
            moveTo(pts[0].x, pts[0].y)
            for (i in 1 until K_TURN) lineTo(pts[i].x, pts[i].y)
            lineTo(xL, yC)
            lineTo(pts[K_TURN].x, pts[K_TURN].y)
            lineTo(xR, yC)
            for (i in K_TURN + 1 until KN) lineTo(pts[i].x, pts[i].y)
        }
        drawPath(path, color = Wp8.Text2.copy(alpha = 0.7f), style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
        drawPath(path, color = Wp8.Accent, style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))

        namePaint.textSize = 9.5.dp.toPx()
        mainPaint.textSize = 11.5.dp.toPx()
        pts.forEachIndexed { i, p ->
            val main = i == 0 || i == KN - 1 || i == K_TURN
            val r = if (main) (if (i == K_TURN) 7.dp.toPx() else 6.dp.toPx()) else 4.5.dp.toPx()
            drawCircle(color = if (main) Wp8.Bg else Wp8.Accent, radius = r, center = p)
            drawCircle(color = if (main) Wp8.Accent else Wp8.Text2, radius = r, center = p, style = Stroke(width = 2.dp.toPx()))
            val paint = if (main) mainPaint else namePaint
            when {
                i == K_TURN -> {
                    paint.textAlign = android.graphics.Paint.Align.CENTER
                    drawContext.canvas.nativeCanvas.drawText(K75P_NAMES[i], p.x, p.y + 20.dp.toPx(), paint)
                }
                i < K_TURN -> {
                    paint.textAlign = android.graphics.Paint.Align.RIGHT
                    drawContext.canvas.nativeCanvas.drawText(K75P_NAMES[i], p.x - 12.dp.toPx(), p.y + 3.5.dp.toPx(), paint)
                }
                else -> {
                    paint.textAlign = android.graphics.Paint.Align.LEFT
                    drawContext.canvas.nativeCanvas.drawText(K75P_NAMES[i], p.x + 12.dp.toPx(), p.y + 3.5.dp.toPx(), paint)
                }
            }
        }
        tagPaint.textSize = 10.5.dp.toPx()
        tagPaint.textAlign = android.graphics.Paint.Align.RIGHT
        drawContext.canvas.nativeCanvas.drawText("起點 天瑞", pts[0].x - 12.dp.toPx(), pts[0].y - 24.dp.toPx(), tagPaint)
        tagPaint.textAlign = android.graphics.Paint.Align.LEFT
        drawContext.canvas.nativeCanvas.drawText("返回 天瑞", pts[KN - 1].x + 12.dp.toPx(), pts[KN - 1].y - 24.dp.toPx(), tagPaint)
        tagPaint.textAlign = android.graphics.Paint.Align.CENTER
        drawContext.canvas.nativeCanvas.drawText("循環點", pts[K_TURN].x, pts[K_TURN].y + 36.dp.toPx(), tagPaint)

        buses.sortedBy { it.second }.forEachIndexed { idx, (_, pos) ->
            val p = kPos(pos, w, h)
            val prev = buses.sortedBy { it.second }.getOrNull(idx - 1)
            val dy = if (prev != null && pos - prev.second < 0.6f) (if (idx % 2 == 1) 9.dp.toPx() else -9.dp.toPx()) else 0f
            val c = Offset(p.x, p.y + dy)
            drawCircle(Wp8.Accent.copy(alpha = 0.3f), radius = 9.dp.toPx(), center = c)
            val bw = 22.dp.toPx(); val bh = 8.dp.toPx()
            drawRoundRect(
                color = Color.White,
                topLeft = Offset(c.x - bw / 2f, c.y - bh / 2f),
                size = Size(bw, bh),
                cornerRadius = CornerRadius(0f),
            )
            drawRect(
                color = Wp8.Accent,
                topLeft = Offset(c.x - bw / 2f, c.y - 1.dp.toPx()),
                size = Size(bw, 2.dp.toPx()),
            )
        }
    }
}

/* ==================================================================
   詳情頁（WP8 3D 滑入）：路線站表 / 車站班次
   ================================================================== */

@Composable
fun Wp8DetailSheet(item: SearchItem, onClose: () -> Unit) {
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { shown = true }
    val t by androidx.compose.animation.core.animateFloatAsState(
        if (shown) 1f else 0f,
        androidx.compose.animation.core.tween(380, easing = Wp8.Ease),
        label = "sheet",
    )
    val density = androidx.compose.ui.platform.LocalDensity.current.density
    val status = WindowInsets.statusBars.asPaddingValues()
    var rows by remember { mutableStateOf<List<StopRow>>(emptyList()) }
    var trains by remember { mutableStateOf<List<TrainRow>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var tab by remember { mutableIntStateOf(0) }
    val isStation = item.kind == hk.senyou.travel.data.Kind.MTR || item.kind == hk.senyou.travel.data.Kind.LRT
    val twoWay = item.kind == hk.senyou.travel.data.Kind.KMB || item.kind == hk.senyou.travel.data.Kind.CTB

    LaunchedEffect(tab, item) {
        loading = true
        rows = emptyList()
        trains = emptyList()
        if (isStation) {
            trains = runCatching { SearchRepo.stationTrains(item) }.getOrDefault(emptyList())
            loading = false
            return@LaunchedEffect
        }
        val route = item.route
        if (route.isNullOrBlank()) { loading = false; return@LaunchedEffect }
        val dir = if (tab == 0) "outbound" else "inbound"
        rows = runCatching { SearchRepo.routeStops(route, item.kind, dir, item.routeId) }.getOrDefault(emptyList())
        loading = false
    }

    Box(
        Modifier
            .fillMaxSize()
            .background(Wp8.Bg)
            .graphicsLayer3d(t, density),
    ) {
        Column(Modifier.fillMaxSize()) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(start = 12.dp, end = 16.dp, top = status.calculateTopPadding() + 8.dp, bottom = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.size(44.dp).clickable { onClose() }, contentAlignment = Alignment.Center) {
                    Text("←", color = Wp8.Text1, fontSize = 24.sp, fontWeight = FontWeight.Light)
                }
                Column(Modifier.weight(1f)) {
                    Text(
                        if (isStation) "${item.stationName ?: item.name}" else "${item.no} 路線詳情",
                        color = Wp8.Text1, fontSize = 23.sp, fontWeight = FontWeight.Light,
                        maxLines = 1, overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        if (isStation) (item.cap.ifBlank { item.name }) else item.name,
                        color = Wp8.Text2, fontSize = 12.sp, maxLines = 1,
                    )
                }
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))

            if (twoWay) {
                Row(
                    Modifier.padding(horizontal = Wp8.Gutter, vertical = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    listOf("去程", "回程").forEachIndexed { i, label ->
                        Wp8Chip(label, i == tab) { tab = i }
                    }
                }
            }

            Column(
                Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = Wp8.Gutter)
                    .padding(bottom = 40.dp),
            ) {
                when {
                    loading -> Wp8Empty("載入中…")
                    isStation && trains.isEmpty() -> Wp8Empty("暫無班次資料")
                    isStation -> trains.forEach { tr ->
                        Row(
                            Modifier.fillMaxWidth().padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(
                                Modifier
                                    .background(Wp8.Accent.copy(alpha = 0.2f))
                                    .padding(horizontal = 8.dp, vertical = 3.dp),
                            ) { Text(tr.dirLabel, color = Wp8.Text1, fontSize = 12.sp) }
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text("往 ${tr.dest}", color = Wp8.Text1, fontSize = 15.sp, maxLines = 1)
                                if (tr.plat.isNotBlank()) {
                                    Text("${tr.plat} 號月台", color = Wp8.Text2, fontSize = 11.sp)
                                }
                            }
                            Text(
                                etaText(tr.mins),
                                color = etaColor(tr.mins),
                                fontSize = 19.sp,
                                fontWeight = FontWeight.Light,
                            )
                        }
                        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
                    }
                    rows.isEmpty() -> Wp8Empty("無法載入站點")
                    else -> rows.forEach { r ->
                        Row(
                            Modifier.fillMaxWidth().padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text("${r.seq}", color = Wp8.Text2, fontSize = 13.sp, modifier = Modifier.width(30.dp))
                            Text(r.name, color = Wp8.Text1, fontSize = 15.sp, maxLines = 1, modifier = Modifier.weight(1f))
                            Text(
                                etaText(r.mins),
                                color = etaColor(r.mins),
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Light,
                            )
                        }
                        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
                    }
                }
            }
        }
    }
}

/** WP 詳情頁 3D 滑入：rotateY(-12°) + translateX(26%) → 0 */
private fun Modifier.graphicsLayer3d(t: Float, density: Float) = this.graphicsLayer {
    rotationY = -12f * (1f - t)
    translationX = size.width * 0.26f * (1f - t)
    transformOrigin = androidx.compose.ui.graphics.TransformOrigin(0f, 0.5f)
    cameraDistance = 30f * density
}
