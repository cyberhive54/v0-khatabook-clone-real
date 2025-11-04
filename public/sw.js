// public/sw.js
const CACHE_NAME = 'v0-app-cache-v2';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Install: pre-cache core assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(PRECACHE_URLS);
        console.log('[Service Worker] Pre-caching complete.');
      } catch (err) {
        console.warn('[Service Worker] Some assets failed to cache:', err);
      }
    })()
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      );
      console.log('[Service Worker] Activation complete.');
    })()
  );
  self.clients.claim();
});

// Fetch: handle only HTTP/HTTPS GETs and avoid extension schemes
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    // If URL is invalid, ignore
    return;
  }

  // Ignore non-http(s) schemes (chrome-extension://, about:, moz-extension://, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Navigation requests (pages)
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          // Try network first (gives freshest content)
          const fresh = await fetch(req);
          // Only cache successful responses (status 200) and basic responses
          if (fresh && fresh.status === 200 && fresh.type === 'basic') {
            cache.put(req, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch (err) {
          // On failure, fall back to cache or offline page
          const cached = await cache.match(req);
          return cached || (await cache.match('/offline.html'));
        }
      })()
    );
    return;
  }

  // Other resources (images, scripts, fonts): try cache first, then network
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const response = await fetch(req);
        // guard: only cache valid responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, responseClone).catch(() => {});
        }
        return response;
      } catch (err) {
        // final fallback
        return caches.match('/offline.html');
      }
    })()
  );
});
