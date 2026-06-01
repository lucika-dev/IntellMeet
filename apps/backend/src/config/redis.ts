import Redis from "ioredis";

import { env } from "@/config/env";

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    })
  : null;

export const getRedisKey = (...parts: string[]) => parts.filter(Boolean).join(":");
