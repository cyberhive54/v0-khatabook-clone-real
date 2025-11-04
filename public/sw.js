const CACHE_NAME = 'v0-app-cache-v1';
const PRECACHE_URLS = [
  '/', 
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install: precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: Cache-first for navigation/GET, then network fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // skip non-GET requests
  if (req.method !== 'GET') return;

  // Prefer cache for navigations (fast offline load)
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            // cache successful responses for future offline use
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, resClone).catch(() => {});
            });
            return res;
          })
          .catch(() => caches.match('/')) // fallback to index if available
      })
    );
    return;
  }

  // For other requests: try cache, then network, then cache fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // store runtime responses
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, resClone).catch(() => {});
          });
          return res;
        })
        .catch(() => {
          // optional: return cached image/placeholders if you added them to precache
          return caches.match(req);
        });
    })
  );
});
