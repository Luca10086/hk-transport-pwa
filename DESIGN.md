# 森友出行手册 — Material 3 移动端设计规范 (DESIGN.md)

> 生成方式：参考 [brand-to-design-md-skill](https://github.com/shaom/brand-to-design-md-skill) 方法，从应用现有实现（`index.html` 内 `body[data-skin="md"]` 区块）提炼设计令牌与组件规范。
> 适用范围：本应用 Material 3 皮肤（移动端优先）。动森 AC / iOS 皮肤另见各自 CSS 区块。

---

## 1. 设计原则

1. **M3 baseline**：严格遵循 Material Design 3 规范（m3.material.io），seed 色 `#6750A4`，不自行发明组件形态。
2. **移动优先**：目标为手机竖屏 PWA；大屏（≥700px）仅放宽间距与栅格，不改变组件结构。
3. **状态优先**：交互反馈使用 M3 状态层（hover/active/pressed 半透明层），不使用位移模拟。
4. **等宽扫视**：ETA 数字一律使用 `Roboto Mono` + `tabular-nums`，保证多行对齐。
5. **可访问性**：正文对比度 ≥ WCAG AA（4.5:1）；触控目标 ≥ 44px；尊重 `prefers-reduced-motion`。

## 2. 设计令牌（Design Tokens）

### 2.1 颜色（浅色 / 深色）

| Token | 浅色值 | 深色值 | 用途 |
|---|---|---|---|
| `--md-primary` | `#6750A4` | `#D0BCFF` | 强调色（按钮、选中态） |
| `--md-on-primary` | `#FFFFFF` | `#381E72` | primary 上的内容色 |
| `--md-primary-container` | `#EADDFF` | `#4F378B` | tonal 容器（FAB、徽章） |
| `--md-on-primary-container` | `#21005D` | `#EADDFF` | primary-container 上的内容色 |
| `--md-secondary-container` | `#E8DEF8` | `#4A4458` | 选中 chip、导航指示药丸 |
| `--md-on-secondary-container` | `#1D192B` | `#E8DEF8` | 其上内容色 |
| `--md-tertiary-container` | `#FFD8E4` | `#633B48` | 公司标签、tag 底色 |
| `--md-on-tertiary-container` | `#31111D` | `#FFD8E4` | 其上内容色 |
| `--md-error` / `--md-error-container` | `#B3261E` / `#F9DEDC` | `#F2B8B5` / `#8C1D18` | 错误、soon 状态 |
| `--md-on-error-container` | `#410E0B` | `#F9DEDC` | 其上内容色 |
| `--md-surface` | `#FEF7FF` | `#141218` | 卡片表面 |
| `--md-surface-container` | `#F3EDF7` | `#211F26` | 输入框底、分区底色 |
| `--md-surface-container-high` | `#ECE6F0` | `#2B2930` | 高对比容器 |
| `--md-surface-highest` | `#E6E0E9` | `#36343B` | 最高对比容器 |
| `--md-on-surface` | `#1D1B20` | `#E6E0E9` | 主文本 |
| `--md-on-surface-variant` | `#49454F` | `#CAC4D0` | 次要文本 |
| `--md-outline` / `--md-outline-variant` | `#79747E` / `#CAC4D0` | `#938F99` / `#49454F` | 描边 / 细分隔线 |
| `--md-surface-lowest` | `#FFFFFF` | `#0F0D13` | 卡片底层 |

### 2.2 形状（Shape）

| Token | 值 | 用途 |
|---|---|---|
| `--md-corner-xs` | 4px | 输入框顶部圆角 |
| `--md-corner-s` | 8px | 小元素、chip |
| `--md-corner-m` | 12px | 列表、容器 |
| `--md-corner-l` | 16px | 卡片 |
| `--md-corner-xl` | 28px | 搜索栏、底部弹层 |
| `--md-corner-full` | 999px | 药丸（导航指示、segmented） |

### 2.3 层级（Elevation）

| Token | 值 | 用途 |
|---|---|---|
| `--md-elev-0` | none | 平面元素 |
| `--md-elev-1` | `0 1px 2px rgba(29,27,32,.3), 0 1px 3px 1px rgba(29,27,32,.15)` | 卡片、输入框 |
| `--md-elev-2` | `0 1px 2px rgba(29,27,32,.3), 0 2px 6px 2px rgba(29,27,32,.15)` | 卡片 hover、底栏 |
| `--md-elev-3` | `0 4px 8px 3px rgba(29,27,32,.15), 0 1px 3px rgba(29,27,32,.3)` | FAB、底部弹层 |

### 2.4 字体（Typography）

| 角色 | 字体 | 尺寸/字重 | 用途 |
|---|---|---|---|
| Large Top App Bar 标题 | Roboto | 26px / 700 | 导航栏大标题 |
| App Bar kicker | Roboto | 10px / 500, 字距 2.4px | 大标题上方小字 |
| title-medium | Roboto | 16px / 500 | 区块标题 |
| body-medium | Roboto | 14px / 400 | 正文 |
| label-large | Roboto | 14px / 500 | 按钮、chip |
| ETA 数字 | Roboto Mono | 21.6px / 700, tabular-nums | 到站时间 |

## 3. 组件规范

### 3.1 Large Top App Bar
- surface 底色，无重阴影，仅底部 1px `--md-outline-variant` 细分隔线。
- 大标题 26px/700，上方 `HONG KONG TRANSPORT` kicker（字距 2.4px，`--md-on-surface-variant`）。
- 右侧图标按钮：40×40 圆形，状态层 `rgba(103,80,164,.08)`。

### 3.2 Search Bar
- 胶囊形（`--md-corner-xl`）`--md-surface-container-high` 底 + 放大镜内嵌图标。
- Focus：1px `--md-primary` 描边（无外发光）。

### 3.3 Filter Chips（交通类型切换）
- 未选中：outlined chip（`--md-outline` 描边、`--md-on-surface-variant` 文字）。
- 选中：`--md-secondary-container` tonal chip + ✓ 前缀。
- 高度 32px，圆角 `--md-corner-s`。

### 3.4 结果卡（Elevated Card）
- `--md-surface` 底、1px `--md-outline-variant` 描边、elev-1；hover elev-2（无位移）。
- 路线号 `--md-primary`；公司 tag 用 `--md-tertiary-container` tonal。
- ETA 数字 Roboto Mono；soon → `--md-error`，medium → `#9A6700`。
- 底部进度条：`--md-surface-variant` 轨道 + `--md-primary` 填充。

### 3.5 Navigation Bar
- 80px 高，surface 底 + 顶部分隔线，elev-2。
- 选中项：64×32 `--md-secondary-container` 指示药丸（`--md-corner-full`）+ `--md-on-surface` 图标文字。

### 3.6 FAB
- 大号 FAB：`--md-primary-container` 底、`--md-corner-l` 圆角、elev-3。

### 3.7 Bottom Sheet（全线候车）
- 28px 顶部圆角、elev-3、最高 86vh 可滚动。
- 表头 sticky：surface 底 + 底部细分隔线；行用 `--md-surface-container` 底色。
- 上/下行三列布局（`ds-tri`）：站名 38% + 两列时间。

### 3.8 天气警告条（新增）
- severe（颱風/暴雨/雷暴/山泥/酷熱/寒冷/霜凍/海嘯/水浸）：`--md-error-container` tonal。
- mild（強風/季候風等）：`--md-secondary-container` tonal。
- 右端 ✕ 可收起（会话内不再弹出）。

## 4. 使用边界（Usage Boundaries）

| 做（Do） | 不做（Don't） |
|---|---|
| 使用 token 取色，禁止硬编码色值 | 在 md 皮肤内混入 AC 木牌/糖果风元素 |
| ETA 数字用 Roboto Mono 等宽 | 用 `--md-elevation1` 等未定义变量（应写 `--md-elev-1`） |
| 交互反馈用状态层 | 用位移/缩放模拟按压缩放 |
| 深色模式走 `data-theme` / `prefers-color-scheme` 双通道 | 单独给 md 写一份不跟随系统的深色 |
| 移动端触控目标 ≥ 44px | 依赖 hover 才能发现的功能 |

## 5. 深色模式（Dark Theme）

- 通道一：系统 `prefers-color-scheme: dark`。
- 通道二：设定页手动 `data-theme="dark"`（`data-theme="light"` 时强制浅色）。
- 两通道通过 CSS 双选择器实现，token 见 §2.1 深色列。

## 6. 响应式

- `<700px`：单列栅格，底栏 80px，安全区用 `env(safe-area-inset-*)`。
- `≥700px`：卡片 2 列、K75P 2 列。
- `≥1000px`：卡片 3 列、K75P 3 列。

## 7. 品牌色 vs 状态色（分层原则）

为避免同页出现多种「绿/橙」抢注意力，遵循以下分工：

| 角色 | 颜色 | 用途 |
|---|---|---|
| **品牌主色** `--primary` / `--primary-dark` | 各皮肤主色（AC 绿 / M3 紫 / iOS 蓝） | 导航、按钮、路线号、选中态、ETA 常态数字 |
| **单一强调色**（AC 橙） | 仅搜索/刷新按钮 | 页面唯一的「行动点」 |
| **状态色（语义）** | `soon` 红 `#e53935`、`medium` 橙 `#ef6c00`、常态绿=`--primary-dark` | ETA 紧迫度分级，全局统一 |

规则：状态色是「语义」（紧不紧），品牌色是「身份」——两者不要在同一元素上抢。ETA 常态用品牌色，到站紧急度（<2分钟红 / <10分钟橙）才用状态色。
