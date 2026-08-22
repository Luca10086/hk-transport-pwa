# Windows 10 (UWP / Fluent) 應用風格 · 分析與歸納

資料來源（2026 檢索）：
- SitePoint「Introducing Microsoft's Fluent Design System」：
  https://www.sitepoint.com/introducing-microsofts-fluent-design-system/
- UWP Design Guidelines（字體/字重/間距/色系統）：
  https://mrl.cs.vsb.cz/people/fabian/uro/UWPguidelines.pdf
- Wikipedia「Universal Windows Platform apps」：
  https://en.wikipedia.org/api/rest_v1/page/pdf/Universal_Windows_Platform_apps
- 微軟官方 UWP 樣本庫（本報告附錄的實證來源）：
  https://github.com/microsoft/Windows-universal-samples

---

## 一、UWP（Fluent Design System）的本質：Metro 的「材質化進化」

WP8 Metro 是「紙上的字」：純色、硬邊、無陰影。
UWP 把它變成「真實光線下的材料」：同一個「內容優先」內核，加上
**光**（統一光源）、**材質**（Acrylic 玻璃）、**運動**（連接動畫）。

### 1. 五個支柱（五大核心動詞）
1. **Light（光）**：光源統一來自左上（northwest light）；Reveal 效果讓邊緣
   在滑鼠/觸摸時「亮起」——互動即揭示。
2. **Depth（深度）**：不同層級的陰影；卡片/彈層/導航各有細微陰影與 4px 圓角。
3. **Motion（運動）**：元素入場（entrance）、連接動畫（connected animation）、
   展開/收縮平滑過渡；拖拽慣性跟手。
4. **Material（材質）**：Acrylic（半透明模糊玻璃）用於導航欄/標題欄/側欄；
   表面材質 Surface（圓角卡片、1px 邊框、極淡底色）。
5. **Scale（縮放/響應）**：同一控件自適應不同尺寸設備（手機→平板→桌面）。

### 2. 導航：NavigationView
- UWP 應用的標準骨架 = **左側（或頂部）NavigationView**：圖標 + 文字項，
  可折疊成「漢堡」；內容區在右側。
- 取代 WP8 的 Pivot/Panorama；但 Pivot 仍保留用於「同層內容切換」
  （郵件、設定、通用應用）。

### 3. CommandBar
- 取代 WP8 App Bar：**圖標 + 可選文字標籤**的按鈕列，置頂或置底；
  次要操作收進「⋯」溢出選單。按鈕有 4px 圓角與 hover 高亮。

### 4. 排版（Typography 系統）
- Segoe UI；文字樣式等級：
  Display 68 / Headline 40 / **Title 26** / **Subtitle 22** /
  **Body 15** / **Caption 12**。
- 字重：Light 300（大標題）、SemiBold 600（強調/導航選中）、Regular 400。
- 標題**不再全小寫**；首字母大寫常規書寫。

### 5. 控件語法
| 控件 | 樣式 |
|---|---|
| TextBox | 底部下劃線（Win10 初期）或 2px 圓角框（Win11），focus 時 accent 指示條 |
| ToggleSwitch | 矩形軌 + **圓形滑子**，ON = accent 填充 |
| ListView | hover/按下高亮（約 8% 白/黑），選中項 = accent 左邊條或整行淡底色；無分隔線 |
| Button | 4px 圓角，hover 微亮、按下微降 |
| 卡片 | Surface：1px 邊框 + 極淡背景 + 細陰影 + 4px 圓角 |

### 6. 色彩
- 依舊**單一 accent**（系統色板），但界面自帶中性灰階多級表面：
  深色 #202020 / 淺色 #F3F3F3；表面層級靠明度差而非線條。
- 狀態色（成功/警示/錯誤）僅在需要處出現（紅 #C42B1C、琥珀 #F7630C、綠 #107C10）。

---

## 二、對比：WP8 Metro vs WP10 UWP（快速對照）

| 維度 | WP8 Metro | WP10 UWP/Fluent |
|---|---|---|
| 材料 | 純色扁平，無材料 | Acrylic 玻璃、Surface 卡片、1px 邊框、細陰影 |
| 光 | 無 | 統一左上光源、Reveal 邊緣光暈 |
| 圓角 | 0（直角） | 4px（控件/卡片） |
| 標題 | 42px Light 全小寫 | Title 26 SemiBold 常規書寫 |
| 導航 | Pivot 橫滑 + App Bar 裸字形 | NavigationView 側欄 + CommandBar（帶標籤） |
| 列表 | 扁平行，留白分組 | ListView：hover 高亮、選中 accent 條 |
| 開關 | Duplex 矩形滑子 | ToggleSwitch 圓形滑子 |
| 動效 | 右推入+淡入 | entrance / connected / 展開收縮 |

