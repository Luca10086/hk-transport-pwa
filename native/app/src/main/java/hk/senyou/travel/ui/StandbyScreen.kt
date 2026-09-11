package hk.senyou.travel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material3.Text
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.Image
import androidx.compose.ui.graphics.asImageBitmap
import hk.senyou.travel.data.AlarmRepo
import hk.senyou.travel.data.DebugFlags
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.NowPlaying
import hk.senyou.travel.data.Settings
import hk.senyou.travel.data.StandbyAudio
import hk.senyou.travel.data.Weather
import hk.senyou.travel.ui.wp8.Wp8
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.util.Calendar
import java.util.Locale

/**
 * 待機顯示模式（**Windows 10 Mobile 規範**）。
 *
 * 依 native/WIN10-MOBILE-DESIGN.md：
 * · 版面＝**Pivot**：頁首為區段標題（Subtitle 20/28 **Semibold**）＋圓點指示，
 *   左右滑動切換區段（鬧鐘／日曆／天氣／音樂）
 * · 字階全部取自官方 type ramp：Caption 12/16、Body 14/20、Body strong 14/20 semibold、
 *   Body large 18/24、Subtitle 20/28、Title 28/36、Title large 40/52、Display 68/92
 * · 強調一律 **Semibold**（官方排除 Bold／Italic）；文字**句首大寫**，不用全大寫
 * · 色彩：背景純黑 `#000000`、Chrome `#1F1F1F`、分隔線 `#3A3A3A`、次要文字 60% 白、
 *   強調色 `#0078D7`（SystemAccentColor）
 * · 控制項：主要動作＝**強調色實心矩形**；次要動作＝**2px 外框矩形**（皆直角，無膠囊）；
 *   附屬動作＝**強調色文字連結**（HyperlinkButton 樣式）
 * · 進度＝2px 強調色細線；清單列以 1px 分隔線分隔
 *
 * 唯一刻意偏離：床頭大鐘使用 **Light** 字重 —— Windows 10 Mobile 鎖屏時鐘本體即為
 * Segoe UI Light 的極細大字，這是該平台的視覺識別（其餘一律依字階規範）。
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

    BoxWithConstraints(Modifier.fillMaxSize().background(Wp8.Bg)) {
        val wp = maxWidth.value
        Column(Modifier.fillMaxSize()) {
            PivotHeader(page)
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
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
        }
    }
}

/** 待機畫面的頁數（鬧鐘 / 日曆 / 天氣 / 音樂） */
const val STANDBY_FACE_COUNT = 4

private val FACE_TITLES = listOf("鬧鐘", "日曆", "天氣", "音樂")

/** W10M Pivot 頁首：區段標題 + 圓點指示 */
@Composable
private fun PivotHeader(page: Int) {
    Column(
        Modifier
            .fillMaxWidth()
            .padding(start = 24.dp, end = 24.dp, top = 16.dp, bottom = 10.dp),
    ) {
        Text(
            FACE_TITLES.getOrElse(page) { "" },
            color = Wp8.Text1,
            fontSize = 20.sp,
            lineHeight = 28.sp,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            repeat(STANDBY_FACE_COUNT) { i ->
                Box(
                    Modifier
                        .size(6.dp)
                        .clip(RoundedCornerShape(50))
                        .background(if (i == page) Wp8.Accent else Wp8.Text2),
                )
            }
        }
    }
}

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
        1 -> CalendarFace()
        2 -> WeatherFace()
        else -> MusicFace()
    }
}

/* ---------------- W10M 控制項 ---------------- */

