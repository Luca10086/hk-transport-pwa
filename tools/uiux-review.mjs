#!/usr/bin/env node
/* ==========================================================================
   uiux-review.mjs — UI/UX 设计一致性审查（调用 MiMo，与 mimo-call.mjs 同源密钥）
   用途：项目每次更新（尤其 UI/UX）后，对照设计文档检查新增/修改代码是否偏离设计原意。

   用法（先由 pwsh 生成 diff 文件，再执行本脚本，避免管道/参数长度限制）：
     git -C 项目目录 diff <base>..HEAD -- css js wp8-concept.html > .tmp-diff.txt
     node tools/uiux-review.mjs --diff .tmp-diff.txt [--design DESIGN.md] [--out tools/reviews/uiux-<date>.md]

   参数：
     --diff <文件>      必填。git diff 输出文件（> .tmp-diff.txt 重定向而来）
     --design <文件>    可重复。额外设计文档（默认自动包含 DESIGN.md / DESIGN-UIUX.md /
                        DESIGN-WP8-CONCEPT.md / DESIGN-SPEC-UPDATE.md / DESIGN-WP8.md，
                        以及 E:\DAFYU GZQ\WP8-Metro-Spec\设计规范.md 如存在）
     --model            MiMo 模型，默认 mimo-v2.5（用户要求）
     --max-tokens       默认 20000
     --out <文件>       除 stdout 外同时把报告写入该文件
     --lang zh|en       报告语言，默认 zh
   密钥来源：~/.dsh/.credentials.yaml 的 XIAOMI_API_KEY（与 DSH 同源，不打印不落盘）
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : undefined;
};
const allFlags = (name) => {
  const out = [];
  for (let i = 0; i < args.length; i++) if (args[i] === '--' + name && args[i + 1]) out.push(args[i + 1]);
  return out;
};
const diffFile = flag('diff');
const model = flag('model') || 'mimo-v2.5';
const maxTokens = Number(flag('max-tokens') || '20000');
const outFile = flag('out');
const lang = flag('lang') || 'zh';
const baseline = flag('baseline') || 'default';   /* default=WP8 系規格；wp2026=液態玻璃規格 */
if (!diffFile) { console.error('缺少 --diff <文件>（先 git diff base..HEAD > 文件）'); process.exit(1); }
if (!existsSync(diffFile)) { console.error('diff 文件不存在: ' + diffFile); process.exit(1); }

/* ---------- 读取设计文档（权威依据，按基准选择） ---------- */
const BASELINES = {
  default: {
    docs: ['DESIGN.md', 'DESIGN-UIUX.md', 'DESIGN-WP8-CONCEPT.md', 'DESIGN-SPEC-UPDATE.md', 'DESIGN-WP8.md', 'E:/DAFYU GZQ/WP8-Metro-Spec/设计规范.md'],
    system: '你是「森友出行」香港交通应用（hk-transport-pwa）的 UI/UX 设计一致性审查员。' +
      '你的任务：对照权威设计文档逐项检查代码变更是否偏离设计原意。' +
      '严格遵守设计文档的硬性规定（如 WP8-Metro-Spec：纯黑背景、单一强调色 #0078D7、字级 42/72/32/28/24/22/17/13、全直角、无阴影无渐变无圆角、磁贴政策、应用栏 72px、禁 3D 动画等）。' +
      '只报告有依据的发现，引用具体文件与变更片段；不臆测。',
  },
  wp2026: {
    docs: ['DESIGN-WP2026.md'],
    system: '你是「森友出行」香港交通应用（hk-transport-pwa）WP×2026 液態玻璃皮肤（body[data-ui="wp2026"]）的 UI/UX 设计一致性审查员。' +
      '唯一权威基准：DESIGN-WP2026.md（液態玻璃材料 blur26px/rgba(.07)/1px 描边/顶缘反光条/对角反光；纯黑蓝底 #05070D；主 #0078D7 辅 #00B4D8 仅高光微光；禁彩虹多色渐变；圆角 14px/胶囊是玻璃语言；华滞动效系统含流光 9s/波紋 .22s/ETA swap .2s/脈衝 1.6s；reduced-motion 与 fx-paused 降级）。' +
      '注意：本皮肤与 WP8 皮肤（全直角/无阴影/纯黑）是不同设计语言，禁止以 WP8-Metro-Spec 红线判定——那是基准错配。' +
      '只报告有依据的发现，引用具体文件与变更片段；不臆测。',
  },
};
const bcfg = BASELINES[baseline] || BASELINES.default;
const designFiles = [...bcfg.docs.map(d => d.includes(':') ? d : join(repo, d)), ...allFlags('design')];
const CAP = 32000; // 单文档截断上限（字符）
let designText = '';
for (const f of designFiles) {
  if (!existsSync(f)) continue;
  let t = readFileSync(f, 'utf8');
  if (t.length > CAP) t = t.slice(0, CAP) + '\n……（截断）';
  designText += '\n--- 文件：' + f + ' ---\n' + t;
}
if (!designText.trim()) { console.error('未找到任何设计文档'); process.exit(1); }

