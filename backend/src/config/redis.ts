import { Redis } from 'ioredis';
import { env } from './env.js';

// maxRetriesPerRequest: null é exigido pelo BullMQ para conexões de worker
export const redis = env.redisUrl
  ? new Redis(env.redisUrl, { maxRetriesPerRequest: null })
  : new Redis({
      host: env.redisHost,
      port: env.redisPort,
      maxRetriesPerRequest: null,
    });
