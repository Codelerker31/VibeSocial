import { redis } from '@/lib/redis';

/**
 * Get data from cache or fetch it if missing
 * @param key Cache key
 * @param fetchFn Function to fetch data if cache miss
 * @param ttl Time to live in seconds
 */
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get<T>(key);
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    // Continue to fetch if cache fails
  }

  // Fetch fresh data
  const data = await fetchFn();

  try {
    // Cache the data
    if (data) {
      await redis.set(key, data, { ex: ttl });
    }
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }

  return data;
}

/**
 * Invalidate cache keys matching a pattern
 * @param pattern Glob pattern (e.g. "user:*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Cache invalidation error for pattern ${pattern}:`, error);
  }
}
