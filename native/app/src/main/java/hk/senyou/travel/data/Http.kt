package hk.senyou.travel.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/** 原生端無 CORS 限制：直連各公共交通開放數據接口 */
object Http {
    private val JSON = "application/json; charset=utf-8".toMediaType()
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    /** 實際網路請求（阻塞，只能在 IO 執行緒呼叫）；body 為 null 時用 GET */
    private fun call(url: String, body: RequestBody? = null): String? = try {
        val b = Request.Builder()
            .url(url)
            .header("User-Agent", "SenyouTravel/${hk.senyou.travel.BuildConfig.VERSION_NAME} (Android)")
        if (body != null) b.post(body)
        client.newCall(b.build()).execute().use { r -> if (r.isSuccessful) r.body?.string() else null }
    } catch (e: Exception) {
        null
    }

    suspend fun get(url: String): String? = withContext(Dispatchers.IO) {
        if (DebugFlags.offline) return@withContext null
        call(url)
    }

    /** 取得並解析 JSON：請求與解析都在 IO 執行緒（KMB /stop/ 等大回應不再佔用主執行緒） */
    suspend fun getJson(url: String): JSONObject? = withContext(Dispatchers.IO) {
        if (DebugFlags.offline) return@withContext null
        call(url)?.let { runCatching { JSONObject(it) }.getOrNull() }
    }

    suspend fun getArray(url: String): JSONArray? = withContext(Dispatchers.IO) {
        if (DebugFlags.offline) return@withContext null
        call(url)?.let { runCatching { JSONArray(it) }.getOrNull() }
    }

    suspend fun postJson(url: String, body: JSONObject): JSONObject? = withContext(Dispatchers.IO) {
        if (DebugFlags.offline) return@withContext null
        call(url, body.toString().toRequestBody(JSON))?.let { runCatching { JSONObject(it) }.getOrNull() }
    }
}
