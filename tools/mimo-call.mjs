#!/usr/bin/env node
/* ==========================================================================
   mimo-call.mjs — 调用 DSH 中已配置的 XIAOMI_API_KEY（MiMo）
   开发辅助工具：命令行快速调用 MiMo 模型 / 看图检查素材。
   ※ 不参与 APK 构建：build-apk.bat 只同步 index/css/js/lib，本文件仅仓库内手工运行。

   用法：
     node mimo-call.mjs "提示词"                          # mimo-v2.5-pro（默认）
     node mimo-call.mjs "提示词" --model mimo-v2.5        # 多模态版（可带图）
     node mimo-call.mjs "看看这个图标风格" --model mimo-v2.5 --image icons/icon-192.png
     （也可用 --max-tokens 20000 / --stream 流式打印）

   密钥来源：~/.dsh/.credentials.yaml 的 XIAOMI_API_KEY（与 DSH 同源，不落盘、不打印）
   依赖：Node 18+（原生 fetch，无需 npm install）
   ========================================================================== */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : undefined;
};
const prompt = args.find((a) => !a.startsWith('--'));
const model = opt('model') || 'mimo-v2.5-pro';
const maxTokens = Number(opt('max-tokens') || '8000');
const imagePath = opt('image');
const stream = args.includes('--stream');

// 读取 DSH 凭据
const cred = readFileSync(join(homedir(), '.dsh', '.credentials.yaml'), 'utf8');
const line = cred.split(/\r?\n/).find((l) => l.includes('XIAOMI_API_KEY')) || '';
const key = line.replace(/^[^:]+:\s*/, '').replace(/["']/g, '').trim();
if (!key) { console.error('未找到 XIAOMI_API_KEY'); process.exit(1); }

const content = imagePath
  ? [{ type: 'text', text: prompt },
     { type: 'image_url', image_url: { url: 'data:image/png;base64,' + readFileSync(imagePath).toString('base64') } }]
  : prompt;

const payload = { model, messages: [{ role: 'user', content }], max_tokens: maxTokens };

if (!stream) {
  const res = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const j = await res.json();
  if (!res.ok) { console.error('HTTP', res.status, JSON.stringify(j)); process.exit(1); }
  const m = j.choices?.[0]?.message;
  if (m?.reasoning_content) process.stderr.write('【思考】' + m.reasoning_content + '\n\n');
  console.log(m?.content ?? '');
} else {
  payload.stream = true;
  const res = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const raw of dec.decode(value).split('\n')) {
      const s = raw.trim();
      if (!s.startsWith('data:')) continue;
      const d = JSON.parse(s.slice(5).trim());
      const delta = d.choices?.[0]?.delta;
      if (delta?.content) process.stdout.write(delta.content);
    }
  }
  console.log();
}
