/**
 * Simple in-memory cache utility for API responses
 * Reduces backend load by caching frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      // Expired, remove from cache
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with TTL (time to live) in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttlMs,
    });
  }

  /**
   * Clear a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const cache = new SimpleCache();

// TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 1000,      // 5 seconds - for frequently changing data (inventory)
  MEDIUM: 30 * 1000,    // 30 seconds - for semi-static data
  LONG: 5 * 60 * 1000,  // 5 minutes - for relatively static data (products)
  VERY_LONG: 30 * 60 * 1000, // 30 minutes - for very static data
} as const;

/**
 * Helper function to get or fetch data with caching
 */
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();
  
  // Store in cache
  cache.set(key, data, ttlMs);
  
  return data;
}

/**
 * Invalidate cache entries by pattern (prefix)
 */
export function invalidateCacheByPattern(pattern: string): void {
  const stats = cache.getStats();
  for (const key of stats.entries) {
    if (key.startsWith(pattern)) {
      cache.delete(key);
    }
  }
}

// Clear expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.clearExpired();
  }, 5 * 60 * 1000);
}
