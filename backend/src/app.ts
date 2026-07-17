import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes } from './modules/auth/auth.routes.js';
import { clientsRoutes } from './modules/clients/clients.routes.js';
import { contractsRoutes } from './modules/contracts/contracts.routes.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export const app = express();

if (env.isProduction) {
  app.set('trust proxy', 1);
}

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/clients', authenticate, clientsRoutes);
app.use('/contracts', authenticate, contractsRoutes);

app.use(errorHandler);
