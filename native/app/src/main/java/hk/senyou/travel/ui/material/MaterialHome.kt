package hk.senyou.travel.ui.material

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.foundation.clickable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.AiOption
import hk.senyou.travel.data.AiRepo
import hk.senyou.travel.data.Api
import hk.senyou.travel.data.Cache
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.displayName
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.Sushiro
import hk.senyou.travel.data.SushiroStore
import hk.senyou.travel.data.Weather
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** 搜尋模式（與 W10M 版同一組語意；順序 = 篩選晶片順序）。 */
internal val M3_SEARCH_MODES: List<Pair<String, String>> = listOf(
    "bus" to "公交", "mtrbus" to "港鐵巴士", "mtr" to "港鐵", "lrt" to "輕鐵", "overnight" to "通宵",
)

/**
 * Material 3 首頁：以 M3 卡片／清單呈現天氣、K75P、收藏與壽司郎。
 * 資料全部取自共用的 data 層（不共用任何 W10M 視覺程式碼）。
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun MaterialHomePane(
    settings: Settings,
    query: String,
    onQuery: (String) -> Unit,
    modeIndex: Int,
    onMode: (Int) -> Unit,
    onAiPick: (String, String) -> Unit,
    onOpenSettings: () -> Unit,
    results: List<SearchItem>,
    searching: Boolean,
    onOpenStandby: () -> Unit,
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var aiOpen by remember { mutableStateOf(false) }
    var aiQuery by remember { mutableStateOf("") }
    var aiReply by remember { mutableStateOf("") }
    var aiOptions by remember { mutableStateOf<List<AiOption>>(emptyList()) }
    var aiError by remember { mutableStateOf<String?>(null) }
    var aiLoading by remember { mutableStateOf(false) }
    val aiSheetState = rememberModalBottomSheetState()
    var weather by remember { mutableStateOf<Weather?>(null) }
    var k75pMins by remember { mutableStateOf<Int?>(Cache.k75pMins) }
    var k75pLive by remember { mutableStateOf(Cache.k75pLive) }
    var sushi by remember { mutableStateOf<List<SushiroStore>>(emptyList()) }
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    var favEtas by remember { mutableStateOf<Map<String, Int?>>(emptyMap()) }

    LaunchedEffect(settings.weatherPlace, settings.refresh) {
        weather = runCatching { Hko.fetch(prefer = settings.weatherPlace) }.getOrNull()
        sushi = runCatching { Sushiro.fetch().first }.getOrDefault(emptyList())
        while (true) {
            if (DebugFlags.staticUi) break
            delay((settings.refresh.coerceAtLeast(15)) * 1000L)
            runCatching {
                weather = Hko.fetch(force = true, prefer = settings.weatherPlace)
                k75pMins = Api.mtrBusSchedule("K75P")?.let { d ->
                    hk.senyou.travel.data.K75PModel.build(d, emptyMap()).firstOrNull()?.mins
                }
                k75pLive = Cache.k75pLive
            }
        }
    }
    LaunchedEffect(favs) {
        if (DebugFlags.staticUi) return@LaunchedEffect
        runCatching {
            val m = mutableMapOf<String, Int?>()
            favs.take(6).forEach { f -> m[f.key] = runCatching { SearchRepo.favEta(f) }.getOrNull() }
            favEtas = m
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            OutlinedTextField(
                value = query,
                onValueChange = onQuery,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text("搜尋路線、車站或巴士站") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                trailingIcon = {
                    if (searching) CircularProgressIndicator(modifier = Modifier.width(20.dp).height(20.dp))
                },
            )
        }

        // 搜尋模式：M3 FilterChip（單選語意）＋ AI 代填關鍵字入口
        item {
            FlowRow(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                M3_SEARCH_MODES.forEachIndexed { i, (_, label) ->
                    FilterChip(
                        selected = i == modeIndex,
                        onClick = { onMode(i) },
                        label = { Text(label) },
                    )
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(
                    onClick = { aiOpen = true },
                    label = { Text("問 AI（MiMo v2.5）") },
                    leadingIcon = { Icon(Icons.Filled.AutoAwesome, contentDescription = null) },
                    border = androidx.compose.material3.AssistChipDefaults.assistChipBorder(enabled = true),
                )
                AssistChip(
                    onClick = { onQuery("") },
                    label = { Text("清除") },
                    border = androidx.compose.material3.AssistChipDefaults.assistChipBorder(enabled = true),
                )
            }
        }

        if (results.isNotEmpty()) {
            item {
                Card {
                    Column {
                        results.take(12).forEachIndexed { i, r ->
                            ListItem(
                                headlineContent = { Text(r.no.ifBlank { r.name }) },
                                supportingContent = { Text(r.cap.ifBlank { r.group }) },
                                trailingContent = {
                                    r.etaMins?.let { Text("${it} 分", style = MaterialTheme.typography.labelLarge) }
                                },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            )
                            if (i < results.take(12).lastIndex) HorizontalDivider()
                        }
                    }
                }
            }
        }

        item {
            ElevatedCard(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Filled.WbSunny,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                        )
                        Spacer(Modifier.width(12.dp))
                        Text(
                            weather?.place?.takeIf { it.isNotBlank() } ?: settings.weatherPlace,
                            style = MaterialTheme.typography.titleMedium,
                        )
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        weather?.temp?.let { "$it°" } ?: "—",
                        style = MaterialTheme.typography.displayMedium,
                    )
                    Text(
                        listOfNotNull(
                            weather?.desc?.takeIf { it.isNotBlank() },
                            weather?.humid?.let { "濕度 $it%" },
                            weather?.updated?.takeIf { it.isNotBlank() }?.let { "更新 $it" },
                        ).joinToString(" · ").ifBlank { "載入中…" },
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    val days = weather?.days ?: emptyList()
                    if (days.isNotEmpty()) {
                        Spacer(Modifier.height(12.dp))
                        HorizontalDivider()
                        Spacer(Modifier.height(12.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            days.take(3).forEach { d ->
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(d.label.ifBlank { d.week }, style = MaterialTheme.typography.labelLarge)
                                    Text(
                                        "${d.min ?: "-"}~${d.max ?: "-"}°",
                                        style = MaterialTheme.typography.bodyMedium,
                                    )
                                    Text(
                                        d.desc,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text("K75P · 天瑞 ↺ 洪水橋") },
                        supportingContent = { Text("實時 $k75pLive 班在路") },
                        leadingContent = {
                            Icon(
                                Icons.Filled.DirectionsBus,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                            )
                        },
                        trailingContent = {
                            Text(
                                k75pMins?.let { if (it <= 0) "即將" else "$it 分" } ?: "—",
                                style = MaterialTheme.typography.headlineSmall,
                            )
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text("待機顯示模式") },
                        supportingContent = { Text("床頭鐘 · 鬧鐘 · 日曆 · 天氣 · 音樂") },
                        leadingContent = {
                            Icon(
                                Icons.Filled.Alarm,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                            )
                        },
                        trailingContent = {
                            androidx.compose.material3.FilledTonalButton(onClick = onOpenStandby) { Text("開啟") }
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                }
            }
        }

        if (favs.isNotEmpty()) {
            item {
                Card(Modifier.fillMaxWidth()) {
                    Column {
                        ListItem(
                            headlineContent = { Text("收藏班次") },
                            supportingContent = { Text("${favs.size} 條") },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                        HorizontalDivider()
                        favs.take(5).forEach { f ->
                            ListItem(
                                headlineContent = { Text(f.displayName()) },
                                supportingContent = { Text(SearchRepo.favMeta(f)) },
                                trailingContent = {
                                    // 純顯示的到站時間用 Text（M3 chip 是互動元件，不應拿來當唯讀徽章）
                                    Text(
                                        favEtas[f.key]?.let { if (it <= 0) "即將" else "$it 分" } ?: "—",
                                        style = MaterialTheme.typography.titleMedium,
                                        color = MaterialTheme.colorScheme.primary,
                                    )
                                },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            )
                        }
                    }
                }
            }
        }

        if (sushi.isNotEmpty()) {
            item {
                Card(Modifier.fillMaxWidth()) {
                    Column {
                        ListItem(
                            headlineContent = { Text("壽司郎即時排隊") },
                            supportingContent = { Text(if (sushi.firstOrNull()?.waiting != null) "即時" else "快照") },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                        HorizontalDivider()
                        sushi.take(3).forEach { s ->
                            ListItem(
                                headlineContent = { Text(s.name) },
                                supportingContent = { Text(s.area) },
                                trailingContent = { Text("${s.waiting} 組", style = MaterialTheme.typography.titleMedium) },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            )
                        }
                    }
                }
            }
        }

        item { Spacer(Modifier.height(24.dp)) }
    }

    /*
     * AI 建議（MiMo v2.5）：M3 以 ModalBottomSheet 承載額外流程（不用對話框），
     * 建議結果用 ListItem 呈現關鍵字與理由，點選即代填查詢與模式。
     */
    if (aiOpen) {
        ModalBottomSheet(onDismissRequest = { aiOpen = false }, sheetState = aiSheetState) {
            MaterialAiSheetBody(
                query = aiQuery,
                onQuery = { aiQuery = it },
                reply = aiReply,
                options = aiOptions,
                error = aiError,
                loading = aiLoading,
                onAsk = {
                    scope.launch {
                        aiLoading = true
                        aiError = null
                        val r = runCatching { AiRepo.ask(aiQuery, settings) }.getOrNull()
                        aiReply = r?.reply ?: ""
                        aiOptions = r?.options ?: emptyList()
                        aiError = r?.error
                        aiLoading = false
                    }
                },
                onOpenSettings = { aiOpen = false; onOpenSettings() },
                onPick = { o -> aiOpen = false; onAiPick(o.keyword, o.mode) },
            )
        }
    }
}

