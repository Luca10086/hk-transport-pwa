package hk.senyou.travel.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import hk.senyou.travel.MainActivity
import hk.senyou.travel.R
import hk.senyou.travel.data.Cache

/** 桌面小組件：K75P 下一班 + 收藏首條 ETA（由 RefreshWorker 每 30 分鐘刷新） */
class SenyouWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        ids.forEach { update(context, manager, it) }
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context) ?: return
            val ids = mgr.getAppWidgetIds(ComponentName(context, SenyouWidgetProvider::class.java))
            ids.forEach { update(context, mgr, it) }
        }

        fun update(context: Context, mgr: AppWidgetManager, id: Int) {
            val v = RemoteViews(context.packageName, R.layout.widget_k75p)
            v.setTextViewText(R.id.wEta, Cache.k75pMins?.let { "$it 分" } ?: "—")
            v.setTextViewText(R.id.wSub, "K75P · 天瑞 ↺ 洪水橋 · 實時 ${Cache.k75pLive} 班")
            val favText = if (Cache.favLine.isBlank()) "收藏：暫無" else
                "${Cache.favLine} · " + (Cache.favMins?.let { "$it 分" } ?: "—")
            v.setTextViewText(R.id.wFav, favText)
            val stamp = if (Cache.updatedAt > 0) {
                val t = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault()).format(java.util.Date(Cache.updatedAt))
                "更新 $t"
            } else "尚未更新"
            v.setTextViewText(R.id.wTime, stamp)

            val intent = Intent(context, MainActivity::class.java)
            val pi = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            v.setOnClickPendingIntent(R.id.wRoot, pi)
            mgr.updateAppWidget(id, v)
        }
    }
}
