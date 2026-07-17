import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { CONTRACT_EXPIRATION_QUEUE } from './queue';
import { expireOverdueContracts } from '../modules/contracts/contracts.service';

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
