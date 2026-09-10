package hk.senyou.travel.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material3.LocalTextStyle
import hk.senyou.travel.R
import hk.senyou.travel.ui.wp8.Wp8

/**
 * 森友出行 · 內嵌字型（Noto Sans CJK TC，已按應用實際字集子集化：15.6MB → 0.58MB）。
 *
 * WP8 的招牌是 Segoe UI Light 那種又細又挺的字。Android 系統字型（尤其 MIUI 會替換字型）
 * 常常沒有中文 Light 字重，`FontWeight.Light` 會退回 Regular，字就變粗、失去 Metro 味。
 * 內嵌後不論機型都能得到一致的細體大標題。
 */
val SenyouFontFamily = FontFamily(
    Font(R.font.senyou_regular, FontWeight.Normal),
    Font(R.font.senyou_regular, FontWeight.Medium),
    Font(R.font.senyou_light, FontWeight.Light),
)

/**
 * 3.2.0 起全面改為 WP8 / Metro 風格（見 ui/wp8/）。
 * Material 只作為 Text / BasicTextField 等基礎元件的宿主，視覺一律由 Wp8 令牌決定。
 */
private val DarkScheme = darkColorScheme(
    primary = Color(0xFF8B5CF6),
    background = Color(0xFF15121C),
    surface = Color(0xFF221D31),
    onPrimary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White,
)

private val LightScheme = lightColorScheme(
    primary = Color(0xFF8B5CF6),
    background = Color(0xFFF4F2F8),
    surface = Color.White,
    onPrimary = Color.White,
    onBackground = Color(0xFF1A1425),
    onSurface = Color(0xFF1A1425),
)

@Composable
fun SenyouTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (Wp8.light) LightScheme else DarkScheme,
    ) {
        // 全站預設字型：細體（大標題）＋ Regular（正文）都由內嵌字型提供
        CompositionLocalProvider(
            LocalTextStyle provides TextStyle(fontFamily = SenyouFontFamily),
            content = content,
        )
    }
}
