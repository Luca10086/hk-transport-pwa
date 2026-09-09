package hk.senyou.travel.data

import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.sqrt

data class BusMarker(
    val id: String,
    val pos: Float,
    val nextIdx: Int,
    val nextName: String,
    val mins: Int,
    val gps: Boolean,
)

/** K75P 循環線投影模型（Kotlin 重寫自 Web 版 kModel / gpsPos，含平滑與只進不退） */
object K75PModel {
    const val KN = 23
    val TURN = 14

    private fun coords(i: Int): LatLng? {
        val id = StaticData.k75pStops.getOrNull(i)?.id ?: return null
        return StaticData.k75pCoords[id]
    }

    /** 段內投影：回傳 (距離平方, 段內比例) */
    private fun segFrac(a: LatLng, b: LatLng, p: LatLng): Pair<Double, Double> {
        val kx = 111320.0 * kotlin.math.cos(Math.toRadians(a.lat))
        val ky = 110540.0
        val bx = (b.lng - a.lng) * kx
        val by = (b.lat - a.lat) * ky
        val px = (p.lng - a.lng) * kx
        val py = (p.lat - a.lat) * ky
        val len2 = bx * bx + by * by
        if (len2 < 1e-6) return (px * px + py * py) to 0.0
        val t = ((px * bx + py * by) / len2).coerceIn(0.0, 1.0)
        val cx = bx * t
        val cy = by * t
        return ((px - cx) * (px - cx) + (py - cy) * (py - cy)) to t
    }

    /** GPS 點 → 路線位置（stop-index 空間）；距離 >400m 視為不可信 */
    fun gpsPos(p: LatLng, ref: Float): Float? {
        var bestScore = Double.MAX_VALUE
        var bestD2 = Double.MAX_VALUE
        var bestPos = 0f
        for (i in 0 until KN - 1) {
            val a = coords(i) ?: continue
            val b = coords(i + 1) ?: continue
            val (d2, f) = segFrac(a, b, p)
            val score = d2 + 3000.0 * abs(i + f - ref)
            if (score < bestScore) {
                bestScore = score
                bestD2 = d2
                bestPos = (i + f).toFloat()
            }
        }
        return if (sqrt(bestD2) < 400) bestPos else null
    }

    /** 由港鐵巴士 API 回應建立班次標記（prev = 上次位置，用於平滑） */
    fun build(data: JSONObject?, prev: Map<String, Float>): List<BusMarker> {
        if (data == null) return emptyList()
        val stops = data.optJSONArray("busStop") ?: return emptyList()
        val indexOf = StaticData.k75pStops.withIndex().associate { (i, s) -> s.id to i }

        data class Entry(val idx: Int, val sec: Int, val loc: LatLng?)
        val byBus = mutableMapOf<String, MutableList<Entry>>()

        for (i in 0 until stops.length()) {
            val stop = stops.optJSONObject(i) ?: continue
            val stopId = stop.optString("busStopId").removePrefix("K75P-")
            val idx = indexOf[stopId] ?: continue
            val buses = stop.optJSONArray("bus") ?: continue
            for (j in 0 until buses.length()) {
                val b = buses.optJSONObject(j) ?: continue
                val sec = b.optInt("arrivalTimeInSecond", -1)
                if (sec < 0 || sec >= 108000) continue
                val locObj = b.optJSONObject("busLocation")
                val loc = if (locObj != null && locObj.optDouble("latitude", 0.0) != 0.0) {
                    LatLng(locObj.optDouble("latitude"), locObj.optDouble("longitude"))
                } else null
                byBus.getOrPut(b.optString("busId", "?")) { mutableListOf() }.add(Entry(idx, sec, loc))
            }
        }

        val out = mutableListOf<BusMarker>()
        for ((id, entries) in byBus) {
            val sorted = entries.sortedBy { it.sec }
            val next = sorted.firstOrNull() ?: continue
            val n2 = sorted.firstOrNull { it.idx != next.idx && it.sec > next.sec }
            val gap = n2?.let { kotlin.math.max(30, it.sec - next.sec) } ?: 120
            val f = if (next.sec == 0) 1f else ((gap - next.sec).toFloat() / gap).coerceIn(0f, 1f)
            val ref = if (next.idx == 0) f else next.idx - 1 + f

            var pos = next.loc?.let { gpsPos(it, ref) } ?: ref
            prev[id]?.let { last ->
                var d = pos - last
                if (d < -0.3f) d = -0.3f
                if (d > 0.9f) d = 0.9f
                pos = last + d * 0.55f
            }
            pos = pos.coerceIn(0f, (KN - 1).toFloat())
            out += BusMarker(
                id = id, pos = pos, nextIdx = next.idx,
                nextName = StaticData.k75pStops.getOrNull(next.idx)?.name ?: "",
                mins = if (next.sec == 0) 0 else (next.sec + 59) / 60,
                gps = next.loc != null,
            )
        }
        return out.sortedBy { it.pos }
    }
}
