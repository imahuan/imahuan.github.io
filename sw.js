const CACHE_NAME = "imahuan-cache-v1";
const FONT_BASE_URL = "https://gw.alipayobjects.com/os/k/jinkai/";
const IMMUTABLE_ASSETS = [
  "https://gw.alipayobjects.com/os/k/s3/lightense.min.js",
  "https://2.gravatar.com/avatar/92ed4ee998cb83c10bbce4486d951bae3666e59895cefcc0c893530b7a1d8f6b?s=256", // Favicon/Logo
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const isImmutableAsset =
    IMMUTABLE_ASSETS.includes(url) ||
    url.startsWith(FONT_BASE_URL) ||
    url.includes("/css/jinkai.css");

  if (isImmutableAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            (response.type !== "cors" && response.type !== "basic")
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      }),
    );
  }
});
