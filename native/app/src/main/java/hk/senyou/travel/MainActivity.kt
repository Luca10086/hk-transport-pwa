package hk.senyou.travel

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import hk.senyou.travel.ui.SenyouApp
import hk.senyou.travel.ui.theme.SenyouTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SenyouTheme {
                SenyouApp()
            }
        }
    }
}