/** 主要＝強調色實心；次要＝2px 外框。直角、無膠囊（W10M Button） */
@Composable
private fun W10Button(label: String, primary: Boolean, onClick: () -> Unit) {
    Box(
        Modifier
            .height(40.dp)
            .then(
                if (primary) Modifier.background(Wp8.Accent)
                else Modifier.border(2.dp, Wp8.Text2),
            )
            .clickable { onClick() }
            .padding(horizontal = 20.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(label, color = Wp8.Text1, fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight.SemiBold)
    }
}

/** 附屬動作：強調色文字連結（HyperlinkButton） */
@Composable
private fun W10Link(label: String, onClick: () -> Unit) {
    Text(
        label,
        color = Wp8.Accent,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier.clickable { onClick() }.padding(vertical = 4.dp),
    )
}

/* ---------------- 鬧鐘 ---------------- */

@Composable
private fun AlarmFace(onExit: () -> Unit, settings: Settings, onSettings: (Settings) -> Unit) {
    val ctx = LocalContext.current
    var pick by remember { mutableStateOf(false) }
    val ringing = AlarmRepo.ringing

    LaunchedEffect(ringing) {
        if (ringing && !DebugFlags.staticUi) StandbyAudio.startRing() else StandbyAudio.stopRing()
    }

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val u = minOf(maxWidth.value, maxHeight.value)
        val wide = maxWidth > maxHeight
        Column(Modifier.fillMaxSize().padding(horizontal = 24.dp, vertical = 18.dp)) {
            Text(
                "Good morning",
                color = Wp8.Text1,
                fontSize = 28.sp,
                lineHeight = 36.sp,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                longDate(),
                color = Wp8.Text2,
                fontSize = 14.sp,
                lineHeight = 20.sp,
            )
            Spacer(Modifier.weight(1f))
            /* 大鐘：Light（W10M 鎖屏時鐘識別），正常冒號，非 iOS 圓點 */
            Text(
                hhmm(),
                color = if (ringing) Wp8.Accent else Wp8.Text1,
                fontSize = (u * (if (wide) 0.34f else 0.22f)).sp,
                lineHeight = (u * (if (wide) 0.36f else 0.24f)).sp,
                fontWeight = FontWeight.Light,
                maxLines = 1,
                overflow = TextOverflow.Clip,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                if (ringing) "響鈴中 · 鬧鐘 ${fmtHm(settings.alarmHour, settings.alarmMinute)}"
                else if (settings.alarmOn) "下一個鬧鐘 ${fmtHm(settings.alarmHour, settings.alarmMinute)}（每天）"
                else "鬧鐘未設定",
                color = Wp8.Text2,
                fontSize = 14.sp,
                lineHeight = 20.sp,
            )
            Spacer(Modifier.weight(1f))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                W10Button("停止", primary = false) {
                    AlarmRepo.ringing = false
                    StandbyAudio.stopRing()
                    onExit()
                }
                W10Button(if (ringing) "貪睡 10 分鐘" else "關閉", primary = ringing) {
                    if (AlarmRepo.ringing) {
                        AlarmRepo.ringing = false
                        StandbyAudio.stopRing()
                        AlarmRepo.snooze(ctx, 10)
                    }
                    onExit()
                }
            }
            Spacer(Modifier.height(14.dp))
            W10Link(if (settings.alarmOn) "變更鬧鐘時間" else "設定鬧鐘") { pick = true }
        }
        if (pick) {
            TimePickerPanel(
                initialHour = settings.alarmHour,
                initialMinute = settings.alarmMinute,
                alarmOn = settings.alarmOn,
                onCancel = { pick = false },
                onOff = {
                    onSettings(settings.copy(alarmOn = false))
                    AlarmRepo.cancel(ctx)
                    pick = false
                },
                onConfirm = { h, m ->
                    onSettings(settings.copy(alarmOn = true, alarmHour = h, alarmMinute = m))
                    AlarmRepo.schedule(ctx, h, m)
                    pick = false
                },
            )
        }
    }
}

