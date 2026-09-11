package hk.senyou.travel.ui

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import hk.senyou.travel.data.AlarmRepo
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StandbyAudio
import hk.senyou.travel.data.Store
import hk.senyou.travel.ui.theme.SenyouTheme
import kotlinx.coroutines.launch

/**
 * 待機顯示模式（iPhone Duo 復刻）——**獨立 Activity、獨立視窗**。
 *
 * 為什麼要獨立：
 * · 待機畫面與主外殼（NavigationView／CommandBar／多層覆蓋）不共用同一棵 composition，
 *   避免複雜外殼的槽位表影響待機畫面（真機曾出現 Compose 內部的型別轉換崩潰）
 * · 狀態欄隱藏、螢幕常亮、鎖屏顯示都屬於「視窗層級」行為，放在自己的 Activity 才正確
 * · 鬧鐘觸發時可直接喚起本 Activity，不必先開主畫面再切換
 */
class StandbyActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        if (intent?.getBooleanExtra(AlarmRepo.EXTRA_RING, false) == true) {
            AlarmRepo.ringing = true
        }

        /* 床頭鐘：不讓螢幕睡著；鎖屏時也能亮起顯示 */
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }

        /* 官方待機畫面沒有狀態欄 → 隱藏（下滑可臨時喚出） */
        val ctrl = WindowCompat.getInsetsController(window, window.decorView)
        ctrl.hide(WindowInsetsCompat.Type.statusBars())
        ctrl.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        setContent {
            SenyouTheme {
                val act = this@StandbyActivity
                val flow = remember { Store.settings(act) }
                val settings by flow.collectAsState(initial = Settings())
                val scope = rememberCoroutineScope()
                StandbyScreen(
                    onExit = { finish() },
                    settings = settings,
                    onSettings = { s -> scope.launch { Store.save(act, s) } },
                )
            }
        }
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        if (intent.getBooleanExtra(AlarmRepo.EXTRA_RING, false)) AlarmRepo.ringing = true
    }

    override fun onDestroy() {
        StandbyAudio.releaseAll()
        super.onDestroy()
    }
}
