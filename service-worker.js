var CACHE_NAME = '_HotHotHot_offline';
var urlCache = [
    "/",
    "/img/menu-bar.png",
    "/img/star-empty.png",
    "/img/star.png",
    "/img/logoTrash.png",
    "/scripts/main.js",
    "/scripts/graph.js",
    "/scripts/chartDateAdaptater.js",
    "/styles/bootstrap.css",
    "/styles/style.css",
    "/index.html"
];

// Charge les ressources puis les mets dans le cache
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("Cashe Opened");
            return cache.addAll(urlCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log(event.request);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            // Cache Trouvé - retourne la réponse
            if (response) return response;
            return fetch(event.request).then(function(response) {
                // On clone la réponse
                var responseToCache = response.clone();
                // On met le clone dans le cache
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseToCache);
                });
                // On retourne la réponse au navigateur
                return response;
            })
        }).catch(function() {
            // Si pas de cache et serveur offline on fallback sur la page offline
            return caches.match('/offline.html');
        })
    );
});




