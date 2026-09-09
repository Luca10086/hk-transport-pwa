package hk.senyou.travel.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/**
 * WP2026 v3 設計令牌（與 Web 版 wp2026.css 同源）。
 *
 * 主題相關令牌為 `var`：由 `V3.apply(theme, accent)` 在組樹重建前設定；
 * App 以 `key(theme, accent)` 包住內容，切換時整體重組並讀取新值。
 */
object V3 {
    /* ---------- 主題色（var：隨主題切換） ---------- */
    var Bg: Color = Color(0xFF04060C); private set
    var Text1: Color = Color.White; private set
    var Text2: Color = Color.White.copy(alpha = 0.55f); private set
    var Line: Color = Color.White.copy(alpha = 0.16f); private set
    var GlassTint: Color = Color.White; private set
    var isLight: Boolean = false; private set

    /* ---------- 強調色（var：隨設定切換） ---------- */
    var Accent: Color = Color(0xFF0078D7); private set

    /* ---------- 固定語義色 ---------- */
    val Aux = Color(0xFF00B4D8)
    val Success = Color(0xFF4CAF50)
    val Warning = Color(0xFFFFB74D)
    val Danger = Color(0xFFFF5252)

    val CoKmb = Color(0xFF0078D7)
    val CoCtb = Color(0xFFFF6B35)
    val CoNlb = Color(0xFF4CAF50)
    val CoMtr = Color(0xFFE91E63)
    val CoLrt = Color(0xFF7C4DFF)
    val CoMtrBus = Color(0xFF00897B)

    val EasePress = CubicBezierEasing(0.34f, 1.56f, 0.64f, 1f)
    val EaseSheet = CubicBezierEasing(0.05f, 0.7f, 0.1f, 1f)

    val RadiusTile = 18.dp
    val RadiusSheet = 26.dp

    /** 套用主題 + 強調色（在組樹重建前呼叫） */
    fun apply(theme: String, accentArgb: Long) {
        Accent = Color(accentArgb)
        if (theme == "light") {
            isLight = true
            Bg = Color(0xFFEDF1F7)
            Text1 = Color(0xFF16243A)
            Text2 = Color(0xB316243A)
            Line = Color(0x1F000000)
            GlassTint = Color.White
        } else {
            isLight = false
            Bg = Color(0xFF04060C)
            Text1 = Color.White
            Text2 = Color(0x8CFFFFFF)
            Line = Color(0x29FFFFFF)
            GlassTint = Color.White
        }
    }
}

private val DarkScheme = darkColorScheme(
    primary = V3.Accent,
    secondary = V3.Aux,
    background = Color(0xFF04060C),
    surface = Color(0xFF0A0D14),
    onPrimary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White,
)

private val LightScheme = lightColorScheme(
    primary = V3.Accent,
    secondary = V3.Aux,
    background = Color(0xFFEDF1F7),
    surface = Color(0xFFFFFFFF),
    onPrimary = Color.White,
    onBackground = Color(0xFF16243A),
    onSurface = Color(0xFF16243A),
)

@Composable
fun SenyouTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (V3.isLight) LightScheme else DarkScheme,
        content = content,
    )
}
