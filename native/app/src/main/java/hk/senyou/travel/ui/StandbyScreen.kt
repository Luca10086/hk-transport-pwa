package hk.senyou.travel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.AlarmRepo
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.NowPlaying
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StandbyAudio
import hk.senyou.travel.data.Weather
import kotlinx.coroutines.delay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Calendar
import java.util.Locale

/**
 * iPhone Duo「待機顯示模式」多畫面（依 2026-09-10 Apple 秋季發表會官方展示）。
 *
 * · 鬧鐘（page 0）：發表會展示圖 1:1 復刻，並接上真正的鬧鐘
 *   （AlarmManager 精確排程 → AlarmReceiver 喚起 → 響鈴）
 * · 日曆：今日紅圈；天氣：香港天文台實時資料；音樂：內建合成音真實播放
 * · 左右滑動切換 + 底部頁面指示點
 *
 * 尺寸以 min(寬, 高) 換算 → 橫向／半開合時不會再裁切文字。
 * 換頁不使用 Pager，改拖曳位移；外層 try/catch 保險，任何畫面出錯退回鬧鐘畫面。
 */
@Composable
fun StandbyScreen(
    onExit: () -> Unit,
    settings: Settings = Settings(),
    onSettings: (Settings) -> Unit = {},
    initialPage: Int = 0,
) {
    var page by remember { mutableStateOf(initialPage) }
    var drag by remember { mutableStateOf(0f) }

    BoxWithConstraints(Modifier.fillMaxSize().background(Standby.Bg)) {
        val wp = maxWidth.value
        Box(
            Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectHorizontalDragGestures(
                        onDragEnd = {
                            val threshold = wp * 0.15f
                            page = when {
                                drag < -threshold -> (page + 1).coerceAtMost(STANDBY_FACE_COUNT - 1)
                                drag > threshold -> (page - 1).coerceAtLeast(0)
                                else -> page
                            }
                            drag = 0f
                        },
                        onHorizontalDrag = { _, d -> drag += d },
                    )
                },
        ) {
            Box(Modifier.fillMaxSize().graphicsLayer { translationX = drag }) {
                StandbyFace(page = page, onExit = onExit, settings = settings, onSettings = onSettings)
            }
        }
        Row(
            Modifier.align(Alignment.BottomCenter).padding(bottom = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            repeat(STANDBY_FACE_COUNT) { i ->
                Box(
                    Modifier
                        .size(if (i == page) 7.dp else 6.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color.White.copy(alpha = if (i == page) 0.92f else 0.28f)),
                )
            }
        }
    }
}

/** 待機畫面的頁數（鬧鐘 / 日曆 / 天氣 / 音樂） */
const val STANDBY_FACE_COUNT = 4

/** 單一待機畫面（抽離換頁邏輯以便截圖測試逐頁驗證） */
@Composable
fun StandbyFace(
    page: Int,
    onExit: () -> Unit,
    settings: Settings = Settings(),
    onSettings: (Settings) -> Unit = {},
) {
    when (page) {
        0 -> AlarmFace(onExit, settings, onSettings)
        1 -> StandbyCalendarFace()
        2 -> StandbyWeatherFace()
        else -> StandbyMusicFace()
    }
}

