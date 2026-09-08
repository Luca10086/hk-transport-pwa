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
    document.body.classList.toggle('high-contrast', !!cfg.hc);
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
  /* ---------- Pivot 玻璃視差（離場 blur 12→0 · 內容 ±24px · 光條跟手） ---------- */
  let pvRaf = 0;
  function applyParallax() {
    if (!cfg.fx || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      pivot.querySelectorAll('.pane').forEach(p => { p.style.transform = ''; p.style.filter = ''; });
      const lt0 = $('pivotLight'); if (lt0) lt0.style.opacity = '0';
      return;
    }
    const x = pivot.scrollLeft;
    pivot.querySelectorAll('.pane').forEach(p => {
      const aw = p.offsetWidth || 1;
      const p01 = Math.max(0, Math.min(1, Math.abs(x - p.offsetLeft) / aw));
      if (p01 < 0.02 || p01 > 0.98) { p.style.transform = ''; p.style.filter = ''; return; }
      const side = p.offsetLeft >= x ? 1 : -1;   /* 視口右側=進場頁，左側=離場頁 */
      p.style.transform = 'translateX(' + (side * p01 * 24).toFixed(1) + 'px)';
      p.style.filter = side < 0
        ? 'blur(' + (p01 * 9).toFixed(1) + 'px)'          /* 離場：滑出發糊 */
        : 'blur(' + ((1 - p01) * 6).toFixed(1) + 'px)';   /* 進場：由清漸入微糊 */
    });
    const lt = $('pivotLight');
    if (lt) {
      const max = Math.max(1, pivot.scrollWidth - pivot.clientWidth - 80);
      const f = max ? (x / max) : 0;
      lt.style.transform = 'translateX(' + (f * max).toFixed(0) + 'px)';
      lt.style.opacity = String(Math.min(1, Math.abs(x) > 2 ? 0.95 : 0));
    }
  }
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
    cancelAnimationFrame(pvRaf);
    pvRaf = requestAnimationFrame(applyParallax);
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
  let tp = 'bus', searchGen = 0, lastResults = [], nightOnly = false;
  const RECENT_KEY = 'wp2026_recent';
  function getRecent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; } }
  function pushRecent(q) {
    let qs = getRecent().filter(x => x !== q);
    qs.unshift(q); qs = qs.slice(0, 6);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(qs)); } catch (e) {}
  }
  function recentHtml() {
    const qs = getRecent();
    if (!qs.length) return '';
    return '<div class="grp">最近搜尋</div><div class="chips">' + qs.map(q => '<button class="chip" data-rq="' + esc(q) + '">' + esc(q) + '</button>').join('') + '</div>';
  }
  const G = { kmb: '九巴 KMB', ctb: '城巴 CTB', nlb: '大嶼山 NLB', mtr: '港鐵', lrt: '輕鐵', mtrbus: '港鐵巴士' };
  $('tpChips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    if (c.dataset.night) {
      nightOnly = !nightOnly;
      c.classList.toggle('active', nightOnly);
      c.style.borderColor = nightOnly ? '' : '';
      doSearch(); return;
    }
    nightOnly = false;
    const n = $('tpChips').querySelector('[data-night]');
    if (n && n.classList.contains('active')) n.classList.remove('active');
    document.querySelectorAll('#tpChips .chip[data-tp]').forEach(x => x.classList.toggle('active', x === c));
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
  /* 收藏星標 */
  function starBtn(fav) {
    if (!fav) return '';
    const on = isFavorited(fav);
    return '<button class="star' + (on ? ' on' : '') + '" data-fav="' + esc(JSON.stringify(fav)) + '">' + (on ? '★' : '☆') + '</button>';
  }
  function toggleStar(b) {
    let fav; try { fav = JSON.parse(b.dataset.fav || 'null'); } catch (err) { return; }
    if (!fav) return;
    const favs = getFavorites();
    const idx = favs.findIndex(f => favKey(f) === favKey(fav));
    if (idx >= 0) { favs.splice(idx, 1); b.textContent = '☆'; b.classList.remove('on'); }
    else { favs.push(fav); b.textContent = '★'; b.classList.add('on'); }
    saveFavorites(favs);
    pauseFx(800);
  }
  function bindStars(root) {
    root.querySelectorAll('.star[data-fav]').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); toggleStar(b); }));
  }
  async function doSearch() {
    const q = input.value.trim();
    const gen = ++searchGen;
    const box = $('results');
    if (!q) {
      box.innerHTML = recentHtml();
      box.querySelectorAll('.chip[data-rq]').forEach(c => c.addEventListener('click', () => { input.value = c.dataset.rq; doSearch(); }));
      lastResults = [];
      return;
    }
    pushRecent(q);
    if (tp === 'mtr') return searchMTR(q, gen);
    if (tp === 'lrt') return searchLRTImpl(q, gen);
    if (tp === 'mtrbus') return searchMTRBus(q, gen);
    box.innerHTML = '<div class="empty">搜尋中…</div>';
    const out = [];
    try {
      const K = await searchKMBRoute(q.toUpperCase());
      (K || []).slice(0, 6).forEach(r => out.push({
        grp: G.kmb, no: r.route, name: (r.orig_tc || '') + ' → ' + (r.dest_tc || ''), kind: 'bus', data: { route: r.route, dir: 'outbound' },
        fav: { type: 'bus', company: 'kmb', route: r.route, orig: r.orig_tc || '', dest: r.dest_tc || '', direction: 'outbound', stop_id: null },
      }));
      if (!/^[A-Z0-9]+$/i.test(q)) {
        const stops = await searchKMBStopsByName(q);
        (stops || []).slice(0, 6).forEach(st => {
          const nm = st.name_tc || st.name_en || st.name_sc || ('站 ' + st.stop);
          out.push({
            grp: '巴士站', no: '站', name: nm, kind: 'busstop', data: { route: null, dir: null, stop: st.stop },
            fav: { type: 'bus', company: 'kmb', route: '', direction: 'outbound', stop_id: st.stop, stop_name: nm },
          });
        });
      }
      const C = await searchCTBRoute(q.toUpperCase());
      (C || []).slice(0, 4).forEach(r => out.push({
        grp: G.ctb, no: r.route, name: (r.orig_tc || '') + ' → ' + (r.dest_tc || ''), kind: 'bus', co: 'ctb', data: { route: r.route, dir: 'outbound' },
      }));
      const N = await searchNLBRoute(q);
      (N || []).slice(0, 4).forEach(r => out.push({
        grp: G.nlb, no: r.routeNo || r.routeId, name: r.name_tc || '', kind: 'nlb', co: 'nlb', data: { route: r.routeId, dir: null },
      }));
    } catch (e) {}
    if (gen !== searchGen) return;
    if (nightOnly) out.splice(0, out.length, ...out.filter(it => /^N\d/i.test(String(it.no || ''))));
    lastResults = out;
    renderSearch(out);
  }
  /* 巴士站：該站路線 + ETA 摘要 */
  async function stopRoutesText(stop) {
    try {
      const es = await getKMBETA(stop);
      const byR = {};
      (es || []).forEach(e => {
        const sec = (parseHKTime(e.eta) - Date.now()) / 1000;
        if (!(e.route in byR) || sec < byR[e.route]) byR[e.route] = sec;
      });
      return Object.keys(byR).sort((a, b) => byR[a] - byR[b]).slice(0, 3)
        .map(r => r + ' ' + (byR[r] <= 60 ? '即將' : Math.ceil(byR[r] / 60) + '分')).join(' · ');
    } catch (e) { return ''; }
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
      let eta = null, capExtra = '';
      if (it.kind === 'bus') eta = await kmbFirstSec(it.data.route, it.data.dir, it.data.stop);
      if (it.kind === 'busstop') capExtra = await stopRoutesText(it.data.stop);
      html += '<div class="row" data-i="' + items.indexOf(it) + '">'
        + '<span class="badge">' + esc(String(it.no).slice(0, 4)) + '</span>'
        + '<span class="main"><span class="nm">' + esc(it.name) + '</span>'
        + (capExtra ? '<span class="cap">' + esc(capExtra) + '</span>' : (it.cap ? '<span class="cap">' + esc(it.cap) + '</span>' : ''))
        + '</span>' + etaHtml(eta) + starBtn(it.fav) + '</div>';
    }
    box.innerHTML = html;
    bindStars(box);
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
      + etaHtml(it.eta) + starBtn(it.fav) + '</div>').join('') || '<div class="empty">沒有結果</div>';
    bindStars(box);
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
      const lrtFav = { type: 'lrt', route: LRT_STATIONS[id], station_id: Number(id), stop_name: LRT_STATIONS[id] };
      html += '<div class="grp" style="display:flex;align-items:center;justify-content:space-between">' + esc(LRT_STATIONS[id]) + starBtn(lrtFav) + '</div>';
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
    bindStars(box);
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
        + '<span class="main"><span class="nm">班次 ' + esc(bid) + '</span></span>' + etaHtml(byId[bid]) + starBtn({ type: 'mtrbus', company: 'mtr', route: q.toUpperCase(), stop_id: null }) + '</div>').join('') || '<div class="empty">沒有結果</div>';
      bindStars(box);
    } catch (e) { if (gen === searchGen) box.innerHTML = '<div class="empty">搜尋出錯</div>'; }
  }
  function openRow(r) {
    const it = lastResults[parseInt(r.dataset.i, 10)];
    if (!it) return;
    if (it.kind === 'bus' || it.kind === 'nlb') openBusDetail(it);
    else if (it.kind === 'mtr') openMTRDetail(it);
    else if (it.kind === 'busstop') openStopDetail(it.data.stop, it.name);
  }
  /* 巴士站詳情：該站全部路線 + 班次（點擊站名行進入） */
  async function openStopDetail(stop, name) {
    openSheet(name + ' 車站', '<div class="empty">載入中…</div>');
    try {
      const es = await getKMBETA(stop);
      if (!es || !es.length) { $('shBody').innerHTML = '<div class="empty">暫無班次資料</div>'; return; }
      const byR = {};
      for (const e of es) {
        const sec = (parseHKTime(e.eta) - Date.now()) / 1000;
        const k = String(e.route);
        if (!byR[k] || sec < byR[k].sec) byR[k] = { sec, dest: e.dest_tc || '' };
      }
      $('shBody').innerHTML = Object.keys(byR).sort((a, b) => byR[a].sec - byR[b].sec).map(rr => {
        const sec = byR[rr].sec;
        const lbl = rr + (byR[rr].dest ? ' · ' + byR[rr].dest : '');
        return '<div class="dstop"><span class="dseq" style="width:auto;min-width:56px;border-radius:999px;padding:0 10px">' + esc(rr) + '</span><span class="dnm">' + esc(byR[rr].dest || '') + '</span>'
          + (sec == null || sec <= 0 ? '<span class="dtm">—</span>' : (sec <= 60 ? '<span class="dtm soon">即將</span>' : '<span class="dtm ' + etaSecCls(sec) + '">' + Math.ceil(sec / 60) + ' 分</span>')) + '</div>';
      }).join('');
      onTab = () => {};
    } catch (e) { $('shBody').innerHTML = '<div class="empty">載入失敗</div>'; }
  }

  /* ---------- 巴士/港鐵 詳情（KMB/CTB/NLB 全支援） ---------- */
  const ctbNameCache = {};
  async function ctbName(sid) {
    const k = String(sid);
    if (ctbNameCache[k]) return ctbNameCache[k];
    try {
      const d = await fetchWithProxy(CTB_BASE + '/stop/' + k);
      ctbNameCache[k] = (d && d.data && (d.data.name_tc || d.data.name_en)) || ('站 ' + k);
    } catch (e) { ctbNameCache[k] = '站 ' + k; }
    return ctbNameCache[k];
  }
  async function openBusDetail(it) {
    const co = it.co || (it.fav && it.fav.company) || 'kmb';
    const route = it.data.route;
    const baseDir = it.data.dir || 'outbound';
    const dirs = co === 'nlb'
      ? [[null, '全程']]
      : [[baseDir, '去程'], [baseDir === 'inbound' ? 'outbound' : 'inbound', '回程']];
    openSheet((route || it.no) + ' 路線詳情', '<div class="empty">載入中…</div>', dirs.map(d => d[1]));
    const cache = {};
    async function loadDir(idx) {
      const dir = dirs[idx][0];
      if (cache[String(dir)]) { $('shBody').innerHTML = cache[String(dir)]; return; }
      $('shBody').innerHTML = '<div class="empty">載入中…</div>';
      try {
        let stops = [], rows = [];
        if (co === 'nlb') {
          stops = await getNLBRouteStops(route);
          for (let i = 0; i < stops.length; i += 4) {
            const rs = await Promise.all(stops.slice(i, i + 4).map(async st => {
              let ts = [];
              try { ts = (await getNLBETA(route, st.stopId)).map(x => x.etaTs).filter(Boolean).sort((a, b) => a - b); } catch (e) {}
              return { name: st.stopName_c || st.stopName_s || ('站 ' + st.stopId), ts };
            }));
            rows.push(...rs);
          }
        } else if (co === 'ctb') {
          stops = await getCTBStops(route, dir);
          const wantDir = dir === 'inbound' ? 'I' : 'O';
          for (let i = 0; i < stops.length; i += 4) {
            const rs = await Promise.all(stops.slice(i, i + 4).map(async st => {
              const sid = st.stop || st.stop_id;
              let ts = [];
              try {
                ts = (await getCTBETA(sid, route)).filter(e => (e.dir || '').toUpperCase() === wantDir)
                  .map(e => parseHKTime(e.eta)).filter(Boolean).sort((a, b) => a - b);
              } catch (e) {}
              return { name: st.name_tc || (sid ? await ctbName(sid) : ''), ts };
            }));
            rows.push(...rs);
          }
        } else {
          stops = await getKMBStops(route, dir, '1');
          const wantDir = dir === 'inbound' ? 'I' : 'O';
          for (let i = 0; i < stops.length; i += 4) {
            const rs = await Promise.all(stops.slice(i, i + 4).map(async st => {
              let ts = [];
              try {
                ts = (await getKMBETA(st.stop)).filter(e => e.route === String(route) && (e.dir || '').toUpperCase() === wantDir)
                  .map(e => parseHKTime(e.eta)).filter(Boolean).sort((a, b) => a - b);
              } catch (e) {}
              return { name: await getKMBStopName(st.stop), ts };
            }));
            rows.push(...rs);
          }
        }
        if (!rows.length) { $('shBody').innerHTML = '<div class="empty">無法載入站點</div>'; return; }
        const html = rows.map((r, i) => {
          const sec = r.ts[0] ? (r.ts[0] - Date.now()) / 1000 : null;
          return '<div class="dstop"><span class="dseq">' + (i + 1) + '</span><span class="dnm">' + esc(r.name) + '</span>' + (sec == null ? '<span class="dtm">—</span>' : (sec <= 60 ? '<span class="dtm soon">即將</span>' : '<span class="dtm ' + etaSecCls(sec) + '">' + Math.ceil(sec / 60) + ' 分</span>')) + '</div>';
        }).join('');
        cache[String(dir)] = html;
        $('shBody').innerHTML = html;
      } catch (e) { $('shBody').innerHTML = '<div class="empty">載入失敗</div>'; }
    }
    onTab = (i) => loadDir(i);
    loadDir(0);
  }
  async function openMTRDetail(it) {
    openSheet(it.name + ' 車站', '<div class="empty">載入中…</div>');
    const cells = [];
    for (const lc of Object.keys(MTR_LINE_STOPS)) {
      if (!MTR_LINE_STOPS[lc].some(x => x.code === it.data.station)) continue;
      try {
        const d = (await getMTRSchedule(lc, it.data.station)) || {};
        const dd = d[lc + '-' + it.data.station] || {};
        const up = [...(dd.UP || [])].map(t => parseHKTime(t.time)).filter(Boolean).sort((a, b) => a - b)[0];
        const dn = [...(dd.DOWN || [])].map(t => parseHKTime(t.time)).filter(Boolean).sort((a, b) => a - b)[0];
        if (up) cells.push({ line: (MTR_LINES[lc] || lc) + ' 上行', ts: up });
        if (dn) cells.push({ line: (MTR_LINES[lc] || lc) + ' 下行', ts: dn });
      } catch (e) {}
    }
    cells.sort((a, b) => a.ts - b.ts);
    $('shBody').innerHTML = cells.slice(0, 3).slice().map(c => {
      const sec = (c.ts - Date.now()) / 1000;
      return '<div class="dstop"><span class="dseq" style="width:auto;min-width:56px;border-radius:999px;padding:0 10px">' + esc(c.line) + '</span><span class="dnm">下一班</span>' + (sec == null ? '<span class="dtm">—</span>' : (sec <= 60 ? '<span class="dtm soon">即將</span>' : '<span class="dtm ' + etaSecCls(sec) + '">' + Math.ceil(sec / 60) + ' 分</span>')) + '</div>';
    }).join('') || '<div class="empty">暫無班次</div>';
  }

  /* ---------- 首頁磁貼 ---------- */
  let homeSeen = false;
  async function renderHome() {
    const tiles = $('homeTiles');    let k75pEta = '—', k75pSub = '載入中';
    try {
      const data = await getMTRBusETA('K75P');
      const stop = ((data && data.busStop) || []).find(x => String(x.busStopId || '').replace(/^K75P-/, '') === 'D010') || {};
      const secs = (stop.bus || []).map(b => parseInt(b.arrivalTimeInSecond, 10) || 0).filter(x => x > 0 && x < 108000).sort((a, b) => a - b);
      if (secs.length) k75pEta = Math.max(1, Math.ceil(secs[0] / 60)) + ' 分鐘';
      const live = new Set((data.busStop || []).flatMap(st => (st.bus || []).filter(b => b.busLocation && Number(b.busLocation.latitude)).map(b => b.busId)));
      k75pSub = '實時 ' + live.size + ' 班在路';
    } catch (e) { k75pSub = '暫無資料'; }
    /* 收藏①磁貼：首條（釘選優先）收藏的下一班 */
    let favNoTxt = '', favCapTxt = getFavorites().length + ' 條收藏';
    const favs0 = getFavorites();
    const pk = getFavShowKey();
    const fav0 = favs0.find(f => favKey(f) === pk) || favs0[0];
    if (fav0) {
      favNoTxt = favNoStr(fav0);
      try { const s0 = await favEta(fav0); favCapTxt = s0 ? Math.max(1, Math.ceil(s0 / 60)) + ' 分鐘' : '暫無班次'; }
      catch (e) { favCapTxt = '暫無班次'; }
    }
    tiles.innerHTML =
      '<button class="tile blue wide shine" data-open="k75p">'
      + '<div class="mini-map"><div class="road"></div><span class="st" style="left:10%;top:56%"></span><span class="st" style="left:38%;top:44%"></span><span class="st" style="left:68%;top:36%"></span><span class="bus"></span><span class="no">K75P</span><span class="eta">' + esc(k75pEta) + '</span></div>'
      + '<span class="lab">天瑞 ↺ 洪水橋 · ' + esc(k75pSub) + '</span></button>'
      + '<button class="tile cyan shine" data-open="favs"><span class="lab">我的收藏</span><b>' + esc(favNoTxt || '★') + '</b><span class="cap">' + esc(favCapTxt) + '</span></button>'
      + '<button class="tile warn shine" data-open="weather"><span class="lab">天氣</span><b id="wTemp">--°</b><span class="cap">載入中</span></button>'
      + '<button class="tile cyan shine" data-open="sushi"><span class="lab">壽司郎</span><b id="sushiMini">—</b></button>'
      + '<button class="tile shine" data-open="map"><span class="lab">路線圖</span><b>屯馬綫</b><span class="cap">全線候車</span></button>';
    tiles.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.open;
      if (k === 'k75p') openK75P();
      else if (k === 'weather') openWeatherPage();
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
  /* ---------- 天氣（完整：警告/描述/濕度/雨量/紫外線/三天溫差） ---------- */
  const WEATHER_UV_API = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=uvindex&lang=tc';
  const SEVERE_RE = /雨|颱風|風暴|雷暴|山泥|酷熱|寒冷|霜凍|海嘯|水浸/;
  let weatherCache = null, weatherCacheAt = 0;
  async function fetchWeather() {
    if (weatherCache && Date.now() - weatherCacheAt < 5 * 60 * 1000) return weatherCache;
    const w = { temp: null, humid: null, rain: null, uv: null, desc: '', severe: [], mild: [], days: [], at: '' };
    try {
      const r = await fetchWithProxy(WEATHER_API);
      const td = (r && r.temperature && r.temperature.data) || [];
      const pick = td.find(x => /天水|元朗|屯門|荃灣/.test(x.place)) || td[0];
      w.temp = pick ? Math.round(pick.value) : null;
      w.humid = r.humidity && r.humidity.data && r.humidity.data[0] ? Math.round(r.humidity.data[0].value) : null;
      w.rain = r.rainfall && r.rainfall.data && r.rainfall.data[0] ? Number(r.rainfall.data[0].max || 0) : null;
      for (const msg of ((r && r.warningMessage) || [])) {
        const s = String(msg);
        (SEVERE_RE.test(s) ? w.severe : w.mild).push(s);
      }
      w.desc = (r && HKO_ICONS[r.icon]) || '';
      w.at = r && r.updateTime ? r.updateTime.slice(11, 16) : '';
    } catch (e) {}
    try {
      const u = await fetchWithProxy(WEATHER_UV_API);
      const c = (u && u.data && u.data[0]) || u;
      if (c && c.value) w.uv = Math.round(c.value);
    } catch (e) {}
    try {
      const f = await fetchWithProxy(WEATHER_FND_API);
      /* HKO fnd：字段为 weatherForecast[]（旧版 forecastPeriod 已弃用），
         每项含 week/forecastMaxtemp/forecastMintemp/forecastMaxrh/Minrh/ForecastIcon */
      const fc = (f && (f.weatherForecast || f.forecast || f.forecastPeriod)) || [];
      w.days = fc.slice(0, 3).map(d => ({
        date: typeof d.forecastDate === 'string' && d.forecastDate.length === 8
          ? Number(d.forecastDate.slice(4, 6)) + '/' + Number(d.forecastDate.slice(6, 8)) : '',
        week: d.week || '',
        max: d.forecastMaxtemp && d.forecastMaxtemp.value,
        min: d.forecastMintemp && d.forecastMintemp.value,
        rh: d.forecastMaxrh && d.forecastMinrh
          ? { max: Math.round(d.forecastMaxrh.value), min: Math.round(d.forecastMinrh.value) } : null,
        desc: (d.forecastWeather && (d.forecastWeather.tc || d.forecastWeather)) || '',
        icon: d.ForecastIcon != null ? String(d.ForecastIcon) : '',
      }));
    } catch (e) {}
    weatherCache = w; weatherCacheAt = Date.now();
    return w;
  }
  function warnBarHtml(w) {
    const item = (s, cls) => '<div class="wwarn ' + cls + '">⚠ ' + esc(s) + '</div>';
    return (w.severe || w.mild).map(s => SEVERE_RE.test(s) ? item(s, 'severe') : item(s, 'mild')).join('');
  }
  async function loadWeather() {
    const w = await fetchWeather();
    const el = $('wTemp');
    if (el && w.temp != null) el.textContent = w.temp + '°';
    const cap = el && el.parentElement.querySelector('.cap');
    if (cap) cap.textContent = w.desc || (w.humid != null ? '濕度 ' + w.humid + '%' : '');
  }
  function weatherSheetHtml(w) {
    const wn = warnBarHtml(w);
    const now = '<div class="wcard"><span class="desc">現在 · ' + esc(w.desc || '—') + '</span>'
      + '<div class="now">' + (w.temp != null ? w.temp + '°' : '--°') + '</div>'
      + '<div class="desc">' + [
        w.humid != null ? '濕度 ' + w.humid + '%' : '',
        w.rain != null ? '雨量 ' + w.rain + 'mm' : '',
        w.uv != null ? '紫外線 ' + w.uv : '',
      ].filter(Boolean).join(' · ') || '—' + '</div></div>';
    const days = '<div class="grp">未來三天</div><div class="wdays">'
      + (w.days.length ? w.days.map((d, i) => {
        const em = d.icon && HKO_ICON_EMOJI[d.icon] ? HKO_ICON_EMOJI[d.icon] : '';
        const ic = d.icon && HKO_ICONS[d.icon] ? HKO_ICONS[d.icon] : '';
        const label = (['今天', '明天', '後天'][i] || '') + (d.week ? ' · ' + d.week : '') + (d.date ? ' · ' + d.date : '');
        return '<div class="wday"><span class="n">' + esc(label) + '</span>'
          + '<div class="d">' + (d.max != null ? Math.round(d.max) + '°' : '--') + '<small>' + (d.min != null ? '/' + Math.round(d.min) + '°' : '') + '</small></div>'
          + '<span class="n wx">' + esc(em + ' ' + (ic || d.desc)) + '</span>'
          + (d.rh ? '<span class="n">濕度 ' + d.rh.min + '–' + d.rh.max + '%</span>' : '')
          + '</div>';
      }).join('') : '<div class="wday"><span class="n">—</span></div>')
      + '</div>';
    return wn + now + days + (w.at ? '<div class="empty" style="text-align:left;padding:10px 4px 4px;font-size:12px">更新 ' + esc(w.at) + '</div>' : '');
  }
  async function openWeatherPage() {
    /* 秒開：先開 sheet 顯示載入中，再填充（配合 5 分鐘緩存，通常瞬間完成） */
    openSheet('天氣', '<div class="empty">載入中…</div>');
    onTab = () => {};
    const w = await fetchWeather();
    $('shBody').innerHTML = weatherSheetHtml(w);
  }

  /* ---------- 收藏 ---------- */
  function favMeta(f) {
    return f.type === 'bus' ? ('公交 ' + (f.company === 'ctb' ? '城巴' : '九巴 ' + f.route)) : f.type === 'mtr' ? ((f.lineName || f.line || '') + ' 線') : f.type === 'lrt' ? (f.stop_name || '輕鐵站') : f.type === 'mtrbus' ? ('港鐵巴士 ' + f.route) : '收藏';
  }
  const kmbStopCache = {};
  async function resolveKMBStop(route, dir) {
    const k = route + '|' + dir;
    if (kmbStopCache[k] === undefined) {
      try { const s = await getKMBStops(route, dir, '1'); kmbStopCache[k] = (s && s[0] && s[0].stop) || null; }
      catch (e) { kmbStopCache[k] = null; }
    }
    return kmbStopCache[k];
  }
  async function favEta(f) {
    try {
      if (f.type === 'bus') {
        const sid = f.stop_id || await resolveKMBStop(f.route, f.direction || 'outbound');
        if (!sid) return null;
        const es = await getKMBETA(sid);
        const e = (es || []).filter(x => (!f.route || x.route === String(f.route)) && (x.dir || '').toUpperCase() === (f.direction === 'inbound' ? 'I' : 'O')).sort((a, b) => parseHKTime(a.eta) - parseHKTime(b.eta))[0];
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
      if (f.type === 'mtrbus' && f.route) {
        const data = await getMTRBusETA(f.route);
        let best = null;
        for (const st of ((data && data.busStop) || [])) for (const b of (st.bus || [])) {
          const sec = parseInt(b.arrivalTimeInSecond, 10) || 0;
          if (sec > 0 && sec < 108000 && (best === null || sec < best)) best = sec;
        }
        return best;
      }
    } catch (e) {}
    return null;
  }
  /* 收藏卡多班次線（下一班/次班/三班） */
  async function favLines(f) {
    const rows = [];
    try {
      if (f.type === 'bus') {
        const sid = f.stop_id || await resolveKMBStop(f.route, f.direction || 'outbound');
        if (!sid) return '';
        const es = await getKMBETA(sid);
        (es || []).filter(x => (!f.route || x.route === String(f.route)) && (x.dir || '').toUpperCase() === (f.direction === 'inbound' ? 'I' : 'O'))
          .sort((a, b) => parseHKTime(a.eta) - parseHKTime(b.eta)).slice(0, 3).forEach(e => {
            rows.push({ label: e.dest_tc || '下一班', sec: (parseHKTime(e.eta) - Date.now()) / 1000 });
          });
      } else if (f.type === 'mtr' && f.station_id) {
        const lcs = Object.keys(MTR_LINE_STOPS).filter(lc => MTR_LINE_STOPS[lc].some(x => x.code === f.station_id)).slice(0, 2);
        for (const lc of lcs) {
          const d = (await getMTRSchedule(lc, f.station_id)) || {};
          const dd = d[lc + '-' + f.station_id] || {};
          const up = [...(dd.UP || [])].map(t => parseHKTime(t.time)).filter(Boolean).sort((a, b) => a - b)[0];
          const dn = [...(dd.DOWN || [])].map(t => parseHKTime(t.time)).filter(Boolean).sort((a, b) => a - b)[0];
          if (up) rows.push({ label: (MTR_LINES[lc] || lc) + ' 上行', sec: (up - Date.now()) / 1000 });
          if (dn) rows.push({ label: (MTR_LINES[lc] || lc) + ' 下行', sec: (dn - Date.now()) / 1000 });
        }
        rows.sort((a, b) => a.sec - b.sec);
        rows.splice(3);
      } else if (f.type === 'lrt' && f.station_id != null) {
        const es = await getLRTEta(Number(f.station_id));
        (es || []).slice(0, 3).forEach(e => rows.push({ label: e.routeNo + ' · 往 ' + e.dest, sec: e.mins * 60 }));
      } else if (f.type === 'mtrbus' && f.route) {
        const data = await getMTRBusETA(f.route);
        const byId = {};
        for (const st of ((data && data.busStop) || [])) for (const b of (st.bus || [])) {
          const bid = String(b.busId || '?');
          const sec = parseInt(b.arrivalTimeInSecond, 10) || 0;
          if (sec > 0 && sec < 108000 && sec < (byId[bid] === undefined ? Infinity : byId[bid])) byId[bid] = sec;
        }
        Object.keys(byId).sort((a, b) => byId[a] - byId[b]).slice(0, 3).forEach((bid, i) => rows.push({ label: '班次 ' + bid, sec: byId[bid] }));
      }
    } catch (e) {}
    return rows.map(r => '<div class="fline"><span class="l">' + esc(r.label) + '</span><span class="v' + etaSecCls(r.sec) + '">' + (r.sec == null ? '—' : Math.max(1, Math.ceil(r.sec / 60)) + ' 分') + '</span></div>').join('');
  }
  async function renderFavs() {
    const list = getFavorites();
    const box = $('favList');
    if (!list.length) {
      box.innerHTML = '<div class="empty">暫無收藏\n在搜尋結果點 ☆ 加入</div>';
      box.style.cursor = 'default';
      return;
    }
    let html = '';
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      const sec = await favEta(f);
      const pinned = getFavShowKey() === favKey(f);
      const name = f.stop_name || f.station_name || f.name || f.dest || f.orig || f.route || f.lineName || '';
      const lines = await favLines(f);
      html += '<div class="fcard shine" data-i="' + i + '"><div class="fh"><span class="no">' + esc(favNoStr(f)) + '</span><span class="tag">' + esc(favMeta(f)) + '</span>'
        + '<span class="actions"><button class="bt' + (pinned ? ' pin' : '') + '" data-a="pin" data-i="' + i + '">' + (pinned ? '✓ 釘選' : '釘選') + '</button>'
        + (f.type === 'bus' && f.route ? '<button class="bt" data-a="pick" data-i="' + i + '">換站</button>' : '')
        + (sec == null ? '<button class="bt" data-a="retry" data-i="' + i + '">重試</button>' : '')
        + '<button class="bt x" data-a="del" data-i="' + i + '">✕</button></span></div>'
        + '<div class="dest">' + esc(name) + '</div>'
        + '<div class="sub">' + esc(f.direction === 'inbound' ? '回程' : '去程') + '</div>'
        + '<div class="big"' + (sec ? ' data-sec="' + Math.ceil(sec / 60) + '"' : '') + '>' + (sec ? Math.max(1, Math.ceil(sec / 60)) + '<small> 分鐘</small>' : '—') + '</div>'
        + (lines ? '<div class="flines">' + lines + '</div>' : '')
        + '<div class="bar"><i style="width:' + Math.min(100, (sec || 0) / 6) + '%"></i></div></div>';
    }
    box.innerHTML = html;
    box.style.cursor = '';
    box.querySelectorAll('button[data-a]').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = parseInt(b.dataset.i, 10);
      const fs2 = getFavorites();
      if (b.dataset.a === 'pin') { try { localStorage.setItem('wp8concept_pinned_fav', favKey(fs2[i])); } catch (err) {} }
      else if (b.dataset.a === 'del') { fs2.splice(i, 1); saveFavorites(fs2); }
      else if (b.dataset.a === 'retry') { renderFavs(); return; }
      else if (b.dataset.a === 'pick') { openStopPicker(fs2[i], i); return; }
      renderFavs();
    }));
    box.querySelectorAll('.fcard').forEach(card => card.addEventListener('click', () => {
      const f = getFavorites()[parseInt(card.dataset.i, 10)];
      if (f && f.type === 'bus' && f.route) openBusDetail({ data: { route: f.route, dir: f.direction || 'outbound' }, no: f.route });
      else if (f && f.type === 'mtr') openMTRDetail({ name: f.station_name || f.station_id, data: { station: f.station_id } });
    }));
    bindFavDrag(box);
    bindStars(box);
  }
  function favNoStr(f) { return f.route || (f.lineName || f.line || 'MTR'); }
  /* 換站：站點選擇器（該路線前 8 站） */
  async function openStopPicker(f, i) {
    let stops = [];
    try { stops = await getKMBStops(f.route, f.direction || 'outbound', '1'); } catch (e) {}
    openSheet('換站 · ' + f.route, '<div class="empty">載入中…</div>');
    let html = '';
    for (const st of stops.slice(0, 10)) {
      html += '<div class="dstop" data-stop="' + esc(st.stop) + '" data-name="' + esc(st.name_tc || st.name_en || '') + '"><span class="dseq">›</span><span class="dnm">' + esc(st.name_tc || st.name_en || st.stop) + '</span></div>';
    }
    $('shBody').innerHTML = html || '<div class="empty">無法載入站點</div>';
    $('shBody').querySelectorAll('.dstop').forEach(row => row.addEventListener('click', () => {
      const favs = getFavorites();
      if (favs[i]) { favs[i].stop_id = row.dataset.stop; favs[i].stop_name = row.dataset.name; saveFavorites(favs); closeSheet(); renderFavs(); }
    }));
    onTab = () => {};
  }
  /* 收藏拖拽排序（長按 450ms 拖動，鬆開保存） */
  function bindFavDrag(box) {
    if (box.dataset.dragBound) return;
    box.dataset.dragBound = '1';
    let el = null, sy = 0, timer = null, from = -1, active = false, moved = false;
    const cards = () => [...box.querySelectorAll('.fcard')];
    const idx = (c) => cards().indexOf(c);
    const detach = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      if (!el || !active) { el = null; return; }
      if (moved && from >= 0) {
        const to = idx(el);
        if (to >= 0 && from !== to) {
          const favs = getFavorites();
          const item = favs.splice(from, 1)[0];
          favs.splice(to, 0, item);
          saveFavorites(favs);
          renderFavs();
        }
      }
      el.classList.remove('dragging');
      el.style.transform = ''; el.style.zIndex = ''; el.style.position = '';
      el = null; active = false; moved = false;
    };
    box.addEventListener('touchstart', (e) => {
      const c = e.target.closest ? e.target.closest('.fcard') : null;
      if (!c || (e.target.closest && e.target.closest('button'))) return;
      el = c; sy = e.touches[0].clientY; moved = false;
      timer = setTimeout(() => { if (el) { active = true; from = idx(el); el.classList.add('dragging'); el.style.position = 'relative'; el.style.zIndex = '9'; el.style.transform = 'translateY(0)'; } }, 450);
    }, { passive: true });
    box.addEventListener('touchmove', (e) => {
      if (!el) return;
      const dy = e.touches[0].clientY - sy;
      if (!active) { if (Math.abs(dy) > 12) { clearTimeout(timer); timer = null; el = null; } return; }
      moved = true;
      if (e.cancelable) e.preventDefault();
      el.style.transform = 'translateY(' + dy + 'px)';
      const mid = el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;
      for (const c of cards()) {
        if (c === el) continue;
        const r = c.getBoundingClientRect();
        if (mid < r.top + r.height / 2) { box.insertBefore(el, c); break; }
        if (c === cards()[cards().length - 1] && mid > r.top + r.height / 2) box.appendChild(el);
      }
    }, { passive: false });
    box.addEventListener('touchend', detach);
    box.addEventListener('touchcancel', detach);
  }

  /* ---------- 壽司郎（先試實時，失敗用離線快照） ---------- */
  let sushiDone = false;
  async function renderSushi(forceLive) {
    sushiDone = true;
    let stores = SUSHIRO_SNAPSHOT.filter(s => s.area === '元朗區' || s.area === '屯門區');
    let note = SUSHIRO_SNAPSHOT_AT + ' 抓取 · 離線快照';
    if (forceLive !== false) {
      for (const u of [SUSHIRO_PROXY(SUSHIRO_STORE_API), CORS_PROXIES[0](SUSHIRO_STORE_API)]) {
        try {
          const r = await fetch(u, { signal: AbortSignal.timeout(7000) });
          if (!r.ok) continue;
          const j = await r.json();
          if (Array.isArray(j) && j.length) { stores = j.filter(s => s.area === '元朗區' || s.area === '屯門區'); note = '實時 · ' + new Date().toTimeString().slice(0, 5); break; }
        } catch (e) {}
      }
    }
    stores = stores.sort((a, b) => (parseInt(b.waitingGroup, 10) || 0) - (parseInt(a.waitingGroup, 10) || 0));
    $('sushiList').innerHTML = '<div style="font-size:12px;color:var(--text2);padding:2px 4px 10px">' + esc(note) + '</div>'
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
    box.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:2px 4px 8px">膠囊＝各方向下一班（分:秒）· 班表推算</div>'
      + stops.map((s, i) => {
        const serving = all.filter(x => MTR_LINE_STOPS[x].some(y => y.code === s.code));
        return '<div class="row" style="min-height:56px"><span class="badge" style="background:rgba(0,120,215,.18);box-shadow:none">' + (i + 1) + '</span>'
          + '<span class="main"><span class="nm">' + esc(s.name) + '</span>' + (serving.length > 1 ? '<span class="cap">轉乘 ' + esc(serving.map(x => MTR_LINES[x]).join(' / ')) + '</span>' : '') + '<span class="cap" data-dcap="' + s.code + '"></span></span>'
          + '<span class="eta" style="font-size:15px" data-sid="' + s.code + '">—</span></div>';
      }).join('');
    const schedMap = await lineSchedules(stops, lc);
    const now = Date.now();
    stops.forEach(s => {
      const row = box.querySelector('[data-sid="' + s.code + '"]');
      if (!row) return;
      const d = schedMap[s.code] || {};
      const up = [...(d.UP || [])].filter(t => t > now).sort((a, b) => a - b)[0];
      const dn = [...(d.DOWN || [])].filter(t => t > now).sort((a, b) => a - b)[0];
      const upSec = up ? Math.round((up - now) / 1000) : null;
      const dnSec = dn ? Math.round((dn - now) / 1000) : null;
      const cap = row.parentElement.querySelector('[data-dcap="' + s.code + '"]');
      if (cap) {
        cap.innerHTML = (upSec != null ? '<span style="color:var(--accent)">上行 ' + mmss(upSec) + '</span>' : '')
          + (upSec != null && dnSec != null ? ' · ' : '')
          + (dnSec != null ? '下行 ' + mmss(dnSec) : '');
      }
      if (upSec != null && (dnSec == null || upSec <= dnSec)) { row.dataset.sec = upSec; row.dataset.dir = '上 '; }
      else if (dnSec != null) { row.dataset.sec = dnSec; row.dataset.dir = '下 '; }
      row.textContent = (row.dataset.dir || '') + (row.dataset.sec != null ? mmss(Math.round(row.dataset.sec)) : '—');
    });
    clearInterval(mtrTick);
    mtrTick = setInterval(() => {
      if (curPane !== 'map') return;
      const el0 = Math.floor((Date.now() - now) / 1000);
      box.querySelectorAll('.eta[data-sec]').forEach(el => { el.textContent = (el.dataset.dir || '') + mmss(Math.max(0, parseInt(el.dataset.sec, 10) - el0)); });
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

  /* ---------- K75P U形路線圖頁（無實景地圖：起終點 + 每班車沿線位置，同屯馬線式線路圖） ---------- */
  let kState = null, kSel = -1, kTick = null;
  const kCoords = {};
  Object.keys(K75P_STOP_COORDS).forEach(k => { const c = K75P_STOP_COORDS[k]; if (c && c.lat) kCoords[k] = { lat: c.lat, lng: c.lng }; });
  const KN = K75P_STOPS.length;
  const kTurn = K75P_STOPS.findIndex(s => /洪水橋站/.test(s.name));   /* 折返點 */
  const busSm = {}, busAt = {};   /* 每車平滑位置：GPS 抖動不再來回亂跑 */
  /* U 形幾何：左臂=去程（天瑞→洪水橋）· 右臂=回程（洪水橋→天瑞）· 底部圓弧折返 */
  const U = { W: 380, H: 300, xL: 56, xR: 324, xM: 190, yTop: 24, yBot: 246, yCurve: 280 };
  const kTA = (kTurn - 1) / (KN - 1), kTB = (kTurn + 1) / (KN - 1);
  function kUXY(t) {
    t = Math.max(0, Math.min(1, t));
    if (t <= kTA) { const u = t / kTA; return [U.xL, U.yTop + u * (U.yBot - U.yTop)]; }
    if (t >= kTB) { const u = (t - kTB) / (1 - kTB); return [U.xR, U.yBot - u * (U.yBot - U.yTop)]; }
    const u = (t - kTA) / (kTB - kTA), q = 1 - u;
    return [q * q * U.xL + 2 * q * u * U.xM + u * u * U.xR, q * q * U.yBot + 2 * q * u * U.yCurve + u * u * U.yBot];
  }
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
    for (let i = 0; i < KN - 1; i++) {
      const a = kCoords[K75P_STOPS[i].id], b = kCoords[K75P_STOPS[i + 1].id];
      if (!a || !b) continue;
      const r = segFrac(a, b, p);
      const score = r.d2 + 3000 * Math.abs(i + r.f - ref);
      if (!best || score < best.score) best = { score, d2: r.d2, pos: i + r.f };
    }
    return best && Math.sqrt(best.d2) < 400 ? best.pos : null;
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
        const id = String(b.busId || '?');
        if (!byBus[id]) byBus[id] = { live: false, e: [] };
        if (live) byBus[id].live = true;
        byBus[id].e.push({ idx: i, sec, loc: live ? { lat: Number(loc.latitude), lng: Number(loc.longitude) } : null });
        list.push({ id, sec, live });
      }
      stopBuses.push(list.sort((a, b) => a.sec - b.sec));
    }
    const markers = [], chips = [];
    const now = Date.now();
    for (const id of Object.keys(byBus)) {
      const b = byBus[id];
      if (!b.e.length) continue;
      const es = b.e.slice().sort((a, c) => a.sec - c.sec);
      const next = es[0];
      chips.push({ idx: next.idx, sec: next.sec, live: b.live });
      const n2 = es.find(x => x.idx !== next.idx && x.sec > next.sec);
      const gap = n2 ? Math.max(30, n2.sec - next.sec) : 120;
      const f = next.sec === 0 ? 1 : Math.max(0, Math.min(1, (gap - next.sec) / gap));
      const ref = next.idx === 0 ? (KN - 1) + f : next.idx - 1 + f;
      let pos = (b.live && next.loc) ? gpsPos(next.loc, ref) : null;
      if (pos == null) pos = ref;
      /* 平滑 + 只進不退：GPS 抖動不再讓班次來回亂跑 */
      if (busSm[id] != null && now - (busAt[id] || 0) < 90000) {
        let d = pos - busSm[id];
        if (d < -0.3) d = -0.3;
        if (d > 0.9) d = 0.9;
        pos = busSm[id] + d * 0.55;
      }
      pos = Math.max(0, Math.min(KN - 1, pos));
      busSm[id] = pos; busAt[id] = now;
      markers.push({ id, pos, nextIdx: next.idx, nextName: K75P_STOPS[next.idx].name, nextSec: next.sec, gap: Math.max(10, gap) });
    }
    return { markers, chips, stopBuses };
  }
  /* U 形路線圖渲染（純 SVG，無第三方地圖庫） */
  let kRouteSVG = null, kBusLayer = null, kStDots = [], busEls = {};
  function buildKRoute() {
    const box = $('kroute');
    const P = (t) => { const p = kUXY(t); return p[0].toFixed(1) + ',' + p[1].toFixed(1); };
    const d = 'M' + P(0) + ' L' + P(kTA) + ' Q' + U.xM + ',' + U.yCurve + ' ' + P(kTB) + ' L' + P(1);
    let s = '<svg viewBox="0 0 380 300" preserveAspectRatio="xMidYMid meet">';
    s += '<path class="kline2" d="' + d + '"/><path class="kline" d="' + d + '"/>';
    s += '<text class="ktag" x="' + (U.xL - 10) + '" y="' + (U.yTop - 9) + '" text-anchor="end">起點</text>'
      + '<text class="ktag" x="' + (U.xR + 10) + '" y="' + (U.yTop - 9) + '" text-anchor="start">終點</text>';
    for (let i = 0; i < KN; i++) {
      const p = kUXY(i / (KN - 1));
      const main = i === 0 || i === KN - 1 || i === kTurn;
      const r = main ? (i === kTurn ? 7 : 6) : 4;
      s += '<circle class="kst' + (main ? ' main' : '') + '" data-i="' + i + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + r + '"/>';
      let lx, ly, anchor;
      if (i === kTurn) { lx = U.xM; ly = p[1] - 13; anchor = 'middle'; }
      else if (i < kTurn) { lx = U.xL - 9; ly = p[1] + 3; anchor = 'end'; }
      else { lx = U.xR + 9; ly = p[1] + 3; anchor = 'start'; }
      s += '<text class="kname' + (main ? ' main' : '') + '" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + anchor + '">' + esc(K75P_STOPS[i].name) + '</text>';
    }
    s += '<g id="kbuses"></g></svg>';
    box.innerHTML = s;
    kRouteSVG = box.querySelector('svg');
    kBusLayer = box.querySelector('#kbuses');
    kStDots = [...box.querySelectorAll('.kst')];
    kStDots.forEach(dt => dt.addEventListener('click', () => selectKStop(Number(dt.dataset.i))));
  }
  function updateKBuses(markers) {
    if (!kBusLayer) return;
    const seen = new Set();
    for (const m of markers) {
      const p = kUXY(m.pos / (KN - 1));
      const k = 'b' + m.id;
      seen.add(k);
      let el = busEls[k];
      if (!el) {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        el.setAttribute('class', 'kbus');
        el.innerHTML = '<circle class="kglow" r="11"/><rect x="-14" y="-8" width="28" height="10" rx="2" fill="#F4F6F8" stroke="#33537B"/><rect x="-14" y="-3.4" width="28" height="2.6" style="fill:var(--accent)"/><rect x="-11" y="2.5" width="5" height="3.5" fill="#1B1F27"/><rect x="6" y="2.5" width="5" height="3.5" fill="#1B1F27"/><rect x="-9" y="-6.8" width="9" height="2.4" fill="#33537B"/><rect x="2" y="-6.8" width="6" height="2.4" fill="#33537B"/><title>' + esc('巴士 ' + m.id) + '</title>';
        kBusLayer.appendChild(el);
        busEls[k] = el;
        el.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')');
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
      } else {
        el.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')');
      }
    }
    Object.keys(busEls).forEach(kk => { if (!seen.has(kk)) { busEls[kk].remove(); delete busEls[kk]; } });
  }
  async function openK75P() {
    const page = $('k75pPage');
    page.classList.add('open');
    if (!kRouteSVG) buildKRoute();
    renderK75P();
    clearInterval(kTick);
    kTick = setInterval(renderK75P, 20000);
  }
  $('kClose').addEventListener('click', () => { $('k75pPage').classList.remove('open'); clearInterval(kTick); });
  $('k75pPage').addEventListener('click', (e) => {
    if (e.target.closest('.krow, .kcard, .kstatus, .kpanel, .khead, #kroute, #kbody')) return;
    $('k75pPage').classList.remove('open');
    clearInterval(kTick);
  });
  async function renderK75P() {
    try {
      const data = await getMTRBusETA('K75P');
      kState = kModel(data);
      const { markers, chips } = kState;
      updateKBuses(markers);
      const ks = $('kStat');
      if (ks) ks.textContent = '實時 ' + markers.length + ' 班';
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
    } catch (e) {}
  }
  function selectKStop(i) {
    kSel = i;
    const pn = $('kpanel'), kn = $('kpn'), kr = $('krows');
    if (!pn || !kr) return;
    pn.hidden = false;
    kn.textContent = K75P_STOPS[i].name + (i === 0 ? '（起點）' : i === KN - 1 ? '（終點）' : i === kTurn ? '（折返）' : '');
    const rows = (kState && kState.stopBuses[i] || []).slice(0, 3);
    kr.innerHTML = rows.map((b, k) => '<div class="krow"><span class="no">' + (['下一班', '次班', '三班'][k] || (k + 1)) + '</span><span class="bus">巴士 <b>' + esc(b.id) + '</b> <span class="ktag' + (b.live ? '' : ' off') + '">' + (b.live ? 'GPS' : '定時') + '</span></span><span class="eta"' + (b.sec === 0 ? '' : ' data-sec="' + Math.ceil(b.sec / 60) + '"') + '>' + (b.sec === 0 ? '00:00' : mmss(b.sec)) + '</span></div>').join('')
      || '<div class="krow"><span class="no">—</span><span class="bus">暫無班次</span></div>';
    kStDots.forEach((dt, kk) => {
      dt.classList.toggle('sel', kk === i);
      dt.setAttribute('r', kk === i ? 8 : (kk === 0 || kk === KN - 1 ? 6 : kk === kTurn ? 7 : 4));
    });
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
      + '<div class="setrow"><span class="l">高對比<small class="cap">純黑白 · 2px 描邊</small></span><button class="sw ' + (cfg.hc ? 'on' : '') + '" data-hc></button></div>'
      + '<div class="setrow"><span class="l">減少動效<small class="cap">流光 · 波紋 · 光斑 · 脈衝</small></span><button class="sw ' + (cfg.fx ? 'on' : '') + '" data-fx></button></div>'
      + '<div class="grp">出行</div>'
      + '<div class="setrow"><span class="l">自動重新整理<small class="cap">首頁磁貼</small></span>' + seg('refresh', [['30', '30s'], ['60', '60s'], ['0', '關']], String(cfg.refresh)) + '</div>'
      + '<div class="setrow"><span class="l">版本<small class="cap">WP2026 全新界面</small></span><span style="font-size:13px;color:var(--text2)">Beta 0.2</span></div>';
    box.querySelectorAll('button[data-k]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.k === 'theme') cfg.theme = b.dataset.v;
      if (b.dataset.k === 'accent') cfg.accent = b.dataset.v;
      if (b.dataset.k === 'refresh') cfg.refresh = Number(b.dataset.v);
      saveCfg(); applyCfg(); renderSettings();
    }));
    box.querySelectorAll('button[data-fs]').forEach(b => b.addEventListener('click', () => {
      fontLevel = Math.max(0, Math.min(FONT_LEVELS.length - 1, fontLevel + Number(b.dataset.fs)));
      cfg.font = FONT_LEVELS[fontLevel];
      saveCfg(); applyCfg(); renderSettings();
    }));
    box.querySelectorAll('[data-fx]').forEach(b => b.addEventListener('click', () => {
      cfg.fx = !cfg.fx; saveCfg(); applyCfg(); renderSettings();
    }));
    box.querySelectorAll('[data-hc]').forEach(b => b.addEventListener('click', () => {
      cfg.hc = !cfg.hc; saveCfg(); applyCfg(); renderSettings();
    }));
  }

  /* ---------- 手動刷新 + 數據新鮮度 ---------- */
  function stampSub() {
    const s = $('tbSub');
    if (s) s.textContent = '更新 ' + new Date().toTimeString().slice(0, 5) + ' · 實時巴士 · 港鐵 · 輕鐵';
  }
  async function refreshNow() {
    await renderHome();
    if (curPane === 'favs') renderFavs();
    if (curPane === 'sushi') renderSushi();
    stampSub();
  }
  $('tbRefresh').addEventListener('click', refreshNow);

  /* ---------- 啟動 ---------- */
  renderHome();
  renderSettings();
  stampSub();
  const refreshSec = (cfg.refresh || 30) * 1000;
  setInterval(() => { if (cfg.refresh > 0) { renderHome(); stampSub(); } }, refreshSec);
})();
