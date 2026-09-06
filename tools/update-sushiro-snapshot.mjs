#!/usr/bin/env node
/* ==========================================================================
   update-sushiro-snapshot.mjs — 重新抓取 Sushiro 官方 API 並寫入 js/data.js
   的離線快照常量 SUSHIRO_SNAPSHOT / SUSHIRO_SNAPSHOT_AT（App 內取數三通道
   全失敗時的兜底數據源）。用法：node tools/update-sushiro-snapshot.mjs
   注意：API 無 CORS 頭，本腳本只在 Node 直連有效（瀏覽器無效）。
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
const url = 'https://sushipass.sushiro.com.hk/api/2.0/info/storelist?latitude=22&longitude=114&numresults=50&region=HK';
const j = await fetch(url, { signal: AbortSignal.timeout(20000) }).then(r => r.json());
if (!Array.isArray(j) || !j.length) { console.error('響應異常（非數組或空）'); process.exit(1); }
/* 保留原字段名，與 refreshSushiro 渲染零改動兼容 */
const items = j.map(s => ({
  id: s.id, name: s.name, area: s.area, address: s.address,
  wait: parseInt(s.wait, 10) || 0,
  waitingGroup: parseInt(s.waitingGroup, 10) || 0,
  storeStatus: s.storeStatus || '',
  latitude: +(Number(s.latitude) || 0).toFixed(4),
  longitude: +(Number(s.longitude) || 0).toFixed(4),
}));
const hk = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 16).replace('T', ' ');
const block = '/* Sushiro 分店快照（離線兜底；由 tools/update-sushiro-snapshot.mjs 生成） */\n'
  + 'const SUSHIRO_SNAPSHOT_AT = ' + JSON.stringify(hk) + ';\n'
  + 'const SUSHIRO_SNAPSHOT = ' + JSON.stringify(items) + ';\n';
const p = 'E:/DAFYU GZQ/hk-transport-pwa/js/data.js';
let s = readFileSync(p, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
const start = s.indexOf('/* Sushiro 分店快照');
if (start >= 0) s = s.slice(0, start).replace(/\s+$/, '');
s += eol + eol + block.replace(/\n/g, eol);
writeFileSync(p, s);
console.log('OK 快照已寫入 js/data.js：' + items.length + ' 家分店 · 抓取時間 ' + hk);
