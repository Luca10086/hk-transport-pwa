# 森友出行 · 上市準備度報告（2026-09）

> 方法：**4 個獨立 agent 並行審查** —— 1× **MiMo v2.5**（視覺，唯一具圖像能力者）
> ＋ 3× **MiMo v2.5 Pro**（商店／平台合規、產品與市場、工程與發佈品質）。
> 每條結論都要求引用檔案／行號／截圖檔名。**本報告另含我逐條複核的結果與更正**：
> 評審有 3 條經查證不成立（見第 5 節），已標明。
> 審查基準：4.8.1；本報告同時記錄 4.9.0 已修項目。

---

## 1. 總體判定

| 評審 | 判定 |
|---|---|
| 視覺工藝 | 「以業餘專案而言意外地一致且有工藝感」——W10M 語言是**真實的設計識別**，非雜亂拼貼；但**不像可上架的產品** |
| 商店合規 | **不可上架**：多個硬阻礙會導致 Play 審查拒絕或上架後被政策處置 |
| 產品與市場 | 「工程紮實的業餘專案，具真實深度」；要成為有競爭力的通勤 App 仍缺多項核心能力 |
| 工程與發佈 | **NOT SHIPPABLE**：缺 CI、簽章管理、前景服務、模組化；最大原始檔 1,268 行 |

**一句話**：技術底子遠超「小作坊」，但**上市所需的「法務／政策／在地化／可觀測性／工程流程」這五塊幾乎是空白** —— 這正是「小作坊感」的真正來源，而不是畫面。

---

## 2. 4.9.0 已修（本輪直接動手，皆經編譯與 86 項測試驗證）

| # | 項目 | 為何是上市阻礙 |
|---|---|---|
| 1 | **移除 `USE_EXACT_ALARM`** | Play 僅允許鬧鐘／日曆類 App 使用；交通 App 申請會被拒。改為既有 `SCHEDULE_EXACT_ALARM` ＋ 執行期引導（程式已有 `canScheduleExact` / `requestExactPermission` 與設定頁入口） |
| 2 | **開發者畫面只在 debug 可見** | WP8 元件畫廊（含「pivot title · 46sp Light」等規格註解）與 Win10 演示原本**隨正式版出貨且可從 ⋯ 選單開啟** —— 審查員一看就判定「未完成品／測試內容」。現以 `BuildConfig.DEBUG` 閘門封住（⋯ 選單與設定頁兩處） |
| 3 | **法遵標註補齊** | 地圖加「© OpenStreetMap contributors」（ODbL **法定**要求）、設定頁新增「地圖資料／天氣資料（香港天文台）／授權（data.gov.hk 開放數據）」三列 |
| 4 | **User-Agent 版本改由 `BuildConfig.VERSION_NAME` 產生** | 原本硬編碼 `SenyouTravel/3.0`（Http）與 `/4.0`（AiRepo），實際版本 4.9.0 —— 伺服器端分析與速率限制看到錯誤身分 |
| 5 | **備份排除** | `allowBackup=true` 且無規則 → 使用者填的 **AI API 金鑰**會進 Google 自動備份。新增 `backup_rules.xml` + `data_extraction_rules.xml`，排除 DataStore 與圖磚快取 |
| 6 | **港鐵班表時間固定 `Asia/Hong_Kong`** | 原本 `ZoneId.systemDefault()`：旅客手機時區非 HK 時，港鐵／輕鐵 ETA 會整體偏移 |
| 7 | **產出 AAB** | Play 自 2021 起要求新 App 用 AAB；本輪起 `bundleRelease` 已可產出（5.94 MB） |

**驗證**：`:app:testDebugUnitTest :app:assembleRelease :app:bundleRelease --rerun-tasks` → BUILD SUCCESSFUL（90 任務）；86 項測試 0 失敗；APK 3.62 MB／AAB 5.94 MB。

---

## 3. 仍待處理的上市阻礙（依嚴重度）

### 3.1 必須在送審前完成