/* ---------------- 鬧鐘（1:1 復刻 + 真鬧鐘） ---------------- */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AlarmFace(onExit: () -> Unit, settings: Settings, onSettings: (Settings) -> Unit) {
    val ctx = LocalContext.current
    var pick by remember { mutableStateOf(false) }
    val ringing = AlarmRepo.ringing

    LaunchedEffect(ringing) {
        if (ringing && !DebugFlags.staticUi) StandbyAudio.startRing() else StandbyAudio.stopRing()
    }

    Box(Modifier.fillMaxSize()) {
        DuoAlarmScreen(
            onStop = {
                AlarmRepo.ringing = false
                StandbyAudio.stopRing()
                onExit()
            },
            onSnooze = {
                if (AlarmRepo.ringing) {
                    AlarmRepo.ringing = false
                    StandbyAudio.stopRing()
                    AlarmRepo.snooze(ctx, 10)
                    onExit()
                }
            },
        )
        Row(
            Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
                .clip(RoundedCornerShape(50))
                .background(Color.White.copy(alpha = 0.10f))
                .clickable { pick = true }
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                if (settings.alarmOn) alarmChip(settings.alarmHour, settings.alarmMinute) else "⏰ 設定鬧鐘",
                color = if (settings.alarmOn) Standby.Amber else Standby.Dim,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
            )
        }
        if (ringing) {
            Text(
                "響鈴中",
                color = Standby.Amber,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.align(Alignment.TopStart).padding(18.dp),
            )
        }
    }

    /* WP/UWP 風格時間選擇：不使用 Material3 對話框（真機 Android 16 曾於此路徑閃退） */
    if (pick) {
        var hh by remember { mutableIntStateOf(settings.alarmHour) }
        var mm by remember { mutableIntStateOf(settings.alarmMinute) }
        Box(
            Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.78f))
                .clickable { pick = false },
            contentAlignment = Alignment.Center,
        ) {
            Column(
                Modifier
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF1F1F1F))
                    .padding(horizontal = 22.dp, vertical = 18.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text("設定鬧鐘", color = Standby.Text, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height((12f).dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TimeStepper(hh, 24) { hh = it }
                    Text(
                        ":",
                        color = Standby.Text,
                        fontSize = 34.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp),
                    )
                    TimeStepper(mm, 60) { mm = it }
                }
                Spacer(Modifier.height((14f).dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (settings.alarmOn) {
                        PillButton("關閉") {
                            onSettings(settings.copy(alarmOn = false))
                            AlarmRepo.cancel(ctx)
                            pick = false
                        }
                    }
                    PillButton("取消") { pick = false }
                    PillButton("確定", accent = true) {
                        onSettings(settings.copy(alarmOn = true, alarmHour = hh, alarmMinute = mm))
                        AlarmRepo.schedule(ctx, hh, mm)
                        pick = false
                    }
                }
            }
        }
    }
}

/** 時／分步進器（WP 風格：上下加減，無數字鍵盤、無對話框） */
@Composable
private fun TimeStepper(value: Int, modulo: Int, onChange: (Int) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            "+",
            color = Standby.Amber,
            fontSize = 22.sp,
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .clickable { onChange((value + 1) % modulo) }
                .padding(horizontal = 14.dp, vertical = 2.dp),
        )
        Text(
            String.format(Locale.getDefault(), "%02d", value),
            color = Standby.Text,
            fontSize = 40.sp,
            fontWeight = FontWeight.Medium,
        )
        Text(
            "-",
            color = Standby.Amber,
            fontSize = 22.sp,
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .clickable { onChange((value - 1 + modulo) % modulo) }
                .padding(horizontal = 14.dp, vertical = 2.dp),
        )
    }
}

/** 待機畫面用藥丸按鈕 */
@Composable
private fun PillButton(label: String, accent: Boolean = false, onClick: () -> Unit) {
    Box(
        Modifier
            .clip(RoundedCornerShape(50))
            .background(if (accent) Standby.Amber else Color.White.copy(alpha = 0.12f))
            .clickable { onClick() }
            .padding(horizontal = 18.dp, vertical = 9.dp),
    ) {
        Text(label, color = if (accent) Color.Black else Standby.Text, fontSize = 15.sp, fontWeight = FontWeight.Medium)
    }
}


/* ---------------- 共用小標頭 ---------------- */

@Composable
private fun StandbyHeader(u: Float) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(
            weekdayDay(),
            color = Standby.Dim,
            fontSize = (u * 0.038f).sp,
            fontWeight = FontWeight.Medium,
            letterSpacing = 1.sp,
            modifier = Modifier.weight(1f),
        )
        Text(
            hhmm(),
            color = Standby.Dim,
            fontSize = (u * 0.038f).sp,
            fontWeight = FontWeight.Medium,
        )
    }
}

/* ---------------- 日曆 ---------------- */

