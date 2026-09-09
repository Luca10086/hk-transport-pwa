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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import hk.senyou.travel.data.Fav
import hk.senyou.travel.data.SearchItem
import hk.senyou.travel.data.SearchRepo
import hk.senyou.travel.data.Store
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
        columns = GridCells.Fixed(if (expanded) 2 else 1),
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
                FavCard(
                    fav = f,
                    mins = etas[f.key],
                    onOpen = { onOpenRoute(SearchRepo.favToSearchItem(f)) },
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
private fun FavCard(fav: Fav, mins: Int?, onOpen: () -> Unit, onRemove: () -> Unit) {
    GlassSurface(modifier = Modifier.fillMaxWidth().clickable { onOpen() }) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(if (fav.type == "bus" || fav.type == "mtrbus") fav.route else (fav.stationName.ifBlank { fav.stopName }), color = V3.Text1, fontSize = 18.sp, fontWeight = FontWeight.Light, modifier = Modifier.weight(1f))
                Text(SearchRepo.favMeta(fav), color = V3.Text2, fontSize = 12.sp)
                Spacer(Modifier.size(10.dp))
                GlassSurface(modifier = Modifier.size(36.dp).clickable { onRemove() }, shape = CircleShape) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("✕", color = V3.Text2, fontSize = 13.sp) }
                }
            }
            Spacer(Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.Bottom) {
                val (c, t) = when {
                    mins == null -> V3.Text2 to "—"
                    mins <= 2 -> V3.Danger to "$mins"
                    mins <= 10 -> V3.Warning to "$mins"
                    else -> V3.Success to "$mins"
                }
                Text(t, color = c, fontSize = 34.sp, fontWeight = FontWeight.Light)
                if (mins != null) Text(" 分鐘", color = V3.Text2, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
                Spacer(Modifier.weight(1f))
                Text(if (fav.dir == "inbound") "回程" else "去程", color = V3.Text2, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
            }
            if (fav.stopName.isNotBlank() && fav.type != "mtr" && fav.type != "lrt") {
                Text(fav.stopName, color = V3.Text2, fontSize = 12.sp, maxLines = 1)
            }
        }
    }
}