| 項目 | 現況與證據 | 工量 |
|---|---|---|
| **隱私政策** | 全樹 grep 無任何 privacy 頁面／連結／URL；但 App 儲存 AI 金鑰、收藏、搜尋歷史、崩潰日誌。Play 要求隱私政策 URL 並填 Data safety | 天 |
| **NotificationListenerService 的 Permissions Declaration** | `NowPlayingListener` 用通知存取權讀取媒體工作階段。Play 對此為敏感權限，需專門宣告且**常被拒**；交通 App 讀其他 App 的媒體資訊，理由書極難通過 | 天 |
| **OSM 圖磚政策** | 目前直連 `tile.openstreetmap.org`。OSM 政策明文禁止「散布式 App 的大量取用」；使用者一多會被封 IP、地圖全黑 | 天 |
| **無前景服務的鬧鐘** | `AlarmReceiver` 由廣播啟動震動與通知，但無前景服務；Android 12+ 可能在數秒內终止背景工作，響鈴可靠性無保證 | 小時 |
| **`USE_FULL_SCREEN_INTENT` 無引導** | Android 14+ 需使用者同意；程式只在發通知時檢查，首次響鈴可能無法全螢幕顯示 | 小時 |
| **無在地化（僅繁體中文）** | `strings.xml` 只有 `app_name`，全部文字硬寫在 Kotlin。香港是雙語城市，英文為基本期待 | 週 |

### 3.2 品質與一致性

- **可觀測性**：只有本機崩潰日誌，無任何遠端回報。Play Console 的 Android Vitals 對「從 Play 安裝」的 App 會自動收集崩潰／ANR（無需 SDK）——**這其實已足夠看到崩潰率**，但無法還原使用者操作脈絡。建議至少接 Play Vitals 並在崩潰日誌中加「最近操作」環形緩衝。
- **錯誤處理一致性**：`runCatching` 使用 40+ 處且**全部不記錄**，程式錯誤會被靜默吞掉。建議改為 `safe(tag){}` 包裝並寫入日誌。
- **無障礙**：僅 5 處 `contentDescription`；大量可點元素（磁貼、列、按鈕、chips、搜尋／重新整理／關閉）缺少標籤。
- **狀態管理**：`Wp8` 單例上有多個 `mutableStateOf` 全域（light / contrast / accentIndex / reduceMotion / Gutter），由 composition 直接寫入，繞過狀態提升，難以隔離測試。
- **檔案規模**：`Panes.kt` 1,268 行（5 個分頁混在一起）、`Wp8K75P.kt` 841、`StandbyScreen.kt` 744、`App.kt` 675、`SearchRepo.kt` 615、`Wp8.kt` 596 → 建議拆分（純檔案重排，風險低）。
- **`DebugFlags` 生產可寫**：`@Volatile var offline/staticUi` 為公開可變欄位，無 `BuildConfig.DEBUG` 閘門。
- **R8 規則過寬**：`-keep class org.osmdroid.** { *; }` 讓整個函式庫不做樹搖；應收窄到確有反射的類別（並以 release 建置驗證）。

### 3.3 產品缺口（對比 MTR Mobile／KMB／Citybus／Moovit）

- **沒有「附近車站」**（無定位權限、無 LocationManager；已有 Haversine 可重用）
- **沒有車費、沒有巴士首尾班、沒有服務時間**（港鐵站已有首尾班；九巴 `route` API 無服務時間欄位，需另尋資料源）
- **沒有路線改道／事故通知**（KMB／CTB／MTR 皆有服務狀態可接）
- **ETA 的「—」不區分「收車／無資料／載入中／錯誤」**
- **無旅程規劃、無轉乘建議**
- **小工具 30 分鐘才更新**，對「實時」而言過時
- **首次啟動無引導**：新使用者看到一牆磁貼與「—」，不知從何開始
- **W10M 風格是雙面刃**：建議保留為預設，但提供「標準（Material）」主題選項，兼顧識別性與主流習慣

---

## 4. 測試與發佈工程

- 86 項測試**全為 Robolectric JVM 測試**，無 `androidTest/`（無真機測試）：無法覆蓋真實 GPU、網路、摺疊姿態、權限流程
- 完全無測試：`AiRepo`、`Hko`、`Http`、`AlertScheduler`、`NowPlaying`
- 截圖測試以 `staticUi + offline` 渲染 → **只覆蓋「離線空資料」狀態**，且曾誤導本次視覺審查（見第 5 節）。建議：在截圖測試注入代表性假資料，讓「有資料」的版面也納入回歸
- 建議裝置測試矩陣：SDK 26（minSdk）／29（分區儲存）／31（精確鬧鐘）／34（現行 target）＋ 一台摺疊機

