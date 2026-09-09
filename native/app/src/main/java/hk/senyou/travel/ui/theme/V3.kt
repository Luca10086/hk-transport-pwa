package hk.senyou.travel.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/** WP2026 v3 设计令牌（与 Web 版 wp2026.css 同源） */
object V3 {
    val Bg = Color(0xFF04060C)
    val Accent = Color(0xFF0078D7)
    val Aux = Color(0xFF00B4D8)
    val Success = Color(0xFF4CAF50)
    val Warning = Color(0xFFFFB74D)
    val Danger = Color(0xFFFF5252)

    val Text1 = Color.White
    val Text2 = Color.White.copy(alpha = 0.55f)
    val Line = Color.White.copy(alpha = 0.16f)
    val Glass = Color.White.copy(alpha = 0.07f)
    val GlassStrong = Color.White.copy(alpha = 0.12f)
    val Press = Color(0xFF0078D7).copy(alpha = 0.30f)

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
}

private val SenyouScheme = darkColorScheme(
    primary = V3.Accent,
    secondary = V3.Aux,
    background = V3.Bg,
    surface = Color(0xFF0A0D14),
    onPrimary = Color.White,
    onBackground = V3.Text1,
    onSurface = V3.Text1,
)

@Composable
fun SenyouTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = SenyouScheme, content = content)
}
