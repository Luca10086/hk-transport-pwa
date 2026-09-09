package hk.senyou.travel.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
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

    suspend fun get(url: String): String? = withContext(Dispatchers.IO) {
        if (DebugFlags.offline) return@withContext null
        try {
            val req = Request.Builder()
                .url(url)
                .header("User-Agent", "SenyouTravel/3.0 (Android)")
                .build()
            client.newCall(req).execute().use { r -> if (r.isSuccessful) r.body?.string() else null }
        } catch (e: Exception) {
            null
        }
    }

    suspend fun getJson(url: String): JSONObject? =
        get(url)?.let { runCatching { JSONObject(it) }.getOrNull() }

    suspend fun getArray(url: String): JSONArray? =
        get(url)?.let { runCatching { JSONArray(it) }.getOrNull() }

    suspend fun postJson(url: String, body: JSONObject): JSONObject? = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder()
                .url(url)
                .post(body.toString().toRequestBody(JSON))
                .header("User-Agent", "SenyouTravel/3.0 (Android)")
                .build()
            client.newCall(req).execute().use { r ->
                if (r.isSuccessful) r.body?.string()?.let { s -> runCatching { JSONObject(s) }.getOrNull() } else null
            }
        } catch (e: Exception) {
            null
        }
    }
}
