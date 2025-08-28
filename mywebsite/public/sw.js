// Service Worker for 3D Portfolio Website
// Handles caching of assets, 3D models, and API responses with enhanced error handling

const CACHE_NAME = '3d-portfolio-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const MODELS_CACHE = '3d-models-v1';
const OFFLINE_CACHE = 'offline-v1';

// Enhanced error tracking
const ERROR_CACHE = 'errors-v1';
let errorCount = 0;
const MAX_ERRORS_BEFORE_RESET = 10;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/_next/static/css/',
  '/_next/static/chunks/framework',
  '/_next/static/chunks/main',
  '/_next/static/chunks/pages',
];

// Critical assets for offline functionality
const CRITICAL_ASSETS = [
  '/offline.html',
  '/',
  '/projects',
  '/about',
  '/contact',
];

// 3D assets and models (cache with longer TTL)
const MODEL_PATTERNS = [/\.glb$/, /\.gltf$/, /\.ktx2$/, /\.basis$/, /\.draco$/];

// API endpoints to cache
const API_PATTERNS = [/\/api\/projects/, /\/api\/skills/, /\/api\/timeline/];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Install event - cache static assets with error handling
self.addEventListener('install', event => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets with error handling
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(error => {
          console.error('Failed to cache static assets:', error);
          // Cache critical assets individually to avoid complete failure
          return Promise.allSettled(
            CRITICAL_ASSETS.map(url =>
              cache.add(url).catch(err => {
                console.warn(`Failed to cache ${url}:`, err);
                return null;
              })
            )
          );
        });
      }),
      // Initialize offline cache
      caches.open(OFFLINE_CACHE).then(cache => {
        return cache.add('/offline.html').catch(error => {
          console.error('Failed to cache offline page:', error);
        });
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches with error handling
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches with error handling
      caches.keys().then(cacheNames => {
        return Promise.allSettled(
          cacheNames.map(cacheName => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== MODELS_CACHE &&
              cacheName !== OFFLINE_CACHE &&
              cacheName !== ERROR_CACHE
            ) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName).catch(error => {
                console.warn(`Failed to delete cache ${cacheName}:`, error);
              });
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim(),
      // Reset error count on activation
      resetErrorCount(),
    ])
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // 3D Models - Cache first with long TTL and retry logic
    if (isModelRequest(pathname)) {
      return await cacheFirstWithRetry(request, MODELS_CACHE, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        retryAttempts: 3,
      });
    }

    // Static assets - Cache first with retry
    if (isStaticAsset(pathname)) {
      return await cacheFirstWithRetry(request, STATIC_CACHE, {
        retryAttempts: 2,
      });
    }

    // API requests - Stale while revalidate with error handling
    if (isAPIRequest(pathname)) {
      return await staleWhileRevalidateWithRetry(request, DYNAMIC_CACHE, {
        maxAge: 5 * 60 * 1000, // 5 minutes
        retryAttempts: 2,
      });
    }

    // Images - Stale while revalidate with retry
    if (isImageRequest(pathname)) {
      return await staleWhileRevalidateWithRetry(request, DYNAMIC_CACHE, {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        retryAttempts: 2,
      });
    }

    // HTML pages - Network first with enhanced fallback
    if (isHTMLRequest(request)) {
      return await networkFirstWithFallback(request, DYNAMIC_CACHE);
    }

    // Default - Network first with retry
    return await networkFirstWithRetry(request, DYNAMIC_CACHE, {
      retryAttempts: 2,
    });
  } catch (error) {
    console.error('Service Worker fetch error:', error);
    await logError(error, request.url);

    // Return appropriate offline response
    return await getOfflineResponse(request);
  }
}

// Enhanced cache strategies with retry logic and error handling

async function cacheFirstWithRetry(request, cacheName, options = {}) {
  const { retryAttempts = 3, maxAge } = options;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached && !isExpired(cached, maxAge)) {
    return cached;
  }

  // Try network with retry logic
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(request, 10000); // 10s timeout

      if (response.ok) {
        // Add timestamp header for expiration checking
        const responseToCache = response.clone();
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cached-at', Date.now().toString());

        const modifiedResponse = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers,
        });

        await cache.put(request, modifiedResponse);
        return response;
      } else if (response.status >= 400 && response.status < 500) {
        // Don't retry client errors
        return response;
      }
    } catch (error) {
      console.warn(
        `Cache first attempt ${attempt} failed for ${request.url}:`,
        error
      );

      if (attempt === retryAttempts) {
        await logError(error, request.url);
        return (
          cached || new Response('Network error after retries', { status: 503 })
        );
      }

      // Exponential backoff
      await sleep(Math.min(1000 * Math.pow(2, attempt - 1), 5000));
    }
  }

  return cached || new Response('All retry attempts failed', { status: 503 });
}

