import 'dotenv/config';
import { app } from './app.js';
import { env } from './config/env.js';
import { scheduleContractExpirationJob } from './jobs/queue.js';
import { startContractExpirationWorker } from './jobs/worker.js';

async function bootstrap() {
  startContractExpirationWorker();
  await scheduleContractExpirationJob();

  app.listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
