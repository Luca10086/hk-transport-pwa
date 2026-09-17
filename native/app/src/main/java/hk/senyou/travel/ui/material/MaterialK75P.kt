package hk.senyou.travel.ui.material

import android.graphics.Paint
import android.graphics.drawable.GradientDrawable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.BusMarker
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.K75PModel
import hk.senyou.travel.data.StaticData
import kotlinx.coroutines.delay

/**
 * Material 3 版 K75P 實時路線頁（獨立實作）：
 * M3 `Card` 包住 OpenStreetMap（osmdroid）真地圖，下方為 M3 `ListItem` 到站清單。
 * 地圖語意與 W10M 版一致（同一組座標與浮點站序），但排版、形狀、色票全走 M3。
 */
@Composable
fun MaterialK75PPage() {
    var markers by remember { mutableStateOf<List<BusMarker>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var tick by remember { mutableStateOf(0) }
    val busMarkers = remember { mutableMapOf<String, org.osmdroid.views.overlay.Marker>() }
    var mapRef by remember { mutableStateOf<org.osmdroid.views.MapView?>(null) }
    var mapFailed by remember { mutableStateOf(false) }
    val pts = remember {
        StaticData.k75pStops.mapNotNull { s ->
            StaticData.k75pCoords[s.id]?.let { org.osmdroid.util.GeoPoint(it.lat, it.lng) }
        }
    }

    LaunchedEffect(tick) {
        if (DebugFlags.staticUi) {
            loading = false
            return@LaunchedEffect
        }
        runCatching {
            Api.mtrBusSchedule("K75P")?.let { markers = K75PModel.build(it, emptyMap()) }
        }
        loading = false
    }
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            while (true) {
                delay(20_000)
                tick++
            }
        }
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("K75P · 天瑞 ↺ 洪水橋", style = MaterialTheme.typography.titleLarge)
                    Text(
                        "輕鐵接駁巴士 · ${StaticData.k75pStops.size} 站 · 實時 ${markers.count { it.gps }} 班",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                FilledTonalIconButton(onClick = { tick++ }) {
                    Icon(Icons.Filled.Refresh, contentDescription = "重新整理")
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                if (mapFailed || pts.isEmpty() || DebugFlags.staticUi) {
                    /* 無圖磚／離線：以 M3 表面顯示佔位，不讓整頁失敗 */
                    Box(
                        Modifier.fillMaxWidth().height(280.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Filled.DirectionsBus,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                            )
                            Spacer(Modifier.height(8.dp))
                            Text(
                                if (pts.isEmpty()) "路線座標資料未載入" else "地圖需要網路連線",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                } else {
                    AndroidView(
                        modifier = Modifier.fillMaxWidth().height(320.dp),
                        factory = { ctx ->
                            runCatching {
                                val cfg = org.osmdroid.config.Configuration.getInstance()
                                cfg.userAgentValue = ctx.packageName
                                if (cfg.osmdroidBasePath == null) {
                                    cfg.osmdroidBasePath = java.io.File(ctx.cacheDir, "osmdroid")
                                }
                                if (cfg.osmdroidTileCache == null) {
                                    cfg.osmdroidTileCache = java.io.File(cfg.osmdroidBasePath, "tiles")
                                }
                                val mv = org.osmdroid.views.MapView(ctx)
                                mv.setTileSource(org.osmdroid.tileprovider.tilesource.TileSourceFactory.MAPNIK)
                                mv.setMultiTouchControls(true)
                                mv.zoomController.setVisibility(
                                    org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER,
                                )
                                val line = org.osmdroid.views.overlay.Polyline()
                                line.setPoints(pts)
                                line.outlinePaint.color = android.graphics.Color.parseColor("#6750A4")
                                line.outlinePaint.strokeWidth = 9f
                                line.outlinePaint.strokeCap = Paint.Cap.ROUND
                                mv.overlays.add(line)
                                listOf(0 to "起點 天瑞", 14 to "循環點 輕鐵洪水橋站", 22 to "洪水橋巴士廠")
                                    .forEach { (i, label) ->
                                        pts.getOrNull(i)?.let { g ->
                                            val m = org.osmdroid.views.overlay.Marker(mv)
                                            m.position = g
                                            m.title = label
                                            m.icon = materialDot(android.graphics.Color.parseColor("#6750A4"), 22)
                                            m.setAnchor(
                                                org.osmdroid.views.overlay.Marker.ANCHOR_CENTER,
                                                org.osmdroid.views.overlay.Marker.ANCHOR_CENTER,
                                            )
                                            mv.overlays.add(m)
                                        }
                                    }
                                mv.controller.setZoom(14.0)
                                runCatching {
                                    mv.zoomToBoundingBox(
                                        org.osmdroid.util.BoundingBox.fromGeoPoints(pts),
                                        true,
                                        56,
                                    )
                                }
                                mv.onResume()
                                mapRef = mv
                                mv
                            }.getOrElse {
                                android.util.Log.e("MaterialK75P", "地圖建立失敗", it)
                                mapFailed = true
                                android.view.View(ctx)
                            }
                        },
                        update = { v ->
                            if (v !is org.osmdroid.views.MapView) return@AndroidView
                            runCatching {
                                val seen = mutableSetOf<String>()
                                markers.filter { it.gps }.forEach { mk ->
                                    seen += mk.id
                                    val g = geoAt(mk.pos, pts) ?: return@forEach
                                    val m = busMarkers.getOrPut(mk.id) {
                                        org.osmdroid.views.overlay.Marker(v).apply {
                                            icon = materialDot(android.graphics.Color.parseColor("#FFB300"), 30)
                                            setAnchor(
                                                org.osmdroid.views.overlay.Marker.ANCHOR_CENTER,
                                                org.osmdroid.views.overlay.Marker.ANCHOR_CENTER,
                                            )
                                            v.overlays.add(this)
                                        }
                                    }
                                    m.position = g
                                    m.title = "巴士 ${mk.id}"
                                }
                                busMarkers.keys.filter { it !in seen }.forEach { k ->
                                    busMarkers.remove(k)?.let { v.overlays.remove(it) }
                                }
                                v.invalidate()
                            }
                        },
                    )
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text("下一班") },
                        supportingContent = { Text("依 GPS／ETA 排序") },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    HorizontalDivider()
                    if (loading) {
                        ListItem(
                            headlineContent = { Text("載入中…") },
                            leadingContent = { CircularProgressIndicator(Modifier.height(20.dp)) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                    } else if (markers.isEmpty()) {
                        ListItem(
                            headlineContent = { Text("暫無實時班次") },
                            supportingContent = { Text("需要網路連線；收車時段不會有資料") },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                    } else {
                        markers.take(6).forEach { m ->
                            ListItem(
                                headlineContent = { Text("巴士 ${m.id}") },
                                supportingContent = {
                                    Text("下一站 ${m.nextName} · ${if (m.gps) "GPS 實時" else "定時預報"}")
                                },
                                trailingContent = {
                                    Text(
                                        if (m.mins <= 0) "即將" else "${m.mins} 分",
                                        style = MaterialTheme.typography.titleMedium,
                                    )
                                },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            )
                        }
                    }
                }
            }
        }

        item { Spacer(Modifier.height(24.dp)) }
    }

    DisposableEffect(Unit) {
        onDispose {
            runCatching { mapRef?.onPause(); mapRef?.onDetach() }
            busMarkers.clear()
            mapRef = null
        }
    }
}

/** 依浮點站序在折線上插值（與 W10M 版同一套 pos 語義） */
private fun geoAt(
    pos: Float,
    pts: List<org.osmdroid.util.GeoPoint>,
): org.osmdroid.util.GeoPoint? {
    if (pts.isEmpty()) return null
    val i = pos.toInt().coerceIn(0, pts.size - 1)
    val f = (pos - i).coerceIn(0f, 1f)
    val a = pts[i]
    val b = pts.getOrNull(i + 1) ?: a
    return org.osmdroid.util.GeoPoint(
        a.latitude + (b.latitude - a.latitude) * f,
        a.longitude + (b.longitude - a.longitude) * f,
    )
}

private fun materialDot(color: Int, sizeDp: Int): android.graphics.drawable.Drawable =
    GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(color)
        setStroke(4, android.graphics.Color.WHITE)
        setSize(sizeDp, sizeDp)
    }
