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
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Store
import hk.senyou.travel.widget.SenyouWidgetProvider
import kotlinx.coroutines.flow.first

/** 背景刷新：K75P + 收藏首條 ETA → 緩存 → 小組件 → 到站提醒 */
class RefreshWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        return try {
            // K75P
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

            // 收藏首條
            val favs = runCatching { Store.favorites(applicationContext).first() }.getOrDefault(emptyList())
            val first = favs.firstOrNull()
            if (first != null) {
                Cache.favMins = runCatching { SearchRepo.favEta(first) }.getOrNull()
                Cache.favLine = when {
                    first.route.isNotBlank() -> first.route
                    first.stationName.isNotBlank() -> first.stationName
                    else -> "收藏"
                }
                notifyIfArriving(applicationContext, Cache.favLine, Cache.favMins)
            } else {
                Cache.favMins = null
                Cache.favLine = ""
            }
            Cache.updatedAt = System.currentTimeMillis()
            SenyouWidgetProvider.refreshAll(applicationContext)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private fun notifyIfArriving(ctx: Context, label: String, mins: Int?) {
        if (mins == null || mins > 3 || label.isBlank()) return
        val intent = Intent(ctx, MainActivity::class.java)
        val pi = PendingIntent.getActivity(
            ctx, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val n = NotificationCompat.Builder(ctx, SenyouApp.CHANNEL_ARRIVAL)
            .setSmallIcon(R.drawable.ic_launcher_fg)
            .setContentTitle("$label 即將到站")
            .setContentText(if (mins <= 0) "已經到站" else "還有 $mins 分鐘")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pi)
            .build()
        runCatching {
            NotificationManagerCompat.from(ctx).notify(label.hashCode(), n)
        }
    }
}