/* ---------- 读取 diff ---------- */
let diff = readFileSync(diffFile, 'utf8');
if (!diff.trim()) { console.error('diff 文件为空：可能 base..HEAD 没有差异，或生成命令有误'); process.exit(1); }
const DIFF_CAP = 80000;
if (diff.length > DIFF_CAP) {
  /* 优先保留 UI 相关文件（css/js/html），再截断 */
  const keep = (f) => /\.(css|js|html)$/i.test(f);
  const parts = diff.split(/^(?=diff --git )/m);
  let kept = parts.filter(p => keep(p.split('\n')[0] || ''));
  if (!kept.length) kept = parts;
  diff = kept.join('');
  if (diff.length > DIFF_CAP) diff = diff.slice(0, DIFF_CAP) + '\n……（diff 截断）';
}

/* ---------- 密钥 ---------- */
const cred = readFileSync(join(homedir(), '.dsh', '.credentials.yaml'), 'utf8');
const line = cred.split(/\r?\n/).find((l) => l.includes('XIAOMI_API_KEY')) || '';
const key = line.replace(/^[^:]+:\s*/, '').replace(/["']/g, '').trim();
if (!key) { console.error('未找到 XIAOMI_API_KEY'); process.exit(1); }

/* ---------- 组装提示词 ---------- */
const system = bcfg.system;
const user = (lang === 'zh'
  ? '请用中文输出结构化审查报告，严格按以下格式：\n\n' +
    '一、总体结论：符合设计 / 基本符合（n 处小偏差）/ 明显偏离（列出 n 处）\n\n' +
    '二、逐项检查表（每项一行）：\n' +
    '| 变更点（文件:行/片段） | 对应设计要求 | 判定（符合/偏離） | 建议修复 |\n\n' +
    '三、必须修复清单（仅列「偏离」项，按严重度排序，给出具体改法）\n\n' +
    '四、做得好的地方（简要）\n\n' +
    '审查原则：设计文档为唯一权威；功能正确但视觉/交互偏离也算偏离（如圆角、阴影、渐变、多余按钮、字号层级错误）；对无设计依据的改动标注「设计文档未覆盖」而非直接判偏离。'
  : 'Output a structured review report in English with the same 4 sections: Overall verdict; per-change checklist table (change | design requirement | pass/deviate | fix suggestion); must-fix list; strengths. Design docs are authoritative.');

const content = '【设计文档（权威）】\n' + designText +
  '\n\n【本次变更 diff】\n' + diff +
  '\n\n请开始审查。';

const payload = {
  model,
  max_tokens: maxTokens,
  messages: [
    { role: 'system', content: system },
    { role: 'user', content: user + '\n\n' + content },
  ],
};

/* ---------- 调用 ---------- */
const res = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const j = await res.json();
if (!res.ok) { console.error('HTTP', res.status, JSON.stringify(j)); process.exit(1); }
const m = j.choices?.[0]?.message;
if (m?.reasoning_content) process.stderr.write('【思考】' + m.reasoning_content + '\n\n');
const report = (m?.content ?? '').trim();
if (!report) { console.error('模型返回空报告'); process.exit(1); }
console.log(report);
if (outFile) { writeFileSync(outFile, report, 'utf8'); console.error('\n[已写入] ' + outFile); }