@Composable
private fun StandbyCalendarFace() {
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val u = minOf(maxWidth.value, maxHeight.value)
        val cal = remember { Calendar.getInstance() }
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH)
        val today = cal.get(Calendar.DAY_OF_MONTH)
        val first = remember { (cal.clone() as Calendar).apply { set(Calendar.DAY_OF_MONTH, 1) } }
        val leading = (first.get(Calendar.DAY_OF_WEEK) - Calendar.SUNDAY + 7) % 7
        val days = cal.getActualMaximum(Calendar.DAY_OF_MONTH)

        Column(Modifier.fillMaxSize().padding((u * 0.05f).dp)) {
            StandbyHeader(u)
            Spacer(Modifier.height((u * 0.02f).dp))
            Text(
                yearMonth(year, month),
                color = Standby.Text,
                fontSize = (u * 0.062f).sp,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.height((u * 0.02f).dp))
            Row(Modifier.fillMaxWidth()) {
                listOf("日", "一", "二", "三", "四", "五", "六").forEach { d ->
                    Text(
                        d,
                        color = Standby.Dim,
                        fontSize = (u * 0.030f).sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            Spacer(Modifier.height((u * 0.012f).dp))
            for (row in 0 until 6) {
                Row(Modifier.fillMaxWidth().weight(1f)) {
                    for (col in 0 until 7) {
                        val day = row * 7 + col - leading + 1
                        Box(Modifier.weight(1f).fillMaxHeight(), contentAlignment = Alignment.Center) {
                            if (day in 1..days) {
                                val isToday = day == today
                                Box(
                                    Modifier
                                        .size((u * 0.072f).dp)
                                        .clip(RoundedCornerShape(50))
                                        .background(if (isToday) Standby.Red else Color.Transparent),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        "$day",
                                        color = if (isToday) Color.White else Standby.Text,
                                        fontSize = (u * 0.036f).sp,
                                        fontWeight = if (isToday) FontWeight.SemiBold else FontWeight.Normal,
                                    )
                                }
                            }
                        }
                    }
                }
            }
            Text("待機顯示 · 日曆", color = Standby.Dim, fontSize = (u * 0.026f).sp)
        }
    }
}

/* ---------------- 天氣（橫向改左右並排，不再裁切） ---------------- */

@Composable
private fun StandbyWeatherFace() {
    var w by remember { mutableStateOf<Weather?>(null) }
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) { runCatching { w = Hko.fetch() } }
    }
    val cur = w
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val u = minOf(maxWidth.value, maxHeight.value)
        val landscape = maxWidth > maxHeight
        Column(Modifier.fillMaxSize().padding((u * 0.045f).dp)) {
            StandbyHeader(u)
            Spacer(Modifier.height((u * 0.02f).dp))
            if (landscape) {
                Row(Modifier.fillMaxWidth().weight(1f)) {
                    Column(Modifier.weight(1f)) {
                        Text(cur?.emoji?.takeIf { it.isNotBlank() } ?: "☁", color = Standby.Text, fontSize = (u * 0.15f).sp)
                        Text(
                            cur?.temp?.let { "$it°" } ?: "--",
                            color = Standby.Text,
                            fontSize = (u * 0.24f).sp,
                            fontWeight = FontWeight.Medium,
                        )
                        Text(
                            cur?.desc?.takeIf { it.isNotBlank() } ?: "香港天文台・天水圍",
                            color = Standby.Text,
                            fontSize = (u * 0.044f).sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Text(
                            quickFacts(cur),
                            color = Standby.Dim,
                            fontSize = (u * 0.042f).sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                    Spacer(Modifier.width((u * 0.04f).dp))
                    ForecastList(cur, u, Modifier.weight(1.15f))
                }
            } else {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(cur?.emoji?.takeIf { it.isNotBlank() } ?: "☁", color = Standby.Text, fontSize = (u * 0.13f).sp)
                    Spacer(Modifier.width((u * 0.04f).dp))
                    Text(
                        cur?.temp?.let { "$it°" } ?: "--",
                        color = Standby.Text,
                        fontSize = (u * 0.19f).sp,
                        fontWeight = FontWeight.Medium,
                    )
                }
                Spacer(Modifier.height((u * 0.01f).dp))
                Text(
                    cur?.desc?.takeIf { it.isNotBlank() } ?: "香港天文台・天水圍",
                    color = Standby.Text,
                    fontSize = (u * 0.050f).sp,
                    fontWeight = FontWeight.Light,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    quickFacts(cur),
                    color = Standby.Dim,
                    fontSize = (u * 0.035f).sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height((u * 0.03f).dp))
                ForecastList(cur, u, Modifier.weight(1f))
            }
            Text("待機顯示 · 天氣", color = Standby.Dim, fontSize = (u * 0.026f).sp)
        }
    }
}

