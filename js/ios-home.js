/* 森友出行手册 - iOS 首页逻辑（搜索/分类/最近搜尋/熱門車站） */

/* ==========================================================================
   iOS 首页逻辑（搜索栏+分类标签+快捷入口+最近搜尋+熱門車站）
   ========================================================================== */
const IOS_RECENT_KEY = 'marvis_ios_recent';
const IOS_HOT_STOPS = [
  { type: 'mtr', line: 'TML', code: 'ETS', name: '尖東站', sub: '屯馬線 · 月台 1', badge: 'TML', color: '#34C759' },
  { type: 'mtr', line: 'TWL', code: 'CEN', name: '中環站', sub: '荃灣線 / 港島線', badge: 'TWL', color: '#34C759' },
  { type: 'mtr', line: 'TWL', code: 'MOK', name: '旺角站', sub: '觀塘線 / 荃灣線', badge: 'TWL', color: '#34C759' },
  { type: 'mtr', line: 'ISL', code: 'CAB', name: '銅鑼灣站', sub: '港島線', badge: 'ISL', color: '#34C759' },
  { type: 'mtr', line: 'EAL', code: 'SHT', name: '沙田站', sub: '東鐵線', badge: 'EAL', color: '#34C759' },
  { type: 'mtr', line: 'KTL', code: 'KOT', name: '九龍塘站', sub: '觀塘線 / 東鐵線', badge: 'KTL', color: '#34C759' }
];
const IOS_LRT_STOP = { name: '天水圍', sub: '輕鐵 705 / 706 循環線', badge: 'LR', color: '#F7941D' };
let iosRecent = [];
try { iosRecent = JSON.parse(localStorage.getItem(IOS_RECENT_KEY) || '[]'); } catch (e) { iosRecent = []; }

/** 切换 iOS 分类标签：更新高亮 + currentTransport */
function iosSetCat(cat, btn) {
  document.querySelectorAll('.ios-cat').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  setTransport(cat === 'all' ? 'bus' : cat);
  const q = document.getElementById('iosSearchInput').value.trim();
  if (q) iosDoSearch();
}

/** iOS 快捷入口：分类直搜；位置→全部 */
function iosQuick(type) {
  const catBtn = document.querySelector('.ios-cat[data-type="' + (type === 'loc' ? 'all' : type) + '"]');
  if (catBtn) iosSetCat(catBtn.dataset.type, catBtn);
  if (type === 'loc') {
    document.getElementById('iosSearchInput').value = '';
    document.getElementById('iosSearchInput').focus();
    return;
  }
  const q = document.getElementById('iosSearchInput').value.trim();
  if (q) iosDoSearch(); else document.getElementById('iosSearchInput').focus();
}

/** iOS 智能搜索：全部模式按关键词自动路由 */
async function iosSearchAll(q, container) {
  container.innerHTML = '<div class="loading"><div class="spinner"></div>搜寻中...</div>';
  setStatus('loading', '搜寻中');
  const hasCJK = /[\u4e00-\u9fff]/.test(q);
  const pureRoute = /^[A-Za-z0-9\s\-]{1,6}$/.test(q);
  if (hasCJK) {
    await searchMTRStation(q, container);
    if (container.querySelector('.empty-hint')) { container.innerHTML = ''; await searchLRT(q, container); }
    if (container.querySelector('.empty-hint')) { container.innerHTML = ''; await searchBusRoute(q, container); }
  } else if (pureRoute) {
    await searchBusRoute(q, container);
    if (container.querySelector('.empty-hint')) { container.innerHTML = ''; await searchMTRStation(q, container); }
  } else {
    await searchMTRStation(q, container);
  }
}

/** iOS 搜索入口 */
function iosDoSearch() {
  const q = document.getElementById('iosSearchInput').value.trim();
  if (!q) return;
  const container = document.getElementById('iosResults');
  const cat = document.querySelector('.ios-cat.active');
  const type = cat ? cat.dataset.type : 'all';
  // 记录最近搜尋
  iosRecent = iosRecent.filter(r => r.q !== q);
  iosRecent.unshift({ q, type, t: Date.now() });
  iosRecent = iosRecent.slice(0, 8);
  try { localStorage.setItem(IOS_RECENT_KEY, JSON.stringify(iosRecent)); } catch (e) {}
  renderIOSRecent();
  if (type === 'all') { iosSearchAll(q, container); }
  else if (type === 'mtr') { searchMTRStation(q, container); }
  else if (type === 'lrt') { searchLRT(q, container); }
  else { searchBusRoute(q, container); }
}

