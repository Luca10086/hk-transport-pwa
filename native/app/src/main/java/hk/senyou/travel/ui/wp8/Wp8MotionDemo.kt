package hk.senyou.travel.ui.wp8

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * WP8 官方動效演示。
 *
 * 逐項對應 Windows Phone 官方動效分類（MSDN Magazine《Windows Phone Navigation, Part 2》Figure 1）：
 *  | 動畫 | 官方用途 |
 *  |------|----------|
 *  | Turnstile | 從一個空間到另一個空間，**裝置預設**轉場，刻意做得「重」以強調發生了一次轉換 |
 *  | Slide | 暫時性 UI（把內容帶到現有內容之上） |
 *  | Swivel | 對話框；不轉換空間，讓使用者留在同一空間 |
 *  | Continuum | 帶連續感的轉場，把上下文帶過去 |
 *  | Rotate | 特定方向與角度旋轉（多用於螢幕方向） |
 * 另有 Live Tile 翻面（非頁面轉場）。
 *
 * 官方硬性建議：**轉場（in + out 合計）總時長 300ms 為上限**。
 */
private data class MotionSpec(
    val key: String,
    val title: String,
    val usage: String,
    val durMs: Int,
)

private val MOTIONS = listOf(
    MotionSpec("turnstile", "Turnstile", "頁面轉場 · 裝置預設（繞 Y 軸 90° 轉入）", 260),
    MotionSpec("slide", "Slide", "暫時性 UI · 由下帶入並淡入", 220),
    MotionSpec("swivel", "Swivel", "對話框 · 繞 X 軸轉入（留在同一空間）", 240),
    MotionSpec("continuum", "Continuum", "連續感轉場 · 位移＋縮放", 280),
    MotionSpec("rotate", "Rotate", "旋轉 90°", 260),
    MotionSpec("tilt", "Tilt", "磁貼按壓傾斜（官方 asin/acos 公式）", 0),
    MotionSpec("flip", "Live Tile 翻面", "磁貼翻面（非頁面轉場）", 500),
)

@Composable
fun Wp8MotionDemo() {
    var current by remember { mutableStateOf(MOTIONS.first()) }
    var token by remember { mutableIntStateOf(0) }
    val p = remember { Animatable(1f) }
    var tiltSpec by remember { mutableStateOf(false) }
    val density = LocalDensity.current.density

    LaunchedEffect(token) {
        if (current.key == "tilt") return@LaunchedEffect
        p.snapTo(0f)
        p.animateTo(1f, tween(current.durMs, easing = Wp8.EaseTurnstile))
    }

    Wp8SectionTitle("官方動效演示（點下方任一項播放）")

    // 演示舞台
    Box(
        Modifier
            .fillMaxWidth()
            .height(190.dp)
            .background(Wp8.Surface),
        contentAlignment = Alignment.Center,
    ) {
        val t = p.value
        Box(
            Modifier
                .padding(24.dp)
                .fillMaxWidth()
                .height(110.dp)
                .graphicsLayer {
                    when (current.key) {
                        "turnstile" -> {
                            rotationY = 90f * (1f - t)
                            transformOrigin = TransformOrigin(0f, 0.5f)
                            cameraDistance = 10f * density
                            alpha = 0.4f + 0.6f * t
                        }
                        "slide" -> {
                            translationY = 70.dp.toPx() * (1f - t)
                            alpha = t
                        }
                        "swivel" -> {
                            rotationX = -45f * (1f - t)
                            transformOrigin = TransformOrigin(0.5f, 0f)
                            cameraDistance = 10f * density
                            alpha = 0.4f + 0.6f * t
                        }
                        "continuum" -> {
                            translationX = 60.dp.toPx() * (1f - t)
                            val s = 0.86f + 0.14f * t
                            scaleX = s; scaleY = s
                            alpha = t
                        }
                        "rotate" -> rotationZ = 90f * (1f - t)
                        "flip" -> {
                            rotationY = 180f * t
                            cameraDistance = 16f * density
                        }
                        "tilt" -> {
                            val a = if (tiltSpec) 1f else 0f
                            rotationX = 18f * a
                            rotationY = -18f * a
                            cameraDistance = 16f * density
                        }
                    }
                }
                .background(Wp8.TileCobalt)
                .padding(14.dp),
        ) {
            Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.Bottom) {
                Text("森友出行", color = androidx.compose.ui.graphics.Color.White, fontSize = 24.sp, fontWeight = FontWeight.Light)
                Text(
                    "K75P · 天瑞 ↺ 洪水橋",
                    color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.92f),
                    fontSize = 12.sp,
                )
            }
        }
    }

    Spacer(Modifier.height(10.dp))
    Text(
        "${current.title} · ${current.usage}" + if (current.durMs > 0) " · ${current.durMs}ms（上限 ${Wp8.TransitionMaxMs}ms）" else "",
        color = Wp8.Text2,
        fontSize = 12.sp,
    )

    Spacer(Modifier.height(6.dp))
    MOTIONS.forEach { m ->
        Wp8Row(
            no = "",
            name = m.title,
            sub = m.usage,
            eta = if (m.durMs > 0) "${m.durMs}ms" else "按住",
            etaColor = if (m == current) Wp8.Accent else Wp8.Text2,
        ) {
            current = m
            token++
            if (m.key == "tilt") tiltSpec = !tiltSpec
        }
    }

    Wp8SectionTitle("官方規範摘要")
    Text(
        "· 轉場（in + out 合計）總時長 300ms 為上限\n" +
            "· Turnstile 是裝置預設頁面轉場，刻意做得「重」\n" +
            "· Slide / Swivel 用於暫時性 UI，不用於頁面轉場\n" +
            "· 按壓傾斜採官方 asin/acos 公式（TiltStrength 控制幅度）",
        color = Wp8.Text2,
        fontSize = 12.sp,
        lineHeight = 18.sp,
    )
}
