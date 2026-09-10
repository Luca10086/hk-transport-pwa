package hk.senyou.travel.ui.wp8

import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.abs

/** 全域忙碌狀態（驅動頂部 WP 進度條）；各分頁把自己的載入中狀態寫進來 */
val LocalWp8Busy = compositionLocalOf { mutableStateOf(false) }

/** 標記本頁正在載入（自動跟著布林狀態進出） */
@Composable
fun Wp8ReportBusy(busy: Boolean) {
    val s = LocalWp8Busy.current
    LaunchedEffect(busy) { s.value = busy }
}

/** 磁貼項目（key 用於版面持久化） */
data class TileItem(val key: String, val span: Int, val content: @Composable (Modifier) -> Unit)

/** 解析 / 序列化磁貼版面："key:span,key:span" */
fun parseTileLayout(s: String, defaults: List<TileItem>): List<Pair<String, Int>> {
    val parsed = s.split(',').mapNotNull { seg ->
        val p = seg.split(':')
        if (p.size != 2) return@mapNotNull null
        val span = p[1].toIntOrNull() ?: return@mapNotNull null
        if (defaults.none { it.key == p[0] }) null else p[0] to span.coerceIn(1, 4)
    }
    // 補上新增但尚未記錄的磁貼
    val missing = defaults.filter { d -> parsed.none { it.first == d.key } }.map { it.key to it.span }
    return parsed + missing
}

fun serializeTileLayout(layout: List<Pair<String, Int>>): String =
    layout.joinToString(",") { "${it.first}:${it.second}" }

/**
 * WP8 開始畫面磁貼牆：4 格制，支援長按進入編輯（點按改尺寸、左右拖動換位），版面持久化。
 */
@Composable
fun Wp8TileWall(
    items: List<TileItem>,
    layout: List<Pair<String, Int>>,
    editMode: Boolean,
    onCycleSize: (String) -> Unit,
    onMove: (String, Int) -> Unit,
) {
    val ordered = layout.mapNotNull { (k, span) ->
        items.firstOrNull { it.key == k }?.let { it to span.coerceIn(1, 4) }
    }.ifEmpty { items.map { it to it.span.coerceIn(1, 4) } }

    // 打包成每列 4 格
    val rows = mutableListOf<List<Pair<TileItem, Int>>>()
    var cur = mutableListOf<Pair<TileItem, Int>>()
    var used = 0
    ordered.forEach { pair ->
        val s = pair.second
        if (used + s > 4) { rows += cur; cur = mutableListOf(); used = 0 }
        cur += pair; used += s
        if (used == 4) { rows += cur; cur = mutableListOf(); used = 0 }
    }
    if (cur.isNotEmpty()) rows += cur

    Column(Modifier.fillMaxWidth()) {
        rows.forEach { row ->
            Row(
                Modifier.fillMaxWidth().padding(bottom = Wp8.Gap),
                horizontalArrangement = Arrangement.spacedBy(Wp8.Gap),
            ) {
                row.forEach { (item, span) ->
                    Box(
                        Modifier
                            .weight(span.toFloat())
                            .then(
                                if (!editMode) Modifier
                                else Modifier
                                    .padding(2.dp)
                                    .border(2.dp, Wp8.Accent)
                                    .clickable { onCycleSize(item.key) },
                            ),
                    ) {
                        item.content(Modifier.fillMaxWidth().heightIn(min = if (span >= 4) 96.dp else 104.dp))
                    }
                }
            }
        }
        if (editMode) {
            Text(
                "點磁貼切換尺寸（1／2／4 格）· 左右拖動換位 · 長按空白處結束",
                color = Wp8.Text2,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}
@Composable
fun Wp8Toggle(checked: Boolean, label: String = "", onChecked: (Boolean) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        if (label.isNotBlank()) {
            Text(label, color = Wp8.Text2, fontSize = 12.sp, modifier = Modifier.padding(end = 8.dp))
        }
        Box(
            Modifier
                .width(54.dp)
                .height(28.dp)
                .border(2.dp, Wp8.Text1)
                .clickable { onChecked(!checked) },
        ) {
            Box(
                Modifier
                    .padding(start = if (checked) 28.dp else 2.dp, top = 2.dp)
                    .size(20.dp)
                    .background(if (checked) Wp8.Accent else Color.Transparent),
            )
        }
    }
}

/**
 * WP8 語意縮放（Semantic Zoom）：雙指捏合把磁貼牆縮小並列出分組標題，點標題縮放回該組。
 * 這是 WP8 開始畫面最招牌的手勢。
 */
@Composable
fun Wp8SemanticZoomOverlay(
    groups: List<String>,
    onPick: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.padding(horizontal = Wp8.Gutter)) {
        Spacer(Modifier.height(8.dp))
        groups.forEachIndexed { i, g ->
            Text(
                g,
                color = Wp8.Text1,
                fontSize = 36.sp,
                fontWeight = FontWeight.Light,
                fontFamily = FontFamily.SansSerif,
                letterSpacing = (-0.3).sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onPick(i) }
                    .padding(vertical = 20.dp),
            )
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        }
        Spacer(Modifier.height(12.dp))
        Text("點分組標題回到該組 · 再次捏合可退出", color = Wp8.Text2, fontSize = 12.sp)
    }
}

