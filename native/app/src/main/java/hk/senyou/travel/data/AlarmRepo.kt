package hk.senyou.travel.data

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import hk.senyou.travel.MainActivity
import hk.senyou.travel.R
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * **真正的鬧鐘**（不是裝飾）：以 AlarmManager 精確排程，時間到由 [AlarmReceiver] 喚起，
 * 全屏顯示待機鬧鐘畫面並響鈴。
 *
 * 排程策略：
 * · 先查 [canScheduleExact]（Android 12+ 的「鬧鐘與提醒」授權）；
 * · 有權限才用 `setAlarmClock()`（系統會顯示鬧鐘圖示、豁免 Doze，最準）；
 * · 沒權限／被拒 → `setExactAndAllowWhileIdle()`，再失敗 → `set()`（不精確，但仍會響）。
 *
 * 響鈴回饋（三管齊下，任一被系統擋下都還有其他路）：
 * · 震動 [startVibrate]／[stopVibrate]（重複波形，VIBRATE 權限）
 * · 高優先通知 + 全螢幕意圖 [notifyRinging]（Android 10+ 背景啟動 Activity 可能被攔）
 * · 直接喚起 [MainActivity]（帶 [EXTRA_RING]）
 *
 * 開機 / 時區變更 / App 更新後由 [AlarmBootReceiver] 呼叫 [rearmFromSettings] 補排。
 */
object AlarmRepo {

    const val EXTRA_RING = "hk.senyou.travel.RING"

    /** 響鈴通知的「停止」動作（由 [AlarmReceiver] 處理） */
    const val ACTION_STOP_RING = "hk.senyou.travel.STOP_RING"

    /** 響鈴通知通路 id（由 [ensureChannel] 建立，可重複呼叫） */
    const val CHANNEL_ALARM = "senyou_alarm"

    private const val REQ = 8801
    private const val NOTIF_ID = 8801

    /** 震動保險：即使沒有任何「停止」被呼叫，也不會無限震下去 */
    private const val VIBRATE_MAX_MS = 120_000L

    /** 廣播接收器（goAsync）／背景重排用的範圍：短暫工作，不阻塞主執行緒 */
    internal val bgScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private var ringingState by mutableStateOf(false)

    /** 最後一次響鈴用的 application context：停止響鈴時靠它收震動與通知 */
    private var ringCtx: Context? = null
    private var vibrateWatchdog: Job? = null

    /**
     * 響鈴狀態（UI 觀察用；跨行程由 Intent extra 補上）。
     * 設為 false 時一併停震動、收通知 —— 待機畫面的「停止／貪睡」就是改這個旗標。
     */
    var ringing: Boolean
        get() = ringingState
        set(value) {
            ringingState = value
            if (!value) stopRingFeedback()
        }

    /** 由鬧鐘喚起時，要求 App 直接打開待機畫面 */
    var openRequest by mutableStateOf(false)

    /* ---------------- 精確鬧鐘權限（Android 12+） ---------------- */

    /** API < 31 一律 true；否則查詢系統是否允許精確鬧鐘 */
    fun canScheduleExact(ctx: Context): Boolean = runCatching {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return@runCatching true
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return@runCatching false
        am.canScheduleExactAlarms()
    }.getOrDefault(false)

    /**
     * 開啟系統的「鬧鐘與提醒」授權頁。
     * 只在 API 31+ 且 [canScheduleExact] 為 false 時才有意義；UI 可據此顯示入口。
     */
    fun requestExactPermission(ctx: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
        runCatching {
            ctx.startActivity(
                Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                    .setData(Uri.fromParts("package", ctx.packageName ?: "", null))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
        }
    }

    /* ---------------- 排程 ---------------- */

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
        // 沒有精確鬧鐘權限時不要嘗試 setAlarmClock（系統只會靜默忽略），直接走不精確退回
        val exact = canScheduleExact(ctx)
        val ok = exact && runCatching {
            am.setAlarmClock(AlarmManager.AlarmClockInfo(at, showIntent), pi)
        }.isSuccess
        if (!ok) {
            val ok2 = exact && runCatching {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            }.isSuccess
            if (!ok2) runCatching { am.set(AlarmManager.RTC_WAKEUP, at, pi) }
        }
        return at
    }

    /**
     * 依目前設定重新排程（App 啟動 / 開機 / 時區變更 / App 更新時呼叫）。
     * 讀取 DataStore 需要協程：**不可**在主執行緒 runBlocking（見舊版 AlarmReceiver 的問題）。
     */
    suspend fun rearmFromSettings(ctx: Context) {
        val s = try {
            Store.settings(ctx).first()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Settings()   // 讀不到設定就不動排程（等同維持現狀）
        }
        if (s.alarmOn) schedule(ctx, s.alarmHour, s.alarmMinute)
    }

