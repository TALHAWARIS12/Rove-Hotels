import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Simple in-memory sliding window rate limiter fallback when Upstash is not configured.
 */
class MemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();

  async limit(identifier: string) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 30; // 30 requests per minute

    const timestamps = (this.requests.get(identifier) || []).filter((t) => now - t < windowMs);
    if (timestamps.length >= maxRequests) {
      return { success: false, remaining: 0, reset: now + windowMs };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);
    return { success: true, remaining: maxRequests - timestamps.length, reset: now + windowMs };
  }
}

const memoryLimiter = new MemoryRateLimiter();

export async function checkRateLimit(identifier: string) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
      });

      return await ratelimit.limit(identifier);
    } catch (e) {
      console.warn("Upstash rate limit failed, using memory fallback:", e);
    }
  }

  return await memoryLimiter.limit(identifier);
}
