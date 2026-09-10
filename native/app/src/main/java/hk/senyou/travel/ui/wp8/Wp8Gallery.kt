package hk.senyou.travel.ui.wp8

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * WP7 / WP8 元件畫廊：把 Metro 的每個基礎元件排在一頁，方便逐一比對規範。
 * 數值全部對應 Web 版 `css/wp8-strict.css`。
 */
@Composable
fun Wp8Gallery() {
    var seg by remember { mutableIntStateOf(0) }
    var chip by remember { mutableIntStateOf(0) }
    var text by remember { mutableStateOf("") }
    var flipped by remember { mutableStateOf(false) }

    Column(Modifier.fillMaxSize().background(Wp8.Bg)) {
    Column(
        Modifier
            .weight(1f)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = Wp8.Gutter)
            .padding(bottom = 24.dp),
    ) {
        Spacer(Modifier.height(20.dp))
        Text(
            "森友出行",
            color = Wp8.Text1,
            fontSize = 46.sp,
            fontWeight = FontWeight.Light,
            letterSpacing = (-0.5).sp,
        )
        Text("pivot title · 46sp Light", color = Wp8.Text2, fontSize = 12.sp)

        /* ---- 頂欄圓形操作 ---- */
        Wp8Group("Top bar · 圓形操作（44dp / 2px 描邊）")
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Wp8CircleButton("⌕", "搜尋") { }
            Wp8CircleButton("↻", "重新整理") { }
        }

        /* ---- Live Tiles ---- */
        Wp8Group("Live tiles · 4 列網格 / 間距 12dp / 直角")
        Row(horizontalArrangement = Arrangement.spacedBy(Wp8.Gap)) {
            Wp8Tile(
                modifier = Modifier.weight(2f).height(172.dp),
                color = Wp8.TileCobalt,
                value = "4", trailing = "分",
                title = "K75P 天瑞 ↺ 洪水橋",
                sub = "實時 2 班在路",
                back = "背面：可放詳細資訊\nWP Live Tile 會定時翻面",
                flipped = flipped,
                onClick = { flipped = !flipped },
            )
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(Wp8.Gap)) {
                Wp8Tile(
                    modifier = Modifier.fillMaxWidth().height(80.dp),
                    color = Wp8.TileCyan,
                    value = "6", trailing = "條", title = "我的收藏",
                    onClick = {},
                )
                Wp8Tile(
                    modifier = Modifier.fillMaxWidth().height(80.dp),
                    color = Wp8.TileMagenta,
                    value = "24°", title = "天氣 · 三天",
                    onClick = {},
                )
            }
        }
        Spacer(Modifier.height(Wp8.Gap))
        Wp8Tile(
            modifier = Modifier.fillMaxWidth().height(76.dp),
            color = Wp8.TileTeal,
            title = "寬磁貼 · 全寬 76dp",
            sub = "路線圖 · 港鐵 + 輕鐵全線候車",
            onClick = {},
        )
        Text("點磁貼可看 3D 翻面（rotateY + perspective 600px）", color = Wp8.Text2, fontSize = 12.sp)

        /* ---- 搜尋 ---- */
        Wp8Group("Metro 輸入框 · 2px 下劃線")
        Wp8Input(value = text, placeholder = "輸入路線、站名或港鐵車站", onValueChange = { text = it })
        Spacer(Modifier.height(Wp8.Gap))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("公交", "港鐵巴士", "港鐵", "輕鐵").forEachIndexed { i, t ->
                Wp8Chip(t, i == chip) { chip = i }
            }
        }
        Spacer(Modifier.height(Wp8.Gap))
        Wp8PrimaryButton("搜尋") { }

        /* ---- 列表 ---- */
        Wp8Group("Metro 列表行 · 1px 下分隔線")
        Wp8Row(no = "69X", name = "天瑞 ↔ 高鐵西九龍站", sub = "九巴 · 經天水圍站", eta = "3 分", etaColor = Wp8.Medium) {}
        Wp8Row(no = "K75P", name = "天瑞 ↺ 洪水橋", sub = "港鐵巴士 · 循環線", eta = "即將", etaColor = Wp8.Soon) {}
        Wp8Row(no = "969", name = "天水圍市中心 → 銅鑼灣", sub = "城巴 · 經西隧", eta = "18 分", etaColor = Wp8.Text1) {}

        /* ---- 設定 ---- */
        Wp8Group("Metro 設定列 · 分段按鈕")
        Row(
            Modifier.fillMaxWidth().padding(vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("主題", color = Wp8.Text2, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Wp8Seg(listOf("深色", "淺色"), seg) { seg = it; Wp8.light = it == 1 }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Wp8SettingRow("強調色", "5 色可換")
        Wp8SettingRow("按壓回饋", "縮放 0.96 · 不變色")

        /* ---- 進度條 ---- */
        Wp8Group("進度條 · 3px 強調色")
        Wp8ProgressBar(active = true)
        Spacer(Modifier.height(20.dp))
    }

    /* ---- App Bar（常駐底欄，WP8 62dp 裸字形圖標） ---- */
    Column(Modifier.fillMaxWidth().background(Wp8.Surface)) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        Row(
            Modifier.fillMaxWidth().height(Wp8.AppBarH),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            listOf("⌂" to "開始", "♡" to "收藏", "⇄" to "路線", "⚙" to "設定").forEachIndexed { i, (g, l) ->
                Wp8AppBarButton(g, l, i == 0) { }
            }
            Wp8AppBarButton("⋯", "更多", false) { }
        }
    }
    }
}
