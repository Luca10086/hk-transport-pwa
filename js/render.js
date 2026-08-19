/* 森友出行手册 - 渲染与业务（搜索/结果卡/收藏/天氣/寿司郎/K75P/路線详情） */

/* ==========================================================================
   Search Logic
   ========================================================================== */

/** Main search function */
async function doSearch() {
  const input = document.getElementById('searchInput').value.trim();
  if (!input) return;

  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div>' + t('loading.search') + '</div>';
  setStatus('loading', t('loading.search'));

  if (currentTransport === 'bus') {
    await searchBusRoute(input, resultsContainer);
  } else if (currentTransport === 'mtrbus') {
    await searchMTRBus(input, resultsContainer);
  } else if (currentTransport === 'lrt') {
    await searchLRT(input, resultsContainer);
  } else {
    await searchMTRStation(input, resultsContainer);
  }
}

/** 按站名搜索巴士站（KMB 全量表），显示各站牌的所有路线到站 */
async function searchBusStopName(query, container, gen) {
  const stops = await searchKMBStopsByName(query);
  if (gen !== container._gen) return;
  if (!stops.length) {
    container.innerHTML = '<div class="empty-hint">找不到巴士站「' + escapeHtml(query) + '」，請輸入站名（如 中環、旺角）</div>';
    setStatus('ok');
    return;
  }
  const results = await Promise.all(stops.slice(0, 8).map(async (st) => {
    const etas = await getKMBETA(st.stop);
    return { stop: st, etas: etas.filter(e => e.eta) };
  }));
  if (gen !== container._gen) return;
  container.innerHTML = '<div class="card-grid">' + results.map(r => stopCardHTML(r)).join('') + '</div>';
  setStatus('ok');
}

/** 生成一张巴士站牌卡（站名 + 各路线下两班） */
function stopCardHTML({ stop, etas }) {
  const name = stop.name_tc || stop.name_en || String(stop.stop || '');
  /* 按路线聚合，取每条路线下一班 */
  const byRoute = {};
  for (const e of etas) {
    const key = String(e.route) + '|' + (e.dir || '');
    if (!byRoute[key]) byRoute[key] = e;
  }
  const routes = Object.values(byRoute)
    .map(e => ({ route: e.route, dest: e.dest_tc || e.dest_en || '', ts: parseHKTime(e.eta) / 1000 }))
    .sort((a, b) => (a.ts || Infinity) - (b.ts || Infinity))
    .slice(0, 6);
  const rows = routes.map(r => {
    const mins = r.ts ? minsFromNow(r.ts) : '';
    const cls = r.ts ? etaColorClass(r.ts) : '';
    return '<div class="stop-route"><span class="sr-no">' + escapeHtml(String(r.route)) + '</span>'
      + '<span class="sr-dest">' + escapeHtml(r.dest) + '</span>'
      + '<span class="sr-eta ' + cls + '">' + (r.ts ? mins : '—') + '</span></div>';
  }).join('');
  return '<div class="transport-card route-card stop-card">'
    + '<div class="rc-head"><span class="rc-no">🚏</span><span class="rc-tag">巴士站</span></div>'
    + '<div class="rc-name">' + escapeHtml(name) + '</div>'
    + '<div class="stop-routes">' + (rows || '<div class="stop-route stop-empty">暫無班次</div>') + '</div>'
    + '</div>';
}

/** Search bus routes across KMB and CTB（中文查询走站名搜索） */
async function searchBusRoute(query, container) {
  container._gen = (container._gen || 0) + 1; const gen = container._gen;
  /* 中文/非路线号 → 按站名搜索巴士站 */
  if (/[\u4e00-\u9fff]/.test(query)) {
    await searchBusStopName(query, container, gen);
    return;
  }
  const routeNum = query.toUpperCase().replace(/\s/g, '');
  let allResults = [];

  /* Search all companies in parallel */
  const [kmbRoutes, ctbRoutes, nlbRoutes] = await Promise.all([
    searchKMBRoute(routeNum),
    searchCTBRoute(routeNum),
    searchNLBRoute(routeNum)
  ]);

  /* For each KMB route, get stops and first stop ETA.
     同一路線 O/I 两個方向只保留一张卡，优先出发方向（O） */
  const kmbSeen = new Set();
  const kmbRoutesSorted = kmbRoutes.slice().sort((a, b) => (a.bound === 'O' ? 0 : 1) - (b.bound === 'O' ? 0 : 1));
  for (const route of kmbRoutesSorted) {
    const rKey = String(route.route).toUpperCase();
    if (kmbSeen.has(rKey)) continue;
    kmbSeen.add(rKey);
    const direction = route.bound === 'O' ? 'outbound' : 'inbound';
    const stops = await getKMBStops(route.route, direction, '1');
    if (stops.length > 0) {
      const firstStop = stops[0];
      allResults.push({
        type: 'bus', company: 'kmb',
        route: route.route,
        direction: direction,
        origDest: route.orig_tc || route.orig_en ? `${route.orig_tc || route.orig_en} → ${route.dest_tc || route.dest_en}` : '',
        stop_id: firstStop.stop_id || firstStop.stop,
        stop_name: firstStop.name_tc || firstStop.name_en || firstStop.stop_id,
        serviceType: '1',
        totalStops: stops.length,
        stopIndex: 0
      });
    }
  }

  /* For each CTB route, get stops and first stop ETA */
  for (const route of ctbRoutes) {
    /* CTB route-stop API needs 'outbound'/'inbound' (lowercase), not 'O'/'I' */
    for (const dir of ['outbound', 'inbound']) {
      const stops = await getCTBStops(route.route, dir);
      if (stops.length > 0) {
        /* 城巴 ETA API 对部分站點(尤其总站/前几站)返回空數據，
           并行探测前几個站，取第一個有本方向班次的站作為展示站 */
        const wantDir = dir === 'inbound' ? 'I' : 'O';
        const probes = await Promise.all(
          stops.slice(0, 6).map(async (s) => {
            const etas = await getCTBETA(s.stop || s.stop_id, route.route);
            return { s, ok: etas.some(e => (e.dir || '').toUpperCase() === wantDir) };
          })
        );
        let firstStop = null;
        for (const p of probes) { if (p.ok) { firstStop = p.s; break; } }
        if (!firstStop) firstStop = stops[0];
        allResults.push({
          type: 'bus', company: 'ctb',
          route: String(route.route),
          direction: dir,
          origDest: route.orig_tc && route.dest_tc
            ? (dir === 'inbound' ? `${route.dest_tc} → ${route.orig_tc}` : `${route.orig_tc} → ${route.dest_tc}`)
            : '',
          stop_id: firstStop.stop || firstStop.stop_id,
          stop_name: await getCTBStopName(firstStop.stop || firstStop.stop_id),
          totalStops: stops.length,
          stopIndex: Math.max(0, stops.indexOf(firstStop))
        });
      }
    }
  }

  /* For each NLB route, get stops and first stop ETA */
  for (const route of nlbRoutes) {
    const routeId = route.routeId;
    const stops = await getNLBRouteStops(routeId);
    if (stops.length > 0) {
      const firstStop = stops[0];
      allResults.push({
        type: 'bus', company: 'nlb',
        route: String(route.routeNo || route.routeId),
        routeId: routeId,
        direction: 'outbound',
        origDest: route.routeName_c || route.routeName_s || `${route.routeNo || route.routeId} 新大嶼山巴士`,
        stop_id: firstStop.stopId,
        stop_name: firstStop.stopName_c || firstStop.stopName_s || String(firstStop.stopId || ''),
        totalStops: stops.length,
        stopIndex: 0
      });
    }
  }

  if (allResults.length === 0) {
    if (gen !== container._gen) return;
    container.innerHTML = '<div class="empty-hint">找不到路線「' + escapeHtml(query) + '」，請確認路線编号是否正确</div>';
    setStatus('ok');
    return;
  }

  /* Fetch ETA for each result stop and render */
  const etaResults = await Promise.all(
    allResults.map(async (item) => {
      let etas = [];
      if (item.company === 'kmb') {
        etas = await getKMBETA(item.stop_id);
        /* Filter to only this route + direction（避免中间站混入反方向班次） */
        const wantDir = item.direction === 'inbound' ? 'I' : 'O';
        etas = etas.filter(e => e.route === item.route && (e.dir || '').toUpperCase() === wantDir)
          .map(e => ({ etaTs: new Date(e.eta).getTime() / 1000, dirLabel: (e.dir === 'I' ? '回' : '去') + (e.dest_tc || '') }));
      } else if (item.company === 'ctb') {
        etas = await getCTBETA(item.stop_id, item.route);
        /* Filter to this direction: O=outbound(去铜锣湾), I=inbound(回天水圍) */
        const wantDir = item.direction === 'inbound' ? 'I' : 'O';
        etas = etas.filter(e => (e.dir || '').toUpperCase() === wantDir);
      } else { /* nlb */
        etas = await getNLBETA(item.routeId, item.stop_id);
      }
      return { ...item, etas: etas.slice(0, 3) };
    })
  );

  if (gen !== container._gen) return;
  renderSearchResults(etaResults, container);
  setStatus('ok');
}

