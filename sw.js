/* 森友出行手册 - Service Worker */
const CACHE_NAME = 'senyou-transport-v23';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './css/base.css',
  './css/skin-md.css',
  './css/skin-ios.css',
  './css/skin-wp8.css',
  './js/i18n.js',
  './js/data.js',
  './js/util.js',
  './js/api.js',
  './js/render.js',
  './js/ios-home.js',
  './js/main.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 网络优先，失败回退缓存；跨域 API 请求不缓存，保持实时 */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return resp;
      })
      .catch(() =>
        caches.match(e.request).then((hit) => hit || caches.match('./index.html'))
      )
  );
});
