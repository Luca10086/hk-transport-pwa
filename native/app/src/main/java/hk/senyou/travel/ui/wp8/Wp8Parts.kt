package hk.senyou.travel.ui.wp8

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
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

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

/** ⋯ 更多選單（WP App Bar 彈出） */
@Composable
fun Wp8MoreMenu(items: List<Pair<String, () -> Unit>>, onDismiss: () -> Unit) {
    Box(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = Wp8.AppBarH + 6.dp),
        contentAlignment = Alignment.BottomEnd,
    ) {
        Column(
            Modifier
                .width(180.dp)
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
