package hk.senyou.travel

import android.graphics.Bitmap
import androidx.activity.ComponentActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasScrollToNodeAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollToNode
import androidx.core.view.drawToBitmap
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StaticData
import hk.senyou.travel.ui.theme.SenyouTheme
import hk.senyou.travel.ui.wp8.Wp8
import hk.senyou.travel.ui.wp8.Wp8FavsPane
import hk.senyou.travel.ui.wp8.Wp8Gallery
import hk.senyou.travel.ui.wp8.Wp8HomePane
import hk.senyou.travel.ui.wp8.Wp8K75PPage
import hk.senyou.travel.ui.wp8.Wp8MapPane
import hk.senyou.travel.ui.wp8.Wp8SettingsPane
import hk.senyou.travel.ui.wp8.Wp8SushiPane
import kotlinx.coroutines.flow.first
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

/**
 * 截圖測試（WP8 / Metro）：Robolectric 原生渲染 → PNG，供像素分析 + MiMo 視覺審查。
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
        Wp8.light = false
        Wp8.contrast = false
        Wp8.accentIndex = 0
        Wp8.Gutter = 24.dp
    }

    private fun shoot(name: String) {
        rule.waitForIdle()
        Thread.sleep(300)
        rule.waitForIdle()
        val bmp = rule.activity.window.decorView.drawToBitmap(Bitmap.Config.ARGB_8888)
        File(outDir, "$name.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }

    /** 亮像素數量（近似「文字是否看得見」） */
    private fun brightPixels(bmp: Bitmap): Int {
        var n = 0
        var y = 0
        while (y < bmp.height) {
            var x = 0
            while (x < bmp.width) {
                val p = bmp.getPixel(x, y)
                val luma = (p shr 16 and 0xFF) * 299 + (p shr 8 and 0xFF) * 587 + (p and 0xFF) * 114
                if (luma / 1000 > 150) n++
                x += 2
            }
            y += 2
        }
        return n
    }

    @Composable
    private fun Frame(content: @Composable () -> Unit) {
        SenyouTheme {
            Box(Modifier.fillMaxSize().background(Wp8.Bg)) { content() }
        }
    }

    private val ctx: android.content.Context
        get() = androidx.test.core.app.ApplicationProvider.getApplicationContext()

    private fun load() = StaticData.load(ctx)

    /* ---------------- 首頁全景三面板 ---------------- */

    @Test
    fun homeTiles() {
        load()
        hk.senyou.travel.data.Cache.k75pMins = 4
        hk.senyou.travel.data.Cache.k75pLive = 2
        rule.setContent {
            Frame {
                Wp8HomePane(
                    refreshSec = 0, refreshTick = 0, startPanel = 0,
                    settings = Settings(), onSettings = {},
                    onOpenK75P = {}, onGoPane = {}, onOpenDetail = {},
                )
            }
        }
        shoot("wp8-01-home-tiles")
    }

    @Test
    fun homeSearch() {
        load()
        kotlinx.coroutines.runBlocking { hk.senyou.travel.data.Store.pushRecent(ctx, "69X") }
        rule.setContent {
            Frame {
                Wp8HomePane(
                    refreshSec = 0, refreshTick = 0, startPanel = 1,
                    settings = Settings(), onSettings = {},
                    onOpenK75P = {}, onGoPane = {}, onOpenDetail = {},
                )
            }
        }
        shoot("wp8-02-home-search")
    }

    @Test
    fun homeWeather() {
        load()
        rule.setContent {
            Frame {
                Wp8HomePane(
                    refreshSec = 0, refreshTick = 0, startPanel = 2,
                    settings = Settings(), onSettings = {},
                    onOpenK75P = {}, onGoPane = {}, onOpenDetail = {},
                )
            }
        }
        shoot("wp8-03-home-weather")
    }

    /* ---------------- 其他 Pivot 分頁 ---------------- */

    @Test
    fun favouritesPane() {
        load()
        val f1 = hk.senyou.travel.data.Fav(type = "bus", company = "kmb", route = "69X", dir = "outbound", stopName = "天瑞總站", alertMins = 5)
        val f2 = hk.senyou.travel.data.Fav(type = "mtrbus", company = "mtrbus", route = "K75P", stopName = "天瑞")
        val f3 = hk.senyou.travel.data.Fav(type = "mtr", company = "mtr", stationCode = "TIS", stationName = "天水圍", lineName = "屯馬綫")
        kotlinx.coroutines.runBlocking { hk.senyou.travel.data.Store.saveFavorites(ctx, listOf(f1, f2, f3)) }
        hk.senyou.travel.data.Cache.putEtaCache(f1.key, 7)
        hk.senyou.travel.data.Cache.putEtaCache(f2.key, 2)
        rule.setContent { Frame { Wp8FavsPane(onOpenDetail = {}) } }
        shoot("wp8-04-favourites")
    }

    @Test
    fun sushiPane() {
        load()
        rule.setContent { Frame { Wp8SushiPane() } }
        shoot("wp8-05-sushi")
    }

    @Test
    fun mapPane() {
        load()
        rule.setContent { Frame { Wp8MapPane(onOpenDetail = {}) } }
        shoot("wp8-06-routes")
    }

    @Test
    fun settingsPane() {
        load()
        rule.setContent {
            Frame {
                Wp8SettingsPane(settings = Settings(), onSettings = {}, onOpenGallery = {})
            }
        }
        shoot("wp8-07-settings")
    }

    /** 完整 App 外殼（Pivot 頂欄 + 分頁 + App Bar） */
    @Test
    fun appShell() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.SenyouApp() } }
        shoot("wp8-08-app-shell")
    }

    /** K75P 全屏實時頁 */
    @Test
    fun k75pPage() {
        load()
        rule.setContent { Frame { Wp8K75PPage(onClose = {}) } }
        shoot("wp8-09-k75p")
    }

    /** 詳情頁（3D 滑入）：路線站表（離線 → 空狀態） */
    @Test
    fun detailSheet() {
        load()
        val item = SearchItem(
            kind = hk.senyou.travel.data.Kind.MTR, no = "MTR", name = "天水圍",
            cap = "屯馬綫", stationCode = "TIS", stationName = "天水圍",
        )
        rule.setContent {
            Frame { hk.senyou.travel.ui.wp8.Wp8DetailSheet(item = item, onClose = {}) }
        }
        shoot("wp8-10-detail")
    }

    /* ---------------- 主題變體 ---------------- */

    @Test
    fun lightTheme() {
        load()
        Wp8.light = true
        rule.setContent {
            Frame {
                Wp8HomePane(refreshSec = 0, refreshTick = 0, settings = Settings(), onSettings = {}, onOpenK75P = {}, onGoPane = {}, onOpenDetail = {})
            }
        }
        shoot("wp8-11-light")
    }

    @Test
    fun highContrast() {
        load()
        Wp8.contrast = true
        rule.setContent {
            Frame {
                Wp8HomePane(refreshSec = 0, refreshTick = 0, settings = Settings(), onSettings = {}, onOpenK75P = {}, onGoPane = {}, onOpenDetail = {})
            }
        }
        shoot("wp8-12-contrast")
    }

    @Test
    fun accentBlue() {
        load()
        Wp8.accentIndex = 1
        rule.setContent {
            Frame {
                Wp8HomePane(refreshSec = 0, refreshTick = 0, settings = Settings(), onSettings = {}, onOpenK75P = {}, onGoPane = {}, onOpenDetail = {})
            }
        }
        shoot("wp8-13-accent-blue")
    }

    /** 元件畫廊（規範對照） */
    @Test
    fun gallery() {
        load()
        rule.setContent { Frame { Wp8Gallery() } }
        shoot("wp8-14-gallery")
    }

    /** Windows 10 Mobile（UWP）演示：漢堡 NavigationView + CommandBar + 官方字階 */
    @Test
    fun win10Demo() {
        load()
        rule.setContent {
            androidx.compose.foundation.layout.Box(Modifier.fillMaxSize()) {
                hk.senyou.travel.ui.wp8.Win10DemoScreen(onClose = {})
            }
        }
        shoot("wp8-30-win10-mobile")
    }
    /** iPhone Duo 鬧鐘復刻（摺疊外屏／豎向堆疊版） */
    @Test
    fun duoAlarmCompact() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.DuoAlarmScreen(onStop = {}, onSnooze = {}) } }
        shoot("wp8-31-alarm-compact")
    }

    /** 待機顯示模式：官方四種畫面（鬧鐘／日曆／天氣／音樂） */
    @Test
    fun standbyFaces() {
        load()
        val page = androidx.compose.runtime.mutableIntStateOf(0)
        rule.setContent { Frame { hk.senyou.travel.ui.StandbyFace(page = page.intValue, onExit = {}) } }
        for (p in 0..3) {
            page.intValue = p
            rule.waitForIdle()
            shoot("wp8-34-standby-face-$p")
        }
    }

    /** 官方半開合：內屏一半內容（路線圖）、一半控件（三班卡） */
    @Test
    fun k75pHalfOpen() {
        load()
        rule.setContent { Frame { Wp8K75PPage(onClose = {}, halfOpen = true) } }
        shoot("wp8-35-k75p-halfopen")
    }

    /** 回歸：待機鬧鐘的「設定鬧鐘」對話框（使用者回報閃退的可疑路徑） */
    @Test
    fun standbyAlarmDialog() {
        load()
        rule.setContent {
            Frame { hk.senyou.travel.ui.StandbyFace(page = 0, onExit = {}, settings = hk.senyou.travel.data.Settings()) }
        }
        rule.onNodeWithText("設定鬧鐘").performClick()
        rule.waitForIdle()
        rule.onNodeWithText("確定").assertExists()
        shoot("wp8-38-standby-alarm-dialog")
    }

    /** W10M 待機顯示整頁（Pivot 頁首 + 圓點 + 官方字階 + 強調色 #0078D7） */
    @Test
    fun standbyW10m() {
        load()
        rule.setContent {
            Frame {
                hk.senyou.travel.ui.StandbyScreen(
                    onExit = {},
                    settings = hk.senyou.travel.data.Settings(),
                )
            }
        }
        shoot("wp8-39-standby-w10m")
    }

    /** Material 3 風格（與 W10M 完全獨立的實作）：外殼首頁 → 點導覽切到設定 */
    @Test
    fun materialShell() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.material.MaterialApp() } }
        shoot("wp8-40-material-home")
        rule.onNodeWithText("設定").performClick()
        rule.waitForIdle()
        shoot("wp8-41-material-settings")
    }

    /** Material 3 待機顯示（獨立實作，與 W10M 版並存） */
    @Test
    fun materialStandby() {
        load()
        rule.setContent {
            Frame {
                hk.senyou.travel.ui.material.SenyouMaterialTheme(dark = true) {
                    hk.senyou.travel.ui.material.MaterialStandbyScreen(
                        onExit = {},
                        settings = hk.senyou.travel.data.Settings(),
                        onSettings = {},
                    )
                }
            }
        }
        shoot("wp8-43-material-standby")
    }

    /** Material 3 版 K75P 實時頁（測試環境離線，顯示 M3 佔位而非地圖） */
    @Test
    fun materialK75P() {
        load()
        rule.setContent {
            Frame {
                hk.senyou.travel.ui.material.SenyouMaterialTheme(dark = true) {
                    hk.senyou.travel.ui.material.MaterialK75PPage()
                }
            }
        }
        shoot("wp8-44-material-k75p")
    }

    /** Material 3 收藏頁：以假資料驗證完整操作列（釘選／換站／上移／下移／提示／移除）與 ETA */
    @Test
    fun materialFavourites() {
        load()
        val f1 = hk.senyou.travel.data.Fav(type = "bus", company = "kmb", route = "69X", dir = "outbound", stopName = "天瑞總站", alertMins = 5)
        val f2 = hk.senyou.travel.data.Fav(type = "mtrbus", company = "mtrbus", route = "K75P", stopName = "天瑞")
        val f3 = hk.senyou.travel.data.Fav(type = "mtr", company = "mtr", stationCode = "TIS", stationName = "天水圍", lineName = "屯馬綫")
        kotlinx.coroutines.runBlocking { hk.senyou.travel.data.Store.saveFavorites(ctx, listOf(f1, f2, f3)) }
        hk.senyou.travel.data.Cache.putEtaCache(f1.key, 7)
        hk.senyou.travel.data.Cache.putEtaCache(f2.key, 2)
        rule.setContent {
            Frame {
                hk.senyou.travel.ui.material.SenyouMaterialTheme(dark = false) {
                    hk.senyou.travel.ui.material.MaterialFavsPane(Settings())
                }
            }
        }
        shoot("wp8-45-material-favourites")
    }

    /**
     * 迴歸：**切換介面風格／主題**不得崩潰。
     *
     * 曾在此路徑出現 java.lang.ClassCastException: java.lang.Boolean cannot be cast to
     * ComposableLambdaImpl —— Material 分支原本寫在 `CompositionLocalProvider` 內容 lambda 內
     * 並提前 return，切換風格時該 lambda 的 movable group 槽位錯位。修正後 Material 在最外層分家。
     */
    @Test
    fun styleSwitchRegression() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.SenyouApp() } }
        shoot("wp8-50-shell-w10m-dark")

        // W10M → Material
        setSettings { it.copy(uiStyle = "material") }
        rule.waitForIdle()
        rule.onNodeWithText("壽司郎").assertIsDisplayed()          // Material 底部導覽列
        shoot("wp8-51-shell-material")

        // Material → W10M，同時改主題與對比度（會換掉 key(theme, contrast) 的組）
        setSettings { it.copy(uiStyle = "w10m", theme = "light", contrast = true) }
        rule.waitForIdle()
        shoot("wp8-52-shell-w10m-light-contrast")

        // 再切回 Material：來回切換都要安全
        setSettings { it.copy(uiStyle = "material", theme = "dark") }
        rule.waitForIdle()
        rule.onNodeWithText("壽司郎").assertIsDisplayed()
    }

    /** 測試中改設定：直接寫 DataStore，讓 shell 的 settings 流觸發重組 */
    private fun setSettings(f: (Settings) -> Settings) {
        kotlinx.coroutines.runBlocking {
            hk.senyou.travel.data.Store.save(ctx, f(hk.senyou.travel.data.Store.settings(ctx).first()))
        }
    }

    /**
     * Material 3 AI 建議：`ModalBottomSheet` 在 M3 是**獨立視窗**，decorView 截圖抓不到，
     * 因此這裡 (1) 用節點斷言證明面板真的開了（內容齊全），(2) 另外直接截圖面板內容。
     */
    @Test
    fun materialAiSheet() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.material.MaterialApp() } }
        rule.onNodeWithText("問 AI（MiMo v2.5）").performClick()
        rule.waitForIdle()
        // 面板在獨立視窗，節點仍可查詢：確認標題、輸入框、按鈕都在
        rule.onNodeWithText("AI 行程建議").assertIsDisplayed()
        rule.onNodeWithText("取得建議").assertIsDisplayed()
        rule.onNodeWithText("AI 設定").assertIsDisplayed()
        shoot("wp8-46-material-ai-open")
    }

    /** Material 3 設定頁下半：驗證重新整理間隔／精確鬧鐘／待機入口／收藏匯出／診斷都真的渲染出來
     *  （鬧鐘卡內的新列已完整出現在 `materialShell` 的 wp8-41 截圖中，故不另拍） */
    @Test
    fun materialSettingsLower() {
        load()
        rule.setContent { Frame { hk.senyou.travel.ui.material.MaterialApp() } }
        rule.onNodeWithText("設定").performClick()
        rule.waitForIdle()
        rule.onNode(hasScrollToNodeAction()).performScrollToNode(hasText("崩潰日誌"))
        rule.waitForIdle()
        shoot("wp8-48-material-settings-lower")
    }

    /** Material 3 AI 建議面板內容（直接渲染，供像素審查：標題／輸入框／按鈕／建議清單） */
    @Test
    fun materialAiSheetBody() {
        load()
        rule.setContent {
            Frame {
                hk.senyou.travel.ui.material.SenyouMaterialTheme(dark = false) {
                    androidx.compose.material3.Surface(
                        color = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerLow,
                    ) {
                        hk.senyou.travel.ui.material.MaterialAiSheetBody(
                            query = "天水圍去機場通宵點去？",
                            onQuery = {},
                            reply = "可以搭 N30 通宵巴士，於天水圍站上車直達機場。",
                            options = listOf(
                                hk.senyou.travel.data.AiOption("N30", "overnight", "通宵路線，直達機場"),
                                hk.senyou.travel.data.AiOption("E34A", "bus", "日間往機場的替代路線"),
                            ),
                            error = null,
                            loading = false,
                            onAsk = {},
                            onOpenSettings = {},
                            onPick = {},
                        )
                    }
                }
            }
        }
        shoot("wp8-47-material-ai-sheet-body")
    }
    /**
     * 回歸測試：「⋯ 更多」選單必須貼齊右下、底欄之上（曾誤跑到右上角）。
     * 判據：面板色 (#221D31) 首次出現的列必須在畫面下半部。
     */
    @Test
    fun moreMenuAnchoredBottomRight() {
        load()
        rule.setContent {
            Frame {
                Box(Modifier.fillMaxSize()) {
                    androidx.compose.foundation.layout.Column(
                        Modifier
                            .align(androidx.compose.ui.Alignment.BottomCenter)
                            .fillMaxWidth()
                            .background(Wp8.Surface)
                            .height(Wp8.AppBarH),
                    ) { }
                    hk.senyou.travel.ui.wp8.Wp8MoreMenu(
                        items = listOf("重新整理" to {}, "路線圖" to {}, "介面規範" to {}),
                        onDismiss = {},
                    )
                }
            }
        }
        rule.waitForIdle()
        Thread.sleep(450)
        rule.waitForIdle()
        val bmp = rule.activity.window.decorView.drawToBitmap(Bitmap.Config.ARGB_8888)
        File(outDir, "wp8-17-more-menu.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
        // 取當前主題的 Surface 色（不硬編碼，避免改主題後失效）
        val surface = (Wp8.Surface.red * 255).toInt() shl 16 or ((Wp8.Surface.green * 255).toInt() shl 8) or (Wp8.Surface.blue * 255).toInt()
        val appBarTop = bmp.height - (Wp8.AppBarH.value * 3f).toInt()
        var firstY = -1
        var y = 0
        while (y < appBarTop && firstY < 0) {
            var x = 0
            while (x < bmp.width) {
                if ((bmp.getPixel(x, y) and 0xFFFFFF) == surface) { firstY = y; break }
                x += 2
            }
            y += 2
        }
        println("moreMenu firstSurfaceY=$firstY / height=${bmp.height} appBarTop=$appBarTop")
        org.junit.Assert.assertTrue("選單應位於畫面下半部，實際首列 y=$firstY（高度 ${bmp.height}）", firstY > bmp.height / 2)
    }

    /** 大字體（模擬系統字體 1.5×）：文字不得被裁 */
    @Test
    fun largeFont() {
        load()
        rule.setContent {
            androidx.compose.runtime.CompositionLocalProvider(
                androidx.compose.ui.platform.LocalDensity provides androidx.compose.ui.unit.Density(3f, 1.5f),
            ) {
                Frame {
                    Wp8HomePane(refreshSec = 0, refreshTick = 0, settings = Settings(), onSettings = {}, onOpenK75P = {}, onGoPane = {}, onOpenDetail = {})
                }
            }
        }
        shoot("wp8-15-large-font")
    }

    /**
     * 回歸測試：每個分頁都必須有足量文字像素（防「裝飾層蓋住內容」重演）。
     */
    @Test
    fun panesKeepTextVisible() {
        load()
        val page = androidx.compose.runtime.mutableIntStateOf(0)
        rule.setContent {
            Frame {
                when (page.intValue) {
                    0 -> Wp8HomePane(refreshSec = 0, refreshTick = 0, settings = Settings(), onSettings = {}, onOpenK75P = {}, onGoPane = {}, onOpenDetail = {})
                    1 -> Wp8FavsPane(onOpenDetail = {})
                    2 -> Wp8SushiPane()
                    3 -> Wp8MapPane(onOpenDetail = {})
                    else -> Wp8SettingsPane(settings = Settings(), onSettings = {}, onOpenGallery = {})
                }
            }
        }
        val counts = mutableListOf<Int>()
        for (p in 0..4) {
            page.intValue = p
            rule.waitForIdle()
            Thread.sleep(220)
            rule.waitForIdle()
            val bmp = rule.activity.window.decorView.drawToBitmap(Bitmap.Config.ARGB_8888)
            File(outDir, "wp8-16-pane-$p.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
            counts += brightPixels(bmp)
        }
        println("wp8 panes bright pixels: $counts")
        counts.forEachIndexed { i, c ->
            org.junit.Assert.assertTrue("分頁 $i 的文字像素過少（$c）", c > 500)
        }
    }
}
