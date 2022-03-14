self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('fox-store').then((cache) => cache.addAll([
        "/img/menu-bar.png",
        "/img/star-empty.png",
        "/img/star.png",
        "/scripts/main.js",
        "/scripts/graph.js",
        "/scripts/chart.js",
        "/styles/bootstrap.css",
        "/styles/style.css",
        "/offline.html"
      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });
  