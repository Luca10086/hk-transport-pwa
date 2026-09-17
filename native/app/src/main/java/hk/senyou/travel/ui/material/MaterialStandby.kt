package hk.senyou.travel.ui.material

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import hk.senyou.travel.data.AlarmRepo
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.NowPlaying
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StandbyAudio
import hk.senyou.travel.data.Weather
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.util.Calendar
import java.util.Locale

private val M3_FACES = listOf("鬧鐘", "日曆", "天氣", "音樂")

/**
 * **Material 3 版待機顯示**（獨立實作；W10M 版為 `ui/StandbyScreen.kt`，兩者無共用程式碼）。
 *
 * M3 語意：`Surface`（colorScheme.surface）為底、`HorizontalPager` 換頁、
 * 大鐘使用 `displayLarge`、動作使用 `FilledButton`／`FilledTonalButton`、
 * 進度使用 `LinearProgressIndicator`、時間選擇使用 `ModalBottomSheet` + M3 `TimePicker`
 * （刻意不用 Dialog 視窗：M3 在手機上偏好底部工作表容器，也避開過去對話框路徑的裝置差異）。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaterialStandbyScreen(
    onExit: () -> Unit,
    settings: Settings,
    onSettings: (Settings) -> Unit,
    initialPage: Int = 0,
) {
    val ctx = LocalContext.current
    var page by remember { mutableIntStateOf(initialPage) }
    var tick by remember { mutableIntStateOf(0) }
    var pick by remember { mutableStateOf(false) }
    val pager = rememberPagerState(initialPage = initialPage) { M3_FACES.size }

    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            while (true) {
                delay(1000)
                tick++
            }
        }
    }
    LaunchedEffect(page) { pager.animateScrollToPage(page) }

    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.surface) {
        Box(Modifier.fillMaxSize()) {
            HorizontalPager(state = pager, modifier = Modifier.fillMaxSize()) { i ->
                when (i) {
                    0 -> M3AlarmFace(
                        tick = tick,
                        settings = settings,
                        onSetAlarm = { pick = true },
                        onExit = onExit,
                    )

                    1 -> M3CalendarFace(tick)
                    2 -> M3WeatherFace(settings)
                    else -> M3MusicFace(tick)
                }
            }
            /* 頁面指示器（M3 慣用：小圓點，選中為主色） */
            Row(
                Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                repeat(M3_FACES.size) { i ->
                    Box(
                        Modifier
                            .size(if (i == pager.currentPage) 10.dp else 8.dp)
                            .clip(CircleShape)
                            .background(
                                if (i == pager.currentPage) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.outlineVariant
                                },
                            ),
                    )
                }
            }
        }
    }

    if (pick) {
        val st = rememberTimePickerState(
            initialHour = settings.alarmHour,
            initialMinute = settings.alarmMinute,
            is24Hour = true,
        )
        ModalBottomSheet(onDismissRequest = { pick = false }) {
            Column(
                Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text("設定鬧鐘", style = MaterialTheme.typography.titleLarge)
                Spacer(Modifier.height(16.dp))
                TimePicker(state = st)
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (settings.alarmOn) {
                        FilledTonalButton(onClick = {
                            onSettings(settings.copy(alarmOn = false))
                            AlarmRepo.cancel(ctx)
                            pick = false
                        }) { Text("關閉鬧鐘") }
                    }
                    FilledTonalButton(onClick = { pick = false }) { Text("取消") }
                    androidx.compose.material3.FilledTonalButton(
                        onClick = {
                            onSettings(settings.copy(alarmOn = true, alarmHour = st.hour, alarmMinute = st.minute))
                            AlarmRepo.schedule(ctx, st.hour, st.minute)
                            pick = false
                        },
                    ) { Text("確定") }
                }
                Spacer(Modifier.height(28.dp))
            }
        }
    }
}

