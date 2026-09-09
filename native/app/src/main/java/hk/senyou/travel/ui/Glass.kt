package hk.senyou.travel.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import hk.senyou.travel.ui.theme.V3

/** 玻璃配置（由設定頁驅動）：強度 alpha / 液態高光 / 動效開關 */
data class GlassCfg(
    val alpha: Float = 0.07f,
    val sheen: Boolean = true,
    val motion: Boolean = true,
)

val LocalGlassCfg = compositionLocalOf { GlassCfg() }
val LocalDeepNight = compositionLocalOf { false }

/**
 * 液態玻璃容器（v3）：半透明填充 + 1px 描邊 + 頂緣反光 + 12s 液態高光。
 * 真折射（RenderEffect/AGSL）在 M4 接入，此處為視覺等效的 Compose 實現。
 */
@Composable
fun GlassSurface(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(V3.RadiusTile),
    strong: Boolean = false,
    sheen: Boolean = true,
    content: @Composable BoxScope.() -> Unit,
) {
    val cfg = LocalGlassCfg.current
    val sheenPos: Float = if (sheen && cfg.sheen && cfg.motion) {
        val tr = rememberInfiniteTransition(label = "sheen")
        tr.animateFloat(
            initialValue = -1.8f,
            targetValue = 1.8f,
            animationSpec = infiniteRepeatable(tween(durationMillis = 12000, easing = LinearEasing)),
            label = "sheenPos",
        ).value
    } else 0f

    Box(
        modifier = modifier
            .clip(shape)
            .background(Color.White.copy(alpha = cfg.alpha))
            .border(1.dp, V3.Line, shape)
            .drawWithContent {
                drawContent()
                // 頂緣反光條
                val stroke = 1.dp.toPx()
                drawLine(
                    brush = Brush.horizontalGradient(
                        listOf(Color.Transparent, Color.White.copy(alpha = 0.35f), Color.Transparent)
                    ),
                    start = Offset(size.width * 0.06f, stroke / 2f),
                    end = Offset(size.width * 0.94f, stroke / 2f),
                    strokeWidth = stroke,
                )
                // 液態高光（對角掃過）
                if (cfg.sheen) {
                    val c = size.width * (0.5f + sheenPos * 0.9f)
                    drawRect(
                        brush = Brush.linearGradient(
                            colors = listOf(Color.Transparent, Color.White.copy(alpha = 0.10f), Color.Transparent),
                            start = Offset(c - size.width * 0.35f, 0f),
                            end = Offset(c + size.width * 0.35f, size.height),
                        ),
                    )
                }
            },
        content = content,
    )
}
