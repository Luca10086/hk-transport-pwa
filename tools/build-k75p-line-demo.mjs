/* 抓取 K75P 當前實時數據 + 站名表 → k75p-demo-snapshot.js（供 demo 離線載入） */
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
const out = '/* K75P demo 快照（tools/build-k75p-line-demo.mjs 生成，抓取 ' + at + ' HKT） */\n'
  + 'const DEMO_K75P_STOPS = ' + JSON.stringify(stopsDef) + ';\n'
  + 'const DEMO_K75P_SNAPSHOT = ' + JSON.stringify({ at, stops: slim }) + ';\n';
writeFileSync('E:/DAFYU GZQ/hk-transport-pwa/k75p-demo-snapshot.js', out, 'utf8');
console.log('OK stops=' + slim.length + ' defs=' + stopsDef.length + ' at ' + at);
