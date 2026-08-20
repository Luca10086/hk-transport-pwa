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
const etaText = (ts) => ts ? minsFromNow(ts) : '—';
const etaCls = (ts) => ts ? etaColorClass(ts) : '';
const parseHK = parseHKTime;

/* ---------- Pivot（横滑窗格） ---------- */
const PIVOT_TITLES = { home: '搜尋', favs: '收藏', sushi: '壽司郎', settings: '設定' };
const pivot = $('pivot');
function updatePivot() {
  let cur = 'home';
  pivot.querySelectorAll('.pane').forEach(p => {
    if (p.offsetLeft <= pivot.scrollLeft + 60) cur = p.dataset.pane;
  });
  $('pivotTitle').textContent = PIVOT_TITLES[cur] || '';
  document.querySelectorAll('.ab-btn[data-pane]').forEach(b => b.classList.toggle('active', b.dataset.pane === cur));
}
pivot.addEventListener('scroll', () => requestAnimationFrame(updatePivot), { passive: true });
function goPane(name) {
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
  if (a === 'refresh') refreshAll();
  else if (a === 'fav') favFirstResult();
}
document.addEventListener('click', (e) => {
  const m = $('moreMenu');
  if (!m || m.hidden) return;
  if (!e.target.closest('.ab-more') && !e.target.closest('.more-menu')) m.hidden = true;
});

/* ---------- 搜索 ---------- */
let currentTransport = 'bus';
function setTransport(tp, btn) {
  currentTransport = tp;
  document.querySelectorAll('#chips .chip').forEach(b => b.classList.toggle('active', b === btn));
}

let lastResults = [];   /* 供「收藏首條結果」使用 */

async function doSearch() {
  const q = $('searchInput').value.trim();
  const box = $('results');
  if (!q) return;
  box.innerHTML = '<div class="loading">搜尋中…</div>';
  if (currentTransport === 'mtr') await searchMTRConcept(q, box);
  else if (currentTransport === 'lrt') await searchLRTConcept(q, box);
  else if (currentTransport === 'mtrbus') await searchMTRBusConcept(q, box);
  else {
    if (/[\u4e00-\u9fff]/.test(q)) await searchBusStopConcept(q, box);
    else await searchBusRouteConcept(q, box);
  }
}

/* 公交：路线号 */
async function searchBusRouteConcept(q, container) {
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
      no: r.route, name: (r.orig_tc || '') + ' → ' + (r.dest_tc || ''),
      etas, fav: { type: 'bus', company: 'kmb', route: r.route, stop_id: first.stop_id || first.stop, stop_name: first.name_tc || '', direction: dir }
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
        no: String(r.route), name: (r.orig_tc && r.dest_tc) ? (dir === 'inbound' ? r.dest_tc + ' → ' + r.orig_tc : r.orig_tc + ' → ' + r.dest_tc) : '',
        etas, fav: { type: 'bus', company: 'ctb', route: String(r.route), stop_id: first.stop || first.stop_id, stop_name: '', direction: dir }
      });
    }
  }
  for (const r of (nlbRoutes || [])) {
    const stops = await getNLBRouteStops(r.routeId);
    if (!stops.length) continue;
    const etas = (await getNLBETA(r.routeId, stops[0].stopId)).map(e => ({ ts: e.etaTs, dest: '' })).sort((a, b) => a.ts - b.ts).slice(0, 3);
    results.push({
      no: String(r.routeNo || r.routeId), name: r.routeName_c || '', etas,
      fav: { type: 'bus', company: 'nlb', route: String(r.routeNo || r.routeId), routeId: r.routeId, stop_id: stops[0].stopId, stop_name: stops[0].stopName_c || '' }
    });
  }
  lastResults = results;
  renderResults(results, container);
}

/* 公交：站名（KMB） */
async function searchBusStopConcept(q, container) {
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
  lastResults = [];
  container.innerHTML = items.map(it =>
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
async function searchMTRConcept(q, container) {
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
        no: 'MTR', name: s.name, etas,
        fav: { type: 'mtr', line: Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code)), lineName: MTR_LINES[Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code))] || '', station_id: s.code, station_name: s.name }
      });
    }
  }
  lastResults = results;
  renderResults(results, container);
}

/* 轻铁 */
async function searchLRTConcept(q, container) {
  const ids = Object.keys(LRT_STATIONS).filter(id => LRT_STATIONS[id].includes(q));
  const results = [];
  for (const id of ids.slice(0, 8)) {
    const entries = await getLRTEta(Number(id));
    const now = Math.floor(Date.now() / 1000);
    const etas = entries.slice(0, 3).map(e => ({ ts: now + e.mins * 60, dest: (e.routeNo || '') + ' · ' + e.dest }));
    results.push({ no: '輕鐵', name: LRT_STATIONS[id], etas, fav: { type: 'lrt', route: LRT_STATIONS[id], station_id: Number(id), stop_name: LRT_STATIONS[id] } });
  }
  lastResults = results;
  renderResults(results, container);
}

