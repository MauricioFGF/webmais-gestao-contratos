import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Fallback só para comandos que não conectam (ex.: prisma generate no CI)
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/contratos',
  },
});
