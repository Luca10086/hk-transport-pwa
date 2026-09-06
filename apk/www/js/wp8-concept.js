/* ==========================================================================
   森友出行 · WP8 概念版应用逻辑（APK 方向）
   复用 PWA 数据层：data.js（数据表）/ util.js（工具+收藏存储）/ api.js（API）
   界面为严格 WP8 Metro：Pivot 横滑 / App Bar / Live Tiles / 扁平列表
   ========================================================================== */

/* ---------- 工具 ---------- */
const $ = (id) => document.getElementById(id);
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
/* 屬性安全轉義：用於 data-* / 內聯屬性，防止引號注入（XSS） */
function safeAttr(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------- 語言（繁中 / English） ---------- */
const UI_STRINGS = {
  zh: { home: '森友出行', favs: '收藏', sushi: '壽司郎', map: '路線圖', settings: '設定',
    bus: '公交', mtrbus: '港鐵巴士', mtr: '港鐵', lrt: '輕鐵', night: '通宵', searchBtn: '搜尋',
    refresh: '重新整理', placeholder: '輸入巴士路線、站名或港鐵車站',
    noResult: '沒有結果', errSearch: '搜尋出錯，請稍後再試',
    grpKMB: '九巴', grpCTB: '城巴', grpNLB: '新大嶼山巴士', grpMTR: '港鐵', grpMTRBus: '港鐵巴士', grpBusStop: '巴士站',
    to: '往', from: '由', depart: '開出',
    theme: '主題', accent: '強調色', uiStyle: '介面風格', contrast: '高對比', autoRefresh: '自動重新整理',
    dataSource: '資料來源', version: '版本', langLabel: '語言', weather: '天氣', k75pTitle: 'K75P 全線實時',
    favFirst: '收藏首條結果', noMotion: '減少動畫', fontSize: '字體大小', navMap: '路線' },
  en: { home: 'Senyou Transit', favs: 'Favourites', sushi: 'Sushiro', map: 'Route Map', settings: 'Settings',
    bus: 'Bus', mtrbus: 'MTR Bus', mtr: 'MTR', lrt: 'Light Rail', night: 'Night', searchBtn: 'Search',
    refresh: 'Refresh', placeholder: 'Enter route, stop or MTR station',
    noResult: 'No results', errSearch: 'Search failed, please try again',
    grpKMB: 'KMB', grpCTB: 'Citybus', grpNLB: 'NLB', grpMTR: 'MTR', grpMTRBus: 'MTR Bus', grpBusStop: 'Bus Stops',
    to: 'To', from: 'From', depart: '',
    theme: 'Theme', accent: 'Accent colour', uiStyle: 'UI style', contrast: 'High contrast', autoRefresh: 'Auto refresh',
    dataSource: 'Data source', version: 'Version', langLabel: 'Language', weather: 'Weather', k75pTitle: 'K75P Live Board',
    favFirst: 'Favourite first', noMotion: 'Reduce motion', fontSize: 'Font size', navMap: 'Map' }
};
let uiLang = 'zh';
function t(key) { return (UI_STRINGS[uiLang] && UI_STRINGS[uiLang][key]) || UI_STRINGS.zh[key] || key; }
function setLang(l) {
  uiLang = l;
  try { localStorage.setItem('wp8concept_lang', l); } catch (e) {}
  syncSegs('#langSeg', l);
  applyLang();
  refreshAll(true);
}
function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  const ph = $('searchInput');
  if (ph) ph.placeholder = t('placeholder');
  updatePivot();
}
/* ---------- 全局字體大小（8 級，默認第 4 級 = 15px，比原 16px 低一檔） ---------- */
const FONT_LEVELS = [13, 13.7, 14.4, 15, 15.7, 16.4, 17.2, 18];
let fontLevel = 3;
function applyFontSize() {
  document.documentElement.style.fontSize = FONT_LEVELS[fontLevel] + 'px';
  renderFsDots();
}
function renderFsDots() {
  const box = $('fsDots');
  if (!box) return;
  box.innerHTML = FONT_LEVELS.map((_, i) => '<i class="' + (i === fontLevel ? 'on' : '') + '"></i>').join('');
}
function setFontSize(delta) {
  fontLevel = Math.max(0, Math.min(FONT_LEVELS.length - 1, fontLevel + delta));
  try { localStorage.setItem('wp8concept_fontlevel', String(fontLevel)); } catch (e) {}
  applyFontSize();
}
const etaText = (ts) => ts ? minsFromNow(ts) : '—';
const etaCls = (ts) => ts ? etaColorClass(ts) : '';
const parseHK = parseHKTime;

/* ---------- Pivot（横滑窗格） ---------- */
function pivotTitles() {
  return { home: t('home'), favs: t('favs'), sushi: t('sushi'), map: t('map'), settings: t('settings') };
}
const pivot = $('pivot');
let curPane = '';
function updatePivot() {
  let cur = 'home';
  pivot.querySelectorAll('.pane').forEach(p => {
    if (p.offsetLeft <= pivot.scrollLeft + 60) cur = p.dataset.pane;
  });
  if (cur !== curPane) {
    curPane = cur;
    const t = $('pivotTitle');
    t.classList.add('switch');
    setTimeout(() => {
      t.textContent = pivotTitles()[cur] || '';
      t.classList.remove('switch');
    }, 160);
  }
  document.querySelectorAll('.ab-btn[data-pane]').forEach(b => b.classList.toggle('active', b.dataset.pane === cur));
}
pivot.addEventListener('scroll', () => requestAnimationFrame(updatePivot), { passive: true });
let paneHistory = [];
let consumingBack = false;
function goPane(name) {
  const pane = pivot.querySelector('.pane[data-pane="' + name + '"]');
  if (!pane) return;
  const prev = paneHistory[paneHistory.length - 1];
  if (prev !== name) { paneHistory.push(name); try { history.pushState({ wp8Pane: name }, ''); } catch (e) {} }
  pivot.scrollTo({ left: pane.offsetLeft, behavior: 'smooth' });
}
function goPaneBack(name) {
  const pane = pivot.querySelector('.pane[data-pane="' + name + '"]');
  if (pane) pivot.scrollTo({ left: pane.offsetLeft, behavior: 'smooth' });
}

/* ---------- App Bar ⋯ 菜单 ---------- */
function toggleMore() {
  const m = $('moreMenu');
  if (m) m.hidden = !m.hidden;
}
function moreAction(a) {
  toggleMore();
  if (a === 'refresh') refreshAll(true);
  else if (a === 'fav') favFirstResult();
  else if (a === 'map') goPane('map');
}
document.addEventListener('click', (e) => {
  const m = $('moreMenu');
  if (!m || m.hidden) return;
  if (!e.target.closest('.ab-more') && !e.target.closest('.more-menu')) m.hidden = true;
});

/* ---------- 全景面板跳转 + 小磁贴快捷入口 ---------- */
function goPanoPanel(i) {
  const track = $('panoTrack');
  const panels = track ? track.querySelectorAll('.pano-panel') : [];
  if (track && panels[i]) track.scrollTo({ left: panels[i].offsetLeft, behavior: 'smooth' });
}
function quickTransport(tp) {
  const chip = document.querySelector('#chips .chip[data-tp="' + tp + '"]');
  setTransport(tp, chip);
  goPanoPanel(1);
  const input = $('searchInput');
  if (input) input.focus();
}

/* ---------- App Bar 滚动自动隐藏 ---------- */
let lastScrollTop = 0;
let barHidden = false;
document.addEventListener('scroll', (e) => {
  const t = e.target;
  if (!t || typeof t.scrollTop !== 'number') return;
  const y = t.scrollTop;
  if (y > lastScrollTop + 6 && !barHidden) {
    barHidden = true;
    document.querySelector('.appbar').classList.add('hidden');
    document.body.classList.add('appbar-hidden');
  } else if (y < lastScrollTop - 6 && barHidden) {
    barHidden = false;
    document.querySelector('.appbar').classList.remove('hidden');
    document.body.classList.remove('appbar-hidden');
  }
  lastScrollTop = y;
}, { capture: true, passive: true });

/* ---------- 通宵模式過濾 ---------- */
let nightOnly = false;
function toggleNight(btn) {
  nightOnly = !nightOnly;
  btn.classList.toggle('active', nightOnly);
  if (lastResults.length) renderResults(lastResults, $('results'));
}
/* ---------- 最近搜尋 ---------- */
const RECENT_KEY = 'wp8concept_recent';
function addRecentSearch(q) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const idx = list.indexOf(q);
    if (idx >= 0) list.splice(idx, 1);
    list.unshift(q);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  } catch (e) {}
  renderRecents();
}
function renderRecents() {
  const box = $('recentBox');
  if (!box) return;
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    if (!list.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="recent-chips">' + list.map(q =>
      '<button class="recent-chip" data-q="' + safeAttr(q) + '">' + escapeHtml(q) + '</button>').join('') + '</div>';
  } catch (e) { box.innerHTML = ''; }
}
function recentSearch(q) {
  const input = $('searchInput');
  if (input) input.value = q;
  doSearch();
}
/* 最近搜尋 chip：事件委派（避免內聯注入） */
document.addEventListener('click', (e) => {
  const chip = e.target.closest ? e.target.closest('.recent-chip') : null;
  if (!chip) return;
  const q = chip.getAttribute('data-q');
  if (q != null) recentSearch(q);
});
/* ---------- 搜索 ---------- */
let currentTransport = 'bus';
function setTransport(tp, btn) {
  currentTransport = tp;
  document.querySelectorAll('#chips .chip').forEach(b => b.classList.toggle('active', b === btn));
}

let lastResults = [];   /* 供「收藏首條結果」使用 */
let searchGen = 0;      /* 搜尋請求代號：舊請求不得覆蓋新結果 */

async function doSearch() {
  const q = $('searchInput').value.trim();
  const box = $('results');
  if (!q) return;
  const gen = ++searchGen;
  box.innerHTML = '<div class="loading">搜尋中…</div>';
  try {
    if (currentTransport === 'mtr') await searchMTRConcept(q, box, gen);
    else if (currentTransport === 'lrt') await searchLRTConcept(q, box, gen);
    else if (currentTransport === 'mtrbus') await searchMTRBusConcept(q, box, gen);
    else {
      if (/[\u4e00-\u9fff]/.test(q)) await searchBusStopConcept(q, box, gen);
      else await searchBusRouteConcept(q, box, gen);
    }
    addRecentSearch(q);
  } catch (e) {
    if (gen === searchGen) box.innerHTML = '<div class="error-msg">' + t('errSearch') + '</div>';
  }
}

