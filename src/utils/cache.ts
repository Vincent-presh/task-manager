// Simple in-memory cache with TTL for client-side performance optimization
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, data: T, ttl = 5 * 60 * 1000): void { // Default 5 minutes TTL
    // Cleanup expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    // If still at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Remove expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instances for different types of data
export const taskCache = new Cache(50); // Cache for tasks
export const analyticsCache = new Cache(10); // Cache for analytics data
export const userCache = new Cache(20); // Cache for user data

// Helper function to create cache keys
export function createCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

// Wrapper function for cached API calls
export async function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cache = taskCache,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch data and cache it
  try {
    const data = await fetchFn();
    cache.set(cacheKey, data, ttl);
    return data;
  } catch (error) {
    // Don't cache errors
    throw error;
  }
}

// Clear cache entries by pattern
export function clearCacheByPattern(pattern: string, cache = taskCache): number {
  let cleared = 0;
  const keys = cache.getStats().keys;
  
  for (const key of keys) {
    if (key.includes(pattern)) {
      if (cache.delete(key)) {
        cleared++;
      }
    }
  }
  
  return cleared;
}