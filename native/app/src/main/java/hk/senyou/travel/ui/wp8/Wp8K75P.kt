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
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
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
import androidx.compose.ui.text.TextStyle
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
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.data.TrainRow
import hk.senyou.travel.data.StopRow
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
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
/**
 * @param halfOpen 官方半開合姿態：內容（路線圖）在上半、控件（三班卡）在下半
 */
fun Wp8K75PPage(onClose: () -> Unit, halfOpen: Boolean = false) {
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

        val bodyMod = Modifier.weight(1f).fillMaxWidth()

        if (halfOpen) {
            /* 官方半開合：內屏一半顯示內容（路線圖）、一半顯示控件（三班卡），中間留出鉸鏈帶 */
            Column(bodyMod) {
                Box(Modifier.fillMaxWidth().weight(1f).background(Wp8.Surface)) {
                    K75PRouteMap(
                        buses = markers.filter { it.gps }.map { it.id to (smooth[it.id] ?: it.pos) },
                        modifier = Modifier.fillMaxSize().padding(8.dp),
                    )
                }
                Box(Modifier.fillMaxWidth().height(26.dp).background(Wp8.Bg))
                Column(
                    Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = Wp8.Gutter),
                ) {
                    K75PControls(markers, lead) { selected = it }
                }
            }
        } else {
            Row(
                bodyMod
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = Wp8.Gutter),
            ) {
                Column(Modifier.weight(1f)) {
                    K75PMapBlock(markers, smooth)
                    K75PControls(markers, lead) { selected = it }
                }
            }
        }
    }
}

/** U 形路線圖：純色平面（無漸變、無陰影），站名沿用原本繪製 */
/* ---------------- K75P 真地圖（OpenStreetMap，免 API key） ---------------- */

/** 路線地理座標：依靜態資料站序取座標（缺座標者略過） */
private fun k75pGeoPoints(): List<org.osmdroid.util.GeoPoint> =
    StaticData.k75pStops.mapNotNull { s ->
        StaticData.k75pCoords[s.id]?.let { org.osmdroid.util.GeoPoint(it.lat, it.lng) }
    }

/** 依浮點站序位置在地理折線上插值（與示意圖同一套 pos 語義，0=天瑞、22=洪水橋） */
private fun k75pGeoAt(pos: Float, pts: List<org.osmdroid.util.GeoPoint>): org.osmdroid.util.GeoPoint? {
    if (pts.isEmpty()) return null
    val i = pos.toInt().coerceIn(0, pts.size - 1)
    val fr = (pos - i).coerceIn(0f, 1f)
    val a = pts[i]
    val b = pts.getOrNull(i + 1) ?: a
    return org.osmdroid.util.GeoPoint(
        a.latitude + (b.latitude - a.latitude) * fr,
        a.longitude + (b.longitude - a.longitude) * fr,
    )
}

/** 圓點圖標（不依賴 osmdroid 內建 drawable，避免資源耦合） */
private fun dotIcon(color: Int, sizeDp: Int): android.graphics.drawable.Drawable =
    android.graphics.drawable.GradientDrawable().apply {
        shape = android.graphics.drawable.GradientDrawable.OVAL
        setColor(color)
        setStroke(4, android.graphics.Color.WHITE)
        setSize(sizeDp, sizeDp)
    }

/**
 * 路線圖入口：**真地圖（OSM）優先**；測試環境（staticUi）或離線時退回原本的純色示意圖。
 * 兩者使用同一組 pos 語義，因此 K75P 的 GPS 視窗錨定定位邏輯不受影響。
 */
@Composable
private fun K75PRouteMap(buses: List<Pair<String, Float>>, modifier: Modifier = Modifier) {
    if (DebugFlags.staticUi || DebugFlags.offline || StaticData.k75pCoords.isEmpty()) {
        K75PMap(buses = buses, modifier = modifier)
    } else {
        K75POsmMap(buses = buses, modifier = modifier)
    }
}

