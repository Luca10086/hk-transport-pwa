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
        setContent {
            SenyouApp()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        consumeDeepLink(intent)
    }

    /** 通知點擊 → 直接打開對應路線詳情 */
    private fun consumeDeepLink(intent: Intent?) {
        val route = intent?.getStringExtra("deep_link_route") ?: return
        if (route.isBlank()) return
        val company = intent.getStringExtra("deep_link_company") ?: "kmb"
        val dir = intent.getStringExtra("deep_link_dir") ?: "outbound"
        DeepLink.push(
            SearchItem(
                kind = when (company) {
                    "ctb" -> Kind.CTB
                    "nlb" -> Kind.NLB
                    else -> Kind.KMB
                },
                no = route,
                name = route,
                cap = "到站提醒",
                route = route,
                dir = dir,
                stopId = intent.getStringExtra("deep_link_stop")?.ifBlank { null },
            )
        )
    }

    /** Android 13+ 需要用戶授權才能發到站通知 */
    private fun maybeAskNotifications() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        if (!granted) notifPerm.launch(Manifest.permission.POST_NOTIFICATIONS)
    }
}
