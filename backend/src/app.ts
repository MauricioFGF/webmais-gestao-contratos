import express from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/auth.routes';
import { clientsRoutes } from './modules/clients/clients.routes';
import { contractsRoutes } from './modules/contracts/contracts.routes';
import { authenticate } from './middleware/authenticate';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/clients', authenticate, clientsRoutes);
app.use('/contracts', authenticate, contractsRoutes);

app.use(errorHandler);
