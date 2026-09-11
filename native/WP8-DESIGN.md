# 森友出行 · WP8（Metro）設計規範

本文是原生版介面的**唯一設計依據**。所有數值皆對應兩類來源：

1. **微軟官方**（Windows Phone 動效分類、轉場時長、Tilt 公式）——標註 `[官方]`
2. **本專案 PWA 時期定稿的嚴格 WP8 皮膚** `css/wp8-strict.css`——標註 `[本專案]`

---

## 0. 為什麼之前的動畫「不像 WP8」

對照官方文件後找到三個原因：

| 問題 | 之前 | 官方規範 |
|------|------|----------|
| **轉場選錯型** | 詳情頁/K75P 用 `rotateY(-12°) + translateX(26%)`（自己發明的斜滑） | `[官方]` 頁面轉場應用 **Turnstile**：整頁繞 Y 軸 **90°** 轉入，是「重」的、刻意強調發生了一次轉換 |
| **時長太長** | 單程 380ms | `[官方]` **轉場（in + out 合計）總時長 300ms 為上限** |
| **傾斜幅度太小** | 固定 ±10° 線性 | `[官方]` 用 **asin/acos** 公式，邊緣角度大得多（見 §4） |

---

## 1. 動效（Motion）

### 1.1 官方動效分類 `[官方]`

來源：MSDN Magazine《Windows Phone Navigation, Part 2: Advanced Recipes》Figure 1
（Yochay Kiriaty / Jaime Rodriguez，經 Peter Torr 審閱）

| 動畫 | 官方用途 | 方向 | 本專案用法 |
|------|----------|------|-----------|
| **Turnstile** | 從一個空間到另一個空間；**裝置預設**轉場，刻意做得「重」以強調發生了一次轉換 | ForwardIn / ForwardOut / BackwardIn / BackwardOut | K75P 全屏頁、介面規範頁轉入 |
| **Continuum** | 帶連續感的轉場，把上下文從一個空間帶到另一個（像沒離開過） | In / Out | 動效演示頁示範 |
| **Swivel** | 暫時性 UI（對話框）；**不**轉換空間，讓使用者留在同一空間 | ForwardIn/Out、FullScreenIn/Out、BackwardIn/Out | 動效演示頁示範 |
| **Slide** | 暫時性 UI，把內容帶到現有內容之上 | SlideUp/Down/Left/Right + FadeIn/Out | ⋯ 更多選單（由下帶入淡入） |
| **Rotate** | 特定方向與角度旋轉，**多用於螢幕方向** | In/Out 90°/180° 順逆時針 | 動效演示頁示範 |

### 1.2 官方硬性建議 `[官方]`

- **保持轉場快而短**：一段轉場包含「離開」與「進入」兩階段，兩者相加，**300ms 是好的上限**。
- 轉場期間延後 UI 工作（資料綁定、昂貴排版），先完成轉場再填充內容。
- 每種轉場有明確語意，不要混用：頁面跳轉用 Turnstile，暫時性 UI 用 Slide / Swivel。

### 1.3 本專案實作

| 場景 | 動畫 | 時長 | 緩動 |
|------|------|------|------|
| Pivot 分頁切換 | 水平滑動 + 內容視差（16%）＋輕微 rotateY(±9°) | 跟隨手勢 | `cubic-bezier(0.1, 0.9, 0.2, 1)` |
| 全屏頁轉入（K75P / 介面規範） | **Turnstile**：`rotateY 90° → 0`（繞左緣，ForwardIn） | **260ms** | 同上 |
| 詳情頁轉入 | Turnstile（BackwardIn 可選：繞右緣 `-90° → 0`） | 260ms | 同上 |
| ⋯ 更多選單 | **Slide**：`translateY 12dp → 0` + 淡入 | 180ms | 同上 |
| 磁貼翻面（Live Tile） | `rotateY 0 → 180°` | 700ms | 同上 |
| 列表入場（rowIn） | `translateY 12dp → 0` + 淡入，交錯 35ms／項 | 340ms | 同上 |
| 標題切換 | 淡出左移 18dp | 300ms | 同上 |
| 按壓回饋 | 磁貼縮放 0.97、列表 0.98、按鈕 0.90–0.98 | 160ms | 同上 |

