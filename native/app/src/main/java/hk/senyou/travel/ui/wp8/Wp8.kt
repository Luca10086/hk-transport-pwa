package hk.senyou.travel.ui.wp8

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.role

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
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
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Windows Phone 7 / 8 (Metro / Modern UI) 設計令牌。
 * 數值直接取自 Web 版嚴格 WP8 皮膚 `css/wp8-strict.css`（當年 PWA 時期那套）。
 *
 * 鐵律：扁平無陰影、無漸變、直角、單一強調色、Segoe UI Light 大標題、
 * 12/24 網格、按下只縮放不變色。
 */
object Wp8 {
    /* ---------- 深色主題（WP 預設） ---------- */
    val BgDark = Color(0xFF15121C)
    val SurfaceDark = Color(0xFF221D31)
    val Surface2Dark = Color(0xFF2A2440)
    val LineDark = Color(0xFF352E52)
    val Text2Dark = Color(0xFFB3A9CE)

    /* ---------- 淺色主題 ---------- */
    val BgLight = Color(0xFFF4F2F8)
    val SurfaceLight = Color(0xFFFFFFFF)
    val Surface2Light = Color(0xFFEBE8F2)
    val LineLight = Color(0xFFD3CCE3)
    val Text2Light = Color(0xFF5A5170)
    val TextLight = Color(0xFF1A1425)

    /* ---------- 單一強調色（WP 可換） ---------- */
    var accentIndex by androidx.compose.runtime.mutableIntStateOf(0)
    val Accents = listOf(
        0xFF8B5CF6L to "紫",      // WP8 概念版主色
        0xFF0078D7L to "藍",      // WP 經典 cobalt
        0xFFD24726L to "橙紅",    // WP8 預設
        0xFF00A300L to "綠",
        0xFFE51400L to "紅",
    )
    val Accent: Color get() = Color(Accents[accentIndex.coerceIn(0, Accents.size - 1)].first)
    val AccentDark = Color(0xFF6D28D9)

    /* ---------- 磁貼純色（WP8 紫色系） ---------- */
    val TileCobalt = Color(0xFF5B21B6)
    val TileCyan = Color(0xFF7C3AED)
    val TileMagenta = Color(0xFF6D28D9)
    val TileTeal = Color(0xFF4C1D95)

    /* ---------- ETA 語義色 ---------- */
    val Soon = Color(0xFFE51400)
    val Medium = Color(0xFFF0A30A)
    val Success = Color(0xFF60C060)

    /* ---------- 動效：WP 的招牌緩動 ---------- */
    val Ease = CubicBezierEasing(0.16f, 1f, 0.3f, 1f)

    /** WP 官方轉場緩動（fast-out / slow-in）：cubic-bezier(0.1, 0.9, 0.2, 1) */
    val EaseTurnstile = CubicBezierEasing(0.1f, 0.9f, 0.2f, 1f)

    /** 官方建議：轉場（in + out 合計）總時長上限 */
    const val TransitionMaxMs = 300

    /* ---------- 12/24 網格 ---------- */
    /** 響應式邊距：手機 24dp、大屏 44dp（對應 css @media min-width 700px） */
    var Gutter by androidx.compose.runtime.mutableStateOf(24.dp)
    val Gap = 12.dp
    val TopBarH = 104.dp
    /** 官方：App Bar 高度固定 72px（不可修改） */
    val AppBarH = 72.dp
    val TapMin = 44.dp

    /* ---------- 主題切換 ---------- */
    var light by androidx.compose.runtime.mutableStateOf(false)

    /** WP 高對比：純黑底 + 純白字 */
    var contrast by androidx.compose.runtime.mutableStateOf(false)

    val Bg: Color get() = when {
        contrast -> Color.Black
        light -> BgLight
        else -> BgDark
    }
    val Surface: Color get() = when {
        contrast -> Color(0xFF101010)
        light -> SurfaceLight
        else -> SurfaceDark
    }
    val Surface2: Color get() = when {
        contrast -> Color(0xFF1A1A1A)
        light -> Surface2Light
        else -> Surface2Dark
    }
    val Line: Color get() = when {
        contrast -> Color(0xFF6A6A6A)
        light -> LineLight
        else -> LineDark
    }
    val Text1: Color get() = if (!contrast && light) TextLight else Color.White
    val Text2: Color get() = when {
        contrast -> Color(0xFFD0D0D0)
        light -> Text2Light
        else -> Text2Dark
    }
}