/* 公交：路线号 */
async function searchBusRouteConcept(q, container, gen) {
  const routeNum = q.toUpperCase().replace(/\s/g, '');
  const [kmbRoutes, ctbRoutes, nlbRoutes] = await Promise.all([
    searchKMBRoute(routeNum), searchCTBRoute(routeNum), searchNLBRoute(routeNum)
  ]);
  const results = [];
  const kmbSeen = new Set();
  for (const r of (kmbRoutes || []).sort((a, b) => (a.bound === 'O' ? 0 : 1) - (b.bound === 'O' ? 0 : 1))) {
    const key = String(r.route).toUpperCase();
    if (kmbSeen.has(key)) continue;
    kmbSeen.add(key);
    const dir = r.bound === 'O' ? 'outbound' : 'inbound';
    const stops = await getKMBStops(r.route, dir, '1');
    if (!stops.length) continue;
    const first = stops[0];
    const wantDir = dir === 'inbound' ? 'I' : 'O';
    const etas = (await getKMBETA(first.stop_id || first.stop))
      .filter(e => e.route === String(r.route) && (e.dir || '').toUpperCase() === wantDir)
      .map(e => ({ ts: parseHK(e.eta) / 1000, dest: e.dest_tc || '' }))
      .sort((a, b) => a.ts - b.ts).slice(0, 3);
    results.push({
      no: r.route,
      name: (uiLang === 'en' && r.dest_en) ? t('to') + ' ' + (dir === 'outbound' ? r.dest_en : r.orig_en) : t('to') + ' ' + (dir === 'outbound' ? r.dest_tc : r.orig_tc),
      sub: (uiLang === 'en' && r.orig_en) ? t('from') + ' ' + (dir === 'outbound' ? r.orig_en : r.dest_en) + ' ' + t('depart') : t('from') + ' ' + (dir === 'outbound' ? r.orig_tc : r.dest_tc) + ' ' + t('depart'),
      group: t('grpKMB'),
      etas: etas.map(e => ({ ts: e.ts, dest: '' })),
      detail: { type: 'bus', company: 'kmb', route: String(r.route), direction: dir, orig: dir === 'outbound' ? (r.orig_tc || '') : (r.dest_tc || ''), dest: dir === 'outbound' ? (r.dest_tc || '') : (r.orig_tc || '') },
      fav: { type: 'bus', company: 'kmb', route: r.route, stop_id: first.stop_id || first.stop, stop_name: first.name_tc || '', direction: dir, dest: dir === 'outbound' ? (r.dest_tc || '') : (r.orig_tc || '') }
    });
  }
  for (const r of (ctbRoutes || [])) {
    for (const dir of ['outbound', 'inbound']) {
      const stops = await getCTBStops(r.route, dir);
      if (!stops.length) continue;
      const first = stops[0];
      const wantDir = dir === 'inbound' ? 'I' : 'O';
      const etas = (await getCTBETA(first.stop || first.stop_id, r.route))
        .filter(e => (e.dir || '').toUpperCase() === wantDir)
        .map(e => ({ ts: parseHK(e.eta) / 1000, dest: e.dest_tc || '' }))
        .sort((a, b) => a.ts - b.ts).slice(0, 3);
      results.push({
        no: String(r.route),
        name: (uiLang === 'en' && r.dest_en) ? t('to') + ' ' + (dir === 'outbound' ? r.dest_en : r.orig_en) : t('to') + ' ' + (dir === 'outbound' ? r.dest_tc : r.orig_tc),
        sub: (uiLang === 'en' && r.orig_en) ? t('from') + ' ' + (dir === 'outbound' ? r.orig_en : r.dest_en) + ' ' + t('depart') : t('from') + ' ' + (dir === 'outbound' ? r.orig_tc : r.dest_tc) + ' ' + t('depart'),
        group: t('grpCTB'),
        etas: etas.map(e => ({ ts: e.ts, dest: '' })),
        detail: { type: 'bus', company: 'ctb', route: String(r.route), direction: dir, orig: dir === 'outbound' ? (r.orig_tc || '') : (r.dest_tc || ''), dest: dir === 'outbound' ? (r.dest_tc || '') : (r.orig_tc || '') },
        fav: { type: 'bus', company: 'ctb', route: String(r.route), stop_id: first.stop || first.stop_id, stop_name: '', direction: dir, dest: dir === 'outbound' ? (r.dest_tc || '') : (r.orig_tc || '') }
      });
    }
  }
  for (const r of (nlbRoutes || [])) {
    const stops = await getNLBRouteStops(r.routeId);
    if (!stops.length) continue;
    const etas = (await getNLBETA(r.routeId, stops[0].stopId)).map(e => ({ ts: e.etaTs, dest: '' })).sort((a, b) => a.ts - b.ts).slice(0, 3);
    results.push({
      no: String(r.routeNo || r.routeId), name: r.routeName_c || '', sub: stops[0].stopName_c ? t('from') + ' ' + stops[0].stopName_c + ' ' + t('depart') : '', group: t('grpNLB'), etas,
      detail: { type: 'bus', company: 'nlb', route: String(r.routeNo || r.routeId), routeId: r.routeId },
      fav: { type: 'bus', company: 'nlb', route: String(r.routeNo || r.routeId), routeId: r.routeId, stop_id: stops[0].stopId, stop_name: stops[0].stopName_c || '', dest: r.routeName_c || '' }
    });
  }
  if (gen != null && gen !== searchGen) return;
  lastResults = results;
  renderResults(results, container);
}

/* 公交：站名（KMB） */
async function searchBusStopConcept(q, container, gen) {
  const stops = await searchKMBStopsByName(q);
  if (!stops.length) { container.innerHTML = '<div class="metro-empty">找不到巴士站「' + escapeHtml(q) + '」</div>'; return; }
  const items = [];
  for (const st of stops.slice(0, 6)) {
    const all = await getKMBETA(st.stop);
    const byRoute = {};
    for (const e of all) if (!byRoute[e.route]) byRoute[e.route] = e;
    const routes = Object.values(byRoute)
      .sort((a, b) => parseHK(a.eta) - parseHK(b.eta)).slice(0, 4)
      .map(e => ({ route: e.route, dest: e.dest_tc || '', ts: parseHK(e.eta) / 1000 }));
    items.push({ no: '站', name: st.name_tc || st.name_en, stopRoutes: routes });
  }
  if (gen != null && gen !== searchGen) return;
  if (container.dataset.animated) container.classList.add('no-anim');
  container.dataset.animated = '1';
  lastResults = [];
  container.innerHTML = '<div class="metro-group">' + t('grpBusStop') + '</div>' + items.map(it =>
    '<div class="metro-row stop-row">'
    + '<span class="row-no">站</span>'
    + '<span class="row-main"><span class="row-name">' + escapeHtml(it.name) + '</span>'
    + '<div class="stop-routes">' + (it.stopRoutes || []).map(r =>
        '<span class="stop-route"><span class="sr-no">' + escapeHtml(r.route) + '</span>'
        + '<span class="sr-dest">' + escapeHtml(r.dest) + '</span>'
        + '<span class="sr-eta ' + etaCls(r.ts) + '">' + etaText(r.ts) + '</span></span>').join('')
      + '</div></span></div>'
  ).join('');
}

/* 港铁：车站/线路 */
async function searchMTRConcept(q, container, gen) {
  const qList = [...new Set([q, toTrad(q), toSimp(q)].filter(Boolean))];
  const upperQ = q.toUpperCase();
  const results = [];
  const seen = new Set();
  for (const lineCode of Object.keys(MTR_LINE_STOPS)) {
    for (const s of MTR_LINE_STOPS[lineCode]) {
      if (!qList.some(x => s.name.includes(x) || x.includes(s.name)) && s.code !== upperQ) continue;
      if (seen.has(s.code)) continue;
      seen.add(s.code);
      const etas = [];
      for (const lc of Object.keys(MTR_LINE_STOPS)) {
        if (!MTR_LINE_STOPS[lc].some(x => x.code === s.code)) continue;
        const sched = await getMTRSchedule(lc, s.code);
        const d = (sched && sched[lc + '-' + s.code]) || {};
        const ts = [...(d.UP || []), ...(d.DOWN || [])]
          .map(t => (t && t.time ? parseHK(t.time) / 1000 : null)).filter(Boolean).sort((a, b) => a - b)[0];
        if (ts) etas.push({ ts, dest: MTR_LINES[lc] || lc });
      }
      etas.sort((a, b) => a.ts - b.ts);
      results.push({
        no: 'MTR', name: s.name, group: t('grpMTR'), etas,
        detail: { type: 'mtr', station_id: s.code, station_name: s.name, line: Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code)), lineName: MTR_LINES[Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code))] || '' },
        fav: { type: 'mtr', line: Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code)), lineName: MTR_LINES[Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code))] || '', station_id: s.code, station_name: s.name }
      });
    }
  }
  if (gen != null && gen !== searchGen) return;
  lastResults = results;
  renderResults(results, container);
}

/* 轻铁行（搜索结果与收藏共用，保证显示一致） */
function lrtRowHTML(e) {
  return '<div class="metro-row lrt-row">'
    + '<span class="row-no">' + escapeHtml(e.routeNo) + '</span>'
    + '<span class="row-main"><span class="row-name">往 ' + escapeHtml(e.dest) + '</span>'
    + '<span class="row-sub">' + escapeHtml(e.platformId) + ' 號月台' + (e.dep ? ' · 開出' : '') + '</span></span>'
    + '<span class="row-eta ' + (e.mins === 0 ? 'soon' : '') + '">' + (e.mins === 0 ? '即將' : e.mins + ' 分鐘') + '</span></div>';
}

/* 轻铁：按站分组，站名头 + 每路线一行（路线号/目的地/月台/到站时间） */
async function searchLRTConcept(q, container, gen) {
  const ids = Object.keys(LRT_STATIONS).filter(id => LRT_STATIONS[id].includes(q));
  if (!ids.length) { container.innerHTML = '<div class="metro-empty">找不到輕鐵車站「' + escapeHtml(q) + '」</div>'; lastResults = []; return; }
  let html = '';
  const firstFavs = [];
  for (const id of ids.slice(0, 5)) {
    const sid = Number(id);
    const entries = await getLRTEta(sid);
    const fav = { type: 'lrt', route: LRT_STATIONS[id], station_id: sid, stop_name: LRT_STATIONS[id] };
    firstFavs.push({ fav });
    html += '<div class="lrt-station">'
      + '<span class="lrt-head">' + escapeHtml(LRT_STATIONS[id]) + '</span>'
      + '<button class="row-star lrt-star" onclick="toggleRowFav(event, this)" data-fav=\'' + safeAttr(JSON.stringify(fav)) + '\'>' + (isFavorited(fav) ? '★' : '☆') + '</button>'
      + '</div>';
    const seen = new Set();
    let rows = 0;
    for (const e of entries) {
      const key = e.routeNo + '|' + e.dest + '|' + e.dep;
      if (seen.has(key)) continue;
      seen.add(key);
      if (rows++ >= 6) break;
      html += lrtRowHTML(e);
    }
    if (!rows) html += '<div class="metro-empty">暫無到站資料</div>';
  }
  if (gen != null && gen !== searchGen) return;
  container.innerHTML = html;
  lastResults = firstFavs;
}

/* 港铁巴士 */
async function searchMTRBusConcept(q, container, gen) {
  const routeNum = q.toUpperCase().replace(/\s/g, '');
  const data = await getMTRBusETA(routeNum);
  const parsed = parseMTRBusETAData(data);
  const info = MTR_BUS_ROUTES[routeNum];
  const etas = parsed.map(p => ({ ts: parseHK(p.eta) / 1000, dest: p.stop_name })).sort((a, b) => a.ts - b.ts).slice(0, 4);
  const results = [{
    no: routeNum, name: info ? info.orig + ' → ' + info.dest : routeNum, group: t('grpMTRBus'), etas,
    detail: { type: 'mtrbus', route: routeNum, orig: info ? info.orig : '', dest: info ? info.dest : '' },
    fav: { type: 'mtrbus', route: routeNum, orig: info ? info.orig : '', dest: info ? info.dest : '' }
  }];
  if (gen != null && gen !== searchGen) return;
  lastResults = results;
  renderResults(results, container);
}

/* ---------- 渲染：扁平 Metro 行（含 Metro 分隔標題；與輕鐵同構：路線號 / 目的地 / 副資訊 / 右側班次） ---------- */
function renderResults(items, container) {
  if (nightOnly) items = items.filter(it => /^N\d/i.test(String(it.no || '')));
  if (!items.length) { container.innerHTML = '<div class="metro-empty">' + t('noResult') + '</div>'; return; }
  if (container.dataset.animated) container.classList.add('no-anim');
  container.dataset.animated = '1';
  let lastGroup = null;
  const labels = ['次班', '三班'];
  container.innerHTML = items.map(it => {
    const head = (it.group && it.group !== lastGroup)
      ? '<div class="metro-group">' + escapeHtml(it.group) + '</div>' : '';
    if (it.group) lastGroup = it.group;
    const first = it.etas && it.etas[0];
    const nite = /^N\d/i.test(String(it.no || ''));
    const sub = (it.etas || []).slice(1, 3).map((e, idx) =>
      '<span class="row-eta-detail">' + (e.dest ? escapeHtml(e.dest) + ' · ' : labels[idx] + ' ') + etaText(e.ts) + '</span>').join('');
    const star = it.fav
      ? '<button class="row-star" onclick="toggleRowFav(event, this)" data-fav=\'' + safeAttr(JSON.stringify(it.fav)) + '\'>' + (isFavorited(it.fav) ? '★' : '☆') + '</button>'
      : '';
    const click = it.detail
      ? ' class="metro-row row-clickable" data-detail=\'' + safeAttr(JSON.stringify(it.detail)) + '\' onclick="openRouteDetail(this)"'
      : ' class="metro-row"';
    return head + '<div' + click + '>'
      + '<span class="row-no">' + escapeHtml(String(it.no)) + '</span>'
      + '<span class="row-main"><span class="row-name">' + escapeHtml(it.name || '') + (nite ? '<span class="badge-nite">通宵</span>' : '') + '</span>'
      + (it.sub ? '<span class="row-sub">' + escapeHtml(it.sub) + '</span>' : '')
      + sub + '</span>'
      + '<span class="row-eta ' + etaCls(first && first.ts) + '">' + (first ? etaText(first.ts) : '—') + '</span>'
      + star
      + '</div>';
  }).join('');
}

