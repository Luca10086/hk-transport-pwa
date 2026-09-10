# 森友出行 · 原生 Android（Kotlin + Compose）

WP2026 v3 的全原生实现。Web 版（`../wp2026.html`）保留作为对照与参考。

## 构建

```bash
# 需要：JDK 21、Android SDK（platform 35）、Gradle wrapper 已内置
cd native
gradlew.bat :app:assembleDebug      # 调试包 → app/build/outputs/apk/debug/app-debug.apk
gradlew.bat :app:assembleRelease    # 正式包 → app/build/outputs/apk/release/app-release.apk
```

首次构建需联网下载 AGP/Kotlin/Compose 依赖；`local.properties` 内为本机 SDK 路径（不入库）。

## 签名

- 密钥：`keystore/senyou-release.jks`（4096 位 RSA，有效期 30 年，**不入版本库**）
- 口令：`keystore/keystore.properties`（不入库）
- 重新生成（若密钥丢失，将无法覆盖升级已安装的正式版，需先卸载）：

```bash
keytool -genkeypair -v -keystore keystore/senyou-release.jks -alias senyou \
  -keyalg RSA -keysize 4096 -validity 10950 \
  -storepass <新密碼> -keypass <新密碼> \
  -dname "CN=Senyou Travel, O=Senyou, L=Hong Kong, C=HK"
```

`app/build.gradle.kts` 会自动读取 `keystore/keystore.properties`；文件不存在时 release 包不签名（仍可构建）。

## 安装

```bash
adb install -r out/senyou-native-v3.0.0-release.apk
```

> 调试包（debug 签名）与正式包（release 签名）签名不同，不能互相覆盖安装，需先卸载其一。
> 包名 `hk.senyou.travel`，与原 WebView 版（`com.senyou.travel`）可共存。

## 结构

```
app/src/main/java/hk/senyou/travel/
├─ MainActivity.kt / SenyouApp.kt     # 入口 / Application（通知渠道 + WorkManager 注册）
├─ data/   Http·Api·StaticData·SearchRepo·K75PModel·MtrRepo·Hko·Store
├─ ui/     App·LiquidBackground·Glass·Widgets·HomeScreen·FavoritesScreen
│          SushiScreen·LineMapScreen·SettingsScreen·RouteDetailPage·K75PPage·WeatherPage
├─ work/   RefreshWorker（每 30 分鐘背景刷新）
└─ widget/ SenyouWidgetProvider（桌面小組件）
```

靜態資料（港鐵各線/輕鐵站/K75P 站表與座標/壽司郎快照）由 `../tools/export-static-data.mjs` 從 Web 版導出到 `app/src/main/assets/static.json`。

## 自測（無需模擬器/設備）

```bash
gradlew.bat :app:testDebugUnitTest      # 渲染 8 個頁面截圖 → app/build/screenshots/
```

原理：Robolectric 原生圖形 + `decorView.drawToBitmap()`（繞過 PixelCopy），逐頁輸出 1233×2673 PNG。
測試期間 `DebugFlags.staticUi/offline = true`：關閉無限動畫（否則 Compose 永不 idle）、跳過 GraphicsLayer/RenderNode（軟件渲染不支持）、HTTP 直接返回 null（避免測試等待網絡）。

截圖產物可交給視覺模型審查（本項目用 MiMo v2.5 讀圖），或做像素統計自動校驗。

## 版本歷程

| 版本 | 里程碑 |
|------|--------|
| 3.0.0-m1 | 工程骨架 + v3 視覺（液體背景 / 玻璃組件 / K75P U 形頁） |
| 3.0.0-m2 | 資料層 + 真實搜索 + 詳情頁 + K75P 實時 |
| 3.0.0-m3 | 收藏 / 天氣 / 壽司郎 / 設定（功能對等） |
| 3.0.0-m4 | 真折射（RenderEffect + AGSL）+ 氣泡工具欄 |
| 3.0.0-m5 | 路線圖頁 + 小組件 + 到站通知 + 背景刷新 + 觸感；release 簽名 |
| **3.0.0** | 大屏/摺疊屏自適應（導航欄+雙欄+3列+半折分屏+鉸鏈避讓）、路線圖連接線、逐條到站提醒、搜尋歷史、詳情頁收藏+通知直達、淺色主題、強調色生效、TTS 粵語播報、TalkBack 語義、離線緩存、Baseline Profile、崩潰日誌、12 項單元測試 |
| **3.0.1** | 缺陷排查修復（詳見下節）：ETA 文案語義對齊 Web 版、K75P 循環線標籤、首頁磁貼字號、收藏卡方向標籤、**港鐵/輕鐵/港鐵巴士收藏與通知深鏈的空白頁修復**、WorkManager 初始化、48 項單元測試 |
| **3.0.2** | **真機嚴重問題修復**：開玻璃後文字消失、頻繁閃退、文字被裁、WP 直角風格回歸（詳見下節），55 項單元測試 |

