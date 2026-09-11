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

/** AI 建議中的一個交通選項：keyword 交給本機真實資料層再查一次，避免模型編造班次 */
data class AiOption(val keyword: String, val mode: String, val why: String)

/** AI 回覆 */
data class AiAdvice(
    val reply: String,
    val options: List<AiOption> = emptyList(),
    val error: String? = null,
)

/**
 * MiMo v2.5 路線建議。
 *
 * 官方 API（[Xiaomi MiMo 開放平台 · OpenAI 相容](https://mimo.mi.com/docs/zh-CN/api/chat/openai-api)）：
 * · `POST {base}/chat/completions`，base 預設 `https://api.xiaomimimo.com/v1`
 * · 認證二選一：標頭 `api-key: <KEY>` 或 `Authorization: Bearer <KEY>`
 * · 模型：`mimo-v2.5`、`mimo-v2.5-pro`
 * · 支援 `response_format = {"type":"json_object"}`
 *
 * **設計原則**：模型只負責「聽懂人話 → 抽出可查詢的路線關鍵字／車站名 + 說明理由」，
 * 實際班次一律由本機的 KMB／CTB／NLB／港鐵／輕鐵 API 查，避免模型編造到站時間。
 */
object AiRepo {

    private val JSON = "application/json; charset=utf-8".toMediaType()

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(45, TimeUnit.SECONDS)   // 推理模型較慢
        .build()

    private const val SYS = """你是香港公共交通路線規劃助手，服務對象是香港屯門／天水圍／元朗一帶的乘客。
使用者會用自然語言描述想去的地方。你的任務：
1) 從中抽出「可以在本機交通資料庫查到的查詢關鍵字」，只能是：巴士路線號（如 69X、969、268C）、
   港鐵車站名（如 天水圍、朗屏、香港）、輕鐵站名、或港鐵巴士路線號（如 K75P）。
2) 針對每個候選給一句簡短理由（繁體中文，20 字內）。
3) 不要編造任何班次時間、票價或行車時間。

只輸出 JSON，格式：
{"reply":"給使用者的整體建議，繁體中文，60 字內","options":[{"keyword":"969","mode":"bus","why":"直達銅鑼灣"}]}
mode 只能是 bus / mtrbus / mtr / lrt 其中之一。options 最多 4 個。"""

    /**
     * 詢問 MiMo。沒有填 API Key 時回傳帶 error 的結果（呼叫端據此提示去設定頁填寫）。
     */
    suspend fun ask(question: String, settings: Settings): AiAdvice = withContext(Dispatchers.IO) {
        val key = settings.aiKey.trim()
        if (key.isBlank()) {
            return@withContext AiAdvice("", error = "尚未設定 API 金鑰，請到「設定 → AI 建議」填寫")
        }
        val base = settings.aiBase.trim().ifBlank { "https://api.xiaomimimo.com/v1" }.trimEnd('/')
        val model = settings.aiModel.trim().ifBlank { "mimo-v2.5" }

        val body = JSONObject()
            .put("model", model)
            .put(
                "messages",
                JSONArray()
                    .put(JSONObject().put("role", "system").put("content", SYS))
                    .put(JSONObject().put("role", "user").put("content", question)),
            )
            .put("response_format", JSONObject().put("type", "json_object"))
            .put("max_completion_tokens", 800)
            .put("stream", false)

        val text = runCatching { call("$base/chat/completions", key, body.toString()) }
            .getOrElse { return@withContext AiAdvice("", error = "連線失敗：${it.message ?: "未知錯誤"}") }
            ?: return@withContext AiAdvice("", error = "伺服器沒有回應（請檢查網路或 API 位址）")

        parse(text)
    }

    private fun call(url: String, key: String, payload: String): String? {
        val req = Request.Builder()
            .url(url)
            .post(payload.toRequestBody(JSON))
            // 官方兩種認證都送，兼容自建／其他 OpenAI 相容端點
            .header("api-key", key)
            .header("Authorization", "Bearer $key")
            .header("Content-Type", "application/json")
            .header("User-Agent", "SenyouTravel/4.0 (Android)")
            .build()
        client.newCall(req).execute().use { r ->
            val s = r.body?.string() ?: return null
            if (!r.isSuccessful) {
                // 盡量把伺服器的錯誤訊息帶回來（例如金鑰無效）
                val msg = runCatching { JSONObject(s).optJSONObject("error")?.optString("message") }.getOrNull()
                throw IllegalStateException("HTTP ${r.code}${if (msg.isNullOrBlank()) "" else "：$msg"}")
            }
            // content 可能在 choices[0].message.content
            val content = runCatching {
                JSONObject(s).optJSONArray("choices")?.optJSONObject(0)
                    ?.optJSONObject("message")?.optString("content")
            }.getOrNull()
            return content?.takeIf { it.isNotBlank() }
        }
    }

    /** 解析模型輸出（容錯：模型可能包 ```json 或前後有雜訊） */
    private fun parse(raw: String): AiAdvice {
        val s = raw.trim().removePrefix("```json").removePrefix("```").removeSuffix("```").trim()
        val obj = runCatching { JSONObject(s) }.getOrNull()
            ?: runCatching {
                val a = s.indexOf('{'); val b = s.lastIndexOf('}')
                if (a >= 0 && b > a) JSONObject(s.substring(a, b + 1)) else null
            }.getOrNull()
            ?: return AiAdvice("", error = "AI 回覆格式無法解析")

        val reply = obj.optString("reply").ifBlank { obj.optString("message") }
        val arr = obj.optJSONArray("options") ?: JSONArray()
        val opts = (0 until arr.length()).mapNotNull { i ->
            val o = arr.optJSONObject(i) ?: return@mapNotNull null
            val kw = o.optString("keyword").trim()
            if (kw.isBlank()) null
            else AiOption(
                keyword = kw,
                mode = o.optString("mode", "bus").lowercase().let {
                    if (it in listOf("bus", "mtrbus", "mtr", "lrt")) it else "bus"
                },
                why = o.optString("why").trim(),
            )
        }.take(4)

        return AiAdvice(reply = reply, options = opts)
    }
}