/** WP 圓形圖標按鈕（頂欄 44dp、2px 描邊——WP8 規範） */
@Composable
fun Wp8CircleButton(glyph: String, desc: String, onClick: () -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(if (pressed) 0.9f else 1f, tween(160, easing = Wp8.Ease), label = "cb")
    Box(
        Modifier
            .size(Wp8.TapMin)
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .border(2.dp, Wp8.Text1, RoundedCornerShape(50))
            .semantics { contentDescription = desc }
            .clickable(interactionSource = interaction, indication = null) { onClick() },
        contentAlignment = Alignment.Center,
    ) { Text(glyph, color = Wp8.Text1, fontSize = 19.sp) }
}

/**
 * WP8 App Bar 圖標按鈕（[官方 ff431806](https://learn.microsoft.com/en-us/previous-versions/windows/apps/ff431806(v=vs.105))）：
 * · 圖標框 48×48，前景圖形置中於 **26×26**，**圓圈由 App Bar 繪製**（不是裸字形）
 * · 標籤**平時隱藏**，使用者按 ⋯ 才顯示（[官方 ff431813](https://learn.microsoft.com/en-us/previous-versions/windows/apps/ff431813(v=vs.105))）
 */
@Composable
fun Wp8AppBarButton(
    glyph: String,
    label: String,
    active: Boolean,
    modifier: Modifier = Modifier.width(72.dp),
    showLabel: Boolean = false,
    onClick: () -> Unit,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(if (pressed) 0.9f else 1f, tween(160, easing = Wp8.Ease), label = "ab")
    Column(
        modifier
            .heightIn(min = Wp8.TapMin)
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .semantics { contentDescription = label }
            .clickable(interactionSource = interaction, indication = null) { onClick() },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        val col = if (active) Wp8.Accent else Wp8.Text1
        // 官方：圓圈由 App Bar 繪製；前景字形置中於 26×26 範圍內，不與圓圈重疊
        Box(
            Modifier.size(48.dp).border(1.5.dp, col, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Box(Modifier.size(26.dp), contentAlignment = Alignment.Center) {
                Text(glyph, color = col, fontSize = 18.sp)
            }
        }
        if (showLabel) {
            Text(
                label,
                color = if (active) Wp8.Accent else Wp8.Text2,
                fontSize = 10.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

/** Live Tile：純色、直角、文字左下對齊、按下 3D 傾斜（朝觸點）+ 觸感、可 3D 翻面、支援角標 */
@Composable
fun Wp8Tile(
    modifier: Modifier = Modifier,
    color: Color,
    title: String,
    value: String = "",
    sub: String = "",
    back: String? = null,
    flipped: Boolean = false,
    trailing: String = "",
    badge: String? = null,
    onClick: () -> Unit,
) {
    val density = LocalDensity.current.density
    val haptic = androidx.compose.ui.platform.LocalHapticFeedback.current
    var pressed by remember { androidx.compose.runtime.mutableStateOf(false) }
    var tiltX by remember { androidx.compose.runtime.mutableFloatStateOf(0f) }
    var tiltY by remember { androidx.compose.runtime.mutableFloatStateOf(0f) }
    val scale by animateFloatAsState(if (pressed) 0.97f else 1f, tween(160, easing = Wp8.Ease), label = "tile")
    val rx by animateFloatAsState(if (pressed) tiltX else 0f, tween(160, easing = Wp8.Ease), label = "tiltX")
    val ry by animateFloatAsState(if (pressed) tiltY else 0f, tween(160, easing = Wp8.Ease), label = "tiltY")
    val angle by animateFloatAsState(if (flipped && back != null) 180f else 0f, tween(700, easing = Wp8.Ease), label = "flip")
    // WP 高對比：磁貼改為黑底白框白字（不保留彩色）
    val hc = Wp8.contrast

    Box(
        modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                rotationX = rx
                rotationY = angle + ry
                cameraDistance = 16f * density
            }
            .background(if (hc) Color.Black else color)
            .then(if (hc) Modifier.border(1.dp, Color.White) else Modifier)
            .semantics {
                contentDescription = "$title $value $sub"
                role = androidx.compose.ui.semantics.Role.Button
                onClick(label = "開啟") { onClick(); true }
            }
            // WP 招牌：按下時磁貼朝觸點做 3D 傾斜（不只是縮放）
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = { pos ->
                        // 官方 Tilt 公式（MSDN / Peter Torr）：
                        //   xAngle = asin((y - halfH) / halfH)
                        //   yAngle = acos((x - halfW) / halfW) - 90°
                        // TiltStrength 控制幅度（官方 0..1；磁貼取 0.34，邊緣約 30°）
                        val halfW = (size.width / 2f).coerceAtLeast(1f)
                        val halfH = (size.height / 2f).coerceAtLeast(1f)
                        val strength = 0.34f
                        val dx = ((pos.x - halfW) / halfW).coerceIn(-1f, 1f)
                        val dy = ((pos.y - halfH) / halfH).coerceIn(-1f, 1f)
                        tiltX = (kotlin.math.asin(dy.toDouble()) * 180.0 / Math.PI).toFloat() * strength
                        tiltY = ((kotlin.math.acos(dx.toDouble()) * 180.0 / Math.PI).toFloat() - 90f) * strength
                        pressed = true
                        haptic.performHapticFeedback(androidx.compose.ui.hapticfeedback.HapticFeedbackType.LongPress)
                        try {
                            awaitRelease()
                        } finally {
                            pressed = false
                        }
                    },
                    onTap = { onClick() },
                )
            },
    ) {
        val showBack = angle > 90f
        // 角標（WP Live Tile badge：右上角圓形數字）
        if (badge != null && !showBack) {
            Box(
                Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .size(22.dp)
                    .clip(CircleShape)
                    .background(if (hc) Color.White else Color.Black.copy(alpha = 0.35f)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    badge,
                    color = if (hc) Color.Black else Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                )
            }
        }
        // 內容左下對齊（對應 CSS: justify-content:flex-end; align-items:flex-start）
        // 磁貼高度用 heightIn(min=)，內容多時自然撐高，永不裁字
        Box(
            Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth()
                .then(if (showBack) Modifier.graphicsLayer { rotationY = 180f } else Modifier)
                .padding(12.dp),
        ) {
            Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.Bottom) {
                if (showBack) {
                    Text(
                        back ?: "",
                        color = Color.White,
                        fontSize = 13.sp,
                        lineHeight = 17.sp,
                        maxLines = 6,
                        overflow = TextOverflow.Ellipsis,
                    )
                } else {
                    if (value.isNotBlank()) {
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(
                                value,
                                color = Color.White,
                                fontSize = 26.sp,
                                lineHeight = 30.sp,
                                fontWeight = FontWeight.Light,
                                fontFamily = FontFamily.SansSerif,
                                maxLines = 1,
                            )
                            if (trailing.isNotBlank()) {
                                Text(trailing, color = Color.White.copy(alpha = 0.92f), fontSize = 12.sp, modifier = Modifier.padding(start = 2.dp, bottom = 5.dp))
                            }
                        }
                    }
                    Text(
                        title,
                        color = Color.White,
                        fontSize = 15.sp,
                        lineHeight = 19.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                    if (sub.isNotBlank()) {
                        Text(
                            sub,
                            color = Color.White.copy(alpha = 0.92f),
                            fontSize = 12.sp,
                            lineHeight = 15.sp,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }
    }
}

/** Metro 分組標題（強調色 + 字距） */
@Composable
fun Wp8Group(text: String) {
    Text(
        text,
        color = Wp8.Accent,
        fontSize = 15.sp,
        fontWeight = FontWeight.Light,
        letterSpacing = 1.sp,
        modifier = Modifier.padding(top = 16.dp, bottom = 2.dp),
    )
}

/** Metro 扁平列表行：無卡片、無底色，只有 1px 下分隔線（含 WP rowIn 交錯入場） */
@Composable
fun Wp8Row(
    no: String,
    name: String,
    sub: String = "",
    eta: String = "",
    etaColor: Color? = null,
    star: Boolean = false,
    index: Int = 0,
    onStar: (() -> Unit)? = null,
    onClick: () -> Unit,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(if (pressed) 0.98f else 1f, tween(160, easing = Wp8.Ease), label = "row")
    // WP rowIn：初次渲染時交錯滑入（對應 CSS animation: rowIn .34s ... backwards + 35ms 遞增延遲）
    var entered by remember { androidx.compose.runtime.mutableStateOf(false) }
    androidx.compose.runtime.LaunchedEffect(Unit) { entered = true }
    val enter by animateFloatAsState(
        if (entered) 1f else 0f,
        tween(340, delayMillis = (index.coerceIn(0, 10)) * 35, easing = Wp8.Ease),
        label = "rowIn",
    )
    Row(
        Modifier
            .fillMaxWidth()
            .graphicsLayer {
                alpha = enter
                translationY = (1f - enter) * 12.dp.toPx()
                scaleX = scale
                scaleY = scale
            }
            .clickable(interactionSource = interaction, indication = null) { onClick() }
            .padding(vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (no.isNotBlank()) {
            Text(
                no,
                color = Wp8.Accent,
                fontSize = 22.sp,
                fontWeight = FontWeight.Light,
                maxLines = 1,
                modifier = Modifier.width(58.dp),
            )
            Spacer(Modifier.width(14.dp))
        }
        Column(Modifier.weight(1f)) {
            Text(name, color = Wp8.Text1, fontSize = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (sub.isNotBlank()) {
                Text(sub, color = Wp8.Text2, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        if (eta.isNotBlank()) {
            Text(
                eta,
                color = etaColor ?: Wp8.Text1,
                fontSize = 21.sp,
                fontWeight = FontWeight.Light,
                maxLines = 1,
                style = TextStyle(fontFeatureSettings = "tnum"),
            )
        }
        if (onStar != null) {
            Spacer(Modifier.width(10.dp))
            Box(
                Modifier
                    .size(36.dp)
                    .clickable { onStar() },
                contentAlignment = Alignment.Center,
            ) { Text(if (star) "★" else "☆", color = if (star) Wp8.Medium else Wp8.Text2, fontSize = 17.sp) }
        }
    }
    Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
}

/** Metro 膠囊 → 直角細框 chip；選中 = 強調色實心 */
@Composable
fun Wp8Chip(text: String, active: Boolean, onClick: () -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(if (pressed) 0.95f else 1f, tween(160, easing = Wp8.Ease), label = "chip")
    Box(
        Modifier
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .background(if (active) Wp8.Accent else Color.Transparent)
            .border(1.dp, if (active) Wp8.Accent else Wp8.Text2)
            .clickable(interactionSource = interaction, indication = null) { onClick() }
            .padding(horizontal = 14.dp, vertical = 7.dp),
    ) {
        Text(text, color = if (active) Color.White else Wp8.Text2, fontSize = 13.sp, maxLines = 1)
    }
}

/** Metro 下劃線輸入框（無框、無底色、2px 底線，聚焦轉強調色） */
@Composable
fun Wp8Input(value: String, placeholder: String, onValueChange: (String) -> Unit) {
    var focused by remember { androidx.compose.runtime.mutableStateOf(false) }
    Column(Modifier.fillMaxWidth()) {
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = true,
            textStyle = TextStyle(color = Wp8.Text1, fontSize = 16.sp),
            cursorBrush = SolidColor(Wp8.Accent),
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 14.dp, bottom = 8.dp)
                .onFocusChanged { focused = it.isFocused },
            decorationBox = { inner ->
                Box {
                    if (value.isEmpty()) Text(placeholder, color = Wp8.Text2, fontSize = 16.sp, maxLines = 1)
                    inner()
                }
            },
        )
        Box(
            Modifier
                .fillMaxWidth()
                .height(2.dp)
                .background(if (focused) Wp8.Accent else Wp8.Text2),
        )
    }
}

/** WP 實心強調色主按鈕（大寫字距，直角） */
@Composable
fun Wp8PrimaryButton(text: String, onClick: () -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(if (pressed) 0.98f else 1f, tween(160, easing = Wp8.Ease), label = "btn")
    Box(
        Modifier
            .fillMaxWidth()
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .background(Wp8.Accent)
            .clickable(interactionSource = interaction, indication = null) { onClick() }
            .padding(vertical = 13.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Medium, letterSpacing = 1.sp)
    }
}

/** 設定行（標籤 + 值 + 下分隔線） */
@Composable
fun Wp8SettingRow(label: String, value: String) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
        Text(value, color = Wp8.Text1, fontSize = 15.sp)
    }
    Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
}

/** 分段按鈕（直角細框，選中實心強調色） */
@Composable
fun Wp8Seg(items: List<String>, selected: Int, onSelect: (Int) -> Unit) {
    Row {
        items.forEachIndexed { i, t ->
            val on = i == selected
            Box(
                Modifier
                    .background(if (on) Wp8.Accent else Color.Transparent)
                    .border(1.dp, if (on) Wp8.Accent else Wp8.Line)
                    .clickable { onSelect(i) }
                    .padding(horizontal = 12.dp, vertical = 7.dp),
            ) {
                Text(t, color = if (on) Color.White else Wp8.Text2, fontSize = 13.sp)
            }
        }
    }
}


/** 頂部 3px 強調色進度條（WP 不確定進度） */
@Composable
fun Wp8ProgressBar(active: Boolean) {
    if (!active) return
    val t by rememberInfiniteTransition(label = "wp8pb").animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(1100, easing = LinearEasing)),
        label = "pb",
    )
    Box(Modifier.fillMaxWidth().height(3.dp)) {
        Box(
            Modifier
                .fillMaxHeight()
                .fillMaxWidth(0.3f)
                .graphicsLayer { translationX = (t * 5f - 1.1f) * 1000f / 3f }
                .background(Wp8.Accent),
        )
    }
}
