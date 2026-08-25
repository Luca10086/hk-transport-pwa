一、总体结论：基本符合（2 处小偏差）

本次变更（`css/skin-md3.css` + `js/wp8-concept.js`）主要为 Material Design 3 (MD3) 皮肤（`body[data-ui="md"]`）增加了新组件样式、细化了令牌并启用了系统深色模式支持。对照权威设计文档 `DESIGN.md`，整体实现符合 MD3 基准，结构清晰。但存在 2 处与设计文档的具体规范存在轻微偏差之处。

二、逐项检查表

| 变更点（文件:行/片段） | 对应设计要求 | 判定（符合/偏離） | 建议修复 |
| :--- | :--- | :--- | :--- |
| `css/skin-md3.css`: `body[data-ui="md"]` 默认深色主题 `--bg: #141218` | `DESIGN.md` §2.1 深色 Token：`--md-surface: #141218`。代码将 `--bg`（通常指页面背景）与 `--md-surface` 设为相同值，符合深色主题下背景与表面色一致的 Material 规范。 | 符合 | |
| `css/skin-md3.css`: `body[data-ui="md"]` 新增 `--md-medium: #9A6700` | `DESIGN.md` §3.4 结果卡：“medium → `#9A6700`”。代码新增并正确定义了此状态色 token。 | 符合 | |
| `css/skin-md3.css`: `body[data-ui="md"]` 新增 `--md-elev-1` 等阴影变量 | `DESIGN.md` §2.3 层级（Elevation）。代码中定义的 `--md-elev-1` 值与文档 `0 1px 2px rgba(29,27,32,.3), 0 1px 3px 1px rgba(29,27,32,.15)` 略有差异（使用了 `rgba(0,0,0)`）。这在视觉上（尤其在深色背景上）差异极小，但严格来说未完全引用文档定义的 rgba 值。 | **偏離** | 将 `rgba(0,0,0,.30)` 和 `rgba(0,0,0,.15)` 修改为 `rgba(29,27,32,.30)` 和 `rgba(29,27,32,.15)`，以精确匹配文档。 |
| `css/skin-md3.css`: `body[data-ui="md"]` 元素 `.tile` 的 `border-radius: var(--md-corner-l)` (16px) | `DESIGN.md` §2.2 形状：`--md-corner-l: 16px` 用于“卡片”。`.tile` 被用作首页的 Tonal Card，符合组件定义。 | 符合 | |
| `css/skin-md3.css`: `.fav-card` 使用 `box-shadow: var(--md-elev-1)` | `DESIGN.md` §3.4 结果卡：“elev-1”。代码将收藏卡（fav-card）视为结果卡的一种，应用了正确的层级。 | 符合 | |
| `css/skin-md3.css`: `.search-btn` 使用 `border-radius: var(--md-corner-full)` | `DESIGN.md` §2.2 形状：`--md-corner-full: 999px` 用于“药丸”。搜索按钮设计为胶囊形，符合规范。 | 符合 | |
| `css/skin-md3.css`: `.fav-pick` 系列按钮（.fav-pick-pin, .fav-pick-retry） | `DESIGN.md` §3.4 结果卡 / §3.6 FAB：代码实现了 Tonal（.fav-pick）、Filled（.fav-pick-pin）、Outlined（.fav-pick-retry）三种 M3 按钮变体，符合设计概念板 `design-concept-board-md.html` 中的按钮三态示意。 | 符合 | |
| `css/skin-md3.css`: `.ds-stop` 使用 `border-radius: var(--md-corner-m)` (12px) | `DESIGN.md` §2.2 形状：`--md-corner-m: 12px` 用于“列表、容器”。`.ds-stop` 是列表项容器，符合规范。 | 符合 | |
| `css/skin-md3.css`: `.warning-bar` 样式 | `DESIGN.md` §3.8 天气警告条：severe 用 `--md-error-container`，mild 用 `--md-secondary-container`。代码 `.warn-severe` 和 `.warn-mild` 正确应用了这两个 token。 | 符合 | |
| `css/skin-md3.css`: `@media (prefers-color-scheme: light)` 媒体查询 | `DESIGN.md` §5 深色模式：“通道一：系统 `prefers-color-scheme: dark`。”代码新增了对系统浅色模式的支持，作为 `data-theme` 手动设置之外的通道，完全符合规范。 | 符合 | |
| `css/skin-md3.css`: `.ab-btn[data-pane="map"]` 新增地图导航按钮 | `DESIGN.md` §3.5 Navigation Bar。概念板 `design-concept-board-md.html` 中显示了包含“路线”和“设定”的导航栏。新增“地图”按钮是功能扩展，未在指定的5个面板（首页、路线、实时、地图、行程、我的）的 MD3 规范中明确列出，但属于“设计文档未覆盖”的功能增补，不视为偏离。 | 设计文档未覆盖 | |
| `wp8-concept.html`: 新增“地图” App Bar 按钮 | 依据 `DESIGN-WP8.md` §导航结构，Pivot 面板应为 6 个。新增“地图”面板按钮可能超出原6面板规划，但原设计中已有“地图”面板（面板4），此处是为其在应用栏增加快捷入口。属于“设计文档未覆盖”的交互优化，不视为偏离。 | 设计文档未覆盖 | |

三、必须修复清单（仅列「偏离」项，按严重度排序，给出具体改法）

1.  **严重度：低（视觉微差）**
    *   **偏离项**：`css/skin-md3.css` 中深色主题 `--md-elev-1` 等阴影变量的 rgba 值使用了 `rgba(0,0,0)` 而非 `rgba(29,27,32)`。
    *   **设计依据**：`DESIGN.md` §2.3 层级（Elevation）明确定义了 `--md-elev-1` 的值。
    *   **建议修复**：
        ```css
        body[data-ui="md"] {
          /* ... */
          --md-elev-1: 0 1px 2px rgba(29,27,32,.30), 0 1px 3px 1px rgba(29,27,32,.15);
          --md-elev-2: 0 1px 2px rgba(29,27,32,.30), 0 2px 6px 2px rgba(29,27,32,.15);
          --md-elev-3: 0 4px 8px 3px rgba(29,27,32,.15), 0 1px 3px rgba(29,27,32,.30);
        }
        ```

四、做得好的地方
1.  **令牌系统完善**：新增了 `--md-medium`、`--md-state` 等语义化令牌，使状态色和交互反馈的管理更符合 M3 规范。
2.  **组件层级清晰**：正确地将 `--md-elev-1/2/3` 应用于卡片（`.tile`）、导航栏（`.appbar`）、底部弹层（`.detail-sheet`）和 FAB，符合 Material Design 的层级语言。
3.  **深色模式集成**：实现了 `prefers-color-scheme` 系统级深色模式支持，完全遵循 `DESIGN.md` §5 的“双通道”规范。
4.  **交互反馈规范**：所有新增组件（如 `.tile`, `.metro-row`, `.ab-btn`）均通过 `::after` 伪元素实现 `--md-state` 和 `--md-state-pressed` 半透明层反馈，而非位移或缩放，符合 M3 状态层原则。
5.  **结构化组织**：CSS 变更采用了清晰的编号分节（如 `/* == 1. Large Top App Bar == */`），提升了代码的可维护性和与设计文档的对应性。