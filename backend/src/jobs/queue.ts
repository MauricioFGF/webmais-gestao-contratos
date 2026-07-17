import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export const CONTRACT_EXPIRATION_QUEUE = 'contract-expiration';

export const contractExpirationQueue = new Queue(CONTRACT_EXPIRATION_QUEUE, {
  connection: redis,
});

export async function scheduleContractExpirationJob() {
  await contractExpirationQueue.upsertJobScheduler(
    'expire-overdue',
    { every: 60_000 },
    { name: 'expire-overdue', opts: { removeOnComplete: 100, removeOnFail: 100 } },
  );
}
