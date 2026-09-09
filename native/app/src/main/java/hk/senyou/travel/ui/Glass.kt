package hk.senyou.travel.ui

import android.graphics.RuntimeShader
import android.graphics.Shader
import android.os.Build
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.BlurEffect
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.ShaderBrush
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.layer.GraphicsLayer
import androidx.compose.ui.graphics.layer.drawLayer
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.unit.dp
import hk.senyou.travel.ui.theme.V3

/** 玻璃配置（設定頁驅動）：強度 alpha / 真模糊半徑 / 折射強度 / 高光 / 動效 / 淺色主題 */
data class GlassCfg(
    val alpha: Float = 0.07f,
    val blurPx: Float = 26f,
    val refractPx: Float = 20f,
    val sheen: Boolean = true,
    val motion: Boolean = true,
    val light: Boolean = false,
)

val LocalGlassCfg = compositionLocalOf { GlassCfg() }

/** 背景圖層（由 LiquidBackgroundHost 提供）：玻璃面板據此做真·背景模糊與折射 */
val LocalBgLayer = compositionLocalOf<GraphicsLayer?> { null }

/** 背景快照（AGSL 折射取樣用，約 300ms 更新一次） */
val LocalBgBitmap = compositionLocalOf<ImageBitmap?> { null }

val LocalDeepNight = compositionLocalOf { false }

/** AGSL 邊緣折射：邊緣帶內按法向位移取樣背景 + 邊緣提亮（Android 13+） */
private const val REFRACT_AGSL = """
uniform shader uBg;
uniform float2 uOffset;
uniform float2 uSize;
uniform float uRefract;
half4 main(float2 xy) {
    float2 p = xy + uOffset;
    float2 d = min(xy, uSize - xy);
    float edge = min(d.x, d.y);
    float band = 18.0;
    float k = 1.0 - smoothstep(0.0, band, edge);
    float2 dir = normalize(xy - uSize * 0.5 + float2(0.001, 0.001));
    float2 uv = p + dir * k * uRefract;
    half4 c = uBg.eval(uv);
    c.rgb += half3(0.07) * half(k);
    return c;
}
"""

/**
 * 液態玻璃容器（v3 · M4 真玻璃）：
 * - 雙層結構：①背景副本層（GraphicsLayer 取樣 + RenderEffect 真 backdrop blur，API 31+）
 *   ②內容層（色調 + 描邊 + 文字 + AGSL 邊緣折射 + 高光）——文字永不模糊
 * - API 33+：AGSL RuntimeShader 邊緣折射（內容真的彎曲）+ 邊緣提亮
 * - 低版本/無背景圖層：退回半透明填充
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
    val bgLayer = LocalBgLayer.current
    val bgBitmap = LocalBgBitmap.current

    var pos by remember { mutableStateOf(Offset.Zero) }
    var size by remember { mutableStateOf(Offset.Zero) }

    val canBlur = bgLayer != null && cfg.blurPx > 0f && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
    val canRefract = bgBitmap != null && cfg.refractPx > 0f && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU

    // 折射 shader（每幀更新 uniform，成本極低）
    val refractShader = remember(canRefract) {
        if (!canRefract) null else runCatching { RuntimeShader(REFRACT_AGSL) }.getOrNull()
    }

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
        modifier
            .onGloballyPositioned {
                pos = it.positionInRoot()
                size = Offset(it.size.width.toFloat(), it.size.height.toFloat())
            }
            .clip(shape)
            .border(1.dp, V3.Line, shape)
            .drawWithContent {
                // ① 玻璃色調（淺色主題需更高不透明度；在背景模糊層之上、內容之下）
                val tintAlpha = if (cfg.light) (if (strong) 0.62f else 0.45f)
                else (if (strong) cfg.alpha * 1.7f else cfg.alpha)
                drawRect(V3.GlassTint.copy(alpha = tintAlpha))
                drawContent()
                // ② 邊緣折射（AGSL）：內容真的彎曲
                if (canRefract && refractShader != null) {
                    val bmp = bgBitmap
                    if (bmp != null) {
                        runCatching {
                            val bm = bmp.asAndroidBitmap()
                            val bs = android.graphics.BitmapShader(bm, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP)
                            refractShader.setInputShader("uBg", bs)
                            refractShader.setFloatUniform("uOffset", pos.x, pos.y)
                            refractShader.setFloatUniform("uSize", size.x, size.y)
                            refractShader.setFloatUniform("uRefract", cfg.refractPx)
                            drawRect(brush = ShaderBrush(refractShader))
                        }
                    }
                }
                // ③ 頂緣反光條
                val stroke = 1.dp.toPx()
                drawLine(
                    brush = Brush.horizontalGradient(
                        listOf(
                            Color.Transparent,
                            if (cfg.light) Color.Black.copy(alpha = 0.10f) else Color.White.copy(alpha = 0.35f),
                            Color.Transparent,
                        )
                    ),
                    start = Offset(this.size.width * 0.06f, stroke / 2f),
                    end = Offset(this.size.width * 0.94f, stroke / 2f),
                    strokeWidth = stroke,
                )
                // ④ 液態高光（對角掃過）
                if (cfg.sheen) {
                    val c = this.size.width * (0.5f + sheenPos * 0.9f)
                    val sheenColor = if (cfg.light) Color.Black.copy(alpha = 0.05f) else Color.White.copy(alpha = 0.10f)
                    drawRect(
                        brush = Brush.linearGradient(
                            colors = listOf(Color.Transparent, sheenColor, Color.Transparent),
                            start = Offset(c - this.size.width * 0.35f, 0f),
                            end = Offset(c + this.size.width * 0.35f, this.size.height),
                        ),
                    )
                }
            },
    ) {
        // 背景模糊層（matchParentSize 不影響父尺寸，故內容尺寸由下方 content 決定）
        if (canBlur) {
            Box(
                Modifier
                    .matchParentSize()
                    .graphicsLayer {
                        renderEffect = BlurEffect(cfg.blurPx, cfg.blurPx, TileMode.Clamp)
                    }
                    .drawWithContent {
                        val p = pos
                        withTransform({ translate(-p.x, -p.y) }) { drawLayer(bgLayer!!) }
                    },
            )
        }
        // 內容（正常子元素：決定容器尺寸，文字永不模糊）
        content()
    }
}
