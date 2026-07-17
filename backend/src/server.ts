import 'dotenv/config';
import { app } from './app';
import { env } from './config/env';
import { scheduleContractExpirationJob } from './jobs/queue';
import { startContractExpirationWorker } from './jobs/worker';

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
