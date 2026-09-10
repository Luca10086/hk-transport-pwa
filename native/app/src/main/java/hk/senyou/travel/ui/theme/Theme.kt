package hk.senyou.travel.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import hk.senyou.travel.ui.wp8.Wp8

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
        content = content,
    )
}
