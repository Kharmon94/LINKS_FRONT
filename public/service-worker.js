/* Basic PWA service worker (cache-first for app shell). */
const CACHE_NAME = 'links-pwa-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/maskable.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never cache API requests; always go to network.
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/users')) return;

  // SPA navigation fallback to index.html.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match('/index.html')) || Response.error();
        }
      })()
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'))) {
        cache.put(req, res.clone());
      }
      return res;
    })()
  );
});

