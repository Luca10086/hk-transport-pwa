# tools/ — 开发辅助工具

> 不进 APK / 不影响运行时的开发脚本。`apk/build-apk.bat` 只同步 `index.html`、`css/`、`js/`、`lib/`，本目录文件仅保存在仓库中，由开发者手工运行。

## mimo-call.mjs — 命令行调用 MiMo 大模型

用命令行快速调用小米 MiMo API（默认 `mimo-v2.5-pro`），支持多模态看图。适合在开发检查素材、生成文案、评审页面截图等场景即问即答。

### 前置条件

- Node.js 18+（使用原生 `fetch`，无需 `npm install`）
- 本机的 DSH 凭据文件存在 `~/.dsh/.credentials.yaml`，且其中包含 `XIAOMI_API_KEY: <密钥>`（与 DSH 同源；脚本只读取、不打印、不落盘）

### 基本用法

```bash
# 文本问答（默认 mimo-v2.5-pro）
node mimo-call.mjs "生成一条香港巴士 969 線的 WP8 磁貼副標題"

# 多模态看图（mimo-v2.5 支持图片）
node mimo-call.mjs "看看这个图标的风格是否符合扁平化" --model mimo-v2.5 --image icons/icon-192.png

# 限制输出长度
node mimo-call.mjs "写出 5 个 K75P 文案" --max-tokens 2000

# 流式打印（逐字输出，适合长回答）
node mimo-call.mjs "解释 light rail 实时到站的数据结构" --stream
```

### 参数一览

| 参数 | 默认值 | 说明 |
|------|--------|------|
| （第一个非 `--` 参数） | — | 提示词 |
| `--model` | `mimo-v2.5-pro` | 使用多模态请改为 `mimo-v2.5`（才能传 `--image`） |
| `--image <路径>` | 无 | 图片（PNG/JPG），以 base64 data URL 传入 |
| `--max-tokens` | `8000` | 最大输出 token 数 |
| `--stream` | 关 | SSE 流式输出 |

### 输出说明

- 非流式：若模型返回 `reasoning_content`（思考过程），先打印到 **stderr**（`【思考】…`），最终答案输出到 stdout，便于管道处理。
- 流式：只打印最终内容（delta 合并），结束后换行。

### 常见问题

| 现象 | 处理 |
|------|------|
| `未找到 XIAOMI_API_KEY` | 检查 `~/.dsh/.credentials.yaml`（Windows 为 `C:\Users\<你>\.dsh\.credentials.yaml`）是否有 `XIAOMI_API_KEY:` 行 |
| `HTTP 401` | 密钥失效，更新凭据文件 |
| `HTTP 429` | 触发限流，稍等重试或减小 `--max-tokens` |
| `HTTP 5xx` | MiMo 服务端异常，稍后重试 |
| 图片问不起作用 | 确认 `--model mimo-v2.5`（pro 版不带图片通道） |

### 与 DSH 的关系

脚本复用 DSH 已配置的 `XIAOMI_API_KEY`，无独立密钥、无环境变量注入、无配置落盘——删除 `~/.dsh/.credentials.yaml` 后脚本即不可用。仓库内不提交任何真实密钥。

## uiux-review.mjs — 每次更新后的设计一致性审查（MiMo v2.5 子代理）

**规则**（DSH 技能 `uiux-review`，仓库副本见 `tools/uiux-review/SKILL.md`）：项目每次更新（尤其 UI/UX 改动）后，必须由**子代理**运行本脚本，对照权威设计文档检查新增/修改代码有没有偏离设计原意。

### 主代理执行流程

```powershell
# 1. 生成 diff（基线 = 上一次 UI/UX 相关提交）
git log --oneline -5            # 确认基线
git diff <base>..HEAD -- css js wp8-concept.html > .tmp-diff.txt

# 2. 启动子代理（后台）运行审查
node tools/uiux-review.mjs --diff .tmp-diff.txt --out tools/reviews/uiux-<yyyymmdd-hhmm>.md

# 3. 子代理带回：总体结论 / 逐项判定表 / 必须修复清单 / 优点；主代理向用户汇报
```

### 参数一览

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--diff <文件>` | 必填 | `git diff` 输出文件（重定向生成，避免管道与命令行长度限制） |
| `--design <文件>` | 可重复 | 追加设计文档；默认自动包含 `DESIGN.md`、`DESIGN-UIUX.md`、`DESIGN-WP8-CONCEPT.md`、`DESIGN-SPEC-UPDATE.md`、`DESIGN-WP8.md`、`E:\DAFYU GZQ\WP8-Metro-Spec\设计规范.md` |
| `--model` | `mimo-v2.5` | 按规则固定用 MiMo 2.5 |
| `--max-tokens` | `20000` | 报告较长时调大 |
| `--out <文件>` | 无 | 同时把报告存档到 `tools/reviews/` |
| `--lang` | `zh` | 报告语言 |

### 审查红线（脚本内置 + SKILL.md）

纯黑背景 · 单一强调色 #0078D7 · 字级 42/72/32/28/24/22/17/13 · 全直角 · 无阴影/渐变/圆角 · 磁贴政策 · 应用栏 72px · 禁 3D/flip · 单色线性图标。功能正确但视觉/交互偏离同样判为偏离。

### 约束

- 审查阶段子代理**只读，禁止改代码**；修复由主代理经用户确认后执行。
- MiMo 不可用时如实报告工具失败，不得跳过规则或编造结论。
