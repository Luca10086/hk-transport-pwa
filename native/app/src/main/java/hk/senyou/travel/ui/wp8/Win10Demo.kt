package hk.senyou.travel.ui.wp8

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Windows 10 Mobile / UWP 設計令牌。
 *
 * 依官方文件：
 * · 字階 [Typography in Windows](https://learn.microsoft.com/en-us/windows/apps/design/style/typography)：
 *   Caption 12/16、Body 14/20、Body Strong 14/20 semibold、Body Large 18/24、
 *   Subtitle 20/28、Title 28/36、Title Large 40/52、Display 68/92（標題用 **Semibold**，非 WP8 的 Light）
 * · 官方排版規範：最小 12px Regular／14px Semibold；**一律 Sentence case**；預設靠左；
 *   截斷用縮排換行，**避免省略號**
 * · 深色主題：背景純黑 #000000、Chrome #1F1F1F、強調色 #0078D7（SystemAccentColor）
 */
object W10 {
    val Bg = Color(0xFF000000)
    val Chrome = Color(0xFF1F1F1F)
    val Surface = Color(0xFF1A1A1A)
    val Line = Color(0xFF3A3A3A)
    val Text1 = Color(0xFFFFFFFF)
    val Text2 = Color(0x99FFFFFF)
    val Accent = Color(0xFF0078D7)
    val AccentLight = Color(0xFF3B9EF5)
    /** 官方建議：轉場用流暢的 ease-out；Win10 標準 UI 動畫 150–300ms */
    val Ease = androidx.compose.animation.core.CubicBezierEasing(0.1f, 0.9f, 0.2f, 1f)
    val CommandBarH = 48.dp
}

/* ---------------- 官方字階 ---------------- */

@Composable
private fun T(text: String, style: String, modifier: Modifier = Modifier, color: Color = W10.Text1) {
    val (size, lh, weight) = when (style) {
        "caption" -> Triple(12f, 16f, FontWeight.Normal)
        "body" -> Triple(14f, 20f, FontWeight.Normal)
        "bodystrong" -> Triple(14f, 20f, FontWeight.SemiBold)
        "bodylarge" -> Triple(18f, 24f, FontWeight.Normal)
        "subtitle" -> Triple(20f, 28f, FontWeight.SemiBold)
        "title" -> Triple(28f, 36f, FontWeight.SemiBold)
        "titlelarge" -> Triple(40f, 52f, FontWeight.SemiBold)
        else -> Triple(68f, 92f, FontWeight.SemiBold)
    }
    Text(text, color = color, fontSize = size.sp, lineHeight = lh.sp, fontWeight = weight, modifier = modifier)
}

/**
 * Windows 10 Mobile 演示（依官方 UWP 規範）。
 *
 * · **NavigationView**：左上漢堡 → 左側滑出面板（overlay）+ 煙霧遮罩（官方 LeftMinimal 模式）
 * · **CommandBar**：底部命令列，主命令為「圖標＋文字」，按 ⋯ 顯示標籤並滑出次要命令
 * · **Page refresh** 轉場（官方：切換左側導覽項時使用，上滑＋淡入）
 * · **Drill in** 轉場（官方：深入下一層時使用）
 * · 官方字階與深色主題
 */
@Composable
fun Win10DemoScreen(onClose: () -> Unit) {
    var paneIndex by remember { mutableIntStateOf(0) }
    var paneOpen by remember { mutableStateOf(false) }
    var cmdOpen by remember { mutableStateOf(false) }
    var drillOpen by remember { mutableStateOf(false) }
    val status = WindowInsets.statusBars.asPaddingValues()
    val nav = WindowInsets.navigationBars.asPaddingValues()
    val panes = listOf("首頁", "收藏", "路線", "設定")

    // 官方 Page refresh：切換左側導覽項時，進場內容「上滑 + 淡入」
    val refresh = remember { Animatable(1f) }
    LaunchedEffect(paneIndex) {
        refresh.snapTo(0f)
        refresh.animateTo(1f, tween(300, easing = W10.Ease))
    }
    // 官方 Drill in：深入下一層
    val drill = remember { Animatable(1f) }
    LaunchedEffect(drillOpen) {
        if (drillOpen) {
            drill.snapTo(0f)
            drill.animateTo(1f, tween(300, easing = W10.Ease))
        }
    }

    Box(Modifier.fillMaxSize().background(W10.Bg)) {
        Column(Modifier.fillMaxSize()) {
            /* ---- 頂欄：漢堡 + 頁面標題（官方：頁面標題 20px，置於漢堡右側） ---- */
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(
                        start = 4.dp,
                        end = 16.dp,
                        top = status.calculateTopPadding() + 6.dp,
                        bottom = 6.dp,
                    )
                    .heightIn(min = 48.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier
                        .size(48.dp)
                        .clickable { paneOpen = true },
                    contentAlignment = Alignment.Center,
                ) { Text("☰", color = W10.Text1, fontSize = 20.sp) }
                Spacer(Modifier.width(8.dp))
                Column(Modifier.weight(1f)) {
                    T("森友出行", "subtitle", modifier = Modifier)
                    T("Windows 10 Mobile 演示", "caption", color = W10.Text2)
                }
                Box(Modifier.size(44.dp).clickable { onClose() }, contentAlignment = Alignment.Center) {
                    T("✕", "subtitle")
                }
            }

            /* ---- 內容（Page refresh：上滑 + 淡入） ---- */
            Column(
                Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .graphicsLayer {
                        alpha = refresh.value
                        translationY = (1f - refresh.value) * 40f
                    }
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 18.dp),
            ) {
                when (paneIndex) {
                    0 -> StartPage(onDrill = { drillOpen = true })
                    1 -> ListPage("收藏", listOf("69X · 天瑞 ↔ 西九龍站", "K75P · 天瑞 ↺ 洪水橋", "969 · 天水圍 → 銅鑼灣"))
                    2 -> ListPage("路線", listOf("屯馬綫 · 上行 3 分", "輕鐵 761P · 2 分", "港鐵巴士 K75P · 4 分"))
                    else -> TypeRampPage()
                }
            }

            CommandBar(
                open = cmdOpen,
                onToggle = { cmdOpen = !cmdOpen },
                commands = listOf(
                    "⌂" to "首頁",
                    "♡" to "收藏",
                    "⇄" to "路線",
                    "⚙" to "設定",
                ),
                onCommand = { i -> paneIndex = i; cmdOpen = false },
                secondary = listOf("重新整理" to {}, "介面規範" to {}, "Win10 說明" to {}),
                modifier = Modifier.padding(bottom = nav.calculateBottomPadding()),
            )
        }

        /* ---- NavigationView 左側面板（官方 LeftMinimal：覆蓋內容 + 煙霧遮罩） ---- */
        if (paneOpen) {
            val slide by animateFloatAsState(1f, tween(1), label = "noop")
            Box(Modifier.fillMaxSize()) {
                // 煙霧層（官方 SmokeLayer）：點擊關閉
                Box(
                    Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.5f))
                        .clickable { paneOpen = false },
                )
                Column(
                    Modifier
                        .width(260.dp)
                        .fillMaxHeight()
                        .background(W10.Chrome)
                        .graphicsLayer {
                            translationX = -(1f - slide) * 40f
                        },
                ) {
                    Spacer(Modifier.height(status.calculateTopPadding() + 24.dp))
                    T("森友出行", "subtitle", modifier = Modifier.padding(start = 16.dp, bottom = 16.dp))
                    panes.forEachIndexed { i, p ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .background(if (i == paneIndex) W10.Accent.copy(alpha = 0.35f) else Color.Transparent)
                                .clickable { paneIndex = i; paneOpen = false },
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(Modifier.width(4.dp).fillMaxHeight().background(if (i == paneIndex) W10.AccentLight else Color.Transparent))
                            Spacer(Modifier.width(12.dp))
                            T(p, "body")
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    Box(Modifier.fillMaxWidth().height(1.dp).background(W10.Line))
                    Spacer(Modifier.height(12.dp))
                    T("官方字階與元件", "caption", color = W10.Text2, modifier = Modifier.padding(start = 16.dp))
                }
            }
        }

        /* ---- Drill in 詳情（官方：深入下一層） ---- */
        if (drillOpen) {
            Box(
                Modifier
                    .fillMaxSize()
                    .background(W10.Bg)
                    .graphicsLayer {
                        val t = drill.value
                        alpha = t
                        translationX = (1f - t) * 120f
                    },
            ) {
                Column(Modifier.fillMaxSize()) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(start = 4.dp, end = 16.dp, top = status.calculateTopPadding() + 6.dp, bottom = 6.dp)
                            .heightIn(min = 48.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            Modifier.size(48.dp).clickable { drillOpen = false },
                            contentAlignment = Alignment.Center,
                        ) { Text("←", color = W10.Text1, fontSize = 20.sp) }
                        Spacer(Modifier.width(8.dp))
                        T("K75P 詳情", "subtitle", modifier = Modifier.weight(1f))
                    }
                    Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 18.dp)) {
                        T("Drill in 轉場", "title", modifier = Modifier.padding(vertical = 12.dp))
                        T(
                            "官方：使用者深入 App 時使用（例如選取項目後顯示更多資訊），" +
                                "要讓使用者感覺「進入了更深一層」。對照 Page refresh 用於回到導覽堆疊頂部。",
                            "body",
                            color = W10.Text2,
                        )
                        Spacer(Modifier.height(16.dp))
                        repeat(4) { i ->
                            Row(
                                Modifier.fillMaxWidth().padding(vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                T("${i + 1}", "caption", color = W10.Text2, modifier = Modifier.width(28.dp))
                                T(listOf("天瑞", "天水圍公園", "天耀邨耀盛樓", "輕鐵天耀站")[i], "body", modifier = Modifier.weight(1f))
                                T("${(i + 1) * 2} 分", "body", color = W10.AccentLight)
                            }
                            Box(Modifier.fillMaxWidth().height(1.dp).background(W10.Line))
                        }
                    }
                }
            }
        }
    }
}