## 3.0.2 真機問題修復（閃退 / 文字消失 / 顯示不全 / 直角統一）

真機（MIX Fold 4）回報「開玻璃強度就看不到字、一天閃退 5 次、字顯示不全」，
而截圖測試全綠——原因是舊的截圖測試用 `DebugFlags.staticUi` **繞過了整條 GPU 玻璃路徑**，測試根本沒覆蓋真機走的分支。

| 問題 | 根因 | 修復 |
|------|------|------|
| **開啟玻璃強度（≥1 檔）所有文字消失** | AGSL 邊緣折射 rect 畫在 `drawContent()` **之後**且完全不透明（`uBg.eval()` 保留 alpha=1），等於用一張背景圖蓋住整個面板 | 移除 AGSL 折射與 RenderEffect 模糊；面板改為「色調 + 1px 描邊 + 頂緣高光」，所有裝飾都畫在內容之下或只是 1px 線 |
| **一天閃退 5 次** | ① `LiquidBackgroundHost` 每 300ms `layer.toImageBitmap()`（全屏位圖：外屏 ~12MB、內屏 ~29MB，每秒 ~100MB 配置）；② 每個面板都重畫一次全屏背景層 + RenderEffect 模糊（數十次全屏 GPU 工作/幀）；③ 每個面板一個 `rememberInfiniteTransition` 高光動畫（每幀重組） | 三者全部移除；背景改為單一 Canvas（動畫降到 8fps、光斑 7→6、星 54→42） |
| **字顯示不全** | 大量固定高度容器（TopBar 96dp、Tile 120/92dp、KCard 104dp、列表行…）在系統大字体下溢出被裁；`Density` 又把 `fontScale` 強制為 1.0（忽略 MIUI 字体設定） | 固定高度改 `heightIn(min=)`（**不會再裁切**）、尊重系統 `fontScale`（大字模式再 ×1.15）、K75P 地圖由固定 470dp 改為 `weight(1f)` 彈性高度 |
| **WP 風格蕩然無存 / 直角圓角混雜** | 卡片 18dp、彈窗 26dp、膠囊 999dp、按鈕圓形…四種形狀並存 | 新增單一令牌 **`V3.Radius = 0.dp`（直角，WP/Metro 風格）**，全站卡片/膠囊/按鈕/徽章/開關/導航統一使用 `V3.Shape`；僅保留「圓點/站點」這類真圓形。改回圓角只需改這一行 |
| 隨機閃退（次要防線） | DataStore IO 異常會沿協程上拋；多個 `LaunchedEffect` 資料載入未包裹 | DataStore flow 加 `.catch { emit(emptyPreferences()) }`、寫入包 `runCatching`；所有頁面資料載入包 `runCatching` |
| 反覆閃退無法自救 | 無任何自保機制 | 新增 **`CrashGuard` 閃退守護**：連續 2 次「啟動未正常結束」自動進入安全模式（關玻璃與動效），穩定運行 12 秒即清零；設定 → 診斷可手動關閉 |

驗證方式（真機走的分支，測試現在真的覆蓋了）：

- `glassLevelsKeepTextVisible`：玻璃 0–4 逐檔截圖並統計文字亮像素，任一路檔文字被遮住即失敗
- `homeLargeFont` / `favoritesLargeFont`：以 `fontScale = 1.5`（模擬 MIUI 大字體）截圖，MiMo 讀圖確認無字被裁
- MiMo v2.5 讀圖複核全站直角一致性（卡片/按鈕/開關/導航/展開態側欄）與「玻璃 4 檔文字全部可見」


## 3.0.1 缺陷排查與修復

以「MiMo v2.5 讀圖 + 原解析度裁剪複核 + 像素掃描 + 單元測試」四重手段排查，修復如下：