function toggleRowFav(ev, btn) {
  ev.stopPropagation();
  let fav;
  try { fav = JSON.parse(btn.getAttribute('data-fav')); } catch (e) { return; }
  const favs = getFavorites();
  const idx = favs.findIndex(f => f.type === fav.type && f.route === fav.route && (f.stop_id || '') === (fav.stop_id || ''));
  if (idx >= 0) { favs.splice(idx, 1); btn.textContent = '☆'; }
  else { favs.push(fav); btn.textContent = '★'; }
  saveFavorites(favs);
}

function favFirstResult() {
  if (!lastResults.length || !lastResults[0].fav) return;
  const favs = getFavorites();
  const fav = lastResults[0].fav;
  if (!favs.some(f => f.type === fav.type && f.route === fav.route && (f.stop_id || '') === (fav.stop_id || ''))) {
    favs.push(fav);
    saveFavorites(favs);
  }
  renderFavs();
}

/* ---------- 路線詳情（點擊路線後右側滑入的全屏頁） ---------- */
const _ctbNameCache2 = {};
async function ctbStopName(stopId) {
  const key = String(stopId);
  if (_ctbNameCache2[key]) return _ctbNameCache2[key];
  try {
    const data = await fetchWithProxy(`${CTB_BASE}/stop/${key}`);
    const d = data && data.data;
    _ctbNameCache2[key] = (d && (d.name_tc || d.name_en)) || ('站 ' + key);
  } catch (e) { _ctbNameCache2[key] = '站 ' + key; }
  return _ctbNameCache2[key];
}
function detailTitle(d) {
  if (d.type === 'bus') return d.route + (d.orig && d.dest ? ' · ' + d.orig + ' → ' + d.dest : '');
  if (d.type === 'mtrbus') return d.route + (d.orig && d.dest ? ' · ' + d.orig + ' → ' + d.dest : '');
  if (d.type === 'mtr') return d.station_name || '';
  return '';
}
let detailReturn = null;   /* { title, html }：全綫視圖 → 車站視圖 */
let detailStationCode = '';  /* 詳情當前的港鐵站 code（全綫視圖標註本站用） */
function openRouteDetail(btn) {
  const raw = btn ? btn.getAttribute('data-detail') : null;
  if (!raw) return;
  let detail;
  try { detail = JSON.parse(raw); } catch (e) { return; }
  const sheet = $('detailSheet');
  detailReturn = null;
  detailStationCode = detail.type === 'mtr' ? String(detail.station_id || '') : '';
  if (!sheet) return;
  $('detailTitle').textContent = detailTitle(detail);
  sheet.hidden = false;
  document.body.classList.add('detail-open');
  requestAnimationFrame(() => sheet.classList.add('open'));
  paneHistory.push(null);
  try { history.pushState({ wp8Sheet: true }, ''); } catch (e) {}
  renderRouteDetail(detail, $('detailBody'));
}
function closeRouteDetail() {
  const sheet = $('detailSheet');
  if (!sheet || sheet.hidden) return;
  sheet.classList.remove('open');
  document.body.classList.remove('detail-open');
  setTimeout(() => { sheet.hidden = true; }, 360);
  if (history.state && history.state.wp8Sheet) {
    paneHistory.pop();
    consumingBack = true;
    try { history.back(); } catch (e) { consumingBack = false; }
  }
}
/* 詳情頁返回：若在全綫視圖，先退回車站視圖；否則關閉詳情 */
function restoreDetailReturn() {
  const body = $('detailBody'), title = $('detailTitle');
  if (body && detailReturn) body.innerHTML = detailReturn.html;
  if (title && detailReturn) title.textContent = detailReturn.title;
  detailReturn = null;
}
function detailBack() {
  const sheet = $('detailSheet');
  if (!sheet || sheet.hidden) return;
  if (detailReturn) { restoreDetailReturn(); return; }
  closeRouteDetail();
}
/* 安卓返回鍵：全綫 → 車站視圖 → 上一分頁 → 首頁 → 退出 */
function onAndroidBack() {
  const sheet = $('detailSheet');
  if (sheet && !sheet.hidden) { detailBack(); return; }
  paneHistory.pop();
  const prev = paneHistory[paneHistory.length - 1];
  if (prev) { goPaneBack(prev); return; }
  if (curPane && curPane !== 'home') { try { goPane('home'); } catch (e) {} return; }
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    try { window.Capacitor.Plugins.App.exitApp(); } catch (e) {}
  }
}
window.addEventListener('popstate', () => {
  if (consumingBack) { consumingBack = false; return; }
  const sheet = $('detailSheet');
  if (sheet && !sheet.hidden) {
    if (detailReturn) {
      restoreDetailReturn();
      try { history.pushState({ wp8Sheet: true }, ''); } catch (e) {}
    } else {
      sheet.classList.remove('open');
      document.body.classList.remove('detail-open');
      setTimeout(() => { sheet.hidden = true; }, 360);
    }
    return;
  }
  paneHistory.pop();
  const prev = paneHistory[paneHistory.length - 1];
  if (prev) { goPaneBack(prev); return; }
  if (curPane && curPane !== 'home') goPane('home');
});
document.addEventListener('backbutton', onAndroidBack);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sheet = $('detailSheet');
    if (sheet && !sheet.hidden) detailBack();
  }
});
async function renderRouteDetail(detail, body) {
  body.innerHTML = '<div class="loading">載入中…</div>';
  try {
    if (detail.type === 'mtr') { await renderMTRStationDetail(detail, body); return; }
    if (detail.type === 'mtrbus') { await renderMTRBusDetail(detail, body); return; }
    if (detail.company === 'kmb' || detail.company === 'ctb') {
      const dirA = detail.direction === 'inbound' ? 'inbound' : 'outbound';
      const dirB = dirA === 'inbound' ? 'outbound' : 'inbound';
      const label = d => (d === 'outbound' ? '去程' : '回程');
      body.innerHTML = '<div class="dir-tabs">'
        + '<button class="dir-tab active" onclick="switchDir(this, 0)">' + label(dirA) + '</button>'
        + '<button class="dir-tab" onclick="switchDir(this, 1)">' + label(dirB) + '</button>'
        + '</div>'
        + '<div class="detail-dirs">'
        + '<div class="detail-dir" id="dir0"><div class="loading">載入中…</div></div>'
        + '<div class="detail-dir" id="dir1"><div class="loading">載入中…</div></div>'
        + '</div>';
      renderDirStops(detail, dirA, $('dir0'));
      renderDirStops(detail, dirB, $('dir1'));
      return;
    }
    renderDirStops(detail, detail.direction || 'outbound', body);
  } catch (e) {
    body.innerHTML = '<div class="error-msg">詳情載入失敗</div>';
  }
}
function switchDir(btn, i) {
  document.querySelectorAll('.dir-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const dirs = document.querySelector('.detail-dirs');
  if (dirs) dirs.scrollTo({ left: dirs.clientWidth * i, behavior: 'smooth' });
}
async function renderDirStops(detail, direction, container) {
  let stops = [], wantDir = 'O';
  if (detail.company === 'kmb') {
    stops = await getKMBStops(detail.route, direction, '1');
    wantDir = direction === 'inbound' ? 'I' : 'O';
    if (stops.length) {
      const missing = stops.filter(s => !(s.name_tc || s.name_en)).map(s => s.stop);
      const names = await Promise.all(missing.map(sid => getKMBStopName(sid)));
      const nm = {};
      missing.forEach((sid, i) => { nm[String(sid)] = names[i]; });
      stops = stops.map(s => ({ ...s, name_tc: s.name_tc || s.name_en || nm[String(s.stop)] || '' }));
    }
  } else if (detail.company === 'ctb') {
    stops = await getCTBStops(detail.route, direction);
    wantDir = direction === 'inbound' ? 'I' : 'O';
    if (stops.length) stops = await Promise.all(stops.map(async s => {
      const sid = s.stop || s.stop_id;
      const name = sid ? await ctbStopName(sid) : '';
      return { ...s, name_tc: name };
    }));
  } else if (detail.company === 'nlb') {
    let rid = detail.routeId;
    if (!rid) { const rs = await searchNLBRoute(String(detail.route)); if (rs && rs[0]) rid = rs[0].routeId; }
    stops = rid ? await getNLBRouteStops(rid) : [];
  }
  if (!stops.length) { container.innerHTML = '<div class="metro-empty">無法載入此路線的車站列表</div>'; return; }
  const rows = [];
  for (let i = 0; i < stops.length; i += 5) {
    const batch = stops.slice(i, i + 5);
    const results = await Promise.all(batch.map(async s => {
      let ts = [];
      if (detail.company === 'kmb') {
        const sid = s.stop_id || s.stop;
        ts = (await getKMBETA(sid)).filter(e => e.route === String(detail.route) && (e.dir || '').toUpperCase() === wantDir)
          .map(e => parseHK(e.eta) / 1000).filter(Boolean).sort((a, b) => a - b);
      } else if (detail.company === 'ctb') {
        const sid = s.stop || s.stop_id;
        ts = (await getCTBETA(sid, detail.route)).filter(e => (e.dir || '').toUpperCase() === wantDir)
          .map(e => parseHK(e.eta) / 1000).filter(Boolean).sort((a, b) => a - b);
      } else {
        ts = (await getNLBETA(detail.routeId || rid, s.stopId)).map(e => e.etaTs).filter(Boolean).sort((a, b) => a - b);
      }
      let name = '';
      if (detail.company === 'kmb') name = s.name_tc || ('站 ' + (s.stop_id || s.stop));
      else if (detail.company === 'ctb') name = s.name_tc || s.name || ('站 ' + (s.stop || s.stop_id));
      else name = s.stopName_c || s.stopName_s || ('站 ' + s.stopId);
      return { name, ts };
    }));
    rows.push(...results);
  }
  container.innerHTML = rows.map((r, i) =>
    '<div class="ds-stop">'
    + '<span class="ds-seq">' + (i + 1) + '</span>'
    + '<span class="ds-name">' + escapeHtml(r.name) + '</span>'
    + '<span class="ds-eta ' + etaCls(r.ts[0]) + '">' + (r.ts[0] ? etaText(r.ts[0]) : '—') + '</span>'
    + '</div>').join('');
}
async function renderMTRStationDetail(detail, body) {
  const lines = [];
  for (const lc of Object.keys(MTR_LINE_STOPS)) {
    if (!MTR_LINE_STOPS[lc].some(x => x.code === detail.station_id)) continue;
    const sched = await getMTRSchedule(lc, detail.station_id);
    const d = (sched && sched[lc + '-' + detail.station_id]) || {};
    const ts = [...(d.UP || []), ...(d.DOWN || [])]
      .map(t => (t && t.time ? parseHK(t.time) / 1000 : null)).filter(Boolean).sort((a, b) => a - b);
    lines.push({ lc, line: MTR_LINES[lc] || lc, ts });
  }
  /* 首班 / 尾班（由全日班表推算） */
  let first = null, last = null;
  for (const l of lines) for (const ts of l.ts) {
    if (ts && (!first || ts < first)) first = ts;
    if (ts && (!last || ts > last)) last = ts;
  }
  const head = (first && last)
    ? '<div class="metro-group">首班 ' + formatTime(first) + ' · 尾班 ' + formatTime(last) + '</div>'
    : '';
  body.innerHTML = head + (lines.map(l =>
    '<div class="ds-stop ds-line" onclick="showMTRLineStops(\'' + l.lc + '\')">'
    + '<span class="ds-seq" style="width:auto;min-width:56px">' + escapeHtml(l.line) + '</span>'
    + '<span class="ds-name">下一班</span>'
    + '<span class="ds-eta ' + etaCls(l.ts[0]) + '">' + (l.ts[0] ? etaText(l.ts[0]) : '—') + '</span>'
    + '<span class="ds-more">全綫 ›</span>'
    + '</div>').join('') || '<div class="metro-empty">暫無班次資料</div>');
}
/* 全綫視圖：整條路綫所有車站（本站藍點高亮），返回鍵退回車站視圖 */
function showMTRLineStops(lc) {
  const body = $('detailBody'), title = $('detailTitle');
  if (!body || !MTR_LINE_STOPS[lc]) return;
  if (!detailReturn) detailReturn = { title: title ? title.textContent : '', html: body.innerHTML };
  const stops = MTR_LINE_STOPS[lc] || [];
  body.innerHTML = '<div class="metro-group">' + escapeHtml(MTR_LINES[lc] || lc) + ' 全綫 · 共 ' + stops.length + ' 站</div>'
    + stops.map((st, i) =>
      '<div class="ds-stop' + (st.code === detailStationCode ? ' ds-cur' : '') + '">'
      + '<span class="ds-seq">' + (i + 1) + '</span>'
      + '<span class="ds-name">' + escapeHtml(st.name) + '</span>'
      + (st.code === detailStationCode ? '<span class="ds-cur-tag">本站</span>' : '')
      + '<span class="ds-eta"></span>'
      + '</div>').join('');
  if (title) title.textContent = (MTR_LINES[lc] || lc) + ' 全綫';
  body.scrollTop = 0;
}
async function renderMTRBusDetail(detail, body) {
  const data = await getMTRBusETA(detail.route);
  if (!data || !Array.isArray(data.busStop)) { body.innerHTML = '<div class="metro-empty">暫無資料</div>'; return; }
  const nameFor = (id) => {
    const raw = String(id || '').replace(/^K75P-/, '');
    if (detail.route === 'K75P') {
      const st = K75P_STOPS.find(x => x.id === raw);
      if (st) return st.name;
    }
    return raw;
  };
  const rows = [];
  for (const stop of data.busStop) {
    const secs = (stop.bus || []).map(b => parseInt(b.arrivalTimeInSecond) || 0)
      .filter(s => s > 0 && s < 108000).sort((a, b) => a - b);
    rows.push({ name: nameFor(stop.busStopId), secs });
  }
  body.innerHTML = rows.map((r, i) =>
    '<div class="ds-stop">'
    + '<span class="ds-seq">' + (i + 1) + '</span>'
    + '<span class="ds-name">' + escapeHtml(r.name) + '</span>'
    + '<span class="ds-eta ' + (r.secs.length && r.secs[0] <= 60 ? 'soon' : '') + '">' + (r.secs.length ? (r.secs[0] <= 60 ? '即將' : Math.max(1, Math.ceil(r.secs[0] / 60)) + ' 分鐘') : '—') + '</span>'
    + '</div>').join('');
}
function favDetailFor(f) {
  if (f.type === 'bus') {
    const dir = f.direction === 'inbound';
    return {
      type: 'bus', company: f.company, route: String(f.route), routeId: f.routeId,
      direction: f.direction || 'outbound',
      orig: dir ? (f.dest || '') : (f.stop_name || ''),
      dest: dir ? (f.stop_name || '') : (f.dest || '')
    };
  }
  if (f.type === 'mtrbus') return { type: 'mtrbus', route: f.route, orig: f.orig || '', dest: f.dest || '' };
  if (f.type === 'mtr' && f.station_id) return { type: 'mtr', station_id: f.station_id, station_name: f.station_name || '', line: f.line, lineName: f.lineName };
  return null;
}

/* ---------- 收藏（滾動列表 + 釘選磁貼 + 長按拖動排序 + 舊數據回退） ---------- */
function pinnedFavKey() {
  try { return localStorage.getItem('wp8concept_pinned_fav') || ''; } catch (e) { return ''; }
}
const favEtaCache = {};   /* favKey → { t, etas }：失敗時回退舊數據 */
async function renderFavItem(f, i, pinKey) {
  /* 輕鐵收藏：與搜索結果顯示完全一致（站名頭 + 各路線行） */
  if (f.type === 'lrt' && f.station_id != null) {
    let entries = [];
    try { entries = await getLRTEta(f.station_id); } catch (e) {}
    let staleAt = 0;
    let etasTs = entries.slice(0, 2).map(e => ({ ts: Math.floor(Date.now() / 1000) + e.mins * 60 }));
    if (!etasTs.length && favEtaCache[favKey(f)] && favEtaCache[favKey(f)].etas.length) {
      etasTs = favEtaCache[favKey(f)].etas;
      staleAt = favEtaCache[favKey(f)].t;
    } else if (etasTs.length) {
      favEtaCache[favKey(f)] = { t: Date.now(), etas: etasTs };
    }
    let html = '<div class="lrt-station" data-fi="' + i + '">'
      + '<span class="lrt-head">' + escapeHtml(f.stop_name || f.route || '') + '</span>'
      + '<button class="fav-pick fav-pick-pin" onclick="event.stopPropagation();togglePinFav(' + i + ')">' + (favKey(f) === pinKey ? '✓ 釘選' : '釘選') + '</button>'
      + '<button class="row-remove" data-i="' + i + '" onclick="removeFav(event, this)">✕</button>'
      + '</div>';
    const seen = new Set();
    let rows = 0;
    for (const e of entries) {
      const key = e.routeNo + '|' + e.dest + '|' + e.dep;
      if (seen.has(key)) continue;
      seen.add(key);
      if (rows++ >= 4) break;
      html += lrtRowHTML(e);
    }
    if (!rows) html += '<div class="metro-empty">暫無到站資料</div>';
    if (staleAt) html += '<div class="fav-stale">舊數據 · ' + formatTime(Math.floor(staleAt / 1000)) + '</div>';
    return { html, etas: etasTs };
  }
  const key = favKey(f);
  let etas = await favETAs(f);
  let staleAt = 0;
  if (!etas.length && favEtaCache[key] && favEtaCache[key].etas.length) {
    etas = favEtaCache[key].etas;
    staleAt = favEtaCache[key].t;
  } else if (etas.length) {
    favEtaCache[key] = { t: Date.now(), etas };
  }
  return { html: favCardHTML(f, i, etas, key === pinKey, staleAt), etas };
}
async function renderFavs() {
  const box = $('favs');
  const favs = getFavorites();
  if (!favs.length) { box.innerHTML = '<div class="metro-empty">暫無收藏，在搜尋結果按 ☆ 加入</div>'; updateFavTile(null); return; }
  const pinKey = pinnedFavKey();
  const results = await Promise.all(favs.map((f, i) => renderFavItem(f, i, pinKey)));
  let firstEtas = null, pinnedEtas = null;
  const parts = results.map((r, i) => {
    if (i === 0) firstEtas = r.etas;
    if (favKey(favs[i]) === pinKey) pinnedEtas = r.etas;
    return r.html;
  });
  box.innerHTML = parts.join('');
  updateFavTile(favs.find(f => favKey(f) === pinKey) || favs[0], pinnedEtas || firstEtas);
}
function togglePinFav(i) {
  const favs = getFavorites();
  const f = favs[i];
  if (!f) return;
  const key = favKey(f);
  if (pinnedFavKey() === key) localStorage.removeItem('wp8concept_pinned_fav');
  else localStorage.setItem('wp8concept_pinned_fav', key);
  renderFavs();
}
/* 長按拖動排序（收藏列表）：按住 450ms 進入拖動，即時預覽，鬆開保存 */
function initFavDrag() {
  const box = $('favs');
  if (!box) return;
  const CARD = '.fav-card, .lrt-station';
  const HOLD = 450;
  let dragEl = null, from = -1, startY = 0, timer = null, active = false, moved = false, raf = 0, lastEnd = 0;

  const cards = () => [...box.querySelectorAll(CARD)];

  /* 按下：命中卡片且非操作按鈕時，開始 450ms 長按計時 */
  const begin = (t) => {
    const card = t.closest ? t.closest(CARD) : null;
    if (!card || (t.closest && t.closest('.fav-pick, .row-remove, .fav-remove'))) return false;
    dragEl = card;
    active = false; moved = false; from = -1;
    timer = setTimeout(() => {
      timer = null;
      if (!dragEl) return;
      active = true; moved = false;
      window.__favDrag = true;
      from = cards().indexOf(dragEl);
      dragEl.classList.add('dragging');
      dragEl.style.position = 'relative';
      dragEl.style.zIndex = '99';
      dragEl.style.transform = 'translateY(0)';
    }, HOLD);
    return true;
  };
  const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };

  /* 即時預覽：以卡片中心找插入點，直接移動 DOM 節點 */
  const preview = (y) => {
    let anchor = null;
    for (const c of cards()) {
      if (c === dragEl) continue;
      const r = c.getBoundingClientRect();
      if (y < r.top + r.height / 2) { anchor = c; break; }
    }
    if (anchor) box.insertBefore(dragEl, anchor);
    else box.appendChild(dragEl);
  };

  const move = (y, ev) => {
    if (!dragEl) return;
    const dy = y - startY;
    if (!active) {
      if (Math.abs(dy) > 12) { cancel(); dragEl = null; } /* 滾動：取消長按 */
      return;
    }
    moved = true;
    if (ev && ev.cancelable) ev.preventDefault();
    dragEl.style.transform = 'translateY(' + dy + 'px)';
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0;
      if (!dragEl) return;
      const r = dragEl.getBoundingClientRect();
      preview(r.top + r.height / 2);
    });
  };

  const finish = () => {
    cancel();
    if (active) lastEnd = Date.now();
    if (!dragEl) { window.__favDrag = false; return; }
    if (active && moved && from >= 0) {
      const to = cards().indexOf(dragEl);
      if (to >= 0 && from !== to) {
        const favs = getFavorites();
        if (favs[from]) {
          const item = favs.splice(from, 1)[0];
          favs.splice(to, 0, item);
          saveFavorites(favs);
        }
      }
    }
    const was = active && moved;
    if (dragEl) {
      dragEl.classList.remove('dragging');
      dragEl.style.transform = ''; dragEl.style.position = ''; dragEl.style.zIndex = '';
    }
    dragEl = null; active = false; moved = false; from = -1;
    window.__favDrag = false;
    if (was) renderFavs(); /* 鬆開即保存並重繪，索引一致 */
  };

  /* 觸控（真機：Android / Windows Phone） */
  box.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || !begin(e.target)) return;
    startY = e.touches[0].clientY;
  }, { passive: true });
  box.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1 || !dragEl) return;
    move(e.touches[0].clientY, e);
  }, { passive: false });
  box.addEventListener('touchend', () => finish());
  box.addEventListener('touchcancel', () => finish());
  /* 鼠標（桌面預覽 / 桌面網頁） */
  box.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || !begin(e.target)) return;
    startY = e.clientY;
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => { if (dragEl) move(e.clientY, e); });
  window.addEventListener('mouseup', () => finish());
  /* 拖動後 600ms 內攔截 click，避免誤觸開啟詳情 */
  document.addEventListener('click', (e) => {
    if (window.__favDrag || Date.now() - lastEnd < 600) { e.preventDefault(); e.stopPropagation(); }
    window.__favDrag = false;
  }, true);
}
/* 首頁「收藏①」智能磁貼：顯示第一條收藏的下一班 */
function updateFavTile(f, etas) {
  const v = $('favTileV'), s = $('favTileS');
  if (!v) return;
  if (!f) { v.textContent = '—'; s.textContent = '暫無收藏'; return; }
  if (etas && etas[0]) v.textContent = etaText(etas[0].ts);
  else v.textContent = '—';
  s.textContent = favNo(f) + ' · ' + favTitle(f);
}
/* 收藏卡片（滾動列表 + 釘選 + 舊數據回退） */
function favCardHTML(f, i, etas, pinned, staleAt) {
  const tag = f.type === 'mtr' ? '港鐵' : f.type === 'mtrbus' ? '港鐵巴士' : f.type === 'lrt' ? '輕鐵' : '公交';
  const first = etas && etas[0];
  const det = (etas || []).slice(0, 3).map(e =>
    '<div class="fav-line"><span class="fav-line-label">' + (e.dest ? escapeHtml(e.dest) : '下一班') + '</span>'
    + '<span class="fav-line-time ' + etaCls(e.ts) + '">' + etaText(e.ts) + '</span></div>').join('');
  const sub = favSubLine(f) + (staleAt ? ' · 舊數據 ' + formatTime(Math.floor(staleAt / 1000)) : '');
  const d = favDetailFor(f);
  const click = d ? ' data-detail=\'' + safeAttr(JSON.stringify(d)) + '\' onclick="openRouteDetail(this)"' : '';
  return '<div class="fav-card' + (d ? ' row-clickable' : '') + '" data-fi="' + i + '"' + click + '>'
    + '<div class="fav-head"><span class="fav-no">' + escapeHtml(favNo(f)) + '</span>'
    + '<span class="fav-tag">' + tag + '</span>'
    + '<span class="fav-actions">'
    + (f.type === 'bus' ? '<button class="fav-pick fav-pick-stop" onclick="event.stopPropagation();openFavStopPicker(' + i + ')">換站</button>' : '')
    + '<button class="fav-pick fav-pick-pin" onclick="event.stopPropagation();togglePinFav(' + i + ')">' + (pinned ? '✓ 釘選' : '釘選') + '</button>'
    + (staleAt ? '<button class="fav-pick fav-pick-retry" onclick="event.stopPropagation();renderFavs()">重試</button>' : '')
    + '<button class="fav-remove" onclick="event.stopPropagation();removeFav(event, this)" data-i="' + i + '">✕</button>'
    + '</span></div>'
    + '<div class="fav-name">' + escapeHtml(favTitle(f)) + '</div>'
    + (sub ? '<div class="fav-sub">' + escapeHtml(sub) + '</div>' : '')
    + '<div class="fav-eta-main">' + (first ? etaText(first.ts) : '—') + '</div>'
    + (det ? '<div class="fav-lines">' + det + '</div>' : '')
    + (d ? '<div class="fav-more">點按查看全線候車</div>' : '')
    + '</div>';
}
function favSubLine(f) {
  if (f.type === 'bus') {
    const dir = f.direction === 'inbound' ? '回程' : '去程';
    return (f.stop_name ? '站：' + f.stop_name + ' · ' : '') + dir;
  }
  if (f.type === 'lrt') return '輕鐵車站';
  if (f.type === 'mtr') return (f.lineName || f.line) + ' 線';
  if (f.type === 'mtrbus') return '港鐵巴士';
  return '';
}
/* 換站：列出路線車站供選擇 */
async function openFavStopPicker(index) {
  const favs = getFavorites();
  const f = favs[index];
  if (!f || f.type !== 'bus') return;
  const sheet = $('detailSheet');
  if (!sheet) return;
  $('detailTitle').textContent = favNo(f) + ' · 選擇車站';
  sheet.hidden = false;
  document.body.classList.add('detail-open');
  requestAnimationFrame(() => sheet.classList.add('open'));
  const body = $('detailBody');
  body.innerHTML = '<div class="loading">載入車站…</div>';
  const stops = await fetchFavStops(f);
  body.innerHTML = stops.length
    ? stops.map((s, idx) =>
        '<div class="ds-stop row-clickable" data-idx="' + index + '" data-sid="' + escapeHtml(String(s.id)) + '" data-sn="' + escapeHtml(String(s.name)) + '" onclick="pickFavStopFrom(this)">'
        + '<span class="ds-seq">' + (idx + 1) + '</span>'
        + '<span class="ds-name' + (String(s.id) === String(f.stop_id) ? '" style="color:var(--accent)' : '') + '">' + escapeHtml(s.name) + (String(s.id) === String(f.stop_id) ? '（當前）' : '') + '</span></div>').join('')
    : '<div class="metro-empty">無法載入車站列表</div>';
}
function pickFavStopFrom(btn) {
  const idx = parseInt(btn.getAttribute('data-idx'), 10);
  const sid = btn.getAttribute('data-sid');
  const sn = btn.getAttribute('data-sn');
  const favs = getFavorites();
  if (favs[idx] && sid != null && sid !== '') {
    favs[idx].stop_id = sid;
    favs[idx].stop_name = sn;
    saveFavorites(favs);
  }
  closeRouteDetail();
  renderFavs();
}
async function fetchFavStops(f) {
  try {
    if (f.company === 'kmb') {
      const stops = await getKMBStops(f.route, f.direction === 'inbound' ? 'inbound' : 'outbound', '1');
      if (stops.length) {
        const missing = stops.filter(s => !(s.name_tc || s.name_en)).map(s => s.stop);
        const names = await Promise.all(missing.map(sid => getKMBStopName(sid)));
        const nm = {};
        missing.forEach((sid, j) => { nm[String(sid)] = names[j]; });
        return stops.map(s => ({ id: s.stop_id || s.stop, name: s.name_tc || s.name_en || nm[String(s.stop)] || ('站 ' + (s.stop_id || s.stop)) }));
      }
    } else if (f.company === 'ctb') {
      const stops = await getCTBStops(f.route, f.direction === 'inbound' ? 'inbound' : 'outbound');
      return await Promise.all(stops.map(async s => {
        const sid = s.stop || s.stop_id;
        const name = sid ? await ctbStopName(sid) : '';
        return { id: sid, name: name || ('站 ' + sid) };
      }));
    } else if (f.company === 'nlb') {
      let rid = f.routeId;
      if (!rid) { const rs = await searchNLBRoute(String(f.route)); if (rs && rs[0]) rid = rs[0].routeId; }
      const stops = rid ? await getNLBRouteStops(rid) : [];
      return stops.map(s => ({ id: s.stopId, name: s.stopName_c || s.stopName_s || ('站 ' + s.stopId) }));
    }
  } catch (e) {}
  return [];
}
async function favETAs(f) {
  try {
    if (f.type === 'bus') {
      if (f.company === 'kmb') {
        const wantDir = f.direction === 'inbound' ? 'I' : 'O';
        return (await getKMBETA(f.stop_id)).filter(e => e.route === f.route && (e.dir || '').toUpperCase() === wantDir)
          .map(e => ({ ts: parseHK(e.eta) / 1000, dest: e.dest_tc || '' })).filter(e => e.ts)
          .sort((a, b) => a.ts - b.ts).slice(0, 2);
      }
      if (f.company === 'ctb') {
        const wantDir = f.direction === 'inbound' ? 'I' : 'O';
        return (await getCTBETA(f.stop_id, f.route)).filter(e => (e.dir || '').toUpperCase() === wantDir)
          .map(e => ({ ts: parseHK(e.eta) / 1000, dest: e.dest_tc || '' })).filter(e => e.ts)
          .sort((a, b) => a.ts - b.ts).slice(0, 2);
      }
      if (f.company === 'nlb' && f.routeId) {
        return (await getNLBETA(f.routeId, f.stop_id)).filter(e => e.etaTs)
          .map(e => ({ ts: e.etaTs, dest: '' })).sort((a, b) => a.ts - b.ts).slice(0, 2);
      }
    } else if (f.type === 'lrt' && f.station_id != null) {
      const entries = await getLRTEta(f.station_id);
      const now = Math.floor(Date.now() / 1000);
      return entries.slice(0, 2).map(e => ({ ts: now + e.mins * 60, dest: e.routeNo + ' 往 ' + e.dest }));
    } else if (f.type === 'mtrbus') {
      const parsed = parseMTRBusETAData(await getMTRBusETA(f.route));
      return parsed.map(p => ({ ts: parseHK(p.eta) / 1000, dest: '' })).filter(e => e.ts)
        .sort((a, b) => a.ts - b.ts).slice(0, 2);
    } else if (f.type === 'mtr' && f.station_id && f.station_id !== 'ALL') {
      const sched = await getMTRSchedule(f.line, f.station_id);
      const d = (sched && sched[f.line + '-' + f.station_id]) || {};
      return [...(d.UP || []), ...(d.DOWN || [])]
        .map(t => (t && t.time ? { ts: parseHK(t.time) / 1000, dest: (t.dest || f.lineName || '') } : null))
        .filter(Boolean).sort((a, b) => a.ts - b.ts).slice(0, 2);
    }
  } catch (e) {}
  return [];
}
function favNo(f) {
  if (f.type === 'mtr') return f.lineName || f.route || 'MTR';
  return f.route || '?';
}
function favTitle(f) {
  if (f.type === 'bus') {
    if (f.company === 'nlb') return f.dest || f.stop_name || f.route;
    return f.dest ? '往 ' + f.dest : (f.stop_name || f.route);
  }
  if (f.type === 'lrt') return f.stop_name || f.route || '';
  if (f.type === 'mtr') return f.station_name || f.lineName || '';
  if (f.type === 'mtrbus') return (f.orig && f.dest) ? f.orig + ' → ' + f.dest : f.route;
  return '';
}
function favSub(f) {
  if (f.type === 'bus') return '巴士 · ' + (f.direction === 'inbound' ? '回程' : '去程');
  if (f.type === 'lrt') return '輕鐵車站';
  if (f.type === 'mtr') return (f.lineName || f.line || '') + ' 線';
  if (f.type === 'mtrbus') return '港鐵巴士';
  return '';
}
function removeFav(ev, btn) {
  ev.stopPropagation();
  const favs = getFavorites();
  favs.splice(parseInt(btn.dataset.i, 10), 1);
  saveFavorites(favs);
  renderFavs();
}

