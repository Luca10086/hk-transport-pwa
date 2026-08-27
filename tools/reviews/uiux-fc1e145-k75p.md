**一、总体结论：明显偏离（3 处）**

本次变更引入了 K75P 实时公交线路图浮层组件，包含大量新增 CSS 样式与 JS 逻辑。经逐项对照权威 WP8-Metro-Spec 设计规范，发现存在多处违反核心设计原则（全直角、禁粗体）的偏差。需修正。

**二、逐项检查表**

| 变更点（文件:行/片段） | 对应设计要求 | 判定 | 建议修复 |
| :--- | :--- | :--- | :--- |
| `css/wp8-strict.css` 中 `.k75p-live-title { font-weight: 600; ... }` | WP8-Metro-Spec/设计规范.md: **全 App 禁止 Bold（700）；强调=字号+颜色**。 | **偏离** | 移除 `font-weight: 600`，改为默认 `400` 或 `300`（细体）。 |
| `css/wp8-strict.css` 中 `.kt-track::before { ... border-radius: 2px; ... }` | WP8-Metro-Spec/设计规范.md: **圆角=0（全部直角）**；§2.1.3: `--m-radius: 0`。 | **偏离** | 移除 `border-radius: 2px`，改为 `border-radius: 0`。 |
| `css/wp8-strict.css` 中 `.kt-dot { ... border-radius: 50%; ... }` 及 `.kt-bus { ... border-radius: 50%; ... }` | WP8-Metro-Spec/设计规范.md: **圆角=0（全部直角）**；§0 反模式清单：**✗ 圆角按钮、胶囊按钮**。 | **偏离** | 将 `.kt-dot` 改为方块（如 `border-radius: 0`），将 `.kt-bus` 的圆形改为直角矩形（如 `border-radius: 0`），或使用纯文字/符号替代。 |
| `css/wp8-strict.css` 中 `.k75p-live-close, .k75p-live-refresh { border-radius: 50%; ... }` | WP8-Metro-Spec/设计规范.md: **圆角=0**；圆形仅限应用栏按钮与地图节点。 | 设计文档未覆盖 | 此按钮为浮层内自定义控件，规范未明确覆盖。但若追求极致 Metro 风格，建议改为直角。 |
| `css/wp8-strict.css` 中 `.k75p-live-title { font-family: 'Segoe UI', ... }` | WP8-Metro-Spec/设计规范.md: **标题一律 Light 300 字重**（Segoe UI Light）。 | 设计文档未覆盖 | 标题应使用 `font-family: 'Segoe UI Light', 'Segoe WP Light', ...` 以确保细体字重。建议修正。 |
| `css/wp8-strict.css` 中 `.kt-chip { border-radius: 8px; ... }` | WP8-Metro-Spec/设计规范.md: **圆角=0**。 | 设计文档未覆盖 | 芯片为新增组件，规范未覆盖。若严格遵守 Metro 扁平直角原则，应改为 `0`。 |
| `wp8-concept.html` 中 `<button>✕</button>` / `<button>⟳</button>` | WP8-Metro-Spec/设计规范.md: §1.5 图标风格：**使用 Segoe MDL2 Assets 字符（如 `\uE711` Close, `\uE72C` Refresh）**。 | 设计文档未覆盖 | 为浮层新增按钮，建议改用 MDL2 图标字符以保持图标风格统一。 |
| `js/wp8-concept.js` 中 `renderK75PLive` 函数生成 HTML 包含 `&nbsp;` | WP8-Metro-Spec/设计规范.md: 内容优先，排版驱动；间距由 CSS 控制。 | 符合 | 使用 HTML 实体控制视觉间距，功能上无问题。 |
| `css/wp8-strict.css` 中 `.kt-name { font-size: 15px; ... }` | WP8-Metro-Spec/设计规范.md: §1.3 字号表：最小为 `meta: 13px`。15px 介于 `caption(17px)` 与 `meta(13px)` 之间。 | 设计文档未覆盖 | 字号未严格对齐规范给定的 8 级字阶。建议调整为 `13px` 或 `17px`。 |

**三、必须修复清单（按严重度排序）**

1.  **【严重】禁止粗体**
    *   **文件**: `css/wp8-strict.css` 中 `.k75p-live-title`
    *   **问题**: `font-weight: 600` 违反“全App禁止Bold(700)”的硬性规定。
    *   **改法**: 将 `font-weight: 600;` 修改为 `font-weight: 400;` 或 `font-weight: 300;`。

2.  **【严重】全直角原则**
    *   **文件**: `css/wp8-strict.css` 中 `.kt-track::before`, `.kt-dot`, `.kt-bus`
    *   **问题**: 使用了 `border-radius: 2px` 和 `border-radius: 50%`，违反“全部直角”原则。
    *   **改法**:
        *   将 `.kt-track::before` 的 `border-radius: 2px;` 修改为 `border-radius: 0;`。
        *   将 `.kt-dot` 和 `.kt-bus` 的 `border-radius: 50%;` 修改为 `border-radius: 0;`，并调整形状为矩形。

**四、做得好的地方**

*   **使用设计令牌**：新增样式大量使用 `var(--accent)`, `var(--bg)`, `var(--line)`, `var(--text)` 等 CSS 变量，符合一致性开发指引，未硬编码色值。
*   **遵循布局网格**：间距如 `8px`, `12px`, `20px` 等基本符合 8px/12px 网格系统。
*   **交互逻辑清晰**：JavaScript 实现了实时数据获取、模型构建和 DOM 更新，功能逻辑本身无设计偏离。