/**
 * WP8 Pivot 標題條：當前頁大字標題，下一頁標題從右側探出（可點直接跳頁）。
 * 這是 WP 導航最招牌的元素——只顯示當前標題是不夠的。
 */
@Composable
fun Wp8PivotStrip(
    titles: List<String>,
    current: Int,
    offsetFraction: Float,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    BoxWithConstraints(modifier) {
        val density = LocalDensity.current
        val slot = maxWidth * 0.78f
        val slotPx = with(density) { slot.toPx() }
        val pos = current + offsetFraction
        Row(
            Modifier
                .clipToBounds()
                .graphicsLayer { translationX = -pos * slotPx },
        ) {
            titles.forEachIndexed { i, t ->
                val o = abs(pos - i).coerceIn(0f, 1f)
                Box(
                    Modifier
                        .width(slot)
                        .clickable(enabled = i != current) { onSelect(i) },
                    contentAlignment = Alignment.CenterStart,
                ) {
                    Text(
                        t,
                        color = Wp8.Text1.copy(alpha = 1f - 0.55f * o),
                        fontSize = (46f - 24f * o).sp,
                        fontWeight = FontWeight.Light,
                        fontFamily = FontFamily.SansSerif,
                        letterSpacing = (-0.5).sp,
                        maxLines = 1,
                        softWrap = false,
                        // WP 的相鄰標題是被邊界自然裁掉，不是變成「favo…」
                        overflow = TextOverflow.Clip,
                    )
                }
            }
        }
    }
}

/** WP 載入點：五顆方點依序亮起（WP 沒有轉圈圈） */
@Composable
fun Wp8LoadingDots(label: String = "載入中") {
    val t by androidx.compose.animation.core.rememberInfiniteTransition(label = "dots").animateFloat(
        initialValue = 0f,
        targetValue = 5f,
        animationSpec = androidx.compose.animation.core.infiniteRepeatable(
            tween(1250, easing = androidx.compose.animation.core.LinearEasing),
        ),
        label = "dotT",
    )
    Row(
        Modifier.padding(vertical = 22.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Text(label, color = Wp8.Text2, fontSize = 14.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
            repeat(5) { i ->
                val active = abs(t - i) < 0.55f
                Box(
                    Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(if (active) Wp8.Text1 else Wp8.Text2.copy(alpha = 0.35f)),
                )
            }
        }
    }
}

/** 分頁大標題（WP8 pane title：27sp Light） */
@Composable
fun Wp8PaneTitle(text: String, modifier: Modifier = Modifier) {
    Text(
        text,
        color = Wp8.Text1,
        fontSize = 27.sp,
        fontWeight = FontWeight.Light,
        fontFamily = FontFamily.SansSerif,
        letterSpacing = (-0.3).sp,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
        modifier = modifier.padding(top = 18.dp, bottom = 10.dp),
    )
}

/** 全景面板指示點（WP PWA 版同款：6dp 圓點，選中轉強調色） */
@Composable
fun Wp8PanoDots(count: Int, current: Int, onSelect: (Int) -> Unit) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 10.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        repeat(count) { i ->
            Box(
                Modifier
                    .padding(horizontal = 3.dp)
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(if (i == current) Wp8.Accent else Wp8.Text2)
                    .clickable { onSelect(i) },
            )
        }
    }
}

/** 空狀態（Metro 純文字） */
@Composable
fun Wp8Empty(text: String) {
    Text(text, color = Wp8.Text2, fontSize = 14.sp, modifier = Modifier.padding(vertical = 22.dp))
}