---

## 三、對當前應用的 UWP 化改進方向（概念圖對應）

1. **丙烯酸層**：頂欄與 App Bar 用半透明模糊（backdrop-filter blur 18px + 半透明底色），
   內容滾動時從欄後透出 → 真正 UWP 質感。
2. **字重層級**：標題 Title 26 SemiBold、正文 Body 15、輔助 Caption 12；
   強讀數保留 42–60px Light（UWP 大數字 = Display 級）。
3. **導航混合**：保留 Pivot（同層切換），但把頂欄做成 CommandBar 式
   （⌕ ↻ 加 4px 圓角 + hover 高亮）；設定頁改用 NavigationView 式分組標題。
4. **列表**：ListView 化——行 hover/按下高亮（rgba 8%）、選中行 accent 左邊條；
   去分隔線（已去）。
5. **卡片/表面**：收藏卡、天氣條、警告條改 Surface 卡片
   （1px rgba 邊框 + 4px 圓角 + 細陰影）。
6. **控件**：設定開關改 ToggleSwitch（圓形滑子）；Seg 選項 4px 圓角。
7. **動效**：加 entrance 淡入上移（已有 rowIn 類似）、詳情頁 connected 概念
   （標題從來源行「長」出來——現版已有推入，加標題位移即可）。

概念圖見 `design-concept-board-uwp.html`（6 屏）。若確認方向，可做成
**第三套皮膚** `body[data-ui="uwp"]`（與 WP7/WP8 並存於設定切換）。

---

## 四、附錄：微軟官方樣本庫實證（Windows-universal-samples）

來源：https://github.com/microsoft/Windows-universal-samples （248 個樣本）

筆者直接檢索了樣本庫索引與原始碼，以下推論均有官方樣本代碼佐證：

### 4.1 XamlListView（列表與詳情模式）
`Samples/XamlListView` 官方場景即包含我們概念圖的所有關鍵模式：
- **Scenario3_MasterDetail** —— Master-Detail（主列表 + 詳情）是官方一級場景；
  對應我們「收藏列表 → 換站/全線候車」的構思。
  - `Page.Transitions → EntranceThemeTransition`：**入場動畫是官方標準頁面轉場**。
  - `Page.BottomAppBar → CommandBar`，按鈕寫法：
    `AppBarButton Label="Add Item" Icon="Add"` 與
    `FontIcon FontFamily="Segoe MDL2 Assets" Glyph="&#xe762;"` ——
    證實 **CommandBar = 圖標（MDL2 字形）+ 文字標籤**，非 WP8 裸字形。
  - ListView 行模板：32px 圓形頭像 + `BaseTextBlockStyle`（主題文字樣式）兩行文本；
    並用 `x:Phase="1"` **分段渲染**優化長列表。
- **Scenario4_EdgeTappedListView、GroupInfoList、RestoreScrollPosition** ——
  列表還具備：邊緣點按、**分組**（對應我們「九巴/城巴」分組標題）、滾動位置還原。

### 4.2 XamlNavigation（導航）
樣本 `README.md` 明確寫道：
> This sample has been superseded by the NavigationView section of the
> UI Basics sample. （fwlink 619902）

即導航標準答案 = **NavigationView**，由 UI Basics 樣本持續維護；
與本報告第一節的「NavigationView 取代 Pivot」結論一致。

### 4.3 對我們應用直接可取的官方細節
1. 詳情頁加入場動畫（等價 EntranceThemeTransition 的淡入上移；我們已有 rowIn，保留）。
2. CommandBar 按鈕 = 圖標 + 標籤（我們底部列可加標籤文字）。
3. 列表行模板用「頭像/徽標 + 兩行文本」（我們是「路線號 + 名稱 + 輔助」）。
4. 分段渲染 x:Phase 思想 → 我們長列表分批渲染（詳情頁已按 5 站一批，同理念）。
5. NavigationView 僅在「多區塊資訊架構」時使用；本 App 仍以 Pivot 為骨幹是合理的。
