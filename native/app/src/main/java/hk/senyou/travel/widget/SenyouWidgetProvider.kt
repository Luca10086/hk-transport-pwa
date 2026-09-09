package hk.senyou.travel.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.RemoteViews
import hk.senyou.travel.MainActivity
import hk.senyou.travel.R
import hk.senyou.travel.data.Cache

/**
 * 桌面小組件：K75P 下一班 + 收藏首條 ETA（由 RefreshWorker 每 30 分鐘刷新）。
 * 支援兩種尺寸：<220dp 用精簡橫向佈局，否則用完整佈局。
 */
class SenyouWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        ids.forEach { update(context, manager, it) }
    }

    override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, newOptions: Bundle?) {
        update(context, manager, id)
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context) ?: return
            val ids = mgr.getAppWidgetIds(ComponentName(context, SenyouWidgetProvider::class.java))
            ids.forEach { update(context, mgr, it) }
        }

        fun update(context: Context, mgr: AppWidgetManager, id: Int) {
            val minW = runCatching {
                mgr.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
            }.getOrDefault(250)
            val small = minW in 1 until 220

            val etaText = hk.senyou.travel.data.Api.etaText(Cache.k75pMins)
            val favText = if (Cache.favLine.isBlank()) "收藏：暫無"
            else "${Cache.favLine} · " + hk.senyou.travel.data.Api.etaText(Cache.favMins)

            val v = if (small) {
                RemoteViews(context.packageName, R.layout.widget_k75p_small).apply {
                    setTextViewText(R.id.wEtaSmall, etaText)
                    setTextViewText(R.id.wSubSmall, "K75P · 實時 ${Cache.k75pLive} 班")
                    setTextViewText(R.id.wFavSmall, favText)
                    setOnClickPendingIntent(R.id.wRootSmall, openApp(context))
                }
            } else {
                RemoteViews(context.packageName, R.layout.widget_k75p).apply {
                    setTextViewText(R.id.wEta, etaText)
                    setTextViewText(R.id.wSub, "K75P · 天瑞 ↺ 洪水橋 · 實時 ${Cache.k75pLive} 班")
                    setTextViewText(R.id.wFav, favText)
                    val stamp = if (Cache.updatedAt > 0) {
                        val t = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault()).format(java.util.Date(Cache.updatedAt))
                        "更新 $t"
                    } else "尚未更新"
                    setTextViewText(R.id.wTime, stamp)
                    setOnClickPendingIntent(R.id.wRoot, openApp(context))
                }
            }
            mgr.updateAppWidget(id, v)
        }

        private fun openApp(context: Context): PendingIntent {
            val intent = Intent(context, MainActivity::class.java)
            return PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }
    }
}
