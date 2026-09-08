# WP2026 v3.0 設計概念（三方共研定稿）

> 主工程師 · MiMo v2.5（可行性/性能）· MiMo v2.5-pro（視覺/交互）三方提案與交叉互評後的整合定稿。
> 基線：`DESIGN-WP2026.md`（v2 現狀，唯一權威既有規範）＋ `wp2026-concept.html`。
> 狀態：**概念提案**，按路線圖分階段實施；未實施前 v2 規範繼續生效。

---

## 0. 一句話定位

**v2 是「第一代 Glassmorphism」（靜態磨砂模糊）；v3 =「CSS 可實現的玻璃 2.0」——玻璃從靜態裝飾升級為響應行為的動態表面，同時把清晰度主權交還用戶。**

不追逐 Apple Liquid Glass 的真實折射（WebView 無 WebGL、中端 GPU 不可承受——已有白磁貼 bug 前車之鑑），而是取其「動態透明度 + 氣泡化工具欄 + 高光隨動」的表達，借 Material 3 Expressive 的「語義色 + 彈簧動效」，並以 iOS 27 的可讀性修正為戒：**玻璃必須讓位內容**。

---

## 1. 系統潮流調研摘要

| 潮流 | 核心 | 對 v3 的啟示 | 落地判斷 |
|------|------|------------|----------|
| **Apple Liquid Glass**（iOS 26→iOS 27 修訂，[Wikipedia](https://en.wikipedia.org/wiki/Liquid_Glass)） | 玻璃有生命：高光隨滾動/傾斜流動、折射、透明度隨背景自適應；toolbar 脫框成「氣泡」（Music tab bar 滾動收縮）；**iOS 27 修訂：降默認透明度、增可讀性、新增「清澈↔著色玻璃」用戶滑桿、重繪圖標更易辨認** | ✅ 高光隨動 + 氣泡 toolbar + **玻璃強度用戶可控**（行業共識：玻璃必須有清晰度調節器與可讀性兜底） | 純 CSS/JS 可實現 |
| **Material 3 Expressive**（Android 16，[9to5Google](https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/)） | 表達性/語義色、大膽幾何、彈簧彈性動效、edge-to-edge、個性化 | ✅ 語義色（公司色/ETA 三級）+ overshoot 按壓回彈（`cubic-bezier(.34,1.56,.64,1)`） | 純 CSS 可實現 |
| **Glassmorphism 1.0**（2021 Windows 11 時代，[designmonks](https://www.designmonks.co/blog/liquid-glass-vs-glassmorphism)、[setproduct](https://www.setproduct.com/blog/liquid-glass-vs-glassmorphism)） | 靜態磨砂模糊 | ⚠️ 已被批評「重複過時/依賴背景/對比度難達 WCAG」——v2 現狀正是它 → 必須修正 | 需修正 |
| **可行性警告** | 瀏覽器複刻真實 Liquid Glass（折射/實時光影）需 WebGL/Shader：Safari 會壞、中端 GPU/電池壓力大；玻璃通病：對比不可預測、運動敏感人群不適、認知負荷高 | ❌ 拒絕 WebGL；✅ 性能預算硬性化；✅ 三級動效控制 | 紀律 |

**本產品硬約束（不可破壞）**：中端 Android WebView（backdrop-filter 白磁貼 bug 已踩過、`will-change:filter` 已禁用）；摺疊屏 90px 挖孔；電量 <15% 降級動效；單行省略 / 行高 72 / 磁貼 92–120 / 觸控 ≥40px / 高對比 / 減少動效 / 夜間情境。

---

## 2. v3.0 設計支柱

1. **可調玻璃（Adjustable Glass）** — 玻璃強度定為 5 級滑桿（0=無玻璃 → 4=濃郁），取代 v2 的 boolean 開關。級別 2 = v2 現狀（零回歸）。iOS 27 教訓的落地。
2. **流動高光（Responsive Highlight）** — 流光方向跟隨滾動、按壓瞬間加速掃向觸點、長按生成 60px 徑向微光暈。玻璃「有生命」的 CSS 版。
3. **表達性節奏（Expressive Rhythm）** — 按壓 overshoot 回彈（`.96→1.02→1`）、Sheet 慣性入場、三種語義緩動曲線；語義色三級 ETA + 路線公司色。
4. **清澈優先（Clarity First）** — 每屏語義色 ≤2（收藏頁按公司分組解決多色衝突）；大數字掃讀優先（磁貼數字 48px、行高 1.0）；level 0 純色模式仍是完整可用界面。
5. **性能兜底（Performance Floor）** — 硬性預算：同屏 backdrop-filter ≤6 層、blur ≤48px、同時運行動畫 ≤3、連續 3 幀 >28ms 自動關流光、離屏禁用流光、`will-change` 僅動畫期間。

---

## 3. 演進表（v2 現狀 → v3 方向）

| # | 領域 | v2 現狀 | v3 方向 | 潮流參考 | 工作量 |
|---|------|---------|---------|----------|--------|
| 1 | 玻璃強度 | boolean 開/關 | **5 級滑桿**：`--glass-opacity`(.00/.03/.07/.10/.14)、`--glass-blur`(0/12/26/36/48)、`--glass-sat`(1/1.1/1.4/1.6/1.8)；localStorage 持久化；級別 0 移除全部 backdrop-filter 代以靜態填充 `.12` + 2px 描邊 + 陰影（深色）/ 淺色對應 | iOS 27 清晰度滑桿 | 中 |
| 2 | 滾動響應高光 | 9s 定週期流光，不響應滾動/按壓 | 流光方向跟隨滾動（`--shimmer-dir`，200ms 防抖）；按壓 `.shimmer-fast`（0.4s）；長按觸點微光暈 60px radial-gradient | Liquid Glass 高光隨動（CSS 簡化版） | 中 |
| 3 | 動效曲線 | 統一 `cubic-bezier(.16,1,.3,1)` | 三語義曲線：`--ease-press .34,1.56,.64,1`（按壓回彈）/ `--ease-sheet .05,.7,.1,1`（Sheet 慣性）/ `--ease-subtle`（保持）；磁貼按壓 `.96→1.02→1` 200ms + 峰值 brightness(1.08) | M3 Expressive 彈簧動效 | 低 |
| 4 | ETA 語義色 | soon 紅 / med 橙 / 正常白 | **三級漸進**：<2min 紅 `#FF5252`、<10min 橙 `#FFB74D`、≥10min 綠（新 `#4CAF50`）；顏色 .3s 過渡流動（非跳變）；淺色通道換深變體 `#D32F2F/#E65100/#2E7D32` 保 WCAG | M3 語義色 | 低 |
| 5 | 路線公司色 | badge 全部主題藍 | KMB `#0078D7`/CTB `#FF6B35`(淺色 `#C2410C`)/NLB `#4CAF50`(淺 `#2E7D32`)/MTR `#E91E63`(淺 `#C2185B`)/LRT `#7C4DFF`(淺 `#5E35B1`)；**收藏頁按公司分組**（每組統一色，解決多色同屏） | M3 表達性色彩 | 低 |
| 6 | Toolbar 空間行為 | 固定全寬 100px | **氣泡化收縮**：滾動 >80px → 高 56px、圓角 20、左右 16px、opacity .45、標題 34→20px，280ms spring；回頂彈回。摺疊屏展開態（≥700px）**不氣泡化**保持全寬；僅首頁/內容滾動觸發。實現：scroll-driven animations（`animation-timeline: scroll()` + @supports 檢測）優先，IntersectionObserver 兜底；battery-low 跳過動畫 | iOS 26 Music tab bar 氣泡 | 中 |
| 7 | 大字模式 | 8 級字體，最大 18px | **第 9 級 19.6px**：磁貼數字 56px、行高 80px、ETA 32px、磁貼最小高 108px | WCAG 2.1 文字縮放 | 低 |
| 8 | 夜間/深夜 | 自動 19:00–06:00 | 三選一（跟隨系統/手動/定時）；**深夜模式**（23:00–05:00）：光斑/流光停、數字色溫 `#7FA9CC`、玻璃 saturate(1.2)；手動夜間下可開「深夜增強」子開關 | 使用者主權 | 低 |
| 9 | 大屏/摺疊 | ≥700px 雙欄、2 列磁貼 | ≥700px 磁貼 **3 列**（K75P 磁貼 span 2）、鉸鏈避讓 +12px、Sheet 高度 86%→70%（展開態） | Android 16 edge-to-edge | 低 |
| 10 | 動效三級控制 | 開/關 | **完整/簡約/關閉**：簡約級保留功能脈衝（ETA 換值、Sheet 展開、overshoot press），關閉裝飾動效（流光/光斑/微光暈/呼吸）；完整級全部 | 可達性分層 | 中 |
| 11 | 性能預算 | 無預算（Sheet blur 60px） | 同屏 blur ≤6、blur ≤48px、動畫 ≤3、3 幀 >28ms 關流光、IntersectionObserver 離屏禁用、`will-change` 動畫期間才加 | setproduct 性能優先 | 中 |
| 12 | 降級基石 | 已有 @supports 空白 | 全部玻璃容器加 `@supports not (backdrop-filter)` 兜底：移除模糊、填充 `.15`（深）`.75`（淺）、保留描邊/頂緣反光/對角反光——白磁貼 bug 的治本防線 | WebView 生存 | 低 |

---

## 4. Token 規格（v3 增量）

```css
/* 玻璃強度（5 級） */
--glass-level: 2;                       /* 0-4 · localStorage: wp26_glass */
--glass-opacity: .07;                   /* 0 → .00 · 1 → .03 · 2 → .07 · 3 → .10 · 4 → .14 */
--glass-blur: 26px;                     /* 0/12/26/36/48 */
--glass-sat: 1.4;                       /* 1/1.1/1.4/1.6/1.8 */
/* 語義緩動 */
--ease-press: cubic-bezier(.34,1.56,.64,1);
--ease-sheet: cubic-bezier(.05,.7,.1,1);
--ease-subtle: cubic-bezier(.16,1,.3,1);
/* 語義色（淺色主題覆蓋為深變體） */
--c-info: var(--accent);
--c-success: #4CAF50;   --c-success-strong: #2E7D32;
--c-warning: #FFB74D;   --c-warning-strong: #E65100;
--c-danger: #FF5252;    --c-danger-strong: #D32F2F;
/* 性能預算 */
--max-blur: 48px;  /* Sheet 60px → 48px */
```

動效時長：按壓回彈 200ms / Sheet 開 320ms 關 250ms / 玻璃級別切換 300ms / 氣泡收縮 280ms / 流光掃過 1.2s 週期 12s（v2 9s→12s，A/B 再定）/ 微光暈 200ms+400ms。

---

## 5. 動效清單（新增）

| 名稱 | 觸發 | 細節 |
|------|------|------|
| Shimmer Follow | 滾動 | 流光方向跟隨滾動方向（`--shimmer-dir` 1/-1），200ms 防抖 |
| Press Glow | 按壓磁貼/行/chip | 觸點 60px 徑向微光暈 + 流光加速 0.4s |
| Overshoot Press | 按壓釋放 | `.96 → 1.02 → 1` 200ms 回彈 + 峰值 brightness(1.08) |
| Toolbar Collapse | 滾動 >80px | 全寬 → 56px 氣泡（圓角 20/邊距 16/opacity .45），280ms spring；≥700px 摺疊屏展開態不觸發 |
| Sheet Spring | 開/關/sheet 下拉 | 開 320ms 慣性；關 250ms；下拉 >120px 關閉 + blur 跟隨拖拽衰減 |
| ETA 語義流轉 | ETA 更新 | 顏色 .3s 過渡；升至 danger 閃爍 300ms；恢復 normal 綠色短閃（不錯過「已恢復」） |
| Glass 級別過渡 | 滑桿調整 | 300ms 過渡；級別 0 直接歸零（不帶過渡，防白磁貼 bug） |
| Live Tile 呼吸（P2） | 實時磁貼每 5s | 背景微亮 0.15s，**±1.5s 隨機 offset 錯開**（防同步閃爍）；僅 fx 完整級 |

---

## 6. 新特性

1. **玻璃強度滑桿**（設定 → 外觀首行，5 級 segmented）；P2：長按 toolbar 2s 快捷切換（不做下拉，避免與下拉刷新衝突）。
2. **收藏頁公司分組**：KMB/CTB/NLB/MTR/LRT 分組頭 + 組內公司色 badge——同時解決語義色多色衝突與掃讀。
3. **大字模式**（第 9 級字體 + 磁貼/行等比放大）。
4. **深夜模式**（23:00–05:00 自動或手動開啟：動效停 + 冷色溫數字）。
5. **夜間三選一**（跟隨系統/手動/定時）。

---

## 7. 風險與緩解

| 風險 | 緩解 |
|------|------|
| 玻璃級別 0 下容器與背景融為一體 | 靜態 `.12` 填充 + 2px 描邊 + 陰影（淺色 `.06`/1px），層次靠描邊陰影不靠模糊 |
| 語義色對比度（深色底/淺色底） | 上線前逐色對比度檢查；淺色通道換深變體；high-contrast 統一白字 + accent 底 |
| 氣泡 toolbar 滾動 jank | scroll-driven animations 優先（合成器線程）；IO 兜底；battery-low 無過渡 |
| 舊 WebView 不支持 CSS 自屬性 | `@supports (--x:1)` 回退 v2 硬編碼；滑桿不支持時隱藏、保留 boolean 開關 |
| 呼吸微動效同步閃爍 | 隨機 ±1.5s offset；簡約級關閉 |
| 動效過載 | 簡約級保留 4 核心（overshoot/collapse/sheet/shimmer-follow），其餘歸裝飾 |
| 遷移回歸 | 級別 2 = v2 現狀；每階段以 uiux-review 覆核 |

---

## 8. 實施路線

- **Phase 1（低風險高收益）**：#1 玻璃 5 級滑桿 + #3 語義曲線/overshoot + #4 ETA 三級 + #5 公司色/收藏分組 + #11 性能預算（Sheet 60→48）+ #12 @supports 兜底
- **Phase 2**：#2 Shimmer Follow/Press Glow + #6 氣泡 toolbar + #7 大字模式 + #8 夜間三選一/深夜模式 + #10 三級動效
- **Phase 3（P2）**：#9 大屏 3 列磁貼微調 + 長按快捷切換 + Live Tile 呼吸 + 流光週期 A/B（9/11/12/14s）

---

## 9. 三方結論

- **MiMo v2.5（可行性）**：全程 CSS/JS 零依賴，估 3–4 天；強調性能預算與級別 0 的原子化兜底。
- **MiMo v2.5-pro（設計）**：從「華麗展示」走向「智慧克制」——玻璃讓位內容、語義色補全掃讀、深夜/大字/夜間三選一的用戶主權。
- **主工程師裁決**：採納全部 12 項演進，修正 4 處——①玻璃級別定 5 級（非三檔）；②自適應透明度不跑 runtime 亮度計算（由 data-mood 映射）；③Live Activity 全局橫幅降級為收藏頁分組 + 磁貼呼吸（避免與氣泡 toolbar 衝突）；④流光週期 9s→12s 待 A/B（非直接 14s）。