/* ---------------- 首頁：Win10 開始畫面（Live Tiles） ---------------- */

@Composable
private fun StartPage(onDrill: () -> Unit) {
    var revealPress by remember { mutableIntStateOf(-1) }
    Column(Modifier.fillMaxWidth()) {
        T("開始", "titlelarge", modifier = Modifier.padding(top = 8.dp, bottom = 12.dp))
        // Win10 開始畫面：強調色磁貼 + 輕微透明（官方 Live Tile）
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            TileBox("K75P", "4 分", W10.Accent, Modifier.weight(1f).height(96.dp), revealPress == 0) { revealPress = 0; onDrill() }
            TileBox("收藏", "6 條", W10.Accent.copy(alpha = 0.85f), Modifier.weight(1f).height(96.dp), revealPress == 1) { revealPress = 1 }
        }
        Spacer(Modifier.height(6.dp))
        TileBox("天氣 · 三天", "24° 多雲", W10.Accent.copy(alpha = 0.75f), Modifier.fillMaxWidth().height(72.dp), revealPress == 2) { revealPress = 2 }
        Spacer(Modifier.height(6.dp))
        TileBox("壽司郎排隊", "46 組", W10.Accent.copy(alpha = 0.85f), Modifier.fillMaxWidth().height(72.dp), revealPress == 3) { revealPress = 3 }

        T("官方字階示例", "title", modifier = Modifier.padding(top = 24.dp, bottom = 8.dp))
        T("Title · 28/36 semibold", "title")
        T("Subtitle · 20/28 semibold", "subtitle")
        T("Body · 14/20 regular", "body")
        T("Caption · 12/16 regular", "caption", color = W10.Text2)
        T("Display · 68/92 semibold", "display", modifier = Modifier.padding(top = 8.dp))
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun TileBox(
    title: String,
    value: String,
    color: Color,
    modifier: Modifier,
    pressed: Boolean,
    onClick: () -> Unit,
) {
    Box(
        modifier
            .background(color)
            // 官方 Reveal：按壓時顯示邊框高亮（行動裝置為按壓觸發）
            .then(if (pressed) Modifier.border(1.dp, Color.White.copy(alpha = 0.8f)) else Modifier)
            .clickable { onClick() }
            .padding(10.dp),
    ) {
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.Bottom) {
            Text(value, color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.SemiBold)
            T(title, "caption", color = Color.White.copy(alpha = 0.9f))
        }
    }
}

