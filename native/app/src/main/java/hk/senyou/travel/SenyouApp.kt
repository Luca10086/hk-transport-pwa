package hk.senyou.travel

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.work.Configuration
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import hk.senyou.travel.data.AppCtx
import hk.senyou.travel.data.CrashLog
import hk.senyou.travel.work.RefreshWorker
import java.util.concurrent.TimeUnit

class SenyouApp : Application(), Configuration.Provider {
    override fun onCreate() {
        super.onCreate()
        AppCtx.set(this)
        CrashLog.install(this)
        ensureChannel()
        // 背景刷新：每 30 分鐘（WorkManager 最小值 15 分鐘）
        runCatching {
            val req = PeriodicWorkRequestBuilder<RefreshWorker>(30, TimeUnit.MINUTES)
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            WorkManager.getInstance(this)
                .enqueueUniquePeriodicWork("senyou_refresh", ExistingPeriodicWorkPolicy.KEEP, req)
        }
    }

    /** 按需初始化（也讓 JVM 測試環境可用） */
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder().setMinimumLoggingLevel(android.util.Log.INFO).build()

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val mgr = getSystemService(NotificationManager::class.java) ?: return
        val ch = NotificationChannel(
            CHANNEL_ARRIVAL,
            "到站提醒",
            NotificationManager.IMPORTANCE_HIGH,
        ).apply { description = "收藏班次即將到站時提醒" }
        mgr.createNotificationChannel(ch)
    }

    companion object {
        const val CHANNEL_ARRIVAL = "senyou_arrival"
    }
}
