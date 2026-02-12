const CACHE_NAME = "tabla-loop-lab-v2";

const APP_SHELL = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "manifest.webmanifest",
  "assets/icons/icon.svg",
];

const SAMPLE_FILES = [
  "assets/samples/tabla_dhec.flac",
  "assets/samples/tabla_ghe1.flac",
  "assets/samples/tabla_ghe2.flac",
  "assets/samples/tabla_ke1.flac",
  "assets/samples/tabla_na.flac",
  "assets/samples/tabla_na_s.flac",
  "assets/samples/tabla_tas1.flac",
  "assets/samples/tabla_te1.flac",
  "assets/samples/tabla_te2.flac",
  "assets/samples/tabla_te_ne.flac",
  "assets/samples/tabla_tun1.flac",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...APP_SHELL, ...SAMPLE_FILES]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isPageRequest =
    request.mode === "navigate" || request.destination === "document" || request.url.endsWith(".html");

  if (isPageRequest) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match("index.html"));
    })
  );
});
