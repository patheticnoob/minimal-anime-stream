/**
 * Page Cache System
 * Caches page data in sessionStorage to enable instant back navigation
 */

const CACHE_PREFIX = 'page_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  url: string;
}

export class PageCache {
  private static instance: PageCache;

  private constructor() {}

  static getInstance(): PageCache {
    if (!PageCache.instance) {
      PageCache.instance = new PageCache();
    }
    return PageCache.instance;
  }

  /**
   * Store data in cache
   */
  set<T>(key: string, data: T, url?: string): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        url: url || window.location.pathname + window.location.search,
      };
      sessionStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(entry)
      );
    } catch (error) {
      console.warn('Failed to cache page data:', error);
    }
  }

  /**
   * Retrieve data from cache
   */
  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if cache is expired
      if (Date.now() - entry.timestamp > CACHE_DURATION) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Check if cache exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove specific cache entry
   */
  remove(key: string): void {
    try {
      sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.warn('Failed to remove cache:', error);
    }
  }

  /**
   * Clear all page caches
   */
  clearAll(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Cache current landing page state
   */
  cacheLandingPage(data: {
    popularItems: any[];
    airingItems: any[];
    movieItems: any[];
    tvShowItems: any[];
    heroAnime: any;
  }): void {
    this.set('landing_page', data);
  }

  /**
   * Get cached landing page data
   */
  getCachedLandingPage(): any | null {
    return this.get('landing_page');
  }

  /**
   * Cache scroll position
   */
  cacheScrollPosition(key: string, position: number): void {
    this.set(`scroll_${key}`, position);
  }

  /**
   * Get cached scroll position
   */
  getCachedScrollPosition(key: string): number | null {
    return this.get(`scroll_${key}`);
  }
}

export const pageCache = PageCache.getInstance();
