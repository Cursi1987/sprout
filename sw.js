const CACHE = 'cursipaps-v' + Date.now();
const FILES = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  // Notificar a todos los clientes que hay actualización
  self.clients.matchAll().then(clients => 
    clients.forEach(client => client.postMessage({type:'UPDATE'}))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    // Siempre intentar red primero, caché como respaldo
    fetch(e.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
