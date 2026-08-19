/* ==========================================================================
   森友出行手册 - 多皮肤文案层（繁體中文，按皮膚定製語氣）
   --------------------------------------------------------------------------
   - md / ios：標準香港正體，中性正式（符合 Material / Apple HIG 用語習慣）
   - ac：標準國語正體 + 動物森友會式暖系俏皮語氣（～、吧、找找看、最愛）
   用法：
     1. 靜態 HTML：在元素加 data-t="key"，applySkinLanguage() 會按皮膚套用文字
     2. 動態 JS：呼叫 t('key') 取得當前皮膚文字
   ========================================================================== */

const SKIN_STRINGS = {
  /* 底部導航 */
  'nav.search':   { md: '搜尋', ios: '首頁', ac: '找找看' },
  'nav.recent':   { md: '最近', ios: '最近', ac: '最近' },
  'nav.favs':     { md: '收藏', ios: '收藏', ac: '最愛' },
  'nav.sushi':    { md: '壽司郎', ios: '壽司郎', ac: '壽司郎' },
  'nav.settings': { md: '設定', ios: '更多', ac: '設定' },

  /* 標題 */
  'title.results':  { md: '搜尋結果', ios: '搜尋結果', ac: '找到的路線' },
  'title.favs':     { md: '我的收藏', ios: '收藏', ac: '我的最愛' },
  'title.sushi':    { md: '壽司郎排隊', ios: '壽司郎排隊', ac: '壽司郎排隊' },
  'title.settings': { md: '設定', ios: '設定', ac: '設定' },
  'title.k75p':     { md: 'K75P 全線實時', ios: 'K75P 全線實時', ac: 'K75P 全線實時' },
  'title.weather':  { md: '天氣', ios: '天氣', ac: '今日天氣' },

  /* 按鈕 / 狀態 */
  'btn.search':  { md: '搜尋', ios: '搜尋', ac: '找找看' },
  'btn.refresh': { md: '手動重新整理', ios: '重新整理', ac: '重新整理' },
  'status.ready': { md: '就緒', ios: '就緒', ac: '準備好了' },
  'loading.search': { md: '搜尋中…', ios: '搜尋中…', ac: '正在找…' },
  'loading.update': { md: '更新中…', ios: '更新中…', ac: '更新中…' },
  'loading.detail': { md: '載入全線候車時間…', ios: '載入全線候車時間…', ac: '載入全線候車時間…' },
  'loading.stops':  { md: '載入車站列表…', ios: '載入車站列表…', ac: '載入車站列表…' },
  'loading.favs':   { md: '載入實時資料中…', ios: '載入實時資料中…', ac: '載入實時資料中…' },
  'loading.k75p':   { md: '載入 K75P 全線資料中…', ios: '載入 K75P 全線資料中…', ac: '載入 K75P 全線資料中…' },
  'loading.weather': { md: '載入天氣中…', ios: '載入天氣中…', ac: '看看今日天氣…' },

  /* 空狀態 / 提示 */
  'empty.search': { md: '請在上方搜尋巴士路線或港鐵車站', ios: '請在上方搜尋巴士路線或港鐵車站', ac: '在上面找找巴士路線或港鐵車站吧～' },
  'empty.favs':   { md: '搜尋路線後按 ☆ 收藏到首頁', ios: '搜尋路線後按 ☆ 加到收藏', ac: '找到喜歡的路線後，按 ☆ 加進最愛吧～' },
  'empty.noresult': { md: '沒有結果', ios: '沒有結果', ac: '暫時沒有結果～' },
  'empty.nofav':    { md: '暫無收藏路線', ios: '暫無收藏路線', ac: '最愛還是空的～' },
};

/** 取得當前皮膚下的文案 */
function t(key) {
  const s = SKIN_STRINGS[key];
  if (!s) return key;
  let skin = 'ac';   /* 無 data-skin 即為默認 AC 皮膚 */
  try { if (typeof document !== 'undefined' && document.body && document.body.dataset) skin = document.body.dataset.skin || 'ac'; } catch (e) {}
  return s[skin] || s.md || key;
}

/** 套用靜態 HTML 的 data-t 文案 */
function applySkinLanguage() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    if (key) el.textContent = t(key);
  });
}
