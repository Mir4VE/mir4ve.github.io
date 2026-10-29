/* MIR4VE offline app shell cache. */
'use strict';

const CACHE_NAME = 'mir4ve-shell-local-v3';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/styles.css', './css/visual-enhancements.css',
  './js/site-core.js', './js/ui-localization.js', './js/reading-mode.js',
  './js/floating-event.js', './js/local-notifications.js',
  './js/token-exdra.js', './js/token-wemix.js', './js/token-hydra-draco.js',
  './js/tailwind-config.js', './favicon.ico', './favicon-16.png', './favicon-32.png', './favicon-48.png',
  './apple-touch-icon.png', './pwa-icon-192.png', './pwa-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Optional entries must not prevent installation if a remote/static asset is unavailable.
    await Promise.all(APP_SHELL.map(path => cache.add(path).catch(() => undefined)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('mir4ve-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Network-first keeps deployed files fresh; cached same-origin assets are the offline fallback.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
