package hk.senyou.travel.ui

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo

/** 屏幕尺寸分級（Material 3 斷點） */
enum class SizeClass { Compact, Medium, Expanded }

/** 摺疊屏姿態 */
enum class FoldPosture { Flat, Separating }

/**
 * 自適應佈局資訊：
 * - sizeClass：<600dp 緊湊 / 600–840dp 中等 / ≥840dp 展開（如 MIX Fold 4 內屏約 953×852dp）
 * - fold：鉸鏈分隔姿態與佔據範圍（像素，供內容避讓）
 */
data class AdaptiveInfo(
    val sizeClass: SizeClass = SizeClass.Compact,
    val widthDp: Int = 411,
    val heightDp: Int = 891,
    val posture: FoldPosture = FoldPosture.Flat,
    val hingeTopPx: Int = 0,
    val hingeBottomPx: Int = 0,
    val density: Float = 3f,
) {
    val isExpanded: Boolean get() = sizeClass == SizeClass.Expanded
    val isWide: Boolean get() = sizeClass != SizeClass.Compact
    /** 鉸鏈高度（px） */
    val hingeHeightPx: Int get() = (hingeBottomPx - hingeTopPx).coerceAtLeast(0)
    /** 半折（Flex mode）：鉸鏈分隔且佔據可觀高度 → 上下分屏 */
    val flexMode: Boolean get() = posture == FoldPosture.Separating && hingeHeightPx > 24
    val hingeTopDp: Int get() = (hingeTopPx / density).toInt()
    val hingeHeightDp: Int get() = (hingeHeightPx / density).toInt()
    /** 列表列數：展開 3 列 / 中等 2 列 / 緊湊 1 列 */
    val listColumns: Int get() = when (sizeClass) {
        SizeClass.Expanded -> 3
        SizeClass.Medium -> 2
        else -> 1
    }
}

val LocalAdaptive = compositionLocalOf { AdaptiveInfo() }

private fun Context.findActivity(): Activity? {
    var c: Context? = this
    while (c is ContextWrapper) {
        if (c is Activity) return c
        c = c.baseContext
    }
    return null
}

/** 監聽摺疊狀態（MIX Fold 4 半折/帳篷等姿態時可用） */
@Composable
fun rememberFoldInfo(): Pair<FoldPosture, IntRange?> {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    var posture by remember { mutableStateOf(FoldPosture.Flat) }
    var bounds by remember { mutableStateOf<IntRange?>(null) }
    val activity = remember(ctx) { ctx.findActivity() }
    LaunchedEffect(activity) {
        val act = activity ?: return@LaunchedEffect
        runCatching {
            WindowInfoTracker.getOrCreate(act).windowLayoutInfo(act).collect { info: WindowLayoutInfo ->
                val f = info.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
                if (f == null) {
                    posture = FoldPosture.Flat
                    bounds = null
                } else {
                    posture = if (f.isSeparating) FoldPosture.Separating else FoldPosture.Flat
                    bounds = f.bounds.top..f.bounds.bottom
                }
            }
        }
    }
    return posture to bounds
}
