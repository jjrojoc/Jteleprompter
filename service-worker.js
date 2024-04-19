var APP_PREFIX = 'ApplicationName_'     // Identifier for this app (this needs to be consistent across every cache update)
var VERSION = 'version_027'              // Version of the off-line cache (change this value everytime you want to update cache)
var CACHE_NAME = APP_PREFIX + VERSION
const URLS = [
  './',
  './manifest.json',
  './index.html',
  './style.css',
  './script.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Respond with cached resources
/* self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) { // if cache is available, respond with cache
        console.log('responding with cache : ' + e.request.url)
        return request
      } else {       // if there are no cache, try fetching request
        console.log('file is not cached, fetching : ' + e.request.url)
        return fetch(e.request)
      }

      // You can omit if/else for console.log & put one line below like this too.
      // return request || fetch(e.request)
    })
  )
})
*/

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
    .then(function(response) {
      return caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, response.clone());
        return response;
      });
    })
    .catch(function(error) {
      return caches.match(event.request);
    })
  );
});

// Cache resources
/* self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(URLS)
    })
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX) === 0; // Se asegura de incluir solo cachés que empiecen con APP_PREFIX
      });
      cacheWhitelist.push(CACHE_NAME);

      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i]);
          return caches.delete(keyList[i]);
        }
      }));
    })
  );
});
*/

self.addEventListener('install', event => {
  self.skipWaiting(); // Hace que el Service Worker se active inmediatamente
});

self.addEventListener('activate', event => {
  var cacheKeeplist = [CACHE_NAME];

  event.waitUntil(
    clients.claim();// Toma el control de las páginas abiertas inmediatamente
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (cacheKeeplist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});