@Composable
private fun K75POsmMap(buses: List<Pair<String, Float>>, modifier: Modifier = Modifier) {
    val pts = remember { k75pGeoPoints() }
    val busMarkers = remember { mutableMapOf<String, org.osmdroid.views.overlay.Marker>() }
    var mapRef by remember { mutableStateOf<org.osmdroid.views.MapView?>(null) }

    AndroidView(
        modifier = modifier,
        factory = { ctx ->
            /* OSM 使用政策要求設定 User-Agent */
            runCatching { org.osmdroid.config.Configuration.getInstance().userAgentValue = ctx.packageName }
            val mv = org.osmdroid.views.MapView(ctx)
            runCatching {
                mv.setTileSource(org.osmdroid.tileprovider.tilesource.TileSourceFactory.MAPNIK)
                mv.setMultiTouchControls(true)
                mv.zoomController.setVisibility(org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER)
                if (pts.size >= 2) {
                    val line = org.osmdroid.views.overlay.Polyline()
                    line.setPoints(pts)
                    line.outlinePaint.color = android.graphics.Color.parseColor("#0078D7")
                    line.outlinePaint.strokeWidth = 9f
                    line.outlinePaint.strokeCap = android.graphics.Paint.Cap.ROUND
                    mv.overlays.add(line)
                }
                listOf(0 to "起點 天瑞", 14 to "循環點 輕鐵洪水橋站", 22 to "洪水橋巴士廠").forEach { (i, label) ->
                    pts.getOrNull(i)?.let { g ->
                        val m = org.osmdroid.views.overlay.Marker(mv)
                        m.position = g
                        m.title = label
                        m.icon = dotIcon(android.graphics.Color.parseColor("#0078D7"), 22)
                        m.setAnchor(org.osmdroid.views.overlay.Marker.ANCHOR_CENTER, org.osmdroid.views.overlay.Marker.ANCHOR_CENTER)
                        mv.overlays.add(m)
                    }
                }
                mv.controller.setZoom(14.0)
                if (pts.size >= 2) {
                    runCatching { mv.zoomToBoundingBox(org.osmdroid.util.BoundingBox.fromGeoPoints(pts), true, 56) }
                }
                mv.onResume()
            }
            mapRef = mv
            mv
        },
        update = { mv ->
            runCatching {
                val seen = mutableSetOf<String>()
                buses.forEach { (id, pos) ->
                    seen += id
                    val g = k75pGeoAt(pos, pts) ?: return@forEach
                    val m = busMarkers.getOrPut(id) {
                        org.osmdroid.views.overlay.Marker(mv).apply {
                            icon = dotIcon(android.graphics.Color.parseColor("#F0A30A"), 30)
                            setAnchor(org.osmdroid.views.overlay.Marker.ANCHOR_CENTER, org.osmdroid.views.overlay.Marker.ANCHOR_CENTER)
                            mv.overlays.add(this)
                        }
                    }
                    m.position = g
                    m.title = "巴士 $id"
                }
                busMarkers.keys.filter { it !in seen }.forEach { k ->
                    busMarkers.remove(k)?.let { mv.overlays.remove(it) }
                }
                mv.invalidate()
            }
        },
    )
    DisposableEffect(Unit) {
        onDispose {
            runCatching { mapRef?.onPause(); mapRef?.onDetach() }
            busMarkers.clear()
            mapRef = null
        }
    }
}

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
   詳情頁輔助：上下行（去程／回程）即時倒數、車站接駁（輕鐵 / 港鐵巴士）
   ================================================================== */

/** 單一方向（上行／下行或去程／回程）的最近一班；mins = null 表示無資料 */
private data class Wp8DirEta(val label: String, val mins: Int?)

/** 車站接駁一列：section = 區塊標題，no = 路線號，dest = 目的地 */
private data class Wp8Conn(val section: String, val no: String, val dest: String, val sub: String, val mins: Int?)

/**
 * 取樣當下的分鐘數 → 現在的剩餘分鐘數（每過一分鐘遞減一格）。
 * 已過取樣時刻（負數）回傳 null → 顯示「—」，不假裝「即將到站」。
 */
private fun liveMins(mins: Int?, ageMin: Int): Int? {
    if (mins == null) return null
    val left = mins - ageMin
    return if (left < 0) null else left
}

/** 車站上下行（港鐵為上行／下行，輕鐵為各路線）最近一班；供詳情頁頂部倒數列 */
private fun stationDirEtas(trains: List<TrainRow>): List<Wp8DirEta> =
    trains.groupBy { it.dirLabel }
        .map { (label, list) -> Wp8DirEta(label, list.mapNotNull { it.mins }.minOrNull()) }
        .sortedBy { it.mins ?: Int.MAX_VALUE }
        .take(2)

/**
 * 路線某方向起點站的最近一班（與搜尋卡同一取樣方式：起點站 → 最近到站），
 * 只佔 1–2 個請求，故可每分鐘重新取樣；無資料回傳 null。
 */
private suspend fun dirNextMins(item: SearchItem, dir: String): Int? = runCatching {
    val route = item.route ?: return@runCatching null
    val want = if (dir == "inbound") "I" else "O"
    if (item.kind == hk.senyou.travel.data.Kind.CTB) {
        val first = Api.ctbStops(route, dir).firstOrNull()
        val sid = first?.optString("stop").orEmpty().ifBlank { first?.optString("stop_id").orEmpty() }
        if (sid.isBlank()) return@runCatching null
        Api.ctbEta(sid, route)
            .filter { it.optString("dir").uppercase() == want }
            .mapNotNull { Api.minsUntil(it.optString("eta")) }
            .minOrNull()
    } else {
        val sid = Api.kmbStops(route, dir).firstOrNull()?.optString("stop").orEmpty()
        if (sid.isBlank()) return@runCatching null
        Api.kmbEta(sid)
            .filter { it.optString("route") == route && it.optString("dir").uppercase() == want }
            .mapNotNull { Api.minsUntil(it.optString("eta")) }
            .minOrNull()
    }
}.getOrNull()