async function networkFirstWithRetry(request, cacheName, options = {}) {
  const { retryAttempts = 2 } = options;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(request, 8000); // 8s timeout

      if (response.ok) {
        const cache = await caches.open(cacheName);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      console.warn(
        `Network first attempt ${attempt} failed for ${request.url}:`,
        error
      );

      if (attempt === retryAttempts) {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);

        if (cached) {
          return cached;
        }

        await logError(error, request.url);
        return new Response('Network error after retries', { status: 503 });
      }

      await sleep(1000 * attempt); // Linear backoff for network first
    }
  }
}

async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetchWithTimeout(request, 8000);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn(`Network request failed for ${request.url}:`, error);

    // Try cache first
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page for HTML requests
    if (isHTMLRequest(request)) {
      const offlineCache = await caches.open(OFFLINE_CACHE);
      const offlinePage = await offlineCache.match('/offline.html');

      if (offlinePage) {
        return offlinePage;
      }
    }

    await logError(error, request.url);
    return new Response('Network and cache miss', { status: 503 });
  }
}

async function staleWhileRevalidateWithRetry(request, cacheName, options = {}) {
  const { retryAttempts = 2, maxAge } = options;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Background fetch with retry logic
  const fetchWithRetryInBackground = async () => {
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const response = await fetchWithTimeout(request, 6000);

        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set('sw-cached-at', Date.now().toString());

          const responseToCache = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });

          await cache.put(request, responseToCache);
          return response.clone();
        }

        return response;
      } catch (error) {
        if (attempt === retryAttempts) {
          await logError(error, request.url);
          return null;
        }
        await sleep(500 * attempt);
      }
    }
    return null;
  };

  // Return cached version if available and not expired
  if (cached && !isExpired(cached, maxAge)) {
    // Fetch in background for next time
    fetchWithRetryInBackground();
    return cached;
  }

  // Wait for network if no cache or expired
  try {
    const response = await fetchWithRetryInBackground();
    return (
      response ||
      cached ||
      new Response('No cache and network failed', { status: 503 })
    );
  } catch (error) {
    return cached || new Response('Network error', { status: 503 });
  }
}

// Helper functions

function isModelRequest(pathname) {
  return MODEL_PATTERNS.some(pattern => pattern.test(pathname));
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/static/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff')
  );
}

function isAPIRequest(pathname) {
  return API_PATTERNS.some(pattern => pattern.test(pathname));
}

function isImageRequest(pathname) {
  return (
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.avif') ||
    pathname.endsWith('.svg')
  );
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

function isExpired(response, maxAge) {
  if (!maxAge) return false;

  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;

  const age = Date.now() - parseInt(cachedAt, 10);
  return age > maxAge;
}

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic for failed requests
  console.log('Background sync triggered');
}

// Push notifications (if needed)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

// Message handler for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

// Utility functions for enhanced error handling

async function fetchWithTimeout(request, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(request, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function logError(error, url) {
  errorCount++;

  try {
    const errorCache = await caches.open(ERROR_CACHE);
    const errorLog = {
      timestamp: Date.now(),
      error: error.message,
      url: url,
      count: errorCount,
    };

    const response = new Response(JSON.stringify(errorLog), {
      headers: { 'Content-Type': 'application/json' },
    });

    await errorCache.put(`error-${Date.now()}`, response);

    // Reset caches if too many errors
    if (errorCount >= MAX_ERRORS_BEFORE_RESET) {
      console.warn('Too many errors, clearing caches...');
      await clearDynamicCaches();
      await resetErrorCount();
    }
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

async function resetErrorCount() {
  errorCount = 0;
  try {
    const errorCache = await caches.open(ERROR_CACHE);
    const keys = await errorCache.keys();
    await Promise.all(keys.map(key => errorCache.delete(key)));
  } catch (error) {
    console.error('Failed to reset error count:', error);
  }
}

async function clearDynamicCaches() {
  try {
    await Promise.all([
      caches.delete(DYNAMIC_CACHE),
      caches.delete(MODELS_CACHE),
    ]);
  } catch (error) {
    console.error('Failed to clear dynamic caches:', error);
  }
}

async function getOfflineResponse(request) {
  if (isHTMLRequest(request)) {
    try {
      const offlineCache = await caches.open(OFFLINE_CACHE);
      const offlinePage = await offlineCache.match('/offline.html');

      if (offlinePage) {
        return offlinePage;
      }
    } catch (error) {
      console.error('Failed to get offline page:', error);
    }

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
            .offline { max-width: 400px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
    `,
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  if (isImageRequest(request.url)) {
    // Return a simple SVG placeholder for images
    return new Response(
      `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">
          Image unavailable offline
        </text>
      </svg>
    `,
      {
        status: 503,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }

  return new Response('Service unavailable offline', { status: 503 });
}
