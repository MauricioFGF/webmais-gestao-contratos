import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
});

export const clientsRoutes = Router();

clientsRoutes.get('/', async (_req, res, next) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });
    res.json(clients);
  } catch (err) {
    next(err);
  }
});

clientsRoutes.post('/', async (req, res, next) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
});
