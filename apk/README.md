# 森友出行 · Windows Phone 8 安卓版（APK 工程）

本目录是基于 **Capacitor 7** 的安卓工程骨架，把 WP8 概念版（`../wp8-concept.html`）
打包成正式安卓 APK。**功能与 PWA 完全一致**，界面为严格 WP8 Metro 风格。

## 目录结构

```
apk/
├── package.json            # Capacitor 依赖与脚本
├── capacitor.config.json   # 应用配置（appId: com.senyou.transport）
├── www/                    # Web 资源（打包进 APK 的内容）
│   ├── index.html          # WP8 概念版入口
│   ├── css/wp8-strict.css
│   └── js/ (data/util/api/wp8-concept.js)
└── README.md
```

## 本地构建步骤（在你的电脑上执行）

### ⚡ 方式一：一键脚本（推荐）
**双击 `build-apk.bat`**——脚本会自动：设置 JDK/SDK 环境变量 → 安装依赖 → 生成原生工程 → 同步资源 → 构建 debug APK → 打开产物文件夹。
首次构建会下载 Gradle（约 10~30 分钟），失败就再双击一次（断点续传）。

### 🔧 方式二：手动命令
（需自行设置 `JAVA_HOME`=`C:\Program Files\Android\Android Studio\jbr`、`ANDROID_HOME`=`%LOCALAPPDATA%\Android\Sdk`）

```bash
# 1. 进入 apk 目录
cd apk

# 2. 安装依赖（首次需要几分钟）
npm install

# 3. 生成 Android 原生工程（首次；生成 android/ 目录）
npx cap add android

# 4. 同步 Web 资源到原生工程（每次改了 www/ 后都要执行）
npx cap sync android

# 5a. 用 Android Studio 打开并构建
npx cap open android
#     → 在 Android Studio 中: Build → Build App Bundle(s) / APK(s)

# 5b. 或命令行直接出 debug APK（Windows 在 android/ 目录执行）
cd android
gradlew.bat assembleDebug
#     → 产物: android/app/build/outputs/apk/debug/app-debug.apk
```

### 发布（release）APK 需要额外做
1. **签名 keystore**：Android Studio → Build → Generate Signed App Bundle / APK
   - 新建 keystore（`.jks`），记住密码与别名
2. 构建 release APK / AAB（AAB 用于上架 Google Play，一次性注册费 25 美元）

## 常见问题

| 问题 | 处理 |
|---|---|
| `npx cap add android` 报 SDK 找不到 | 检查 Android Studio 已装 SDK；或 `sdkmanager` 安装 platform-tools |
| Gradle 下载慢 | 修改 `android/build.gradle` 使用国内镜像（阿里云 maven） |
| 应用内网络请求失败 | 数据源（data.gov.hk / etabus / HKO）均支持 CORS，WebView 可直接访问；寿司郎仍需代理（与 PWA 相同限制） |
| 想换图标 | 替换 `android/app/src/main/res/` 下各尺寸 `ic_launcher*`，或用 `@capacitor/assets` 自动生成 |

## 后续开发提示
- 改 UI/功能 → 改 `www/` 下的文件 → `npx cap sync android` → 重新构建
- 要用原生能力（推送 FCM、GPS、绕过 CORS 的 CapacitorHttp）→ 安装对应 Capacitor 插件
- 数据层（`js/data.js` `js/util.js` `js/api.js`）与 PWA 共用，PWA 的修复会自动同步到 APK
