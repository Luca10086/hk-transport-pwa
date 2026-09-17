package hk.senyou.travel.ui.material

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import hk.senyou.travel.data.AlarmRepo
import hk.senyou.travel.data.Settings

private val MATERIAL_PLACES = listOf(
    "天水圍", "元朗公園", "屯門", "荃灣城門谷", "沙田", "大埔", "上水", "西貢",
    "將軍澳", "觀塘", "黃大仙", "九龍城", "深水埗", "香港公園", "跑馬地", "赤鱲角", "長洲", "山頂",
)

/**
 * Material 3 設定頁（獨立實作）：以 M3 `ListItem`／`Switch`／`SegmentedButton`／`FilterChip` 組成，
 * 並提供「介面風格」切換（W10M ↔ Material）—— 這是兩套主題的唯一連接口。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaterialSettingsPane(settings: Settings, onSettings: (Settings) -> Unit) {
    val ctx = LocalContext.current

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text("介面風格") },
                        supportingContent = { Text("兩套完全獨立的實作，可隨時切換") },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    SingleChoiceSegmentedButtonRow(
                        Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                    ) {
                        val styles = listOf("w10m" to "Windows 10 Mobile", "material" to "Material 3")
                        styles.forEachIndexed { i, (key, label) ->
                            SegmentedButton(
                                selected = settings.uiStyle == key,
                                onClick = { onSettings(settings.copy(uiStyle = key)) },
                                shape = SegmentedButtonDefaults.itemShape(index = i, count = styles.size),
                            ) { Text(label) }
                        }
                    }
                    HorizontalDivider()
                    ListItem(
                        headlineContent = { Text("主題") },
                        supportingContent = { Text("深色 / 淺色") },
                        trailingContent = {
                            SingleChoiceSegmentedButtonRow {
                                listOf("dark" to "深色", "light" to "淺色").forEachIndexed { i, (key, label) ->
                                    SegmentedButton(
                                        selected = settings.theme == key,
                                        onClick = { onSettings(settings.copy(theme = key)) },
                                        shape = SegmentedButtonDefaults.itemShape(index = i, count = 2),
                                    ) { Text(label) }
                                }
                            }
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
                        headlineContent = { Text("鬧鐘") },
                        supportingContent = {
                            Text(
                                if (settings.alarmOn) {
                                    "響鈴時間 %02d:%02d（每天）".format(settings.alarmHour, settings.alarmMinute)
                                } else {
                                    "未設定"
                                },
                            )
                        },
                        trailingContent = {
                            Switch(
                                checked = settings.alarmOn,
                                onCheckedChange = { on ->
                                    onSettings(settings.copy(alarmOn = on))
                                    if (on) {
                                        AlarmRepo.schedule(ctx, settings.alarmHour, settings.alarmMinute)
                                    } else {
                                        AlarmRepo.cancel(ctx)
                                    }
                                },
                            )
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    HorizontalDivider()
                    ListItem(
                        headlineContent = { Text("折起立放進入待機顯示") },
                        supportingContent = { Text("折疊機立放時自動開啟床頭鐘") },
                        trailingContent = {
                            Switch(
                                checked = settings.standbyAuto,
                                onCheckedChange = { onSettings(settings.copy(standbyAuto = it)) },
                            )
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    HorizontalDivider()
                    ListItem(
                        headlineContent = { Text("減少動畫") },
                        trailingContent = {
                            Switch(
                                checked = settings.fx != "off",
                                onCheckedChange = {
                                    onSettings(settings.copy(fx = if (it) "full" else "off"))
                                },
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
                        headlineContent = { Text("天氣顯示地區") },
                        supportingContent = { Text(settings.weatherPlace) },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        MATERIAL_PLACES.forEach { p ->
                            FilterChip(
                                selected = settings.weatherPlace == p,
                                onClick = { onSettings(settings.copy(weatherPlace = p)) },
                                label = { Text(p) },
                            )
                        }
                    }
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text("AI 建議（MiMo v2.5）") },
                        supportingContent = { Text("金鑰僅儲存於本機；留空即停用") },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    OutlinedTextField(
                        value = settings.aiKey,
                        onValueChange = { onSettings(settings.copy(aiKey = it)) },
                        label = { Text("API 金鑰") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    )
                    OutlinedTextField(
                        value = settings.aiBase,
                        onValueChange = { onSettings(settings.copy(aiBase = it)) },
                        label = { Text("API 位址") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    )
                    OutlinedTextField(
                        value = settings.aiModel,
                        onValueChange = { onSettings(settings.copy(aiModel = it)) },
                        label = { Text("模型名稱") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    )
                    Spacer(Modifier.height(8.dp))
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                Column {
                    ListItem(
                        headlineContent = { Text("關於") },
                        supportingContent = { Text("資料來源：data.gov.hk 開放數據 · 香港天文台（HKO）") },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    HorizontalDivider()
                    ListItem(
                        headlineContent = { Text("地圖") },
                        supportingContent = { Text("© OpenStreetMap contributors（ODbL）") },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    HorizontalDivider()
                    ListItem(
                        headlineContent = { Text("版本") },
                        supportingContent = { Text("${hk.senyou.travel.BuildConfig.VERSION_NAME} · Material 3") },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                }
            }
        }

        item { Spacer(Modifier.height(24.dp)) }
    }
}
