var CACHE_NAME = '_HotHotHot_offline';
var urlCache = [
    "/",
    "/img/menu-bar.png",
    "/img/star-empty.png",
    "/img/star.png",
    "/img/logoTrash.png",
    "/scripts/main.js",
    "/scripts/graph.js",
    "/scripts/connect.js",
    "/scripts/storage.js",
    "/scripts/chartDateAdaptater.js",
    "/scripts/chart.js",
    "/styles/bootstrap.css",
    "/styles/style.css",
    "/documentation.html",
    "/index.html"
];

// Charge les ressources puis les mets dans le cache
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log("Cashe Opened");
            return cache.addAll(urlCache);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Cloner la requête.
                // Une requete est un flux et est à consommation unique
                // Il est donc nécessaire de copier la requete pour pouvoir l'utiliser et la servir
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function (response) {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Même constat qu'au dessus, mais pour la mettre en cache
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

