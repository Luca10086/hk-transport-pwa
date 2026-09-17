# Material 3 介面（獨立實作）

> 本文件說明 `native/` 應用中 **Material 3 風格**的實作範圍、與 W10M（Windows 10 Mobile / Metro）風格的
> 功能對等關係，以及驗證方式。兩套介面**完全獨立**，只共用 `data/` 資料層。

## 1. 定位與原則

| 原則 | 實作 |
|---|---|
| 兩套主題互不影響 | W10M 風格程式碼在 `ui/`、`ui/wp8/`；Material 3 在 `ui/material/`。Material 端不 import 任何 `ui.wp8.*`，亦不使用 `Wp8` 色彩／尺寸常數。 |
| Material 3 必須完全符合 M3 | 全部使用 Compose Material3 官方元件（`Scaffold`／`TopAppBar`／`NavigationBar`／`NavigationRail`／`PermanentDrawerSheet`／`Card`／`ListItem`／`FilterChip`／`AssistChip`／`SegmentedButton`／`ModalBottomSheet`／`TimePicker`／`Switch`），文字用 M3 type scale，形狀用 `MaterialTheme.shapes`。 |
| 不為了相容而妥協 | 需要不同行為時各自實作（例如收藏的「換站」在 W10M 是內嵌站表、在 Material 是 `ModalBottomSheet`）；寧可重複少量程式碼，也不讓兩邊互相牽制。 |
| 顏色 | API 31+ 使用 **dynamic colour（Material You）**，以下用 baseline M3 scheme。這是 M3 在 Android 12+ 的標準行為。 |

入口：`ui/App.kt` 依 `Settings.uiStyle`（`w10m` / `material`）在 `CompositionLocalProvider` 內二選一；
待機畫面 `ui/StandbyActivity.kt` 同樣依 `uiStyle` 選擇 `StandbyScreen`（W10M）或 `MaterialStandbyScreen`（M3）。

## 2. 檔案結構

| 檔案 | 內容 |
|---|---|
| `ui/material/MaterialTheme.kt` | `SenyouMaterialTheme(dark)`：dynamicLight/DarkColorScheme（API 31+）或 baseline scheme，M3 預設 typography／shapes |
| `ui/material/MaterialShell.kt` | `MaterialApp()`：Scaffold + TopAppBar + 自適應導覽（compact `NavigationBar`／medium `NavigationRail`／expanded `PermanentDrawerSheet`）、查詢流程（`LaunchedEffect(query, mode)` → `SearchRepo.search` + `fillEtas` + `pushRecent`）、K75P 子頁與返回 |
| `ui/material/MaterialHome.kt` | 首頁：搜尋 `OutlinedTextField`、模式 `FilterChip`、AI 入口、天氣／K75P／待機／收藏／壽司郎卡片；`MaterialAiSheetBody`（AI 面板內容，可獨立截圖） |
| `ui/material/MaterialPanes.kt` | 收藏頁（釘選／提示／換站／上移／下移／移除 + 換站 `ModalBottomSheet`）、壽司郎頁 |
| `ui/material/MaterialRoutes.kt` | 路線頁：K75P 卡 + 港鐵各線站表（點站 → `ModalBottomSheet` 顯示班次與首尾班） |
| `ui/material/MaterialSettings.kt` | 設定頁：介面風格／主題、鬧鐘（含待機入口、精確鬧鐘授權、重新整理間隔）、天氣地區、AI、收藏匯出、診斷、關於 |
| `ui/material/MaterialK75P.kt` | K75P 實時地圖（osmdroid `AndroidView`）與到站清單 |
| `ui/material/MaterialStandby.kt` | 待機／鬧鐘：`HorizontalPager` 四面（鬧鐘／日曆／天氣／音樂）、M3 `TimePicker` 設鬧鐘 |

## 3. 功能對等（W10M ↔ Material 3）

| 功能 | W10M | Material 3 |
|---|---|---|
| 搜尋（公交／港鐵巴士／港鐵／輕鐵／通宵） | `Wp8Chip` 模式列 | `FilterChip` 模式列（同一組模式與順序） |
| 搜尋結果即時 ETA | `SearchRepo.fillEtas` | 同（共用資料層） |
| AI 建議（MiMo v2.5） | 內嵌區塊 | `AssistChip` 入口 + `ModalBottomSheet`（M3 不以對話框處理額外流程） |
| 收藏：釘選／提示門檻／換站／上移／下移／移除 | `Wp8Chip` + 內嵌站表 | `FilterChip`（狀態）／`AssistChip`（動作）+ `ModalBottomSheet` 選站 |
| 收藏匯出（剪貼簿） | 設定頁「收藏」列 | 設定頁「收藏」列（顯示「N 條／已複製」） |
| 路線：K75P 地圖、港鐵站表、首尾班 | `Wp8K75PPage`（Canvas 備援） | `MaterialK75PPage`（M3 佔位／失敗備援） |
| 待機鬧鐘（顯示、響鈴、貪睡、設時間） | `StandbyScreen` | `MaterialStandbyScreen`（`TimePicker`） |
| 設定：介面風格／主題／鬧鐘／待機／動畫／天氣地區／AI／匯出／診斷／關於 | `Wp8SettingsPane` | `MaterialSettingsPane`（同項目；另加 `SegmentedButton` 重新整理間隔） |

## 4. 驗證

- **單元／截圖測試**：`app/src/test/java/hk/senyou/travel/ScreenshotTest.kt` 內 `materialShell`、`materialExpanded`、
  `materialStandby`、`materialK75P`、`materialFavourites`、`materialAiSheet`、`materialAiSheetBody`、
  `materialSettingsLower`（全套共 94 項測試全綠）。
- **產物**：`app/build/screenshots/wp8-4*.png`（同步複製到 `native/out/wp8-app-preview/`）。
  `wp8-41` 已涵蓋設定頁頂部（介面風格／主題／鬧鐘／開啟待機鬧鐘畫面／允許精確鬧鐘／折起立放／減少動畫／自動重新整理間隔），
  `wp8-48` 涵蓋設定頁下半（收藏匯出／安全模式／崩潰日誌／關於）。
- **像素證據**（用於核對視覺審查的結論，避免誤判）：
  - 選中的 `FilterChip`（「提示 5 分」）填色為 dynamic light `secondaryContainer` `#DBE2F9`，
    在 chip 列 y=315..410 內共 29,466 px ≈ 一個 96px 高的晶片，且帶 `✓` 前置圖示。
  - `AssistChip` 描邊色為 dynamic `outline` `#72747D`（第一張卡 3,618 px、第二張卡 5,745 px，對應 3／6 個動作晶片）。
  - 底部 `NavigationBar` 選中指示器為 `#343538`（dynamic dark `secondaryContainer`）共 37,056 px。
  - 晶片高度實測 96 px = 32dp，符合 M3 chip 規範。

## 5. 已知取捨

- `ModalBottomSheet` 在 M3 是**獨立視窗**，Robolectric 以 decorView 截圖抓不到面板本身；
  因此 `materialAiSheet` 用節點斷言確認面板內容，另以 `materialAiSheetBody` 直接渲染面板內容做像素回歸。
- Robolectric 測試環境為離線：截圖中到站時間多為「—」；`materialFavourites` 會注入假收藏以拍到完整操作列。
- 顏色採用 dynamic colour，實際色值隨裝置桌布而變；若要固定品牌色，可改用 seeded scheme（尚未變更）。
