/* 森友出行手册 - 通用工具函数 + 收藏存储 */

/* ==========================================================================
   Utility Functions
   ========================================================================== */

/** Fetch：先僅直連（隱私優先，不觸碰第三方代理）；失敗才競速全部代理，
    最先成功者勝並中止其餘（AbortController）；全敗才報錯。 */
async function fetchWithProxy(originalUrl, proxyIndex = 0) {
  try {
    const resp = await fetch(originalUrl, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (e) {}
  const attempts = CORS_PROXIES.map(p => p(originalUrl));
  const ctrl = new AbortController();
  let settled = false;
  return await new Promise((resolve, reject) => {
    let pending = attempts.length;
    attempts.forEach(url => {
      fetch(url, { signal: ctrl.signal })
        .then(async resp => {
          if (settled) return;
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          if (!settled) { settled = true; ctrl.abort(); resolve(data); }
        })
        .catch(() => {
          pending -= 1;
          if (pending <= 0 && !settled) { settled = true; reject(new Error('所有來源均無法連線')); }
        });
    });
    setTimeout(() => { if (!settled) { settled = true; ctrl.abort(); reject(new Error('請求超時')); } }, 15000);
  });
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

/* ==========================================================================
   简繁转换（覆盖港鐵/巴士站名与常见用字），用於搜索兼容
   ========================================================================== */
const SIMP2TRAD = {
  '环':'環','铜':'銅','锣':'鑼','湾':'灣','钟':'鐘','观':'觀','龙':'龍','围':'圍','东':'東',
  '将':'將','军':'軍','宝':'寶','黄':'黃','钻':'鑽','乐':'樂','启':'啟','红':'紅','长':'長',
  '蓝':'藍','调':'調','岭':'嶺','窝':'窩','荫':'蔭','显':'顯','车':'車','门':'門','恒':'恆',
  '乌':'烏','湿':'濕','头':'頭','铁':'鐵','线':'線','码':'碼','学':'學','罗':'羅','马':'馬',
  '庙':'廟','径':'徑','园':'園','鲗':'鰂','鱼':'魚','营':'營','盘':'盤','坚':'堅','台':'臺',
  '灵':'靈','场':'場','际':'際','馆':'館','图':'圖','华':'華','凤':'鳳','丽':'麗','凯':'凱',
  '伟':'偉','侨':'僑','汇':'匯','宁':'寧','卫':'衛','发':'發','达':'達','运':'運','逊':'遜',
  '尔':'爾','时':'時','间':'間','问':'問','广':'廣','边':'邊','让':'讓','议':'議','认':'認',
  '证':'證','记':'記','计':'計','说':'說','语':'語','邮':'郵','银':'銀','农':'農','湾':'灣'
};
const TRAD2SIMP = {};
for (const k in SIMP2TRAD) { TRAD2SIMP[SIMP2TRAD[k]] = k; }
function toTrad(s) { let out = ''; for (const c of s) out += SIMP2TRAD[c] || c; return out; }
function toSimp(s) { let out = ''; for (const c of s) out += TRAD2SIMP[c] || c; return out; }

