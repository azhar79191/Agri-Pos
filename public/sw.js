// Retirement worker kept at the old URL so existing installations can update.
// It does not cache requests or provide offline/install functionality.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.allSettled(keys.filter(key => key.startsWith('agrinest-')).map(key => caches.delete(key)));
    } finally { await self.registration.unregister(); }
  })());
});
