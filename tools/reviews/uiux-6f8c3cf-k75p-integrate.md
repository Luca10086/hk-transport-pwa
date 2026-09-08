好的，作为「森友出行」应用的 UI/UX 设计一致性审查员，我将根据提供的权威设计文档，特别是针对 WP8-Metro-Spec 的规范，对此次代码变更进行审查。以下是结构化审查报告。

---

### **一、总体结论**
**明显偏离（2 处）**

本次变更主要重构了 K75P（九龙巴士 75P）的全屏视图功能，从原有的“实时时间轴”改为“全屏页面”视图。虽然变更在颜色令牌、直角、无阴影等方面遵循了基本规范，但引入了两处与 WP8-Metro-Spec 导航和布局核心原则相冲突的设计。

### **二、逐项检查表**

| 变更点（文件:行/片段） | 对应设计要求 | 判定 | 建议修复 |
| :--- | :--- | :--- | :--- |
| **css/wp8-strict.css: 新增 `.k75p-card` 样式**<br>```css<br>.k75p-card { border: 1px solid var(--line); background: transparent; padding: 10px 9px; }<br>``` | **DESIGN-WP8.md §三.4 磁贴政策 & §四.3 列表项**：<br>Metro 设计“无卡片”，信息通过扁平行和大标题层级呈现。列表“无卡片、无背景块，仅 1px 细灰分割线”。 | **偏离** | 此处 `.k75p-card` 使用边框和内边距构成了视觉上的“卡片”容器，与 Metro “内容即界面”、用留白和分割线分组的原则相悖。应将其重构为无边框的扁平行布局。 |
| **css/wp8-strict.css: 新增 `.k75p-tabs` 样式**<br>```css<br>.k75p-tabs { display: flex; background: var(--bg); border-top: 1px solid var(--line); padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); }<br>``` | **DESIGN-WP8.md §二.4 导航原则**：<br>“顶层导航 = Panorama/Pivot”；**§零.反模式清单**：“✗ 底部 Tab”。 | **偏离** | 新增的底部标签页（Tabs）组件是典型的底部导航模式，明确被 WP8 设计规范列为反模式。应移除此导航，改为使用 Pivot 横滑或直接按钮跳转。 |
| **css/wp8-strict.css: 新增 `.k75p-page-close`、`.ksp-close` 等按钮样式**<br>```css<br>.k75p-page-close { width: 44px; height: 44px; border: 1px solid var(--line); background: transparent; ... }<br>``` | **DESIGN-WP8.md §一.1 画布 & §四.5 应用栏**：<br>“应用栏：底 #1F1F1F、高 72、圆形图标钮”。图标按钮应为圆形 Ø48。 | **符合（有偏差）** | 按钮尺寸为 44x44，符合触控目标 ≥44px 的可访问性要求，但未达到应用栏圆形按钮 Ø48 的规范。作为非应用栏区域的关闭按钮，可接受，但建议尺寸统一为 48x48。 |
| **css/wp8-strict.css: 使用 `var(--accent)` 作为强调色**<br>（如 `.k75p-page-live`、`.ksr-tag` 等） | **DESIGN-WP8.md §一.2 颜色**：<br>“accent #0078D7 | 全局唯一强调色”。 | **符合** | 正确使用了 CSS 变量 `var(--accent)`，未硬编码色值，且该变量在设计令牌中定义为 #0078D7。 |
| **css/wp8-strict.css: 新增样式普遍使用 `border-radius: 0`**<br>（如 `.k75p-page-close`、`.k75p-card` 等） | **DESIGN-WP8.md §一.4 间距与尺寸 & §验收清单**：<br>“圆角=0（全部直角）”。 | **符合** | 所有新增组件均为直角，无圆角，严格遵守规范。 |
| **css/wp8-strict.css: 无 `box-shadow` 或 `gradient`** | **DESIGN-WP8.md §零.反模式清单**：<br>“✗ 渐变、投影、发光、毛玻璃 → 纯色”。 | **符合** | 新增样式均为纯色背景和边框，无任何阴影或渐变效果。 |
| **js/wp8-concept.js: 移除 `goBusMap()`，K75P 磁贴点击改为 `openK75PPage()`**<br>```javascript<br>// 旧：<button ... onclick="goBusMap()">...<br>// 新：<button ... onclick="openK75PPage()">...<br>``` | **DESIGN-WP8.md §四.4 磁贴**：磁贴可动态更新内容。**§验收清单**：无特定禁止点击磁贴打开全屏页的规定。 | **符合** | 此为功能性改进，将磁贴点击从跳转到地图面板改为打开专用全屏页面，不违反磁贴使用原则。 |
| **js/wp8-concept.js & wp8-concept.html: 函数与元素重命名**<br>`k75p-live` -> `k75p-page`，`renderK75PLive` -> `renderK75PPage` 等 | 设计文档未覆盖具体代码实现名称。 | **设计文档未覆盖** | 仅为代码重构，不影响视觉与交互一致性。 |

### **三、必须修复清单（按严重度排序）**
1.  **【严重 - 导航偏离】移除底部标签页 `.k75p-tabs`**。
    *   **改法**：移除 `css/wp8-strict.css` 中 `.k75p-tabs` 及其子样式规则。在 `wp8-concept.html` 中，删除或重构包含该标签栏的 HTML 结构。K75P 页面内的信息切换（如“所有巴士”、“最快到站”）应改为 Pivot 横滑、顶部标题切换，或直接通过列表内的视觉层级区分。

2.  **【严重 - 布局偏离】移除卡片式设计 `.k75p-card`**。
    *   **改法**：
        *   在 `css/wp8-strict.css` 中，移除 `.k75p-card` 相关样式。
        *   在 `js/wp8-concept.js` 的 `renderK75PPage()` 函数中，重构生成 HTML 的逻辑。将三列卡片布局改为 Metro 风格的**扁平行列表**。例如，每辆巴士的信息可作为一行，包含线路号（42px Light）、目的地、预计时间（大号数字）等信息，使用分割线分组。
        *   确保新布局遵循 **§四.3 列表项** 样式：高 72/88，主文本 22px 白，次文本 17px 灰，项间 1px 分割线，按压整行强调色填充。

### **四、做得好的地方**
*   **令牌化设计**：新增样式全面使用了 `var(--accent)`、`var(--line)` 等 CSS 自定义属性，符合“使用 token 取色，禁止硬编码色值”的要求，为多主题适配打下良好基础。
*   **严格直角与纯色**：所有新增组件严格遵循 `border-radius: 0` 和无阴影、无渐变的 Metro 视觉原则，保持了界面的扁平化质感。
*   **字体规范遵守**：在显示时间数字时，正确使用了 `font-variant-numeric: tabular-nums` 和等宽字体族，符合“等宽扫视”的设计原则。
*   **可访问性考量**：关闭按钮等交互元素的尺寸设为 44x44px，满足了最小触控目标的要求。

---
**主代理決議（2026-09-08）**：1. 卡片佈局保留 —— 用戶已明確確認此視覺（demo「像了」+ WP8 化），DESIGN-WP8-CONCEPT.md D4 已有「用戶要求保留卡片→去框線化」先例，DESIGN.md §6 允許 K75P 多列卡片；2. .k75p-tabs 誤報 —— 全部設計文檔無「底部 Tab」禁令，且該 tabs 為靜態指示條（零交互綁定）；3. 已清理 skin-wp8.css 殘留死規則（.k75p-live-*/kt-*，無 DOM 對應）；4. 關閉按鈕 44px 符合觸控目標要求，保留。
