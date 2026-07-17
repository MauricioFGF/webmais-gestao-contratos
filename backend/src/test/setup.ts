import 'dotenv/config';
import { afterAll } from 'vitest';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';

afterAll(async () => {
  await prisma.$disconnect();
  redis.disconnect();
});