/** Search MTR by station name / line name / station code */
async function searchMTRStation(query, container) {
  container._gen = (container._gen || 0) + 1; const gen = container._gen;
  const q = query.trim();
  const upperQ = q.toUpperCase();
  /* 简繁兼容：同时用原词、繁體、簡體做匹配 */
  const qList = [...new Set([q, toTrad(q), toSimp(q)].filter(x => x))];

  /* 1) 線路名匹配（如「荃灣线」「觀塘」「TWL」） */
  const matchedLines = [];
  for (const [code, name] of Object.entries(MTR_LINES)) {
    if (qList.some(x => name.includes(x) || x.includes(name)) || code === upperQ) {
      if (!matchedLines.includes(code)) matchedLines.push(code);
    }
  }

  /* 2) 車站名/站码匹配（基於 MTR_LINE_STOPS 全站表） */
  const matchedStations = [];
  for (const lineCode of Object.keys(MTR_LINE_STOPS)) {
    for (const s of MTR_LINE_STOPS[lineCode]) {
      if (qList.some(x => s.name.includes(x) || x.includes(s.name)) || s.code === upperQ) {
        if (!matchedStations.find(m => m.code === s.code)) {
          matchedStations.push({ ...s, lines: [] });
        }
      }
    }
  }
  for (const st of matchedStations) {
    st.lines = Object.keys(MTR_LINE_STOPS).filter(lc =>
      MTR_LINE_STOPS[lc].some(s => s.code === st.code)
    );
  }

  if (matchedLines.length === 0 && matchedStations.length === 0) {
    if (gen !== container._gen) return;
    container.innerHTML = '<div class="empty-hint">找不到「' + escapeHtml(query) + '」，請輸入車站名（如 中環、旺角）或線路名（如 荃灣線）</div>';
    setStatus('ok');
    return;
  }

  const allResults = [];

  /* A) 線路模式：拉取該線全部站候車時間 */
  for (const lineCode of matchedLines) {
    const stops = MTR_LINE_STOPS[lineCode] || [];
    if (!stops.length) continue;
    const entries = await Promise.all(stops.map(async (s) => {
      const sched = await getMTRSchedule(lineCode, s.code);
      return { ...s, sched };
    }));
    if (entries.some(e => e.sched)) {
      /* 计算全線最近一班 */
      let minTs = Infinity;
      for (const e of entries) {
        if (!e.sched) continue;
        const key = `${lineCode}-${e.code}`;
        const d = e.sched[key] || {};
        for (const dir of ['UP', 'DOWN']) {
          for (const t of (d[dir] || [])) {
            if (t && t.time) {
              const ts = parseHKTime(t.time) / 1000;
              if (ts < minTs) minTs = ts;
            }
          }
        }
      }
      allResults.push({
        type: 'mtr', mode: 'line',
        line: lineCode, lineName: MTR_LINES[lineCode] || lineCode,
        station_id: 'ALL', station_name: MTR_LINES[lineCode] || lineCode,
        schedule: null, lineStops: entries,
        mainMins: minTs !== Infinity ? minsFromNow(minTs) : null
      });
    }
  }

  /* B) 車站模式：該站所在各线的候車時間 */
  for (const st of matchedStations) {
    for (const lineCode of st.lines) {
      const sched = await getMTRSchedule(lineCode, st.code);
      if (sched && Object.keys(sched).length > 0) {
        /* 解析 schedule → etas */
        const etas = [];
        const key = `${lineCode}-${st.code}`;
        const data = sched[key] || {};
        for (const dir of ['UP', 'DOWN']) {
          const dirLabel = dir === 'UP' ? '上行' : '下行';
          const arr = data[dir] || [];
          for (const t of arr.slice(0, 3)) {
            if (t && t.time) {
              etas.push({ etaTs: parseHKTime(t.time) / 1000, dirLabel });
            }
          }
        }
        etas.sort((a, b) => a.etaTs - b.etaTs);
        allResults.push({
          type: 'mtr', mode: 'station',
          line: lineCode, lineName: MTR_LINES[lineCode] || lineCode,
          station_id: st.code, station_name: st.name,
          schedule: sched, lineStops: null,
          etas: etas
        });
      }
    }
  }

  if (allResults.length === 0) {
    if (gen !== container._gen) return;
    container.innerHTML = '<div class="empty-hint">「' + escapeHtml(query) + '」目前沒有即時到站數據</div>';
    setStatus('ok');
    return;
  }

  if (gen !== container._gen) return;
  renderMTRSearchResults(allResults, container);
  setStatus('ok');
}

/** Search MTR Bus route by number */
async function searchMTRBus(query, container) {
  container._gen = (container._gen || 0) + 1; const gen = container._gen;
  const routeNum = query.toUpperCase().replace(/\s/g, '');
  const routeInfo = MTR_BUS_ROUTES[routeNum];

  /* Try API even if route not in built-in list (for variants like K75P) */
  const etaData = await getMTRBusETA(routeNum);

  if (!routeInfo && (!etaData || !etaData.busStop || !Array.isArray(etaData.busStop) || etaData.busStop.length === 0)) {
    if (gen !== container._gen) return;
    container.innerHTML = '<div class="empty-hint">找不到港鐵巴士路線「' + escapeHtml(query) + '」，請確認路線编号（如 K51、K65、K75P）</div>';
    setStatus('ok');
    return;
  }

  const item = {
    type: 'mtrbus',
    route: routeNum,
    orig: routeInfo ? routeInfo.orig : routeNum,
    dest: routeInfo ? routeInfo.dest : '',
    orig_en: routeInfo ? routeInfo.orig_en : '',
    dest_en: routeInfo ? routeInfo.dest_en : '',
    stop_id: 'ROUTE',
    etas: [],
    totalStops: 0,
    stops: []
  };

  if (etaData && Array.isArray(etaData.busStop)) {
    item.totalStops = etaData.busStop.length;
    item.stops = etaData.busStop;
    item.etas = parseMTRBusETAData(etaData).slice(0, 8);
    /* Capture dest from built-in route info if available */
    if (!item.dest && item.etas.length > 0) {
      const first = item.etas[0];
      if (first.stop_name) item.dest = first.stop_name;
    }
  }

  if (gen !== container._gen) return;
  renderMTRBusResults([item], container);
  setStatus('ok');
}


/* ==========================================================================
   Render Functions
   ========================================================================== */

/** Escape HTML entities */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---- 概念图风格结果卡公共辅助 ---- */

/** 從 item 提取主 ETA 展示數據 */
function buildETACard(item) {
  const list = [];
  if (item.etas) {
    for (const e of item.etas) {
      const ts = e.etaTs || (e.eta ? new Date(e.eta).getTime() / 1000 : null);
      if (ts) list.push({ ts, label: e.dirLabel || '' });
    }
  }
  if (list.length === 0) {
    /* 線路模式：直接使用预先算好的全線最近班次 */
    if (item.mainMins) {
      return { mainMins: item.mainMins, mainClass: '', mainTime: '', moreText: '全線最近班次' };
    }
    return { mainMins: null, mainClass: '', mainTime: '', moreText: '' };
  }
  const first = list[0];
  const mainMins = minsFromNow(first.ts);
  const mainClass = etaColorClass(first.ts);
  const line1 = { label: '第1班', dir: first.label || '', time: formatTime(first.ts), mins: mainMins };
  const line2 = list[1] ? { label: '第2班', dir: list[1].label || '', time: formatTime(list[1].ts), mins: minsFromNow(list[1].ts) } : null;
  const line1Txt = '第1班' + (line1.dir ? '（' + line1.dir + '）' : '') + ' ' + line1.time;
  const line2Txt = line2 ? '第2班' + (line2.dir ? '（' + line2.dir + '）' : '') + ' ' + line2.time : '';
  const moreText = line1Txt + (line2 ? ' · ' + line2Txt : '');
  return { mainMins, mainClass, mainTime: formatTime(first.ts), line1, line2, moreText };
}

