package hk.senyou.travel.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.json.JSONArray
import org.json.JSONObject

/** 設定（對應 Web 版 wp2026_cfg） */
data class Settings(
    val glass: Int = 2,          // 0 無 → 4 濃郁
    val fx: String = "full",     // full / simple / off
    val big: Boolean = false,    // 大字模式
    val deep: Boolean = false,   // 深夜模式
    val night: String = "auto",  // system / manual / auto(定時)
    val accent: Long = 0xFF0078D7,
    val fontLevel: Int = 3,      // 0..7
    val refresh: Int = 30,       // 秒，0=關
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
) {
    val key: String get() = listOf(type, company, route, dir, stopId ?: stationCode ?: routeId ?: "", stationName).joinToString("|")
}

private val Context.ds: DataStore<Preferences> by preferencesDataStore("senyou_v3")

object Store {
    private val K_CFG = stringPreferencesKey("cfg")
    private val K_FAVS = stringPreferencesKey("favs")

    fun settings(ctx: Context): Flow<Settings> = ctx.ds.data.map { p ->
        val o = p[K_CFG]?.let { runCatching { JSONObject(it) }.getOrNull() }
        Settings(
            glass = o?.optInt("glass", 2) ?: 2,
            fx = o?.optString("fx", "full") ?: "full",
            big = o?.optBoolean("big", false) ?: false,
            deep = o?.optBoolean("deep", false) ?: false,
            night = o?.optString("night", "auto") ?: "auto",
            accent = o?.optLong("accent", 0xFF0078D7) ?: 0xFF0078D7,
            fontLevel = o?.optInt("fontLevel", 3) ?: 3,
            refresh = o?.optInt("refresh", 30) ?: 30,
        )
    }

    suspend fun save(ctx: Context, s: Settings) {
        val o = JSONObject()
            .put("glass", s.glass).put("fx", s.fx).put("big", s.big).put("deep", s.deep)
            .put("night", s.night).put("accent", s.accent).put("fontLevel", s.fontLevel).put("refresh", s.refresh)
        ctx.ds.edit { it[K_CFG] = o.toString() }
    }

    fun favorites(ctx: Context): Flow<List<Fav>> = ctx.ds.data.map { p ->
        val arr = p[K_FAVS]?.let { runCatching { JSONArray(it) }.getOrNull() } ?: return@map emptyList()
        (0 until arr.length()).mapNotNull { i ->
            val o = arr.optJSONObject(i) ?: return@mapNotNull null
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
            )
        }
    }

    suspend fun saveFavorites(ctx: Context, list: List<Fav>) {
        val arr = JSONArray()
        list.forEach { f ->
            arr.put(
                JSONObject().put("type", f.type).put("company", f.company).put("route", f.route)
                    .put("dir", f.dir).put("stopId", f.stopId ?: "").put("stopName", f.stopName)
                    .put("stationCode", f.stationCode ?: "").put("stationName", f.stationName)
                    .put("routeId", f.routeId ?: "").put("line", f.line ?: "").put("lineName", f.lineName)
            )
        }
        ctx.ds.edit { it[K_FAVS] = arr.toString() }
    }
}