@Composable
private fun M3AlarmFace(
    tick: Int,
    settings: Settings,
    onSetAlarm: () -> Unit,
    onExit: () -> Unit,
) {
    val ctx = LocalContext.current
    val ringing = AlarmRepo.ringing
    val clock = remember(tick) { hhmm() }
    LaunchedEffect(ringing) {
        if (DebugFlags.staticUi) return@LaunchedEffect
        if (ringing) StandbyAudio.startRing() else StandbyAudio.stopRing()
    }
    Column(
        Modifier.fillMaxSize().padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(24.dp))
        Text(
            greeting(),
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.weight(1f))
        Text(
            clock,
            style = MaterialTheme.typography.displayLarge,
            fontWeight = FontWeight.Normal,
            maxLines = 1,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            if (ringing) {
                "響鈴中 · ${fmtHm(settings.alarmHour, settings.alarmMinute)}"
            } else if (settings.alarmOn) {
                "鬧鐘 ${fmtHm(settings.alarmHour, settings.alarmMinute)}（每天）"
            } else {
                "鬧鐘未設定"
            },
            style = MaterialTheme.typography.bodyLarge,
            color = if (ringing) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.weight(1f))
        if (ringing) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                FilledTonalButton(onClick = {
                    AlarmRepo.ringing = false
                    StandbyAudio.stopRing()
                    onExit()
                }) { Text("停止") }

                androidx.compose.material3.FilledTonalButton(onClick = {
                    AlarmRepo.ringing = false
                    StandbyAudio.stopRing()
                    AlarmRepo.snooze(ctx, 10)
                    onExit()
                }) { Text("貪睡 10 分鐘") }
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                FilledTonalButton(onClick = onExit) { Text("關閉") }
                androidx.compose.material3.FilledTonalButton(onClick = onSetAlarm) { Text("設定鬧鐘") }
            }
        }
        Spacer(Modifier.height(40.dp))
    }
}