/* ---------- 天气 ---------- */
async function refreshWeather() {
  const el = $('weather');
  try {
    const resp = await fetch(WEATHER_API, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const wb = $('warningBar');
    const msgs = Array.isArray(data.warningMessage) ? data.warningMessage : [];
    if (msgs.length) {
      wb.className = 'warning-bar ' + (/颱風|暴雨|雷暴|水浸/.test(msgs.join(' ')) ? 'warn-severe' : 'warn-mild');
      wb.textContent = msgs.join(' ');
      wb.hidden = false;
    } else wb.hidden = true;
    const temps = (data.temperature && data.temperature.data) || [];
    const hko = temps.find(t => t.place === '元朗公園') || temps.find(t => t.place === '香港天文台') || temps[0];
    const icon = Array.isArray(data.icon) ? data.icon[0] : data.icon;
    const upd = data.updateTime ? '更新 ' + data.updateTime.slice(11, 16) : '';
    el.innerHTML = '<span class="w-desc">' + weatherSVG(icon) + ' ' + (HKO_ICONS[icon] || '') + '</span>'
      + (hko ? '<span class="w-item"><b>' + hko.value + '°C</b></span>' : '')
      + '<span class="w-upd">' + upd + '</span>';
    if (hko) $('tileWeatherV').textContent = hko.value + '°';
    const tile = $('tileWeather');
    if (tile) tile.style.background = weatherTileColor(icon);
    const td = $('tileWeatherD');
    if (td) td.textContent = HKO_ICONS[icon] || '';
    fetchForecast();
  } catch (e) {
    el.textContent = '天氣載入失敗';
  }
}
/* WP8 單色線性天氣圖標（Segoe MDL2 風格，無填充） */
function weatherSVG(icon) {
  const i = Number(icon);
  if (i >= 50 && i <= 57) {
    return '<svg viewBox="0 0 24 24" class="w-ico" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="11" r="4.2"/><path d="M12 3.4v2M12 16.6v2M4.4 11h2M17.6 11h2M6.6 5.6l1.4 1.4M16 14.8l1.4 1.4M17.4 5.6l-1.4 1.4M8 14.8l-1.4 1.4"/></svg>';
  }
  const cloud = '<path d="M7 16a4.5 4.5 0 0 1-.6-8.95A6 6 0 0 1 18 8.6 4 4 0 0 1 17 16Z"/>';
  let extra = '';
  if (i >= 62 && i <= 64) extra = '<path d="M8.5 19h.01M11.9 20h.01M15.4 19h.01"/>';
  else if (i === 65) extra = '<path d="M11.6 11.4l-2.7 4.3 2.3.6-1.7 3.7 3.5-4.7-2.3-.5 2.5-3.4z"/>';
  return '<svg viewBox="0 0 24 24" class="w-ico" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">' + cloud + extra + '</svg>';
}
/* 天氣磁貼背景隨天氣變化（WP8 規範：磁貼黑底不變色） */
function weatherTileColor(icon) {
  if (document.body.dataset.ui === 'wp8') return '#0A0A0A';
  const i = Number(icon);
  if (i === 65) return '#4C1D95';                 /* 雷暴 → 深紫 */
  if (i >= 62 && i <= 64) return '#6D28D9';       /* 雨 → 紫 */
  if (i >= 60 && i <= 61) return '#4E4A5E';       /* 陰 → 灰紫 */
  if (i >= 50 && i <= 54) return '#7C3AED';       /* 陽光 → 紫羅蘭 */
  if (i >= 70 && i <= 77) return '#8B5CF6';       /* 良好 → 淡紫 */
  if (i === 90 || i === 91) return '#9A6BDB';     /* 熱 → 暖紫 */
  return '#7C3AED';
}
/* 明日天氣預報（HKO fnd 九天天氣） */
async function fetchForecast() {
  try {
    const resp = await fetch(WEATHER_FND_API, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) return;
    const d = await resp.json();
    const list = (d && d.weatherForecast) || [];
    const tomorrow = list[1] || list[0];
    if (!tomorrow) return;
    const range = (tomorrow.forecastMintemp && tomorrow.forecastMaxtemp)
      ? tomorrow.forecastMintemp.value + '-' + tomorrow.forecastMaxtemp.value + '°' : '';
    const sub = $('tileWeatherSub'), back = $('tileWeatherD');
    if (sub) sub.textContent = '明天 ' + range;
    if (back) back.textContent = (tomorrow.forecastWeather || '') + ' ' + range;
  } catch (e) {}
}

/* ---------- 寿司郎（只顯示元朗/屯門/天水圍 · 顯示排隊組數） ---------- */
async function fetchSushiroData() {
  const url = SUSHIRO_STORE_API;
  /* 通道一：APK 原生 CapacitorHttp（無 CORS 限制，Capacitor 5+ 內建） */
  try {
    const CH = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp;
    if (CH) {
      const r = await CH.get({ url, headers: { Accept: 'application/json' }, connectTimeout: 10000, readTimeout: 10000 });
      const d = r && r.data;
      if (r && r.status >= 200 && r.status < 300 && Array.isArray(d) && d.length) return { list: d, live: true };
    }
  } catch (e) {}
  /* 通道二/三：直連（Node/部分環境可用）→ CORS 代理鏈（依次、短超時） */
  const tries = [url, 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url), SUSHIRO_PROXY(url), CORS_PROXIES[0](url)];
  for (const u of tries) {
    try {
      const resp = await fetch(u, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) continue;
      const j = await resp.json();
      if (Array.isArray(j) && j.length) return { list: j, live: true };
    } catch (e) {}
  }
  /* 兜底：內建快照（永不離線；UI 會標註快取時間） */
  return { list: (typeof SUSHIRO_SNAPSHOT !== 'undefined' ? SUSHIRO_SNAPSHOT : []), live: false };
}
async function refreshSushiro() {
  const el = $('sushi');
  try {
    const src = await fetchSushiroData();
    const all = src.list, live = src.live;
    /* 天水圍的分店歸屬「元朗區」，故按 元朗區 + 屯門區 過濾 */
    const areas = ['元朗區', '屯門區'];
    const stores = (Array.isArray(all) ? all : []).filter(s => areas.includes(s.area))
      .sort((a, b) => ((a.waitingGroup || 0) - (b.waitingGroup || 0)) || ((a.wait || 0) - (b.wait || 0)));
    const note = live ? '' : '<div class="sushiro-note">實時接口離線，顯示快取數據（' + (typeof SUSHIRO_SNAPSHOT_AT !== 'undefined' ? SUSHIRO_SNAPSHOT_AT : '') + ' 抓取）</div>';
    const rows = stores.map(s => {
      const closed = s.storeStatus !== 'OPEN';
      const groups = parseInt(s.waitingGroup, 10) || 0;
      const mins = parseInt(s.wait, 10) || 0;
      const right = closed ? '休息' : ((groups > 0 || mins > 0) ? groups + ' 組' : '直入');
      const sub = closed ? s.area : ((groups > 0 || mins > 0) ? '約 ' + mins + ' 分鐘 · 排隊 ' + groups + ' 組' : s.area + ' · 無需等候');
      return '<div class="metro-row">'
        + '<span class="row-no" style="font-size:1rem;min-width:40px">' + escapeHtml((s.name || '').slice(0, 2)) + '</span>'
        + '<span class="row-main"><span class="row-name">' + escapeHtml(s.name || '') + '</span>'
        + '<span class="row-sub">' + sub + '</span></span>'
        + '<span class="row-eta ' + (closed ? 'soon' : ((groups > 0 || mins > 0) ? 'medium' : '')) + '">' + right + '</span></div>';
    }).join('');
    el.innerHTML = note + (rows || '<div class="metro-empty">元朗、屯門、天水圍暫無分店資料</div>');
  } catch (e) {
    el.innerHTML = '<div class="error-msg">壽司郎暫時無法連線，請稍後再試</div>';
  }
}

