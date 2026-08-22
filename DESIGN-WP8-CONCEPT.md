# WP8 應用設計風格 · 重新分析與歸納（附現有應用差距診斷）

資料來源（2026 檢索）：
- Wikipedia「Metro (design language)」：
  https://www.wikiwand.com/en/Metro_(design_language)
- UI 設計師乾貨「Windows Phone 8 UI 設計指南」（ui design 指南，詳列版式/字體/磁貼/App Bar）：
  https://www.uisdc.com/windows-phone-8-guideline
- LukeW「Design for Mobile: Windows Phone 7 Design」：
  https://lukew.com/ff/entry.asp?1200
- Neowin「Microsoft talks more about the Windows Phone 8 Start screen」：
  https://www.neowin.net/news/microsoft-talks-more-about-the-windows-phone-8-start-screen

---

## 一、WP8（Metro / Microsoft Design Language 2）的設計本質

### 1. 核心原則：Content over Chrome（內容重於裝飾）
- 介面即內容：不畫邊框卡片、不加陰影漸變、不用裝飾性背景。
- 隔離用「留白 + 對齊」，不用色塊和線條。
- WP8 是「以排版為介面」的極致：字體大小、字重、間距就是層級。

### 2. 版式（Layout）
- 頁面邊距：**24px**（窄屏 12px），上下 24px；底部為 App Bar 讓位 **72px + 12px**。
- 網格：**12px 基準網格**，磁貼為 12px 間距的「牆」。
- 頁面結構：42px 頂部標題區 + 內容區，內容從標題下 24px 開始。
- Panorama 寬幅頁可超過螢幕寬度，相鄰面板「透出邊緣」暗示可橫滑。

### 3. 字體（Typography）
- 字族：**Segoe UI**（Light/Semilight 標題，Regular 正文）。
- 尺度（官方）：標題 **42px Light**；分頁標題 **28px**；正文 **20px**；輔助 **15px**；大數字 **60–108px Light**（ETA 類強讀數）。
- 標題慣用小寫（或全大寫），不混用。

### 4. 磁貼（Live Tiles）
- 正方形、**純色**（不透明、無邊框、無陰影），顏色取自 **accent 色板**（單一主題色）。
- 三種尺寸：小(1×1)、中(2×2)、寬(4×2 或 4×1)；12px 間距成牆。
- 資訊更新是「活」的：翻轉（flip）、左右循環（cycle）、圖示、計數。

### 5. 導航控件
- **Pivot**：橫滑翻頁，大標題即當前頁；正文隨手勢水平跟隨。
- **Panorama**：以「全景」聚合多個資訊區塊，塊與塊之間是「風景」。
- **App Bar**：底部壓條，**裸字形圖標**（Segoe UI Symbol；Home E10F、Settings E115、Refresh E117、Search E094），最右 **⋯** 開更多；圖標是單色細線，不帶圓圈、不帶膠囊底。

### 6. 色彩與主題
- 官方 **10 accent 色**（Cobalt #0050EF、Violet #AA00FF、Indigo #6A00FF、Teal #00ABA9、Lime #A4C400…），一次只用一個。
- 深色主題：背景 **#1F1F1F**、文字 #FFF；淺色主題：背景 #FFF、文字 #000。
- 強調色只用於「互動 + 醒目標記」，不用來塗大面積。

### 7. 動效
- 頁面轉場：新頁由右向左推入並淡入；返回反向。
- 按壓回饋：**微縮/微透明**（無色彩變化）；磁貼按下有「沈入」感。
- 動畫短促（150–450ms），緩動以 ease-out 為主。

---

## 二、當前應用 vs WP8 基準：差距診斷

| # | 我們的現狀 | WP8 基準 | 判定 |
|---|---|---|---|
| D1 | 頂欄按鈕是**圓圈框**（⌕/↻ 44px 圓環） | 頂欄無按鈕概念；圖標是**裸字形** | **偏離** → 改裸字形或入 App Bar |
| D2 | 磁貼為暗紫系（#5B21B6 等） | 鮮豔純 accent（#AA00FF） | **偏離** → 概念圖用 WP8 原生色板 |
| D3 | 背景 #15121C 深紫黑 | 深色主題 #1F1F1F（中性黑） | **偏離**（中性黑襯托 accent 更 WP8） |
| D4 | 收藏為「卡片」+ 分頁器 | Metro 無卡片，是扁平行 + 大數字 | **張力**（用戶要求保留）→ 卡片去框線化 |
| D5 | ETA 大數字僅 2.2rem | 強讀數應 60px 級 Light | **偏離** → 放大加字重層級 |
| D6 | 列表行有 border-bottom 分隔線 | Metro 靠留白分組 | **可改** → 概念圖出「無線版」 |
| D7 | 分組標題（九巴/城巴）用 accent 色小字 | 分組標題 = 輕字重白字，較大 | **偏離** → 改 Light 白字 20px |
| D8 | Pivot 標題 48px | 42px Light | 微調 |
| D9 | 狀態列已移除（用戶決定） | WP8 有狀態列（灰字） | 尊重決定，不恢復 |

結論：骨架（Pivot/Panorama/磁貼牆/App Bar 裸字形）已到位；主要差距在
**「配色取向」**（暗紫系 vs WP8 中性黑+鮮 accent）與
**「細節語法」**（圓圈按鈕、卡片、分隔線、字體尺度）。

---

## 三、改進方案（概念圖對應）

在 `design-concept-board.html` 中提供 6 屏概念圖，核心改動：
1. **配色回歸 WP8**：深色底改中性 `#1F1F1F`，accent 用 WP8 板（推薦 Violet `#AA00FF`，備選 Cobalt `#0050EF`），磁貼牆 = accent 純色。
2. **頂欄**：標題 42px Light；右側改**裸字形**（灰白細線），無圓圈。
3. **列表去卡片線**：行距 20px、無分隔線；分組標題改 Light 白字 20px。
4. **強讀數**：ETA 與收藏大數字升到 42–60px Light，accent 色標記「即將到站」。
5. **收藏分頁**：頁點（●○）加上下頁箭頭，頁面「左右滑入」轉場。
6. **App Bar**：確認裸字形 + ⋯，圖標間距 24px。

（概念圖為設計意向稿：桌面瀏覽器直接開啟 `design-concept-board.html` 查看。）