/**
 * AI 建議彈出面板的內容（獨立抽出）：
 * 一來 `ModalBottomSheet` 在 M3 是**獨立視窗**，截圖只能抓 Activity 的 decorView，
 * 二來抽出來後可直接以像素截圖回歸（見 `materialAiSheet` 測試）。
 */
@Composable
internal fun MaterialAiSheetBody(
    query: String,
    onQuery: (String) -> Unit,
    reply: String,
    options: List<AiOption>,
    error: String?,
    loading: Boolean,
    onAsk: () -> Unit,
    onOpenSettings: () -> Unit,
    onPick: (AiOption) -> Unit,
) {
    Column(Modifier.fillMaxWidth().padding(horizontal = 24.dp).padding(bottom = 24.dp)) {
        Text("AI 行程建議", style = MaterialTheme.typography.titleLarge)
        Text(
            "由 MiMo v2.5 依問題代填搜尋關鍵字；API 金鑰僅儲存於本機",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = query,
            onValueChange = onQuery,
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            label = { Text("例如：天水圍去機場通宵點去？") },
        )
        Spacer(Modifier.height(8.dp))
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Button(onClick = onAsk, enabled = query.isNotBlank() && !loading) {
                if (loading) {
                    CircularProgressIndicator(Modifier.width(18.dp).height(18.dp))
                    Spacer(Modifier.width(8.dp))
                }
                Text(if (loading) "思考中" else "取得建議")
            }
            TextButton(onClick = onOpenSettings) { Text("AI 設定") }
        }
        error?.let {
            Text(
                it,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
        if (reply.isNotBlank()) {
            Spacer(Modifier.height(8.dp))
            Text(reply, style = MaterialTheme.typography.bodyMedium)
        }
        if (options.isNotEmpty()) {
            Spacer(Modifier.height(8.dp))
            Card(Modifier.fillMaxWidth()) {
                Column {
                    options.forEachIndexed { i, o ->
                        ListItem(
                            headlineContent = { Text(o.keyword) },
                            supportingContent = { Text(o.why) },
                            trailingContent = {
                                Icon(Icons.Filled.ChevronRight, contentDescription = null)
                            },
                            modifier = Modifier.clickable { onPick(o) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                        if (i < options.lastIndex) HorizontalDivider()
                    }
                }
            }
        }
    }
}
