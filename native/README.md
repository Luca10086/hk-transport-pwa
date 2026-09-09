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

## 自測與驗證

- **單元測試**：`gradlew.bat :app:testDebugUnitTest`（12 項：時間解析 / K75P 投影 / 自適應斷點 / 靜態資料）
- **截圖測試**：同命令輸出 18 張頁面 PNG（`app/build/screenshots/`），含緊湊態、展開態 953×852dp、淺色主題、強調色、收藏頁
- **視覺審查**：截圖交給 MiMo v2.5 讀圖審查（模型可讀圖）
- **Baseline Profile**：APK 內含 `assets/dexopt/baseline.prof`（Compose 自帶 profile，AGP 自動合併）
