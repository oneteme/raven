// Install event — activate immediately
self.addEventListener('install', event => {
  console.log("[RAVEN SW] install");
  self.skipWaiting();
});

// Activate event — take control of all pages immediately
self.addEventListener('activate', event => {
  console.log("[RAVEN SW] activate");
  event.waitUntil(self.clients.claim());
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  console.log("[RAVEN SW] fetch intercepted:", event.request.method, event.request.url);

  event.respondWith(handleRequest(event.request));
});

// Handle requests
async function handleRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (err) {
    console.error("[RAVEN SW] fetch error:", err);
    return new Response('SW fetch error', { status: 500 });
  }
}

// Optional: listen for messages (skipWaiting)
self.addEventListener('message', event => {
  if (event.data?.action === 'skipWaiting') {
    console.log("[RAVEN SW] skipWaiting received");
    self.skipWaiting();
  }
});