/** 去程／回程雙向最近一班（同一輪取樣，供詳情頁頂部倒數） */
private suspend fun bothDirEtas(item: SearchItem): List<Wp8DirEta> = coroutineScope {
    listOf("outbound" to "去程", "inbound" to "回程").map { (dir, label) ->
        async { Wp8DirEta(label, dirNextMins(item, dir)) }
    }.awaitAll()
}

/**
 * 車站接駁：輕鐵（站名完全相同）+ 港鐵巴士（路線起訖站名相符），對應舊 WebView 版
 * render.js 的 buildMTRConnections（舊版用 emoji，原生版一律純色無圖示）。
 * 只用既有靜態表與既有 API；取不到資料回傳空清單，不編造。
 */
private suspend fun stationConnections(station: String): List<Wp8Conn> {
    val name = station.trim()
    if (name.isBlank()) return emptyList()
    val out = mutableListOf<Wp8Conn>()

    /* 輕鐵：站名完全相同（與舊版同規則；例：港鐵屯門 ↔ 輕鐵屯門），取該站最近 4 班 */
    val lrtId = StaticData.lrtStations.entries.firstOrNull { it.value.trim() == name }?.key
    if (lrtId != null) {
        runCatching { Api.lrtEta(lrtId) }.getOrDefault(emptyList()).take(4).forEach {
            out += Wp8Conn(
                section = "輕鐵接駁 · $name",
                no = it.routeNo,
                dest = it.dest,
                sub = "輕鐵 · 月台 ${it.platformId}" + if (it.departing) " · 正在離開" else "",
                mins = it.mins,
            )
        }
    }

    /* 港鐵巴士：起點或終點站名與本站相符（去掉「站」後綴，與舊版一致），取最近一班有實時資料者 */
    val base = name.removeSuffix("站").trim()
    if (base.isBlank()) return out
    val routes = StaticData.mtrBusRoutes.entries.filter { (_, info) ->
        listOf(info["orig"], info["dest"]).any { raw ->
            val s = raw.orEmpty().removeSuffix("站").trim()
            s.isNotBlank() && (s == base || s.contains(base) || base.contains(s))
        }
    }.take(4)
    for ((no, info) in routes) {
        val mins = SearchRepo.routeStops(no, hk.senyou.travel.data.Kind.MTRBUS, "outbound")
            .mapNotNull { it.mins }.minOrNull() ?: continue   // 無實時班次的路線不顯示
        out += Wp8Conn(
            section = "港鐵巴士接駁",
            no = no,
            dest = "${info["orig"]} → ${info["dest"]}",
            sub = "",
            mins = mins,
        )
    }
    return out
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
    var conns by remember { mutableStateOf<List<Wp8Conn>>(emptyList()) }
    /* 港鐵車站首班／尾班（由全日班表推算） */
    var span by remember { mutableStateOf<Pair<String, String>?>(null) }
    var dirEtas by remember { mutableStateOf<List<Wp8DirEta>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var tab by remember { mutableIntStateOf(0) }
    /* 取樣時刻 + 已過分鐘數：頂部上下行倒數隨真實時間遞減（同 K75P 標記的每秒推進做法） */
    var sampledAt by remember { mutableLongStateOf(0L) }
    var ageMin by remember { mutableIntStateOf(0) }
    val isStation = item.kind == hk.senyou.travel.data.Kind.MTR || item.kind == hk.senyou.travel.data.Kind.LRT
    val twoWay = item.kind == hk.senyou.travel.data.Kind.KMB || item.kind == hk.senyou.travel.data.Kind.CTB

    LaunchedEffect(tab, item) {
        loading = true
        rows = emptyList()
        trains = emptyList()
        conns = emptyList()
        dirEtas = emptyList()
        /* 車站（港鐵／輕鐵）：班次 + 輕鐵・港鐵巴士接駁（舊 WebView 版車站詳情已有）；30 秒重新取樣 */
        if (isStation) {
            while (true) {
                trains = runCatching { SearchRepo.stationTrains(item) }.getOrDefault(emptyList())
                conns = if (item.kind == hk.senyou.travel.data.Kind.MTR) {
                    runCatching { stationConnections(item.stationName ?: item.name) }.getOrDefault(emptyList())
                } else {
                    emptyList()
                }
                span = runCatching { SearchRepo.stationFirstLast(item) }.getOrNull()
                loading = false
                sampledAt = System.currentTimeMillis()
                ageMin = 0
                delay(30_000)
            }
        }
        /* 巴士站（Kind.BUSSTOP）：列出該站各路線的下一班 —— 舊 WebView 版站詳情行為。
           資料層的 SearchRepo.stopArrivals 一次呼叫即回傳整站班次；30 秒重新取樣。 */
        if (item.kind == hk.senyou.travel.data.Kind.BUSSTOP) {
            while (true) {
                rows = runCatching { SearchRepo.stopArrivals(item) }.getOrDefault(rows)
                loading = false
                sampledAt = System.currentTimeMillis()
                ageMin = 0
                delay(30_000)
            }
        }
        val route = item.route
        if (route.isNullOrBlank()) { loading = false; return@LaunchedEffect }
        val dir = if (tab == 0) "outbound" else "inbound"
        /* 路線：站表 + 去程／回程雙向最近一班；站表較貴故 60 秒重新取樣 */
        while (true) {
            rows = runCatching { SearchRepo.routeStops(route, item.kind, dir, item.routeId) }.getOrDefault(rows)
            if (twoWay) dirEtas = bothDirEtas(item)
            loading = false
            sampledAt = System.currentTimeMillis()
            ageMin = 0
            delay(60_000)
        }
    }

    /* 每秒心跳：只在整分鐘變化時改狀態，倒數即時但不每秒重繪整張站表 */
    LaunchedEffect(sampledAt) {
        if (sampledAt == 0L) return@LaunchedEffect
        while (true) {
            delay(1000)
            val m = ((System.currentTimeMillis() - sampledAt) / 60_000L).toInt()
            if (m != ageMin) ageMin = m
        }
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

            /* 上下行（車站）／去程・回程（路線）最近一班的即時倒數：舊版只有單一靜態列 */
            val headEtas = if (isStation) stationDirEtas(trains) else dirEtas
            if (headEtas.isNotEmpty()) {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Wp8.Gutter)
                        .padding(bottom = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    headEtas.forEachIndexed { i, d ->
                        if (i > 0) {
                            Text("·", color = Wp8.Text2, fontSize = 13.sp, modifier = Modifier.padding(horizontal = 8.dp))
                        }
                        Text("${d.label} ", color = Wp8.Text2, fontSize = 13.sp)
                        Text(
                            etaText(liveMins(d.mins, ageMin)),
                            color = etaColor(liveMins(d.mins, ageMin)),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Light,
                            style = TextStyle(fontFeatureSettings = "tnum"),
                        )
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
                /* 首班／尾班：舊 WebView 版車站詳情同款（資料同源，非估算） */
                if (!loading && isStation && span != null) {
                    val (firstTrain, lastTrain) = span!!
                    Row(
                        Modifier.fillMaxWidth().padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("首班 $firstTrain", color = Wp8.Text1, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.width(14.dp))
                        Text("尾班 $lastTrain", color = Wp8.Text1, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.weight(1f))
                        Text("全日班表推算", color = Wp8.Text2, fontSize = 12.sp)
                    }
                    Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
                }
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
                                etaText(liveMins(tr.mins, ageMin)),
                                color = etaColor(liveMins(tr.mins, ageMin)),
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
                                etaText(liveMins(r.mins, ageMin)),
                                color = etaColor(liveMins(r.mins, ageMin)),
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Light,
                            )
                        }
                        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
                    }
                }

                /* 車站接駁（輕鐵 / 港鐵巴士）：沿用 Wp8SectionTitle + Wp8Row，純色無圖示；
                   取不到資料時整段不顯示（不編造班次） */
                conns.groupBy { it.section }.forEach { (section, list) ->
                    Wp8SectionTitle(section)
                    list.forEachIndexed { i, c ->
                        Wp8Row(
                            no = c.no,
                            name = c.dest,
                            sub = c.sub,
                            eta = etaText(liveMins(c.mins, ageMin)),
                            etaColor = etaColor(liveMins(c.mins, ageMin)),
                            index = i,
                        ) {}
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


/** U 形路線圖區塊（半開合時作為「內容」置於上半） */
@Composable
private fun K75PMapBlock(markers: List<BusMarker>, smooth: Map<String, Float>) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(320.dp)
            .background(Wp8.Surface),
    ) {
        K75PRouteMap(
            buses = markers.filter { it.gps }.map { it.id to (smooth[it.id] ?: it.pos) },
            modifier = Modifier.fillMaxSize().padding(6.dp),
        )
    }
    Spacer(Modifier.height(10.dp))
}

/** 三班卡 + 狀態列（半開合時作為「控件」置於下半） */
@Composable
private fun K75PControls(markers: List<BusMarker>, lead: BusMarker?, onSelect: (BusMarker?) -> Unit) {
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
        ) { onSelect(m) }
    }
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