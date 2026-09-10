package hk.senyou.travel.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

private class Blob(val x: Float, val y: Float, val r: Float, val s: Float, val ph: Float, val hue: Int)
private class Star(val x: Float, val y: Float, val r: Float, val ph: Float)

private fun rnd(a: Float, b: Float) = a + Random.nextFloat() * (b - a)

/**
 * 液體背景宿主。
 *
 * 3.0.2 起移除了 GraphicsLayer 錄製 + 每 300ms `toImageBitmap()` 快照：
 * 那會在每次取樣時配置一張全屏位圖（外屏 ~12MB、內屏 ~29MB），
 * 並讓每個面板都重畫一次全屏背景層，是真機卡頓與閃退的主因。
 * 現在只保留一個純 Canvas 背景，玻璃面板用色調 + 描邊（見 Glass.kt）。
 */
@Composable
fun LiquidBackgroundHost(
    modifier: Modifier = Modifier,
    deepNight: Boolean = false,
    snapshot: Boolean = true,   // 相容舊呼叫端，已無作用
    light: Boolean = false,
    animate: Boolean = true,
    content: @Composable () -> Unit,
) {
    Box(modifier) {
        LiquidBackground(
            modifier = Modifier.matchParentSize(),
            deepNight = deepNight,
            light = light,
            animate = animate,
        )
        content()
    }
}

/** 液體背景：6 團流動光斑 + 42 顆星野（低頻更新，降低 GPU 負載；淺色主題用淺底 + 淡藍光暈） */
@Composable
fun LiquidBackground(
    modifier: Modifier = Modifier,
    deepNight: Boolean = false,
    light: Boolean = false,
    animate: Boolean = true,
) {
    val blobs = remember {
        List(6) { i ->
            Blob(
                x = rnd(0.05f, 0.95f),
                y = rnd(0.05f, 0.95f),
                r = rnd(0.24f, 0.58f),
                s = rnd(0.08f, 0.17f),
                ph = rnd(0f, 6.28f),
                hue = i % 3,
            )
        }
    }
    val stars = remember {
        List(42) { Star(rnd(0f, 1f), rnd(0f, 1f), rnd(0.6f, 2.2f), rnd(0f, 6.28f)) }
    }
    var t by remember { mutableFloatStateOf(0f) }

    if (animate && !hk.senyou.travel.data.DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            var last = 0L
            while (true) {
                withFrameNanos { now ->
                    if (last == 0L) last = now
                    // 8fps：光斑移動緩慢，視覺上仍是流動的，但 GPU 負載降為 1/4
                    if (now - last >= 125_000_000L) {
                        t = now / 1_000_000_000f
                        last = now
                    }
                }
            }
        }
    }

    val tints = if (light) listOf(Color(0xFF3E7FD0), Color(0xFF2FA6C8), Color(0xFF6C8FE0))
    else listOf(Color(0xFF0078D7), Color(0xFF00B4D8), Color(0xFF0A5BD7))
    Canvas(modifier) {
        val w = size.width
        val h = size.height
        drawRect(
            when {
                light -> Color(0xFFEDF1F7)
                deepNight -> Color(0xFF020409)
                else -> Color(0xFF04060C)
            }
        )
        blobs.forEach { b ->
            val x = (b.x + sin(t * b.s + b.ph) * 0.20f) * w
            val y = (b.y + cos(t * b.s * 0.9f + b.ph) * 0.17f) * h
            val r = b.r * w * 0.62f
            val a = when {
                light -> if (b.hue == 0) 0.16f else 0.12f
                deepNight -> 0.20f
                b.hue == 0 -> 0.40f
                else -> 0.33f
            }
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(tints[b.hue].copy(alpha = a), Color.Transparent),
                    center = Offset(x, y),
                    radius = r,
                ),
                radius = r,
                center = Offset(x, y),
            )
        }
        val baseAlpha = when {
            light -> 0.10f
            deepNight -> 0.28f
            else -> 0.78f
        }
        stars.forEach { s ->
            val a = baseAlpha * (0.4f + 0.6f * abs(sin(t * 0.8f + s.ph)))
            drawCircle(
                color = (if (light) Color(0xFF7E93AE) else Color.White).copy(alpha = a),
                radius = s.r * (h / 900f),
                center = Offset(s.x * w, s.y * h),
            )
        }
    }
}