const CACHE_NAME = 'game-be-hoc-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith(self.location.origin) && event.request.method === 'GET') {
            // Không cache các file ảnh lớn hoặc media dynamically để tránh tràn RAM trên mobile
            if (!event.request.url.match(/\.(jpg|jpeg|png|mp3|mp4)$/i)) {
              cache.put(event.request, fetchRes.clone());
            }
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
