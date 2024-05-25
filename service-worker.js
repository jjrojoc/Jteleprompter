var APP_PREFIX = 'ApplicationName_'     // Identifier for this app (this needs to be consistent across every cache update)
var VERSION = 'version_1040'              // Version of the off-line cache (change this value everytime you want to update cache)
var CACHE_NAME = APP_PREFIX + VERSION
const URLS = [
  './',
  './manifest.json',
  './index.html?v=1040',
  './style.css?v=1040',
  './script.js?v=1040',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
      self.skipWaiting();
  }
});

// // Respond with cached resources
// self.addEventListener('fetch', function (e) {
//   console.log('fetch request : ' + e.request.url)
//   e.respondWith(
//     caches.match(e.request).then(function (request) {
//       if (request) { // if cache is available, respond with cache
//         console.log('responding with cache : ' + e.request.url)
//         return request
//       } else {       // if there are no cache, try fetching request
//         console.log('file is not cached, fetching : ' + e.request.url)
//         return fetch(e.request)
//       }

//       // You can omit if/else for console.log & put one line below like this too.
//       // return request || fetch(e.request)
//     })
//   )
// });

self.addEventListener('fetch', function(event) {
  event.respondWith(
      fetch(event.request)
          .then(function(response) {
              // Si la respuesta es válida, la almacena en caché y la devuelve
              if (!response || response.status !==200 || response.type !== 'basic') {
                  return response;
              }

              var responseToCache = response.clone();

              caches.open(CACHE_NAME)
                  .then(function(cache) {
                      cache.put(event.request, responseToCache);
                  });

              return response;
          })
          .catch(function(error) {
              // Si la red falla, intenta recuperar la respuesta desde la caché
              console.log('Fetching failed; returning cached page instead.', error);
              return caches.match(event.request);
          })
  );
});




// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(URLS)
    })
  )
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheDeletePromises = keyList.map(function (key) {
                if (key.startsWith(APP_PREFIX) && key !== CACHE_NAME) {
                    console.log('Deleting old cache:', key);
                    return caches.delete(key);
                }
            }).filter(promise => promise !== undefined); // Filtramos undefined de la matriz.

            return Promise.all(cacheDeletePromises);
        }).then(() => {
            console.log('Service Worker activated and old caches cleaned');
            self.clients.claim(); // Este paso es importante para que el nuevo SW tome control inmediato.
        })
    );
});
