# 森友出行 · Windows 10 Mobile（UWP）設計規範

本文件對應 App 內 **⋯ 更多 → Win10 Mobile 演示** 那一版。所有數值皆註明官方出處。

> **重點：Windows 10 Mobile 不是「WP8 的下一代皮膚」，而是另一套設計語言。**
> WP8 的 Turnstile / Pivot / 圓形 App Bar 圖標在 UWP 都不再是預設；UWP 改用
> **漢堡 NavigationView + CommandBar + Page refresh / Drill 轉場 + Semibold 字階**。

---

## 1. 與 WP8 的關鍵差異（實作對照）

| 面向 | WP8（Windows Phone 8） | Windows 10 Mobile（UWP） | 本專案 |
|------|------------------------|--------------------------|--------|
| 導覽 | Pivot 橫滑分頁 + 大型標題 | **NavigationView 漢堡**：左上 ☰，面板自左側滑出（窄螢幕為 **overlay + 煙霧遮罩**） | Win10 demo 有漢堡與滑出面板＋煙霧層 |
| 底部命令 | ApplicationBar：**72px 固定**、**圓形**圖標、標籤按 ⋯ 才顯示 | **CommandBar**：**48px**、圖標＋（展開時）文字標籤、⋯ 展開時**次要命令由下往上滑出** | Win10 demo 兩者皆依官方 |
| 標題字重 | Segoe WP **Light**（很細） | Segoe UI **Semibold** | Win10 demo 標題全部 Semibold |
| 大小寫 | 小寫標題（lowercase pivot） | 官方：**一律 Sentence case** | Win10 demo 為 Sentence case |
| 底色 | `#15121C` 紫黑 | **純黑 `#000000`**；Chrome `#1F1F1F` | Win10 demo 純黑 |
| 強調色 | `#8B5CF6`（本專案） | `#0078D7`（SystemAccentColor） | Win10 demo Windows 藍 |
| 頁面轉場 | **Turnstile**（繞 Y 軸 90°） | **Page refresh**（上滑＋淡入）／**Drill**（深入）／Slide（兄弟頁） | Win10 demo：切分頁用 Page refresh、開詳情用 Drill |

---

## 2. 字階（Type ramp）`[官方]`

來源：[Typography in Windows](https://learn.microsoft.com/en-us/windows/apps/design/style/typography)

| 樣式 | 字重 | 大小／行高 |
|------|------|-----------|
| Caption | Small | 12 / 16 |
| Body | Text（Regular） | 14 / 20 |
| Body strong | Text semibold | 14 / 20 |
| Body large | Text | 18 / 24 |
| Subtitle | Display semibold | 20 / 28 |
| Title | Display semibold | 28 / 36 |
| Title large | Display semibold | 40 / 52 |
| Display | Display semibold | 68 / 92 |

**官方排版規則**

- 最小可讀：**12px Regular / 14px Semibold**，更小在部分語言無法辨識
- **一律 Sentence case**（含標題）——與 WP8 的 lowercase 相反
- 預設**靠左**對齊；置中僅用於圖示下方等少數情況
- 截斷：**以換行處理並避免省略號**；只有容器邊界不明確或有「查看更多」連結時才用省略號
- 強調用 **Semibold**，官方明確排除 Bold 與 Italic（斜體降低可讀性，尤其對閱讀障礙者）
- 每行 50–60 字元最佳，勿少於 20 或超過 60

---

## 3. 頁面轉場 `[官方]`

來源：[Page transitions](https://learn.microsoft.com/en-us/windows/apps/develop/motion/page-transitions)

| 轉場 | 官方用途 | 官方類別 | 本專案 |
|------|----------|----------|--------|
| **Page refresh** | 使用者被帶到**導覽堆疊頂部**（切換分頁／左側導覽項）——要讓使用者感覺「重新開始」。內容**上滑 + 淡入** | `EntranceNavigationTransitionInfo` | 切換左側導覽項時使用（300ms） |
| **Drill** | 使用者**深入 App**（選取項目後顯示更多資訊）——感覺「進到更深一層」 | `DrillInNavigationTransitionInfo` | 首頁點磁貼開詳情時使用（300ms） |
| **Horizontal slide** | 兄弟頁面並排（NavigationView 頂部導覽自動使用） | `SlideNavigationTransitionInfo` | 未實作（本 App 無同層並排頁） |
| Suppress | 不播動畫（自建 connected animation 時用） | `SuppressNavigationTransitionInfo` | — |

補充：`Frame` 預設使用 `NavigationThemeTransition`，**預設即為 Page refresh**。

---

## 4. 元件

| 元件 | 官方要點 | 本專案 |
|------|----------|--------|
| **NavigationView** | 窄螢幕為 LeftMinimal：只顯示漢堡；面板以 **overlay + 煙霧層（smoke）** 覆蓋內容，點煙霧關閉 | ✅ 260dp 面板 + 50% 黑煙霧，點擊關閉 |
| **CommandBar** | 主命令 = 常用動作；平時只顯示圖標，展開後顯示標籤；次要命令置於 ⋯ 內並上滑 | ✅ 4 個主命令 + ⋯，展開時標籤出現、次要命令滑出 |
| **Live Tile** | 強調色實心方塊，可帶角標 | ✅ 強調色方塊（含透明度層次） |
| **Reveal** | 指標／按壓時顯現邊框高亮（行動裝置為按壓觸發） | ✅ 按壓顯示 1px 白色邊框 |

---

## 5. 深色主題色票

| 用途 | 值 |
|------|-----|
| 背景 | `#000000`（純黑） |
| Chrome（CommandBar／面板） | `#1F1F1F` |
| 表面 | `#1A1A1A` |
| 分隔線 | `#3A3A3A` |
| 主文字 | `#FFFFFF` |
| 次文字 | `#99FFFFFF` |
| 強調色 | `#0078D7`（SystemAccentColor 預設） |

---

## 6. 尚未實作（誠實列出）

| 項目 | 官方 | 現況 |
|------|------|------|
| Connected animation | 跨頁面帶動同一個元素（清單項 → 詳情標題） | 未實作 |
| NavigationView 的 LeftCompact / LeftMode 自適應（寬螢幕固定展開面板） | 依視窗寬度切換模式 | 未實作（僅 LeftMinimal overlay） |
| CommandBar 橫向時移到側邊、CommandBar 的 `IsOpen` 焦點管理 | 官方有規定 | 未實作 |
| 摺疊／大屏的 NavigationView 常駐面板 | 官方建議寬螢幕改為常駐 | 未實作 |
| Light 主題 | 官方提供深/淺兩套 | 只做深色 demo |

## 7. 參考出處

- [Typography in Windows](https://learn.microsoft.com/en-us/windows/apps/design/style/typography)（字階、Sentence case、截斷規則、最小字級）
- [Page transitions](https://learn.microsoft.com/en-us/windows/apps/develop/motion/page-transitions)（Page refresh / Drill / Slide / Suppress）
- [Command bar](https://learn.microsoft.com/en-us/windows/apps/design/controls/command-bar)
- [NavigationTransitionInfo](https://learn.microsoft.com/en-us/windows/windows-app-sdk/api/winrt/microsoft.ui.xaml.media.animation.navigationtransitioninfo)
