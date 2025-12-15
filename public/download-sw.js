/**
 * Service Worker for caching HLS video segments
 */

const CACHE_PREFIX = 'episode-';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Install event
self.addEventListener('install', (event) => {
  console.log('[Download SW] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Download SW] Activating...');
  event.waitUntil(self.clients.claim());
});

// Fetch event - intercept video segment requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept HLS segments (.ts files) and manifests (.m3u8)
  if (url.pathname.includes('/proxy?url=') && 
      (url.searchParams.get('url')?.includes('.ts') || 
       url.searchParams.get('url')?.includes('.m3u8'))) {
    
    event.respondWith(handleVideoRequest(event.request));
  }
});

// Handle video segment requests
async function handleVideoRequest(request) {
  const url = new URL(request.url);
  const originalUrl = url.searchParams.get('url');
  
  if (!originalUrl) {
    return fetch(request);
  }

  // Determine cache name from episode ID (if available in URL)
  const episodeId = extractEpisodeId(originalUrl);
  const cacheName = episodeId ? `${CACHE_PREFIX}${episodeId}` : `${CACHE_PREFIX}temp`;

  try {
    // Try to get from cache first
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log('[Download SW] Serving from cache:', originalUrl);
      return cachedResponse;
    }

    // Fetch from network
    console.log('[Download SW] Fetching from network:', originalUrl);
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
      
      // Notify clients about cached segment
      notifyClients({
        type: 'CACHE_SEGMENT',
        episodeId: episodeId || 'unknown',
        url: originalUrl,
      });
    }

    return response;
  } catch (error) {
    console.error('[Download SW] Fetch error:', error);
    
    // Try to return cached version as fallback
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Extract episode ID from URL (customize based on your URL structure)
function extractEpisodeId(url) {
  // Try to extract episode ID from URL patterns
  const patterns = [
    /episode[_-](\d+)/i,
    /ep[_-](\d+)/i,
    /\/(\d+)\//,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Notify all clients
async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage(message);
  });
}

// Message handler for commands from main thread
self.addEventListener('message', async (event) => {
  const { type, episodeId, data } = event.data;

  switch (type) {
    case 'CLEAR_CACHE':
      await clearEpisodeCache(episodeId);
      event.ports[0].postMessage({ success: true });
      break;

    case 'GET_CACHE_SIZE':
      const size = await getEpisodeCacheSize(episodeId);
      event.ports[0].postMessage({ size });
      break;

    case 'CLEAR_ALL_CACHES':
      await clearAllCaches();
      event.ports[0].postMessage({ success: true });
      break;

    default:
      console.warn('[Download SW] Unknown message type:', type);
  }
});

// Clear cache for specific episode
async function clearEpisodeCache(episodeId) {
  const cacheName = `${CACHE_PREFIX}${episodeId}`;
  const deleted = await caches.delete(cacheName);
  console.log(`[Download SW] Cleared cache for episode ${episodeId}:`, deleted);
  return deleted;
}

// Get cache size for episode
async function getEpisodeCacheSize(episodeId) {
  const cacheName = `${CACHE_PREFIX}${episodeId}`;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  let totalSize = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }
  
  return totalSize;
}

// Clear all episode caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const episodeCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));
  
  await Promise.all(episodeCaches.map(name => caches.delete(name)));
  console.log(`[Download SW] Cleared ${episodeCaches.length} episode caches`);
}
