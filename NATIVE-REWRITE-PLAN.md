# 森友出行 · 全原生重寫計劃（Kotlin + Compose）

> 從 Capacitor WebView 遷移到原生 Android。Web 版（`wp2026.html` / `js/wp2026-app.js` / `css/wp2026.css`）**保留為參考與對照**，遷移期間兩者並存，功能對等後再停用 Web 版。
> 工程根目錄：`native/`　應用 ID：`hk.senyou.travel`

---

## 1. 技術選型

| 層 | 選型 | 說明 |
|----|------|------|
| UI | **Jetpack Compose + Material 3** | 全部界面重寫；Compose 1.7 / BOM 2024.12.01 |
| 語言 | **Kotlin 2.1.0** | Compose Compiler 內建插件 |
| 構建 | AGP 8.7.3 + Gradle 8.11.1 + JDK 21（產出 JVM 17 字節碼） | 與現有 SDK（android-35/36）兼容 |
| 最低版本 | minSdk 26 / targetSdk 35 | Android 8.0+；AGSL 折射需 33+，自動降級 |
| 網絡 | OkHttp + kotlinx.serialization | M2 接入 |
| 持久化 | DataStore Preferences（設定/收藏） | 取代 localStorage |
| 背景 | WorkManager + 通知 | M5 |
| 桌面小組件 | AppWidgetProvider + Glance（可選） | M5 |

## 2. 目錄結構

```
native/app/src/main/java/hk/senyou/travel/
├─ MainActivity.kt              # 入口（edge-to-edge）
├─ ui/
│  ├─ App.kt                    # 根佈局：液體背景 + 頂欄 + 底部導航
│  ├─ LiquidBackground.kt       # 液體背景（Compose Canvas，7 光斑 + 54 星野，30fps）
│  ├─ Glass.kt                  # GlassSurface：填充 + 描邊 + 頂緣反光 + 液態高光
│  ├─ Widgets.kt                # 磁貼 / 搜索欄 / 篩選 chip / 結果行 / K75P 迷你圖
│  ├─ HomeScreen.kt             # 首頁
│  ├─ K75PPage.kt               # K75P 全屏 U 形路線圖（原生 Canvas + 實時巴士）
│  └─ theme/V3.kt               # v3 設計令牌（與 wp2026.css 同源）
├─ data/                        # M2：KMB/CTB/NLB/MTR/LRT/MTR-bus/HKO/Sushiro
│  ├─ api/                      # OkHttp 客戶端 + DTO + 解析
│  ├─ repo/                     # 快取 + 併發（協程）
│  └─ store/                    # DataStore（設定 / 收藏 / 最近搜尋）
├─ domain/                      # M2：模型 + 用例（ETA 排序、K75P 投影、語義色分級）
└─ widget/ + work/ + notify/    # M5：桌面小組件 / 背景刷新 / 到站通知
```

## 3. 里程碑（每個里程碑都產出可安裝 APK）

| M | 內容 | 驗收 |
|---|------|------|
| **M1 ✅** | 工程骨架 + v3 視覺（液體背景 / 玻璃組件 / 語義色 / 首頁磁貼 / K75P U 形頁 / 底部導航） | `app-debug.apk` 可安裝，首頁與 K75P 頁視覺對齊 Web 版 |
| **M2 ✅** | 資料層：KMB/CTB/NLB/MTR/輕鐵/港鐵巴士 路線搜尋 + ETA；搜索結果 / 路線詳情 / 車站詳情 | 搜 69X/969 得到真實 ETA，詳情頁去程/回程分頁 |
| **M3 ✅** | 收藏（DataStore + 按公司分組）+ 天氣（HKO 3 天）+ 壽司郎 + 設定頁（玻璃強度/動效三檔/大字/深夜/夜間三選一） | 與 Web 版功能對等 |
| **M4 ✅** | 真折射：`RenderEffect` 背景模糊（31+）+ **AGSL RuntimeShader 邊緣折射**（33+）+ 玻璃強度 5 級 + 氣泡工具欄收縮 | 真·液態玻璃，滾動 60/120fps |
| **M5 ✅** | 原生加值：桌面小組件（K75P/收藏 ETA）+ 到站通知 + WorkManager 背景刷新 + 觸感反饋；路線圖頁（港鐵各線上下行 + 輕鐵分區） | 鎖屏可見下一班 |
| **M6** | 打磨 + release keystore 簽名 + 與 Web 版並行驗證後停用 Web 版 | release APK |

## 4. 關鍵技術決策

1. **真背景模糊**：背景由我們自繪（`LiquidBackground`），可在玻璃面板區域重繪同一背景並套 `RenderEffect` 模糊 → 真 backdrop blur 而不需要截屏。內容（列表）在玻璃下的模糊採「模糊快照 + 遮罩」策略，成本可控。
2. **AGSL 折射**（Android 13+）：`RuntimeShader` 對背景層做邊緣位移，得到 Web 版做不到的**真折射**；低版本自動退回模糊 + 描邊。
3. **K75P 投影**：沿用 Web 版數學（靜態站座標 + 最近段投影 + 平滑 + 只進不退），Kotlin 重寫為純函數，可單元測試。
4. **語義色/公司色**：與 Web 版同一組色值（`V3.kt`），確保兩版視覺一致。
5. **性能**：Compose 列表用 `LazyColumn` + key；液體背景 30fps；玻璃面板數量按需（大表面才有 RenderEffect）。

## 5. 風險與對策

| 風險 | 對策 |
|------|------|
| 首次構建需下載 AGP/Compose 依賴（數百 MB） | 一次性；已確認 SDK 許可與網絡可用 |
| 真折射在低端機掉幀 | 玻璃強度分級 + 幀率偵測自動降級（沿用 Web 版策略） |
| 功能對等期間兩版分歧 | 以 Web 版為功能基準；每里程碑並行對照 |
| 香港交通 API 無官方 SDK | 沿用 Web 版已驗證的端點與解析規則 |