private fun quickFacts(cur: Weather?): String = listOfNotNull(
    cur?.humid?.let { "濕度 $it%" },
    cur?.uv?.let { "紫外線 $it" },
).joinToString(" · ").ifBlank { "--" }

/** 三日預報：每行自適應剩餘高度，永不裁切 */
@Composable
private fun ForecastList(cur: Weather?, u: Float, modifier: Modifier = Modifier) {
    val days = cur?.days ?: emptyList()
    val labels = listOf("今天", "明天", "後天")
    Column(modifier.fillMaxWidth()) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Color.White.copy(alpha = 0.16f)))
        for (i in 0 until 3) {
            val d = days.getOrNull(i)
            Row(Modifier.fillMaxWidth().weight(1f), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    d?.label?.takeIf { it.isNotBlank() } ?: labels[i],
                    color = Standby.Text,
                    fontSize = (u * 0.038f).sp,
                    maxLines = 1,
                    modifier = Modifier.width((u * 0.16f).dp),
                )
                Text(
                    d?.emoji ?: "-",
                    color = Standby.Text,
                    fontSize = (u * 0.040f).sp,
                    maxLines = 1,
                    modifier = Modifier.width((u * 0.09f).dp),
                )
                Text(
                    d?.let { "${it.min ?: "-"}° ~ ${it.max ?: "-"}°" } ?: "-",
                    color = Standby.Text,
                    fontSize = (u * 0.038f).sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    d?.desc?.takeIf { it.isNotBlank() } ?: "-",
                    color = Standby.Dim,
                    fontSize = (u * 0.032f).sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1.2f),
                )
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Color.White.copy(alpha = 0.10f)))
        }
    }
}

/* ---------------- 音樂（內建合成音，真實播放） ---------------- */

