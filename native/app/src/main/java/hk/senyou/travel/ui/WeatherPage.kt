package hk.senyou.travel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import hk.senyou.travel.data.Hko
import hk.senyou.travel.data.Weather
import hk.senyou.travel.ui.theme.V3

/** 天氣頁（HKO 三天預測 + 實況 + 警告） */
@Composable
fun WeatherPage(onClose: () -> Unit) {
    var w by remember { mutableStateOf(Weather()) }
    var loading by remember { mutableStateOf(true) }
    val status = WindowInsets.statusBars.asPaddingValues()

    LaunchedEffect(Unit) {
        w = Hko.fetch()
        loading = false
    }

    Box(Modifier.fillMaxSize().background(Color(0xF0090A0F))) {
        Column(Modifier.fillMaxSize().padding(top = status.calculateTopPadding())) {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp).height(56.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("天氣 · 香港天文台", color = V3.Text1, fontSize = 20.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
                GlassSurface(modifier = Modifier.size(40.dp).clickable { onClose() }, shape = CircleShape) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("✕", color = V3.Text1, fontSize = 15.sp) }
                }
            }

            if (loading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("載入中…", color = V3.Text2, fontSize = 14.sp) }
            } else {
                Column(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
                    // 警告
                    (w.severe + w.mild).forEach { msg ->
                        val severe = msg in w.severe
                        GlassSurface(
                            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                            shape = RoundedCornerShape(14.dp),
                            strong = true,
                        ) {
                            Text(
                                "⚠ $msg",
                                color = if (severe) V3.Danger else V3.Aux,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(12.dp),
                            )
                        }
                    }

                    // 實況
                    GlassSurface(modifier = Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(16.dp)) {
                            Text("現在 · ${w.desc.ifBlank { "—" }}", color = V3.Text2, fontSize = 14.sp)
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text("${w.temp ?: "--"}", color = V3.Text1, fontSize = 60.sp, fontWeight = FontWeight.Light)
                                Text("°", color = V3.Text2, fontSize = 22.sp, modifier = Modifier.padding(bottom = 10.dp))
                                Spacer(Modifier.weight(1f))
                                Text(w.emoji, fontSize = 34.sp, modifier = Modifier.padding(bottom = 6.dp))
                            }
                            Text(
                                listOfNotNull(
                                    w.humid?.let { "濕度 $it%" },
                                    w.rain?.let { "雨量 $it mm" },
                                    w.uv?.let { "紫外線 $it" },
                                ).joinToString(" · ").ifBlank { "—" },
                                color = V3.Text2, fontSize = 13.sp,
                            )
                        }
                    }

                    Spacer(Modifier.height(16.dp))
                    Text("未來三天", color = V3.Aux, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        w.days.forEach { d ->
                            GlassSurface(modifier = Modifier.weight(1f).height(150.dp)) {
                                Column(
                                    Modifier.fillMaxSize().padding(10.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(4.dp),
                                ) {
                                    Text(
                                        listOf(d.label, d.week, d.date).filter { it.isNotBlank() }.joinToString(" · "),
                                        color = V3.Text2, fontSize = 11.sp, maxLines = 1,
                                    )
                                    Text(d.emoji, fontSize = 26.sp)
                                    Row(verticalAlignment = Alignment.Bottom) {
                                        Text("${d.max ?: "--"}°", color = V3.Text1, fontSize = 18.sp, fontWeight = FontWeight.Light)
                                        Text("/${d.min ?: "--"}°", color = V3.Text2, fontSize = 12.sp, modifier = Modifier.padding(bottom = 2.dp))
                                    }
                                    Text(d.desc, color = V3.Text2, fontSize = 11.sp, maxLines = 3)
                                    if (d.rhMin != null && d.rhMax != null) {
                                        Text("濕度 ${d.rhMin}–${d.rhMax}%", color = V3.Text2, fontSize = 10.sp)
                                    }
                                }
                            }
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "數據：香港天文台" + (if (w.updated.isNotBlank()) " · 更新 ${w.updated}" else ""),
                        color = V3.Text2, fontSize = 12.sp,
                    )
                }
            }
        }
    }
}
