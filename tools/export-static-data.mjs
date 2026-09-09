#!/usr/bin/env node
/**
 * 把 Web 版 js/data.js 的静态数据导出为原生应用 assets/static.json
 * 用法：node tools/export-static-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const srcPath = path.join(repo, 'js', 'data.js');
const outDir = path.join(repo, 'native', 'app', 'src', 'main', 'assets');
const outPath = path.join(outDir, 'static.json');

const src = fs.readFileSync(srcPath, 'utf8');
/* LRT_STATIONS 在 api.js 中定義，一併拼接求值（僅取常量，函數部分不執行） */
const apiSrc = fs.readFileSync(path.join(repo, 'js', 'api.js'), 'utf8')
  .replace(/^async function[\s\S]*?\n}\n/gm, '')
  .replace(/^function[\s\S]*?\n}\n/gm, '');

/* data.js 全為常量（含一個 IIFE），在沙箱中求值後取出需要的表 */
const pick = `return {
  mtrLines: MTR_LINES,
  mtrLineStops: MTR_LINE_STOPS,
  mtrStationNames: MTR_STATION_NAMES,
  mtrBusRoutes: MTR_BUS_ROUTES,
  k75pStops: K75P_STOPS,
  k75pStopCoords: K75P_STOP_COORDS,
  lrtStations: LRT_STATIONS,
  sushiroSnapshot: SUSHIRO_SNAPSHOT,
  sushiroSnapshotAt: SUSHIRO_SNAPSHOT_AT,
  hkoIcons: HKO_ICONS,
  hkoIconEmoji: HKO_ICON_EMOJI
};`;

const data = new Function(src + '\n' + apiSrc + '\n' + pick)();

/* 數值鍵統一轉字符串（LRT_STATIONS / K75P_STOP_COORDS） */
const stringify = (o) => JSON.stringify(o, null, 0);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, stringify(data), 'utf8');

const stat = fs.statSync(outPath);
console.log('written', outPath, (stat.size / 1024).toFixed(1) + ' KB');
console.log('mtrLines', Object.keys(data.mtrLines).length,
  '| mtrStations', Object.keys(data.mtrStationNames).length,
  '| lrtStations', Object.keys(data.lrtStations).length,
  '| k75pStops', data.k75pStops.length,
  '| sushiro', data.sushiroSnapshot.length);
