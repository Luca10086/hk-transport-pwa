package hk.senyou.travel.ui

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

/** 粵語語音播報（TTS）：播報下一班 ETA */
object Tts {
    private var engine: TextToSpeech? = null
    private var ready = false

    fun init(ctx: Context) {
        if (engine != null) return
        engine = TextToSpeech(ctx.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val r = runCatching { engine?.setLanguage(Locale("zh", "HK")) }.getOrNull()
                if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) {
                    runCatching { engine?.setLanguage(Locale.CHINESE) }
                }
                runCatching { engine?.setSpeechRate(1.05f) }
                ready = true
            }
        }
    }

    fun speak(text: String) {
        if (!ready || text.isBlank()) return
        runCatching { engine?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "senyou") }
    }

    fun stop() = runCatching { engine?.stop() }.let { }

    fun shutdown() {
        runCatching { engine?.shutdown() }
        engine = null
        ready = false
    }
}
