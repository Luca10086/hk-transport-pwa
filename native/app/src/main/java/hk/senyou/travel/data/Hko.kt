package hk.senyou.travel.data

import org.json.JSONObject
import kotlin.math.roundToInt

data class WeatherDay(val label: String, val week: String, val date: String, val max: Int?, val min: Int?, val rhMin: Int?, val rhMax: Int?, val desc: String, val emoji: String)
data class Weather(
    val temp: Int? = null,
    val humid: Int? = null,
    val rain: Double? = null,
    val uv: Int? = null,
    val desc: String = "",
    val emoji: String = "",
    val severe: List<String> = emptyList(),
    val mild: List<String> = emptyList(),
    val days: List<WeatherDay> = emptyList(),
    val updated: String = "",
)

/** 香港天文台開放數據（rhrread / fnd / uvindex） */
object Hko {
    private const val RHRREAD = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc"
    private const val FND = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc"
    private const val UV = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=uvindex&lang=tc"
    private val SEVERE = Regex("雨|颱風|風暴|雷暴|山泥|酷熱|寒冷|霜凍|海嘯|水浸")

    private var cache: Weather? = null
    private var cacheAt = 0L

    suspend fun fetch(force: Boolean = false): Weather {
        cache?.let { if (!force && System.currentTimeMillis() - cacheAt < 5 * 60_000) return it }
        var w = Weather()

        Http.getJson(RHRREAD)?.let { r ->
            val temps = r.optJSONObject("temperature")?.optJSONArray("data")
            var temp: Int? = null
            if (temps != null) {
                for (i in 0 until temps.length()) {
                    val d = temps.optJSONObject(i) ?: continue
                    val place = d.optString("place")
                    if (place.contains("天水圍") || place.contains("元朗") || place.contains("屯門") || place.contains("荃灣")) {
                        temp = d.optDouble("value", 0.0).roundToInt(); break
                    }
                    if (temp == null) temp = d.optDouble("value", 0.0).roundToInt()
                }
            }
            val humid = r.optJSONObject("humidity")?.optJSONArray("data")?.optJSONObject(0)?.optDouble("value")?.roundToInt()
            val rain = r.optJSONObject("rainfall")?.optJSONArray("data")?.optJSONObject(0)?.optString("max")?.toDoubleOrNull()
            val warn = r.optJSONArray("warningMessage")
            val severe = mutableListOf<String>()
            val mild = mutableListOf<String>()
            if (warn != null) for (i in 0 until warn.length()) {
                val msg = warn.optString(i)
                if (msg.isNotBlank()) (if (SEVERE.containsMatchIn(msg)) severe else mild).add(msg)
            }
            val icon = r.optString("icon")
            w = w.copy(
                temp = temp, humid = humid, rain = rain,
                desc = StaticData.hkoIcons[icon] ?: "",
                emoji = StaticData.hkoEmoji[icon] ?: "",
                severe = severe, mild = mild,
                updated = r.optString("updateTime").takeLast(8).take(5),
            )
        }

        Http.getJson(UV)?.let { u ->
            val v = u.optJSONArray("data")?.optJSONObject(0)?.optDouble("value")?.roundToInt()
                ?: u.optDouble("value", 0.0).roundToInt()
            if (v > 0) w = w.copy(uv = v)
        }

        Http.getJson(FND)?.let { f ->
            val fc = f.optJSONArray("weatherForecast") ?: f.optJSONArray("forecastPeriod")
            if (fc != null) {
                val days = mutableListOf<WeatherDay>()
                val labels = listOf("今天", "明天", "後天")
                for (i in 0 until minOf(3, fc.length())) {
                    val d = fc.optJSONObject(i) ?: continue
                    val dateRaw = d.optString("forecastDate")
                    val md = if (dateRaw.length == 8) "${dateRaw.substring(4, 6).toInt()}/${dateRaw.substring(6, 8).toInt()}" else ""
                    val icon = d.optString("ForecastIcon")
                    days.add(
                        WeatherDay(
                            label = labels.getOrElse(i) { "" },
                            week = d.optString("week"),
                            date = md,
                            max = d.optJSONObject("forecastMaxtemp")?.optDouble("value")?.roundToInt(),
                            min = d.optJSONObject("forecastMintemp")?.optDouble("value")?.roundToInt(),
                            rhMin = d.optJSONObject("forecastMinrh")?.optDouble("value")?.roundToInt(),
                            rhMax = d.optJSONObject("forecastMaxrh")?.optDouble("value")?.roundToInt(),
                            desc = d.optString("forecastWeather"),
                            emoji = StaticData.hkoEmoji[icon] ?: "🌡️",
                        )
                    )
                }
                w = w.copy(days = days)
            }
        }

        cache = w
        cacheAt = System.currentTimeMillis()
        return w
    }
}

/** 壽司郎排隊（實時優先，快照兜底） */
object Sushiro {
    private const val API = "https://sushipass.sushiro.com.hk/api/2.0/info/storelist?latitude=22&longitude=114&numresults=50&region=HK"

    suspend fun fetch(): Pair<List<SushiroStore>, Boolean> {
        // 原生無 CORS：直連壽司郎官方排隊 API（回應為頂層陣列）
        val arr = Http.getArray(API)
        if (arr != null && arr.length() > 0) {
            val live = (0 until arr.length()).mapNotNull { i ->
                val s = arr.optJSONObject(i) ?: return@mapNotNull null
                SushiroStore(
                    name = s.optString("name"),
                    area = s.optString("area"),
                    waiting = s.optInt("waitingGroup", s.optInt("wait", 0)),
                    status = s.optString("storeStatus", "OPEN"),
                )
            }
            if (live.isNotEmpty()) return live to true
        }
        return StaticData.sushiro to false
    }
}