/** W10M Flyout 風格時間選擇面板（直角、1px 邊框、#1F1F1F） */
@Composable
private fun TimePickerPanel(
    initialHour: Int,
    initialMinute: Int,
    alarmOn: Boolean,
    onCancel: () -> Unit,
    onOff: () -> Unit,
    onConfirm: (Int, Int) -> Unit,
) {
    var hh by remember { mutableIntStateOf(initialHour) }
    var mm by remember { mutableIntStateOf(initialMinute) }
    Box(
        Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.72f))
            .clickable { onCancel() },
        contentAlignment = Alignment.Center,
    ) {
        Column(
            Modifier
                .width(320.dp)
                .background(Wp8.Surface)
                .border(1.dp, Wp8.Line)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                "設定鬧鐘",
                color = Wp8.Text1,
                fontSize = 20.sp,
                lineHeight = 28.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(16.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                TimeStepper(hh, 24) { hh = it }
                Text(
                    ":",
                    color = Wp8.Text1,
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Light,
                    modifier = Modifier.padding(horizontal = 6.dp),
                )
                TimeStepper(mm, 60) { mm = it }
            }
            Spacer(Modifier.height(20.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (alarmOn) W10Button("關閉鬧鐘", primary = false) { onOff() }
                W10Button("取消", primary = false) { onCancel() }
                W10Button("確定", primary = true) { onConfirm(hh, mm) }
            }
        }
    }
}

/** 時／分步進器：直角外框 +/- 按鈕 + 大字數字 */
@Composable
private fun TimeStepper(value: Int, modulo: Int, onChange: (Int) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        StepButton("+") { onChange((value + 1) % modulo) }
        Text(
            String.format(Locale.getDefault(), "%02d", value),
            color = Wp8.Text1,
            fontSize = 40.sp,
            lineHeight = 52.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(vertical = 6.dp),
        )
        StepButton("-") { onChange((value - 1 + modulo) % modulo) }
    }
}

