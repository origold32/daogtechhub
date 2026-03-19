// lib/rate-limit.ts
// In-memory sliding window rate limiter.
// For production, swap the Map for a Redis store via Upstash.
//
// Usage:
//   const limiter = rateLimit({ limit: 10, window: 60_000 });
//   const { success, remaining } = limiter.check(ip);

interface RateLimitOptions {
  limit: number;   // max requests
  window: number;  // window in ms
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms when window resets
}

// In-memory store: identifier → list of request timestamps
const store = new Map<string, number[]>();

// Clean up old entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, times] of store.entries()) {
      if (!times.length || now - Math.max(...times) > 300_000) store.delete(key);
    }
  }, 300_000);
}

export function rateLimit(options: RateLimitOptions) {
  const { limit, window: windowMs } = options;

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const windowStart = now - windowMs;

      const times = (store.get(identifier) ?? []).filter((t) => t > windowStart);
      const remaining = Math.max(0, limit - times.length);
      const reset = times.length > 0 ? Math.max(...times) + windowMs : now + windowMs;

      if (times.length >= limit) {
        return { success: false, limit, remaining: 0, reset };
      }

      times.push(now);
      store.set(identifier, times);
      return { success: true, limit, remaining: remaining - 1, reset };
    },
  };
}

// Pre-configured limiters for common use cases
export const authLimiter    = rateLimit({ limit: 10, window: 60_000 });    // 10/min for auth
export const apiLimiter     = rateLimit({ limit: 100, window: 60_000 });   // 100/min for general API
export const strictLimiter  = rateLimit({ limit: 5, window: 300_000 });    // 5/5min for sensitive ops

// Helper to get the real client IP from Next.js request headers
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}
