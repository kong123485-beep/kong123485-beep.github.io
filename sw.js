const CACHE_NAME = 'dees-library-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// 安裝階段：預先快取主目錄核心檔案
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 啟動階段：清除舊版本快取
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截請求：網路優先 (Network First)，確保新增連結即時更新，斷網時自動讀取快取
self.addEventListener('fetch', (e) => {
  // 只處理同網域的資源快取
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => caches.match(e.request))
  );
});
