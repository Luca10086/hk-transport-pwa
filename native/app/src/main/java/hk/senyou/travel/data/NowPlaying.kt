package hk.senyou.travel.data

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.media.AudioManager
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.SystemClock
import android.provider.Settings
import android.service.notification.NotificationListenerService
import android.view.KeyEvent
import androidx.core.app.NotificationManagerCompat

/**
 * **接入系統播放器**：讀取並控制任何 App 正在播放的音樂（Spotify / YouTube Music / 本地播放器…），
 * 讓待機顯示的音樂畫面成為真正的「Now Playing」。
 *
 * 為什麼需要通知使用權：
 * Android 只在授予 **通知存取權（Notification Listener）** 後才允許第 3 方 App 透過
 * `MediaSessionManager.getActiveSessions()` 讀取其他 App 的媒體工作階段（曲名／歌手／專輯圖／進度）。
 * 本 App 只讀取 **媒體工作階段**，不讀取、不儲存任何通知內容。
 *
 * 若未授權，仍可用 [sendKey] 以媒體按鍵**控制**播放（不需權限），只是讀不到曲目資訊。
 */
object NowPlaying {

    enum class Action { Play, Next, Prev }

    data class Track(
        val title: String,
        val artist: String,
        val album: String,
        val art: Bitmap?,
        val durationMs: Long,
        val positionMs: Long,
        val playing: Boolean,
    )

    private fun cn(ctx: Context) = ComponentName(ctx, NowPlayingListener::class.java)

    /** 是否已取得通知使用權 */
    fun hasAccess(ctx: Context): Boolean = runCatching {
        NotificationManagerCompat.getEnabledListenerPackages(ctx).contains(ctx.packageName)
    }.getOrDefault(false)

    /** 開啟系統的「通知使用權」設定頁，讓使用者授權 */
    fun requestAccess(ctx: Context) {
        runCatching {
            ctx.startActivity(
                Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
        }
    }

    private fun sessions(ctx: Context): List<MediaController> = runCatching {
        val msm = ctx.getSystemService(Context.MEDIA_SESSION_SERVICE) as? MediaSessionManager ?: return emptyList()
        msm.getActiveSessions(cn(ctx))
    }.getOrDefault(emptyList())

    private fun pick(ctx: Context): MediaController? {
        val list = sessions(ctx)
        return list.firstOrNull { it.playbackState?.state == PlaybackState.STATE_PLAYING }
            ?: list.firstOrNull { it.metadata != null }
    }

    /** 目前播放中的曲目；未授權或沒有播放器時回傳 null */
    fun current(ctx: Context): Track? {
        if (!hasAccess(ctx)) return null
        val c = pick(ctx) ?: return null
        val md: MediaMetadata? = c.metadata
        val ps: PlaybackState? = c.playbackState
        val playing = ps?.state == PlaybackState.STATE_PLAYING
        val dur = md?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0L
        val base = ps?.position ?: 0L
        val pos = if (playing && ps != null) {
            base + ((SystemClock.elapsedRealtime() - ps.lastPositionUpdateTime) * ps.playbackSpeed).toLong()
        } else {
            base
        }
        return Track(
            title = md?.getString(MediaMetadata.METADATA_KEY_TITLE)?.takeIf { it.isNotBlank() } ?: "未知曲目",
            artist = md?.getString(MediaMetadata.METADATA_KEY_ARTIST)
                ?: md?.getString(MediaMetadata.METADATA_KEY_ALBUM_ARTIST) ?: "",
            album = md?.getString(MediaMetadata.METADATA_KEY_ALBUM) ?: "",
            art = md?.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART)
                ?: md?.getBitmap(MediaMetadata.METADATA_KEY_ART),
            durationMs = dur,
            positionMs = pos.coerceIn(0L, if (dur > 0) dur else Long.MAX_VALUE),
            playing = playing,
        )
    }

    /** 控制播放：有工作階段就精準控制；否則退回媒體按鍵（可控制任何播放器） */
    fun control(ctx: Context, action: Action) {
        val c = if (hasAccess(ctx)) pick(ctx) else null
        if (c != null) {
            val ok = runCatching {
                val t = c.transportControls
                when (action) {
                    Action.Play -> if (c.playbackState?.state == PlaybackState.STATE_PLAYING) t.pause() else t.play()
                    Action.Next -> t.skipToNext()
                    Action.Prev -> t.skipToPrevious()
                }
            }.isSuccess
            if (ok) return
        }
        sendKey(ctx, action)
    }

    private fun sendKey(ctx: Context, action: Action) {
        val am = ctx.getSystemService(Context.AUDIO_SERVICE) as? AudioManager ?: return
        val code = when (action) {
            Action.Play -> KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE
            Action.Next -> KeyEvent.KEYCODE_MEDIA_NEXT
            Action.Prev -> KeyEvent.KEYCODE_MEDIA_PREVIOUS
        }
        runCatching {
            am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, code))
            am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_UP, code))
        }
    }

    /** 取得通知使用權後，若服務尚未連線，請系統重新綁定一次 */
    fun rebind(ctx: Context) {
        runCatching {
            NotificationListenerService.requestRebind(cn(ctx))
        }
    }
}

/**
 * 通知存取服務（**不讀取任何通知內容**）。
 * 存在的唯一目的是取得 `MediaSessionManager.getActiveSessions()` 所需的授權身分，
 * 藉此讀取系統播放器的媒體工作階段（曲名／歌手／專輯圖／進度）。
 */
class NowPlayingListener : NotificationListenerService()