/** 生成一张概念图风格 route-card 的 HTML */
function routeCardHTML(item, opts) {
  opts = opts || {};
  const faved = isFavorited(item);
  const favStar = faved ? '★' : '☆';
  const favClass = faved ? 'favorited' : '';
  const eta = buildETACard(item);
  const { mainMins, mainClass, moreText } = eta;

  /* 輕鐵 705/706 為天水圍循環线：705 順時針、706 逆時針 */
  const lrtDir = (item.type === 'lrt' && (item.route === '705' || item.route === '706'))
    ? (item.route === '705' ? '順時針' : '逆時針') : '';

  const tagText = item.type === 'mtr' ? '港鐵'
    : item.type === 'mtrbus' ? '港鐵巴士'
    : item.type === 'lrt' ? '輕鐵'
    : '公交';
  const no = (item.type === 'bus' || item.type === 'mtrbus' || item.type === 'lrt')
    ? String(item.route)
    : item.lineName;

  let nameText;
  if (item.type === 'bus') {
    nameText = item.origDest || item.stop_name || '';
  } else if (item.type === 'mtrbus') {
    nameText = (item.orig && item.dest) ? `${item.orig} → ${item.dest}` : item.route;
  } else if (item.type === 'lrt') {
    nameText = item.origDest || '輕鐵路線';
  } else {
    nameText = item.mode === 'line'
      ? `全線 ${(MTR_LINE_STOPS[item.line] || []).length} 個車站候車時間`
      : `${item.station_name} · ${item.lineName}`;
  }

  const json = JSON.stringify(item).replace(/'/g, "&#39;");

  let html = '<div class="transport-card route-card clickable" tabindex="0" role="button" data-type="' + (item.type || '') + '" data-cmp="' + (item.type === 'bus' ? (item.company || '') : (item.type || '')) + '" data-route-item=\'' + json + '\'>';
  html += '<div class="rc-head"><span class="rc-no">' + escapeHtml(no) + '</span>';
  if (lrtDir) html += '<span class="rc-dir">' + lrtDir + '</span>';
  html += '<span class="rc-tag">' + tagText + '</span>';
  if (opts.removeIndex != null) {
    html += '<div class="rc-actions">';
    if (item.type === 'bus') {
      html += `<button class="ds-pick" onclick="event.stopPropagation();openStopPicker(${opts.removeIndex})" title="選擇顯示哪一站等候時間">換站</button>`;
    }
    html += `<button class="fav-remove-btn" onclick="event.stopPropagation();removeFavorite(${opts.removeIndex})" title="移除收藏">移除</button>`;
    if (opts.showPick) {
      const showKey = getFavShowKey();
      const used = !!showKey && favKey(item) === showKey;
      html += `<button class="ds-pick ${used ? 'used' : ''}" onclick="event.stopPropagation();setFavShow(${opts.removeIndex})" title="固定顯示該站到站時間">${used ? '✓ 顯示中' : '設為顯示'}</button>`;
    }
    html += '</div>';
  }
  html += '</div>';
  html += '<div class="rc-name">' + escapeHtml(nameText) + '</div>';
  html += '<div class="rc-main">';
  if (mainMins !== null) {
    const num = String(mainMins).replace('分鐘', '');
    html += '<div class="rc-eta"><span class="rc-m ' + mainClass + '">' + num + '</span><span class="rc-u">分鐘</span></div>';
  } else {
    html += '<div class="rc-eta"><span class="rc-m">--</span><span class="rc-u">分鐘</span></div>';
  }
  html += '<div class="rc-sub">';
  if (eta.line1) {
    const dir1 = eta.line1.dir ? '<span class="rc-line-dir">' + eta.line1.dir + '</span>' : '';
    const dir2 = (eta.line2 && eta.line2.dir) ? '<span class="rc-line-dir">' + eta.line2.dir + '</span>' : '';
    html += '<div class="rc-line"><span class="rc-line-tag">' + eta.line1.label + '</span>' + dir1 + '<span class="rc-line-time">' + eta.line1.time + '</span></div>';
    if (eta.line2) {
      html += '<div class="rc-line"><span class="rc-line-tag">' + eta.line2.label + '</span>' + dir2 + '<span class="rc-line-time">' + eta.line2.time + '</span></div>';
    }
  } else {
    html += '<div class="rc-stop">' + (mainMins !== null ? escapeHtml(moreText || '暫無到站資訊') : '暫無到站資訊') + '</div>';
  }
  html += '<div class="rc-more">點按查看全線候車</div>';
  html += '</div>';
  if (opts.removeIndex == null) {
    html += `<button class="fav-btn ${favClass}" data-fav-item='${json}' title="收藏 / 取消收藏" aria-label="${faved ? '取消收藏' : '收藏'}" aria-pressed="${faved}">${favStar}</button>`;
  }
  html += '</div>';

  /* 进度条 / 全站提示 */
  const total = item.totalStops || 0;
  const cur = (item.stopIndex != null) ? item.stopIndex : 0;
  if (item.type === 'bus' && total > 0) {
    const pct = Math.max(3, Math.round(((cur + 1) / total) * 100));
    html += '<div class="rc-progress"><div class="rc-bar"><i style="width:' + pct + '%"></i></div>';
    html += `<span class="rc-pcnt">第 ${cur + 1} 站 · 共 ${total} 站</span></div>`;
  } else if (item.type === 'mtrbus' && total > 0) {
    html += '<div class="rc-progress"><div class="rc-bar"><i style="width:4%"></i></div>';
    html += `<span class="rc-pcnt">共 ${total} 個巴士站</span></div>`;
  } else if (item.type === 'lrt' && total > 0) {
    html += '<div class="rc-progress"><div class="rc-bar"><i style="width:4%"></i></div>';
    html += `<span class="rc-pcnt">共 ${total} 個車站 · 輕鐵</span></div>`;
  } else if (item.type === 'mtr') {
    const n = (MTR_LINE_STOPS[item.line] || []).length;
    html += '<div class="rc-progress"><div class="rc-bar"><i style="width:4%"></i></div>';
    html += `<span class="rc-pcnt">${item.mode === 'line' ? '全線 ' + n + ' 站' : '該線 ' + n + ' 站 · 點按看全線'}</span></div>`;
  }
  html += '</div>';
  return html;
}

/** Render bus search results（概念图风格） */
function renderSearchResults(items, container) {
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-hint">沒有结果</div>';
    return;
  }
  container.innerHTML = '<div class="card-grid">' + items.map(i => routeCardHTML(i)).join('') + '</div>';
}

/** Render MTR search results（概念图风格） */
function renderMTRSearchResults(items, container) {
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-hint">沒有结果</div>';
    return;
  }
  container.innerHTML = '<div class="card-grid">' + items.map(i => routeCardHTML(i)).join('') + '</div>';
}

/** Render MTR Bus search results（概念图风格） */
function renderMTRBusResults(items, container) {
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-hint">沒有结果</div>';
    return;
  }
  container.innerHTML = '<div class="card-grid">' + items.map(i => routeCardHTML(i)).join('') + '</div>';
}

