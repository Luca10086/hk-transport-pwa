# R8 規則：本應用無反射/序列化框架，默認規則已足夠
# 保留 Compose 運行時（AGP 默認已包含 Compose 規則）
-dontwarn org.jetbrains.annotations.**

# ---- 讓崩潰日誌可讀：保留本專案（hk.senyou.travel）的類別與方法名 ----
# 只保留名稱，程式碼仍會被縮減/最佳化；函式庫維持混淆以控制體積。
-keepnames class hk.senyou.travel.** { *; }
-keepattributes SourceFile,LineNumberTable
# 保留原始檔名，崩潰日誌才看得出是哪個檔案

# ---- osmdroid（OpenStreetMap）：內部含反射與資源查找，混淆後易在執行期失敗 ----
-keep class org.osmdroid.** { *; }
-dontwarn org.osmdroid.**

# ---- Compose runtime：ComposableLambda 的槽位查找對「類別合併／方法內聯」極度敏感 ----
# 真實崩潰（5.1.0，Android 16）：java.lang.ClassCastException: java.lang.Boolean cannot be cast to
# androidx.compose.runtime.internal.ComposableLambdaImpl
# mapping.txt 顯示 R8 把 ComposableLambdaKt／SnapshotThreadLocalKt／Utils_jvmKt／Thread_jvmKt
# 合併成同一個類別（V.j），又把 ComposableLambdaImpl.update 內聯進
# rememberComposableLambda（即 V.j.d），並移除了未使用參數。
# 而 ComposableLambdaKt.composableLambda() 內有 `slot as ComposableLambdaImpl`
# （slot = composer.rememberedValue()，movable group 的槽位）。
# 以下規則禁止對這幾個類別做合併與內聯，讓 release 行為與除錯版一致
# （體積影響：單一類別，可忽略）。
-keep class androidx.compose.runtime.internal.ComposableLambda { *; }
-keep class androidx.compose.runtime.internal.ComposableLambdaImpl { *; }
-keep class androidx.compose.runtime.internal.ComposableLambdaKt { *; }