/* 港铁巴士 */
async function searchMTRBusConcept(q, container) {
  const routeNum = q.toUpperCase().replace(/\s/g, '');
  const data = await getMTRBusETA(routeNum);
  const parsed = parseMTRBusETAData(data);
  const info = MTR_BUS_ROUTES[routeNum];
  const etas = parsed.map(p => ({ ts: parseHK(p.eta) / 1000, dest: p.stop_name })).sort((a, b) => a.ts - b.ts).slice(0, 4);
  const results = [{
    no: routeNum, name: info ? info.orig + ' → ' + info.dest : routeNum, etas,
    fav: { type: 'mtrbus', route: routeNum, orig: info ? info.orig : '', dest: info ? info.dest : '' }
  }];
  lastResults = results;
  renderResults(results, container);
}

/* ---------- 渲染：扁平 Metro 行 ---------- */
function renderResults(items, container) {
  if (!items.length) { container.innerHTML = '<div class="metro-empty">沒有結果</div>'; return; }
  container.innerHTML = items.map(it => {
    const first = it.etas && it.etas[0];
    const sub = (it.etas || []).slice(0, 2).map(e =>
      '<span class="row-eta-detail">' + escapeHtml(e.dest || '') + ' · ' + etaText(e.ts) + '</span>').join('');
    const star = it.fav
      ? '<button class="row-star" onclick="toggleRowFav(event, this)" data-fav=\'' + JSON.stringify(it.fav).replace(/'/g, '&#39;') + '\'>☆</button>'
      : '';
    return '<div class="metro-row">'
      + '<span class="row-no">' + escapeHtml(String(it.no)) + '</span>'
      + '<span class="row-main"><span class="row-name">' + escapeHtml(it.name || '') + '</span>' + sub + '</span>'
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

/* ---------- 收藏 ---------- */
async function renderFavs() {
  const box = $('favs');
  const favs = getFavorites();
  if (!favs.length) { box.innerHTML = '<div class="metro-empty">暫無收藏，在搜尋結果按 ☆ 加入</div>'; return; }
  const items = [];
  for (let i = 0; i < favs.length; i++) {
    const etas = await favETAs(favs[i]);
    items.push({ i, no: favNo(favs[i]), name: favName(favs[i]), etas });
  }
  box.innerHTML = items.map(it =>
    '<div class="metro-row">'
    + '<span class="row-no">' + escapeHtml(it.no) + '</span>'
    + '<span class="row-main"><span class="row-name">' + escapeHtml(it.name) + '</span></span>'
    + '<span class="row-eta ' + etaCls(it.etas[0]) + '">' + (it.etas[0] ? etaText(it.etas[0]) : '—') + '</span>'
    + '<button class="row-remove" data-i="' + it.i + '" onclick="removeFav(event, this)">✕</button>'
    + '</div>'
  ).join('');
}
async function favETAs(f) {
  try {
    if (f.type === 'bus') {
      if (f.company === 'kmb') {
        const wantDir = f.direction === 'inbound' ? 'I' : 'O';
        return (await getKMBETA(f.stop_id)).filter(e => e.route === f.route && (e.dir || '').toUpperCase() === wantDir)
          .map(e => parseHK(e.eta) / 1000).filter(Boolean).sort((a, b) => a - b).slice(0, 2);
      }
      if (f.company === 'ctb') {
        const wantDir = f.direction === 'inbound' ? 'I' : 'O';
        return (await getCTBETA(f.stop_id, f.route)).filter(e => (e.dir || '').toUpperCase() === wantDir)
          .map(e => parseHK(e.eta) / 1000).filter(Boolean).sort((a, b) => a - b).slice(0, 2);
      }
      if (f.company === 'nlb' && f.routeId) {
        return (await getNLBETA(f.routeId, f.stop_id)).map(e => e.etaTs).filter(Boolean).sort((a, b) => a - b).slice(0, 2);
      }
    } else if (f.type === 'lrt' && f.station_id != null) {
      const entries = await getLRTEta(f.station_id);
      const now = Math.floor(Date.now() / 1000);
      return entries.slice(0, 2).map(e => now + e.mins * 60);
    } else if (f.type === 'mtrbus') {
      const parsed = parseMTRBusETAData(await getMTRBusETA(f.route));
      return parsed.map(p => parseHK(p.eta) / 1000).filter(Boolean).sort((a, b) => a - b).slice(0, 2);
    } else if (f.type === 'mtr' && f.station_id && f.station_id !== 'ALL') {
      const sched = await getMTRSchedule(f.line, f.station_id);
      const d = (sched && sched[f.line + '-' + f.station_id]) || {};
      return [...(d.UP || []), ...(d.DOWN || [])].map(t => (t && t.time ? parseHK(t.time) / 1000 : null))
        .filter(Boolean).sort((a, b) => a - b).slice(0, 2);
    }
  } catch (e) {}
  return [];
}
function favNo(f) {
  if (f.type === 'mtr') return f.lineName || f.route || 'MTR';
  return f.route || '?';
}
function favName(f) {
  if (f.type === 'bus') return f.stop_name || f.destination || f.route;
  if (f.type === 'lrt') return f.stop_name || f.route || '';
  if (f.type === 'mtr') return f.station_name || f.lineName || '';
  if (f.type === 'mtrbus') return (f.orig && f.dest) ? f.orig + ' → ' + f.dest : f.route;
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
    el.innerHTML = '<span class="w-desc">' + (HKO_ICON_EMOJI[icon] || '') + ' ' + (HKO_ICONS[icon] || '') + '</span>'
      + (hko ? '<span class="w-item"><b>' + hko.value + '°C</b></span>' : '')
      + '<span class="w-upd">' + upd + '</span>';
    if (hko) $('tileWeatherV').textContent = hko.value + '°';
  } catch (e) {
    el.textContent = '天氣載入失敗';
  }
}

/* ---------- 寿司郎（扁平列表） ---------- */
async function refreshSushiro() {
  const el = $('sushi');
  try {
    const resp = await fetch(SUSHIRO_PROXY(SUSHIRO_STORE_API), { signal: AbortSignal.timeout(20000) });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const all = await resp.json();
    const NTW = ['葵青區', '荃灣區', '屯門區', '元朗區', '離島區'];
    const stores = (Array.isArray(all) ? all : []).filter(s => NTW.includes(s.area))
      .sort((a, b) => (a.wait || 0) - (b.wait || 0));
    el.innerHTML = stores.map(s => {
      const closed = s.storeStatus !== 'OPEN';
      const wait = closed ? '已停飛' : (s.wait <= 0 ? '直入' : s.wait + '分鐘');
      return '<div class="metro-row">'
        + '<span class="row-no" style="font-size:1rem;min-width:40px">' + escapeHtml((s.name || '').slice(0, 2)) + '</span>'
        + '<span class="row-main"><span class="row-name">' + escapeHtml(s.name || '') + '</span>'
        + '<span class="row-sub">' + escapeHtml(s.area || '') + '</span></span>'
        + '<span class="row-eta ' + (closed ? 'soon' : '') + '">' + wait + '</span></div>';
    }).join('') || '<div class="metro-empty">新界西暫時沒有分店資料</div>';
  } catch (e) {
    el.innerHTML = '<div class="error-msg">壽司郎暫時無法連線，請稍後再試</div>';
  }
}

/* ---------- K75P（扁平列表） ---------- */
async function loadK75P() {
  const el = $('k75p');
  try {
    const data = await getMTRBusETA('K75P');
    if (!data || !Array.isArray(data.busStop)) { el.innerHTML = '<div class="metro-empty">暫無資料</div>'; return; }
    el.innerHTML = data.busStop.map(stop => {
      const secs = (stop.bus || []).map(b => parseInt(b.arrivalTimeInSecond) || 0)
        .filter(s => s > 0 && s < 108000).sort((a, b) => a - b);
      const label = secs.length ? Math.max(1, Math.ceil(secs[0] / 60)) + '分鐘' : '—';
      return '<div class="metro-row">'
        + '<span class="row-no" style="font-size:1rem">' + escapeHtml(stop.busStopNameTc || stop.busStopName || stop.busStopId || '') + '</span>'
        + '<span class="row-eta ' + (secs.length && secs[0] <= 60 ? 'soon' : '') + '">' + label + '</span></div>';
    }).join('');
  } catch (e) {
    el.innerHTML = '<div class="error-msg">K75P 載入失敗</div>';
  }
}

/* ---------- 设定 ---------- */
function syncSegs(sel, val) {
  document.querySelectorAll(sel + ' button').forEach(b => b.classList.toggle('active', (b.dataset.th || b.dataset.ac || b.dataset.rv) === val));
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
function setRefresh(sec) {
  localStorage.setItem('wp8concept_refresh', String(sec));
  syncSegs('#refreshSeg', String(sec));
  restartAutoRefresh();
}

/* ---------- 自动刷新 ---------- */
let autoTimer = null;
function restartAutoRefresh() {
  if (autoTimer) clearInterval(autoTimer);
  const sec = parseInt(localStorage.getItem('wp8concept_refresh') || '30', 10) || 0;
  if (sec > 0) autoTimer = setInterval(() => { if (!document.hidden) refreshAll(); }, sec * 1000);
}
function refreshAll() {
  renderFavs();
  refreshWeather();
  refreshSushiro();
  loadK75P();
}

/* ---------- 初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const th = localStorage.getItem('wp8concept_theme') || 'dark';
  const ac = localStorage.getItem('wp8concept_accent') || '#00A2E8';
  const rv = localStorage.getItem('wp8concept_refresh') || '30';
  if (th === 'light') document.body.dataset.theme = 'light';
  document.documentElement.style.setProperty('--accent', ac);
  document.documentElement.style.setProperty('--accent-dark', ac);
  syncSegs('#themeSeg', th);
  syncSegs('#accentSeg', ac);
  syncSegs('#refreshSeg', rv);
  updatePivot();
  refreshAll();
  restartAutoRefresh();
});
