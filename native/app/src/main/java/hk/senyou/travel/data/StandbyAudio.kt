package hk.senyou.travel.data

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack

/**
 * 待機顯示畫面用的**內建音樂組件**（真實播放，非裝飾）。
 *
 * 為什麼不用網路串流／內建 mp3：
 * · 本 App 沒有音樂授權內容，打包 mp3 會增加體積與版權風險；
 * · 改用 **AudioTrack 即時合成**（正弦 + 柔和包絡 + 低音），零資產、零網路、
 *   在任何裝置上都能真的發出聲音，且可即時切換曲目。
 *
 * 三首示範曲各自有不同的音階／速度，切換時有明顯差異。
 * 音量走系統媒體音量（USAGE_MEDIA / CONTENT_TYPE_MUSIC）。
 */
object StandbyAudio {

    val titles = listOf("晨光", "維港夜航", "山頂微風")
    val artists = listOf("森友出行 · 內建合成音", "森友出行 · 內建合成音", "森友出行 · 內建合成音")

    /** 名義長度（秒）——合成音為無限循環，UI 進度條以 3 分鐘為一輪 */
    const val NOMINAL_SECONDS = 180

    private const val SR = 22050

    @Volatile private var thread: Thread? = null
    @Volatile private var playing = false
    @Volatile private var index = 0
    @Volatile private var elapsedMs = 0L

    val isPlaying: Boolean get() = playing
    val current: Int get() = index
    val positionMs: Long get() = elapsedMs

    fun toggle() = if (playing) pause() else play()

    fun play() {
        if (playing) return
        playing = true
        if (thread?.isAlive != true) {
            val t = Thread({ pump() }, "standby-audio")
            t.isDaemon = true
            thread = t
            t.start()
        }
    }

    fun pause() {
        playing = false
    }

    fun next() {
        index = (index + 1) % titles.size
        elapsedMs = 0
        if (!playing) play()
    }

    fun prev() {
        index = (index - 1 + titles.size) % titles.size
        elapsedMs = 0
        if (!playing) play()
    }

    fun stop() {
        playing = false
        elapsedMs = 0
    }

    /** 響鈴用：以較快的節奏與較高音量播放（鬧鐘提示音） */
    @Volatile private var ringing = false
    fun startRing() {
        ringing = true
        elapsedMs = 0
        play()
    }

    fun stopRing() {
        ringing = false
        stop()
    }

    /** 由 UI 呼叫以更新已播放時間（避免另開 timer） */
    fun tick(deltaMs: Long) {
        if (playing) elapsedMs = (elapsedMs + deltaMs) % (NOMINAL_SECONDS * 1000L)
    }

    /* ---------------- 合成引擎 ---------------- */

    /** 三首曲子的音階（半音相對 do）與每步長度 */
    private val patterns = listOf(
        intArrayOf(0, 4, 7, 12, 7, 4, 0, 7),       // 晨光：明亮大調
        intArrayOf(0, 3, 7, 10, 7, 3, 0, 10),      // 維港夜航：小調
        intArrayOf(0, 5, 7, 12, 9, 5, 2, 7),       // 山頂微風：五聲
    )
    private val stepMs = longArrayOf(420L, 520L, 470L)

    private fun pump() {
        val minBuf = AudioTrack.getMinBufferSize(SR, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT)
        val bufSize = maxOf(minBuf, 8192)
        var track: AudioTrack? = null
        try {
            track = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build(),
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(SR)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build(),
                )
                .setBufferSizeInBytes(bufSize)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()
            buffers += track
            track.play()
            val block = ShortArray(1024)
            var step = 0
            var phase = 0.0
            var bassPhase = 0.0
            while (thread?.isAlive == true) {
                if (!playing) {
                    Thread.sleep(60)
                    continue
                }
                val i = index.coerceIn(0, patterns.size - 1)
                val pat = patterns[i]
                val semis = pat[step % pat.size]
                val freq = 220.0 * Math.pow(2.0, semis / 12.0)
                val lenSamples = (SR * stepMs[i] / 1000L).toInt()
                val amp = if (ringing) 0.34 else 0.20
                var n = 0
                while (n < lenSamples && thread?.isAlive == true) {
                    val take = minOf(block.size, lenSamples - n)
                    for (k in 0 until take) {
                        val t = (n + k).toDouble() / SR
                        val env = envelope(t, stepMs[i] / 1000.0)
                        val s = Math.sin(2 * Math.PI * freq * (phase + t)) * env
                        val b = Math.sin(2 * Math.PI * (freq / 4.0) * (bassPhase + t)) * env * 0.45
                        val v = ((s + b) * amp * Short.MAX_VALUE).toInt()
                        block[k] = v.coerceIn(-32768, 32767).toShort()
                    }
                    if (!playing) break
                    track.write(block, 0, take)
                    n += take
                }
                phase += lenSamples.toDouble() / SR
                bassPhase += lenSamples.toDouble() / SR
                step++
                if (ringing) {
                    // 響鈴：每 2 步插入一次短促雙音
                    if (step % 2 == 0) {
                        for (rep in 0 until 2) {
                            for (k in 0 until SR / 8) {
                                block[k % block.size] = 0
                            }
                            val beepFreq = if (rep == 0) 880.0 else 1174.0
                            var m = 0
                            while (m < SR / 8 && thread?.isAlive == true) {
                                val take = minOf(block.size, SR / 8 - m)
                                for (k in 0 until take) {
                                    val t = (m + k).toDouble() / SR
                                    val env = Math.min(1.0, t * 40) * Math.exp(-6 * t)
                                    block[k] = (Math.sin(2 * Math.PI * beepFreq * t) * env * 0.45 * Short.MAX_VALUE)
                                        .toInt().coerceIn(-32768, 32767).toShort()
                                }
                                if (!playing) break
                                track.write(block, 0, take)
                                m += take
                            }
                        }
                    }
                }
            }
        } catch (_: Throwable) {
            // 音訊不可用時靜默失敗（不影響 UI）
        } finally {
            runCatching { track?.stop() }
            runCatching { track?.release() }
            buffers.remove(track)
        }
    }

    private val buffers = java.util.Collections.synchronizedList(mutableListOf<AudioTrack>())

    /** 柔和 ADSR：快起、緩降 */
    private fun envelope(t: Double, len: Double): Double {
        val attack = 0.02
        val release = len * 0.55
        return when {
            t < attack -> t / attack
            t > release -> Math.max(0.0, 1.0 - (t - release) / (len - release))
            else -> 1.0
        }
    }

    /** App 離開前景或關閉待機畫面時呼叫 */
    fun releaseAll() {
        playing = false
        ringing = false
        buffers.toList().forEach { b -> runCatching { b.stop() } }
    }

    @Suppress("unused")
    private fun streamType() = AudioManager.STREAM_MUSIC
}