/** Render favorites section with live ETA */
function renderFavorites() {
  const container = document.getElementById('favoritesContainer');
  const favs = getFavorites();
  document.getElementById('favCount').textContent = favs.length;

  if (favs.length === 0) {
    container.innerHTML = '<div class="empty-hint"><span class="icon">📌</span>' + t('empty.favs') + '</div>';
    return;
  }

  container.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
      <button id="exportQuote0Btn" style="background:#555;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;" onclick="exportFavoritesForQuote0()" title="匯出收藏路線為 JSON，用於 Quote/0 推送脚本">⬇ 匯出收藏</button>
    </div>
    <div id="favShowBox" class="favshow"></div>
    <div class="loading" id="favLoading"><div class="spinner"></div>載入實時數據中...</div>
  `;
  renderFavShowHint();

  /* Fetch ETA for all favorites */
  loadFavoritesETA(favs, container);
}

/** 收藏页固定顯示站提示（數據未到时） */
function renderFavShowHint() {
  const box = document.getElementById('favShowBox');
  if (!box) return;
  const showKey = getFavShowKey();
  if (showKey) box.innerHTML = '<div class="favshow-head">固定顯示站</div><div class="favshow-loading">載入中...</div>';
  else box.innerHTML = '<div class="favshow-hint">在下方收藏卡點「設為顯示」可固定該站到站時間</div>';
}

/** 設為固定顯示站（按身份键存储，删除其它收藏不影响） */
function setFavShow(index) {
  const favs = getFavorites();
  const f = favs[index];
  if (f) { try { localStorage.setItem(FAV_SHOW_KEY, favKey(f)); } catch (e) {} }
  renderFavorites();
}

/** 取消固定顯示站 */
function clearFavShow() {
  try { localStorage.removeItem(FAV_SHOW_KEY); } catch (e) {}
  renderFavorites();
}

/** Load live ETA data for all favorites */
async function loadFavoritesETA(favs, container) {
  const promises = favs.map(async (fav, index) => {
    let etas = [];
    if (fav.type === 'bus') {
      if (fav.company === 'kmb') {
        const allEta = await getKMBETA(fav.stop_id);
        /* 按收藏方向過濾（O=去程, I=回程），并标注方向目的地 */
        const wantDir = fav.direction === 'inbound' ? 'I' : 'O';
        etas = allEta.filter(e => e.route === fav.route && (e.dir || '').toUpperCase() === wantDir)
          .map(e => ({ etaTs: new Date(e.eta).getTime() / 1000, dirLabel: (e.dir === 'I' ? '回' : '去') + (e.dest_tc || '') }))
          .slice(0, 3);
      } else if (fav.company === 'ctb') {
        /* 旧收藏可能存的是数字站码，转中文并回写 */
        if (/^\d{4,6}$/.test(fav.stop_name || '')) {
          fav.stop_name = await getCTBStopName(fav.stop_id);
          const fs = getFavorites();
          if (fs[index]) fs[index].stop_name = fav.stop_name;
          saveFavorites(fs);
        }
        etas = await getCTBETA(fav.stop_id, fav.route);
        /* 按收藏方向過濾，避免混入反方向班次 */
        const wantDir = fav.direction === 'inbound' ? 'I' : 'O';
        etas = etas.filter(e => (e.dir || '').toUpperCase() === wantDir)
          .map(e => ({ etaTs: new Date(e.eta).getTime() / 1000, dirLabel: (e.dir === 'I' ? '回' : '去') + (e.dest_tc || '') }))
          .slice(0, 3);
      } else if (fav.company === 'nlb') {
        let rid = fav.routeId;
        if (!rid && fav.route) {
          /* 兼容旧收藏：收藏未存 routeId 时按路線号反查一次并回写 */
          try {
            const rs = await searchNLBRoute(String(fav.route));
            if (rs && rs[0]) {
              rid = rs[0].routeId;
              fav.routeId = rid;
              const fs = getFavorites();
              if (fs[index]) { fs[index].routeId = rid; saveFavorites(fs); }
            }
          } catch (e) {}
        }
        if (rid && fav.stop_id) {
          etas = await getNLBETA(rid, fav.stop_id);
          etas = etas.slice(0, 3);
        }
      }
    } else if (fav.type === 'lrt') {
      fav.origDest = fav.destination || '';
      if (fav.station_id != null && fav.station_id !== '') {
        const entries = await getLRTEta(fav.station_id);
        if (entries.length) {
          fav.platformData = entries;
          const now = Math.floor(Date.now() / 1000);
          etas = entries.slice(0, 3).map(e => ({ etaTs: now + e.mins * 60, dirLabel: (e.routeNo || '') + ' · ' + e.dest }));
        }
      }
    } else if (fav.type === 'mtrbus') {
      const etaData = await getMTRBusETA(fav.route);
      if (etaData) {
        etas = parseMTRBusETAData(etaData).slice(0, 8);
      }
    } else { /* mtr */
      if (fav.station_id === 'ALL') {
        /* 線路收藏：重建全線候車 */
        const stops = MTR_LINE_STOPS[fav.line] || [];
        const lineEntries = await Promise.all(stops.map(async (s) => {
          const sched = await getMTRSchedule(fav.line, s.code);
          return { ...s, sched };
        }));
        let minTs = Infinity;
        for (const e of lineEntries) {
          if (!e.sched) continue;
          const d = e.sched[`${fav.line}-${e.code}`] || {};
          for (const dir of ['UP', 'DOWN']) {
            for (const t of (d[dir] || [])) {
              if (t && t.time) {
                const ts = parseHKTime(t.time) / 1000;
                if (ts < minTs) minTs = ts;
              }
            }
          }
        }
        return { ...fav, index, etas, lineStops: lineEntries,
                 mainMins: minTs !== Infinity ? minsFromNow(minTs) : null };
      } else {
        const sched = await getMTRSchedule(fav.line, fav.station_id);
        if (sched) {
          const data = sched[`${fav.line}-${fav.station_id}`] || {};
          for (const dir of ['UP', 'DOWN']) {
            const dirLabel = dir === 'UP' ? '上行' : '下行';
            for (const t of (data[dir] || []).slice(0, 3)) {
              if (t && t.time) {
                const etaTs = parseHKTime(t.time) / 1000;
                etas.push({ time: t.time, etaTs, dirLabel });
              }
            }
          }
          etas.sort((a, b) => a.etaTs - b.etaTs);
        }
      }
    }
    return { ...fav, index, etas };
  });

  const results = await Promise.all(promises);
  renderFavoritesCards(results, container);
  setStatus('ok');
}

/** Render favorite cards（概念图风格） */
function renderFavoritesCards(items, container) {
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-hint">' + t('empty.nofav') + '</div>';
    return;
  }
  const exportBtn = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
      <button id="exportQuote0Btn2" style="background:#555;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;" onclick="exportFavoritesForQuote0()" title="匯出收藏路線為 JSON，用於 Quote/0 推送脚本">⬇ 匯出收藏</button>
    </div>`;
  const cards = items.map((item) => routeCardHTML(item, { removeIndex: item.index, showPick: true }));
  container.innerHTML = exportBtn + buildFavShowBox(items) + '<div class="card-grid">' + cards.join('') + '</div>';
}

/** 构建收藏页固定顯示站提示框 HTML（renderFavoritesCards 内联使用，避免被整体覆盖） */
function buildFavShowBox(results) {
  const showKey = getFavShowKey();
  const item = (results || []).find(r => favKey(r) === showKey);
  if (!showKey || !item) {
    return '<div id="favShowBox" class="favshow"><div class="favshow-hint">在下方收藏卡點「設為顯示」可固定該站到站時間</div></div>';
  }
  const card = routeCardHTML(item, { removeIndex: item.index, showPick: true });
  return '<div id="favShowBox" class="favshow"><div class="favshow-head">固定顯示站 <button class="favshow-clear" onclick="clearFavShow()">取消固定</button></div>' + card + '</div>';
}


/* ==========================================================================
   Favorite Toggle (from search results)
   ========================================================================== */

