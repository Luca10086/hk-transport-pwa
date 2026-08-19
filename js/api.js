/* 森友出行手册 - 数据源 API 层（KMB/CTB/NLB/轻铁/MTR/港铁巴士 + CORS 代理降级） */

/* ==========================================================================
   KMB API Calls
   ========================================================================== */

/** Search KMB route by number */
async function searchKMBRoute(routeNum) {
  try {
    const data = await fetchWithProxy(`${KMB_BASE}/route/`);
    if (!data || !data.data) return [];
    /* Filter routes matching the number (case-insensitive) */
    const matches = data.data.filter(r =>
      r.route.toUpperCase() === routeNum.toUpperCase()
    );
    return matches;
  } catch (err) {
    console.warn('KMB route search failed:', err.message);
    return [];
  }
}

/** Get KMB stops for a route */
async function getKMBStops(route, direction, serviceType = '1') {
  try {
    const url = `${KMB_BASE}/route-stop/${route}/${direction}/${serviceType}`;
    const data = await fetchWithProxy(url);
    return data && data.data ? data.data : [];
  } catch { return []; }
}

/** Get KMB ETA for a stop */
async function getKMBETA(stopId) {
  try {
    const data = await fetchWithProxy(`${KMB_BASE}/stop-eta/${stopId}`);
    return data && data.data ? data.data : [];
  } catch { return []; }
}

const _kmbNameCache = {};
/** 补全 KMB 站名：route-stop 接口可能只返回站码，需调 stop 接口取中文名 */
async function getKMBStopName(stopId) {
  const key = String(stopId);
  if (_kmbNameCache[key]) return _kmbNameCache[key];
  try {
    const data = await fetchWithProxy(`${KMB_BASE}/stop/${key}`);
    const d = data && data.data;
    _kmbNameCache[key] = (d && (d.name_tc || d.name_en)) || ('站 ' + key);
  } catch { _kmbNameCache[key] = '站 ' + key; }
  return _kmbNameCache[key];
}

/* KMB 全量站牌缓存（站名搜索用，首次加载 ~6759 站，内存缓存） */
let _kmbStopsPromise = null;
function getKMBAllStops() {
  if (!_kmbStopsPromise) {
    _kmbStopsPromise = fetchWithProxy(`${KMB_BASE}/stop/`).then(d => (d && d.data) || []).catch(() => []);
  }
  return _kmbStopsPromise;
}

/** 按站名搜索 KMB 站牌（简繁兼容） */
async function searchKMBStopsByName(q) {
  const stops = await getKMBAllStops();
  if (!stops.length) return [];
  const upper = q.toUpperCase();
  const qList = [...new Set([q, toTrad(q), toSimp(q)].filter(x => x))];
  const matches = [];
  for (const s of stops) {
    const hay = (s.name_tc || '') + '|' + (s.name_en || '') + '|' + (s.name_sc || '');
    if (qList.some(x => x && (hay.includes(x) || hay.toUpperCase().includes(x.toUpperCase())))) {
      matches.push(s);
      if (matches.length >= 50) break;
    }
  }
  return matches;
}

/* ==========================================================================
   CTB API Calls
   ========================================================================== */

/** Search CTB route by number */
async function searchCTBRoute(routeNum) {
  try {
    const data = await fetchWithProxy(`${CTB_BASE}/route/ctb`);
    if (!data || !data.data) return [];
    const matches = data.data.filter(r =>
      String(r.route).toUpperCase() === routeNum.toUpperCase()
    );
    return matches;
  } catch (err) {
    console.warn('CTB route search failed:', err.message);
    return [];
  }
}

/** Get CTB stops for a route */
async function getCTBStops(route, dir) {
  try {
    const data = await fetchWithProxy(`${CTB_BASE}/route-stop/ctb/${route}/${dir}`);
    return data && data.data ? data.data : [];
  } catch { return []; }
}

/** Get CTB ETA for a stop & route */
async function getCTBETA(stopId, route) {
  try {
    const data = await fetchWithProxy(`${CTB_BASE}/eta/ctb/${stopId}/${route}`);
    return data && data.data ? data.data : [];
  } catch { return []; }
}

/* ==========================================================================
   NLB (新大屿山巴士) API Calls
   ========================================================================== */

