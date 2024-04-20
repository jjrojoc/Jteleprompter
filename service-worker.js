var APP_PREFIX = 'ApplicationName_'     // Identifier for this app (this needs to be consistent across every cache update)
var VERSION = 'version_057'              // Version of the off-line cache (change this value everytime you want to update cache)
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

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
      self.skipWaiting();
  }
});

// Respond with cached resources
self.addEventListener('fetch', function (e) {
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
          // El Promise.all espera por todas las promesas pasadas a ser resueltas.
          return Promise.all(keyList.map(function (key) {
              // Eliminar todas las caches que no son la caché actual.
              if (key.startsWith(APP_PREFIX) && key !== CACHE_NAME) {
                  console.log('Deleting old cache:', key);
                  return caches.delete(key);
              }
          }));
      })
  ).then(() => {
      console.log('Service Worker activated and old caches cleaned');
      // Cuando el nuevo SW se activa, toma el control inmediatamente de las páginas abiertas.
      self.clients.claim();
  });
});
