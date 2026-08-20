/* 森友出行 · WP8 磁貼風格圖示/啟動畫面生成器（純 Node，零依賴）
   用法：node icon-gen.js
   輸出：android/app/src/main/res/ 下的 mipmap 圖示、drawable splash、colors/vectors
   設計：墨綠底 + 白色圓角磁貼 + 綠色箭頭（交通主題） */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const RES = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const GREEN_BG = [0x14, 0x53, 0x2D];
const GREEN_FG = [0x2F, 0xA3, 0x6B];
const WHITE = [0xFF, 0xFF, 0xFF];

/* ---------- PNG 編碼 ---------- */
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const stride = w * 4 + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------- 繪圖 ---------- */
function makeCanvas(w, h) { return { w, h, d: Buffer.alloc(w * h * 4) }; }
function px(c, x, y, col, a) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  c.d[i] = col[0]; c.d[i + 1] = col[1]; c.d[i + 2] = col[2]; c.d[i + 3] = a == null ? 255 : a;
}
function fill(c, col) { for (let i = 0; i < c.w * c.h; i++) { c.d[i * 4] = col[0]; c.d[i * 4 + 1] = col[1]; c.d[i * 4 + 2] = col[2]; c.d[i * 4 + 3] = 255; } }
function inRoundRect(x, y, x0, y0, x1, y1, rad) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const ix = Math.max(x0 + rad, Math.min(x, x1 - rad));
  const iy = Math.max(y0 + rad, Math.min(y, y1 - rad));
  if (x >= x0 + rad && x <= x1 - rad) return true;
  if (y >= y0 + rad && y <= y1 - rad) return true;
  const dx = x - ix, dy = y - iy;
  return dx * dx + dy * dy <= rad * rad;
}
function fillRoundRect(c, x0, y0, x1, y1, rad, col, a) {
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x++)
      if (inRoundRect(x, y, x0, y0, x1, y1, rad)) px(c, x, y, col, a);
}
function fillTri(c, p1, p2, p3, col) {
  const xs = [p1[0], p2[0], p3[0]], ys = [p1[1], p2[1], p3[1]];
  const minX = Math.floor(Math.min(...xs)), maxX = Math.ceil(Math.max(...xs));
  const minY = Math.floor(Math.min(...ys)), maxY = Math.ceil(Math.max(...ys));
  const s = (x, y, p, q) => (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]);
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const d1 = s(x, y, p1, p2), d2 = s(x, y, p2, p3), d3 = s(x, y, p3, p1);
    const neg = (d1 < 0) || (d2 < 0) || (d3 < 0), pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    if (!(neg && pos)) px(c, x, y, col);
  }
}
function fillRect(c, x0, y0, x1, y1, col) {
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) px(c, x, y, col);
}

/* 繪製磁貼+箭頭 logo，cx/cy 為中心，size 為磁貼邊長 */
function drawLogo(c, cx, cy, size) {
  const h = size / 2;
  fillRoundRect(c, cx - h, cy - h, cx + h, cy + h, size * 0.1, WHITE);
  fillRect(c, cx - h * 0.55, cy - h * 0.08, cx + h * 0.05, cy + h * 0.08, GREEN_BG);
  fillTri(c, [cx + h * 0.05, cy - h * 0.32], [cx + h * 0.05, cy + h * 0.32], [cx + h * 0.42, cy], GREEN_BG);
}

function savePng(file, c) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, encodePNG(c.w, c.h, c.d));
  console.log('wrote', path.relative(RES, file));
}

/* ---------- 生成 ---------- */
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [name, k] of Object.entries(densities)) {
  const base = path.join(RES, 'mipmap-' + name);
  const icon = makeCanvas(48 * k, 48 * k);
  fill(icon, GREEN_BG);
  drawLogo(icon, 24 * k, 24 * k, 30 * k);
  savePng(path.join(base, 'ic_launcher.png'), icon);
  savePng(path.join(base, 'ic_launcher_round.png'), icon);
  /* 自適應前景：透明底 + 安全區內 logo（66%） */
  const fg = makeCanvas(108 * k, 108 * k);
  drawLogo(fg, 54 * k, 54 * k, 62 * k);
  savePng(path.join(base, 'ic_launcher_foreground.png'), fg);
}
/* 啟動畫面：直 1080×2340 / 橫 2340×1080 */
const port = makeCanvas(1080, 2340);
fill(port, GREEN_BG);
drawLogo(port, 540, 1170, 380);
savePng(path.join(RES, 'drawable', 'splash.png'), port);
for (const [name] of Object.entries(densities)) {
  savePng(path.join(RES, 'drawable-port-' + name, 'splash.png'), port);
}
const land = makeCanvas(2340, 1080);
fill(land, GREEN_BG);
drawLogo(land, 1170, 540, 320);
for (const [name] of Object.entries(densities)) {
  savePng(path.join(RES, 'drawable-land-' + name, 'splash.png'), land);
}

/* ---------- XML 資源 ---------- */
fs.writeFileSync(path.join(RES, 'values', 'colors.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n' +
  '    <color name="colorPrimary">#14532D</color>\n' +
  '    <color name="colorPrimaryDark">#0F3D2E</color>\n' +
  '    <color name="colorAccent">#2FA36B</color>\n' +
  '</resources>\n');
console.log('wrote values/colors.xml');
fs.writeFileSync(path.join(RES, 'values', 'ic_launcher_background.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n' +
  '    <color name="ic_launcher_background">#14532D</color>\n' +
  '</resources>\n');
console.log('wrote values/ic_launcher_background.xml');
fs.writeFileSync(path.join(RES, 'drawable', 'ic_launcher_background.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android"\n' +
  '    android:width="108dp" android:height="108dp"\n' +
  '    android:viewportHeight="108" android:viewportWidth="108">\n' +
  '    <path android:fillColor="#14532D" android:pathData="M0,0h108v108h-108z" />\n' +
  '</vector>\n');
console.log('wrote drawable/ic_launcher_background.xml');
fs.writeFileSync(path.join(RES, 'drawable-v24', 'ic_launcher_foreground.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android"\n' +
  '    android:width="108dp" android:height="108dp"\n' +
  '    android:viewportHeight="108" android:viewportWidth="108">\n' +
  '    <path android:fillColor="#FFFFFF" android:pathData="M34,23 L74,23 A11,11 0 0 1 85,34 L85,74 A11,11 0 0 1 74,85 L34,85 A11,11 0 0 1 23,74 L23,34 A11,11 0 0 1 34,23 Z" />\n' +
  '    <path android:fillColor="#14532D" android:pathData="M40,49 L56,49 L56,59 L40,59 Z M56,44 L66,54 L56,64 Z" />\n' +
  '</vector>\n');
console.log('wrote drawable-v24/ic_launcher_foreground.xml');
console.log('DONE');
