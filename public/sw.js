const CACHE_VERSION = 'as-siddique-pwa-v1';

function getScopeBase() {
  const scopeUrl = new URL(self.registration.scope);
  return scopeUrl.pathname.endsWith('/') ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
}

function getCoreShellAssets() {
  const base = getScopeBase();
  return [
    base,
    `${base}index.html`,
    `${base}offline.html`,
    `${base}manifest.webmanifest`,
    `${base}pwa-192x192.png`,
    `${base}pwa-512x512.png`,
    `${base}pwa-maskable-512x512.png`,
    `${base}apple-touch-icon.png`,
    `${base}icon.svg`,
  ];
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const assets = getCoreShellAssets();
      await Promise.allSettled(
        assets.map(async (url) => {
          const response = await fetch(url, { cache: 'reload' });
          if (response.ok) {
            await cache.put(url, response);
          }
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const base = getScopeBase();
  if (!url.pathname.startsWith(base)) return;

  const relativePath = url.pathname.slice(base.length);
  if (
    relativePath.startsWith('api/') ||
    relativePath.startsWith('__/') ||
    relativePath.startsWith('.well-known/') ||
    relativePath.startsWith('media/') ||
    /\.pdf$/i.test(url.pathname)
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          const cachedIndex = await caches.match(`${base}index.html`);
          if (cachedIndex) return cachedIndex;
          const offlineFallback = await caches.match(`${base}offline.html`);
          return offlineFallback || Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            void caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