function toggleFavByItem(item, btn) {
  if (isFavorited(item)) {
    /* Remove from favorites */
    const favs = getFavorites();
    let idx = -1;
    if (item.type === 'mtr') {
      idx = favs.findIndex(f => f.type === 'mtr' && f.line === item.line && f.station_id === item.station_id);
    } else if (item.type === 'mtrbus') {
      idx = favs.findIndex(f => f.type === 'mtrbus' && f.route === item.route && f.stop_id === item.stop_id);
    } else if (item.type === 'lrt') {
      idx = favs.findIndex(f => f.type === 'lrt' && f.route === item.route);
    } else {
      idx = favs.findIndex(f => f.type === 'bus' && f.company === item.company && f.route === item.route && f.stop_id === item.stop_id);
    }
    if (idx >= 0) {
      favs.splice(idx, 1);
      saveFavorites(favs);
    }
    btn.classList.remove('favorited');
    btn.textContent = '☆';
    if (btn.setAttribute) { btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', '收藏'); }
  } else {
    /* Build a clean favorite item */
    const fav = { type: item.type };
    if (item.type === 'bus') {
      fav.company = item.company;
      fav.route = item.route;
      fav.routeId = item.routeId || '';
      fav.stop_id = item.stop_id || '';
      fav.stop_name = item.stop_name || '';
      fav.destination = item.origDest || '';
      fav.direction = item.direction || (item.company === 'kmb' ? 'outbound' : 'outbound');
    } else if (item.type === 'mtrbus') {
      fav.route = item.route;
      fav.orig = item.orig;
      fav.dest = item.dest;
      fav.stop_id = item.stop_id || '';
    } else if (item.type === 'lrt') {
      fav.route = item.route;
      fav.destination = item.origDest || '';
      fav.station_id = item.station_id != null ? item.station_id : '';
      fav.stop_name = item.stop_name || item.route || '';
      fav.totalStops = item.totalStops || 0;
    } else {
      fav.line = item.line;
      fav.lineName = item.lineName || (MTR_LINES[item.line] || item.line);
      fav.station_id = item.station_id;
      fav.station_name = item.station_name;
    }
    addFavorite(fav);
    btn.classList.add('favorited');
    btn.textContent = '★';
    if (btn.setAttribute) { btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', '取消收藏'); }
  }
  renderFavorites();
}

/** Export favorites as JSON file for Quote/0 push script */
function exportFavoritesForQuote0() {
  const favs = getFavorites();
  if (favs.length === 0) {
    alert(t('empty.nofav'));
    return;
  }
  const exportData = favs.map(f => {
    const clean = { ...f };
    delete clean.index;
    delete clean.etas;
    return clean;
  });
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hk-favorites.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/* ==========================================================================
   Weather (HKO)
   ========================================================================== */

/* 天氣警告已手动收起（本次会话内不再弹出） */
let warningDismissed = false;
/** 渲染天氣警告条（HKO rhrread.warningMessage；无警告或已收起时隐藏） */
function renderWarningBar(msgs) {
  const bar = document.getElementById('warningBar');
  if (!bar) return;
  if (!Array.isArray(msgs) || msgs.length === 0 || warningDismissed) { bar.hidden = true; return; }
  const text = msgs.join(' ');
  const severe = /颱風|暴雨|雷暴|山泥|酷熱|寒冷|霜凍|海嘯|水浸|紅色|黑色/.test(text);
  bar.className = 'warning-bar ' + (severe ? 'warn-severe' : 'warn-mild');
  bar.innerHTML = '<span class="wb-icon">' + (severe ? '⚠️' : 'ℹ️') + '</span>'
    + '<span class="wb-text">' + escapeHtml(text) + '</span>'
    + '<button class="wb-close" aria-label="收起警告">✕</button>';
  const close = bar.querySelector('.wb-close');
  if (close) close.addEventListener('click', () => { warningDismissed = true; bar.hidden = true; });
  bar.hidden = false;
}

/* 天气地区设置（用户可在设定页选择） */
const WEATHER_STATION_KEY = 'marvis_weather_station';
const WEATHER_STATIONS = ['元朗公園','香港天文台','京士柏','黃竹坑','打鼓嶺','流浮山','大埔','沙田','屯門','將軍澳','西貢','長洲','赤鱲角','青衣','石崗','荃灣可觀','荃灣城門谷','香港公園','筲箕灣','九龍城','跑馬地','黃大仙','赤柱','觀塘','深水埗','啟德跑道公園','大美督'];
function getWeatherStation() { try { return localStorage.getItem(WEATHER_STATION_KEY) || '元朗公園'; } catch (e) { return '元朗公園'; } }
function setWeatherStation(v) { try { localStorage.setItem(WEATHER_STATION_KEY, v); } catch (e) {} refreshWeather(); }

/** Fetch & render HKO real-time weather（迷你条：温度/湿度/雨量 + 警告条） */
async function refreshWeather() {
  const container = document.getElementById('weatherContainer');
  if (!container) return;
  try {
    const resp = await fetch(WEATHER_API, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    /* 天氣警告条（与天氣同一次請求，无额外开销） */
    renderWarningBar(data.warningMessage);

    /* Temperature: 优先用户选择地区，回退元朗公園/天文台 */
    const temps = (data.temperature && data.temperature.data) || [];
    const station = getWeatherStation();
    const hkoTemp = temps.find(t => t.place === station) || temps.find(t => t.place === '元朗公園') || temps.find(t => t.place === '香港天文台') || temps[0];
    /* Humidity */
    const hum = (data.humidity && data.humidity.data && data.humidity.data[0]) || null;
    /* Rainfall: 优先同地区雨量，回退主要站 */
    const rains = (data.rainfall && data.rainfall.data) || [];
    const rain = rains.find(r => r.place === station) || rains.find(r => r.place === '元朗') || rains.find(r => r.main === 'TRUE') || rains[0] || null;
    /* Icon */
    const icon = Array.isArray(data.icon) ? data.icon[0] : data.icon;
    const desc = HKO_ICONS[icon] || '未知';
    const emoji = HKO_ICON_EMOJI[icon] || '🌤️';

    const parts = [];
    if (hkoTemp) parts.push('<span class="wm-item">' + hkoTemp.value + '°C</span>');
    if (hum) parts.push('<span class="wm-item">' + hum.value + '%</span>');
    if (rain) parts.push('<span class="wm-item">' + rain.max + 'mm</span>');
    const update = data.updateTime ? '更新 ' + data.updateTime.slice(11, 16) : '';
    container.innerHTML = '<div class="weather-mini-bar"><span class="wm-desc">' + desc + '</span>' + parts.join('') + '<span class="wm-upd">' + update + '</span></div>';
  } catch (err) {
    container.innerHTML = '<div class="weather-mini-bar wm-error">天氣載入失敗</div>';
  }
}


/* ==========================================================================
   Sushiro Queue (via corsproxy.io)
   ========================================================================== */

/** Fetch & render Sushiro store queue status */
async function refreshSushiro() {
  const container = document.getElementById('sushiroContainer');
  const badge = document.getElementById('sushiroUpdate');
  try {
    const resp = await fetch(SUSHIRO_PROXY(SUSHIRO_STORE_API), { signal: AbortSignal.timeout(20000) });
    if (!resp.ok) {
      if (resp.status === 403) {
        container.innerHTML = '<div class="error-msg">寿司郎資料需從 http://localhost 打開網頁才能載入（corsproxy.io 限制）。請用「啟動網頁.bat」或 python -m http.server 開啟本地服务。</div>';
        badge.textContent = '';
        return;
      }
      throw new Error(`HTTP ${resp.status}`);
    }
    const allStores = await resp.json();
    if (!Array.isArray(allStores) || allStores.length === 0) {
      container.innerHTML = '<div class="empty-hint">暫時沒有分店資料</div>';
      badge.textContent = '';
      return;
    }

    /* 只顯示新界西分店（葵青/荃灣/屯門/元朗/離島） */
    const NTW_AREAS = ['葵青區', '荃灣區', '屯門區', '元朗區', '離島區'];
    const stores = allStores.filter(s => NTW_AREAS.includes(s.area));
    if (stores.length === 0) {
      container.innerHTML = '<div class="empty-hint">新界西暫時沒有分店資料</div>';
      badge.textContent = '';
      return;
    }

    /* Sort: open stores first, then by wait time */
    const sorted = [...stores].sort((a, b) => {
      const aOpen = a.storeStatus === 'OPEN' ? 0 : 1;
      const bOpen = b.storeStatus === 'OPEN' ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return (a.wait || 0) - (b.wait || 0);
    });

    let html = '<div class="sushiro-grid">';
    for (const s of sorted) {
      const open = s.storeStatus === 'OPEN';
      const wait = s.wait || 0;
      const groups = s.waitingGroup || 0;
      const closed = !open || s.netTicketStatus === 'OFFLINE_CLOSING' || s.netTicketStatus === 'CLOSED';
      let waitClass = '';
      let waitText;
      if (closed) {
        waitText = '已停飞';
        waitClass = 'soon';
      } else if (wait <= 0) {
        waitText = '直入';
      } else if (wait < 30) {
        waitText = `${wait}分鐘`;
        waitClass = 'medium';
      } else {
        waitText = `${wait}分鐘`;
      }
      html += `<div class="sushiro-card${closed ? ' closed' : ''}">
        <div class="s-name">${s.name || ('分店' + s.id)}</div>
        <div class="s-wait ${waitClass}">${waitText}</div>
        <div class="s-status">${closed ? '未營業／停止派飛' : (groups > 0 ? `等候 ${groups} 組` : '無需等候')} · ${s.area || ''}</div>
      </div>`;
    }
    html += '</div>';
    html += '<div class="sushiro-note">數據來源：壽司郎官方 sushipass API（經 corsproxy.io 代理）· 自動更新</div>';
    container.innerHTML = html;
    badge.textContent = new Date().toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    container.innerHTML = '<div class="error-msg">寿司郎排队資料載入失敗：' + (err.message || '網絡錯誤') + '</div>';
    badge.textContent = '';
  }
}


/* ==========================================================================
   K75P Full-Route Live Board
   ========================================================================== */

/* K75P 折叠区展开状态（自动刷新整体重建后保持用户選擇） */
let k75pFoldOpen = false;

/* K75P 循環线 23 站（按真实经过顺序：去程 D010-D080，回程 U011→U010→U020→...→U140） */
const K75P_STOPS = [
  { id: 'D010', name: '天瑞' },
  { id: 'D020', name: '天水圍公園', fold: true },
  { id: 'D030', name: '天耀邨耀盛楼', fold: true },
  { id: 'D040', name: '輕鐵天耀站', fold: true },
  { id: 'D050', name: '天盛苑', fold: true },
  { id: 'D060', name: '石埗路', fold: true },
  { id: 'D070', name: '沙洲里村', fold: true },
  { id: 'D080', name: '厦村市', fold: true },
  { id: 'U011', name: '新屋村', fold: true },
  { id: 'U010', name: '李屋村', fold: true },
  { id: 'U020', name: '新生村', fold: true },
  { id: 'U030', name: '新李屋村', fold: true },
  { id: 'U040', name: '田心', fold: true },
  { id: 'U050', name: '鄉事委員會', fold: true },
  { id: 'U060', name: '輕鐵洪水桥站' },
  { id: 'U070', name: '洪水桥巴士厂' },
  { id: 'U080', name: '洪福邨' },
  { id: 'U090', name: '石埗村' },
  { id: 'U100', name: '天盛苑' },
  { id: 'U110', name: '天水圍警署' },
  { id: 'U120', name: '賞湖居' },
  { id: 'U130', name: '天水圍公園' },
  { id: 'U140', name: '天瑞' }
];

/** 解析 departureTimeText（HH:MM 或 HH:MM:SS）為 "HH:MM" */
function parseDepartureText(text) {
  if (!text) return '';
  const m = String(text).match(/(\d{1,2}):(\d{2})/);
  return m ? m[1] + ':' + m[2] : '';
}

/** 載入 K75P 全線 23 站實時班次并渲染 */
async function loadK75PAllStops() {
  const container = document.getElementById('k75pContainer');
  const badge = document.getElementById('k75pUpdate');
  if (!container) return;
  try {
    const data = await getMTRBusETA('K75P');
    if (!data || !data.busStop) throw new Error('无資料');

    /* 按站分组：過濾占位班次（arrival>=108000），保留發車時間；按到站秒数排序取前 3 班 */
    const stopMap = {};
    for (const stop of data.busStop) {
      const buses = (stop.bus || []).map(b => {
        const sec = parseInt(b.arrivalTimeInSecond) || 0;
        return {
          sec,
          depText: parseDepartureText(b.departureTimeText),
          isDelayed: isFlag(b.isDelayed),
          isScheduled: isFlag(b.isScheduled)
        };
      }).filter(b => (b.sec > 0 && b.sec < 108000) || b.depText)
        .sort((a, b) => (a.sec > 0 && a.sec < 108000 ? a.sec : 999999) - (b.sec > 0 && b.sec < 108000 ? b.sec : 999999))
        .slice(0, 3);
      stopMap[(stop.busStopId || '').replace(/^K75P-/, '')] = buses;
    }

    let html = '<div class="k75p-wrap">';
    let foldOpen = false;
    for (const stop of K75P_STOPS) {
      if (stop.fold && !foldOpen) {
        foldOpen = true;
        html += '<button type="button" class="k75p-fold-btn" id="k75pFoldBtn" onclick="toggleK75PFold()" aria-expanded="' + (k75pFoldOpen ? 'true' : 'false') + '">天水圍市 ' + (k75pFoldOpen ? '▴' : '▾') + '</button>';
        html += '<div class="k75p-fold' + (k75pFoldOpen ? ' open' : '') + '" id="k75pFold">';
      } else if (!stop.fold && foldOpen) {
        foldOpen = false;
        html += '</div>';
      }
      const buses = stopMap[stop.id] || [];
      html += '<div class="k75p-stop">';
      html += `<span class="k75p-name">${escapeHtml(stop.name)}</span>`;
      html += '<span class="k75p-buses">';
      if (buses.length === 0) {
        html += '<span class="k75p-bus k75p-none">暫無班次</span>';
      } else {
        for (const b of buses) {
          let cls = '';
          let label = '';
          if (b.sec > 0 && b.sec < 108000) {
            const mins = Math.max(1, Math.ceil(b.sec / 60));
            if (b.sec <= 60) { cls = 'soon'; label = '即將到站'; }
            else { label = mins + ' 分鐘'; }
            if (b.isDelayed) { cls = 'delayed'; label += ' · 延误'; }
            else if (b.isScheduled) { cls = 'scheduled'; label += ' · 定時'; }
          } else if (b.depText) {
            cls = 'scheduled'; label = b.depText + ' 發車';
          }
          html += `<span class="k75p-bus ${cls}">${label}</span>`;
        }
      }
      html += '</span></div>';
    }
    if (foldOpen) html += '</div>';
    html += '</div>';
    container.innerHTML = html;
    badge.textContent = new Date().toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    container.innerHTML = '<div class="error-msg">K75P 全線資料載入失敗：' + (err.message || '網絡錯誤') + '</div>';
    badge.textContent = '';
  }
}

/** 展开/折叠 K75P 石埗路至鄉事委員會段（厦村市按钮） */
function toggleK75PFold() {
  const fold = document.getElementById('k75pFold');
  const btn = document.getElementById('k75pFoldBtn');
  if (!fold || !btn) return;
  const open = fold.classList.toggle('open');
  k75pFoldOpen = open;                 /* 记录展开状态，自动刷新重建后保持 */
  btn.textContent = open ? '天水圍市 ▴' : '天水圍市 ▾';
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}


/* ==========================================================================
   Route Detail（點按结果/收藏卡 → 全線候車弹层）
   ========================================================================== */

/** 获取 CTB 路線某方向全部車站 */
async function getCTBRouteStops(route, dir) {
  try {
    const data = await fetchWithProxy(`${CTB_BASE}/route-stop/ctb/${route}/${dir}`);
    return data && data.data ? data.data : [];
  } catch { return []; }
}

/* CTB 站名查询（6 位数字站码 → 中文名），带缓存 */
const _ctbNameCache = {};
async function getCTBStopName(stopId) {
  if (_ctbNameCache[stopId]) return _ctbNameCache[stopId];
  try {
    const data = await fetchWithProxy(`${CTB_BASE}/stop/${stopId}`);
    const d = data && data.data;
    _ctbNameCache[stopId] = (d && (d.name_tc || d.name_en)) || ('站 ' + stopId);
  } catch {
    _ctbNameCache[stopId] = '站 ' + stopId;
  }
  return _ctbNameCache[stopId];
}

function openRouteDetail(item) {
  const mask = document.getElementById('detailMask');
  const sheet = document.getElementById('detailSheet');
  if (!mask || !sheet) return;
  mask.classList.add('show');
  sheet.classList.add('show');
  document.body.classList.add('sheet-open');
  const inner = document.getElementById('detailSheetInner');
  inner.innerHTML = '<div class="loading"><div class="spinner"></div>' + t('loading.detail') + '</div>';
  renderDetailContent(item, inner);
  /* 弹层打開后把焦點移入，便於键盘操作与读屏 */
  requestAnimationFrame(() => {
    const close = inner.querySelector('.ds-close');
    if (close) close.focus();
  });
}

function closeRouteDetail() {
  const mask = document.getElementById('detailMask');
  const sheet = document.getElementById('detailSheet');
  if (mask) mask.classList.remove('show');
  if (sheet) sheet.classList.remove('show');
  document.body.classList.remove('sheet-open');
}

/** 收藏公交路線：打開換站面板，選擇要顯示等候時間的站 */
async function openStopPicker(favIndex) {
  const favs = getFavorites();
  const fav = favs[favIndex];
  const mask = document.getElementById('detailMask');
  const sheet = document.getElementById('detailSheet');
  const inner = document.getElementById('detailSheetInner');
  if (!fav || fav.type !== 'bus' || !mask || !sheet || !inner) return;
  mask.classList.add('show');
  sheet.classList.add('show');
  document.body.classList.add('sheet-open');
  inner.innerHTML = '<div class="loading"><div class="spinner"></div>' + t('loading.stops') + '</div>';

  let stops = [];
  try {
    if (fav.company === 'kmb') {
      stops = await getKMBStops(fav.route, fav.direction === 'inbound' ? 'inbound' : 'outbound', '1');
      /* route-stop 可能只返回站码，批量补中文站名 */
      if (stops.length) {
        const missing = stops.filter(s => !(s.name_tc || s.name_en)).map(s => s.stop);
        const names = await Promise.all(missing.map(sid => getKMBStopName(sid)));
        const nm = {};
        missing.forEach((sid, i) => { nm[String(sid)] = names[i]; });
        stops = stops.map(s => ({ ...s, name_tc: s.name_tc || s.name_en || nm[String(s.stop)] || (s.name_tc || s.name_en || '') }));
      }
    } else if (fav.company === 'ctb') {
      stops = await getCTBStops(fav.route, fav.direction === 'inbound' ? 'inbound' : 'outbound');
      /* route-stop 只返回 6 位站码，批量补中文站名 */
      if (stops.length) {
        stops = await Promise.all(stops.map(async (s) => {
          const sid = s.stop || s.stop_id;
          const name = sid ? await getCTBStopName(sid) : '';
          return { ...s, name_tc: name };
        }));
      }
    } else if (fav.company === 'nlb') {
      let rid = fav.routeId;
      if (!rid && fav.route) {
        const rs = await searchNLBRoute(String(fav.route));
        if (rs && rs[0]) rid = rs[0].routeId;
      }
      stops = rid ? await getNLBRouteStops(rid) : [];
    }
  } catch (e) { stops = []; }

  if (stops.length === 0) {
    inner.innerHTML = '<div class="ds-grab"></div><div class="ds-head"><span class="ds-no">' + escapeHtml(String(fav.route)) + '</span><button class="ds-close" onclick="closeRouteDetail()">×</button></div><div class="empty-hint">无法載入此路線的車站列表</div>';
    return;
  }

  let h = '<div class="ds-grab"></div><div class="ds-head"><span class="ds-no">' + escapeHtml(String(fav.route)) + ' · 選擇車站</span>';
  h += '<button class="ds-close" onclick="closeRouteDetail()">×</button></div>';
  h += '<div class="ds-list">';
  stops.forEach((s, i) => {
    let name = '', id = '';
    if (fav.company === 'kmb') {
      name = s.name_tc || s.name_en || ('站 ' + (s.stop_id || s.stop));
      id = s.stop_id || s.stop;
    } else if (fav.company === 'ctb') {
      name = s.name_tc || s.name_en || s.name;
      id = s.stop || s.stop_id;
    } else {
      name = s.stopName_c || s.stopName_s || ('站 ' + (s.stopId != null ? s.stopId : ''));
      id = s.stopId;
    }
    if (name == null || name === '') name = '站 ' + id;
    const cur = String(fav.stop_id) === String(id);
    h += `<div class="ds-stop ${cur ? 'ds-cur' : ''}" tabindex="0" role="button" data-i="${favIndex}" data-sid="${escapeHtml(String(id))}" data-sn="${escapeHtml(String(name))}" onclick="pickStop(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();pickStop(this)}">`;
    h += '<span class="ds-sn">' + (i + 1) + '. ' + escapeHtml(name) + (cur ? '（当前）' : '') + '</span></div>';
  });
  h += '</div>';
  inner.innerHTML = h;
}

/** 確認換站并刷新收藏 */
function pickStop(el) {
  const i = parseInt(el.getAttribute('data-i'), 10);
  const sid = el.getAttribute('data-sid');
  const sn = el.getAttribute('data-sn');
  const fs = getFavorites();
  if (fs[i] && sid != null && sid !== '') {
    fs[i].stop_id = sid;
    fs[i].stop_name = sn;
    fs[i].stopIndex = 0;
    saveFavorites(fs);
  }
  closeRouteDetail();
  renderFavorites();
}

/** 渲染详情弹层内容 */
/* ==========================================================================
   MTR 車站接驳：輕鐵 + 港鐵巴士（iOS 概念图功能实装）
   ========================================================================== */
async function buildMTRConnections(item) {
  const station = (item.station_name || '').trim();
  if (!station) return '';
  const parts = [];

  /* --- 輕鐵接驳：站名完全匹配 LRT_STATIONS --- */
  const lrtId = Object.keys(LRT_STATIONS).find(k => LRT_STATIONS[k] === station);
  if (lrtId != null) {
    try {
      const entries = await getLRTEta(Number(lrtId));
      if (entries && entries.length) {
        let h = '<div class="mtr-conn"><div class="conn-block">'
          + '<div class="conn-title">🚈 輕鐵接驳 · ' + escapeHtml(station) + '站</div>';
        h += entries.slice(0, 4).map(e => {
          const cls = e.mins <= 1 ? 'soon' : '';
          return '<div class="conn-row"><span class="conn-badge lr">' + escapeHtml(e.routeNo) + '</span>'
            + '<span class="conn-dest">' + escapeHtml(e.dest) + '</span>'
            + '<span class="conn-eta ' + cls + '">' + e.mins + ' 分鐘</span></div>';
        }).join('');
        h += '</div></div>';
        parts.push(h);
      }
    } catch (e) {}
  }

  /* --- 港鐵巴士接驳：路線 orig/dest 与站名匹配（统一转繁體，避免简繁不匹配） --- */
  const base = toTrad(station).replace(/站$/, '');
  const matchedRoutes = Object.keys(MTR_BUS_ROUTES).filter(r => {
    const o = MTR_BUS_ROUTES[r];
    const origT = toTrad(o.orig || '').replace(/站$/, '');
    const destT = toTrad(o.dest || '').replace(/站$/, '');
    return (o.orig && (origT === base || origT.includes(base) || base.includes(origT)))
        || (o.dest && (destT === base || destT.includes(base) || base.includes(destT)));
  });
  for (const r of matchedRoutes.slice(0, 4)) {
    try {
      const data = await getMTRBusETA(r);
      const parsed = parseMTRBusETAData(data);
      if (!parsed.length) continue;
      const o = MTR_BUS_ROUTES[r];
      let h = '<div class="mtr-conn"><div class="conn-block">'
        + '<div class="conn-title">🚌 港鐵巴士 ' + escapeHtml(r) + ' · ' + escapeHtml(o.orig) + ' → ' + escapeHtml(o.dest) + '</div>';
      h += parsed.slice(0, 3).map(p => {
        if (!p.eta || isNaN(Date.parse(p.eta))) return '';
        const minsText = minsFromNow(Math.floor(Date.parse(p.eta) / 1000));
        const cls = minsText.indexOf('<1') === 0 ? 'soon' : '';
        return '<div class="conn-row"><span class="conn-badge mtrbus">' + escapeHtml(r) + '</span>'
          + '<span class="conn-dest">' + escapeHtml(p.stop_name || '') + '</span>'
          + '<span class="conn-eta ' + cls + '">' + minsText + '</span></div>';
      }).join('');
      h += '</div></div>';
      parts.push(h);
    } catch (e) {}
  }
  return parts.join('');
}

async function renderDetailContent(item, inner) {
  try {
    let title = '', sub = '', meta = '', listHtml = '', tri = false;
    if (item.type === 'mtr') {
      const isLine = (item.mode === 'line' || item.station_id === 'ALL');
      title = item.lineName || MTR_LINES[item.line] || item.line;
      const n = (MTR_LINE_STOPS[item.line] || []).length;
      sub = isLine ? `全線 ${n} 站候車時間` : `${item.station_name} · ${item.lineName}`;
      meta = '上/下行 候車時間（分鐘）';
      tri = true;
      const stops = MTR_LINE_STOPS[item.line] || [];
      const entries = await Promise.all(stops.map(async (s) => {
        const sched = await getMTRSchedule(item.line, s.code);
        return { ...s, sched };
      }));
      const rows = [];
      for (const e of entries) {
        const d = e.sched ? (e.sched[`${item.line}-${e.code}`] || {}) : {};
        const ups = (d.UP || []).map(t => t && t.time ? parseHKTime(t.time) / 1000 : null).filter(Boolean).slice(0, 2);
        const downs = (d.DOWN || []).map(t => t && t.time ? parseHKTime(t.time) / 1000 : null).filter(Boolean).slice(0, 2);
        rows.push({ name: e.name, ups, downs });
      }
      const em = (ts) => {
        const mins = minsFromNow(ts);
        const cls = etaColorClass(ts);
        return `<span class="ds-em ${cls}">${String(mins).replace('分鐘', '')}<i class="ds-eu">分</i></span>`;
      };
      listHtml = rows.map(r => {
        const u = r.ups.length ? r.ups.map(em).join('') : '<span class="ds-none">—</span>';
        const d = r.downs.length ? r.downs.map(em).join('') : '<span class="ds-none">—</span>';
        return `<div class="ds-stop ds-tri"><span class="ds-sn">${escapeHtml(r.name)}</span><span class="ds-e">${u}</span><span class="ds-e">${d}</span></div>`;
      }).join('');
      /* 車站详情：附輕鐵 / 港鐵巴士接驳（仅車站模式） */
      if (!isLine) {
        listHtml += await buildMTRConnections(item);
      }
    } else if (item.type === 'mtrbus') {
      title = String(item.route);
      sub = item.orig && item.dest ? `${item.orig} → ${item.dest}` : '港鐵巴士';
      meta = '到站時間（分鐘）';
      const data = await getMTRBusETA(item.route);
      const rows = [];
      if (data && Array.isArray(data.busStop)) {
        for (const stop of data.busStop) {
          const buses = (stop.bus || []).map(b => {
            const sec = parseInt(b.arrivalTimeInSecond) || 0;
            const depText = parseDepartureText(b.departureTimeText);
            return { sec, depText, isDelayed: isFlag(b.isDelayed) };
          }).filter(b => (b.sec > 0 && b.sec < 108000) || b.depText)
            .sort((a, b) => (a.sec > 0 && a.sec < 108000 ? a.sec : 999999) - (b.sec > 0 && b.sec < 108000 ? b.sec : 999999))
            .slice(0, 2);
          rows.push({ name: stop.busStopNameTc || stop.busStopName || stop.busStopId, buses });
        }
      }
      listHtml = rows.map(r => {
        const cells = r.buses.length ? r.buses.map(b => {
          if (b.sec > 0 && b.sec < 108000) {
            const mins = Math.max(1, Math.ceil(b.sec / 60));
            const cls = b.sec <= 60 ? 'soon' : (b.isDelayed ? 'medium' : '');
            const suffix = b.isDelayed ? '分·延' : '分';
            return `<span class="ds-em ${cls}">${mins}<i class="ds-eu">${suffix}</i></span>`;
          }
          if (b.depText) {
            return `<span class="ds-em scheduled">${b.depText}<i class="ds-eu">發</i></span>`;
          }
          return '<span class="ds-none">—</span>';
        }).join('') : '<span class="ds-none">—</span>';
        return `<div class="ds-stop"><span class="ds-sn">${escapeHtml(r.name)}</span><span class="ds-e">${cells}</span></div>`;
      }).join('');
    } else if (item.type === 'lrt') {
      /* 輕鐵：顯示該站各平台實時到站 */
      title = item.stop_name || item.route || '輕鐵車站';
      sub = '輕鐵實時到站';
      meta = '路線 · 方向（分鐘）';
      let entries = item.platformData || null;
      if ((!entries || entries.length === 0) && item.station_id != null) {
        entries = await getLRTEta(item.station_id);
      }
      if (!entries || entries.length === 0) {
        listHtml = '<div class="ds-stop"><span class="ds-sn">暫無實時到站數據</span><span class="ds-e"></span></div>';
      } else {
        listHtml = entries.map(e => {
          const cls = e.mins <= 1 ? 'soon' : '';
          const suffix = e.dep ? '分开' : '分';
          const cells = `<span class="ds-em ${cls}">${e.mins}<i class="ds-eu">${suffix}</i></span>`;
          const sn = `${e.routeNo} · ${e.dest}` + (e.special ? '（特别）' : '');
          return `<div class="ds-stop"><span class="ds-sn">${escapeHtml(sn)}</span><span class="ds-e">${cells}</span></div>`;
        }).join('');
      }
    } else {
      /* 巴士：展示該路線全部站候車 */
      title = String(item.route);
      sub = item.origDest || item.stop_name || '';
      meta = '候車時間（分鐘）';
      const em = (ts) => {
        const mins = minsFromNow(ts);
        const cls = etaColorClass(ts);
        return `<span class="ds-em ${cls}">${String(mins).replace('分鐘', '')}<i class="ds-eu">分</i></span>`;
      };
      if (item.company === 'kmb') {
        const stops = await getKMBStops(item.route, item.direction, item.serviceType || '1');
        const allEta = await getKMBETA(item.stop_id);
        const wantDir = item.direction === 'inbound' ? 'I' : 'O';
        const byRoute = allEta.filter(e => e.route === String(item.route) && (e.dir || '').toUpperCase() === wantDir);
        /* route-stop 缺站名时批量调 stop 接口补全（避免顯示纯数字站码） */
        const missing = stops.filter(s => !(s.name_tc || s.name_en)).map(s => s.stop);
        const names = await Promise.all(missing.map(sid => getKMBStopName(sid)));
        const nameMap = {};
        missing.forEach((sid, i) => { nameMap[String(sid)] = names[i]; });
        const rows = [];
        for (const s of stops) {
          const stopEtas = byRoute.filter(e => String(e.stop) === String(s.stop));
          const times = stopEtas.slice(0, 2).map(e => e.eta ? new Date(e.eta).getTime() / 1000 : null).filter(Boolean);
          rows.push({ name: s.name_tc || s.name_en || nameMap[String(s.stop)] || ('站 ' + s.stop), times });
        }
        listHtml = rows.map(r => {
          const cells = r.times.length ? r.times.map(em).join('') : '<span class="ds-none">—</span>';
          return `<div class="ds-stop"><span class="ds-sn">${escapeHtml(r.name)}</span><span class="ds-e">${cells}</span></div>`;
        }).join('');
      } else if (item.company === 'ctb') {
        /* CTB：按方向取站，逐站取站名 + ETA（分批并行，避免并发过多被限流） */
        const dir = item.direction || 'outbound';
        const stops = await getCTBRouteStops(item.route, dir);
        const rows = [];
        for (let i = 0; i < stops.length; i += 5) {
          const batch = await Promise.all(stops.slice(i, i + 5).map(async (s) => {
            const sid = s.stop || s.stop_id;
            const [name, etas] = await Promise.all([getCTBStopName(sid), getCTBETA(sid, item.route)]);
            const times = etas.slice(0, 2).map(e => e.eta ? new Date(e.eta).getTime() / 1000 : null).filter(Boolean);
            return { name, times };
          }));
          rows.push(...batch);
        }
        listHtml = rows.map(r => {
          const cells = r.times.length ? r.times.map(em).join('') : '<span class="ds-none">—</span>';
          return `<div class="ds-stop"><span class="ds-sn">${escapeHtml(r.name)}</span><span class="ds-e">${cells}</span></div>`;
        }).join('');
      } else {
        /* NLB（新大嶼山巴士）：按路線取站，逐站取 ETA */
        const stops = await getNLBRouteStops(item.routeId);
        const rows = [];
        for (let i = 0; i < stops.length; i += 5) {
          const batch = await Promise.all(stops.slice(i, i + 5).map(async (s) => {
            const etas = await getNLBETA(item.routeId, s.stopId);
            const times = etas.slice(0, 2).map(e => e.etaTs || (e.eta ? new Date(e.eta).getTime() / 1000 : null)).filter(Boolean);
            return { name: s.stopName_c || s.stopName_s || String(s.stopId || ''), times };
          }));
          rows.push(...batch);
        }
        listHtml = rows.map(r => {
          const cells = r.times.length ? r.times.map(em).join('') : '<span class="ds-none">—</span>';
          return `<div class="ds-stop"><span class="ds-sn">${escapeHtml(r.name)}</span><span class="ds-e">${cells}</span></div>`;
        }).join('');
      }
    }
    const colhead = tri
      ? '<div class="ds-colhead"><span class="ds-sn">車站</span><span class="ds-col">上行</span><span class="ds-col">下行</span></div>'
      : '<div class="ds-colhead"><span class="ds-sn">車站</span><span class="ds-col">候車時間</span></div>';
    inner.innerHTML = `
      <div class="ds-grab"></div>
      <div class="ds-head">
        <button class="ds-close" onclick="closeRouteDetail()">✕</button>
        <div class="ds-no">${escapeHtml(title)}</div>
        <div class="ds-name">${escapeHtml(sub)}</div>
        <div class="ds-meta">${escapeHtml(meta)}</div>
      </div>
      ${colhead}
      <div class="ds-list">${listHtml}</div>`;
  } catch (err) {
    inner.innerHTML = '<div class="error-msg">載入失敗：' + escapeHtml(err.message || '網絡錯誤') + '</div>';
  }
}

