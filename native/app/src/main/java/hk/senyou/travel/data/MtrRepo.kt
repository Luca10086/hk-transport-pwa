package hk.senyou.travel.data

import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope

data class MtrLineRow(val code: String, val name: String, val upMins: Int?, val downMins: Int?)
data class LrtRow(val id: Int, val name: String)

/** 港鐵路線圖資料（每站上下行最近班次） */
object MtrRepo {

    /** 取某線全部車站的上下行最近班次（分塊並發） */
    suspend fun lineRows(line: String): List<MtrLineRow> = coroutineScope {
        val stations = StaticData.mtrLineStops[line] ?: return@coroutineScope emptyList()
        stations.chunked(6).fold(emptyList()) { acc, chunk ->
            val rows = chunk.map { st ->
                async {
                    var up: Int? = null
                    var down: Int? = null
                    val d = Api.mtrSchedule(line, st.code)
                    val dd = d?.optJSONObject("$line-${st.code}")
                    dd?.optJSONArray("UP")?.let { arr ->
                        for (i in 0 until arr.length()) {
                            val m = Api.minsUntil(arr.optJSONObject(i)?.optString("time")) ?: continue
                            if (up == null || m < up) up = m
                        }
                    }
                    dd?.optJSONArray("DOWN")?.let { arr ->
                        for (i in 0 until arr.length()) {
                            val m = Api.minsUntil(arr.optJSONObject(i)?.optString("time")) ?: continue
                            if (down == null || m < down) down = m
                        }
                    }
                    MtrLineRow(st.code, st.name, up, down)
                }
            }.awaitAll()
            acc + rows
        }
    }

    /** 輕鐵分區站表（屯門 / 天水圍 / 元朗） */
    fun lrtGroups(): List<Pair<String, List<LrtRow>>> {
        val all = StaticData.lrtStations.entries
            .map { LrtRow(it.key, it.value) }
            .sortedBy { it.id }
        val tm = all.filter { it.id in 1..300 }
        val tsw = all.filter { it.id in 425..560 }
        val yl = all.filter { it.id in 560..920 }
        return listOf("屯門" to tm, "天水圍" to tsw, "元朗" to yl).filter { it.second.isNotEmpty() }
    }
}

/** 背景刷新緩存（WorkManager 寫入，UI / 小組件 / 通知讀取） */
object Cache {
    private val prefs by lazy {
        AppCtx.get().getSharedPreferences("senyou_cache", android.content.Context.MODE_PRIVATE)
    }

    var k75pMins: Int?
        get() = prefs.getInt("k75p_mins", -1).takeIf { it >= 0 }
        set(v) = prefs.edit().putInt("k75p_mins", v ?: -1).apply()

    var k75pLive: Int
        get() = prefs.getInt("k75p_live", 0)
        set(v) = prefs.edit().putInt("k75p_live", v).apply()

    var favLine: String
        get() = prefs.getString("fav_line", "") ?: ""
        set(v) = prefs.edit().putString("fav_line", v).apply()

    var favMins: Int?
        get() = prefs.getInt("fav_mins", -1).takeIf { it >= 0 }
        set(v) = prefs.edit().putInt("fav_mins", v ?: -1).apply()

    var updatedAt: Long
        get() = prefs.getLong("updated_at", 0L)
        set(v) = prefs.edit().putLong("updated_at", v).apply()

    /* ---------- 逐條收藏的 ETA 離線緩存（分鐘 + 時間戳） ---------- */

    fun etaCache(key: String): Pair<Int, Long>? {
        val raw = prefs.getString("eta_$key", null) ?: return null
        val parts = raw.split("|")
        if (parts.size != 2) return null
        val mins = parts[0].toIntOrNull() ?: return null
        val ts = parts[1].toLongOrNull() ?: return null
        return mins to ts
    }

    fun putEtaCache(key: String, mins: Int?) {
        if (mins == null) return
        prefs.edit().putString("eta_$key", "$mins|${System.currentTimeMillis()}").apply()
    }

    /** 上次已發提醒的時間（避免同一條收藏反覆通知） */
    fun alertSentAt(key: String): Long = prefs.getLong("alert_$key", 0L)
    fun markAlertSent(key: String) = prefs.edit().putLong("alert_$key", System.currentTimeMillis()).apply()
}

/** 全局 Application 上下文（供無 Context 的緩存/工作器使用） */
object AppCtx {
    private var app: android.app.Application? = null
    fun set(a: android.app.Application) { app = a }
    fun get(): android.app.Application = app ?: error("AppCtx not initialised")
}
