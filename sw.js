/* Stock Genius Analyzer — minimal service worker */
const CACHE = 'sg-analyzer-v1';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // never cache live data (stock/gemini/yahoo) — always go network
  if (url.includes('indianapi.in') || url.includes('googleapis.com') ||
      url.includes('finance.yahoo.com') || url.includes('corsproxy') ||
      url.includes('allorigins')) {
    return; // default browser fetch
  }
  // app shell: cache-first, fall back to network
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
