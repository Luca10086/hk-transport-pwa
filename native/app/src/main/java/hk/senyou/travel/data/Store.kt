package hk.senyou.travel.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import org.json.JSONArray
import org.json.JSONObject

/** 設定（對應 Web 版 wp2026_cfg） */
data class Settings(
    val theme: String = "dark",  // dark / light
    val glass: Int = 2,          // 0 無 → 4 濃郁
    val fx: String = "full",     // full / simple / off
    val big: Boolean = false,    // 大字模式
    val deep: Boolean = false,   // 深夜模式
    val night: String = "auto",  // system / manual / auto(定時)
    val accent: Long = 0xFF8B5CF6,
    val fontLevel: Int = 3,      // 0..7
    val refresh: Int = 30,       // 秒，0=關
    val contrast: Boolean = false, // WP 高對比（純黑底 / 純白字）
)

/** 收藏項（對應 Web 版 favorite 結構） */
data class Fav(
    val type: String,            // bus / mtr / lrt / mtrbus
    val company: String = "kmb", // kmb / ctb / nlb
    val route: String = "",
    val dir: String = "outbound",
    val stopId: String? = null,
    val stopName: String = "",
    val stationCode: String? = null,
    val stationName: String = "",
    val routeId: String? = null,
    val line: String? = null,
    val lineName: String = "",
    /** 到站提醒門檻（分鐘）：0 = 關閉 */
    val alertMins: Int = 0,
) {
    val key: String get() = listOf(type, company, route, dir, stopId ?: stationCode ?: routeId ?: "", stationName).joinToString("|")
}

private val Context.ds: DataStore<Preferences> by preferencesDataStore("senyou_v3")

object Store {
    private val K_CFG = stringPreferencesKey("cfg")
    private val K_FAVS = stringPreferencesKey("favs")
    private val K_RECENT = stringPreferencesKey("recent")

    /**
     * DataStore 讀取失敗（IO 異常 / 檔案損毀）不可讓 App 崩潰：
     * 一律退回空資料，等同「首次啟動」。
     */
    private fun DataStore<Preferences>.safe() = data.catch { emit(emptyPreferences()) }

    /** 最近搜尋（最多 10 條） */
    fun recent(ctx: Context): Flow<List<String>> = ctx.ds.safe().map { p ->
        val arr = p[K_RECENT]?.let { runCatching { JSONArray(it) }.getOrNull() } ?: return@map emptyList()
        (0 until arr.length()).map { arr.optString(it) }.filter { it.isNotBlank() }
    }

    suspend fun pushRecent(ctx: Context, q: String) {
        val q2 = q.trim()
        if (q2.isEmpty()) return
        runCatching {
            val cur = recent(ctx).first().toMutableList()
            cur.remove(q2)
            cur.add(0, q2)
            while (cur.size > 10) cur.removeAt(cur.size - 1)
            val arr = JSONArray().apply { cur.forEach { put(it) } }
            ctx.ds.edit { it[K_RECENT] = arr.toString() }
        }
    }

    fun settings(ctx: Context): Flow<Settings> = ctx.ds.safe().map { p ->
        val o = p[K_CFG]?.let { runCatching { JSONObject(it) }.getOrNull() }
        Settings(
            theme = o?.optString("theme", "dark") ?: "dark",
            glass = o?.optInt("glass", 2) ?: 2,
            fx = o?.optString("fx", "full") ?: "full",
            big = o?.optBoolean("big", false) ?: false,
            deep = o?.optBoolean("deep", false) ?: false,
            night = o?.optString("night", "auto") ?: "auto",
            accent = o?.optLong("accent", 0xFF8B5CF6) ?: 0xFF8B5CF6,
            fontLevel = o?.optInt("fontLevel", 3) ?: 3,
            refresh = o?.optInt("refresh", 30) ?: 30,
            contrast = o?.optBoolean("contrast", false) ?: false,
        )
    }

    suspend fun save(ctx: Context, s: Settings) {
        runCatching {
            val o = JSONObject()
                .put("theme", s.theme)
                .put("glass", s.glass).put("fx", s.fx).put("big", s.big).put("deep", s.deep)
                .put("night", s.night).put("accent", s.accent).put("fontLevel", s.fontLevel).put("refresh", s.refresh).put("contrast", s.contrast)
            ctx.ds.edit { it[K_CFG] = o.toString() }
        }
    }

    fun favorites(ctx: Context): Flow<List<Fav>> = ctx.ds.safe().map { p ->
        val arr = p[K_FAVS]?.let { runCatching { JSONArray(it) }.getOrNull() } ?: return@map emptyList()
        (0 until arr.length()).mapNotNull { i ->
            val o = arr.optJSONObject(i) ?: return@mapNotNull null
            runCatching {
                Fav(
                    type = o.optString("type"),
                    company = o.optString("company", "kmb"),
                    route = o.optString("route"),
                    dir = o.optString("dir", "outbound"),
                    stopId = o.optString("stopId").ifBlank { null },
                    stopName = o.optString("stopName"),
                    stationCode = o.optString("stationCode").ifBlank { null },
                    stationName = o.optString("stationName"),
                    routeId = o.optString("routeId").ifBlank { null },
                    line = o.optString("line").ifBlank { null },
                    lineName = o.optString("lineName"),
                    alertMins = o.optInt("alertMins", 0),
                )
            }.getOrNull()
        }
    }

    suspend fun saveFavorites(ctx: Context, list: List<Fav>) {
        runCatching {
            val arr = JSONArray()
            list.forEach { f ->
                arr.put(
                    JSONObject().put("type", f.type).put("company", f.company).put("route", f.route)
                        .put("dir", f.dir).put("stopId", f.stopId ?: "").put("stopName", f.stopName)
                        .put("stationCode", f.stationCode ?: "").put("stationName", f.stationName)
                        .put("routeId", f.routeId ?: "").put("line", f.line ?: "").put("lineName", f.lineName)
                        .put("alertMins", f.alertMins)
                )
            }
            ctx.ds.edit { it[K_FAVS] = arr.toString() }
        }
    }
}