@Composable
private fun StepButton(glyph: String, onClick: () -> Unit) {
    Box(
        Modifier
            .size(40.dp)
            .border(1.dp, Wp8.Line)
            .clickable { onClick() },
        contentAlignment = Alignment.Center,
    ) {
        Text(glyph, color = Wp8.Text1, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
    }
}

/* ---------------- 日曆 ---------------- */

@Composable
private fun CalendarFace() {
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val u = minOf(maxWidth.value, maxHeight.value)
        val cal = remember { Calendar.getInstance() }
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH)
        val today = cal.get(Calendar.DAY_OF_MONTH)
        val first = remember { (cal.clone() as Calendar).apply { set(Calendar.DAY_OF_MONTH, 1) } }
        val leading = (first.get(Calendar.DAY_OF_WEEK) - Calendar.SUNDAY + 7) % 7
        val days = cal.getActualMaximum(Calendar.DAY_OF_MONTH)

        Column(Modifier.fillMaxSize().padding(horizontal = 24.dp, vertical = 18.dp)) {
            Text(
                "$year 年 ${month + 1} 月",
                color = Wp8.Text1,
                fontSize = 28.sp,
                lineHeight = 36.sp,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.height(14.dp))
            Row(Modifier.fillMaxWidth()) {
                listOf("日", "一", "二", "三", "四", "五", "六").forEach { d ->
                    Text(
                        d,
                        color = Wp8.Text2,
                        fontSize = 12.sp,
                        lineHeight = 16.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            Spacer(Modifier.height(6.dp))
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
            for (row in 0 until 6) {
                Row(Modifier.fillMaxWidth().weight(1f)) {
                    for (col in 0 until 7) {
                        val day = row * 7 + col - leading + 1
                        Box(Modifier.weight(1f).fillMaxHeight(), contentAlignment = Alignment.Center) {
                            if (day in 1..days) {
                                val isToday = day == today
                                Box(
                                    Modifier
                                        .size((u * 0.062f).dp)
                                        .then(if (isToday) Modifier.background(Wp8.Accent) else Modifier),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        "$day",
                                        color = if (isToday) Wp8.Text1 else Wp8.Text1.copy(alpha = 0.9f),
                                        fontSize = 14.sp,
                                        lineHeight = 20.sp,
                                        fontWeight = if (isToday) FontWeight.SemiBold else FontWeight.Normal,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/* ---------------- 天氣 ---------------- */

@Composable
private fun WeatherFace() {
    var w by remember { mutableStateOf<Weather?>(null) }
    if (!DebugFlags.staticUi) {
        LaunchedEffect(Unit) { runCatching { w = Hko.fetch() } }
    }
    val cur = w
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val u = minOf(maxWidth.value, maxHeight.value)
        val landscape = maxWidth > maxHeight
        Column(Modifier.fillMaxSize().padding(horizontal = 24.dp, vertical = 18.dp)) {
            if (landscape) {
                Row(Modifier.fillMaxWidth().weight(1f)) {
                    Column(Modifier.weight(1f)) {
                        WeatherNow(cur, u)
                    }
                    Spacer(Modifier.width(20.dp))
                    ForecastList(cur, Modifier.weight(1.15f))
                }
            } else {
                WeatherNow(cur, u)
                Spacer(Modifier.height(16.dp))
                ForecastList(cur, Modifier.weight(1f))
            }
            Spacer(Modifier.height(6.dp))
            Text("資料來源：香港天文台", color = Wp8.Text2, fontSize = 12.sp, lineHeight = 16.sp)
        }
    }
}

@Composable
private fun WeatherNow(cur: Weather?, u: Float) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(cur?.emoji?.takeIf { it.isNotBlank() } ?: "☁", color = Wp8.Text1, fontSize = 40.sp)
        Spacer(Modifier.width(12.dp))
        Text(
            cur?.temp?.let { "$it°" } ?: "--",
            color = Wp8.Text1,
            fontSize = 40.sp,
            lineHeight = 52.sp,
            fontWeight = FontWeight.SemiBold,
        )
    }
    Spacer(Modifier.height(6.dp))
    Text(
        cur?.desc?.takeIf { it.isNotBlank() } ?: "香港天文台・天水圍",
        color = Wp8.Text1,
        fontSize = 20.sp,
        lineHeight = 28.sp,
        fontWeight = FontWeight.SemiBold,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
    )
    Text(
        listOfNotNull(
            cur?.humid?.let { "濕度 $it%" },
            cur?.uv?.let { "紫外線 $it" },
        ).joinToString(" · ").ifBlank { "--" },
        color = Wp8.Text2,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
    )
}

@Composable
private fun ForecastList(cur: Weather?, modifier: Modifier = Modifier) {
    val days = cur?.days ?: emptyList()
    val labels = listOf("今天", "明天", "後天")
    Column(modifier.fillMaxWidth()) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        for (i in 0 until 3) {
            val d = days.getOrNull(i)
            Row(Modifier.fillMaxWidth().weight(1f), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    d?.label?.takeIf { it.isNotBlank() } ?: labels[i],
                    color = Wp8.Text1,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    modifier = Modifier.width(56.dp),
                )
                Text(d?.emoji ?: "-", color = Wp8.Text1, fontSize = 16.sp, maxLines = 1, modifier = Modifier.width(34.dp))
                Text(
                    d?.let { "${it.min ?: "-"}° ~ ${it.max ?: "-"}°" } ?: "-",
                    color = Wp8.Text1,
                    fontSize = 14.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    d?.desc?.takeIf { it.isNotBlank() } ?: "-",
                    color = Wp8.Text2,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1.2f),
                )
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Wp8.Line))
        }
    }
}

/* ---------------- 音樂 ---------------- */

@Composable
private fun MusicFace() {
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
        Column(Modifier.fillMaxSize().padding(horizontal = 24.dp, vertical = 18.dp)) {
            Spacer(Modifier.weight(0.5f))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier
                        .size((u * 0.22f).dp)
                        .background(Wp8.Surface),
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
                        Text("♪", color = Wp8.Accent, fontSize = 40.sp)
                    }
                }
                Spacer(Modifier.width(16.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        t?.title ?: StandbyAudio.titles.getOrElse(idx) { "-" },
                        color = Wp8.Text1,
                        fontSize = 20.sp,
                        lineHeight = 28.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        t?.let { it.artist.ifBlank { it.album.ifBlank { "系統播放器" } } }
                            ?: StandbyAudio.artists.getOrElse(idx) { "" },
                        color = Wp8.Text2,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height(14.dp))
                    val total = t?.durationMs?.takeIf { it > 0 } ?: (StandbyAudio.NOMINAL_SECONDS * 1000L)
                    val frac = if (total > 0) (pos.toFloat() / total).coerceIn(0f, 1f) else 0f
                    Box(Modifier.fillMaxWidth().height(2.dp).background(Wp8.Line)) {
                        Box(Modifier.fillMaxWidth(frac).height(2.dp).background(Wp8.Accent))
                    }
                    Spacer(Modifier.height(6.dp))
                    Row(Modifier.fillMaxWidth()) {
                        Text(
                            mmss(pos / 1000),
                            color = Wp8.Text2,
                            fontSize = 12.sp,
                            modifier = Modifier.weight(1f),
                        )
                        Text(
                            "-" + mmss(((total - pos).coerceAtLeast(0)) / 1000),
                            color = Wp8.Text2,
                            fontSize = 12.sp,
                        )
                    }
                }
            }
            Spacer(Modifier.weight(0.4f))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                CircleButton("<") {
                    if (t != null) NowPlaying.control(ctx, NowPlaying.Action.Prev)
                    else {
                        StandbyAudio.prev(); playing = StandbyAudio.isPlaying; idx = StandbyAudio.current
                    }
                }
                Spacer(Modifier.width(16.dp))
                CircleButton(if (playing) "II" else ">", accent = true) {
                    if (t != null) {
                        NowPlaying.control(ctx, NowPlaying.Action.Play)
                        playing = !t.playing
                    } else {
                        StandbyAudio.toggle()
                        playing = StandbyAudio.isPlaying
                    }
                }
                Spacer(Modifier.width(16.dp))
                CircleButton(">") {
                    if (t != null) NowPlaying.control(ctx, NowPlaying.Action.Next)
                    else {
                        StandbyAudio.next(); playing = StandbyAudio.isPlaying; idx = StandbyAudio.current
                    }
                }
            }
            Spacer(Modifier.weight(0.3f))
            if (!access) {
                W10Link("連接系統播放器（需授予通知使用權）") { NowPlaying.requestAccess(ctx) }
                Text(
                    "未連接時使用內建合成音",
                    color = Wp8.Text2,
                    fontSize = 12.sp,
                    lineHeight = 16.sp,
                )
            } else {
                Text(
                    if (t != null) "系統播放器 · 正在播放" else "系統播放器 · 目前沒有播放中的音樂",
                    color = Wp8.Text2,
                    fontSize = 12.sp,
                    lineHeight = 16.sp,
                )
            }
        }
    }
}