const NLB_BASE = 'https://rt.data.gov.hk/v2/transport/nlb';
const _nlbStopCache = {};

/** Search NLB routes by route number */
async function searchNLBRoute(routeNum) {
  try {
    const data = await fetchWithProxy(`${NLB_BASE}/route.php?action=list`);
    const list = (data && data.routes) || [];
    const upper = String(routeNum).toUpperCase();
    return list.filter(r => String(r.routeNo || '').toUpperCase() === upper);
  } catch { return []; }
}

/** Get stops of an NLB route (cached) */
async function getNLBRouteStops(routeId) {
  if (_nlbStopCache[routeId]) return _nlbStopCache[routeId];
  try {
    const data = await fetchWithProxy(`${NLB_BASE}/stop.php?action=list&routeId=${encodeURIComponent(routeId)}`);
    const list = (data && data.stops) || [];
    _nlbStopCache[routeId] = list;
    return list;
  } catch { return []; }
}

/** Get NLB ETA for a route + stop */
async function getNLBETA(routeId, stopId) {
  try {
    const data = await fetchWithProxy(
      `${NLB_BASE}/stop.php?action=estimatedArrivals&routeId=${encodeURIComponent(routeId)}&stopId=${encodeURIComponent(stopId)}&language=zh`
    );
    const list = (data && data.estimatedArrivals) || [];
    return list.map(e => {
      const ms = e && e.estimatedArrivalTime ? parseHKTime(e.estimatedArrivalTime) : null;
      return {
        etaTs: ms ? ms / 1000 : null,
        eta: e && e.estimatedArrivalTime ? e.estimatedArrivalTime : null,
        departed: e ? !!e.departed : false
      };
    }).filter(e => e.etaTs);
  } catch { return []; }
}

/* ==========================================================================
   Light Rail (轻铁) API Calls
   ========================================================================== */

const LRT_BASE = 'https://rt.data.gov.hk/v1/transport/mtr/lrt';
/* Station ID → 中文名（来自港铁轻铁数据字典 v1.2，2026-07-05 更新） */
const LRT_STATIONS = {
  1:'屯門碼頭',10:'美樂',15:'蝴蝶',20:'輕鐵車廠',30:'龍門',40:'青山村',50:'青雲',60:'建安',
  70:'河田',75:'蔡意橋',80:'澤豐',90:'屯門醫院',100:'兆康',110:'麒麟',120:'青松',130:'建生',
  140:'田景',150:'良景',160:'新圍',170:'石排',180:'山景(北)',190:'山景(南)',200:'鳴琴',
  212:'大興(北)',220:'大興(南)',230:'銀圍',240:'兆禧',250:'海皇路',260:'豐景園',265:'兆麟',
  270:'安定',275:'友愛',280:'市中心',295:'屯門',300:'杯渡',310:'何福堂',320:'新墟',330:'景峰',
  340:'鳳地',350:'藍地',360:'泥圍',370:'鍾屋村',380:'洪水橋',390:'塘坊村',400:'屏山',425:'坑尾村',
  430:'天水圍',435:'天慈',445:'天耀',448:'樂湖',450:'天湖',455:'銀座',460:'天瑞',468:'頌富',
  480:'天富',490:'翠湖',500:'天榮',510:'天悅',520:'天秀',530:'濕地公園',540:'天恒',550:'天逸',
  560:'水邊圍',570:'豐年路',580:'康樂路',590:'大棠路',600:'元朗',920:'三聖'
};

/** 获取某轻铁站的实时到站（各平台 / 各路线） */
async function getLRTEta(stationId) {
  const url = `${LRT_BASE}/getSchedule?station_id=${encodeURIComponent(stationId)}&with_special=1`;
  try {
    const data = await fetchWithProxy(url);
    const platforms = (data && data.platform_list) || [];
    const entries = [];
    for (const p of platforms) {
      for (const r of (p.route_list || [])) {
        const routeNo = (r.special === 1 && r.additionalInfo1) ? r.additionalInfo1 : (r.route_no || '');
        let mins = 0;
        const tc = String(r.time_ch || '').trim();
        const m = tc.match(/(\d+)\s*分鐘/);
        if (m) mins = parseInt(m[1], 10);
        else if (tc.includes('即將抵達') || tc.includes('正在離開') || tc === '-') mins = 0;
        else {
          const me = String(r.time_en || '').match(/(\d+)\s*mins?/);
          if (me) mins = parseInt(me[1], 10);
        }
        entries.push({
          platformId: p.platform_id, routeNo: routeNo || '?', dest: r.dest_ch || r.dest_en || '',
          mins, dep: r.arrival_departure === 'D', special: r.special === 1
        });
      }
    }
    entries.sort((a, b) => a.mins - b.mins);
    return entries;
  } catch { return []; }
}

