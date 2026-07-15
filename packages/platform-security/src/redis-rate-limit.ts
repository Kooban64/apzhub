import { getRedis } from "@apzhub/shared";

export async function checkRedisRateLimit(
  key: string,
  limitPerMinute: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedis();
  if (redis.status !== "ready") {
    await redis.connect();
  }

  const bucketKey = `apzhub:rate-limit:${key}`;
  const ttlSeconds = 60;
  const count = await redis.incr(bucketKey);
  if (count === 1) {
    await redis.expire(bucketKey, ttlSeconds);
  }

  const ttl = await redis.ttl(bucketKey);
  const resetAt = Date.now() + Math.max(ttl, 0) * 1000;
  const remaining = Math.max(limitPerMinute - count, 0);

  return {
    allowed: count <= limitPerMinute,
    remaining,
    resetAt,
  };
}