---

## 5. 對評審結論的複核與更正（重要）

| 評審主張 | 複核結果 |
|---|---|
| 視覺：「待機鬧鐘仍是 `GOOD MORNING` 琥珀色 + `stop`/`snooze` 英文膠囊」 | **不成立** —— 該 agent 讀到的是 `native/out/wp8-app-preview/` 的**過期預覽圖**（11:47），目前建置為 12:42。對現行截圖做像素取樣：**琥珀色 0 個、強調藍 #0078D7 593 個**，早已是 W10M 版 |
| 視覺：「首頁全是 —、天氣三天全 dash」 | **部分不成立** —— 截圖測試是 `staticUi + offline` 的**離線空資料狀態**，屬測試假象。但其延伸觀察（**離線時只有一個破折號、無任何說明**）是真問題 |
| 產品：「輕鐵分組 401–424、551–559 落空」 | **不成立** —— 讀 `assets/static.json`：全 68 站中**該兩區間沒有任何車站**；`AuditGuardTest` 亦已斷言「每站恰好一個分組、無漏無重」 |
| 工程：「無 baseline profile」 | **部分不成立** —— APK 內已含 `baseline.prof` / `baseline.profm`（Compose 函式庫提供），缺的只是**專案自有**的 baseline profile |
| 工程：**blocker**「簽章密碼明文進版控」 | **已降級** —— `git ls-files` 0 筆、`git log --all` 0 次提交、`check-ignore` 確認 `native/.gitignore` 已排除。檔案僅存在本機（正常），但 CI 仍應改用 secret |
| 合規／產品：`USE_EXACT_ALARM` 會被 Play 拒 | **成立**（已於 4.9.0 移除） |
| 合規：OSM 圖磚政策與 ODbL 標註 | **成立**（標註已於 4.9.0 補上；圖磚來源仍待處理） |

> 這節存在的理由：上一輪評審也曾出現「誤報」，本輪再現 3 條。
> **凡評審結論我都會在程式碼或像素層複核後才採用**，不會直接轉述。

---

## 6. 建議路線

**階段 A（送審前必做，約 1–2 週）**
1. 隱私政策頁 + Play Data safety 填寫
2. NotificationListener 的替代方案評估（改走 `MediaSessionManager` 直取，或移除並在商店說明中放棄此功能）
3. 自架圖磚快取／改用商用圖磚（含 `© OpenStreetMap contributors` 已完成的基礎上）
4. 鬧鐘前景服務 + `USE_FULL_SCREEN_INTENT` 引導
5. 英文在地化（`strings.xml` 抽取 + `values-en/`）
6. GitHub Actions：lint → test → `bundleRelease` → 上傳產物

**階段 B（品質，約 2–3 週）**
7. 拆檔（`Panes.kt` → 5 檔；`StandbyScreen` 四面向分檔；`Wp8` 令牌與元件分離）
8. `Wp8` 全域可變狀態 → `CompositionLocal` 主題狀態
9. `safe(tag){}` 日誌包裝，取代裸 `runCatching`
10. 補 `AiRepo`／`Hko`／`AlertScheduler`／`NowPlaying` 測試；截圖測試注入假資料；加 `androidTest/` 真機測試
11. 無障礙：補齊 `contentDescription`；字級縮放與對比度檢核

**階段 C（產品力，約 4–6 週）**
12. 附近車站（定位權限 + 既有 Haversine）
13. 車費、巴士首尾班、服務時間、路線改道通知
14. 旅程規劃／轉乘建議
15. 首次啟動引導；「標準主題」選項；小工具縮短更新

---

## 7. 邊界說明

- 本輪審查**未執行任何建置或測試**（審查者被要求唯讀）；4.9.0 的驗證由我執行
- 無真機／模擬器：摺疊姿態、權限流程、震動、全螢幕通知、圖磚載入皆未實測
- Play 政策屬會變動的外部規則，本報告依 2026-09 已知規定判斷，送審前應再核對
