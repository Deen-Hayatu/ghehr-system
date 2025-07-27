/* eslint-disable no-restricted-globals */

// GhEHR Service Worker for PWA functionality
const CACHE_NAME = 'ghehr-v1.0.0';
const STATIC_CACHE_NAME = 'ghehr-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'ghehr-dynamic-v1.0.0';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\/api\/patients/,
  /\/api\/appointments/,
  /\/api\/notes/,
  /\/api\/lab-orders/,
  /\/api\/billing/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files
  if (STATIC_FILES.some(file => url.pathname === file || url.pathname.startsWith(file))) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default: try network first, fallback to cache
  event.respondWith(handleDefaultRequest(request));
});

// Handle API requests - Cache First with Network Fallback
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // For read operations, try cache first
    if (isReadOperation(url.pathname)) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('📱 Serving API from cache:', url.pathname);
        
        // Try to update cache in background
        updateCacheInBackground(request);
        
        return cachedResponse;
      }
    }

    // Try network request
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful GET responses
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
        console.log('📦 Cached API response:', url.pathname);
      }
      
      return networkResponse;
    }
    
    // Network failed, try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📱 Network failed, serving from cache:', url.pathname);
      return cachedResponse;
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('🌐 Network unavailable for:', url.pathname);
    
    // Network unavailable, serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📱 Serving from cache (offline):', url.pathname);
      return cachedResponse;
    }
    
    // Return offline page for failed requests
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Currently offline. Changes will sync when connection is restored.' },
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static file requests - Cache First
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Handle navigation requests - Network First with Cache Fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
  } catch (error) {
    console.log('🌐 Navigation request failed, serving from cache');
  }

  // Fallback to cached index.html
  const cachedResponse = await caches.match('/');
  return cachedResponse || new Response('Offline', { 
    status: 503,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Handle default requests - Network First
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Update cache in background without blocking response
function updateCacheInBackground(request) {
  // Don't await this - let it run in background
  fetch(request)
    .then(response => {
      if (response.ok) {
        caches.open(DYNAMIC_CACHE_NAME)
          .then(cache => cache.put(request, response));
      }
    })
    .catch(() => {
      // Ignore background update failures
    });
}

// Check if the request is a read operation
function isReadOperation(pathname) {
  // GET requests for data retrieval
  return !pathname.includes('/create') && 
         !pathname.includes('/update') && 
         !pathname.includes('/delete');
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'ghehr-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  console.log('🔄 Performing background sync...');
  
  try {
    // Notify the main app to start syncing
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        action: 'START_SYNC'
      });
    });
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('📨 Push notification received');
  
  const options = {
    body: 'You have new updates in GhEHR',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open GhEHR',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      }
    ]
  };
  
  if (event.data) {
    const notificationData = event.data.json();
    options.body = notificationData.body || options.body;
    options.data = { ...options.data, ...notificationData.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('GhEHR Notification', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll().then(clients => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  const { type, action } = event.data;
  
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (type === 'CACHE_UPDATE') {
    // Clear cache and update
    caches.delete(DYNAMIC_CACHE_NAME)
      .then(() => console.log('🗑️ Cache cleared for update'));
  }
});

console.log('🚀 GhEHR Service Worker loaded successfully');
