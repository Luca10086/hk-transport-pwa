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

    /** 段內投影：回傳 (距離米, 段內比例) */
    private fun segFrac(a: LatLng, b: LatLng, p: LatLng): Pair<Double, Double> {
        val kx = 111320.0 * kotlin.math.cos(Math.toRadians(a.lat))
        val ky = 110540.0
        val bx = (b.lng - a.lng) * kx
        val by = (b.lat - a.lat) * ky
        val px = (p.lng - a.lng) * kx
        val py = (p.lat - a.lat) * ky
        val len2 = bx * bx + by * by
        if (len2 < 1e-6) return sqrt(px * px + py * py) to 0.0
        val t = ((px * bx + py * by) / len2).coerceIn(0.0, 1.0)
        val cx = bx * t
        val cy = by * t
        return sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy)) to t
    }

    private fun segIndex(k: Int): Int {
        val n = KN - 1
        return ((k % n) + n) % n
    }

    /**
     * GPS 點 → 路線位置（stop-index 空間）。
     *
     * 舊版用「全線最近段 + 弱先驗」，在 K75P 這種 U 形循環線上會出錯：
     * 天水圍去程與回程的路段實際相距很近，公車會被吸到對面那條臂上，看起來就「偏很多」。
     *
     * 現在**完全不使用全局最近段**：以港鐵 AVL 的「下一班到站」為錨，
     * 公車必然位於 nextIdx-2 ～ nextIdx 之間（必要時放寬到 -4），只在這個窗口內找最近段，
     * 因此永遠不可能跳到對面那條臂；窗口內找不到合理距離時回傳 null，
     * 由呼叫端改用 ETA 推估位置（仍落在正確路段上）。
     */
    fun gpsPos(p: LatLng, nextIdx: Int, ref: Float, prev: Float?): Float? {
        for (w in intArrayOf(2, 4)) {
            var best: Float? = null
            var bestD = Double.MAX_VALUE
            var bestScore = Double.MAX_VALUE
            for (k in (nextIdx - w)..nextIdx) {
                val i = segIndex(k)
                val a = coords(i) ?: continue
                val b = coords(i + 1) ?: continue
                val (d, f) = segFrac(a, b, p)
                if (d > 500.0) continue
                val cand = (i + f).toFloat()
                // 距離為主；站序連續性與 ETA 推估只作輕微修正（不會蓋過真實距離差）
                val dPrev = if (prev != null) circDist(cand, prev) else 0f
                val dRef = circDist(cand, ref)
                val score = d + 20.0 * dPrev + 8.0 * dRef
                if (score < bestScore) {
                    bestScore = score
                    bestD = d
                    best = cand
                }
            }
            if (best != null && bestD < 500.0) {
                // 循環線：站 22 ≡ 站 0（同為天瑞）。歸一到 [0, 21]，否則標記會畫到另一端的「天瑞」
                val r = best
                return if (r >= (KN - 1).toFloat()) r - (KN - 1).toFloat() else r
            }
        }
        return null
    }

    /** 環形站序距離（0..KN-1 首尾相連） */
    private fun circDist(a: Float, b: Float): Float {
        val n = KN - 1
        val d = abs(a - b) % n
        return kotlin.math.min(d, n - d)
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

            var pos = next.loc?.let { gpsPos(it, next.idx, ref, prev[id]) } ?: ref
            prev[id]?.let { last ->
                pos = if (next.loc != null) {
                    // 有 GPS：以實測為準，只做抖動死區，不再拖尾（舊版每次只走 55% 會永遠落後好幾站）
                    val d = pos - last
                    if (abs(d) < 0.03f) last else last + d * 0.9f
                } else {
                    // 無 GPS：用 ETA 推估，允許較大跳動但抑制亂跳
                    last + (pos - last).coerceIn(-0.5f, 2f) * 0.6f
                }
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
