package hk.senyou.travel.ui

import hk.senyou.travel.data.SearchItem
import kotlinx.coroutines.flow.MutableStateFlow

/** 通知點擊深鏈（由 MainActivity 寫入，Compose 消費後清空） */
object DeepLink {
    val flow = MutableStateFlow<SearchItem?>(null)

    fun push(item: SearchItem) { flow.value = item }
}