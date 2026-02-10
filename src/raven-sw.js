self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});


async function handle(request) {
  console.log('[RAVEN]', request.method, request.url);

  // IMPORTANT: pass through unchanged
  return fetch(request);
}
