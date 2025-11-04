const CACHE_NAME = 'v0-app-cache-v2';

const PRECACHE_URLS = [
  '/', 
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html', // fallback page (optional but recommended)
];

// ✅ Install — safely pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        // Try caching all URLs
        await cache.addAll(PRECACHE_URLS);
        console.log('[Service Worker] Pre-caching complete.');
      } catch (err) {
        // If any URL fails (e.g., 404), log it instead of breaking install
        console.warn('[Service Worker] Some assets failed to cache:', err);
      }
    })()
  );
  self.skipWaiting();
});

// ✅ Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch — cache-first for navigation, network fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // HTML/navigation requests
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          // Try network first (ensures updates)
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (err) {
          // Offline fallback — use cache or offline.html
          const cached = await cache.match(req);
          return cached || (await cache.match('/offline.html'));
        }
      })()
    );
    return;
  }

  // Other requests (assets, images, etc.)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match('/offline.html')); // last resort
    })
  );
});
