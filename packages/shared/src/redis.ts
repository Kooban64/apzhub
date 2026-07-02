import Redis from "ioredis";

import { getEnv } from "@apzhub/config";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export function getRedis(): Redis {
  if (!globalForRedis.redis) {
    const { REDIS_URL } = getEnv();
    globalForRedis.redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }
  return globalForRedis.redis;
}

export async function checkRedisHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
  message?: string;
}> {
  const start = Date.now();
  try {
    const redis = getRedis();
    if (redis.status !== "ready") {
      await redis.connect();
    }
    const pong = await redis.ping();
    return {
      ok: pong === "PONG",
      latencyMs: Date.now() - start,
      message: pong === "PONG" ? undefined : "Unexpected Redis response",
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : "Redis unreachable",
    };
  }
}