/** 渲染最近搜尋 */
function renderIOSRecent() {
  const el = document.getElementById('iosRecentList');
  if (!el) return;
  if (!iosRecent.length) {
    el.innerHTML = '<div class="ios-list-empty">暫無搜尋記錄</div>';
    return;
  }
  const typeName = { all: '全部', mtr: '港鐵', bus: '巴士', lrt: '輕鐵' };
  el.innerHTML = iosRecent.map(r =>
    '<button class="ios-list-item" data-q="' + escapeHtml(r.q) + '" data-type="' + escapeHtml(r.type) + '">' +
      '<span class="ios-li-ic" style="background:' + (r.type === 'lrt' ? '#F7941D' : r.type === 'mtr' ? '#34C759' : r.type === 'bus' ? '#007AFF' : '#6E6E73') + '">' + (r.type === 'lrt' ? '輕' : r.type === 'mtr' ? '鐵' : r.type === 'bus' ? '巴' : '尋') + '</span>' +
      '<span class="ios-li-main"><span class="ios-li-name">' + escapeHtml(r.q) + '</span><span class="ios-li-sub">' + (typeName[r.type] || '全部') + '</span></span>' +
      '<span class="ios-li-eta">' + iosRecentTime(r.t) + '</span><span class="ios-li-chev">›</span>' +
    '</button>'
  ).join('');
}

/** 点击最近搜尋项：回填并搜索 */
function iosSearchHistory(q, type) {
  document.getElementById('iosSearchInput').value = q;
  const catBtn = document.querySelector('.ios-cat[data-type="' + type + '"]');
  if (catBtn) iosSetCat(type, catBtn);
  iosDoSearch();
}

/** 最近搜尋相对时间 */
function iosRecentTime(t) {
  if (!t) return '';
  const diff = Math.floor((Date.now() - t) / 1000);
  if (diff < 60) return '剛剛';
  if (diff < 3600) return Math.floor(diff / 60) + ' 分鐘';
  if (diff < 86400) return Math.floor(diff / 3600) + ' 小時';
  return Math.floor(diff / 86400) + ' 天';
}

/** 渲染熱門車站：MTR 站拉实时 ETA + 轻铁卡 */
async function renderIOSHot() {
  const el = document.getElementById('iosHotList');
  if (!el) return;
  el.innerHTML = '<div class="ios-list-empty">載入中...</div>';
  // 轻铁卡
  const lrtRow = document.createElement('button');
  lrtRow.className = 'ios-list-item';
  lrtRow.onclick = () => { document.getElementById('iosSearchInput').value = '天水圍'; iosSetCat('lrt', document.querySelector('.ios-cat[data-type="lrt"]')); iosDoSearch(); };
  lrtRow.innerHTML = '<span class="ios-li-ic" style="background:#F7941D">輕</span>' +
    '<span class="ios-li-main"><span class="ios-li-name">' + IOS_LRT_STOP.name + '</span><span class="ios-li-sub">' + IOS_LRT_STOP.sub + '</span></span>' +
    '<span class="ios-li-eta">--</span><span class="ios-li-chev">›</span>';
  el.appendChild(lrtRow);
  // MTR 热门站：先渲染骨架，再并行拉取 ETA
  const rows = [];
  for (const s of IOS_HOT_STOPS) {
    const row = document.createElement('button');
    row.className = 'ios-list-item';
    row.onclick = () => { document.getElementById('iosSearchInput').value = s.name; iosSetCat('mtr', document.querySelector('.ios-cat[data-type="mtr"]')); iosDoSearch(); };
    row.innerHTML = '<span class="ios-li-ic" style="background:' + s.color + '">' + s.badge + '</span>' +
      '<span class="ios-li-main"><span class="ios-li-name">' + s.name + '</span><span class="ios-li-sub">' + s.sub + '</span></span>' +
      '<span class="ios-li-eta">--</span><span class="ios-li-chev">›</span>';
    rows.push({ row, s });
    el.appendChild(row);
  }
  const lrtEtas = await iosLRTEta();
  if (lrtEtas) lrtRow.querySelector('.ios-li-eta').textContent = lrtEtas;
  await Promise.all(rows.map(async ({ row, s }) => {
    const eta = await iosMTRNext(s.line, s.code);
    if (eta) row.querySelector('.ios-li-eta').textContent = eta;
  }));
}

/** MTR 最近一班（分钟） */
async function iosMTRNext(line, code) {
  try {
    const sched = await getMTRSchedule(line, code);
    if (!sched) return null;
    const key = line + '-' + code;
    const d = sched[key] || {};
    let nextTs = Infinity;
    for (const dir of ['UP', 'DOWN']) {
      for (const t of (d[dir] || [])) {
        if (t && t.time) {
          const ts = parseHKTime(t.time) / 1000;
          if (ts < nextTs) nextTs = ts;
        }
      }
    }
    if (nextTs === Infinity) return null;
    const mins = Math.ceil((nextTs * 1000 - Date.now()) / 60000);
    if (mins <= 0) return '即將到達';
    return mins + ' 分鐘';
  } catch (e) { return null; }
}

/** 轻铁最近一班（分钟） */
async function iosLRTEta() {
  try {
    const st = Object.keys(LRT_STATIONS).find(k => LRT_STATIONS[k] === '天水圍');
    if (!st) return null;
    const etas = await getLRTEta(st);
    if (!etas || !etas.length) return null;
    const mins = Math.ceil(etas[0].mins);
    if (mins <= 0) return '即將到達';
    return mins + ' 分鐘';
  } catch (e) { return null; }
}

/** 初始化 iOS 首页（皮肤切换 / 载入时调用） */
function initIOSHome() {
  renderIOSRecent();
  renderIOSHot();
}

