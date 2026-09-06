---
name: uiux-review
description: Use after every update to hk-transport-pwa (especially UI/UX changes) — delegate to a subagent that runs MiMo v2.5 via tools/uiux-review.mjs to verify the new/modified code stays true to the design docs, and report deviations.
---

# UI/UX 设计一致性审查（MiMo v2.5 子代理）

每次项目更新（提交或推送）之后——尤其是 UI/UX 相关改动——必须执行本规则：用子代理调用 MiMo v2.5，对照权威设计文档检查**新增与修改**部分有没有偏离设计原意。

## 零、MiMo 工作分工原则（用户指令 · 2026-03）

**派给 MiMo（简单、独立、输入明确的产出型任务）**——优先使用原生模型源：

```js
agent(prompt, { provider: 'xiaomi', model: 'mimo-v2.5' })   // 即答型 / 草典型
agent(prompt, { provider: 'xiaomi', model: 'mimo-v2.5-pro' }) // 长报告 / 评审型
```

| 适合派给 MiMo | 主代理自己做 |
|---|---|
| 图标设计：单色线性 SVG（Material Symbols / Segoe MDL2 风格）路径草稿与 2–3 个变体 | 把草稿合入代码、核对 24×24/描边宽度、接入皮肤 |
| UI/UX 排版建议：间距 / 字级 / 配色值 / 圆角规则的具体取值（「这行该用哪个 token」） | 读全仓上下文的多文件落地（html+css+js 联动） |
| 短片段样式对照：一段 CSS 或一段界面描述 ↔ 设计文档 | 需要 git / 测试 / 真实数据验证的改动（如 K75P 定位算法） |
| 文案 / 标签 / 磁贴标语（中英） | 交互逻辑、数据模型、多皮肤并存 |
| 评审与复核：给方案让 MiMo 挑毛病、找漏项 | MiMo 产出的审查与修正（double-check 是主代理责任） |

**判断主动权在主代理**：任务输入是否一屏讲得清、是否需要跨文件读码、风险是否低（纯样式/文案/草稿）→ 是则派 MiMo；否则自己做。MiMo 产出必须经主代理审查后再提交（引用设计文档验证），不得直接落地。

*主代理注意：工具可用两条链——原生模型源（provider:'xiaomi'，经 DSH 注册，已验证可用）与脚本 `tools/uiux-review.mjs`（带设计文档+diff+存档，用于正式审查）。*

## 何时触发

- 任何涉及 `wp8-concept.html`、`css/`、`js/wp8-concept.js`、磁贴/图标/样式、交互行为（返回键、拖拽、详情页、列表、应用栏）的变更提交之后。
- 用户明说「按规则审查」或「检查有没有偏离设计」时。

## Procedure（主代理执行）

1. **确定审查范围**：最近一次 UI/UX 相关提交为基线（通常是上一个 `fix`/`feat` 提交，用 `git log --oneline -5` 确认），对 `base..HEAD` 生成 diff：
   ```powershell
   git diff <base>..HEAD -- css js wp8-concept.html > .tmp-diff.txt
   ```
2. **启动子代理**（后台，`run_in_background: true`），任务自包含：
   - 工作目录 `E:\DAFYU GZQ\hk-transport-pwa`
   - 运行 `node tools/uiux-review.mjs --diff .tmp-diff.txt --out tools/reviews/uiux-<yyyymmdd-hhmm>.md`
   - 子代理把报告要点（总体结论、判定表、必须修复清单）原样带回主对话，**不改任何代码**。
   - 若脚本报错（HTTP/密钥/空 diff），子代理如实报告工具失败原因，不得编造审查结论。
3. **主代理汇报**：向用户给出 符合/基本符合/明显偏离 结论 + 必须修复清单；经用户确认后修复「偏离」项。
4. **清理**：删除 `.tmp-diff.txt`（或保留在 tools/reviews/ 存档）。

## 子代理审查要点（写入任务提示词）

- 权威依据：`DESIGN.md`、`DESIGN-UIUX.md`、`DESIGN-WP8-CONCEPT.md`、`DESIGN-SPEC-UPDATE.md`、`DESIGN-WP8.md`、`E:\DAFYU GZQ\WP8-Metro-Spec\设计规范.md`。
- 硬性红线（WP8 皮肤）：纯黑背景、单一强调色 #0078D7、字级 42/72/32/28/24/22/17/13、全直角、**无阴影/无渐变/无圆角**、磁贴政策（主磁贴 accent 其余黑底）、应用栏 72px、禁止 3D/flip 动画、图标为单色线性（Segoe MDL2 风格）。
- 功能正确但视觉/交互偏离也算偏离（例如多出按钮、字号层级错、圆角残留、emoji 图标、返回键行为不合规）。
- 每个判定必须引用 文件:行 或 diff 片段证据；设计文档未覆盖的改动标注「未覆盖」，不臆断。

## Constraints

- 审查阶段**禁止修改代码**——子代理只读。
- 若 MiMo 不可用（网络/密钥/限流），如实报告，不得跳过规则或伪造结论。
- 本 SKILL.md 的权威副本在 `tools/uiux-review/SKILL.md`；DSH 技能目录中的副本若不同，以此仓库副本为准。
