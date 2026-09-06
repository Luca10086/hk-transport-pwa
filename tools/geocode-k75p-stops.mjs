/* 一次性地理編碼 K75P 23 站 → 寫入 js/data.js 的 K75P_STOP_COORDS（GPS 定位標準的靜態基準）。
   來源：Nominatim（OpenStreetMap）；每站帶地區提示提高準確度；失敗記 null（運行時學習補位）。 */
import { readFileSync, writeFileSync } from 'node:fs';
const HINTS = {
  D010: '天瑞邨 天水圍 香港', D020: '天水圍公園 天水圍 香港',
  D030: '天耀邨耀盛樓 天水圍 香港', D040: '輕鐵天耀站 天水圍 香港',
  D050: '天盛苑 天水圍 香港', D060: '石埗路 屏山 元朗 香港',
  D070: '沙洲里村 屏山 元朗 香港', D080: '廈村 元朗 香港',
  U011: '新屋村 廈村 元朗 香港', U010: '李屋村 廈村 元朗 香港',
  U020: '新生村 廈村 元朗 香港', U030: '新李屋村 元朗 香港',
  U040: '田心村 廈村 元朗 香港', U050: '廈村鄉鄉事委員會 元朗 香港',
  U060: '輕鐵洪水橋站 香港', U070: '洪水橋巴士廠 香港',
  U080: '洪福邨 洪水橋 香港', U090: '石埗村 屏山 元朗 香港',
  U100: '天盛苑 天水圍 香港', U110: '天水圍警署 香港',
  U120: '賞湖居 天水圍 香港', U130: '天水圍公園 天水圍 香港',
  U140: '天瑞邨 天水圍 香港',
};
const names = {
  D010: '天瑞', D020: '天水圍公園', D030: '天耀邨耀盛樓', D040: '輕鐵天耀站',
  D050: '天盛苑', D060: '石埗路', D070: '沙洲里村', D080: '廈村市',
  U011: '新屋村', U010: '李屋村', U020: '新生村', U030: '新李屋村',
  U040: '田心', U050: '鄉事委員會', U060: '輕鐵洪水橋站', U070: '洪水橋巴士廠',
  U080: '洪福邨', U090: '石埗村', U100: '天盛苑', U110: '天水圍警署',
  U120: '賞湖居', U130: '天水圍公園', U140: '天瑞',
};
const coords = {};
/* 抽檢修正：地理編碼偶發漂移的站，用「前後鄰站中點」插值（循環線單鏈） */
const OVERRIDES = {
  D070: { lat: 22.44705, lng: 113.99532 },   /* 原名「沙洲里村」被編碼到香港仔，取 D060↔D080 中點 */
  U050: { lat: 22.4327, lng: 113.99509 },    /* 編碼到屏山鄉事委員會，取 U040↔U060 中點 */
};
for (const [id, hint] of Object.entries(HINTS)) {
  const q = encodeURIComponent(hint);
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + q, {
      headers: { 'User-Agent': 'senyou-transport/1.0 (dev tool; one-off geocode)' },
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json();
    const hit = j && j[0];
    coords[id] = hit ? { lat: +(+hit.lat).toFixed(5), lng: +(+hit.lon).toFixed(5), name: names[id] } : null;
    console.log(id, names[id], coords[id] ? coords[id].lat + ',' + coords[id].lng : 'MISS');
  } catch (e) { coords[id] = null; console.log(id, names[id], 'MISS ' + e.message); }
  await new Promise(r => setTimeout(r, 1200));  /* Nominatim 禮貌限速 */
}
const ok = Object.keys(coords).filter(k => coords[k]);
for (const [id, fix] of Object.entries(OVERRIDES)) { coords[id] = { lat: fix.lat, lng: fix.lng, name: names[id] }; }
console.log('resolved: ' + ok.length + '/' + Object.keys(HINTS).length);
if (!ok.length) process.exit(1);
const block = '/* K75P 站點座標（GPS 定位標準的靜態基準；tools/geocode-k75p-stops.mjs 生成） */\n'
  + 'const K75P_STOP_COORDS = ' + JSON.stringify(coords) + ';\n';
const p = 'E:/DAFYU GZQ/hk-transport-pwa/js/data.js';
let s = readFileSync(p, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
const start = s.indexOf('/* K75P 站點座標');
if (start >= 0) s = s.slice(0, start).replace(/\s+$/, '');
s += eol + eol + block.replace(/\n/g, eol);
writeFileSync(p, s);
console.log('OK 已寫入 js/data.js');
