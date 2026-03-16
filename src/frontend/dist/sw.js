// Gully Scorer Pro — Service Worker
const CACHE_NAME = 'gully-scorer-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Cache-first for assets, network-first for API
  if (event.request.url.includes('/api/')) return;
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) =>
        cached || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        })
      )
    )
  );
});
