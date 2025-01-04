const CACHE_NAME = 'tastetuner-cache-v1';
const TESSERACT_CACHE = 'tesseract-cache';
const ANALYTICS_QUEUE = 'analytics-queue';

// Files to cache for offline use
const CACHE_FILES = [
  '/',
  '/app.css',
  '/app.js',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/badge-96.png',
  '/icons/follow-notification.png',
  '/icons/share-notification.png',
  '/icons/recommendation-notification.png',
  '/icons/rating-notification.png'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== TESSERACT_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const options = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge-96.png',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options).then(() => {
      // Track notification display
      return queueAnalytics({
        type: 'event',
        category: 'notification',
        action: 'display',
        label: payload.title,
        metadata: {
          notificationType: payload.data?.notification?.type
        }
      });
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Track notification interaction
  queueAnalytics({
    type: 'event',
    category: 'notification',
    action: 'click',
    label: event.notification.title,
    metadata: {
      action: event.action,
      notificationType: event.notification.data?.notification?.type
    }
  });

  if (event.action === 'dismiss') return;

  // Open the target URL if provided
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((windowClients) => {
        // Try to focus an existing window
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window exists, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Handle analytics endpoints differently
  if (event.request.url.includes('/api/analytics')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If offline, store the analytics event
        return event.request
          .json()
          .then((data) => {
            return queueAnalytics(data).then(() => {
              return new Response(JSON.stringify({ queued: true }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
          })
          .catch(() => {
            return new Response(JSON.stringify({ error: 'Failed to queue analytics' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
    );
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'You are offline. Please try again when you have an internet connection.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // For other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // If not in cache, return offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html');
          }
          return new Response('Offline content not available');
        });
      })
  );
});

// Background sync for pending scans and analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'process-pending-scans') {
    event.waitUntil(processPendingScans());
  } else if (event.tag === 'process-analytics') {
    event.waitUntil(processAnalyticsQueue());
  }
});

// Helper function to queue analytics events
async function queueAnalytics(event) {
  const db = await openDB();
  const tx = db.transaction(ANALYTICS_QUEUE, 'readwrite');
  const store = tx.objectStore(ANALYTICS_QUEUE);
  await store.add({
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date()
  });
}

// Helper function to process analytics queue
async function processAnalyticsQueue() {
  const db = await openDB();
  const tx = db.transaction(ANALYTICS_QUEUE, 'readonly');
  const store = tx.objectStore(ANALYTICS_QUEUE);
  const events = await store.getAll();

  for (const event of events) {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (response.ok) {
        const deleteTx = db.transaction(ANALYTICS_QUEUE, 'readwrite');
        const deleteStore = deleteTx.objectStore(ANALYTICS_QUEUE);
        await deleteStore.delete(event.id);
      }
    } catch (error) {
      console.error('Failed to process analytics event:', error);
    }
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tastetuner-analytics', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(ANALYTICS_QUEUE)) {
        db.createObjectStore(ANALYTICS_QUEUE, { keyPath: 'id' });
      }
    };
  });
}

// Helper function to process pending scans
async function processPendingScans() {
  const db = await openDB();
  const transaction = db.transaction('pendingScans', 'readonly');
  const store = transaction.objectStore('pendingScans');
  const pendingScans = await store.getAll();

  for (const scan of pendingScans) {
    try {
      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData: scan.imageData })
      });

      if (response.ok) {
        // Remove processed scan
        const deleteTransaction = db.transaction('pendingScans', 'readwrite');
        const deleteStore = deleteTransaction.objectStore('pendingScans');
        await deleteStore.delete(scan.id);

        // Track successful processing
        await queueAnalytics({
          type: 'event',
          category: 'menu',
          action: 'process_offline_scan',
          label: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to process scan:', error);
      // Track failed processing
      await queueAnalytics({
        type: 'event',
        category: 'menu',
        action: 'process_offline_scan',
        label: 'error',
        metadata: {
          error: error.message
        }
      });
    }
  }
}