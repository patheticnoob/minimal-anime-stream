// Client-side cache for anime data with TTL
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

class AnimeCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttlMinutes: number = 10): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
    
    // Also persist to sessionStorage for cross-page persistence
    try {
      sessionStorage.setItem(`anime_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
      }));
    } catch (err) {
      console.warn('Failed to persist cache to sessionStorage:', err);
    }
  }
  
  get<T>(key: string): T | null {
    // Check memory cache first
    const memEntry = this.cache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttl) {
      return memEntry.data as T;
    }
    
    // Check sessionStorage
    try {
      const stored = sessionStorage.getItem(`anime_cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (Date.now() - entry.timestamp < entry.ttl) {
          // Restore to memory cache
          this.cache.set(key, entry);
          return entry.data;
        } else {
          // Expired, remove it
          sessionStorage.removeItem(`anime_cache_${key}`);
        }
      }
    } catch (err) {
      console.warn('Failed to read cache from sessionStorage:', err);
    }
    
    return null;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  clear(): void {
    this.cache.clear();
    // Clear sessionStorage cache entries
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('anime_cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (err) {
      console.warn('Failed to clear sessionStorage cache:', err);
    }
  }
}

export const animeCache = new AnimeCache();
