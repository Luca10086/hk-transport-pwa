package hk.senyou.travel.data

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import kotlinx.coroutines.launch

/**
 * 開機 / 解鎖前開機 / 時區變更 / 時間變更 / App 更新後，把鬧鐘與到站提醒補排回去。
 *
 * 為什麼需要它：AlarmManager 的排程**不會**跨重開機存活，時區或時間被改動後
 * 原本的觸發點也失效；先前只有 `Panes.kt` 的開關會排程，所以「響鈴時間 07:00（每天）」
 * 一旦重開機就再也不會響。
 *
 * 系統是在**主執行緒**呼叫 onReceive，而排程前必須先讀 DataStore 設定，
 * 因此一律用 `goAsync()` 搭配背景範圍（[AlarmRepo.bgScope]），絕不在主執行緒 runBlocking。
 *
 * 註：設定存在認證加密儲存（CE），未解鎖前讀不到；因此清單**刻意不宣告** directBootAware，
 * LOCKED_BOOT_COMPLETED 只在解鎖後才會實際送達（此處仍一併處理），
 * 真正生效的是解鎖後的 BOOT_COMPLETED。
 */
class AlarmBootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context?, intent: Intent?) {
        val ctx = context?.applicationContext ?: return
        val action = intent?.action ?: return
        if (action !in ACTIONS) return

        val pending = goAsync()
        AlarmRepo.bgScope.launch {
            try {
                runCatching { AlarmRepo.rearmFromSettings(ctx) }      // 每日鬧鐘
                runCatching { AlertScheduler.syncNow(ctx, true) }     // 到站提醒（精確鬧鐘鏈）
            } finally {
                runCatching { pending.finish() }
            }
        }
    }

    private companion object {
        val ACTIONS = setOf(
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_LOCKED_BOOT_COMPLETED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_TIME_CHANGED,        // = android.intent.action.TIME_SET
            Intent.ACTION_MY_PACKAGE_REPLACED,
        )
    }
}
