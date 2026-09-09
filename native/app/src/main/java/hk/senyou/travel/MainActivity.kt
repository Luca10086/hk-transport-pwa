package hk.senyou.travel

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import hk.senyou.travel.ui.SenyouApp
import hk.senyou.travel.ui.theme.SenyouTheme

class MainActivity : ComponentActivity() {

    private val notifPerm = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        maybeAskNotifications()
        setContent {
            SenyouTheme {
                SenyouApp()
            }
        }
    }

    /** Android 13+ 需要用戶授權才能發到站通知 */
    private fun maybeAskNotifications() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        if (!granted) notifPerm.launch(Manifest.permission.POST_NOTIFICATIONS)
    }
}
