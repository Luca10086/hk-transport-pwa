package hk.senyou.travel.data

import android.content.Context
import android.os.Build
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 崩潰日誌本地收集：捕獲未處理異常 → 寫入 filesDir/crashes/（保留最近 5 份）。
 * 設定頁可查看與清除。不上傳任何數據。
 */
object CrashLog {
    private const val DIR = "crashes"
    private const val KEEP = 5
    private var installed = false

    fun install(ctx: Context) {
        if (installed) return
        installed = true
        val app = ctx.applicationContext
        val prev = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, e ->
            runCatching { write(app, thread.name, e) }
            prev?.uncaughtException(thread, e)
        }
    }

    private fun write(ctx: Context, thread: String, e: Throwable) {
        val dir = File(ctx.filesDir, DIR).apply { mkdirs() }
        val ts = SimpleDateFormat("yyyyMMdd-HHmmss", Locale.getDefault()).format(Date())
        val f = File(dir, "crash-$ts.txt")
        val body = buildString {
            appendLine("時間：${SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())}")
            appendLine("線程：$thread")
            appendLine("版本：${Build.VERSION.SDK_INT} (${Build.MODEL})")
            appendLine("異常：${e.javaClass.name}: ${e.message}")
            appendLine()
            appendLine(e.stackTraceToString())
        }
        f.writeText(body)
        // 只保留最近 KEEP 份
        dir.listFiles()?.sortedByDescending { it.name }?.drop(KEEP)?.forEach { runCatching { it.delete() } }
    }

    fun files(ctx: Context): List<File> =
        File(ctx.filesDir, DIR).listFiles()?.sortedByDescending { it.name } ?: emptyList()

    fun count(ctx: Context): Int = files(ctx).size

    fun latestText(ctx: Context): String? =
        files(ctx).firstOrNull()?.let { runCatching { it.readText() }.getOrNull() }

    fun clear(ctx: Context) {
        files(ctx).forEach { runCatching { it.delete() } }
    }
}
