const CACHE = 'aurora-music-v1';
const APP = ['./', './index.html', './manifest.webmanifest', './icon.svg', '../aurora-dual-library.html'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request))));
