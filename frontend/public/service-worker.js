/**
 * Service Worker for Offline Cache and Performance
 * Implements caching strategies for better performance and offline support
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `nebu-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/assets/logos/logo-nebu.svg',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, fallback to network
  CACHE_FIRST: 'cache-first',
  // Network first, fallback to cache
  NETWORK_FIRST: 'network-first',
  // Network only
  NETWORK_ONLY: 'network-only',
  // Cache only
  CACHE_ONLY: 'cache-only',
  // Stale while revalidate
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// Route patterns and their strategies
const ROUTE_STRATEGIES = [
  {
    pattern: /\/api\/products/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  },
  {
    pattern: /\/api\/inventory/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheTTL: 5 * 1000, // 5 seconds
  },
  {
    pattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  {
    pattern: /\.(woff|woff2|ttf|eot)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheTTL: 365 * 24 * 60 * 60 * 1000, // 1 year
  },
  {
    pattern: /\.(js|css)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheTTL: 24 * 60 * 60 * 1000, // 1 day
  },
];

/**
 * Install event - precache essential assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Claim all clients
  return self.clients.claim();
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Find matching strategy
  const matchedRoute = ROUTE_STRATEGIES.find((route) =>
    route.pattern.test(url.pathname + url.search)
  );

  if (!matchedRoute) {
    // Default: network first
    event.respondWith(networkFirst(request));
    return;
  }

  // Apply strategy
  switch (matchedRoute.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(request, matchedRoute.cacheTTL));
      break;
    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(request, matchedRoute.cacheTTL));
      break;
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(request, matchedRoute.cacheTTL));
      break;
    case CACHE_STRATEGIES.NETWORK_ONLY:
      event.respondWith(fetch(request));
      break;
    case CACHE_STRATEGIES.CACHE_ONLY:
      event.respondWith(caches.match(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

/**
 * Cache First Strategy
 */
async function cacheFirst(request, cacheTTL) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Check if cache is still valid
    const cacheTime = await getCacheTime(request);
    if (cacheTime && Date.now() - cacheTime < cacheTTL) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      await setCacheTime(request);
    }
    return response;
  } catch (error) {
    // Return cached version if available
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Network First Strategy
 */
async function networkFirst(request, cacheTTL) {
  try {
    const response = await fetch(request);
    if (response.ok && cacheTTL) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      await setCacheTime(request);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request, cacheTTL) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => {
        c.put(request, response.clone());
        setCacheTime(request);
      });
    }
    return response;
  });

  return cached || fetchPromise;
}

/**
 * Helper to store cache timestamp
 */
async function setCacheTime(request) {
  const cache = await caches.open(`${CACHE_NAME}-timestamps`);
  const response = new Response(JSON.stringify({ timestamp: Date.now() }));
  return cache.put(request, response);
}

/**
 * Helper to get cache timestamp
 */
async function getCacheTime(request) {
  const cache = await caches.open(`${CACHE_NAME}-timestamps`);
  const response = await cache.match(request);
  if (response) {
    const data = await response.json();
    return data.timestamp;
  }
  return null;
}

/**
 * Message handler for cache invalidation
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      })
    );
  }
});
