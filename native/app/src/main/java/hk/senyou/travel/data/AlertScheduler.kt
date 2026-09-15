package hk.senyou.travel.data

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import hk.senyou.travel.MainActivity
import hk.senyou.travel.R
import hk.senyou.travel.SenyouApp
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * 到站提醒的**精確排程**。
 *
 * 為什麼要另開一條路：WorkManager 週期最短 15 分鐘，但使用者可選的提醒門檻是 3／5／10 分鐘 ——
 * 用背景 worker 檢查幾乎永遠碰不上門檻，提醒等於不會響。
 * 因此改成 AlarmManager 的**精確鬧鐘鏈**：每次觸發後自己再排下一次（[STEP_MS] 之後），
 * 只在「有任何收藏開啟提醒」時存在，沒有就整個取消。
 *
 * 注意：Doze 深眠時系統限制 `setExactAndAllowWhileIdle` 每 9 分鐘最多一次，
 * 因此實際間隔可能被拉長；這是系統限制，非本排程的 bug。
 */
object AlertScheduler {

    const val ACTION_TICK = "hk.senyou.travel.ALERT_TICK"

    private const val REQ = 8802

    /** 檢查間隔：5 分鐘（門檻最小 3 分鐘） */
    const val STEP_MS = 5 * 60_000L

    /** 同一條收藏的最短通知間隔（沿用原本 RefreshWorker 的 15 分鐘，避免反覆打擾） */
    private const val COOLDOWN_MS = 15 * 60_000L

    /**
     * UI／接收器入口（可在主執行緒呼叫）：
     * `enabled = false` 直接取消；否則讀設定與收藏後自動排程或取消。
     * 讀取是 IO，一律丟到背景範圍。
     */
    fun sync(ctx: Context, enabled: Boolean) {
        val app = ctx.applicationContext ?: return
        AlarmRepo.bgScope.launch {
            try {
                syncNow(app, enabled)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                // 系統服務不可用時不可崩潰（提醒只是輔助功能）
            }
        }
    }

    /** 同步版本：廣播接收器用 goAsync() 時可等待完成 */
    suspend fun syncNow(ctx: Context, enabled: Boolean) {
        val favs = try {
            Store.favorites(ctx).first()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            emptyList()
        }
        if (enabled && favs.any { it.alertMins > 0 }) schedule(ctx) else cancel(ctx)
    }

    /** 排下一次檢查（精確；無精確鬧鐘權限時退回不精確，仍會提醒，只是時間可能偏） */
    private fun schedule(ctx: Context) {
        runCatching {
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val at = System.currentTimeMillis() + STEP_MS
            val pi = pending(ctx)
            if (!AlarmRepo.canScheduleExact(ctx)) {
                am.set(AlarmManager.RTC_WAKEUP, at, pi)
                return
            }
            val ok = runCatching { am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi) }.isSuccess
            if (!ok) runCatching { am.set(AlarmManager.RTC_WAKEUP, at, pi) }
        }
    }

    /** 取消提醒鏈（沒有任何收藏需要提醒時） */
    fun cancel(ctx: Context) {
        runCatching {
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return@runCatching
            am.cancel(pending(ctx))
        }
    }

    private fun pending(ctx: Context): PendingIntent = PendingIntent.getBroadcast(
        ctx,
        REQ,
        Intent(ctx, AlertTickReceiver::class.java).setAction(ACTION_TICK),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    /* ---------------- 提醒評估（與 RefreshWorker 共用同一條路徑） ---------------- */

    /**
     * 逐條收藏取 ETA：寫入離線緩存，並在達到門檻時發到站提醒。
     * 原本只在 [hk.senyou.travel.work.RefreshWorker] 裡（30 分鐘一次），現在精確鬧鐘也呼叫它。
     */
    suspend fun evaluate(ctx: Context, cooldownMs: Long = COOLDOWN_MS) {
        val favs = try {
            Store.favorites(ctx).first()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            emptyList()
        }
        if (favs.isEmpty()) return
        val now = System.currentTimeMillis()
        favs.take(12).forEach { f ->
            val mins = favEtaSafely(f) ?: return@forEach
            Cache.putEtaCache(f.key, mins)
            if (f.alertMins > 0 && mins <= f.alertMins && now - Cache.alertSentAt(f.key) > cooldownMs) {
                notifyArrival(ctx, f, mins)
                Cache.markAlertSent(f.key)
            }
        }
    }

    /** 單條收藏取 ETA：一般例外視為「暫時取不到」，取消例外必須往外丟 */
    private suspend fun favEtaSafely(f: Fav): Int? = try {
        SearchRepo.favEta(f)
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        null
    }

    /** 收藏顯示名稱（小組件與通知共用） */
    fun labelOf(f: Fav): String = when {
        f.route.isNotBlank() -> f.route
        f.stationName.isNotBlank() -> f.stationName
        f.stopName.isNotBlank() -> f.stopName
        else -> "收藏"
    }

    private fun notifyArrival(ctx: Context, f: Fav, mins: Int) {
        if (!AlarmRepo.canPostNotifications(ctx)) return
        runCatching {
            val label = labelOf(f)
            val intent = Intent(ctx, MainActivity::class.java).apply {
                // 依收藏類型分流（港鐵/輕鐵站需帶車站代碼，否則通知點了沒反應）
                putExtra("deep_link_type", f.type)
                putExtra("deep_link_route", f.route)
                putExtra("deep_link_company", f.company)
                putExtra("deep_link_dir", f.dir)
                putExtra("deep_link_stop", f.stopId ?: "")
                putExtra("deep_link_route_id", f.routeId ?: "")
                putExtra("deep_link_station", f.stationCode ?: "")
                putExtra("deep_link_station_name", if (f.type == "lrt") f.stopName.ifBlank { f.stationName } else f.stationName)
            }
            val pi = PendingIntent.getActivity(
                ctx, label.hashCode(), intent,
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
            NotificationManagerCompat.from(ctx).notify(f.key.hashCode(), n)
        }
    }
}

/**
 * 提醒鏈的每一次觸發：先評估收藏（取 ETA + 必要時發通知），再排下一次
 * —— 若提醒已被關掉（沒有 alertMins > 0 的收藏），[AlertScheduler.syncNow] 會直接取消整條鏈。
 */
class AlertTickReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context?, intent: Intent?) {
        val c = ctx?.applicationContext ?: return
        if (intent?.action != AlertScheduler.ACTION_TICK) return
        val pending = goAsync()
        AlarmRepo.bgScope.launch {
            try {
                runCatching { AlertScheduler.evaluate(c) }
                runCatching { AlertScheduler.syncNow(c, true) }   // 鏈式重排（或取消）
            } finally {
                runCatching { pending.finish() }
            }
        }
    }
}
