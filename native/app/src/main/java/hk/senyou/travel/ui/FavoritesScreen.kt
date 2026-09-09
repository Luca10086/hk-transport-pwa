package hk.senyou.travel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.Fav
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Store
import hk.senyou.travel.data.displayName
import hk.senyou.travel.ui.theme.V3
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.launch

private val GROUP_ORDER = listOf("kmb", "ctb", "nlb", "mtrbus", "mtr", "lrt", "other")
private val GROUP_NAMES = mapOf("kmb" to "九巴", "ctb" to "城巴", "nlb" to "嶼巴", "mtrbus" to "港鐵巴士", "mtr" to "港鐵", "lrt" to "輕鐵", "other" to "其他")
private val GROUP_COLORS = mapOf("kmb" to V3.CoKmb, "ctb" to V3.CoCtb, "nlb" to V3.CoNlb, "mtrbus" to V3.CoMtrBus, "mtr" to V3.CoMtr, "lrt" to V3.CoLrt)

/** 收藏頁：按公司分組 + 實時 ETA + 移除 */
@Composable
fun FavoritesScreen(onOpenRoute: (SearchItem) -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val favs by Store.favorites(ctx).collectAsStateWithLifecycle(initialValue = emptyList())
    var etas by remember { mutableStateOf<Map<String, Int?>>(emptyMap()) }

    LaunchedEffect(favs) {
        if (favs.isEmpty()) { etas = emptyMap(); return@LaunchedEffect }
        val res = favs.map { f -> async { f.key to SearchRepo.favEta(f) } }.awaitAll()
        etas = res.toMap()
        // 成功的 ETA 寫入離線緩存
        res.forEach { (k, m) -> if (m != null) hk.senyou.travel.data.Cache.putEtaCache(k, m) }
    }

    if (favs.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("☆", color = V3.Text2, fontSize = 54.sp)
                Spacer(Modifier.height(14.dp))
                Text("暫無收藏", color = V3.Text1, fontSize = 17.sp)
                Spacer(Modifier.height(8.dp))
                Text("在搜尋結果點 ☆ 加入", color = V3.Text2, fontSize = 13.sp)
            }
        }
        return
    }

    val expanded = LocalAdaptive.current.isExpanded
    LazyVerticalGrid(
        columns = GridCells.Fixed(LocalAdaptive.current.listColumns),
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        GROUP_ORDER.forEach { g ->
            val list = favs.filter { SearchRepo.favGroup(it) == g }
            if (list.isEmpty()) return@forEach
            item(key = "h-$g", span = { GridItemSpan(maxLineSpan) }) {
                Row(Modifier.padding(top = 10.dp, bottom = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(9.dp).clip(CircleShape).background(GROUP_COLORS[g] ?: V3.Accent))
                    Spacer(Modifier.size(8.dp))
                    Text(GROUP_NAMES[g] ?: g, color = V3.Text2, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                }
            }
            items(list, key = { it.key }) { f ->
                val cached = hk.senyou.travel.data.Cache.etaCache(f.key)
                FavCard(
                    fav = f,
                    mins = etas[f.key],
                    cached = cached,
                    onOpen = { onOpenRoute(SearchRepo.favToSearchItem(f)) },
                    onCycleAlert = {
                        scope.launch {
                            val next = when (f.alertMins) {
                                0 -> 3
                                3 -> 5
                                5 -> 10
                                else -> 0
                            }
                            Store.saveFavorites(ctx, favs.map { if (it.key == f.key) it.copy(alertMins = next) else it })
                        }
                    },
                    onRemove = {
                        scope.launch {
                            Store.saveFavorites(ctx, favs.filterNot { it.key == f.key })
                        }
                    },
                )
                Spacer(Modifier.height(8.dp))
            }
        }
        item { Spacer(Modifier.height(110.dp)) }
    }
}

@Composable
private fun FavCard(
    fav: Fav,
    mins: Int?,
    cached: Pair<Int, Long>?,
    onOpen: () -> Unit,
    onCycleAlert: () -> Unit,
    onRemove: () -> Unit,
) {
    GlassSurface(modifier = Modifier.fillMaxWidth().clickable { onOpen() }) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(fav.displayName(), color = V3.Text1, fontSize = 18.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
                Text(SearchRepo.favMeta(fav), color = V3.Text2, fontSize = 12.sp)
                Spacer(Modifier.size(8.dp))
                // 到站提醒門檻：關 → 3 → 5 → 10 分
                GlassSurface(
                    modifier = Modifier.widthIn(min = 62.dp).height(36.dp)
                        .semantics {
                            contentDescription = if (fav.alertMins > 0) "到站提醒 ${fav.alertMins} 分鐘，點擊更改" else "開啟到站提醒"
                        }
                        .clickable { onCycleAlert() },
                    shape = CircleShape,
                    strong = fav.alertMins > 0,
                ) {
                    Box(Modifier.padding(horizontal = 10.dp), contentAlignment = Alignment.Center) {
                        Text(
                            if (fav.alertMins > 0) "🔔 ${fav.alertMins}分" else "🔕",
                            color = if (fav.alertMins > 0) V3.Warning else V3.Text2,
                            fontSize = 12.sp, maxLines = 1,
                        )
                    }
                }
                Spacer(Modifier.size(8.dp))
                GlassSurface(
                    modifier = Modifier.size(36.dp).semantics { contentDescription = "移除收藏" }.clickable { onRemove() },
                    shape = CircleShape,
                ) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("✕", color = V3.Text2, fontSize = 13.sp) }
                }
            }
            Spacer(Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.Bottom) {
                val showMins = mins ?: cached?.first
                val stale = mins == null && cached != null
                val (c, t) = when {
                    showMins == null -> V3.Text2 to "—"
                    showMins <= 2 -> V3.Danger to "$showMins"
                    showMins <= 10 -> V3.Warning to "$showMins"
                    else -> V3.Success to "$showMins"
                }
                Text(t, color = c, fontSize = 34.sp, fontWeight = FontWeight.Light)
                if (showMins != null) Text(" 分鐘", color = V3.Text2, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
                if (stale) {
                    val hhmm = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault())
                        .format(java.util.Date(cached!!.second))
                    Text("（上次 $hhmm）", color = V3.Text2, fontSize = 11.sp, modifier = Modifier.padding(start = 6.dp, bottom = 10.dp))
                }
                Spacer(Modifier.weight(1f))
                Text(if (fav.dir == "inbound") "回程" else "去程", color = V3.Text2, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
            }
            if (fav.stopName.isNotBlank() && fav.type != "mtr" && fav.type != "lrt") {
                Text(fav.stopName, color = V3.Text2, fontSize = 12.sp, maxLines = 1)
            }
        }
    }
}
