/* 森友出行手册 - 通用工具函数 + 收藏存储 */

/* ==========================================================================
   Utility Functions
   ========================================================================== */

/** Fetch with CORS proxy fallback（任何失败都尝试下一代理，且始终基于原始 URL，避免双重代理） */
async function fetchWithProxy(originalUrl, proxyIndex = 0) {
  /* proxyIndex 0 = 直连；1..N = 依次套用 CORS_PROXIES[proxyIndex-1]，URL 始终是原始地址 */
  const url = proxyIndex === 0 ? originalUrl : CORS_PROXIES[proxyIndex - 1](originalUrl);
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('请求超时，服务可能暂时不可用');
    }
    /* 直连被 CORS 拦截或代理失败（HTTP 错误/网络错误）时，换下一个代理重试 */
    if (proxyIndex < CORS_PROXIES.length) {
      return fetchWithProxy(originalUrl, proxyIndex + 1);
    }
    throw err;
  }
}

/** Format Unix timestamp (seconds) to HH:MM (no seconds) */
function formatTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
}

/** 解析香港时间串 → Unix 毫秒时间戳。
    data.gov.hk 的 MTR/NLB 接口返回 "YYYY-MM-DD HH:MM:SS"（空格分隔、无时区）：
    iOS Safari 不识别该格式（Invalid Date），需转 ISO 并显式补 +08:00。
    已带时区/ISO 格式（如 KMB/CTB 的 "…T21:55:00+08:00"）直接解析。 */
function parseHKTime(str) {
  if (str == null) return null;
  let s = String(str).trim();
  if (!s) return null;
  s = s.replace(' ', 'T');                                       /* Safari 兼容：空格 → T */
  if (!/[zZ]$/.test(s) && !/[+-]\d{2}:?\d{2}$/.test(s)) s += '+08:00'; /* 无时区 → 按香港时间 */
  const t = new Date(s);
  return isNaN(t.getTime()) ? null : t.getTime();
}

/** Calculate minutes remaining from now */
function minsFromNow(etaTs) {
  const now = Math.floor(Date.now() / 1000);
  const diff = etaTs - now;
  if (diff < 0) return '<1分钟';
  if (diff < 60) return '<1分钟';
  return `${Math.floor(diff / 60)}分钟`;
}

/** Get ETA time class for color coding */
function etaColorClass(etaTs) {
  const now = Math.floor(Date.now() / 1000);
  const diff = etaTs - now;
  if (diff < 120) return 'soon';      /* < 2 min → red */
  if (diff < 600) return 'medium';    /* < 10 min → orange */
  return '';
}

/** Update status indicator */
function setStatus(state, text) {
  const dot = document.getElementById('statusDot');
  const st = document.getElementById('statusText');
  dot.className = 'dot';
  if (state === 'ok') { dot.classList.add('dot-green'); st.textContent = text || '就绪'; }
  else if (state === 'error') { dot.classList.add('dot-red'); st.textContent = text || '错误'; }
  else { dot.classList.add('dot-yellow'); st.textContent = text || '载入中'; }
  document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}


/* ==========================================================================
   Favorites Management
   ========================================================================== */

const FAV_SHOW_KEY = 'marvis_fav_show';   /* 收藏页固定显示站（存身份键，兼容旧版下标） */

/** 收藏唯一身份键（type|company|route|stop），避免删除收藏后数组下标漂移 */
function favKey(f) {
  if (!f) return '';
  const id = f.type === 'mtr' ? (f.station_id || '') : (f.stop_id != null ? String(f.stop_id) : '');
  return [f.type, f.company || '', f.route || '', id].join('|');
}

/** 读取固定显示站身份键；旧版数字下标自动迁移为身份键 */
function getFavShowKey() {
  try {
    const v = localStorage.getItem(FAV_SHOW_KEY);
    if (v == null || v === '') return '';
    if (/^\d+$/.test(v)) {
      const idx = parseInt(v, 10);
      const favs = getFavorites();
      const key = (favs[idx] && favKey(favs[idx])) || '';
      try { localStorage.setItem(FAV_SHOW_KEY, key); } catch (e) {}
      return key;
    }
    return v;
  } catch { return ''; }
}

function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    /* 校验必须是数组，否则清掉损坏数据，避免整页崩溃 */
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed;
  } catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

/** Check if a route is in favorites */
function isFavorited(item) {
  const favs = getFavorites();
  if (item.type === 'mtr') {
    return favs.some(f => f.type === 'mtr' && f.line === item.line && f.station_id === item.station_id);
  }
  if (item.type === 'mtrbus') {
    return favs.some(f => f.type === 'mtrbus' && f.route === item.route && f.stop_id === item.stop_id);
  }
  if (item.type === 'lrt') {
    return favs.some(f => f.type === 'lrt' && f.route === item.route);
  }
  return favs.some(f => f.type === 'bus' && f.company === item.company && f.route === item.route && f.stop_id === item.stop_id);
}

/** Add to favorites */
function addFavorite(item) {
  const favs = getFavorites();
  if (isFavorited(item)) return;
  favs.push(item);
  saveFavorites(favs);
  renderFavorites();
}

/** Remove from favorites */
function removeFavorite(index) {
  const favs = getFavorites();
  favs.splice(index, 1);
  saveFavorites(favs);
  renderFavorites();
}