/* ---------------- 清單頁 / 字階頁 ---------------- */

@Composable
private fun ListPage(title: String, rows: List<String>) {
    Column(Modifier.fillMaxWidth()) {
        T(title, "titlelarge", modifier = Modifier.padding(top = 8.dp, bottom = 12.dp))
        rows.forEach { r ->
            Column(Modifier.fillMaxWidth().clickable {}.padding(vertical = 14.dp)) {
                T(r, "body")
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(W10.Line))
        }
    }
}

@Composable
private fun TypeRampPage() {
    Column(Modifier.fillMaxWidth()) {
        T("設定", "titlelarge", modifier = Modifier.padding(top = 8.dp, bottom = 12.dp))
        listOf(
            "Display" to "68 / 92 semibold",
            "Title large" to "40 / 52 semibold",
            "Title" to "28 / 36 semibold",
            "Subtitle" to "20 / 28 semibold",
            "Body large" to "18 / 24 regular",
            "Body" to "14 / 20 regular",
            "Body strong" to "14 / 20 semibold",
            "Caption" to "12 / 16 regular",
        ).forEach { (n, v) ->
            Row(Modifier.fillMaxWidth().padding(vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                T(n, "body", modifier = Modifier.weight(1f))
                T(v, "caption", color = W10.Text2)
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(W10.Line))
        }
        Spacer(Modifier.height(16.dp))
        T(
            "官方排版規範：最小 12px Regular／14px Semibold；一律 Sentence case；預設靠左；" +
                "截斷以換行處理並避免省略號。",
            "caption",
            color = W10.Text2,
        )
    }
}

/* ---------------- CommandBar（官方：主命令＋溢出次要命令） ---------------- */

@Composable
private fun CommandBar(
    open: Boolean,
    onToggle: () -> Unit,
    commands: List<Pair<String, String>>,
    onCommand: (Int) -> Unit,
    secondary: List<Pair<String, () -> Unit>>,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth().background(W10.Chrome)) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(W10.Line))
        // 溢出：次要命令由下往上滑出（官方 CommandBar 行為）
        if (open) {
            Column(Modifier.fillMaxWidth()) {
                secondary.forEach { (label, action) ->
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .clickable { action() }
                            .padding(horizontal = 16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) { T(label, "body") }
                }
                Box(Modifier.fillMaxWidth().height(1.dp).background(W10.Line))
            }
        }
        Row(
            Modifier.fillMaxWidth().height(W10.CommandBarH),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            commands.forEachIndexed { i, (glyph, label) ->
                Row(
                    Modifier
                        .height(48.dp)
                        .clickable { onCommand(i) }
                        .padding(horizontal = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(glyph, color = if (i == 0) W10.AccentLight else W10.Text1, fontSize = 17.sp)
                    // 官方：CommandBar 平時只顯示圖標，開啟後才顯示標籤
                    if (open) {
                        Spacer(Modifier.width(8.dp))
                        T(label, "caption")
                    }
                }
            }
            Box(
                Modifier.size(48.dp).clickable { onToggle() },
                contentAlignment = Alignment.Center,
            ) { Text(if (open) "⌄" else "⋯", color = W10.Text1, fontSize = 18.sp) }
        }
    }
}
