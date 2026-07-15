import { DEFAULT_RATE_LIMIT_PER_MINUTE, type RateLimitStatus } from "./security-types";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export class RateLimitService {
  private readonly memoryBuckets = new Map<string, RateLimitBucket>();
  private readonly limitPerMinute: number;

  constructor(limitPerMinute = DEFAULT_RATE_LIMIT_PER_MINUTE) {
    this.limitPerMinute = limitPerMinute;
  }

  getStatus(): RateLimitStatus {
    return {
      backend: process.env.REDIS_URL ? "redis" : "memory",
      enabled: true,
      defaultLimitPerMinute: this.limitPerMinute,
    };
  }

  async checkLimit(
    key: string,
    limitPerMinute = this.limitPerMinute,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    if (process.env.REDIS_URL) {
      try {
        const { checkRedisRateLimit } = await import("./redis-rate-limit");
        return checkRedisRateLimit(key, limitPerMinute);
      } catch {
        // Fall through to in-memory limiter.
      }
    }

    return this.checkMemoryLimit(key, limitPerMinute);
  }

  private checkMemoryLimit(
    key: string,
    limitPerMinute = this.limitPerMinute,
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const windowMs = 60_000;
    const existing = this.memoryBuckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      this.memoryBuckets.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limitPerMinute - 1, resetAt };
    }

    if (existing.count >= limitPerMinute) {
      return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count += 1;
    this.memoryBuckets.set(key, existing);
    return {
      allowed: true,
      remaining: limitPerMinute - existing.count,
      resetAt: existing.resetAt,
    };
  }
}
