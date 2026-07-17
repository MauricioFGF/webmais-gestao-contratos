import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const CONTRACT_EXPIRATION_QUEUE = 'contract-expiration';

export const contractExpirationQueue = new Queue(CONTRACT_EXPIRATION_QUEUE, {
  connection: redis,
});

export async function scheduleContractExpirationJob() {
  // A cada 1 min de propósito: torna o vencimento automático visível em demo
  await contractExpirationQueue.add(
    'expire-overdue',
    {},
    { repeat: { every: 60_000 }, removeOnComplete: 100, removeOnFail: 100 },
  );
}