/** 搜索轻铁：按站名匹配，显示该站实时到站 */
async function searchLRT(query, container) {
  container._gen = (container._gen || 0) + 1; const gen = container._gen;
  const q = String(query).trim();
  const matches = Object.keys(LRT_STATIONS)
    .filter(id => LRT_STATIONS[id].includes(q))
    .map(id => ({ id: Number(id), name: LRT_STATIONS[id] }));
  if (matches.length === 0) {
    if (gen !== container._gen) return;
    container.innerHTML = '<div class="empty-hint">找不到輕鐵車站「' + escapeHtml(query) + '」，請嘗試輸入站名（如 屯門碼頭、元朗、天水圍）</div>';
    setStatus('ok');
    return;
  }
  const results = await Promise.all(matches.slice(0, 8).map(async (st) => {
    const entries = await getLRTEta(st.id);
    const now = Math.floor(Date.now() / 1000);
    const etas = entries.slice(0, 3).map(e => ({ etaTs: now + e.mins * 60, dirLabel: (e.routeNo || '') + ' · ' + e.dest }));
    return {
      type: 'lrt', route: st.name, station_id: st.id, stop_name: st.name,
      origDest: st.name + ' · 輕鐵', direction: '', totalStops: 1, etas, platformData: entries
    };
  }));
  if (gen !== container._gen) return;
  renderSearchResults(results, container);
  if (matches.length > 8) {
    container.insertAdjacentHTML('beforeend', '<div class="sushiro-note">還有 ' + (matches.length - 8) + ' 個匹配站，請輸入更精確的站名</div>');
  }
  setStatus('ok');
}

/* ==========================================================================
   MTR API Calls
   ========================================================================== */

/** Get MTR schedule for a line + station */
async function getMTRSchedule(line, stationId) {
  try {
    const data = await fetchWithProxy(
      `${MTR_BASE}/getSchedule.php?line=${line}&sta=${stationId}`
    );
    return data && data.data ? data.data : null;
  } catch { return null; }
}

/* ==========================================================================
   MTR Bus API Calls
   ========================================================================== */

/** Get MTR Bus ETA for a route (POST method) */
async function getMTRBusETA(routeName) {
  const url = 'https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule';
  const body = JSON.stringify({ language: 'zh', routeName: routeName });
  try {
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    for (const proxyFn of CORS_PROXIES) {
      try {
        const proxyUrl = proxyFn(url);
        const resp = await fetch(proxyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        if (resp.ok) return await resp.json();
      } catch {}
    }
    return null;
  }
}

/** Parse MTR Bus ETA response (busStop → flat eta list) */
function parseMTRBusETAData(etaData) {
  if (!etaData || !etaData.busStop || !Array.isArray(etaData.busStop)) return [];
  const etas = [];
  const nowMs = Date.now();
  for (const stop of etaData.busStop) {
    const stopName = stop.busStopId || '';
    for (const bus of (stop.bus || [])) {
      const arrivalSec = parseInt(bus.arrivalTimeInSecond) || 0;
      /* 过滤未运营/无班次占位值（0 与 >=108000 秒 = 30 小时） */
      if (arrivalSec <= 0 || arrivalSec >= 108000) continue;
      etas.push({
        eta: new Date(nowMs + arrivalSec * 1000).toISOString(),
        stop_name: stopName,
        arrivalText: bus.arrivalTimeText || '',
        departureText: bus.departureTimeText || '',
        isScheduled: isFlag(bus.isScheduled)
      });
    }
  }
  return etas;
}

/** 兼容港铁巴士 API 返回字符串/布尔两种形态的标志位 */
function isFlag(v) { return v === true || v === 1 || v === '1' || v === 'true'; }

