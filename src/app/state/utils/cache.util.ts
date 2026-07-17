/**
 * Lightweight TTL cache utilities for NgRx Signal Stores.
 * No RxJS. No external dependencies.
 */

export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

export type CacheMap<T> = Map<string, CacheEntry<T>>;

/** Millisecond TTL presets */
export const TTL = {
  SHORT: 1 * 60 * 1000,   // 1 min
  MEDIUM: 5 * 60 * 1000,  // 5 min
  LONG: 15 * 60 * 1000,   // 15 min
} as const;

export function isFresh<T>(entry: CacheEntry<T> | undefined, ttlMs: number): boolean {
  return !!entry && Date.now() - entry.cachedAt < ttlMs;
}

export function makeCacheEntry<T>(data: T): CacheEntry<T> {
  return { data, cachedAt: Date.now() };
}

export function getCached<T>(
  cache: CacheMap<T>,
  key: string,
  ttlMs: number,
): T | undefined {
  const entry = cache.get(key);
  return isFresh(entry, ttlMs) ? entry!.data : undefined;
}

export function setCached<T>(cache: CacheMap<T>, key: string, data: T): void {
  cache.set(key, makeCacheEntry(data));
}

export function invalidateCache<T>(cache: CacheMap<T>, keyPrefix?: string): void {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
}

