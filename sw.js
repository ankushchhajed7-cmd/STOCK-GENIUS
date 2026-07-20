/* Stock Genius Analyzer — service worker v3
   NO CACHING. Pure network passthrough. Fixes stale-file problem permanently.
   (Keeps a fetch handler only so the app stays installable.) */
const CACHE = 'sg-analyzer-v3';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k)))) // wipe ALL old caches
      .then(() => self.clients.claim())
  );
});

// Always go to network. Cache nothing. App will always load the latest deploy.
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => new Response('', {status: 504})));
});