/* ---------- 路線圖（港鐵線路時間軸 / 輕鐵站表 / 巴士位置） ---------- */
let mapMode = 'mtr';
function renderMapLines() {
  const box = $('mapLines');
  if (!box) return;
  const lines = Object.keys(MTR_LINE_STOPS).map(lc => ({ code: lc, name: MTR_LINES[lc] || lc }));
  box.innerHTML = '<button class="map-line-btn' + (mapMode === 'mtr' ? ' active' : '') + '" onclick="setMapMode(\'mtr\', this)">港鐵</button>'
    + '<button class="map-line-btn' + (mapMode === 'lrt' ? ' active' : '') + '" onclick="setMapMode(\'lrt\', this)">輕鐵</button>'
    + '<button class="map-line-btn' + (mapMode === 'bus' ? ' active' : '') + '" id="mapBusBtn" onclick="setMapMode(\'bus\', this)">巴士位置</button>'
    + lines.map(l => '<button class="map-line-btn" data-lc="' + l.code + '" onclick="renderMTRLine(\'' + l.code + '\', this)">' + escapeHtml(l.name) + '</button>').join('');
  renderMTRLine(Object.keys(MTR_LINE_STOPS)[0], box.querySelector('.map-line-btn[data-lc]'));
}
function setMapMode(m, btn) {
  mapMode = m;
  document.querySelectorAll('#mapLines .map-line-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const body = $('mapBody'), bm = $('busMap');
  if (m === 'bus') {
    if (body) body.style.display = 'none';
    initBusMap();
  } else {
    if (body) body.style.display = '';
    if (bm) bm.hidden = true;
    if (m === 'mtr') renderMTRLine(Object.keys(MTR_LINE_STOPS)[0], document.querySelector('#mapLines .map-line-btn[data-lc]'));
    else renderLRTMap();
  }
}
function renderMTRLine(lc, btn) {
  const body = $('mapBody');
  if (!body) return;
  document.querySelectorAll('#mapLines .map-line-btn').forEach(b => b.classList.toggle('active', b === btn));
  const stops = MTR_LINE_STOPS[lc] || [];
  const all = Object.keys(MTR_LINE_STOPS);
  body.innerHTML = '<div class="map-timeline">' + stops.map(s => {
    const serving = all.filter(x => MTR_LINE_STOPS[x].some(y => y.code === s.code));
    const inter = serving.length > 1;
    return '<div class="map-station' + (inter ? ' interchange' : '') + '">'
      + '<span class="ms-name">' + escapeHtml(s.name) + '</span>'
      + '<span class="ms-code">' + escapeHtml(s.code || '') + '</span>'
      + (inter ? '<span class="ms-lines">轉乘 ' + escapeHtml(serving.map(x => MTR_LINES[x]).join(' / ')) + '</span>' : '')
      + '</div>';
  }).join('') + '</div>';
}
function renderLRTMap() {
  const body = $('mapBody');
  if (!body) return;
  const regions = [['屯門', 1, 300], ['天水圍', 425, 560], ['元朗', 560, 920]];
  let html = '';
  for (const [rn, lo, hi] of regions) {
    html += '<div class="metro-group">' + rn + '</div><div class="map-timeline">';
    for (const id of Object.keys(LRT_STATIONS)) {
      const n = Number(id);
      if (n >= lo && n <= hi) {
        html += '<div class="map-station"><span class="ms-name">' + escapeHtml(LRT_STATIONS[id]) + '</span><span class="ms-code">' + id + '</span></div>';
      }
    }
    html += '</div>';
  }
  body.innerHTML = html;
}

/* ---------- 巴士實時位置地圖（港鐵巴士，Leaflet + OSM） ---------- */
let busMap = null, busLayer = null;
function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}
function loadCss(href) {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}
async function initBusMap() {
  const box = $('busMap');
  if (!box) return;
  box.hidden = false;
  try {
    if (!window.L) {
      try {
        await loadScript('lib/leaflet/leaflet.js');
        loadCss('lib/leaflet/leaflet.css');
      } catch (e) {
        await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
        loadCss('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      }
    }
    if (!busMap) {
      busMap = L.map(box, { attributionControl: false }).setView([22.445, 113.995], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(busMap);
      busLayer = L.layerGroup().addTo(busMap);
      L.control.attribution({ position: 'bottomright', prefix: false }).addAttribution('© OpenStreetMap').addTo(busMap);
    }
    setTimeout(() => { if (busMap) busMap.invalidateSize(); }, 120);
    refreshBusMap();
  } catch (e) {
    box.innerHTML = '<div class="error-msg">地圖載入失敗，請檢查網絡</div>';
  }
}
async function refreshBusMap() {
  if (!busMap || !busLayer) return;
  try {
    const data = await getK75PData();
    busLayer.clearLayers();
    if (!data || !Array.isArray(data.busStop)) return;
    const seen = new Set();
    for (const stop of data.busStop) {
      for (const b of (stop.bus || [])) {
        const loc = b.busLocation || {};
        const lat = Number(loc.latitude), lng = Number(loc.longitude);
        if (!lat || !lng || seen.has(b.busId)) continue;
        seen.add(b.busId);
        L.circleMarker([lat, lng], { radius: 7, color: '#8B5CF6', weight: 2, fillColor: '#8B5CF6', fillOpacity: 0.9 })
          .bindPopup('巴士 ' + escapeHtml(String(b.busId || '?')) + '<br>到下一站 ' + escapeHtml(String(b.arrivalTimeText || '')))
          .addTo(busLayer);
      }
    }
  } catch (e) {}
}

/* ---------- K75P（單請求共享：磁貼 / 全線 / 地圖去重） ---------- */
let k75pCache = null, k75pPromise = null, k75pAt = 0;
async function getK75PData() {
  const now = Date.now();
  if (k75pCache && now - k75pAt < 20000) return k75pCache;
  if (k75pPromise) return k75pPromise;
  k75pPromise = getMTRBusETA('K75P').then(d => {
    if (d && Array.isArray(d.busStop)) { k75pCache = d; k75pAt = Date.now(); }
    return d;
  }).finally(() => { k75pPromise = null; });
  return k75pPromise;
}
/* ---------- K75P 班次實時路線圖（循環綫垂直示意圖） ----------
   時間語義（真實 API 核實）：
   - arrivalTimeInSecond = 抵達該站的剩餘秒（同班車在每站各有一條）；
   - 已到站 = 0 秒（顯示 00:00 / 即將），不可過濾；
   - 站點無座標 → 用「已到站班車的 GPS」即時學習本站座標，
     班次位置優先按 GPS 在路線多段線上投影（可用時），否則按到站秒數插值。 */
let k75pLiveTimer = null;
const k75pStopCoords = {};   /* 運行期學習：stopId → {lat,lng}（輪到車 sec=0 時取 GPS） */
function openK75PLive() {
  const el = $('k75pLive');
  if (!el) return;
  el.hidden = false;
  renderK75PLive();
  if (k75pLiveTimer) clearInterval(k75pLiveTimer);
  k75pLiveTimer = setInterval(renderK75PLive, 20000);
}
function closeK75PLive() {
  const el = $('k75pLive');
  if (el) el.hidden = true;
  if (k75pLiveTimer) { clearInterval(k75pLiveTimer); k75pLiveTimer = null; }
}
const mmss = (sec) => {
  if (sec <= 0) return '00:00';
  const m = Math.floor(sec / 60), s2 = Math.floor(sec % 60);
  return (m < 10 ? '0' : '') + m + ':' + (s2 < 10 ? '0' : '') + s2;
};
/* 點 → 線段（a→b）最近點的插值 t（平面近似，1km 級精度足夠） */
function segPointFrac(a, b, p) {
  const kx = 111320 * Math.cos(a.lat * Math.PI / 180), ky = 110540;
  const ax = 0, ay = 0;
  const bx = (b.lng - a.lng) * kx, by = (b.lat - a.lat) * ky;
  const px = (p.lng - a.lng) * kx, py = (p.lat - a.lat) * ky;
  const len2 = bx * bx + by * by;
  if (len2 < 1e-6) return { d2: px * px + py * py, f: 0 };
  let t = (px * bx + py * by) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = bx * t, cy = by * t;
  return { d2: (px - cx) * (px - cx) + (py - cy) * (py - cy), f: t };
}
/* GPS → 循環綫上的位置（返回 浮點站序 或 null＝不可靠）
   refPos＝秒數插值估算：多段線投影撞線（環形迴路前後段）時，取貼近估算的候選 */
function gpsLoopPosition(coords, stops, p, refPos) {
  let best = null;
  for (let i = 0; i < stops.length; i++) {
    const a = coords[stops[i].id], b = coords[stops[(i + 1) % stops.length].id];
    if (!a || !b) continue;
    const r = segPointFrac(a, b, p);
    const score = r.d2 + 4000 * Math.abs((i + r.f) - refPos);
    if (!best || score < best.score) best = { score, d2: r.d2, pos: i + r.f };
  }
  return (best && Math.sqrt(best.d2) < 300) ? best.pos : null;
}
/* 純模型：停靠點順序 + stopMap(停點 id→bus[]) + 已學習座標 → { markers, chips } */
function buildK75PLiveModel(stops, stopMap, coords) {
  const byBus = {};
  for (let i = 0; i < stops.length; i++) {
    for (const b of (stopMap[stops[i].id] || [])) {
      const sec = parseInt(b.arrivalTimeInSecond);
      if (isNaN(sec) || sec < 0 || sec >= 108000) continue;   /* 0 = 已到站（保留） */
      const loc = b.busLocation;
      const live = !!(loc && Number(loc.latitude) && Number(loc.longitude));
      if (live && sec === 0) {
        coords[stops[i].id] = { lat: Number(loc.latitude), lng: Number(loc.longitude) };  /* 學習本站座標 */
      }
      const id = String(b.busId || '?');
      if (!byBus[id]) byBus[id] = { live: false, entries: [] };
      if (live) byBus[id].live = true;
      byBus[id].entries.push({ idx: i, sec, loc: live ? { lat: Number(loc.latitude), lng: Number(loc.longitude) } : null });
    }
  }
  const markers = [], chips = [];
  for (const id of Object.keys(byBus)) {
    const bus = byBus[id];
    if (!bus.entries.length) continue;
    const es = bus.entries.slice().sort((a, b) => a.sec - b.sec);
    const next = es[0];
    chips.push({ idx: next.idx, sec: next.sec, live: bus.live });
    if (!bus.live || !next.loc) continue;
    /* 標準：GPS 投影（用戶要求；站點座標 = 靜態基準 + 進站學習），
       班表秒數插值僅作交叉校驗與兜底 */
    const next2 = es.find(e => e.idx !== next.idx && e.sec > next.sec);
    const gap = next2 ? Math.max(30, next2.sec - next.sec) : 120;
    const f = next.sec === 0 ? 1 : Math.max(0, Math.min(1, (gap - next.sec) / gap));
    const refPos = next.idx === 0 ? 0 : next.idx - 1 + f;
    let pos = gpsLoopPosition(coords, stops, next.loc, refPos);
    if (pos != null && Math.abs(pos - refPos) > 2) pos = null;   /* GPS 與班表矛盾（>2 站）＝定位失效 */
    if (pos == null) pos = refPos;
    markers.push({ id, pos, nextIdx: next.idx, nextName: stops[next.idx].name, nextSec: next.sec });
  }
  return { markers, chips };
}
async function renderK75PLive() {
  const body = $('k75pLiveBody');
  if (!body) return;
  try {
    const data = await getK75PData();
    const stopMap = {};
    for (const stop of ((data && data.busStop) || [])) stopMap[(stop.busStopId || '').replace(/^K75P-/, '')] = stop.bus || [];
    /* GPS 定位標準：靜態座標表補齊未學習的站（運行時進站學習可覆寫精修） */
    if (typeof K75P_STOP_COORDS !== 'undefined') {
      for (const k of Object.keys(K75P_STOP_COORDS)) {
        if (!k75pStopCoords[k] && K75P_STOP_COORDS[k] && K75P_STOP_COORDS[k].lat) {
          k75pStopCoords[k] = { lat: K75P_STOP_COORDS[k].lat, lng: K75P_STOP_COORDS[k].lng };
        }
      }
    }
    const { markers, chips } = buildK75PLiveModel(K75P_STOPS, stopMap, k75pStopCoords);
    const byStop = {};
    for (const c of chips) { (byStop[c.idx] = byStop[c.idx] || []).push(c); }
    const ROW = 52;
    let html = '<div class="kt-legend">● 每條橫標＝一班車當前位置（GPS 推算）· 膠囊＝該班車到站倒數 · 00:00＝即將到站</div>'
      + '<div class="kt-track">';
    K75P_STOPS.forEach((st, i) => {
      const cs = (byStop[i] || []).slice(0, 2);
      const more = (byStop[i] || []).length - cs.length;
      html += '<div class="kt-stop">'
        + (cs.length ? '<span class="kt-chips">' + cs.map(c => '<span class="kt-chip' + (c.live ? '' : ' kt-chip-sched') + '">' + mmss(c.sec) + '</span>').join('')
          + (more > 0 ? '<span class="kt-chip kt-chip-more">+' + more + '</span>' : '') + '</span>' : '')
        + '<span class="kt-dot"></span>'
        + '<span class="kt-name">' + escapeHtml(st.name)
        + (i === 0 ? '<span class="kt-end">起點</span>' : i === K75P_STOPS.length - 1 ? '<span class="kt-end">終點</span>' : '')
        + '</span></div>';
    });
    const posOcc = {};
    for (const m of markers) {
      const occ = posOcc[m.pos.toFixed(1)] = (posOcc[m.pos.toFixed(1)] || 0) + 1;
      const y = (m.pos * ROW + 26 - 5).toFixed(1);
      const xOff = (occ - 1) * 5;
      html += '<span class="kt-bus" style="top:' + y + 'px;transform:translateX(-' + xOff + 'px)" title="班次 ' + escapeHtml(m.id) + ' · 下一站 ' + escapeHtml(m.nextName) + ' · ' + (m.nextSec === 0 ? '即將到達' : mmss(m.nextSec) + ' 後到達') + '"></span>';
    }
    html += '</div>';
    if (!markers.length) html += '<div class="kt-empty">暫無實時班次位置（可能未開行）</div>';
    body.innerHTML = html;
  } catch (e) {
    body.innerHTML = '<div class="error-msg">路線圖載入失敗</div>';
  }
}
function goBusMap() {
  goPane('map');
  setTimeout(() => {
    const btn = $('mapBusBtn');
    setMapMode('bus', btn);
  }, 400);
}
async function loadK75PNow() {
  const v = $('k75pTileV'), s = $('k75pTileSub');
  if (!v) return;
  try {
    const data = await getK75PData();
    if (!data || !Array.isArray(data.busStop)) { v.textContent = '--'; s.textContent = '暫無資料'; return; }
    /* 路上班次統計（按 busId 去重：同一班車會出現在多個站的列表） */
    const liveIds = new Set(), schedIds = new Set();
    for (const stop of data.busStop) {
      for (const b of (stop.bus || [])) {
        const sec = parseInt(b.arrivalTimeInSecond) || 0;
        if (sec <= 0 || sec >= 108000) continue;
        const isLive = !!(b.busLocation && Number(b.busLocation.latitude) && Number(b.busLocation.longitude));
        if (isLive) liveIds.add(b.busId);
        else if (isFlag(b.isScheduled)) schedIds.add(b.busId);
      }
    }
    /* 天瑞（D010）下一班 */
    const stop = (data.busStop || []).find(x => String(x.busStopId || '').replace(/^K75P-/, '') === 'D010') || {};
    const secs = (stop.bus || []).map(b => parseInt(b.arrivalTimeInSecond) || 0)
      .filter(x => x > 0 && x < 108000).sort((a, b) => a - b);
    const fmt = x => x <= 60 ? '即將' : Math.max(1, Math.ceil(x / 60)) + ' 分鐘';
    if (!secs.length) { v.textContent = '—'; s.textContent = '天瑞 · 暫無班次'; return; }
    v.textContent = fmt(secs[0]);
    let sub = '實時 ' + liveIds.size + ' 班';
    if (schedIds.size > 0) sub += ' · 定時 ' + schedIds.size + ' 班';
    s.textContent = sub;
  } catch (e) {
    v.textContent = '--'; s.textContent = '載入失敗';
  }
}

let k75pFoldOpen = false;
function toggleK75PFold() {
  k75pFoldOpen = !k75pFoldOpen;
  loadK75P();
}
async function loadK75P() {
  const el = $('k75p');
  try {
    const data = await getK75PData();
    if (!data || !Array.isArray(data.busStop)) { el.innerHTML = '<div class="metro-empty">暫無資料</div>'; return; }
    const stopMap = {};
    for (const stop of data.busStop) stopMap[(stop.busStopId || '').replace(/^K75P-/, '')] = stop.bus || [];
    const fmt = x => x <= 60 ? '即將到站' : Math.max(1, Math.ceil(x / 60)) + ' 分鐘';
    const rows = ['<div class="k75p-map-link" onclick="openK75PLive()"><svg class="k75p-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h4l2.5-6 5 12 2.5-6H21"/></svg> 班次實時路線圖（每班車到咗邊個站）<span>›</span></div>'
      , '<div class="k75p-map-link" onclick="goBusMap()"><svg class="k75p-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.2"/></svg> 實時位置地圖（點按查看巴士在哪）<span>›</span></div>'];
    let foldInserted = false;
    for (const st of K75P_STOPS) {
      if (st.id === 'U140') continue; /* 循環綫終點「天瑞」不納入實時報站 */
      if (st.fold && !foldInserted) {
        foldInserted = true;
        rows.push('<button class="k75p-fold-btn" onclick="toggleK75PFold()" aria-expanded="' + (k75pFoldOpen ? 'true' : 'false') + '">天水圍市 ' + (k75pFoldOpen ? '▴' : '▾') + '</button>');
      }
      if (st.fold && !k75pFoldOpen) continue;
      const buses = (stopMap[st.id] || [])
        .map(b => ({
          sec: parseInt(b.arrivalTimeInSecond) || 0,
          scheduled: isFlag(b.isScheduled),
          live: !!(b.busLocation && Number(b.busLocation.latitude) && Number(b.busLocation.longitude))
        }))
        .filter(b => b.sec > 0 && b.sec < 108000)
        .sort((a, b) => a.sec - b.sec);
      const first = buses[0];
      const label = first ? fmt(first.sec) : '—';
      const tag = first ? (first.live ? '<span class="k75p-tag live">實時</span>' : (first.scheduled ? '<span class="k75p-tag sched">定時</span>' : '')) : '';
      const second = buses[1];
      const sub = second
        ? '次班 ' + fmt(second.sec) + (second.live ? ' · 實時' : (second.scheduled ? ' · 定時' : ''))
        : '';
      rows.push('<div class="metro-row k75p-row">'
        + '<span class="row-main"><span class="row-name">' + escapeHtml(st.name) + tag + '</span>'
        + (sub ? '<span class="row-sub">' + sub + '</span>' : '')
        + '</span>'
        + '<span class="row-eta ' + (first && first.sec <= 60 ? 'soon' : '') + '">' + label + '</span></div>');
    }
    el.innerHTML = rows.join('');
  } catch (e) {
    el.innerHTML = '<div class="error-msg">K75P 載入失敗</div>';
  }
}

/* ---------- 设定 ---------- */
function syncSegs(sel, val) {
  const v = String(val);
  document.querySelectorAll(sel + ' button').forEach(b => b.classList.toggle('active', [b.dataset.th, b.dataset.ac, b.dataset.rv, b.dataset.ui, b.dataset.ct, b.dataset.lg, b.dataset.mo].includes(v)));
}
function setTheme(th) {
  document.body.dataset.theme = th;
  localStorage.setItem('wp8concept_theme', th);
  syncSegs('#themeSeg', th);
}
function setAccent(c) {
  document.documentElement.style.setProperty('--accent', c);
  document.documentElement.style.setProperty('--accent-dark', c);
  localStorage.setItem('wp8concept_accent', c);
  syncSegs('#accentSeg', c);
}
function setUIMode(m) {
  document.body.dataset.ui = m;
  localStorage.setItem('wp8concept_ui', m);
  syncSegs('#uiSeg', m);
}
function setContrast(on) {
  document.body.classList.toggle('high-contrast', !!on);
  localStorage.setItem('wp8concept_contrast', on ? '1' : '0');
  syncSegs('#contrastSeg', on ? '1' : '0');
}
function setNoMotion(on) {
  document.body.classList.toggle('no-motion', !!on);
  try { localStorage.setItem('wp8concept_nomotion', on ? '1' : '0'); } catch (e) {}
  syncSegs('#motionSeg', on ? '1' : '0');
}
/* ---------- 3D Tilt（防護原則：僅按壓瞬間；低端設備/減少動畫時禁用） ---------- */
function initTilt() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ((navigator.hardwareConcurrency || 8) <= 4) return;
  const SEL = '.tile, .tile-small, .metro-row, .ab-btn, .ab-more, .chip, .search-btn, .topbar-refresh, .fav-card, .fab-senyou';
  let tiltedEl = null;
  const reset = () => { if (tiltedEl) { tiltedEl.style.transform = ''; tiltedEl = null; } };
  document.addEventListener('touchstart', (e) => {
    if (document.body.classList.contains('no-motion')) return;
    if (document.body.dataset.ui === 'wp8') return;   /* WP8 規範：行按壓=整行藍，非 tilt */
    const el = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const tx = ((e.touches[0].clientX - r.left) / (r.width || 1)) - 0.5;
    const ty = ((e.touches[0].clientY - r.top) / (r.height || 1)) - 0.5;
    el.style.transform = 'perspective(420px) rotateX(' + (-ty * 12) + 'deg) rotateY(' + (tx * 12) + 'deg) scale(0.97)';
    tiltedEl = el;
  }, { passive: true });
  document.addEventListener('touchend', reset, { passive: true });
  document.addEventListener('touchcancel', reset, { passive: true });
}
function setRefresh(sec) {
  localStorage.setItem('wp8concept_refresh', String(sec));
  syncSegs('#refreshSeg', String(sec));
  restartAutoRefresh();
}

/* ---------- 自動刷新（在途鎖 + 最小間隔 + 新鮮度標記） ---------- */
let autoTimer = null;
let refreshing = false;
let lastRefreshAt = 0;
function restartAutoRefresh() {
  if (autoTimer) clearInterval(autoTimer);
  const sec = parseInt(localStorage.getItem('wp8concept_refresh') || '30', 10) || 0;
  if (sec > 0) autoTimer = setInterval(() => { if (!document.hidden) refreshAll(); }, sec * 1000);
}
function updateLastUpdate() {
  const el = $('lastUpdate');
  if (!el) return;
  el.textContent = '更新於 ' + new Date().toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function refreshAll(force) {
  const now = Date.now();
  if (refreshing) return;
  if (!force && now - lastRefreshAt < 5000) return;   /* 最小刷新間隔 5 秒 */
  refreshing = true;
  const pb = $('progressbar');
  if (pb) pb.hidden = false;
  Promise.all([renderFavs(), refreshWeather(), refreshSushiro(), loadK75PNow(), loadK75P()]).finally(() => {
    refreshing = false;
    lastRefreshAt = Date.now();
    if (pb) pb.hidden = true;
    updateLastUpdate();
  });
  if (busMap) refreshBusMap();
}

/* ---------- App Bar：Windows 桌面用真正的 Segoe UI Symbol 字形（WP8 原味），流動裝置保留細線 SVG ---------- */
const APP_GLYPHS = { home: '\uE10F', favs: '\uE113', sushi: '\uE56C', settings: '\uE115', more: '\uE10C' };
function useSegoeGlyphs() {
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
  document.querySelectorAll('.ab-btn[data-pane]').forEach(b => {
    const g = APP_GLYPHS[b.dataset.pane];
    if (g != null) b.innerHTML = '<span class="ab-glyph">' + g + '</span>';
  });
  const more = document.querySelector('.ab-more');
  if (more) more.innerHTML = '<span class="ab-glyph">' + APP_GLYPHS.more + '</span>';
}

/* ---------- 下拉刷新 ---------- */
function initPullToRefresh() {
  const ptr = $('ptr');
  if (!ptr) return;
  let startY = null, armed = false;
  document.addEventListener('touchstart', (e) => {
    const sc = e.target.closest ? e.target.closest('.pane, .pano-panel, .detail-dir') : null;
    if (!sc || sc.scrollTop > 0) { startY = null; return; }
    startY = e.touches[0].clientY;
    armed = false;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (startY == null) return;
    const sc = e.target.closest ? e.target.closest('.pane, .pano-panel, .detail-dir') : null;
    if (!sc || sc.scrollTop > 0) { startY = null; return; }
    const dy = e.touches[0].clientY - startY;
    if (dy > 30) {
      armed = true;
      ptr.classList.add('show');
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('touchend', (e) => {
    if (startY == null) return;
    const was = armed;
    armed = false; startY = null;
    ptr.classList.remove('show');
    if (was) refreshAll(true);
  }, { passive: true });
}

/* ---------- 磁貼長按：換色 / 隱藏 / 還原 ---------- */
const TILE_STORAGE = 'wp8concept_tiles';
/* 磁貼換色：WP8 用原生 accent 色板，WP7 保留暗紫系 */
function tilePalette() {
  const ui = document.body.dataset.ui;
  if (ui === 'wp7') return ['#5B21B6', '#7C3AED', '#6D28D9', '#4C1D95'];
  if (ui === 'uwp') return ['#7B68EE', '#4F6BED', '#33B2C9', '#3DBB8F'];
  if (ui === 'md') return ['#4F378B', '#7D5260', '#633B48', '#6750A4'];
  if (ui === 'wp8') return ['#0078D7', '#0A0A0A'];
  return ['#AA00FF', '#6A00FF', '#0050EF', '#00ABA9'];
}
function initTileMenu() {
  const menu = $('tileMenu');
  if (!menu) return;
  let timer = null;
  document.addEventListener('touchstart', (e) => {
    const t = e.target.closest ? e.target.closest('.tile, .tile-small') : null;
    if (!t) return;
    timer = setTimeout(() => { window.__tileMenuOpen = true; showTileMenu(t); }, 520);
  }, { passive: true });
  const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
  document.addEventListener('touchend', cancel, { passive: true });
  document.addEventListener('touchmove', cancel, { passive: true });
  document.addEventListener('click', (e) => {
    if (window.__tileMenuOpen) { e.preventDefault(); e.stopPropagation(); window.__tileMenuOpen = false; }
    if (!menu.hidden && !e.target.closest('.tile-menu')) menu.hidden = true;
  }, true);
}
function showTileMenu(tile) {
  const menu = $('tileMenu');
  if (!menu) return;
  const key = tile.dataset.tile || tile.id || tile.textContent.trim().slice(0, 4);
  const r = tile.getBoundingClientRect();
  const mk = (label, fn) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.onclick = () => { menu.hidden = true; window.__tileMenuOpen = false; fn(); };
    menu.appendChild(b);
  };
  menu.innerHTML = '';
  mk('換色', () => cycleTileColor(tile));
  mk('隱藏此磁貼', () => hideTile(key));
  mk(window.__tileDragMode ? '結束拖動排序' : '拖動排序', () => toggleTileDrag());
  mk('還原全部磁貼', () => restoreTiles());
  menu.hidden = false;
  menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 170)) + 'px';
  menu.style.top = Math.max(8, r.top - menu.offsetHeight - 6) + 'px';
}
function cycleTileColor(tile) {
  const pal = tilePalette();
  let ci = parseInt(tile.dataset.ci || '0', 10);
  ci = (ci + 1) % pal.length;
  tile.dataset.ci = String(ci);
  tile.style.background = pal[ci];
  saveTilePrefs();
}
function loadTilePrefs() {
  let p = {};
  try { p = JSON.parse(localStorage.getItem(TILE_STORAGE) || '{}'); } catch (e) {}
  if (Array.isArray(p._order) && p._order.length) applyTileOrder(p._order);
  document.querySelectorAll('.tile[data-tile], .tile-small[data-tile]').forEach(t => {
    const c = p[t.dataset.tile];
    if (!c) return;
    if (c.bg) { t.style.background = c.bg; t.dataset.ci = String(tilePalette().indexOf(c.bg)); }
    if (c.hidden) t.style.display = 'none';
  });
}
function tileOrder() {
  return [...document.querySelectorAll('.tile[data-tile], .tile-small[data-tile]')].map(t => t.dataset.tile);
}
function applyTileOrder(order) {
  document.querySelectorAll('.tiles, .tiles-small').forEach(container => {
    const kids = [...container.querySelectorAll('.tile[data-tile], .tile-small[data-tile]')];
    kids.sort((a, b) => order.indexOf(a.dataset.tile) - order.indexOf(b.dataset.tile));
    kids.forEach(k => container.appendChild(k));
  });
}
function saveTilePrefs() {
  const p = {};
  document.querySelectorAll('.tile[data-tile], .tile-small[data-tile]').forEach(t => {
    p[t.dataset.tile] = { bg: t.style.background || '', hidden: t.style.display === 'none' };
  });
  p._order = tileOrder();
  localStorage.setItem(TILE_STORAGE, JSON.stringify(p));
}
function hideTile(key) {
  const t = document.querySelector('[data-tile="' + key + '"]');
  if (t) t.style.display = 'none';
  saveTilePrefs();
}
function restoreTiles() {
  localStorage.removeItem(TILE_STORAGE);
  document.querySelectorAll('.tile[data-tile], .tile-small[data-tile]').forEach(t => { t.style.display = ''; t.style.background = ''; });
}
function toggleTileDrag() {
  window.__tileDragMode = !window.__tileDragMode;
  document.body.classList.toggle('tile-dragmode', !!window.__tileDragMode);
}
/* 拖動排序（觸控：進入拖動模式後按住磁貼移動） */
function initTileDrag() {
  let dragEl = null, startX = 0, startY = 0;
  document.addEventListener('touchstart', (e) => {
    if (!window.__tileDragMode) return;
    const t = e.target.closest ? e.target.closest('.tile[data-tile], .tile-small[data-tile]') : null;
    if (!t) return;
    dragEl = t;
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!dragEl) return;
    const dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) < 8) return;
    dragEl.classList.add('dragging');
    dragEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    dragEl.style.zIndex = '99';
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', (e) => {
    if (!dragEl) return;
    const over = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    const target = over && over.closest ? over.closest('.tile[data-tile], .tile-small[data-tile]') : null;
    if (target && target !== dragEl) {
      const parent = dragEl.parentElement;
      const rect = target.getBoundingClientRect();
      const before = e.changedTouches[0].clientX < rect.left + rect.width / 2;
      if (before) parent.insertBefore(dragEl, target);
      else parent.insertBefore(dragEl, target.nextSibling);
      saveTilePrefs();
    }
    dragEl.classList.remove('dragging');
    dragEl.style.transform = ''; dragEl.style.zIndex = '';
    dragEl = null;
  }, { passive: true });
}