/** 小標籤（細框，用於路線類型） */
@Composable
fun Wp8Tag(text: String) {
    Box(Modifier.border(1.dp, Wp8.Line).padding(horizontal = 8.dp, vertical = 1.dp)) {
        Text(text, color = Wp8.Text2, fontSize = 11.sp)
    }
}

/** 區塊小標（強調色、字距 1px） */
@Composable
fun Wp8SectionTitle(text: String) {
    Text(
        text,
        color = Wp8.Accent,
        fontSize = 14.sp,
        fontWeight = FontWeight.Light,
        letterSpacing = 1.sp,
        modifier = Modifier.padding(top = 18.dp, bottom = 4.dp),
    )
}

/** 天氣條（WP 純色面 + 置中） */
@Composable
fun Wp8WeatherBar(text: String, cap: String) {
    Column(
        Modifier
            .fillMaxWidth()
            .background(Wp8.Surface)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(text, color = Wp8.Text1, fontSize = 18.sp, fontWeight = FontWeight.Light)
        if (cap.isNotBlank()) {
            Spacer(Modifier.height(4.dp))
            Text(cap, color = Wp8.Text2, fontSize = 12.sp)
        }
    }
}

/** 警告條（WP 純色底） */
@Composable
fun Wp8WarningBar(text: String, severe: Boolean) {
    Text(
        text,
        color = if (severe) Color(0xFFFFA8A8) else Color(0xFFFFE082),
        fontSize = 13.sp,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .background(if (severe) Color(0xFF4A1F1F) else Color(0xFF4A4000))
            .padding(horizontal = 16.dp, vertical = 10.dp),
    )
}

/** ⋯ 更多選單（WP App Bar 彈出：貼齊右下、底欄之上，對應 CSS bottom: calc(appbar-h - 4px); right: 12px） */
@Composable
fun Wp8MoreMenu(items: List<Pair<String, () -> Unit>>, onDismiss: () -> Unit) {
    var shown by remember { androidx.compose.runtime.mutableStateOf(false) }
    androidx.compose.runtime.LaunchedEffect(Unit) { shown = true }
    val t by animateFloatAsState(
        if (shown) 1f else 0f,
        tween(180, easing = Wp8.Ease),
        label = "moreMenu",
    )
    Box(
        Modifier
            .fillMaxSize()
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = Wp8.AppBarH + 6.dp),
        contentAlignment = Alignment.BottomEnd,
    ) {
        Column(
            Modifier
                .width(200.dp)
                .graphicsLayer {
                    alpha = t
                    translationY = (1f - t) * 12.dp.toPx()
                }
                .background(Wp8.Surface)
                .border(1.dp, Wp8.Line),
        ) {
            items.forEach { (label, action) ->
                Text(
                    label,
                    color = Wp8.Text1,
                    fontSize = 15.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { action(); onDismiss() }
                        .padding(horizontal = 16.dp, vertical = 13.dp),
                )
                Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
            }
        }
    }
}

/** 字體大小 A− ●●● A＋ */
@Composable
fun Wp8FontSizeRow(level: Int, onLevel: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier
                .border(1.dp, Wp8.Line)
                .clickable { onLevel((level - 1).coerceAtLeast(0)) }
                .padding(horizontal = 12.dp, vertical = 6.dp),
        ) { Text("A−", color = Wp8.Text1, fontSize = 13.sp) }
        Spacer(Modifier.width(10.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            repeat(8) { i ->
                Box(
                    Modifier
                        .padding(horizontal = 2.dp)
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(if (i <= level) Wp8.Accent else Wp8.Line)
                        .clickable { onLevel(i) },
                )
            }
        }
        Spacer(Modifier.width(10.dp))
        Box(
            Modifier
                .border(1.dp, Wp8.Line)
                .clickable { onLevel((level + 1).coerceAtMost(7)) }
                .padding(horizontal = 12.dp, vertical = 6.dp),
        ) { Text("A＋", color = Wp8.Text1, fontSize = 13.sp) }
    }
}

/** 可點的行（設定列 / 連結列） */
@Composable
fun Wp8LinkRow(label: String, value: String, onClick: () -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(if (pressed) 0.98f else 1f, tween(160, easing = Wp8.Ease), label = "lnk")
    Row(
        Modifier
            .fillMaxWidth()
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .clickable(interactionSource = interaction, indication = null) { onClick() }
            .padding(vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
        Text(value, color = Wp8.Text1, fontSize = 15.sp, maxLines = 1)
        Spacer(Modifier.width(6.dp))
        Text("›", color = Wp8.Text2, fontSize = 17.sp)
    }
    Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
}