    fun cancel(ctx: Context) {
        runCatching {
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return@runCatching
            am.cancel(pending(ctx))
        }
        stopRing(ctx)   // 關閉鬧鐘時一併停震動、收通知
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

    /* ---------------- 響鈴震動 ---------------- */

    private fun vibrator(ctx: Context): Vibrator? = runCatching {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }.getOrNull()

    private fun hasVibratePermission(ctx: Context): Boolean = runCatching {
        ContextCompat.checkSelfPermission(ctx, Manifest.permission.VIBRATE) == PackageManager.PERMISSION_GRANTED
    }.getOrDefault(false)

    /** 響鈴震動：重複波形直到 [stopVibrate]（測試的 staticUi 不震） */
    fun startVibrate(ctx: Context) {
        if (DebugFlags.staticUi || !hasVibratePermission(ctx)) return
        val app = ctx.applicationContext ?: return
        ringCtx = app
        runCatching {
            // 0ms 起震 → 700ms 震 / 400ms 停 → 700ms 震 / 1200ms 停，之後從頭重複
            val pattern = longArrayOf(0L, 700L, 400L, 700L, 1200L)
            val v = vibrator(app) ?: return@runCatching
            v.cancel()   // 重複觸發（例如貪睡後再響）時避免波形疊加
            v.vibrate(VibrationEffect.createWaveform(pattern, 0))
        }
        // 保險：沒有停止訊號時最多震 VIBRATE_MAX_MS
        vibrateWatchdog?.cancel()
        vibrateWatchdog = bgScope.launch {
            delay(VIBRATE_MAX_MS)
            stopVibrate(app)
        }
    }

    /** 停止震動（可重複呼叫） */
    fun stopVibrate(ctx: Context) {
        runCatching { vibrator(ctx)?.cancel() }
    }

    /** 停掉整場響鈴回饋（震動 + 通知）；由 [ringing] 的 setter 呼叫 */
    private fun stopRingFeedback() {
        vibrateWatchdog?.cancel()
        vibrateWatchdog = null
        val c = ringCtx ?: return
        stopVibrate(c)
        cancelRingingNotification(c)
    }

    /* ---------------- 響鈴通知（全螢幕意圖） ---------------- */

    /** 建立響鈴通知通路（系統只會真正建立一次，可重複呼叫） */
    fun ensureChannel(ctx: Context) {
        runCatching {
            val mgr = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
            if (mgr.getNotificationChannel(CHANNEL_ALARM) != null) return
            mgr.createNotificationChannel(
                NotificationChannel(CHANNEL_ALARM, "待機鬧鐘", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "鬧鐘響鈴（全螢幕顯示待機畫面）"
                    setSound(null, null)        // 鈴聲由待機畫面的音訊負責，通知不另外出聲
                    enableVibration(false)      // 震動由 AlarmRepo 控制（可停止）
                },
            )
        }
    }

    /** API 33+ 需 POST_NOTIFICATIONS 才能發通知 */
    fun canPostNotifications(ctx: Context): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return true
        return runCatching {
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
        }.getOrDefault(false)
    }

    /** API 34+ 需 USE_FULL_SCREEN_INTENT 才會真的全螢幕 */
    private fun fullScreenAllowed(ctx: Context): Boolean = runCatching {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return@runCatching true
        val mgr = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        mgr?.canUseFullScreenIntent() ?: false
    }.getOrDefault(false)

    /**
     * 響鈴通知：高優先 + 全螢幕意圖（Android 10+ 背景啟動 Activity 可能被系統攔下，
     * 這條路是保證使用者看得到鬧鐘的後備），並附「停止」動作。
     * 未取得通知權限時仍會嘗試由 [AlarmReceiver] 直接啟動畫面。
     */
    fun notifyRinging(ctx: Context) {
        runCatching {
            ensureChannel(ctx)
            ringCtx = ctx.applicationContext
            if (!canPostNotifications(ctx)) return
            val full = PendingIntent.getActivity(
                ctx, REQ + 2,
                Intent(ctx, hk.senyou.travel.ui.StandbyActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                    .putExtra(EXTRA_RING, true),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            val stop = PendingIntent.getBroadcast(
                ctx, REQ + 3,
                Intent(ctx, AlarmReceiver::class.java).setAction(ACTION_STOP_RING),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            val n = NotificationCompat.Builder(ctx, CHANNEL_ALARM)
                .setSmallIcon(R.drawable.ic_launcher_fg)
                .setContentTitle("森友出行 待機鬧鐘")
                .setContentText("響鈴中，點按進入待機顯示")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setAutoCancel(false)
                .setContentIntent(full)
                .addAction(0, "停止", stop)
                .apply { if (fullScreenAllowed(ctx)) setFullScreenIntent(full, true) }
                .build()
            NotificationManagerCompat.from(ctx).notify(NOTIF_ID, n)
        }
    }

    /** 收掉響鈴通知（停止／貪睡／關閉鬧鐘時呼叫） */
    fun cancelRingingNotification(ctx: Context) {
        runCatching { NotificationManagerCompat.from(ctx).cancel(NOTIF_ID) }
    }

    /** 停止整場響鈴：關旗標 + 停震動 + 收通知 */
    fun stopRing(ctx: Context) {
        ringing = false          // setter 已停回饋，以下為保險（明確使用呼叫端 context）
        stopVibrate(ctx)
        cancelRingingNotification(ctx)
    }
}

/**
 * 鬧鐘觸發：**先重排下一次**（讀設定改到背景執行緒，不再 runBlocking 卡主執行緒），
 * 再震動／發全螢幕通知／喚起主畫面（帶響鈴旗標）。也負責通知列「停止」動作。
 */
class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context?, intent: Intent?) {
        val c = ctx?.applicationContext ?: return
        if (intent?.action == AlarmRepo.ACTION_STOP_RING) {
            AlarmRepo.stopRing(c)
            return
        }
        AlarmRepo.ringing = true
        AlarmRepo.startVibrate(c)
        AlarmRepo.notifyRinging(c)
        // 廣播在主執行緒：用 goAsync() 把設定讀取與排程移到背景
        val pending = goAsync()
        AlarmRepo.bgScope.launch {
            try {
                runCatching { AlarmRepo.rearmFromSettings(c) }   // 先排下一次（每天重複）
                runCatching {
                    c.startActivity(
                        Intent(c, MainActivity::class.java)
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                            .putExtra(AlarmRepo.EXTRA_RING, true),
                    )
                }
            } finally {
                runCatching { pending.finish() }
            }
        }
    }
}
