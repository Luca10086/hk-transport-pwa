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
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onRoot
import androidx.core.view.drawToBitmap
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.ui.FavoritesScreen
import hk.senyou.travel.ui.GlassCfg
import hk.senyou.travel.ui.HomeScreen
import hk.senyou.travel.ui.K75PPage
import hk.senyou.travel.ui.LineMapScreen
import hk.senyou.travel.ui.LiquidBackgroundHost
import hk.senyou.travel.ui.LocalGlassCfg
import hk.senyou.travel.ui.SettingsScreen
import hk.senyou.travel.ui.SushiScreen
import hk.senyou.travel.ui.WeatherPage
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
 * 截圖測試：用 Robolectric 原生渲染（無需模擬器）把每個頁面輸出成 PNG，
 * 供主工程師做像素分析 + MiMo 視覺審查。
 * 產物目錄：app/build/screenshots/
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], qualifiers = "w411dp-h891dp-xxhdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class ScreenshotTest {

    @get:Rule
    val rule = createAndroidComposeRule<ComponentActivity>()

    private val outDir = File("build/screenshots").apply { mkdirs() }

    @org.junit.Before
    fun setup() {
        DebugFlags.staticUi = true
        DebugFlags.offline = true
        V3.apply("dark", 0xFF0078D7)
    }

    private fun shoot(name: String) {
        rule.waitForIdle()
        Thread.sleep(400)
        rule.waitForIdle()
        // Robolectric 無真實窗口 → 直接把 decorView 畫到 Bitmap（繞過 PixelCopy）
        val bmp = rule.activity.window.decorView.drawToBitmap(Bitmap.Config.ARGB_8888)
        File(outDir, "$name.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }

    @Composable
    private fun Frame(glassLevel: Int = 2, light: Boolean = false, content: @Composable () -> Unit) {
        val alpha = when (glassLevel) {
            0 -> 0f; 1 -> 0.03f; 2 -> 0.07f; 3 -> 0.10f; else -> 0.14f
        }
        val blur = when (glassLevel) {
            0 -> 0f; 1 -> 12f; 2 -> 26f; 3 -> 36f; else -> 48f
        }
        SenyouTheme {
            CompositionLocalProvider(
                LocalGlassCfg provides GlassCfg(
                    alpha = alpha, blurPx = blur,
                    refractPx = if (glassLevel == 0) 0f else 20f,
                    motion = false,
                    light = light,
                ),
            ) {
                LiquidBackgroundHost(
                    modifier = Modifier.fillMaxSize().background(V3.Bg),
                    deepNight = false,
                    snapshot = false,
                    light = light,
                ) {
                    Box(Modifier.fillMaxSize()) { content() }
                }
            }
        }
    }

    /** 淺色主題 */
    @Test
    fun homeLight() {
        V3.apply("light", 0xFF0078D7)
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent {
            Frame(light = true) {
                HomeScreen(scroll = rememberScrollState(), onOpenK75P = {}, onOpenRoute = {}, onOpenWeather = {})
            }
        }
        shoot("17-home-light")
    }

    /** 強調色（紫） */
    @Test
    fun homeAccentPurple() {
        V3.apply("dark", 0xFFAA00FF)
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent {
            Frame {
                HomeScreen(scroll = rememberScrollState(), onOpenK75P = {}, onOpenRoute = {}, onOpenWeather = {})
            }
        }
        shoot("18-home-accent-purple")
    }

    @Test
    fun home() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent {
            Frame { HomeScreen(scroll = rememberScrollState(), onOpenK75P = {}, onOpenRoute = {}, onOpenWeather = {}) }
        }
        shoot("01-home")
    }

    @Test
    fun homeGlassFallback() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent {
            Frame(glassLevel = 0) {
                HomeScreen(scroll = rememberScrollState(), onOpenK75P = {}, onOpenRoute = {}, onOpenWeather = {})
            }
        }
        shoot("02-home-glass0")
    }

    @Test
    fun k75pPage() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { K75PPage(onClose = {}) } }
        shoot("03-k75p")
    }

    @Test
    fun favorites() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { FavoritesScreen(onOpenRoute = {}) } }
        shoot("04-favorites-empty")
    }

    @Test
    fun sushi() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { SushiScreen() } }
        shoot("05-sushi")
    }

    @Test
    fun lineMap() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { LineMapScreen() } }
        shoot("06-linemap")
    }

    @Test
    fun settings() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { SettingsScreen(Settings()) } }
        shoot("07-settings")
    }

    @Test
    fun weather() {
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { WeatherPage(onClose = {}) } }
        shoot("08-weather")
    }

    /** 有收藏內容的收藏頁（驗證提醒鈴鐺 + 離線緩存顯示） */
    @Test
    fun favoritesWithItems() {
        val ctx = androidx.test.core.app.ApplicationProvider.getApplicationContext<android.content.Context>()
        StaticData.load(ctx)
        val f1 = hk.senyou.travel.data.Fav(type = "bus", company = "kmb", route = "69X", dir = "outbound", stopName = "天瑞總站", alertMins = 5)
        val f2 = hk.senyou.travel.data.Fav(type = "mtrbus", company = "mtrbus", route = "K75P", stopName = "天瑞")
        val f3 = hk.senyou.travel.data.Fav(type = "mtr", company = "mtr", stationCode = "TIS", stationName = "天水圍", lineName = "屯馬線")
        kotlinx.coroutines.runBlocking { hk.senyou.travel.data.Store.saveFavorites(ctx, listOf(f1, f2, f3)) }
        // 預置離線緩存（離線時應顯示「（上次 HH:mm）」）
        hk.senyou.travel.data.Cache.putEtaCache(f1.key, 7)
        hk.senyou.travel.data.Cache.putEtaCache(f2.key, 2)
        rule.setContent { Frame { FavoritesScreen(onOpenRoute = {}) } }
        shoot("16-favorites-items")
    }

    /** 聯網測試：真實港鐵數據（驗證站間連接線與上下行 ETA） */
    @Test
    fun lineMapLive() {
        DebugFlags.offline = false
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        rule.setContent { Frame { LineMapScreen() } }
        Thread.sleep(6000)   // 等待 MTR 各站班次載入
        shoot("09-linemap-live")
    }

    /** 聯網測試：港鐵車站詳情（收藏卡片 / 到站通知點擊後的頁面） */
    @Test
    fun stationDetailLive() {
        DebugFlags.offline = false
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        val item = SearchItem(
            kind = hk.senyou.travel.data.Kind.MTR, no = "MTR", name = "天水圍",
            cap = "屯馬線", stationCode = "TIS", stationName = "天水圍",
        )
        rule.setContent { Frame { hk.senyou.travel.ui.RouteDetailPage(item = item, onClose = {}) } }
        Thread.sleep(6000)
        shoot("19-station-mtr-live")
    }

    /** 聯網測試：港鐵巴士路線詳情（班次表） */
    @Test
    fun mtrBusDetailLive() {
        DebugFlags.offline = false
        StaticData.load(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        val item = SearchItem(
            kind = hk.senyou.travel.data.Kind.MTRBUS, no = "K75P", name = "K75P",
            cap = "港鐵巴士", route = "K75P",
        )
        rule.setContent { Frame { hk.senyou.travel.ui.RouteDetailPage(item = item, onClose = {}) } }
        Thread.sleep(5000)
        shoot("20-mtrbus-detail-live")
    }
}
