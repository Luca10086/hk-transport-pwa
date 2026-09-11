package hk.senyou.travel.data

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import hk.senyou.travel.MainActivity
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import java.util.Calendar

/**
 * **真正的鬧鐘**（不是裝飾）：以 AlarmManager 精確排程，時間到由 [AlarmReceiver] 喚起，
 * 全屏顯示待機鬧鐘畫面並響鈴。
 *
 * 排程策略：
 * · 優先用 `setAlarmClock()`（系統會顯示鬧鐘圖示、豁免 Doze，最準）
 * · 被拒（Android 12+ 未授予精確鬧鐘權限）時退回 `setExactAndAllowWhileIdle()`
 * · 再失敗則退回 `set()`（不精確，但仍會響）
 */
object AlarmRepo {

    const val EXTRA_RING = "hk.senyou.travel.RING"
    private const val REQ = 8801

    /** 響鈴狀態（UI 觀察用；跨行程由 Intent extra 補上） */
    var ringing by mutableStateOf(false)

    /** 由鬧鐘喚起時，要求 App 直接打開待機畫面 */
    var openRequest by mutableStateOf(false)



    /** 下一次觸發時間（今天若已過則順延到明天） */
    fun nextTrigger(hour: Int, minute: Int, from: Long = System.currentTimeMillis()): Long {
        val c = Calendar.getInstance().apply {
            timeInMillis = from
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        if (c.timeInMillis <= from) c.add(Calendar.DAY_OF_YEAR, 1)
        return c.timeInMillis
    }

    /** 排程每日鬧鐘；回傳實際使用的觸發時間 */
    fun schedule(ctx: Context, hour: Int, minute: Int): Long {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return 0L
        val at = nextTrigger(hour, minute)
        val pi = pending(ctx)
        val showIntent = PendingIntent.getActivity(
            ctx, REQ + 1, Intent(ctx, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val ok = runCatching {
            am.setAlarmClock(AlarmManager.AlarmClockInfo(at, showIntent), pi)
        }.isSuccess
        if (!ok) {
            val ok2 = runCatching {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            }.isSuccess
            if (!ok2) runCatching { am.set(AlarmManager.RTC_WAKEUP, at, pi) }
        }
        return at
    }

    fun cancel(ctx: Context) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        runCatching { am.cancel(pending(ctx)) }
    }

    private fun pending(ctx: Context): PendingIntent = PendingIntent.getBroadcast(
        ctx,
        REQ,
        Intent(ctx, AlarmReceiver::class.java).setAction("hk.senyou.travel.ALARM"),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    /** 貪睡：N 分鐘後再響一次（一次性） */
    fun snooze(ctx: Context, minutes: Int) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val at = System.currentTimeMillis() + minutes * 60_000L
        runCatching { am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending(ctx)) }
    }
}

/** 鬧鐘觸發：喚起主畫面（帶響鈴旗標）並自動排下一次 */
class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context?, intent: Intent?) {
        val c = ctx ?: return
        AlarmRepo.ringing = true
        runCatching {
            val i = Intent(c, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                .putExtra(AlarmRepo.EXTRA_RING, true)
            c.startActivity(i)
        }
        // 自動排下一次（每天重複）
        runCatching {
            val s = Store.readBlocking(c)
            if (s.alarmOn) AlarmRepo.schedule(c, s.alarmHour, s.alarmMinute)
        }
    }
}
