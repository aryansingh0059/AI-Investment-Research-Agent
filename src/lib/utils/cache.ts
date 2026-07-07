/**
 * In-memory session cache for company analysis results.
 * Prevents re-running the full pipeline for the same company within a session.
 */

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export function getCached<T>(key: string): T | null {
  if (process.env.NODE_ENV === 'development') {
    return null;
  }
  const entry = cache.get(key.toLowerCase());
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key.toLowerCase());
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key.toLowerCase(), { data, timestamp: Date.now() });
}

export function clearCache(): void {
  cache.clear();
}