/** W10M App Bar 風格圓形按鈕（48px 圓、1px 邊框、26px 前景） */
@Composable
private fun CircleButton(glyph: String, accent: Boolean = false, onClick: () -> Unit) {
    Box(
        Modifier
            .size(48.dp)
            .clip(RoundedCornerShape(50))
            .then(if (accent) Modifier.background(Wp8.Accent) else Modifier.border(1.dp, Wp8.Line))
            .clickable { onClick() },
        contentAlignment = Alignment.Center,
    ) {
        Text(glyph, color = if (accent) Wp8.Text1 else Wp8.Text1, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
    }
}

/* ---------------- 時間 ---------------- */

private fun hhmm(): String {
    val c = Calendar.getInstance()
    return fmtHm(c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE))
}

private fun fmtHm(h: Int, m: Int): String = String.format(Locale.getDefault(), "%02d:%02d", h, m)

private fun longDate(): String {
    val c = Calendar.getInstance()
    val w = listOf("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")[c.get(Calendar.DAY_OF_WEEK) - 1]
    return "${c.get(Calendar.YEAR)} 年 ${c.get(Calendar.MONTH) + 1} 月 ${c.get(Calendar.DAY_OF_MONTH)} 日 · $w"
}

private fun mmss(sec: Long): String = String.format(Locale.getDefault(), "%d:%02d", sec / 60, sec % 60)