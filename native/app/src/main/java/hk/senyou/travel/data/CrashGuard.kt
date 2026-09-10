package hk.senyou.travel.data

import android.content.Context

/**
 * 閃退守護。
 *
 * 真機回報「一天閃退 5 次」，而模擬器/截圖測試無法重現，因此在應用內加一層自保：
 * - 啟動時若偵測到「上次啟動沒有正常結束」，累計失敗次數；
 * - 連續 2 次異常 → 自動開啟安全模式（關閉玻璃與動效，改用最樸素的繪製路徑）；
 * - 啟動後穩定運行 12 秒即視為成功，清空計數；
 * - 使用者可在「設定 → 診斷」手動關閉安全模式。
 */
object CrashGuard {

    private const val FILE = "senyou_guard"

    private fun prefs(ctx: Context) = ctx.applicationContext.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    /** 在 Application.onCreate 呼叫：結算上一次啟動是否異常結束 */
    fun onAppCreate(ctx: Context) {
        runCatching {
            val p = prefs(ctx)
            val incomplete = p.getBoolean("launch_incomplete", false)
            val streak = if (incomplete) p.getInt("crash_streak", 0) + 1 else 0
            val safe = p.getBoolean("safe_mode", false) || streak >= 2
            p.edit()
                .putBoolean("launch_incomplete", true)
                .putInt("crash_streak", streak)
                .putBoolean("safe_mode", safe)
                .apply()
        }
    }

    /** 啟動後穩定運行一段時間 → 本次啟動成功 */
    fun onHealthy(ctx: Context) {
        runCatching {
            prefs(ctx).edit().putBoolean("launch_incomplete", false).putInt("crash_streak", 0).apply()
        }
    }

    fun isSafeMode(ctx: Context): Boolean = runCatching { prefs(ctx).getBoolean("safe_mode", false) }.getOrDefault(false)

    fun setSafeMode(ctx: Context, on: Boolean) {
        runCatching { prefs(ctx).edit().putBoolean("safe_mode", on).apply() }
    }

    fun crashStreak(ctx: Context): Int = runCatching { prefs(ctx).getInt("crash_streak", 0) }.getOrDefault(0)
}
