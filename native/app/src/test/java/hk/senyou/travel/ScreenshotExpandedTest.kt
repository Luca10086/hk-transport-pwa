package hk.senyou.travel

import android.graphics.Bitmap
import androidx.activity.ComponentActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.core.view.drawToBitmap
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.ui.AdaptiveInfo
import hk.senyou.travel.ui.FavoritesScreen
import hk.senyou.travel.ui.GlassCfg
import hk.senyou.travel.ui.HomeScreen
import hk.senyou.travel.ui.LineMapScreen
import hk.senyou.travel.ui.LiquidBackgroundHost
import hk.senyou.travel.ui.LocalAdaptive
import hk.senyou.travel.ui.LocalGlassCfg
import hk.senyou.travel.ui.SenyouApp
import hk.senyou.travel.ui.SettingsScreen
import hk.senyou.travel.ui.SizeClass
import hk.senyou.travel.ui.SushiScreen
import hk.senyou.travel.ui.theme.SenyouTheme
import hk.senyou.travel.ui.theme.V3
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

/**
 * 大屏（MIX Fold 4 內屏 ≈ 953×852dp）截圖測試：
 * 驗證展開態的左側導航欄、首頁雙欄、列表雙列網格、設定頁限寬居中。
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], qualifiers = "w953dp-h852dp-xxhdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class ScreenshotExpandedTest {

    @get:Rule
    val rule = createAndroidComposeRule<ComponentActivity>()

    private val outDir = File("build/screenshots").apply { mkdirs() }

    @org.junit.Before
    fun setup() {
        DebugFlags.staticUi = true
        DebugFlags.offline = true
    }

    private fun shoot(name: String) {
        rule.waitForIdle()
        Thread.sleep(400)
        rule.waitForIdle()
        val bmp = rule.activity.window.decorView.drawToBitmap(Bitmap.Config.ARGB_8888)
        File(outDir, "$name.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }

    @Composable
    private fun Frame(content: @Composable () -> Unit) {
        SenyouTheme {
            CompositionLocalProvider(
                LocalGlassCfg provides GlassCfg(alpha = 0.07f, blurPx = 26f, refractPx = 20f, motion = false),
                // 關鍵：注入展開態自適應資訊（953×852dp 摺疊屏內屏）
                LocalAdaptive provides AdaptiveInfo(
                    sizeClass = SizeClass.Expanded,
                    widthDp = 953,
                    heightDp = 852,
                ),
            ) {
                LiquidBackgroundHost(
                    modifier = Modifier.fillMaxSize().background(V3.Bg),
                    deepNight = false,
                    snapshot = false,
                ) {
                    Box(Modifier.fillMaxSize()) { content() }
                }
            }
        }
    }

    @Test
    fun appExpanded() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { SenyouApp() } }
        shoot("10-app-expanded")
    }

    @Test
    fun homeExpanded() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent {
            Frame { HomeScreen(scroll = rememberScrollState(), onOpenK75P = {}, onOpenRoute = {}, onOpenWeather = {}) }
        }
        shoot("11-home-expanded")
    }

    @Test
    fun favoritesExpanded() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { FavoritesScreen(onOpenRoute = {}) } }
        shoot("12-favorites-expanded")
    }

    @Test
    fun sushiExpanded() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { SushiScreen() } }
        shoot("13-sushi-expanded")
    }

    @Test
    fun lineMapExpanded() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { LineMapScreen() } }
        shoot("14-linemap-expanded")
    }

    @Test
    fun settingsExpanded() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { SettingsScreen(Settings()) } }
        shoot("15-settings-expanded")
    }
}