緩動曲線 `cubic-bezier(0.1, 0.9, 0.2, 1)` = `Wp8.EaseTurnstile`，即 WP 的 fast-out / slow-in。

---

## 2. 按壓傾斜（Tilt）`[官方]`

來源：MSDN / Peter Torr《Tilt effect for Windows Phone controls》

```
halfWidth  = element.ActualWidth  / 2
halfHeight = element.ActualHeight / 2

xAngle = asin((point.Y - halfHeight) / halfHeight) × 180/π
yAngle = acos((point.X - halfWidth)  / halfWidth)  × 180/π − 90°
```

- 控件再乘 **TiltStrength**（0..1，控制投射幅度）與 **PressStrength**（0..1，控制下壓程度）。
- 本專案：磁貼 `TiltStrength = 0.34`（邊緣約 30°），列表列與按鈕用縮放代替。

---

## 3. 版面與色彩 `[本專案]`

| 令牌 | 值 |
|------|-----|
| 背景 Bg | `#15121C`（高對比：`#000000`） |
| 表面 Surface | `#221D31` |
| 分隔線 Line | `#352E52` |
| 主文字 Text1 | `#FFFFFF` |
| 次文字 Text2 | `#B3A9CE` |
| 強調色 Accent | `#8B5CF6`（另備 藍 `#0078D7`／橙紅 `#D24726`／綠 `#00A300`／紅 `#E51400`） |
| 磁貼純色 | `#5B21B6` `#7C3AED` `#6D28D9` `#4C1D95` |
| ETA 語義色 | 即將 `#E51400`、≤10 分 `#F0A30A`、其餘 `#FFFFFF` |
| 圓角 | **全部 0**（唯一例外：頂欄圓形按鈕、磁貼角標、站點圓點） |
| 邊距 | 手機 24dp；大屏（≥840dp）44dp |
| 磁貼網格 | 4 格制、間距 12dp |
| App Bar | 62dp |
| 進度條 | 3dp |

## 4. 字型

WP8 招牌是 Segoe UI Light 的細體大標題。系統 `FontWeight.Light` **在中文會退回 Regular**（MIUI 更會整組替換字型），因此內嵌：

- Noto Sans CJK TC **Light / Regular**，按應用實際字集子集化（15.6MB → 0.58MB ×2）
- 全域 `LocalTextStyle` 指定此字型家族，`FontWeight.Light` → Light 字面、`Normal/Medium` → Regular 字面

字階：Pivot 標題 46sp Light／分頁標題 27sp Light／磁貼數值 26sp Light／列表 ETA 21sp Light／正文 15sp。

## 5. 動效演示

App 內：**設定 → 介面規範 → 官方動效演示**，可逐項播放 Turnstile / Slide / Swivel / Continuum / Rotate / Tilt / Live Tile 翻面，並顯示官方用途與時長。

## 6. 參考出處

- [MSDN Magazine — Windows Phone Navigation, Part 2: Advanced Recipes](https://learn.microsoft.com/en-us/archive/msdn-magazine/2011/april/msdn-magazine-mobile-matters-windows-phone-navigation-part-2-advanced-recipes)（官方動效分類表、300ms 建議）
- [Tilt effect for Windows Phone controls](https://learn.microsoft.com/en-us/archive/blogs/ptorr/tilt-effect-for-windows-phone-controls)（官方 Tilt 公式）
- [Animating page transitions (HTML)](https://learn.microsoft.com/en-us/previous-versions/windows/apps/jj655417(v=win.10))（enterPage / exitPage 概念）
- 本專案 PWA 時期定稿：`css/wp8-strict.css`、`wp8-concept.html`
