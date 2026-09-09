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

- **單元測試**：`gradlew.bat :app:testDebugUnitTest`（48 項：時間解析 / ETA 文案 / K75P 投影 / 自適應斷點 / 收藏與設定序列化往返 / 搜尋歷史 / 離線緩存 / 崩潰日誌 / 收藏映射 / 通知深鏈分流 / 靜態資料）
- **截圖測試**：同命令輸出 20 張頁面 PNG（`app/build/screenshots/`），含緊湊態、展開態 953×852dp、淺色主題、強調色、收藏頁、港鐵車站詳情、港鐵巴士班次
- **視覺審查**：截圖交給 MiMo v2.5 讀圖審查（模型可讀圖）；可疑處再按原解析度裁剪複核，避免縮圖誤判
- **像素校驗**：腳本掃描截圖左右邊緣亮像素簇，判定是否真有文字被裁切（區分星空裝飾與文字筆畫）
- **Baseline Profile**：APK 內含 `assets/dexopt/baseline.prof`（Compose 自帶 profile，AGP 自動合併）
