package hk.senyou.travel.data

/** 調試/測試開關（生產環境恆為 false）：離線 + 靜態 UI（關閉無限動畫，供截圖測試） */
object DebugFlags {
    @Volatile var offline = false
    @Volatile var staticUi = false
}
