import express from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/auth.routes.js';
import { clientsRoutes } from './modules/clients/clients.routes.js';
import { contractsRoutes } from './modules/contracts/contracts.routes.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/clients', authenticate, clientsRoutes);
app.use('/contracts', authenticate, contractsRoutes);

app.use(errorHandler);
