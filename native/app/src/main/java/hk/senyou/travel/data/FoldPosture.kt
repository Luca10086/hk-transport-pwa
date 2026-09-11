package hk.senyou.travel.data

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * 摺疊姿態偵測（androidx.window）——對應 iPhone Duo 發表會的官方行為：
 * 「**即使沒有在充電，只要讓設備折起立放，它就會進入待機顯示模式**」。
 *
 * 另外官方半開合時「內屏一半顯示內容、一半顯示控件」，本 App 以
 * [State.horizontalFold] 判斷摺線方向，讓內容避開鉸鏈帶。
 *
 * 非摺疊機（或 Robolectric 測試環境）取不到 FoldingFeature，回報 [State.halfOpen] = false，
 * 版面自動退回一般模式。
 */
object FoldPosture {

    /**
     * @param halfOpen 目前是否為 HALF_OPENED（半開合／立放）
     * @param horizontalFold 摺線是否為水平（像筆電一樣上下對折）→ 內容／控件上下分區
     * @param separating 鉸鏈是否正在分離（真正的半開合，而非完全攤平）
     */
    data class State(
        val halfOpen: Boolean = false,
        val horizontalFold: Boolean = false,
        val separating: Boolean = false,
    )

    /** 從任意 Context 往上找出宿主 Activity（WindowInfoTracker 需要） */
    fun findActivity(ctx: Context): Activity? {
        var c: Context? = ctx
        var guard = 0
        while (c is ContextWrapper && guard++ < 12) {
            if (c is Activity) return c
            c = c.baseContext
        }
        return null
    }

    /** 姿態變化的 Flow；環境不支援時回傳 null（呼叫端據此退回一般版面） */
    fun flow(ctx: Context): Flow<State>? {
        val act = findActivity(ctx) ?: return null
        val tracker = runCatching { WindowInfoTracker.getOrCreate(ctx) }.getOrNull() ?: return null
        return runCatching {
            tracker.windowLayoutInfo(act).map { info ->
                val f = info.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
                State(
                    halfOpen = f?.state == FoldingFeature.State.HALF_OPENED,
                    horizontalFold = f?.orientation == FoldingFeature.Orientation.HORIZONTAL,
                    separating = f?.isSeparating == true,
                )
            }
        }.getOrNull()
    }
}

/** Compose 端讀取目前摺疊姿態（不支援摺疊時恆為 [FoldPosture.State] 預設值） */
@Composable
fun rememberFoldPosture(): FoldPosture.State {
    val ctx = LocalContext.current
    var state by remember { mutableStateOf(FoldPosture.State()) }
    LaunchedEffect(ctx) {
        val f = FoldPosture.flow(ctx) ?: return@LaunchedEffect
        runCatching { f.collect { state = it } }
    }
    return state
}
