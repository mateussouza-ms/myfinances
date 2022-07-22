var staticCacheName = "myfinances_2022_07_21_20_24";
this.addEventListener("install", (event) => {
  this.skipWaiting();

  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        "/assets/expense.svg",
        "/assets/favicon.png",
        "/assets/google-icon.svg",
        "/assets/icon-meta.png",
        "/assets/icon_48x48.png",
        "/assets/icon_72x72.png",
        "/assets/icon_96x96.png",
        "/assets/icon_144x144.png",
        "/assets/icon_168x168.png",
        "/assets/icon_192x192.png",
        "/assets/icon_512x512.png",
        "/assets/icon_640x640.png",
        "/assets/income.svg",
        "/assets/logo.svg",
        "/assets/manifest.json",
        "/assets/minus.svg",
        "/assets/plus.svg",
        "/assets/total.svg",
        "/pages/Auth/index.html",
        "/pages/Auth/styles.css",
        "/pages/Home/index.html",
        "/pages/Home/styles.css",
        "/services/firebase.js",
        "/404.html",
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