@Composable
private fun M3CalendarFace(tick: Int) {
    val cal = remember(tick / 30) { Calendar.getInstance() }
    val year = cal.get(Calendar.YEAR)
    val month = cal.get(Calendar.MONTH)
    val today = cal.get(Calendar.DAY_OF_MONTH)
    val first = remember(tick / 30) {
        (cal.clone() as Calendar).apply { set(Calendar.DAY_OF_MONTH, 1) }
    }
    val leading = (first.get(Calendar.DAY_OF_WEEK) - Calendar.SUNDAY + 7) % 7
    val days = cal.getActualMaximum(Calendar.DAY_OF_MONTH)

    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("$year 年 ${month + 1} 月", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(16.dp))
        Row(Modifier.fillMaxWidth()) {
            listOf("日", "一", "二", "三", "四", "五", "六").forEach { d ->
                Text(
                    d,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        Spacer(Modifier.height(8.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(MaterialTheme.colorScheme.outlineVariant))
        for (row in 0 until 6) {
            Row(Modifier.fillMaxWidth().weight(1f)) {
                for (col in 0 until 7) {
                    val day = row * 7 + col - leading + 1
                    Box(Modifier.weight(1f).fillMaxSize(), contentAlignment = Alignment.Center) {
                        if (day in 1..days) {
                            val isToday = day == today
                            Box(
                                Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (isToday) MaterialTheme.colorScheme.primary else androidx.compose.ui.graphics.Color.Transparent,
                                    ),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(
                                    "$day",
                                    style = MaterialTheme.typography.bodyLarge,
                                    color = if (isToday) {
                                        MaterialTheme.colorScheme.onPrimary
                                    } else {
                                        MaterialTheme.colorScheme.onSurface
                                    },
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun M3WeatherFace(settings: Settings) {
    var w by remember { mutableStateOf<Weather?>(null) }
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            runCatching { w = Hko.fetch(prefer = settings.weatherPlace) }
        }
    }
    val cur = w
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text(
            cur?.place?.takeIf { it.isNotBlank() } ?: settings.weatherPlace,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(8.dp))
        Text(cur?.temp?.let { "$it°" } ?: "—", style = MaterialTheme.typography.displayLarge)
        Text(
            cur?.desc?.takeIf { it.isNotBlank() } ?: "載入中…",
            style = MaterialTheme.typography.titleLarge,
        )
        Text(
            listOfNotNull(
                cur?.humid?.let { "濕度 $it%" },
                cur?.uv?.let { "紫外線 $it" },
                cur?.updated?.takeIf { it.isNotBlank() }?.let { "更新 $it" },
            ).joinToString(" · ").ifBlank { "—" },
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(20.dp))
        val days = cur?.days ?: emptyList()
        Card(Modifier.fillMaxWidth()) {
            Column {
                days.take(3).forEachIndexed { i, d ->
                    ListItem(
                        headlineContent = { Text(d.label.ifBlank { d.week }) },
                        supportingContent = { Text(d.desc.ifBlank { "—" }) },
                        trailingContent = { Text("${d.min ?: "-"}~${d.max ?: "-"}°") },
                        colors = ListItemDefaults.colors(containerColor = androidx.compose.ui.graphics.Color.Transparent),
                    )
                    if (i < days.take(3).lastIndex) HorizontalDivider()
                }
                if (days.isEmpty()) {
                    ListItem(
                        headlineContent = { Text("暫無預報資料") },
                        supportingContent = { Text("需要網路連線") },
                        colors = ListItemDefaults.colors(containerColor = androidx.compose.ui.graphics.Color.Transparent),
                    )
                }
            }
        }
    }
}

@Composable
private fun M3MusicFace(tick: Int) {
    val ctx = LocalContext.current
    var sys by remember { mutableStateOf<NowPlaying.Track?>(null) }
    var access by remember { mutableStateOf(NowPlaying.hasAccess(ctx)) }
    var playing by remember { mutableStateOf(StandbyAudio.isPlaying) }
    var pos by remember { mutableStateOf(0L) }

    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            var was = access
            while (true) {
                access = NowPlaying.hasAccess(ctx)
                if (access && !was) NowPlaying.rebind(ctx)
                was = access
                sys = if (access) withContext(Dispatchers.IO) { NowPlaying.current(ctx) } else null
                playing = sys?.playing ?: StandbyAudio.isPlaying
                pos = sys?.positionMs ?: StandbyAudio.positionMs
                delay(1000)
            }
        }
    }
    val t = sys
    Column(
        Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.weight(0.4f))
        Box(
            Modifier
                .size(180.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center,
        ) {
            val art = t?.art
            if (art != null) {
                androidx.compose.foundation.Image(
                    bitmap = remember(art) { art.asImageBitmap() },
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            } else {
                Icon(
                    Icons.Filled.MusicNote,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(56.dp),
                )
            }
        }
        Spacer(Modifier.height(20.dp))
        Text(
            t?.title ?: StandbyAudio.titles.getOrElse(StandbyAudio.current) { "—" },
            style = MaterialTheme.typography.headlineSmall,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            t?.let { it.artist.ifBlank { it.album.ifBlank { "系統播放器" } } }
                ?: StandbyAudio.artists.getOrElse(StandbyAudio.current) { "" },
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Spacer(Modifier.height(24.dp))
        val total = t?.durationMs?.takeIf { it > 0 } ?: (StandbyAudio.NOMINAL_SECONDS * 1000L)
        LinearProgressIndicator(
            progress = { if (total > 0) (pos.toFloat() / total).coerceIn(0f, 1f) else 0f },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(24.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            FilledIconButton(onClick = {
                if (t != null) NowPlaying.control(ctx, NowPlaying.Action.Prev) else StandbyAudio.prev()
            }) { Icon(Icons.Filled.SkipPrevious, contentDescription = "上一首") }

            androidx.compose.material3.FilledIconButton(onClick = {
                if (t != null) NowPlaying.control(ctx, NowPlaying.Action.Play) else StandbyAudio.toggle()
                playing = !playing
            }) {
                Icon(
                    if (playing) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                    contentDescription = if (playing) "暫停" else "播放",
                )
            }
            FilledIconButton(onClick = {
                if (t != null) NowPlaying.control(ctx, NowPlaying.Action.Next) else StandbyAudio.next()
            }) { Icon(Icons.Filled.SkipNext, contentDescription = "下一首") }
        }
        Spacer(Modifier.weight(0.4f))
        if (!access) {
            TextButton(onClick = { NowPlaying.requestAccess(ctx) }) {
                Text("連接系統播放器（需授予通知使用權）")
            }
        }
        Spacer(Modifier.height(48.dp))
    }
}

private fun hhmm(): String {
    val c = Calendar.getInstance()
    return fmtHm(c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE))
}

private fun fmtHm(h: Int, m: Int): String =
    String.format(Locale.getDefault(), "%02d:%02d", h, m)

private fun greeting(): String {
    val h = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    return when {
        h < 12 -> "早安"
        h < 18 -> "午安"
        else -> "晚安"
    }
}
