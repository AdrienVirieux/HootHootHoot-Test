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

// -----------------------------------------------
// bouton d'installation
let deferredPrompt;
const addBtn = document.getElementById('add-button');
addBtn.style.display = 'block';

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt  
    e.preventDefault();
    // Stash the event so it can be triggered later.  
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen  
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', (e) => {
        // hide our user interface that shows our A2HS button  
        addBtn.style.display = 'none';
        // Show the prompt  
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt  
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    });
});