package hk.senyou.travel

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import hk.senyou.travel.data.Kind
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.ui.DeepLink
import hk.senyou.travel.ui.SenyouApp

class MainActivity : ComponentActivity() {

    private val notifPerm = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        maybeAskNotifications()
        consumeDeepLink(intent)
        consumeAlarm(intent)
        setContent {
            SenyouApp()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        consumeDeepLink(intent)
        consumeAlarm(intent)
    }

    /** 鬧鐘喚起：標記響鈴並要求打開待機畫面 */
    private fun consumeAlarm(intent: Intent?) {
        if (intent?.getBooleanExtra(hk.senyou.travel.data.AlarmRepo.EXTRA_RING, false) == true) {
            hk.senyou.travel.data.AlarmRepo.ringing = true
            hk.senyou.travel.data.AlarmRepo.openRequest = true
        }
    }

    /** 通知點擊 → 直接打開對應路線 / 車站（依收藏類型分流） */
    private fun consumeDeepLink(intent: Intent?) {
        if (intent == null) return
        val item = hk.senyou.travel.data.deepLinkItem(
            type = intent.getStringExtra("deep_link_type"),
            route = intent.getStringExtra("deep_link_route"),
            station = intent.getStringExtra("deep_link_station"),
            stationName = intent.getStringExtra("deep_link_station_name"),
            company = intent.getStringExtra("deep_link_company"),
            dir = intent.getStringExtra("deep_link_dir"),
            stopId = intent.getStringExtra("deep_link_stop"),
            routeId = intent.getStringExtra("deep_link_route_id"),
        )
        item?.let { DeepLink.push(it) }
    }

    /** Android 13+ 需要用戶授權才能發到站通知 */
    private fun maybeAskNotifications() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        if (!granted) notifPerm.launch(Manifest.permission.POST_NOTIFICATIONS)
    }
}
