package hk.senyou.travel.work

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import hk.senyou.travel.data.AlertScheduler
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.Cache
import hk.senyou.travel.data.Store
import hk.senyou.travel.widget.SenyouWidgetProvider
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.first

/**
 * 背景刷新：K75P + 全部收藏 ETA → 離線緩存 → 小組件 → 逐條到站提醒。
 * 每 30 分鐘執行一次（Android WorkManager 最小值 15 分鐘）。
 *
 * 注意：30 分鐘的節奏**不可能**滿足 3／5／10 分鐘的到站門檻，
 * 精確提醒改由 [AlertScheduler] 的鬧鐘鏈負責；本 worker 只負責緩存與小組件刷新，
 * 並順帶呼叫同一條評估路徑（[AlertScheduler.evaluate]）以免資料不一致。
 */
class RefreshWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        return try {
            refreshK75P()
            refreshFavorites()
            Cache.updatedAt = System.currentTimeMillis()
            SenyouWidgetProvider.refreshAll(applicationContext)
            Result.success()
        } catch (e: CancellationException) {
            // 協程取消必須往外丟，否則會違反 CoroutineWorker 契約（原本被當成一般錯誤 retry）
            throw e
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

    /** 刷新每條收藏的 ETA：寫入離線緩存 + 依各自門檻發到站提醒（與精確提醒共用同一條路徑） */
    private suspend fun refreshFavorites() {
        val favs = try {
            Store.favorites(applicationContext).first()
        } catch (e: CancellationException) {
            throw e          // 協程取消不可被吞掉（同上）
        } catch (e: Exception) {
            emptyList()
        }
        if (favs.isEmpty()) {
            Cache.favLine = ""
            Cache.favMins = null
            return
        }
        AlertScheduler.evaluate(applicationContext)
        // 小組件顯示首條收藏
        val first = favs.first()
        Cache.favLine = AlertScheduler.labelOf(first)
        Cache.favMins = Cache.etaCache(first.key)?.first
    }
}
