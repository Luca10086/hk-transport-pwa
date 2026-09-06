/* 抓取 K75P 當前實時數據 + 站名表 → 直接嵌入 k75p-line-demo.html（完全自包含，
   單文件可在 file://、預覽面板、拷貝分享等任何環境直接打開） */
import { readFileSync, writeFileSync } from 'node:fs';
/* 1. 從 js/data.js 解析 K75P_STOPS 站名表（單文件源，避免漂移） */
const dataSrc = readFileSync('E:/DAFYU GZQ/hk-transport-pwa/js/data.js', 'utf8');
const m = dataSrc.match(/const K75P_STOPS = \[([\s\S]*?)\];/);
if (!m) { console.error('K75P_STOPS not found'); process.exit(1); }
const stopsDef = [];
for (const line of m[1].split('\n')) {
  const r = line.match(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'/);
  if (r) stopsDef.push({ id: r[1], name: r[2] });
}
/* 2. 抓實時數據 */
const url = 'https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule';
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'zh', routeName: 'K75P' }),
  signal: AbortSignal.timeout(20000),
});
if (!res.ok) { console.error('HTTP', res.status); process.exit(1); }
const j = await res.json();
const stops = j.busStop || [];
if (!stops.length) { console.error('no stops'); process.exit(1); }
const slim = stops.map(st => ({
  id: (st.busStopId || '').replace(/^K75P-/, ''),
  bus: (st.bus || []).map(b => ({
    id: String(b.busId || '?'),
    sec: parseInt(b.arrivalTimeInSecond, 10) || 0,
    sched: b.isScheduled === '1' || b.isScheduled === 1,
    la: (b.busLocation && Number(b.busLocation.latitude)) || 0,
    ln: (b.busLocation && Number(b.busLocation.longitude)) || 0,
  })),
}));
const at = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 19).replace('T', ' ');
const dataScript = 'window.DEMO_K75P_STOPS = ' + JSON.stringify(stopsDef) + ';\n'
  + 'window.DEMO_K75P_SNAPSHOT = ' + JSON.stringify({ at, stops: slim }) + ';';
/* 3. 嵌入 demo html 的佔位符 */
const p = 'E:/DAFYU GZQ/hk-transport-pwa/k75p-line-demo.html';
let html = readFileSync(p, 'utf8');
const token = '/*__K75P_DEMO_DATA__*/';
if (!html.includes(token)) { console.error('佔位符缺失：請確認 demo html 有 /*__K75P_DEMO_DATA__*/'); process.exit(1); }
html = html.replace(token, dataScript);
writeFileSync(p, html, 'utf8');
console.log('OK 已嵌入 demo：' + slim.length + ' 站 · 抓取 ' + at);
