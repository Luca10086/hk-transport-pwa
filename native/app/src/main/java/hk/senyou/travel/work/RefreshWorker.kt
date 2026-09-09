package hk.senyou.travel.work

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import hk.senyou.travel.MainActivity
import hk.senyou.travel.R
import hk.senyou.travel.SenyouApp
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.Cache
import hk.senyou.travel.data.Fav
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Store
import hk.senyou.travel.widget.SenyouWidgetProvider
import kotlinx.coroutines.flow.first

/**
 * 背景刷新：K75P + 全部收藏 ETA → 離線緩存 → 小組件 → 逐條到站提醒。
 * 每 30 分鐘執行一次（Android WorkManager 最小值 15 分鐘）。
 */
class RefreshWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        return try {
            refreshK75P()
            refreshFavorites()
            Cache.updatedAt = System.currentTimeMillis()
            SenyouWidgetProvider.refreshAll(applicationContext)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private suspend fun refreshK75P() {
        val d = Api.mtrBusSchedule("K75P")
        val arr = d?.optJSONArray("busStop")
        var best: Int? = null
        var live = 0
        if (arr != null) {
            for (i in 0 until arr.length()) {
                val buses = arr.optJSONObject(i)?.optJSONArray("bus") ?: continue
                for (j in 0 until buses.length()) {
                    val b = buses.optJSONObject(j) ?: continue
                    val sec = b.optInt("arrivalTimeInSecond", 0)
                    if (sec in 1 until 108000) {
                        val m = (sec + 59) / 60
                        if (best == null || m < best) best = m
                    }
                    val loc = b.optJSONObject("busLocation")
                    if (loc != null && loc.optDouble("latitude", 0.0) != 0.0) live++
                }
            }
        }
        Cache.k75pMins = best
        Cache.k75pLive = live
    }

    /** 刷新每條收藏的 ETA：寫入離線緩存 + 按各自門檻發到站提醒 */
    private suspend fun refreshFavorites() {
        val favs = runCatching { Store.favorites(applicationContext).first() }.getOrDefault(emptyList())
        if (favs.isEmpty()) {
            Cache.favLine = ""
            Cache.favMins = null
            return
        }
        val now = System.currentTimeMillis()
        favs.take(12).forEach { f ->
            val mins = runCatching { SearchRepo.favEta(f) }.getOrNull() ?: return@forEach
            Cache.putEtaCache(f.key, mins)
            if (f.alertMins > 0 && mins <= f.alertMins && now - Cache.alertSentAt(f.key) > 15 * 60_000) {
                notifyArrival(f, mins)
                Cache.markAlertSent(f.key)
            }
        }
        // 小組件顯示首條收藏
        val first = favs.first()
        Cache.favLine = labelOf(first)
        Cache.favMins = Cache.etaCache(first.key)?.first
    }

    private fun labelOf(f: Fav): String = when {
        f.route.isNotBlank() -> f.route
        f.stationName.isNotBlank() -> f.stationName
        f.stopName.isNotBlank() -> f.stopName
        else -> "收藏"
    }

    private fun notifyArrival(f: Fav, mins: Int) {
        val label = labelOf(f)
        val intent = Intent(applicationContext, MainActivity::class.java).apply {
            putExtra("deep_link_route", f.route)
            putExtra("deep_link_company", f.company)
            putExtra("deep_link_dir", f.dir)
            putExtra("deep_link_stop", f.stopId ?: "")
        }
        val pi = PendingIntent.getActivity(
            applicationContext, label.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val n = NotificationCompat.Builder(applicationContext, SenyouApp.CHANNEL_ARRIVAL)
            .setSmallIcon(R.drawable.ic_launcher_fg)
            .setContentTitle("$label 即將到站")
            .setContentText(if (mins <= 0) "已經到站" else "還有 $mins 分鐘")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pi)
            .build()
        runCatching {
            NotificationManagerCompat.from(applicationContext).notify(f.key.hashCode(), n)
        }
    }
}
