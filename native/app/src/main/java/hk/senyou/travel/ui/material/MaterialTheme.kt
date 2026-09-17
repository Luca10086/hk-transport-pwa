package hk.senyou.travel.ui.material

import android.os.Build
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

/**
 * **Material 3 主題**（與 W10M 風格完全獨立的實作）。
 *
 * 規範遵循：
 * · **色彩**：Android 12+ 使用 **dynamic colour**（Material You，由桌布取色）；
 *   較舊版本退回 M3 baseline 色票。不使用本專案的 WP 強調色（那屬 W10M 語意）。
 * · **字階**：使用 M3 官方 Typography（displayLarge … labelSmall），不套用內嵌 Noto 子集字型。
 * · **形狀**：使用 M3 官方 Shapes（extraSmall 4 / small 8 / medium 12 / large 16 / extraLarge 28）。
 * · **明暗**：跟隨使用者在設定頁「主題」的選擇（深色／淺色）；Material 版不做自訂強調色，
 *   因為 M3 的色彩語意由 dynamic colour／ColorScheme 角色決定（primary／secondary／tertiary…）。
 */
@Composable
fun SenyouMaterialTheme(
    dark: Boolean,
    content: @Composable () -> Unit,
) {
    val ctx = LocalContext.current
    val scheme = when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
            if (dark) dynamicDarkColorScheme(ctx) else dynamicLightColorScheme(ctx)

        dark -> darkColorScheme()
        else -> lightColorScheme()
    }
    MaterialTheme(colorScheme = scheme, content = content)
}