| 問題 | 原因 | 修復 |
|------|------|------|
| 港鐵路線圖出現「0 分」 | `minsUntil()` 把已過/不足 1 分鐘一律夾為 0 | 已過期 → `null`（顯示 —）；不足 1 分鐘 → 「即將」，與 Web 版 `sec ≤ 60` 規則一致；同步到搜尋結果 / 收藏卡 / K75P 卡 / 詳情頁 / 小組件 / TTS |
| K75P 標籤「起點 天瑞」「終點 天瑞」自相矛盾 | 循環線（↺）卻按普通線標終點 | 改為「起點 天瑞」+「返回 天瑞」，底部折返站加「循環點」 |
| 首頁「路線圖」磁貼顯示「屯馬」42sp +「綫」15sp | 誤把「綫」當單位 | 合併為同一字號的「屯馬綫」 |
| 收藏港鐵/輕鐵站卡片顯示「去程」 | 方向標籤未區分交通類型 | 僅巴士顯示去程/回程；無資料時顯示「點擊查看班次 ›」 |
| **點開港鐵站 / 輕鐵站 / 港鐵巴士收藏顯示「無法載入站點」空白頁** | `routeStops()` 只支援 KMB/CTB/NLB，其餘回傳空列表 | 新增 `stationTrains()`（港鐵上下行 / 輕鐵各線）與 MTRBUS 班次表；詳情頁對車站改列班次、標題顯示「XX 站」 |
| **港鐵站 / 輕鐵站到站通知點了沒反應** | 通知 extras 只有 route，車站類收藏的 route 為空 → 直接 return | 新增 `deepLinkItem()` 純函數 + extras 帶 `type`/`station`/`route_id`，四類收藏都能直達；K75P 走專用實時頁 |
| 港鐵站搜尋結果副標題「屯馬線 · 觀塘線 線」 | 線名本身已含「線」字，又拼了後綴 | 移除多餘後綴 |
| lint 錯誤 `RemoveWorkManagerInitializer` | `SenyouApp` 已實作 `Configuration.Provider`，仍保留默認初始化器 | manifest 移除 `androidx.work.WorkManagerInitializer` |

同時確認**非缺陷**（經裁剪複核 + 像素掃描證實）：展開態「文字被切」「大片空白」為縮圖誤判與可滾動視口邊界；列表底部 110dp 留白為底部導航欄避讓；星空背景亮點曾被誤判為邊緣裁切。


## 自測與驗證

- **單元測試**：`gradlew.bat :app:testDebugUnitTest`（55 項：時間解析 / ETA 文案 / K75P 投影 / 自適應斷點 / 收藏與設定序列化往返 / 搜尋歷史 / 離線緩存 / 崩潰日誌與閃退守護 / 收藏映射 / 通知深鏈分流 / 靜態資料）
- **截圖測試**：同命令輸出 26 張頁面 PNG（含完整 App 外殼：頂欄+底部導航）（`app/build/screenshots/`），含緊湊態、展開態 953×852dp、淺色主題、強調色、收藏頁、港鐵/輕鐵車站詳情、港鐵巴士班次、**玻璃 0–4 逐檔**、**大字體 1.5×**
- **文字可見性回歸**：`glassLevelsKeepTextVisible` 逐檔統計文字亮像素，任一路檔被裝飾層蓋住即測試失敗（防「開玻璃看不到字」重演）
- **視覺審查**：截圖交給 MiMo v2.5 讀圖審查（模型可讀圖）；可疑處再按原解析度裁剪複核，避免縮圖誤判
- **像素校驗**：腳本掃描截圖左右邊緣亮像素簇，判定是否真有文字被裁切（區分星空裝飾與文字筆畫）
- **閃退自保**：`CrashGuard` 連續 2 次異常啟動即自動進安全模式（可在 設定 → 診斷 關閉）
- **Baseline Profile**：APK 內含 `assets/dexopt/baseline.prof`（Compose 自帶 profile，AGP 自動合併）

## 設計風格：直角（WP / Metro）

- 全站唯一圓角令牌：`V3.Radius = 0.dp`，`V3.Shape = RoundedCornerShape(V3.Radius)`
- 卡片、磁貼、膠囊、搜尋欄、按鈕、徽章、開關、導航項、彈窗全部使用 `V3.Shape`
- 只有「圓點 / 站點 / 巴士標記」保留真圓形（語義上是點，不是圓角）
- 要整體改成圓角：只改 `V3.Radius` 一行即可（例如 `2.dp`、`8.dp`）

## WP7 / WP8 風格 demo（3.1.0）

設定 → 風格 → 「WP7 / WP8 風格演示」可開啟；截圖在 `native/out/wp8-preview/`。

數值逐項對應 Web 版 `css/wp8-strict.css`（PWA 時期那套嚴格 WP8 皮膚）：

