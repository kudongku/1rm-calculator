const CACHE_NAME = "1rm-calculator-v1";
const urlsToCache = [
  "/1rm-calculator/",
  "/1rm-calculator/index.html",
  "/1rm-calculator/styles.css",
  "/1rm-calculator/script.js",
  "/1rm-calculator/images/bench.png",
  "/1rm-calculator/images/squat.png",
  "/1rm-calculator/images/dead.png",
  "/1rm-calculator/images/favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
