const CACHE_NAME = 'newton-lab-cache-v3';
const ASSETS = [
  '/',
  '/manifest.json',
  '/static/icon.svg',
  '/static/App.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@300;400;600;700&display=swap',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
  'https://unpkg.com/@babel/standalone@7.26.4/babel.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Separar recursos locales de recursos CDN externos
      const localAssets = ASSETS.filter(url => url.startsWith('/') || url.startsWith('.') || !url.startsWith('http'));
      const externalAssets = ASSETS.filter(url => url.startsWith('http'));

      return cache.addAll(localAssets).then(() => {
        // Cargar recursos externos con no-cors para evitar bloqueos de política del navegador
        const externalPromises = externalAssets.map((url) => {
          return fetch(new Request(url, { mode: 'no-cors' }))
            .then((response) => {
              return cache.put(url, response);
            })
            .catch(err => console.warn('Caching error for external asset during install:', url, err));
        });
        return Promise.all(externalPromises);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones de la API y de App.js para garantizar datos en vivo siempre
  if (event.request.url.includes('/api/') || event.request.url.includes('/static/App.js')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (event.request.method === 'GET' && response.status === 200 && 
            (event.request.url.startsWith('http') || event.request.url.includes('/static/'))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
