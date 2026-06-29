// SIM KBM Ustaz V2.0 - Service Worker
const CACHE_NAME = 'simkbm-v3.0.0'; // Changed version to clear old cache
const STATIC_ASSETS = [
  '/manifest.json'
  // Note: Don't cache index.html - let browser always fetch fresh
];

// Install event - cache static assets only
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.error('[SW] Error during install:', err);
        // Don't fail install if static assets can't be cached
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name.startsWith('simkbm-'))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // NEVER cache HTML pages - always fetch fresh from network
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache HTML
          return response;
        })
        .catch((error) => {
          console.error('[SW] Fetch error:', error);
          // Return offline page only for navigation
          if (event.request.mode === 'navigate') {
            return new Response(
              '<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui"><div style="text-align:center"><h1>Offline</h1><p>Tidak dapat terhubung ke server. Periksa koneksi internet Anda.</p></div></body></html>',
              { 
                status: 503, 
                headers: { 'Content-Type': 'text/html' } 
              }
            );
          }
          return new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // For API requests (Supabase) - network only, no cache
  if (url.hostname.includes('supabase.co') || url.pathname.includes('/functions/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => {
          return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // For other assets (JS, CSS, fonts, images) - cache first, fallback to network
  if (url.pathname.match(/\.(js|css|woff2?|ttf|svg|png|jpg|jpeg|gif|webp)$/i)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Update cache in background
            fetch(event.request).then(response => {
              if (response && response.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, response.clone());
                });
              }
            }).catch(() => {
              // Silently fail if network is down
            });
            return cachedResponse;
          }

          // Not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              // Clone and cache successful responses
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              // Return placeholder if offline
              return new Response('Asset not available offline', { status: 503 });
            });
        })
    );
    return;
  }

  // Default: network first, no cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline', { status: 503 });
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Syncing data...');
  // Placeholder for background sync logic
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'SIM KBM Ustaz';
  const options = {
    body: data.body || 'Ada notifikasi baru',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
