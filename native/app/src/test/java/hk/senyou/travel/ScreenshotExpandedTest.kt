package hk.senyou.travel

import android.graphics.Bitmap
import androidx.activity.ComponentActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.core.view.drawToBitmap
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.ui.AdaptiveInfo
import hk.senyou.travel.ui.LocalAdaptive
import hk.senyou.travel.ui.SizeClass
import hk.senyou.travel.ui.theme.SenyouTheme
import hk.senyou.travel.ui.wp8.Wp8
import hk.senyou.travel.ui.wp8.Wp8Gallery
import hk.senyou.travel.ui.wp8.Wp8HomePane
import hk.senyou.travel.ui.wp8.Wp8MapPane
import hk.senyou.travel.ui.wp8.Wp8SettingsPane
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

/**
 * 大屏（MIX Fold 4 內屏 ≈ 953×852dp）截圖測試：
 * 驗證 WP8 大屏邊距（44dp）、磁貼牆、Pivot 分頁、設定頁。
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
        Wp8.light = false
        Wp8.contrast = false
        Wp8.accentIndex = 0
        Wp8.Gutter = 44.dp
    }

    private fun shoot(name: String) {
        rule.waitForIdle()
        Thread.sleep(300)
        rule.waitForIdle()
        val bmp = rule.activity.window.decorView.drawToBitmap(Bitmap.Config.ARGB_8888)
        File(outDir, "$name.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }

    @Composable
    private fun Frame(content: @Composable () -> Unit) {
        SenyouTheme {
            CompositionLocalProvider(
                LocalAdaptive provides AdaptiveInfo(
                    sizeClass = SizeClass.Expanded,
                    widthDp = 953,
                    heightDp = 852,
                ),
            ) {
                Box(Modifier.fillMaxSize().background(Wp8.Bg)) { content() }
            }
        }
    }

    private fun load() = StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())

    @Test
    fun appExpanded() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.SenyouApp() } }
        shoot("wp8-20-app-expanded")
    }

    @Test
    fun homeExpanded() {
        load()
        rule.setContent {
            Frame {
                Wp8HomePane(refreshSec = 0, refreshTick = 0, settings = Settings(), onSettings = {}, onOpenK75P = {}, onGoPane = {}, onOpenDetail = {})
            }
        }
        shoot("wp8-21-home-expanded")
    }

    @Test
    fun routesExpanded() {
        load()
        rule.setContent { Frame { Wp8MapPane(onOpenDetail = {}) } }
        shoot("wp8-22-routes-expanded")
    }

    @Test
    fun settingsExpanded() {
        load()
        rule.setContent { Frame { Wp8SettingsPane(settings = Settings(), onSettings = {}, onOpenGallery = {}) } }
        shoot("wp8-23-settings-expanded")
    }

    @Test
    fun galleryExpanded() {
        load()
        rule.setContent { Frame { Wp8Gallery() } }
        shoot("wp8-24-gallery-expanded")
    }

    /** iPhone Duo 鬧鐘復刻（展開內屏 → 1:1 原圖橫向佈局） */
    @Test
    fun duoAlarmExpanded() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.DuoAlarmScreen(onStop = {}, onSnooze = {}) } }
        shoot("wp8-32-alarm-expanded")
    }

    /** 需求驗證：「待機顯示模式鬧鐘」的入口必須在**漢堡選單**（左側 NavigationView）裡 */
    @Test
    fun standbyEntryInHamburgerMenu() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.SenyouApp() } }
        rule.onNodeWithText("待機鬧鐘").assertExists()
        shoot("wp8-33-standby-nav-entry")
    }

    /** 回歸：從漢堡選單點「待機鬧鐘」必須真的打得開（使用者回報一按就閃退） */
    @Test
    fun standbyOpensFromHamburgerMenu() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.SenyouApp() } }
        rule.onNodeWithText("待機鬧鐘").performClick()
        rule.waitForIdle()
        shoot("wp8-36-standby-opened")
    }

    /** 使用者回報：橫向（半開合）時天氣三行顯示不全 → 橫向四畫面回歸截圖 */
    @Test
    fun standbyLandscapeFaces() {
        load()
        val page = androidx.compose.runtime.mutableIntStateOf(0)
        rule.setContent { Frame { hk.senyou.travel.ui.StandbyFace(page = page.intValue, onExit = {}) } }
        for (p in 0..3) {
            page.intValue = p
            rule.waitForIdle()
            shoot("wp8-37-standby-landscape-$p")
        }
    }
}
