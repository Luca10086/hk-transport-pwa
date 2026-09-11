# R8 規則：本應用無反射/序列化框架，默認規則已足夠
# 保留 Compose 運行時（AGP 默認已包含 Compose 規則）
-dontwarn org.jetbrains.annotations.**

# ---- 讓崩潰日誌可讀：保留本專案（hk.senyou.travel）的類別與方法名 ----
# 只保留名稱，程式碼仍會被縮減/最佳化；函式庫維持混淆以控制體積。
-keepnames class hk.senyou.travel.** { *; }
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
