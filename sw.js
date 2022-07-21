var staticCacheName = "myfinances_2022_07_21_20_24";
this.addEventListener("install", (event) => {
  this.skipWaiting();

  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        "/assets",
        "/pages",
        "/services",
        "/404.html",
        "/firebase.json",
        "/index.html",
        "/index.js",
      ]);
    })
  );
});

this.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("myfinances_"))
          .filter((cacheName) => cacheName !== staticCacheName)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

this.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        console.log("sw fetch - response", response);

        return response || fetch(event.request);
      })
      .catch(() => {
        return caches.match("/offline");
      })
  );
});