| 元素 | WP8 規範 | 原生實作 |
|------|----------|----------|
| 配色 | 深紫黑 `#15121C` / 表面 `#221D31` / 強調 `#8B5CF6` | `Wp8` 令牌，另備淺色與 5 色強調色切換 |
| Pivot 標題 | 46sp Light、lowercase、負字距 | 頂欄大標題 |
| 頂欄操作 | 44dp 圓形 + 2px 描邊 | `Wp8CircleButton` |
| Live Tiles | 4 列網格、間距 12dp、純色直角、白字左下、可 3D 翻面 | `Wp8Tile`（rotateY + perspective） |
| 輸入框 | 無框無底色，只有 2px 下劃線 | `Wp8Input` |
| 膠囊 | 1px 細框直角，選中 = 強調色實心 | `Wp8Chip` |
| 列表行 | 無卡片底色，只有 1px 下分隔線 | `Wp8Row` |
| 路線號 | 強調色 22sp Light | `Wp8Row` 左側 |
| ETA | 21sp Light 等寬數字；即將=`#E51400`、≤10 分=`#F0A30A` | `Wp8Row` |
| App Bar | 62dp、裸字形圖標（無圓圈）、選中轉強調色 | `Wp8AppBarButton` |
| 按壓回饋 | 縮放 0.96–0.98，**不變色** | 所有元件 |
| 頁面轉場 | `rotateY(-12deg) translateX(26%)` → 0 | `Wp8DetailSheet` |
| 緩動 | `cubic-bezier(.16,1,.3,1)` | `Wp8.Ease` |

驗證：MiMo v2.5 讀圖 7 張 → 6 張判定 `very_wp`；「按鈕有漸變 / chip 有圓角」兩條經**像素檢測否證**（按鈕整行均勻 `(139,92,246)`、四角皆為強調色）；另外三個 Pivot 分頁（收藏 / 路線 / 畫廊 App Bar）判定 `ok`。
## 3.2.0 全盤 WP8 化（依概念圖 wp8-concept.html）

介面層整組換掉：刪除 v3 液態玻璃（Glass.kt / LiquidBackground.kt / Widgets.kt / V3.kt 與全部舊頁面），
改為 ui/wp8/ 一套 Metro 元件 + 5 個 Pivot 分頁。

| 概念圖元素 | 原生實作 |
|------------|----------|
| 頂欄 Pivot 大標題 + 圓形搜尋/重新整理 | `PivotTopBar`（46sp Light，切頁淡出左移） |
| Pivot 橫滑 5 分頁：首頁 / 收藏 / 壽司郎 / 路線 / 設定 | `HorizontalPager` + `Wp8AppBarButton` |
| 首頁 Panorama（磁貼 / 搜尋 / 天氣＋K75P） | `Wp8HomePane`（3 面板 + 圓點指示）**大屏同屏並列兩塊面板** |
| Live Tiles：我的收藏 / 壽司郎 / 天氣 / K75P / 收藏① / 路線圖 / 設定 | `Wp8Tile`（純色直角、3D 翻面、按壓 0.96） |
| Metro 輸入框 + chips + 搜尋按鈕 | `Wp8Input` / `Wp8Chip` / `Wp8PrimaryButton` |
| 扁平行結果（強調色路線號 + 等寬 ETA） | `Wp8Row` |
| App Bar 5 圖標 + ⋯ 選單 | `AppBar` + `Wp8MoreMenu` |
| K75P 全屏實時頁 | `Wp8K75PPage`（U 形圖改平面配色） |
| 詳情頁右側 3D 滑入 | `Wp8DetailSheet`（rotateY(-12°) → 0） |
| 設定列表（主題/強調色/字體/高對比/減少動畫/自動重新整理/資料來源/版本） | `Wp8SettingsPane`（另加安全模式與崩潰日誌） |
| 高對比模式 | 純黑底 + 磁貼改黑底白框白字 |
| 大屏 44px 邊距 | `Wp8.Gutter` 隨 `AdaptiveInfo.isExpanded` 切換 |

配色與尺寸逐項對應 css/wp8-strict.css：`#15121C` / `#221D31` / `#8B5CF6`、磁貼 `#5B21B6`/`#7C3AED`/`#6D28D9`/`#4C1D95`、
ETA 紅 `#E51400` / 橙 `#F0A30A`、12dp 網格、62dp App Bar、`cubic-bezier(.16,1,.3,1)`。

驗證：單元測試 + 25 張 WP8 截圖（含大屏、淺色、高對比、大字體、逐分頁文字可見性回歸）。
MiMo v2.5 讀圖：首頁磁貼、收藏、設定、K75P、高對比、淺色、大屏雙面板均判定符合 Metro；
其「按鈕/chip 有漸變、有圓角」等指控經**像素檢測四次否證**（全圖僅 4 個精確色值、角落像素與中心同色）。