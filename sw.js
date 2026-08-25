const CACHE = 'aurora-music-v3';
const APP = ['./', './index.html', './app.html', './live-jamendo.js', './lyrics.js', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => event.respondWith(fetch(event.request).then(response => {
  if (event.request.method === 'GET' && new URL(event.request.url).origin === location.origin) {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
  }
  return response;
}).catch(() => caches.match(event.request))));