/* ---------- 頂欄避讓安卓系統狀態欄（全屏邊到邊模式；Android 設最低下限） ---------- */
function applySysbarInset() {
  const vv = window.visualViewport;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const measured = vv ? Math.round(vv.offsetTop || 0) : 0;
  const h = Math.max(isAndroid ? 28 : 0, measured);
  document.documentElement.style.setProperty('--sysbar-h', h + 'px');
}

/* ---------- 初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  useSegoeGlyphs();
  applySysbarInset();
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', applySysbarInset);
    window.visualViewport.addEventListener('scroll', applySysbarInset);
  }
  const th = localStorage.getItem('wp8concept_theme') || 'dark';
  const ui = localStorage.getItem('wp8concept_ui') || 'wp8';
  const ac = localStorage.getItem('wp8concept_accent') || (ui === 'wp7' ? '#8B5CF6' : (ui === 'uwp' ? '#7B68EE' : (ui === 'md' ? '#6750A4' : '#0078D7')));
  const rv = localStorage.getItem('wp8concept_refresh') || '30';
  if (th === 'light') document.body.dataset.theme = 'light';
  document.body.dataset.ui = ui;
  document.documentElement.style.setProperty('--accent', ac);
  document.documentElement.style.setProperty('--accent-dark', ac);
  if (localStorage.getItem('wp8concept_contrast') === '1') document.body.classList.add('high-contrast');
  syncSegs('#themeSeg', th);
  syncSegs('#accentSeg', ac);
  syncSegs('#refreshSeg', rv);
  syncSegs('#uiSeg', ui);
  syncSegs('#contrastSeg', localStorage.getItem('wp8concept_contrast') === '1' ? '1' : '0');
  uiLang = localStorage.getItem('wp8concept_lang') || 'zh';
  syncSegs('#langSeg', uiLang);
  applyLang();
  fontLevel = Math.max(0, Math.min(FONT_LEVELS.length - 1, parseInt(localStorage.getItem('wp8concept_fontlevel') || '3', 10) || 3));
  applyFontSize();
  if (localStorage.getItem('wp8concept_nomotion') === '1') document.body.classList.add('no-motion');
  syncSegs('#motionSeg', localStorage.getItem('wp8concept_nomotion') === '1' ? '1' : '0');

  /* 版本（Beta 0.1 build N，由構建腳本自動疊加） */
  const APP_VERSION = (typeof window !== 'undefined' && window.APP_VERSION) ? window.APP_VERSION : 'Beta 0.1';
  const verEl = $('appVersion');
  if (verEl) verEl.textContent = APP_VERSION;

  /* 首页全景：僅更新指示點（無任何位移動畫，杜絕拖影） */
  const panoTrack = $('panoTrack');
  if (panoTrack) {
    const onPanoScroll = () => {
      const x = panoTrack.scrollLeft;
      const panelW = panoTrack.clientWidth >= 700 ? panoTrack.clientWidth / 2 : panoTrack.clientWidth;
      const hint = $('panoHint');
      if (hint) hint.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i === Math.min(2, Math.round(x / (panelW || 1)))));
    };
    panoTrack.addEventListener('scroll', onPanoScroll, { passive: true });
    onPanoScroll();
  }


  /* 磁贴翻转（Live Tile 3D 翻面：10 秒間隔，尊重減少動畫與手動開關） */
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    let flipOn = false;
    setInterval(() => {
      if (document.body.classList.contains('no-motion')) return;
      if (document.body.dataset.ui === 'wp8') return;  /* WP8 規範：App 內磁貼不翻轉 */
      flipOn = !flipOn;
      const w = $('tileWeather');
      if (w) w.classList.toggle('flip', flipOn);
    }, 10000);
  }

  loadTilePrefs();
  initPullToRefresh();
  initTileMenu();
  initTileDrag();
  initFavDrag();
  initTilt();
  renderMapLines();
  renderRecents();
  updatePivot();
  refreshAll();
  restartAutoRefresh();
});