@Composable
private fun StandbyMusicFace() {
    val ctx = LocalContext.current
    var sys by remember { mutableStateOf<NowPlaying.Track?>(null) }
    var access by remember { mutableStateOf(NowPlaying.hasAccess(ctx)) }
    var playing by remember { mutableStateOf(StandbyAudio.isPlaying) }
    var idx by remember { mutableStateOf(StandbyAudio.current) }
    var pos by remember { mutableStateOf(0L) }

    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) {
            var was = access
            while (true) {
                access = NowPlaying.hasAccess(ctx)
                if (access && !was) NowPlaying.rebind(ctx)
                was = access
                sys = if (access) withContext(Dispatchers.IO) { NowPlaying.current(ctx) } else null
                StandbyAudio.tick(1000)
                playing = sys?.playing ?: StandbyAudio.isPlaying
                idx = StandbyAudio.current
                pos = sys?.positionMs ?: StandbyAudio.positionMs
                delay(1000)
            }
        }
    }
    val t = sys
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val u = minOf(maxWidth.value, maxHeight.value)
        Column(Modifier.fillMaxSize().padding((u * 0.045f).dp)) {
            StandbyHeader(u)
            Spacer(Modifier.weight(0.5f))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier
                        .size((u * 0.24f).dp)
                        .clip(RoundedCornerShape((u * 0.022f).dp))
                        .background(Color(0xFF1F1F1F)),
                    contentAlignment = Alignment.Center,
                ) {
                    val art = t?.art
                    if (art != null) {
                        Image(
                            bitmap = art.asImageBitmap(),
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize(),
                        )
                    } else {
                        Text("♪", color = Standby.Amber, fontSize = (u * 0.10f).sp)
                    }
                }
                Spacer(Modifier.width((u * 0.045f).dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        t?.title ?: StandbyAudio.titles.getOrElse(idx) { "-" },
                        color = Standby.Text,
                        fontSize = (u * 0.055f).sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height((u * 0.008f).dp))
                    Text(
                        t?.let { it.artist.ifBlank { it.album.ifBlank { "系統播放器" } } }
                            ?: StandbyAudio.artists.getOrElse(idx) { "" },
                        color = Standby.Dim,
                        fontSize = (u * 0.034f).sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height((u * 0.03f).dp))
                    val total = t?.durationMs?.takeIf { it > 0 } ?: (StandbyAudio.NOMINAL_SECONDS * 1000L)
                    val frac = if (total > 0) (pos.toFloat() / total).coerceIn(0f, 1f) else 0f
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(Color.White.copy(alpha = 0.22f)),
                    ) {
                        Box(Modifier.fillMaxWidth(frac).height(4.dp).background(Standby.Amber))
                    }
                    Spacer(Modifier.height((u * 0.014f).dp))
                    Row(Modifier.fillMaxWidth()) {
                        Text(mmss(pos / 1000), color = Standby.Dim, fontSize = (u * 0.030f).sp, modifier = Modifier.weight(1f))
                        Text("-" + mmss(((total - pos).coerceAtLeast(0)) / 1000), color = Standby.Dim, fontSize = (u * 0.030f).sp)
                    }
                }
            }
            Spacer(Modifier.weight(0.4f))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                MusicButton("<<", u) {
                    if (t != null) NowPlaying.control(ctx, NowPlaying.Action.Prev)
                    else {
                        StandbyAudio.prev(); playing = StandbyAudio.isPlaying; idx = StandbyAudio.current
                    }
                }
                MusicButton(if (playing) "||" else ">", u, accent = true) {
                    if (t != null) {
                        NowPlaying.control(ctx, NowPlaying.Action.Play)
                        playing = !t.playing
                    } else {
                        StandbyAudio.toggle()
                        playing = StandbyAudio.isPlaying
                    }
                }
                MusicButton(">>", u) {
                    if (t != null) NowPlaying.control(ctx, NowPlaying.Action.Next)
                    else {
                        StandbyAudio.next(); playing = StandbyAudio.isPlaying; idx = StandbyAudio.current
                    }
                }
            }
            Spacer(Modifier.height((u * 0.02f).dp))
            if (!access) {
                Row(
                    Modifier
                        .clip(RoundedCornerShape(50))
                        .background(Color.White.copy(alpha = 0.10f))
                        .clickable { NowPlaying.requestAccess(ctx) }
                        .padding(horizontal = 16.dp, vertical = 9.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        "連接系統播放器（需授予通知使用權）",
                        color = Standby.Amber,
                        fontSize = (u * 0.030f).sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                Spacer(Modifier.height((u * 0.014f).dp))
            }
            Text(
                if (t != null) "系統播放器 · 正在播放" else "待機顯示 · 音樂（內建合成音）",
                color = Standby.Dim,
                fontSize = (u * 0.026f).sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun MusicButton(glyph: String, u: Float, accent: Boolean = false, onClick: () -> Unit) {
    Box(
        Modifier
            .size((u * 0.12f).dp)
            .clip(RoundedCornerShape(50))
            .background(if (accent) Standby.Amber.copy(alpha = 0.18f) else Color.Transparent)
            .clickable { onClick() },
        contentAlignment = Alignment.Center,
    ) {
        Text(glyph, color = if (accent) Standby.Amber else Standby.Text, fontSize = (u * 0.055f).sp)
    }
}

/* ---------------- 色票與時間 ---------------- */

private object Standby {
    val Bg = Color(0xFF000000)
    val Text = Color(0xFFFFFFFF)
    val Dim = Color(0x99FFFFFF)
    val Red = Color(0xFFE23B30)
    val Amber = Color(0xFFF5A623)
}

private fun hhmm(): String {
    val c = Calendar.getInstance()
    return fmtHm(c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE))
}

private fun fmtHm(h: Int, m: Int): String = String.format(Locale.getDefault(), "%02d:%02d", h, m)

private fun alarmChip(h: Int, m: Int): String = "⏰ " + fmtHm(h, m) + " 每天"

private fun yearMonth(y: Int, m: Int): String = "$y 年 ${m + 1} 月"

private fun weekdayDay(): String {
    val c = Calendar.getInstance()
    val w = listOf("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT")[c.get(Calendar.DAY_OF_WEEK) - 1]
    return "$w ${c.get(Calendar.DAY_OF_MONTH)}"
}

private fun mmss(sec: Long): String = String.format(Locale.getDefault(), "%d:%02d", sec / 60, sec % 60)