package hk.senyou.travel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.layer.GraphicsLayer
import androidx.compose.ui.unit.dp
import hk.senyou.travel.ui.theme.V3

/**
 * 面板配置（設定頁驅動）。
 *
 * 3.0.2 起改為「WP 亞克力」：只用色調 + 描邊 + 頂緣高光，
 * 不再使用 RenderEffect 模糊 / AGSL RuntimeShader / GraphicsLayer 截圖。
 * 原因（真機回報）：
 *  - 折射 rect 畫在內容「之上」且不透明 → 開啟玻璃後所有文字被蓋住；
 *  - 每 300ms `toImageBitmap()`（全屏 12–29MB）× 每面板一次背景層繪製 + 模糊 → 卡頓與閃退。
 * 保留欄位是為了不改動既有呼叫端；blur/refract 僅作為視覺強度參考，不再做 GPU 運算。
 */
data class GlassCfg(
    val alpha: Float = 0.07f,
    val blurPx: Float = 26f,
    val refractPx: Float = 20f,
    val sheen: Boolean = true,
    val motion: Boolean = true,
    val light: Boolean = false,
)

val LocalGlassCfg = compositionLocalOf { GlassCfg() }

/** 已停用（保留型別以免呼叫端改動）：原本指向背景 GraphicsLayer */
val LocalBgLayer = compositionLocalOf<GraphicsLayer?> { null }

/** 已停用（保留型別以免呼叫端改動）：原本是背景快照位圖 */
val LocalBgBitmap = compositionLocalOf<ImageBitmap?> { null }

val LocalDeepNight = compositionLocalOf { false }

/**
 * 面板容器（文字安全）：所有裝飾都畫在內容之下，或只是 1px 邊線。
 * 形狀預設直角（WP/Metro 風格），由呼叫端傳入的 shape 決定。
 */
@Composable
fun GlassSurface(
    modifier: Modifier = Modifier,
    shape: Shape = RectangleShape,
    strong: Boolean = false,
    sheen: Boolean = true,
    content: @Composable BoxScope.() -> Unit,
) {
    val cfg = LocalGlassCfg.current
    val tint = panelTint(cfg, strong)

    Box(
        modifier
            .clip(shape)
            .background(tint)
            .border(1.dp, V3.Line, shape)
            .drawWithContent {
                // 內容先畫（文字永不被裝飾覆蓋）
                drawContent()
                // 頂緣高光線：WP/Fluent 面板特徵，僅 1px，位於邊界上
                if (sheen && cfg.sheen) {
                    val stroke = 1.dp.toPx()
                    drawLine(
                        brush = Brush.horizontalGradient(
                            listOf(
                                Color.Transparent,
                                if (cfg.light) Color.Black.copy(alpha = 0.12f)
                                else Color.White.copy(alpha = 0.30f),
                                Color.Transparent,
                            )
                        ),
                        start = Offset(this.size.width * 0.04f, stroke / 2f),
                        end = Offset(this.size.width * 0.96f, stroke / 2f),
                        strokeWidth = stroke,
                    )
                }
            },
    ) {
        content()
    }
}

/** 面板底色：深色=白色低透明提亮；淺色=白色高透明磨砂 */
private fun panelTint(cfg: GlassCfg, strong: Boolean): Color {
    val a = if (cfg.light) {
        if (strong) 0.72f else 0.55f
    } else {
        (if (strong) cfg.alpha * 1.7f else cfg.alpha)
    }
    return Color.White.copy(alpha = a.coerceIn(0f, 0.92f))
}