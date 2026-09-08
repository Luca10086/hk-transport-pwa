/* ============================================================
   森友出行 · WP2026 全新界面邏輯（從零重建 · 忠於概念板）
   復用：data.js / util.js / api.js（搜索·ETA·收藏·K75P 數據層）
   ============================================================ */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (x) => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const P = (x) => String(x).padStart(2, '0');
  const mmss = (sec) => sec <= 0 ? '00:00' : P(Math.floor(sec / 60)) + ':' + P(Math.floor(sec % 60));

  /* ---------- 配置 ---------- */
  let cfg = Object.assign(
    { theme: 'dark', accent: '#0078D7', font: 15, fx: true, refresh: 30 },
    (() => { try { return JSON.parse(localStorage.getItem('wp2026_cfg') || '{}'); } catch (e) { return {}; } })()
  );
  function saveCfg() { try { localStorage.setItem('wp2026_cfg', JSON.stringify(cfg)); } catch (e) {} }
  function applyCfg() {
    document.body.dataset.theme = cfg.theme;
    document.documentElement.style.setProperty('--accent', cfg.accent);
    document.documentElement.style.setProperty('--accent-dark', cfg.accent);
    document.documentElement.style.fontSize = cfg.font + 'px';
    document.body.classList.toggle('no-fx', !cfg.fx);
    document.body.dataset.mood = nightMood();
  }
  function nightMood() { const h = new Date().getHours(); return (h >= 19 || h < 6) ? 'night' : 'day'; }
  setInterval(() => { document.body.dataset.mood = nightMood(); }, 5 * 60 * 1000);
  applyCfg();

  /* ---------- App Bar 圖標 ---------- */
  const ICONS = {
    home: '<path d="M3 11.5L12 4l9 7.5V21h-6v-5h-6v5H3z"/>',
    favs: '<path d="M12 20.5S3 15.5 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 11.5-9 11.5z"/>',
    sushi: '<path d="M7 3L4.5 21M17 3l2.5 18"/>',
    map: '<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M7.1 16.9L5 19"/>',
  };
  const AB_LABELS = { home: '首頁', favs: '收藏', sushi: '壽司郎', map: '路線圖', settings: '設定' };
  document.querySelectorAll('.ab').forEach(b => {
    b.innerHTML = '<svg viewBox="0 0 24 24">' + (ICONS[b.dataset.pane] || '') + '</svg>' + (AB_LABELS[b.dataset.pane] || '') + '<span class="pill"></span>';
  });

  /* ---------- Pivot ---------- */
  const pivot = $('pivot');
  const TITLES = { home: '森友<b>出行</b>', favs: '收藏', sushi: '壽司郎', map: '路線圖', settings: '設定' };
  const SUBS = { home: '實時巴士 · 港鐵 · 輕鐵', favs: '', sushi: '', map: '', settings: '' };
  let curPane = 'home';
  function enterPane(name, focus) {
    curPane = name;
    document.querySelectorAll('.ab').forEach(b => b.classList.toggle('on', b.dataset.pane === name));
    $('tbTitle').innerHTML = TITLES[name] || '';
    $('tbSub').textContent = SUBS[name] || '';
    const pane = pivot.querySelector('.pane[data-pane="' + name + '"]');
    if (pane) pivot.scrollTo({ left: pane.offsetLeft, behavior: 'smooth' });
    if (focus) setTimeout(() => { const i = $('searchInput'); if (i) i.focus(); }, 340);
    if (name === 'favs') renderFavs();
    if (name === 'sushi' && !sushiDone) renderSushi();
    if (name === 'map') initMapPane();
  }
  document.querySelectorAll('.ab').forEach(b => b.addEventListener('click', () => enterPane(b.dataset.pane)));
  pivot.addEventListener('scroll', () => {
    let cur = 'home';
    pivot.querySelectorAll('.pane').forEach(p => { if (p.offsetLeft <= pivot.scrollLeft + 60) cur = p.dataset.pane; });
    if (cur !== curPane) {
      curPane = cur;
      document.querySelectorAll('.ab').forEach(b => b.classList.toggle('on', b.dataset.pane === cur));
      $('tbTitle').innerHTML = TITLES[cur] || '';
      if (cur === 'favs') renderFavs();
      if (cur === 'sushi' && !sushiDone) renderSushi();
      if (cur === 'map') initMapPane();
    }
    pauseFx();
  }, { passive: true });

  /* ---------- 動效：流光暫停 / 波紋 / ETA 滾動換值 ---------- */
  let fxTimer = 0;
  function pauseFx(ms) {
    if (!cfg.fx) return;
    document.body.classList.add('fx-paused');
    clearTimeout(fxTimer);
    fxTimer = setTimeout(() => document.body.classList.remove('fx-paused'), ms || 1500);
  }
  document.addEventListener('scroll', pauseFx, { passive: true });
  document.addEventListener('touchstart', pauseFx, { passive: true });
  document.addEventListener('pointerdown', (e) => {
    if (!cfg.fx || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    const el = e.target && e.target.closest ? e.target.closest('.tile, .row, .chip, .seg button, .ab, .fcard button, .sw, .fs button') : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const d = Math.max(r.width, r.height) * 1.4;
    const sp = document.createElement('span');
    sp.className = 'ripple-fx';
    sp.style.cssText = 'left:' + (e.clientX - r.left - d / 2).toFixed(0) + 'px;top:' + (e.clientY - r.top - d / 2).toFixed(0) + 'px;width:' + d.toFixed(0) + 'px;height:' + d.toFixed(0) + 'px;';
    el.appendChild(sp);
    setTimeout(() => sp.remove(), 280);
  }, { passive: true });
  const etaMap = new WeakMap();
  setInterval(() => {
    if (!cfg.fx || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    const now = Date.now();
    document.querySelectorAll('.row .eta, .fcard .big, .kcard .big, .dstop .dtm, .krow .eta').forEach(el => {
      const txt = (el.textContent || '').trim();
      const m = txt.match(/(\d+)\s*(分鐘|分)/);
      if (!m) { etaMap.delete(el); return; }
      const base = parseInt(m[1], 10) * 60;
      const rec = etaMap.get(el);
      if (!rec || rec.base !== base) {
        if (rec) { el.classList.remove('wp26-eta-swap'); void el.offsetWidth; }
        etaMap.set(el, { base, t: now });
        el.classList.add('wp26-eta-swap');
      } else {
        const sec = Math.max(0, base - Math.floor((now - rec.t) / 1000));
        el.textContent = Math.ceil(sec / 60) + ' ' + m[2];
      }
    });
  }, 1000);

  /* ---------- 詳情 Sheet ---------- */
  const sheetEl = $('sheet'), maskEl = $('sheetMask');
  let onTab = () => {};
  function openSheet(title, html, tabs) {
    $('shTitle').textContent = title;
    $('shBody').innerHTML = html;
    const tb = $('shTabs');
    tb.hidden = !tabs; tb.innerHTML = '';
    if (tabs) {
      tb.innerHTML = tabs.map((t, i) => '<button class="stab' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + esc(t) + '</button>').join('');
      tb.querySelectorAll('.stab').forEach(b => b.addEventListener('click', () => {
        tb.querySelectorAll('.stab').forEach(x => x.classList.toggle('on', x === b));
        onTab(parseInt(b.dataset.i, 10));
      }));
    }
    sheetEl.classList.add('open'); maskEl.classList.add('open');
  }
  function closeSheet() { sheetEl.classList.remove('open'); maskEl.classList.remove('open'); }
  $('shClose').addEventListener('click', closeSheet);
  maskEl.addEventListener('click', closeSheet);

  /* 光斑感應：pointermove 時最近光斑向觸點緩移（0.8s），閒置 900ms 回位 */
  const orbs = [...document.querySelectorAll('.orb')];
  let orbTimer = 0, orbRaf = 0;
  document.addEventListener('pointermove', (e) => {
    if (!cfg.fx) return;
    cancelAnimationFrame(orbRaf);
    orbRaf = requestAnimationFrame(() => {
      let best = null, bd = Infinity;
      for (const o of orbs) {
        const r = o.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        if (d < bd) { bd = d; best = o; }
      }
      if (!best || bd > 320) return;
      const r = best.getBoundingClientRect();
      const dx = Math.max(-26, Math.min(26, (e.clientX - (r.left + r.width / 2)) * .12));
      const dy = Math.max(-22, Math.min(22, (e.clientY - (r.top + r.height / 2)) * .1));
      best.style.animation = 'none';
      best.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1)';
      best.style.transform = 'translate(' + dx.toFixed(0) + 'px,' + dy.toFixed(0) + 'px)';
      best.style.opacity = '.9';
      clearTimeout(orbTimer);
      orbTimer = setTimeout(() => {
        best.style.transition = '';
        best.style.transform = '';
        best.style.opacity = '';
        best.style.animation = '';
      }, 900);
    });
  }, { passive: true });

  /* 詳情 Sheet：下拉 >120px 關閉 + blur 衰減 */
  (function sheetDrag() {
    let sy = 0, dragging = false;
    sheetEl.addEventListener('touchstart', (e) => {
      if (!e.target.closest('.handle, .shead')) return;
      sy = e.touches[0].clientY; dragging = true;
      sheetEl.style.transition = 'none';
    }, { passive: true });
    sheetEl.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const dy = Math.max(0, e.touches[0].clientY - sy);
      sheetEl.style.transform = 'translateX(-50%) translateY(' + (102 + dy) + 'px)';
      maskEl.style.opacity = Math.max(0, 1 - dy / 300);
    }, { passive: true });
    sheetEl.addEventListener('touchend', (e) => {
      if (!dragging) return;
      dragging = false;
      const dy = Math.max(0, e.changedTouches[0].clientY - sy);
      sheetEl.style.transition = 'transform .25s cubic-bezier(.16,1,.3,1)';
      if (dy > 120) closeSheet();
      else { sheetEl.style.transform = ''; maskEl.style.opacity = ''; }
      setTimeout(() => { if (!sheetEl.classList.contains('open')) { sheetEl.style.transition = ''; sheetEl.style.transform = ''; maskEl.style.opacity = ''; } }, 260);
    }, { passive: true });
  })();

  /* ---------- 搜索 ---------- */
  let tp = 'bus', searchGen = 0, lastResults = [];
  const G = { kmb: '九巴 KMB', ctb: '城巴 CTB', nlb: '大嶼山 NLB', mtr: '港鐵', lrt: '輕鐵', mtrbus: '港鐵巴士' };
  $('tpChips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    document.querySelectorAll('#tpChips .chip').forEach(x => x.classList.toggle('active', x === c));
    tp = c.dataset.tp; doSearch();
  });
  const input = $('searchInput');
  input.addEventListener('input', () => { clearTimeout(input._t); input._t = setTimeout(doSearch, 380); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

  function etaSecCls(sec) { if (sec == null) return ''; if (sec <= 120) return 'soon'; if (sec < 600) return 'med'; return ''; }
  function etaHtml(sec) {
    if (sec == null) return '<span class="eta">—</span>';
    if (sec <= 60) return '<span class="eta soon">即將</span>';
    return '<span class="eta ' + etaSecCls(sec) + '">' + Math.ceil(sec / 60) + ' <small>分</small></span>';
  }
  async function doSearch() {
    const q = input.value.trim();
    const gen = ++searchGen;
    const box = $('results');
    if (!q) { box.innerHTML = ''; lastResults = []; return; }
    if (tp === 'mtr') return searchMTR(q, gen);
    if (tp === 'lrt') return searchLRTImpl(q, gen);
    if (tp === 'mtrbus') return searchMTRBus(q, gen);
    box.innerHTML = '<div class="empty">搜尋中…</div>';
    const out = [];
    try {
      const K = await searchKMBRoute(q.toUpperCase());
      (K || []).slice(0, 6).forEach(r => out.push({
        grp: G.kmb, no: r.route, name: (r.orig_tc || '') + ' → ' + (r.dest_tc || ''), kind: 'bus', data: { route: r.route, dir: 'outbound' },
      }));
      if (!/^[A-Z0-9]+$/i.test(q)) {
        const stops = await searchKMBStopsByName(q);
        (stops || []).slice(0, 6).forEach(st => out.push({
          grp: '巴士站', no: '站', name: st.name_tc || st.name_en, kind: 'busstop', data: { route: null, dir: null, stop: st.stop },
        }));
      }
      const C = await searchCTBRoute(q.toUpperCase());
      (C || []).slice(0, 4).forEach(r => out.push({
        grp: G.ctb, no: r.route, name: (r.orig_tc || '') + ' → ' + (r.dest_tc || ''), kind: 'bus', data: { route: r.route, dir: 'outbound' },
      }));
      const N = await searchNLBRoute(q);
      (N || []).slice(0, 4).forEach(r => out.push({
        grp: G.nlb, no: r.routeNo || r.routeId, name: r.name_tc || '', kind: 'nlb', data: { route: r.routeId, dir: null },
      }));
    } catch (e) {}
    if (gen !== searchGen) return;
    lastResults = out;
    renderSearch(out);
  }
  async function kmbFirstSec(route, dir, stopId) {
    try {
      let sid = stopId;
      if (!sid) { const stops = await getKMBStops(route, dir, '1'); sid = stops && stops[0] && stops[0].stop; }
      if (!sid) return null;
      const es = await getKMBETA(sid);
      const e = (es || []).filter(x => x.route === String(route) && (x.dir || '').toUpperCase() === (dir === 'inbound' ? 'I' : 'O'))
        .sort((a, b) => parseHKTime(a.eta) - parseHKTime(b.eta))[0];
      return e ? (parseHKTime(e.eta) - Date.now()) / 1000 : null;
    } catch (e) { return null; }
  }
  async function renderSearch(items) {
    const box = $('results');
    if (!items.length) { box.innerHTML = '<div class="empty">沒有結果</div>'; return; }
    let last = null, html = '';
    for (const it of items) {
      if (it.grp !== last) { html += '<div class="grp">' + esc(it.grp) + '</div>'; last = it.grp; }
      let eta = null;
      if (it.kind === 'bus') eta = await kmbFirstSec(it.data.route, it.data.dir, it.data.stop);
      html += '<div class="row" data-i="' + items.indexOf(it) + '">'
        + '<span class="badge">' + esc(String(it.no).slice(0, 4)) + '</span>'
        + '<span class="main"><span class="nm">' + esc(it.name) + '</span>'
        + (it.cap ? '<span class="cap">' + esc(it.cap) + '</span>' : '')
        + '</span>' + etaHtml(eta) + '</div>';
    }
    box.innerHTML = html;
    box.querySelectorAll('.row').forEach(r => r.addEventListener('click', () => openRow(r)));
  }
  async function searchMTR(q, gen) {
    const qs = [q, toTrad(q), toSimp(q)].filter(Boolean);
    const upperQ = q.toUpperCase();
    const out = [];
    const seen = new Set();
    for (const lc of Object.keys(MTR_LINE_STOPS)) for (const st of MTR_LINE_STOPS[lc]) {
      if (!qs.some(x => st.name.includes(x) || x.includes(st.name)) && st.code !== upperQ) continue;
      if (seen.has(st.code)) continue;
      seen.add(st.code);
      let eta = null;
      for (const l2 of Object.keys(MTR_LINE_STOPS)) {
        if (!MTR_LINE_STOPS[l2].some(y => y.code === st.code)) continue;
        try {
          const d = (await getMTRSchedule(l2, st.code)) || {};
          const dd = d[l2 + '-' + st.code] || {};
          const ts = [...(dd.UP || []), ...(dd.DOWN || [])].map(t => parseHKTime(t.time)).filter(Boolean).sort((a, b) => a - b)[0];
          if (ts) eta = (ts - Date.now()) / 1000;
        } catch (e) {}
        if (eta) break;
      }
      out.push({ grp: G.mtr, no: 'MTR', name: st.name, kind: 'mtr', data: { station: st.code }, eta, fav: { type: 'mtr', line: Object.keys(MTR_LINE_STOPS).find(lc2 => MTR_LINE_STOPS[lc2].some(y => y.code === st.code)), lineName: MTR_LINES[Object.keys(MTR_LINE_STOPS).find(lc2 => MTR_LINE_STOPS[lc2].some(y => y.code === st.code))] || '', station_id: st.code, station_name: st.name } });
    }
    if (gen !== searchGen) return;
    lastResults = out;
    const box = $('results');
    box.innerHTML = out.map((it, i) => '<div class="row" data-i="' + i + '">'
      + '<span class="badge">MTR</span><span class="main"><span class="nm">' + esc(it.name) + '</span></span>'
      + etaHtml(it.eta) + '</div>').join('') || '<div class="empty">沒有結果</div>';
    box.querySelectorAll('.row').forEach(r => r.addEventListener('click', () => openRow(r)));
  }
  async function searchLRTImpl(q, gen) {
    const ids = Object.keys(LRT_STATIONS).filter(id => LRT_STATIONS[id].includes(q));
    const box = $('results');
    if (!ids.length) { box.innerHTML = '<div class="empty">沒有結果</div>'; lastResults = []; return; }
    let html = '';
    for (const id of ids.slice(0, 8)) {
      let es = [];
      try { es = await getLRTEta(Number(id)); } catch (e) {}
      html += '<div class="grp">' + esc(LRT_STATIONS[id]) + '</div>';
      let n = 0;
      for (const e of es) {
        if (n++ >= 4) break;
        html += '<div class="row" style="cursor:default"><span class="badge">' + esc(e.routeNo) + '</span>'
          + '<span class="main"><span class="nm">往 ' + esc(e.dest) + '</span><span class="cap">' + esc(e.platformId) + ' 號月台</span></span>'
          + (e.mins === 0 ? '<span class="eta soon">即將</span>' : '<span class="eta">' + e.mins + ' <small>分</small></span>') + '</div>';
      }
      if (!n) html += '<div class="empty" style="text-align:left">暫無到站資料</div>';
    }
    if (gen !== searchGen) return;
    box.innerHTML = html;
    lastResults = [];
  }
  async function searchMTRBus(q, gen) {
    const box = $('results');
    box.innerHTML = '<div class="empty">搜尋中…</div>';
    try {
      const data = await getMTRBusETA(q.toUpperCase());
      const byId = {};
      for (const st of ((data && data.busStop) || [])) {
        for (const b of (st.bus || [])) {
          const bid = String(b.busId || '?');
          const sec = parseInt(b.arrivalTimeInSecond, 10) || 0;
          if (sec > 0 && sec < 108000 && sec < (byId[bid] === undefined ? Infinity : byId[bid])) byId[bid] = sec;
        }
      }
      if (gen !== searchGen) return;
      const ids = Object.keys(byId).sort((a, b) => byId[a] - byId[b]).slice(0, 6);
      box.innerHTML = ids.map(bid => '<div class="row" style="cursor:default"><span class="badge">' + esc(q.toUpperCase().slice(0, 4)) + '</span>'
        + '<span class="main"><span class="nm">班次 ' + esc(bid) + '</span></span>' + etaHtml(byId[bid]) + '</div>').join('') || '<div class="empty">沒有結果</div>';
    } catch (e) { if (gen === searchGen) box.innerHTML = '<div class="empty">搜尋出錯</div>'; }
  }
  function openRow(r) {
    const it = lastResults[parseInt(r.dataset.i, 10)];
    if (!it) return;
    if (it.kind === 'bus' || it.kind === 'nlb') openBusDetail(it);
    else if (it.kind === 'mtr') openMTRDetail(it);
  }

  /* ---------- 巴士/港鐵 詳情 ---------- */
  async function openBusDetail(it) {
    const dirs = [[it.data.dir, '去程'], [it.data.dir === 'inbound' ? 'outbound' : 'inbound', '回程']];
    openSheet((it.data.route || it.no) + ' 路線詳情', '<div class="empty">載入中…</div>', dirs.map(d => d[1]));
    const cache = {};
    async function loadDir(idx) {
      const dir = dirs[idx][0];
      if (cache[dir]) { $('shBody').innerHTML = cache[dir]; return; }
      $('shBody').innerHTML = '<div class="empty">載入中…</div>';
      try {
        const stops = await getKMBStops(it.data.route, dir, '1');
        if (!stops.length) { $('shBody').innerHTML = '<div class="empty">無法載入站點</div>'; return; }
        const rows = [];
        for (let i = 0; i < stops.length; i += 4) {
          const rs = await Promise.all(stops.slice(i, i + 4).map(async st => {
            let ts = [];
            try {
              const es = await getKMBETA(st.stop);
              ts = (es || []).filter(e => e.route === String(it.data.route) && (e.dir || '').toUpperCase() === (dir === 'inbound' ? 'I' : 'O'))
                .map(e => parseHKTime(e.eta)).filter(Boolean).sort((a, b) => a - b);
            } catch (e) {}
            return { name: st.name_tc || st.name_en || ('站 ' + st.stop), ts };
          }));
          rows.push(...rs);
        }
        const html = rows.map((r, i) => {
          const sec = r.ts[0] ? (r.ts[0] - Date.now()) / 1000 : null;
          return '<div class="dstop"><span class="dseq">' + (i + 1) + '</span><span class="dnm">' + esc(r.name) + '</span>' + (sec == null ? '<span class="dtm">—</span>' : (sec <= 60 ? '<span class="dtm soon">即將</span>' : '<span class="dtm ' + etaSecCls(sec) + '">' + Math.ceil(sec / 60) + ' 分</span>')) + '</div>';
        }).join('');
        cache[dir] = html;
        $('shBody').innerHTML = html;
      } catch (e) { $('shBody').innerHTML = '<div class="empty">載入失敗</div>'; }
    }
    onTab = (i) => loadDir(i);
    loadDir(0);
  }
  async function openMTRDetail(it) {
    openSheet(it.name + ' 車站', '<div class="empty">載入中…</div>');
    const lines = [];
    for (const lc of Object.keys(MTR_LINE_STOPS)) {
      if (!MTR_LINE_STOPS[lc].some(x => x.code === it.data.station)) continue;
      try {
        const d = (await getMTRSchedule(lc, it.data.station)) || {};
        const dd = d[lc + '-' + it.data.station] || {};
        const ts = [...(dd.UP || []), ...(dd.DOWN || [])].map(t => parseHKTime(t.time)).filter(Boolean).sort((a, b) => a - b)[0];
        lines.push({ line: MTR_LINES[lc] || lc, ts });
      } catch (e) {}
    }
    $('shBody').innerHTML = lines.map(l => {
      const sec = l.ts ? (l.ts - Date.now()) / 1000 : null;
      return '<div class="dstop"><span class="dseq" style="width:auto;min-width:56px;border-radius:999px;padding:0 10px">' + esc(l.line) + '</span><span class="dnm">下一班</span>' + (sec == null ? '<span class="dtm">—</span>' : (sec <= 60 ? '<span class="dtm soon">即將</span>' : '<span class="dtm ' + etaSecCls(sec) + '">' + Math.ceil(sec / 60) + ' 分</span>')) + '</div>';
    }).join('') || '<div class="empty">暫無班次</div>';
  }

  /* ---------- 首頁磁貼 ---------- */
  let homeSeen = false;
  async function renderHome() {
    const tiles = $('homeTiles');
    let k75pEta = '—', k75pSub = '載入中';
    try {
      const data = await getMTRBusETA('K75P');
      const stop = ((data && data.busStop) || []).find(x => String(x.busStopId || '').replace(/^K75P-/, '') === 'D010') || {};
      const secs = (stop.bus || []).map(b => parseInt(b.arrivalTimeInSecond, 10) || 0).filter(x => x > 0 && x < 108000).sort((a, b) => a - b);
      if (secs.length) k75pEta = Math.max(1, Math.ceil(secs[0] / 60)) + ' 分鐘';
      const live = new Set((data.busStop || []).flatMap(st => (st.bus || []).filter(b => b.busLocation && Number(b.busLocation.latitude)).map(b => b.busId)));
      k75pSub = '實時 ' + live.size + ' 班在路';
    } catch (e) { k75pSub = '暫無資料'; }
    tiles.innerHTML =
      '<button class="tile blue wide shine" data-open="k75p">'
      + '<div class="mini-map"><div class="road"></div><span class="st" style="left:10%;top:56%"></span><span class="st" style="left:38%;top:44%"></span><span class="st" style="left:68%;top:36%"></span><span class="bus"></span><span class="no">K75P</span><span class="eta">' + esc(k75pEta) + '</span></div>'
      + '<span class="lab">天瑞 ↺ 洪水橋 · ' + esc(k75pSub) + '</span></button>'
      + '<button class="tile cyan shine" data-open="favs"><span class="lab">我的收藏</span><b>★</b><span class="cap">' + getFavorites().length + ' 條收藏</span></button>'
      + '<button class="tile warn shine" data-open="weather"><span class="lab">天氣</span><b id="wTemp">--°</b><span class="cap">載入中</span></button>'
      + '<button class="tile cyan shine" data-open="sushi"><span class="lab">壽司郎</span><b id="sushiMini">—</b></button>'
      + '<button class="tile shine" data-open="map"><span class="lab">路線圖</span><b>屯馬綫</b><span class="cap">全線候車</span></button>';
    tiles.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.open;
      if (k === 'k75p') openK75P();
      else if (k === 'weather') renderWeather();
      else setPane(k);
    }));
    /* 開場編舞：首次渲染才做 80ms 階梯（避免刷新重繪閃動） */
    if (!homeSeen) {
      homeSeen = true;
      tiles.querySelectorAll('.tile').forEach((t, i) => {
        t.classList.add('anim');
        t.style.animationDelay = (i * 80) + 'ms';
      });
    }
    loadWeather();
    const sm = $('sushiMini');
    const stores = SUSHIRO_SNAPSHOT.filter(s => s.area === '元朗區' || s.area === '屯門區');
    if (stores.length) sm.textContent = Math.max(...stores.map(s => parseInt(s.waitingGroup, 10) || 0)) + ' 組';
  }
  async function loadWeather() {
    const el = $('wTemp');
    try {
      const r = await fetchWithProxy(WEATHER_API);
      const t = r && r.temperature && r.temperature.data && r.temperature.data[0];
      if (t) { el.textContent = Math.round(t.value) + '°'; const cap = el.parentElement.querySelector('.cap'); if (cap) cap.textContent = (r.humidity && r.humidity.data) ? '濕度 ' + Math.round(r.humidity.data[0].value) + '%' : ''; }
    } catch (e) {}
  }
  const DAYS = ['今天', '明天', '後天'];
  async function renderWeather() {
    try {
      const r = await fetchWithProxy(WEATHER_FND_API);
      const fc = (r && r.forecast) || [];
      const tiles = $('homeTiles');
      if (!tiles.querySelector('.wcard')) {
        tiles.insertAdjacentHTML('beforeend', '<div class="tile wide wcard anim"><span class="lab">未來三天</span><div class="wdays">'
          + fc.slice(0, 3).map((d, i) => '<div class="wday"><span class="n">' + (DAYS[i] || '') + '</span><div class="d">' + (d.forecastMaxtemp && d.forecastMaxtemp.value ? Math.round(d.forecastMaxtemp.value) : '--') + '°</div></div>').join('')
          + '</div></div>');
      }
    } catch (e) {}
  }

  /* ---------- 收藏 ---------- */
  function favMeta(f) {
    return f.type === 'bus' ? ('公交 ' + f.route) : f.type === 'mtr' ? ((f.lineName || f.line || '') + ' 線') : f.type === 'lrt' ? (f.stop_name || '輕鐵站') : f.type === 'mtrbus' ? ('港鐵巴士 ' + f.route) : '收藏';
  }
  async function favEta(f) {
    try {
      if (f.type === 'bus' && f.stop_id) {
        const es = await getKMBETA(f.stop_id);
        const e = (es || []).filter(x => x.route === String(f.route) && (x.dir || '').toUpperCase() === (f.direction === 'inbound' ? 'I' : 'O')).sort((a, b) => parseHKTime(a.eta) - parseHKTime(b.eta))[0];
        return e ? (parseHKTime(e.eta) - Date.now()) / 1000 : null;
      }
      if (f.type === 'mtr' && f.station_id) {
        for (const lc of Object.keys(MTR_LINE_STOPS)) {
          if (!MTR_LINE_STOPS[lc].some(x => x.code === f.station_id)) continue;
          const d = (await getMTRSchedule(lc, f.station_id)) || {};
          const dd = d[lc + '-' + f.station_id] || {};
          const ts = [...(dd.UP || []), ...(dd.DOWN || [])].map(t => parseHKTime(t.time)).filter(Boolean).sort((a, b) => a - b)[0];
          if (ts) return (ts - Date.now()) / 1000;
        }
        return null;
      }
      if (f.type === 'lrt' && f.station_id != null) {
        const es = await getLRTEta(Number(f.station_id));
        return es && es[0] ? es[0].mins * 60 : null;
      }
    } catch (e) {}
    return null;
  }
  async function renderFavs() {
    const list = getFavorites();
    const box = $('favList');
    if (!list.length) { box.innerHTML = '<div class="empty">暫無收藏，在搜尋結果點 ★ 加入</div>'; return; }
    let html = '';
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      const sec = await favEta(f);
      const pinned = getFavShowKey() === favKey(f);
      const name = f.name || f.stop_name || f.station_name || f.route || f.lineName || '';
      html += '<div class="fcard shine"><div class="fh"><span class="no">' + esc(favNoStr(f)) + '</span><span class="tag">' + esc(favMeta(f)) + '</span>'
        + '<span class="actions"><button data-a="pin" data-i="' + i + '" class="' + (pinned ? 'pin' : '') + '">' + (pinned ? '✓ 釘選' : '釘選') + '</button><button class="x" data-a="del" data-i="' + i + '">✕</button></span></div>'
        + '<div class="dest">' + esc(name) + '</div>'
        + '<div class="sub">' + esc(f.direction === 'inbound' ? '回程' : '去程') + (f.stop_name ? '' : '') + '</div>'
        + '<div class="big"' + (sec ? ' data-sec="' + Math.ceil(sec / 60) + '"' : '') + '>' + (sec ? Math.max(1, Math.ceil(sec / 60)) + '<small> 分鐘</small>' : '—') + '</div>'
        + '<div class="bar"><i style="width:' + Math.min(100, (sec || 0) / 6) + '%"></i></div></div>';
    }
    box.innerHTML = html;
    box.querySelectorAll('button[data-a]').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = parseInt(b.dataset.i, 10);
      const fs2 = getFavorites();
      if (b.dataset.a === 'pin') { try { localStorage.setItem('wp8concept_pinned_fav', favKey(fs2[i])); } catch (err) {} }
      else { fs2.splice(i, 1); saveFavorites(fs2); }
      renderFavs();
    }));
  }
  function favNoStr(f) { return f.route || (f.lineName || f.line || 'MTR'); }

  /* ---------- 壽司郎（離線快照） ---------- */
  let sushiDone = false;
  function renderSushi() {
    sushiDone = true;
    const stores = SUSHIRO_SNAPSHOT.filter(s => s.area === '元朗區' || s.area === '屯門區')
      .sort((a, b) => (parseInt(b.waitingGroup, 10) || 0) - (parseInt(a.waitingGroup, 10) || 0));
    $('sushiList').innerHTML = '<div style="font-size:12px;color:var(--text2);padding:2px 4px 10px">' + esc(SUSHIRO_SNAPSHOT_AT) + ' 抓取 · 離線快照</div>'
      + stores.map(s => {
        const closed = s.storeStatus !== 'OPEN';
        const g = parseInt(s.waitingGroup, 10) || 0, w = parseInt(s.wait, 10) || 0;
        return '<div class="row" style="cursor:default"><span class="badge" style="background:rgba(0,120,215,.2);box-shadow:none">' + esc(s.name.slice(0, 1)) + '</span>'
          + '<span class="main"><span class="nm">' + esc(s.name) + '</span><span class="cap">' + (closed ? s.area : (g > 0 ? '約 ' + w + ' 分鐘 · 排 ' + g + ' 組' : s.area + ' · 直入')) + '</span></span>'
          + (closed ? '<span class="eta">休息</span>' : '<span class="eta' + (g >= 40 ? ' soon' : '') + '">' + (g > 0 ? g + ' <small>組</small>' : '直入') + '</span>') + '</div>';
      }).join('') || '<div class="empty">暫無分店</div>';
  }

  /* ---------- 路線圖（港鐵/輕鐵） ---------- */
  let lm = 'mtr', mtrTick = null, lineBtnsDone = false;
  const mtrSchedCache = {};
  function initMapPane() {
    if (!lineBtnsDone) {
      lineBtnsDone = true;
      $('mtrLineBtns').innerHTML = Object.keys(MTR_LINE_STOPS).map(lc => '<button class="chip" data-lc="' + lc + '">' + esc(MTR_LINES[lc] || lc) + '</button>').join('');
      $('mtrLineBtns').addEventListener('click', (e) => {
        const c = e.target.closest('.chip'); if (!c) return;
        document.querySelectorAll('#mtrLineBtns .chip').forEach(x => x.classList.toggle('active', x === c));
        renderMTRLine(c.dataset.lc);
      });
    }
    if (lm === 'mtr') renderMTRLine(Object.keys(MTR_LINE_STOPS)[0]); else renderLRTTable();
  }
  $('lineChips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    document.querySelectorAll('#lineChips .chip').forEach(x => x.classList.toggle('active', x === c));
    lm = c.dataset.lm;
    if (lm === 'mtr') renderMTRLine(Object.keys(MTR_LINE_STOPS)[0]); else renderLRTTable();
  });
  async function lineSchedules(stops, lc) {
    const out = {};
    await Promise.all(stops.map(async st => {
      const k = lc + ':' + st.code;
      if (!mtrSchedCache[k] || Date.now() - mtrSchedCache[k].t > 600000) {
        try {
          const d = (await getMTRSchedule(lc, st.code)) || {};
          const dd = d[lc + '-' + st.code] || {};
          const map = (dir) => (dd[dir] || []).map(x => parseHKTime(x.time)).filter(Boolean).sort((a, b) => a - b);
          mtrSchedCache[k] = { t: Date.now(), v: { UP: map('UP'), DOWN: map('DOWN') } };
        } catch (e) { mtrSchedCache[k] = { t: Date.now(), v: { UP: [], DOWN: [] } }; }
      }
      out[st.code] = mtrSchedCache[k].v;
    }));
    return out;
  }
  async function renderMTRLine(lc) {
    document.querySelectorAll('#mtrLineBtns .chip').forEach(x => x.classList.toggle('active', x.dataset.lc === lc));
    const stops = MTR_LINE_STOPS[lc] || [];
    const all = Object.keys(MTR_LINE_STOPS);
    const box = $('mapBody');
    box.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:2px 4px 8px">膠囊＝下一班（分:秒）· 班表推算</div>'
      + stops.map((s, i) => {
        const serving = all.filter(x => MTR_LINE_STOPS[x].some(y => y.code === s.code));
        return '<div class="row" style="min-height:56px"><span class="badge" style="background:rgba(0,120,215,.18);box-shadow:none">' + (i + 1) + '</span>'
          + '<span class="main"><span class="nm">' + esc(s.name) + '</span>' + (serving.length > 1 ? '<span class="cap">轉乘 ' + esc(serving.map(x => MTR_LINES[x]).join(' / ')) + '</span>' : '') + '</span>'
          + '<span class="eta" style="font-size:15px" data-sid="' + s.code + '">—</span></div>';
      }).join('');
    const schedMap = await lineSchedules(stops, lc);
    const now = Date.now();
    stops.forEach(s => {
      const el = box.querySelector('[data-sid="' + s.code + '"]');
      if (!el) return;
      const d = schedMap[s.code] || {};
      const next = [...(d.UP || []), ...(d.DOWN || [])].filter(t => t > now).sort((a, b) => a - b)[0];
      if (next) { el.dataset.sec = Math.round((next - now) / 1000); el.textContent = mmss(el.dataset.sec); }
    });
    clearInterval(mtrTick);
    mtrTick = setInterval(() => {
      if (curPane !== 'map') return;
      const el0 = Math.floor((Date.now() - now) / 1000);
      box.querySelectorAll('.eta[data-sec]').forEach(el => { el.textContent = mmss(Math.max(0, parseInt(el.dataset.sec, 10) - el0)); });
    }, 1000);
  }
  function renderLRTTable() {
    const box = $('mapBody');
    let html = '';
    for (const rg of [['屯門', 1, 300], ['天水圍', 425, 560], ['元朗', 560, 920]]) {
      html += '<div class="grp">' + rg[0] + '</div>';
      for (const id of Object.keys(LRT_STATIONS)) {
        const n = Number(id);
        if (n >= rg[1] && n <= rg[2]) html += '<div class="row" style="cursor:default"><span class="badge" style="background:rgba(0,120,215,.18);box-shadow:none">' + id + '</span><span class="main"><span class="nm">' + esc(LRT_STATIONS[id]) + '</span></span></div>';
      }
    }
    box.innerHTML = html;
  }

  /* ---------- K75P 完整玻璃地圖頁 ---------- */
  let kMap = null, kCum = [], kMarks = [], kBusM = {}, kState = null, kSel = -1, kTick = null;
  const kCoords = {};
  Object.keys(K75P_STOP_COORDS).forEach(k => { const c = K75P_STOP_COORDS[k]; if (c && c.lat) kCoords[k] = { lat: c.lat, lng: c.lng }; });
  const K75P_BUS = '<svg viewBox="0 0 28 16"><rect x="0" y="1" width="28" height="10" fill="#F4F6F8" stroke="#33537B"/><rect x="0" y="4.6" width="28" height="2.6" fill="#0078D7"/><rect x="3" y="11.5" width="5" height="3.5" fill="#1B1F27"/><rect x="20" y="11.5" width="5" height="3.5" fill="#1B1F27"/><rect x="5" y="2.2" width="9" height="2.4" fill="#33537B"/><rect x="16" y="2.2" width="6" height="2.4" fill="#33537B"/></svg>';
  function hav(a, b) { const R = 6371000, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180; const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); }
  function segFrac(a, b, p) {
    const kx = 111320 * Math.cos(a.lat * Math.PI / 180), ky = 110540;
    const bx = (b.lng - a.lng) * kx, by = (b.lat - a.lat) * ky;
    const px = (p.lng - a.lng) * kx, py = (p.lat - a.lat) * ky;
    const len2 = bx * bx + by * by;
    if (len2 < 1e-6) return { d2: px * px + py * py, f: 0 };
    const t = Math.max(0, Math.min(1, (px * bx + py * by) / len2));
    const cx = bx * t, cy = by * t;
    return { d2: (px - cx) ** 2 + (py - cy) ** 2, f: t };
  }
  function gpsPos(p, ref) {
    let best = null;
    for (let i = 0; i < K75P_STOPS.length; i++) {
      const a = kCoords[K75P_STOPS[i].id], b = kCoords[K75P_STOPS[(i + 1) % K75P_STOPS.length].id];
      if (!a || !b) continue;
      const r = segFrac(a, b, p);
      const score = r.d2 + 4000 * Math.abs(i + r.f - ref);
      if (!best || score < best.score) best = { score, d2: r.d2, pos: i + r.f };
    }
    return best && Math.sqrt(best.d2) < 300 ? best.pos : null;
  }
  function kModel(data) {
    const stopMap = {};
    (data.busStop || []).forEach(st => { stopMap[(st.busStopId || '').replace(/^K75P-/, '')] = st.bus || []; });
    const byBus = {}, stopBuses = [];
    for (let i = 0; i < K75P_STOPS.length; i++) {
      const list = [];
      for (const b of (stopMap[K75P_STOPS[i].id] || [])) {
        const sec = parseInt(b.arrivalTimeInSecond, 10);
        if (isNaN(sec) || sec < 0 || sec >= 108000) continue;
        const loc = b.busLocation;
        const live = !!(loc && Number(loc.latitude) && Number(loc.longitude));
        if (live && sec === 0) kCoords[K75P_STOPS[i].id] = { lat: Number(loc.latitude), lng: Number(loc.longitude) };
        const id = String(b.busId || '?');
        if (!byBus[id]) byBus[id] = { live: false, e: [] };
        if (live) byBus[id].live = true;
        byBus[id].e.push({ idx: i, sec, loc: live ? { lat: Number(loc.latitude), lng: Number(loc.longitude) } : null });
        list.push({ id, sec, live });
      }
      stopBuses.push(list.sort((a, b) => a.sec - b.sec));
    }
    const markers = [], chips = [];
    for (const id of Object.keys(byBus)) {
      const b = byBus[id];
      if (!b.e.length) continue;
      const es = b.e.slice().sort((a, c) => a.sec - c.sec);
      const next = es[0];
      chips.push({ idx: next.idx, sec: next.sec, live: b.live });
      if (!b.live || !next.loc) continue;
      const n2 = es.find(x => x.idx !== next.idx && x.sec > next.sec);
      const gap = n2 ? Math.max(30, n2.sec - next.sec) : 120;
      const f = next.sec === 0 ? 1 : Math.max(0, Math.min(1, (gap - next.sec) / gap));
      const ref = next.idx === 0 ? (K75P_STOPS.length - 1) + f : next.idx - 1 + f;
      let pos = gpsPos(next.loc, ref);
      if (pos != null && Math.abs(pos - ref) > 2) pos = null;
      markers.push({ id, pos: pos == null ? ref : pos, nextIdx: next.idx, nextName: K75P_STOPS[next.idx].name, nextSec: next.sec, gap: Math.max(10, gap) });
    }
    return { markers, chips, stopBuses };
  }
  function kPointAt(pos) {
    const pts = K75P_STOPS.map(st => kCoords[st.id]).filter(Boolean);
    if (!kCum.length || pts.length < 2) return pts[0] ? L.latLng(pts[0].lat, pts[0].lng) : L.latLng(22.45, 114.0);
    const seg = Math.min(pts.length - 2, Math.floor(pos));
    const f = pos - seg;
    const target = kCum[seg] + f * (kCum[seg + 1] - kCum[seg]);
    let j = 0;
    while (j < pts.length - 2 && kCum[j + 1] < target) j++;
    const span = kCum[j + 1] - kCum[j];
    const t = span > 0 ? (target - kCum[j]) / span : 0;
    return L.latLng(pts[j].lat + (pts[j + 1].lat - pts[j].lat) * t, pts[j].lng + (pts[j + 1].lng - pts[j].lng) * t);
  }
  async function initKMap() {
    const box = $('kmap');
    if (kMap) { setTimeout(() => kMap.invalidateSize(), 100); return; }
    try {
      if (!window.L) {
        await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'lib/leaflet/leaflet.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
        const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'lib/leaflet/leaflet.css'; document.head.appendChild(l);
      }
      if (!window.L) return;
      kMap = L.map(box, { zoomControl: false, attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(kMap);
      const pts = K75P_STOPS.map(st => kCoords[st.id]).filter(Boolean);
      kCum = [0];
      for (let i = 1; i < pts.length; i++) kCum.push(kCum[i - 1] + hav(pts[i - 1], pts[i]));
      const ac = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0078D7';
      L.polyline(pts, { color: '#FFFFFF', weight: 8, opacity: .9 }).addTo(kMap);
      L.polyline(pts, { color: ac, weight: 4, opacity: .95 }).addTo(kMap);
      kMarks = pts.map((p, i) => L.circleMarker(p, { radius: i === 0 || i === pts.length - 1 ? 7 : 5, color: '#FFFFFF', weight: 2.5, fillColor: ac, fillOpacity: 1 }).on('click', () => selectKStop(i)));
      kMarks.forEach(m => m.addTo(kMap));
      kMap.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
    } catch (e) {}
  }
  async function openK75P() {
    const page = $('k75pPage');
    page.classList.add('open');
    await initKMap();
    renderK75P();
    clearInterval(kTick);
    kTick = setInterval(renderK75P, 20000);
  }
  $('k75pPage').addEventListener('click', (e) => {
    if (e.target.closest('.kroom, .krow, .kcard, .kstatus, .kpanel, .kmap, .km-chip')) return;
    $('k75pPage').classList.remove('open');
    clearInterval(kTick);
  });
  async function renderK75P() {
    try {
      const data = await getMTRBusETA('K75P');
      kState = kModel(data);
      const { markers, chips } = kState;
      const gpsB = markers.slice().sort((a, b) => a.nextSec - b.nextSec);
      const sched = chips.filter(c => !c.live).sort((a, b) => a.sec - b.sec)[0];
      const lead = gpsB[0];
      const card = (l, sec, gps, extra) => '<div class="kcard shine"><span class="lab">' + l + '<span class="gps' + (gps ? '' : ' off') + '">' + (gps ? 'GPS' : '無GPS') + '</span></span><div class="big"' + (sec ? ' data-sec="' + Math.ceil(sec / 60) + '"' : '') + '>' + (sec ? Math.max(1, Math.ceil(sec / 60)) + '<span style="font-size:12px;color:var(--text2)"> 分</span>' : '—') + '</div><div class="sub">' + extra + '</div></div>';
      $('kbody').innerHTML =
        '<div style="font-size:12px;color:var(--text2);padding:2px 4px 0">' + (kSel >= 0 ? '' : '點地圖站點查最近三班') + '</div>'
        + '<div class="kcards">'
        + (lead ? card('下一班', lead.nextSec, true, lead.nextName + ' · 進行中') : '')
        + (gpsB[1] ? card('再下一班', gpsB[1].nextSec, true, gpsB[1].nextName) : '')
        + (sched ? card('第三班', sched.sec, false, '定時班次') : '')
        + '</div>'
        + '<div class="kstatus">' + (lead ? '<span class="dot"></span>巴士 <b>' + esc(lead.id) + '</b> · 已離開 <b>' + esc(K75P_STOPS[Math.max(0, Math.min(K75P_STOPS.length - 1, Math.floor(lead.pos)))].name) + '</b>，前往 <b>' + esc(lead.nextName) + '</b>' : '<span class="dot"></span>暫無實時班次') + '</div>'
        + '<div class="kpanel" id="kpanel"' + (kSel >= 0 ? '' : ' hidden') + '><div class="kh"><span class="kn" id="kpn"></span><button class="kx" id="kx">✕</button></div><div id="krows"></div></div>';
      const kx = $('kx');
      if (kx) kx.onclick = () => { kSel = -1; $('#kpanel').hidden = true; };
      if (kSel >= 0) selectKStop(kSel);
      if (kMap) {
        markers.forEach(m => {
          const k = 'b' + m.id;
          let mk = kBusM[k];
          if (!mk) { mk = L.marker(kPointAt(m.pos), { icon: L.divIcon({ className: '', html: K75P_BUS, iconSize: [28, 16], iconAnchor: [14, 8] }) }).addTo(kMap); kBusM[k] = mk; }
          mk.dataset_ref = m.pos; mk.dataset_gap = m.gap; mk.dataset_stop = m.nextIdx === 0 ? K75P_STOPS.length - 1 : m.nextIdx - 1;
          mk.setLatLng(kPointAt(m.pos));
          mk.bindTooltip('巴士 ' + m.id + ' · 下一站 ' + m.nextName, { direction: 'top', offset: [0, -10] });
        });
        const keep = new Set(markers.map(m => 'b' + m.id));
        Object.keys(kBusM).forEach(kk => { if (!keep.has(kk)) { kMap.removeLayer(kBusM[kk]); delete kBusM[kk]; } });
      }
    } catch (e) {}
  }
  function selectKStop(i) {
    kSel = i;
    const pn = $('kpanel'), kn = $('kpn'), kr = $('krows');
    if (!pn || !kr) return;
    pn.hidden = false;
    kn.textContent = K75P_STOPS[i].name + (i === 0 ? '（起點）' : i === K75P_STOPS.length - 1 ? '（終點）' : '');
    const rows = (kState && kState.stopBuses[i] || []).slice(0, 3);
    kr.innerHTML = rows.map((b, k) => '<div class="krow"><span class="no">' + (['下一班', '次班', '三班'][k] || (k + 1)) + '</span><span class="bus">巴士 <b>' + esc(b.id) + '</b> <span class="ktag' + (b.live ? '' : ' off') + '">' + (b.live ? 'GPS' : '定時') + '</span></span><span class="eta"' + (b.sec === 0 ? '' : ' data-sec="' + Math.ceil(b.sec / 60) + '"') + '>' + (b.sec === 0 ? '00:00' : mmss(b.sec)) + '</span></div>').join('')
      || '<div class="krow"><span class="no">—</span><span class="bus">暫無班次</span></div>';
    kMarks.forEach((m, kk) => m.setStyle({ radius: kk === i ? 9 : (kk === 0 || kk === K75P_STOPS.length - 1 ? 7 : 5) }));
  }

  /* ---------- 設定 ---------- */
  const ACCENTS = [['#0078D7', '藍'], ['#00ABA9', '青綠'], ['#AA00FF', '紫'], ['#6A00FF', '靛']];
  const FONT_LEVELS = [13, 13.7, 14.4, 15, 15.7, 16.4, 17.2, 18];
  let fontLevel = Math.max(0, Math.min(FONT_LEVELS.length - 1, FONT_LEVELS.indexOf(cfg.font)));
  if (fontLevel < 0) { fontLevel = 3; }
  function renderSettings() {
    const box = $('settingsList');
    const seg = (name, opts, cur) => '<div class="seg">' + opts.map(o => '<button class="' + (o[0] === cur ? 'active' : '') + '" data-k="' + name + '" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>';
    box.innerHTML =
      '<div class="grp">外觀</div>'
      + '<div class="setrow"><span class="l">主題<small class="cap">深色 / 淺色</small></span>' + seg('theme', [['dark', '深色'], ['light', '淺色']], cfg.theme) + '</div>'
      + '<div class="setrow"><span class="l">強調色<small class="cap">藍 · 青綠 · 紫 · 靛</small></span>' + seg('accent', ACCENTS.map(a => [a[0], a[1]]), cfg.accent) + '</div>'
      + '<div class="setrow"><span class="l">字體大小<small class="cap">8 級 · 全局</small></span><span class="fs"><button data-fs="-1">A−</button><span class="dots">' + FONT_LEVELS.map((_, i) => '<i class="' + (i === fontLevel ? 'on' : '') + '"></i>').join('') + '</span><button data-fs="1">A＋</button></span></div>'
      + '<div class="setrow"><span class="l">減少動效<small class="cap">流光 · 波紋 · 光斑 · 脈衝</small></span><button class="sw ' + (cfg.fx ? 'on' : '') + '" data-fx></button></div>'
      + '<div class="grp">出行</div>'
      + '<div class="setrow"><span class="l">自動重新整理<small class="cap">首頁磁貼</small></span>' + seg('refresh', [['30', '30s'], ['60', '60s'], ['0', '關']], String(cfg.refresh)) + '</div>'
      + '<div class="setrow"><span class="l">版本<small class="cap">WP2026 全新界面</small></span><span style="font-size:13px;color:var(--text2)">Beta 0.2</span></div>';
    box.querySelectorAll('button[data-k]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.k === 'theme') cfg.theme = b.dataset.v;
      if (b.dataset.k === 'accent') cfg.accent = b.dataset.v;
      if (b.dataset.k === 'refresh') cfg.refresh = Number(b.dataset.v);
      saveCfg(); applyCfg(); renderSettings();
      if (b.dataset.k === 'accent' && kMap) { kMap.remove(); kMap = null; kBusM = {}; setTimeout(() => initKMap(), 80); }
    }));
    box.querySelectorAll('button[data-fs]').forEach(b => b.addEventListener('click', () => {
      fontLevel = Math.max(0, Math.min(FONT_LEVELS.length - 1, fontLevel + Number(b.dataset.fs)));
      cfg.font = FONT_LEVELS[fontLevel];
      saveCfg(); applyCfg(); renderSettings();
    }));
    box.querySelectorAll('[data-fx]').forEach(b => b.addEventListener('click', () => {
      cfg.fx = !cfg.fx; saveCfg(); applyCfg(); renderSettings();
    }));
  }

  /* ---------- 啟動 ---------- */
  renderHome();
  renderSettings();
  const refreshSec = (cfg.refresh || 30) * 1000;
  setInterval(() => { if (cfg.refresh > 0) renderHome(); }, refreshSec);
})();
