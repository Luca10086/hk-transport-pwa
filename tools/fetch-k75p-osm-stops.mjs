#!/usr/bin/env node
/* ==========================================================================
   fetch-k75p-osm-stops.mjs — 從 OpenStreetMap 官方港鐵巴士 K75P 路線 relation
   （id 6482276）抓取 23 站「真實站牌座標」（按行經順序），寫入 js/data.js 的
   K75P_STOP_COORDS。座標精度≈站牌位置（遠優於 Nominatim 地名反查）。
   用法：node tools/fetch-k75p-osm-stops.mjs
   取代舊的 geocode-k75p-stops.mjs（地名反查誤差大，已棄用）。
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
/* 1. K75P_STOPS 順序表（單文件源） */
const dataSrc = readFileSync('E:/DAFYU GZQ/hk-transport-pwa/js/data.js', 'utf8');
const m = dataSrc.match(/const K75P_STOPS = \[([\s\S]*?)\];/);
if (!m) { console.error('K75P_STOPS not found'); process.exit(1); }
const stopsDef = [];
for (const line of m[1].split('\n')) {
  const r = line.match(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'/);
  if (r) stopsDef.push({ id: r[1], name: r[2] });
}
/* 2. OSM relation full.json */
const rid = '6482276';
const res = await fetch('https://api.openstreetmap.org/api/0.6/relation/' + rid + '/full.json', {
  headers: { 'User-Agent': 'senyou-transport/1.0 (dev tool; one-off stop import)' },
  signal: AbortSignal.timeout(60000),
});
if (!res.ok) { console.error('HTTP', res.status); process.exit(1); }
const j = await res.json();
const nodes = {};
for (const e of j.elements) if (e.type === 'node') nodes[e.id] = e;
const rel = j.elements.find(e => e.type === 'relation');
if (!rel) { console.error('relation missing'); process.exit(1); }
/* 3. 按行經順序匹配站名（同名站按出現順序對應 K75P_STOPS 中的同名站） */
const coords = {};
const used = new Set();
let pending = null;   /* 無名 stop 節點座標（其 platform 緊隨其後，提供站名） */
for (const mem of (rel.members || [])) {
  if (mem.type !== 'node') continue;
  const role = mem.role || '';
  const n = nodes[mem.ref];
  if (!n) continue;
  const name = (n.tags && (n.tags.name || n.tags['name:zh'])) || '';
  const latlng = { lat: +n.lat.toFixed(6), lng: +n.lon.toFixed(6) };
  const match = (name) => stopsDef.find(d => !used.has(d.id) && (name.startsWith(d.name) || name.includes(d.name)));
  if (role.startsWith('stop')) {
    if (name) {                       /* 罕見：stop 自帶站名 */
      const hit = match(name);
      if (hit) { coords[hit.id] = latlng; coords[hit.id].name = hit.name; used.add(hit.id); console.log(hit.id, hit.name, latlng.lat + ',' + latlng.lng); }
      pending = null;
    } else {
      pending = latlng;               /* 記住座標，等 platform 站名 */
    }
  } else if (role.startsWith('platform') && pending) {
    const hit = match(name);
    if (hit) {
      coords[hit.id] = pending;
      coords[hit.id].name = hit.name;
      used.add(hit.id);
      console.log(hit.id, hit.name, pending.lat + ',' + pending.lng);
    }
    pending = null;
  }
}
const missing = stopsDef.filter(d => !coords[d.id]);
console.log('resolved: ' + Object.keys(coords).length + '/' + stopsDef.length + (missing.length ? ' MISSING: ' + missing.map(d => d.id + d.name).join(', ') : ''));
if (Object.keys(coords).length < stopsDef.length) process.exit(1);
/* 4. 寫入 data.js（冪等替換） */
const block = '/* K75P 站點座標（真實站牌位置；OpenStreetMap 港鐵巴士 K75P relation 6482276 · tools/fetch-k75p-osm-stops.mjs 生成） */\n'
  + 'const K75P_STOP_COORDS = ' + JSON.stringify(coords) + ';\n';
const p = 'E:/DAFYU GZQ/hk-transport-pwa/js/data.js';
let s = readFileSync(p, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
const start = s.indexOf('/* K75P 站點座標');
if (start >= 0) s = s.slice(0, start).replace(/\s+$/, '');
s += eol + eol + block.replace(/\n/g, eol);
writeFileSync(p, s);
console.log('OK 已寫入 js/data.js（23/23 真實站牌座標）');
