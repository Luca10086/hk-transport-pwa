/* 森友出行手册 - 应用入口（状态/皮肤/设定/刷新/事件初始化，最后加载） */

/* Currently selected transport type */
let currentTransport = 'bus';

/** 统一切换交通类型：同步全局状态 + 主搜索 toggle 高亮 + 占位符 + iOS 分类标签 */
function setTransport(type) {
  currentTransport = type;
  document.querySelectorAll('#transportToggle button').forEach(b => {
    const on = b.dataset.type === type;
    b.classList.toggle('active', on);
    if (b.setAttribute) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  document.querySelectorAll('.ios-cat').forEach(b => {
    const on = b.dataset.type === (type === 'bus' ? 'all' : type);
    b.classList.toggle('active', on);
    if (b.setAttribute) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const placeholders = {
    bus: '輸入巴士路線編號（如 1A、10）…',
    mtrbus: '輸入港鐵巴士路線編號（如 K51、K65）…',
    lrt: '輸入輕鐵車站名稱（如 屯門碼頭、元朗）…',
    mtr: '輸入港鐵車站名稱（如 中環、旺角）…'
  };
  const input = document.getElementById('searchInput');
  if (input && placeholders[type]) input.placeholder = placeholders[type];
}

/* Timer for auto-refresh */
let autoRefreshTimer = null;

/* ==========================================================================
   Refresh & Auto-Refresh
   ========================================================================== */

let refreshing = false;
/** Refresh all favorites ETA（manual=true 时显示整块 loading；自动刷新保留旧卡片原位更新） */
async function refreshAll(manual) {
  if (refreshing) return;             /* 互斥：上一轮未完成则跳过，避免并发覆盖/按钮错乱 */
  refreshing = true;
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true;
  btn.textContent = t('loading.update');
  setStatus('loading', t('loading.update'));
  try {
    const favs = getFavorites();
    if (favs.length > 0) {
      const container = document.getElementById('favoritesContainer');
      if (manual) container.innerHTML = '<div class="loading"><div class="spinner"></div>' + t('loading.update') + '</div>';
      await loadFavoritesETA(favs, container);
    } else {
      renderFavorites();
    }

    /* Weather & Sushiro & K75P refresh in parallel (non-blocking) */
    refreshWeather();
    refreshSushiro();
    loadK75PAllStops();
    /* iOS 皮肤：热门车站 ETA 随自动刷新保持实时 */
    if (document.body.dataset.skin === 'ios') renderIOSHot();
  } finally {
    refreshing = false;
    btn.disabled = false;
    btn.textContent = t('btn.refresh');
    setStatus('ok', t('status.ready'));
  }
}

function startAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  const sec = getRefreshInterval();
  if (sec <= 0) return;                     /* 设定为「关闭」时不启动定时器 */
  /* 标签页隐藏时暂停轮询，回到前台立即补一次刷新 */
  autoRefreshTimer = setInterval(() => { if (!document.hidden) refreshAll(); }, sec * 1000);
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshAll();
});


/* ==========================================================================
   Event Listeners & Init
   ========================================================================== */

/* ===== Skin switching (AC / Material Design 3 / iOS) ===== */
const SKIN_KEY = 'marvis_skin';
function applySkin(skin) {
  const s = skin === 'dog' ? 'md' : skin; /* 兼容旧版保存的 dog 值 */
  if (s === 'md') {
    document.body.dataset.skin = 'md';
  } else if (s === 'ios') {
    document.body.dataset.skin = 'ios';
  } else {
    delete document.body.dataset.skin;
  }
  /* 高亮设定页皮肤按钮 */
  document.querySelectorAll('.skin-opt').forEach(b => {
    b.classList.toggle('active', b.dataset.skin === (s || 'ac'));
  });
  /* 同步浏览器地址栏 / PWA 标题栏主题色（iOS 皮肤跟随系统深色模式） */
  const meta = document.querySelector('meta[name="theme-color"]');
  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const color = s === 'md' ? '#6750a4' : s === 'ios' ? (dark ? '#000000' : '#007AFF') : '#5fae82';
  if (meta) meta.setAttribute('content', color);
  /* iOS 皮肤：初始化 iOS 首页（最近搜尋 + 熱門車站） */
  if (s === 'ios') initIOSHome();
  /* 按皮肤套用文案语气（繁體） */
  applySkinLanguage();
}
function setSkin(skin) {
  applySkin(skin);
  try { localStorage.setItem(SKIN_KEY, skin); } catch (e) {}
  applyTheme(getTheme());   /* 皮肤变化后重新计算地址栏主题色 */
}
function toggleSkin() {
  const current = document.body.dataset.skin || 'ac';
  const order = ['ac', 'md', 'ios'];
  const next = order[(order.indexOf(current) + 1) % order.length];
  setSkin(next);
}

/* ==========================================================================
   设定页：深色模式 / 字号 / 自动刷新频率
   ========================================================================== */
const THEME_KEY = 'marvis_theme';
const FONTSIZE_KEY = 'marvis_fontsize';
const REFRESH_KEY = 'marvis_refresh';

function getTheme() { try { return localStorage.getItem(THEME_KEY) || 'system'; } catch (e) { return 'system'; } }
function applyTheme(theme) {
  if (theme === 'light') document.body.dataset.theme = 'light';
  else if (theme === 'dark') document.body.dataset.theme = 'dark';
  else delete document.body.dataset.theme;    /* 跟隨系統 */
  document.querySelectorAll('#themeSeg .seg-opt').forEach(b => b.classList.toggle('active', b.dataset.themeVal === theme));
  /* 地址栏 / PWA 主题色跟随皮肤与明暗 */
  const meta = document.querySelector('meta[name="theme-color"]');
  const skin = document.body.dataset.skin || 'ac';
  const dark = theme === 'dark' || (theme !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const color = skin === 'md' ? (dark ? '#141218' : '#6750a4')
    : skin === 'ios' ? (dark ? '#000000' : '#007AFF')
    : (dark ? '#16251c' : '#5fae82');
  if (meta) meta.setAttribute('content', color);
}
function setTheme(theme) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} applyTheme(theme); }

function getFontSize() { try { return localStorage.getItem(FONTSIZE_KEY) || 'md'; } catch (e) { return 'md'; } }
function applyFontSize(size) {
  document.documentElement.dataset.fontsize = (size === 'sm' || size === 'lg') ? size : 'md';
  document.querySelectorAll('#fontSeg .seg-opt').forEach(b => b.classList.toggle('active', b.dataset.sizeVal === size));
}
function setFontSize(size) { try { localStorage.setItem(FONTSIZE_KEY, size); } catch (e) {} applyFontSize(size); }

function getRefreshInterval() { try { return parseInt(localStorage.getItem(REFRESH_KEY) || '15', 10) || 0; } catch (e) { return 15; } }
function applyRefreshUI() {
  const v = String(getRefreshInterval());
  document.querySelectorAll('#refreshSeg .seg-opt').forEach(b => b.classList.toggle('active', b.dataset.refreshVal === v));
}
function setRefreshInterval(sec) {
  try { localStorage.setItem(REFRESH_KEY, String(sec)); } catch (e) {}
  applyRefreshUI();
  startAutoRefresh();   /* 立即按新频率重启定时器 */
}

/* ==========================================================================
   Bottom Navigation（搜寻 / 收藏 / 寿司郎）& FAB
   ========================================================================== */
const PAGE_KEY = 'marvis_page';
function switchPage(page) {
  document.querySelectorAll('section[data-page]').forEach(el => {
    el.style.display = (el.getAttribute('data-page') === page) ? '' : 'none';
  });
  document.querySelectorAll('.bn-item').forEach(b => {
    const on = b.getAttribute('data-page') === page;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page');
    else if (b.hasAttribute('aria-current')) b.removeAttribute('aria-current');
  });
  const fab = document.getElementById('fabMain');
  if (fab) fab.style.display = (page === 'home') ? 'flex' : 'none';
  document.body.dataset.page = page;
  try { localStorage.setItem(PAGE_KEY, page); } catch (e) {}
  if (page === 'favs') renderFavorites();   /* 进入收藏页时同步最新收藏 */
  window.scrollTo({ top: 0 });
}

/** FAB：收藏当前第一条搜索结果路线；无结果时跳转收藏页 */
function fabAction() {
  const card = document.querySelector('.results-section .transport-card');
  const btn = card ? card.querySelector('.fav-btn[data-fav-item]') : null;
  if (!btn) { switchPage('favs'); return; }
  try {
    const item = JSON.parse(btn.getAttribute('data-fav-item'));
    toggleFavByItem(item, btn);
    renderFavorites();
  } catch (err) { switchPage('favs'); }
}

/** iOS 底部导航「最近」：回到首页并滚动到最近搜尋区块 */
function iosGoRecent() {
  switchPage('home');
  /* 「最近」tab 单独高亮（data-page=recent 不会与 switchPage 的 home 匹配冲突） */
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  const recentBtn = document.querySelector('.bn-ios-only');
  if (recentBtn) recentBtn.classList.add('active');
  setTimeout(() => {
    const g = document.querySelector('.ios-home .ios-group');
    if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

document.addEventListener('DOMContentLoaded', () => {
  /* Apply saved skin */
  let savedSkin = 'ac';
  try { savedSkin = localStorage.getItem(SKIN_KEY) || 'ac'; } catch (e) {}
  applySkin(savedSkin);
  /* 设定页：深色模式 / 字号 / 刷新频率 */
  applyTheme(getTheme());
  applyFontSize(getFontSize());
  applyRefreshUI();
  applySkinLanguage();

  /* Apply saved page (bottom nav) */
  let savedPage = 'home';
  try { savedPage = localStorage.getItem(PAGE_KEY) || 'home'; } catch (e) {}
  switchPage(savedPage);

  /* Transport type toggle */
  document.getElementById('transportToggle').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      setTransport(e.target.dataset.type);
      /* Clear results */
      document.getElementById('resultsContainer').innerHTML = '<div class="empty-hint">' + t('empty.search') + '</div>';
    }
  });

  /* iOS 最近搜尋列表点击委托（data 属性，避免内联 onclick 转义问题） */
  const iosRecentListEl = document.getElementById('iosRecentList');
  if (iosRecentListEl) {
    iosRecentListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.ios-list-item');
      if (!btn) return;
      const q = btn.getAttribute('data-q');
      const type = btn.getAttribute('data-type') || 'all';
      if (q != null && q !== '') iosSearchHistory(q, type);
    });
  }

  /* Initial render */
  renderFavorites();
  startAutoRefresh();

  /* Initial weather & sushiro & K75P load */
  refreshWeather();
  refreshSushiro();
  loadK75PAllStops();

  /* Initial status */
  setStatus('ok');

  /* Global event delegation for favorite buttons */
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;
    e.preventDefault();
    const itemJson = btn.getAttribute('data-fav-item');
    if (!itemJson) return;
    try {
      const item = JSON.parse(itemJson);
      toggleFavByItem(item, btn);
    } catch (err) {
      console.error('Favorite parse error:', err);
    }
  });

  /* Route card click → 全线候车详情（排除收藏按钮） */
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.route-card[data-route-item]');
    if (!card) return;
    if (e.target.closest('.fav-btn') || e.target.closest('.fav-remove-btn')) return;
    e.preventDefault();
    try {
      const item = JSON.parse(card.getAttribute('data-route-item'));
      openRouteDetail(item);
    } catch (err) {
      console.error('Route detail parse error:', err);
    }
  });

  /* Route card 键盘操作（Enter/Space 打开详情） */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest ? e.target.closest('.route-card[data-route-item]') : null;
    if (!card) return;
    if (e.target.closest('.fav-btn') || e.target.closest('.fav-remove-btn') || e.target.closest('.ds-pick')) return;
    e.preventDefault();
    try {
      const item = JSON.parse(card.getAttribute('data-route-item'));
      openRouteDetail(item);
    } catch (err) {
      console.error('Route detail parse error:', err);
    }
  });

  /* 点遮罩关闭详情 */
  document.getElementById('detailMask').addEventListener('click', closeRouteDetail);

  /* Esc 关闭详情弹层 */
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeRouteDetail(); });
});

/* Cleanup on page unload */
window.addEventListener('beforeunload', () => {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
});
