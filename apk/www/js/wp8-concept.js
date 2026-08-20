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
      t.textContent = PIVOT_TITLES[cur] || '';
      t.classList.remove('switch');
    }, 160);
  }
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

/* ---------- 3D Tilt：按压时向触控点倾斜 ---------- */
let tiltedEl = null;
document.addEventListener('touchstart', (e) => {
  const el = e.target && e.target.closest ? e.target.closest('.tile, .tile-small, .metro-row, .ab-btn, .ab-more, .chip, .search-btn, .topbar-refresh') : null;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const tx = ((e.touches[0].clientX - r.left) / (r.width || 1)) - 0.5;
  const ty = ((e.touches[0].clientY - r.top) / (r.height || 1)) - 0.5;
  el.style.transform = 'perspective(420px) rotateX(' + (-ty * 12) + 'deg) rotateY(' + (tx * 12) + 'deg) scale(0.97)';
  tiltedEl = el;
}, { passive: true });
const resetTilt = () => { if (tiltedEl) { tiltedEl.style.transform = ''; tiltedEl = null; } };
document.addEventListener('touchend', resetTilt, { passive: true });
document.addEventListener('touchcancel', resetTilt, { passive: true });

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
      no: r.route, name: '往 ' + (dir === 'outbound' ? r.dest_tc : r.orig_tc), sub: '由 ' + (dir === 'outbound' ? r.orig_tc : r.dest_tc) + ' 開出', group: '九巴',
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
        no: String(r.route), name: '往 ' + (dir === 'outbound' ? r.dest_tc : r.orig_tc), sub: '由 ' + (dir === 'outbound' ? r.orig_tc : r.dest_tc) + ' 開出', group: '城巴',
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
      no: String(r.routeNo || r.routeId), name: r.routeName_c || '', sub: stops[0].stopName_c ? '由 ' + stops[0].stopName_c + ' 開出' : '', group: '新大嶼山巴士', etas,
      detail: { type: 'bus', company: 'nlb', route: String(r.routeNo || r.routeId), routeId: r.routeId },
      fav: { type: 'bus', company: 'nlb', route: String(r.routeNo || r.routeId), routeId: r.routeId, stop_id: stops[0].stopId, stop_name: stops[0].stopName_c || '', dest: r.routeName_c || '' }
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
  container.innerHTML = '<div class="metro-group">巴士站</div>' + items.map(it =>
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
        no: 'MTR', name: s.name, group: '港鐵', etas,
        detail: { type: 'mtr', station_id: s.code, station_name: s.name, line: Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code)), lineName: MTR_LINES[Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code))] || '' },
        fav: { type: 'mtr', line: Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code)), lineName: MTR_LINES[Object.keys(MTR_LINE_STOPS).find(lc => MTR_LINE_STOPS[lc].some(x => x.code === s.code))] || '', station_id: s.code, station_name: s.name }
      });
    }
  }
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
async function searchLRTConcept(q, container) {
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
      + '<button class="row-star lrt-star" onclick="toggleRowFav(event, this)" data-fav=\'' + JSON.stringify(fav).replace(/'/g, '&#39;') + '\'>' + (isFavorited(fav) ? '★' : '☆') + '</button>'
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
  container.innerHTML = html;
  lastResults = firstFavs;
}

/* 港铁巴士 */
async function searchMTRBusConcept(q, container) {
  const routeNum = q.toUpperCase().replace(/\s/g, '');
  const data = await getMTRBusETA(routeNum);
  const parsed = parseMTRBusETAData(data);
  const info = MTR_BUS_ROUTES[routeNum];
  const etas = parsed.map(p => ({ ts: parseHK(p.eta) / 1000, dest: p.stop_name })).sort((a, b) => a.ts - b.ts).slice(0, 4);
  const results = [{
    no: routeNum, name: info ? info.orig + ' → ' + info.dest : routeNum, group: '港鐵巴士', etas,
    detail: { type: 'mtrbus', route: routeNum, orig: info ? info.orig : '', dest: info ? info.dest : '' },
    fav: { type: 'mtrbus', route: routeNum, orig: info ? info.orig : '', dest: info ? info.dest : '' }
  }];
  lastResults = results;
  renderResults(results, container);
}

/* ---------- 渲染：扁平 Metro 行（含 Metro 分隔標題；與輕鐵同構：路線號 / 目的地 / 副資訊 / 右側班次） ---------- */
function renderResults(items, container) {
  if (!items.length) { container.innerHTML = '<div class="metro-empty">沒有結果</div>'; return; }
  let lastGroup = null;
  const labels = ['次班', '三班'];
  container.innerHTML = items.map(it => {
    const head = (it.group && it.group !== lastGroup)
      ? '<div class="metro-group">' + escapeHtml(it.group) + '</div>' : '';
    if (it.group) lastGroup = it.group;
    const first = it.etas && it.etas[0];
    const sub = (it.etas || []).slice(1, 3).map((e, idx) =>
      '<span class="row-eta-detail">' + (e.dest ? escapeHtml(e.dest) + ' · ' : labels[idx] + ' ') + etaText(e.ts) + '</span>').join('');
    const star = it.fav
      ? '<button class="row-star" onclick="toggleRowFav(event, this)" data-fav=\'' + JSON.stringify(it.fav).replace(/'/g, '&#39;') + '\'>' + (isFavorited(it.fav) ? '★' : '☆') + '</button>'
      : '';
    const click = it.detail
      ? ' class="metro-row row-clickable" data-detail=\'' + JSON.stringify(it.detail).replace(/'/g, '&#39;') + '\' onclick="openRouteDetail(this)"'
      : ' class="metro-row"';
    return head + '<div' + click + '>'
      + '<span class="row-no">' + escapeHtml(String(it.no)) + '</span>'
      + '<span class="row-main"><span class="row-name">' + escapeHtml(it.name || '') + '</span>'
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
function openRouteDetail(btn) {
  const raw = btn ? btn.getAttribute('data-detail') : null;
  if (!raw) return;
  let detail;
  try { detail = JSON.parse(raw); } catch (e) { return; }
  const sheet = $('detailSheet');
  if (!sheet) return;
  $('detailTitle').textContent = detailTitle(detail);
  sheet.hidden = false;
  requestAnimationFrame(() => sheet.classList.add('open'));
  renderRouteDetail(detail, $('detailBody'));
}
function closeRouteDetail() {
  const sheet = $('detailSheet');
  if (!sheet) return;
  sheet.classList.remove('open');
  setTimeout(() => { sheet.hidden = true; }, 360);
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sheet = $('detailSheet');
    if (sheet && !sheet.hidden) closeRouteDetail();
  }
});
async function renderRouteDetail(detail, body) {
  body.innerHTML = '<div class="loading">載入中…</div>';
  try {
    if (detail.type === 'mtr') { await renderMTRStationDetail(detail, body); return; }
    if (detail.type === 'mtrbus') { await renderMTRBusDetail(detail, body); return; }
    let stops = [], wantDir = 'O';
    if (detail.company === 'kmb') {
      stops = await getKMBStops(detail.route, detail.direction || 'outbound', '1');
      wantDir = detail.direction === 'inbound' ? 'I' : 'O';
      if (stops.length) {
        const missing = stops.filter(s => !(s.name_tc || s.name_en)).map(s => s.stop);
        const names = await Promise.all(missing.map(sid => getKMBStopName(sid)));
        const nm = {};
        missing.forEach((sid, i) => { nm[String(sid)] = names[i]; });
        stops = stops.map(s => ({ ...s, name_tc: s.name_tc || s.name_en || nm[String(s.stop)] || '' }));
      }
    } else if (detail.company === 'ctb') {
      stops = await getCTBStops(detail.route, detail.direction || 'outbound');
      wantDir = detail.direction === 'inbound' ? 'I' : 'O';
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
    if (!stops.length) { body.innerHTML = '<div class="metro-empty">無法載入此路線的車站列表</div>'; return; }
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
    body.innerHTML = rows.map((r, i) =>
      '<div class="ds-stop">'
      + '<span class="ds-seq">' + (i + 1) + '</span>'
      + '<span class="ds-name">' + escapeHtml(r.name) + '</span>'
      + '<span class="ds-eta ' + etaCls(r.ts[0]) + '">' + (r.ts[0] ? etaText(r.ts[0]) : '—') + '</span>'
      + '</div>').join('');
  } catch (e) {
    body.innerHTML = '<div class="error-msg">詳情載入失敗</div>';
  }
}
async function renderMTRStationDetail(detail, body) {
  const lines = [];
  for (const lc of Object.keys(MTR_LINE_STOPS)) {
    if (!MTR_LINE_STOPS[lc].some(x => x.code === detail.station_id)) continue;
    const sched = await getMTRSchedule(lc, detail.station_id);
    const d = (sched && sched[lc + '-' + detail.station_id]) || {};
    const ts = [...(d.UP || []), ...(d.DOWN || [])]
      .map(t => (t && t.time ? parseHK(t.time) / 1000 : null)).filter(Boolean).sort((a, b) => a - b);
    lines.push({ line: MTR_LINES[lc] || lc, ts });
  }
  body.innerHTML = lines.map(l =>
    '<div class="ds-stop">'
    + '<span class="ds-seq" style="width:auto;min-width:56px">' + escapeHtml(l.line) + '</span>'
    + '<span class="ds-name">下一班</span>'
    + '<span class="ds-eta ' + etaCls(l.ts[0]) + '">' + (l.ts[0] ? etaText(l.ts[0]) : '—') + '</span>'
    + '</div>').join('') || '<div class="metro-empty">暫無班次資料</div>';
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

/* ---------- 收藏 ---------- */
async function renderFavs() {
  const box = $('favs');
  const favs = getFavorites();
  if (!favs.length) { box.innerHTML = '<div class="metro-empty">暫無收藏，在搜尋結果按 ☆ 加入</div>'; return; }
  let html = '';
  for (let i = 0; i < favs.length; i++) {
    const f = favs[i];
    /* 輕鐵收藏：與搜索結果顯示完全一致（站名頭 + 各路線行） */
    if (f.type === 'lrt' && f.station_id != null) {
      let entries = [];
      try { entries = await getLRTEta(f.station_id); } catch (e) {}
      html += '<div class="lrt-station">'
        + '<span class="lrt-head">' + escapeHtml(f.stop_name || f.route || '') + '</span>'
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
      continue;
    }
    const etas = await favETAs(f);
    const it = { i, no: favNo(f), title: favTitle(f), sub: favSub(f), etas };
    const det = (it.etas || []).slice(0, 2).map(e =>
      '<span class="row-eta-detail">' + (e.dest ? escapeHtml(e.dest) + ' · ' : '') + etaText(e.ts) + '</span>').join('');
    const d = favDetailFor(f);
    const click = d ? ' data-detail=\'' + JSON.stringify(d).replace(/'/g, '&#39;') + '\' onclick="openRouteDetail(this)"' : '';
    html += '<div class="metro-row fav-row' + (d ? ' row-clickable' : '') + '"' + click + '>'
      + '<span class="row-no">' + escapeHtml(it.no) + '</span>'
      + '<span class="row-main"><span class="row-name">' + escapeHtml(it.title) + '</span>'
      + (it.sub ? '<span class="row-sub">' + escapeHtml(it.sub) + '</span>' : '')
      + det + '</span>'
      + '<span class="row-eta ' + etaCls(it.etas[0] && it.etas[0].ts) + '">' + (it.etas[0] ? etaText(it.etas[0].ts) : '—') + '</span>'
      + '<button class="row-remove" data-i="' + i + '" onclick="removeFav(event, this)">✕</button>'
      + '</div>';
  }
  box.innerHTML = html;
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
    el.innerHTML = '<span class="w-desc">' + (HKO_ICON_EMOJI[icon] || '') + ' ' + (HKO_ICONS[icon] || '') + '</span>'
      + (hko ? '<span class="w-item"><b>' + hko.value + '°C</b></span>' : '')
      + '<span class="w-upd">' + upd + '</span>';
    if (hko) $('tileWeatherV').textContent = hko.value + '°';
    const td = $('tileWeatherD');
    if (td) td.textContent = HKO_ICONS[icon] || '';
  } catch (e) {
    el.textContent = '天氣載入失敗';
  }
}

/* ---------- 寿司郎（只顯示元朗/屯門/天水圍 · 顯示排隊組數） ---------- */
async function fetchSushiroData() {
  const url = SUSHIRO_STORE_API;
  const tries = [url, SUSHIRO_PROXY(url), CORS_PROXIES[0](url)];
  for (const u of tries) {
    try {
      const resp = await fetch(u, { signal: AbortSignal.timeout(15000) });
      if (resp.ok) return await resp.json();
    } catch (e) {}
  }
  throw new Error('unreachable');
}
async function refreshSushiro() {
  const el = $('sushi');
  try {
    const all = await fetchSushiroData();
    /* 天水圍的分店歸屬「元朗區」，故按 元朗區 + 屯門區 過濾 */
    const areas = ['元朗區', '屯門區'];
    const stores = (Array.isArray(all) ? all : []).filter(s => areas.includes(s.area))
      .sort((a, b) => ((a.waitingGroup || 0) - (b.waitingGroup || 0)) || ((a.wait || 0) - (b.wait || 0)));
    el.innerHTML = stores.map(s => {
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
    }).join('') || '<div class="metro-empty">元朗、屯門、天水圍暫無分店資料</div>';
  } catch (e) {
    el.innerHTML = '<div class="error-msg">壽司郎暫時無法連線，請稍後再試</div>';
  }
}

/* ---------- K75P（首屏天瑞磁貼 + 全線實時） ---------- */
async function loadK75PNow() {
  const v = $('k75pTileV'), s = $('k75pTileSub');
  if (!v) return;
  try {
    const data = await getMTRBusETA('K75P');
    if (!data || !Array.isArray(data.busStop)) { v.textContent = '--'; s.textContent = '暫無資料'; return; }
    const stop = (data.busStop || []).find(x => String(x.busStopId || '').replace(/^K75P-/, '') === 'D010') || {};
    const secs = (stop.bus || []).map(b => parseInt(b.arrivalTimeInSecond) || 0)
      .filter(x => x > 0 && x < 108000).sort((a, b) => a - b);
    const fmt = x => x <= 60 ? '即將' : Math.max(1, Math.ceil(x / 60)) + ' 分鐘';
    if (!secs.length) { v.textContent = '—'; s.textContent = '天瑞 · 暫無班次'; return; }
    v.textContent = fmt(secs[0]);
    s.textContent = secs[1] ? '次班 ' + fmt(secs[1]) : '天瑞總站';
  } catch (e) {
    v.textContent = '--'; s.textContent = '載入失敗';
  }
}

async function loadK75P() {
  const el = $('k75p');
  try {
    const data = await getMTRBusETA('K75P');
    if (!data || !Array.isArray(data.busStop)) { el.innerHTML = '<div class="metro-empty">暫無資料</div>'; return; }
    const stopMap = {};
    for (const stop of data.busStop) stopMap[(stop.busStopId || '').replace(/^K75P-/, '')] = stop.bus || [];
    el.innerHTML = K75P_STOPS.map(st => {
      const secs = (stopMap[st.id] || []).map(b => parseInt(b.arrivalTimeInSecond) || 0)
        .filter(s => s > 0 && s < 108000).sort((a, b) => a - b);
      const label = secs.length ? (secs[0] <= 60 ? '即將到站' : Math.max(1, Math.ceil(secs[0] / 60)) + ' 分鐘') : '—';
      const sub = secs.length > 1 ? '次班 ' + (secs[1] <= 60 ? '即將到站' : Math.max(1, Math.ceil(secs[1] / 60)) + ' 分鐘') : '';
      return '<div class="metro-row k75p-row">'
        + '<span class="row-main"><span class="row-name">' + escapeHtml(st.name) + '</span>'
        + (sub ? '<span class="row-sub">' + sub + '</span>' : '')
        + '</span>'
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
  const pb = $('progressbar');
  if (pb) pb.hidden = false;
  Promise.all([renderFavs(), refreshWeather(), refreshSushiro(), loadK75PNow(), loadK75P()]).finally(() => {
    if (pb) pb.hidden = true;
  });
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

/* ---------- 頂欄避讓安卓系統狀態欄（全屏邊到邊模式） ---------- */
function applySysbarInset() {
  const vv = window.visualViewport;
  const h = vv ? Math.max(0, Math.round(vv.offsetTop || 0)) : 0;
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
  const ac = localStorage.getItem('wp8concept_accent') || '#00A2E8';
  const rv = localStorage.getItem('wp8concept_refresh') || '30';
  if (th === 'light') document.body.dataset.theme = 'light';
  document.documentElement.style.setProperty('--accent', ac);
  document.documentElement.style.setProperty('--accent-dark', ac);
  syncSegs('#themeSeg', th);
  syncSegs('#accentSeg', ac);
  syncSegs('#refreshSeg', rv);

  /* 版本（Beta 0.1 build N，由構建腳本自動疊加） */
  const APP_VERSION = (typeof window !== 'undefined' && window.APP_VERSION) ? window.APP_VERSION : 'Beta 0.1';
  const verEl = $('appVersion');
  if (verEl) verEl.textContent = APP_VERSION;

  /* 首页全景视差：requestAnimationFrame 缓动插值，滚动更顺滑 */
  const panoTrack = $('panoTrack');
  if (panoTrack) {
    let bgCur = 0, titleCur = 0, raf = null;
    const panoTick = () => {
      const targetX = panoTrack.scrollLeft;
      bgCur += (targetX * 0.5 - bgCur) * 0.14;
      titleCur += (-targetX * 0.35 - titleCur) * 0.14;
      const bg = $('panoBg'), title = $('panoTitle');
      if (bg) bg.style.transform = 'translateX(' + bgCur.toFixed(2) + 'px)';
      if (title) title.style.transform = 'translateX(' + titleCur.toFixed(2) + 'px)';
      if (Math.abs(targetX * 0.5 - bgCur) > 0.3 || Math.abs(-targetX * 0.35 - titleCur) > 0.3) {
        raf = requestAnimationFrame(panoTick);
      } else raf = null;
    };
    const onPanoScroll = () => {
      const x = panoTrack.scrollLeft;
      const panelW = panoTrack.clientWidth >= 700 ? panoTrack.clientWidth / 2 : panoTrack.clientWidth;
      const hint = $('panoHint');
      if (hint) hint.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i === Math.min(2, Math.round(x / (panelW || 1)))));
      if (!raf) raf = requestAnimationFrame(panoTick);
    };
    panoTrack.addEventListener('scroll', onPanoScroll, { passive: true });
    onPanoScroll();
  }

  /* 磁贴翻转（Live Tile 动画） */
  let flipOn = false;
  setInterval(() => {
    const tile = $('tileWeather');
    if (tile) { flipOn = !flipOn; tile.classList.toggle('flip', flipOn); }
  }, 5000);

  updatePivot();
  refreshAll();
  restartAutoRefresh();
});
