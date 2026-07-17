import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { CONTRACT_EXPIRATION_QUEUE } from './queue.js';
import { expireOverdueContracts } from '../modules/contracts/contracts.service.js';

export function startContractExpirationWorker() {
  const worker = new Worker(
    CONTRACT_EXPIRATION_QUEUE,
    async () => {
      const count = await expireOverdueContracts();
      if (count > 0) {
        console.log(`[job] ${count} contrato(s) marcados como VENCIDO`);
      }
    },
    { connection: redis },
  );
  worker.on('failed', (job, err) => {
    console.error(`[job] falha no job ${job?.id}:`, err.message);
  });
  return worker;
}
