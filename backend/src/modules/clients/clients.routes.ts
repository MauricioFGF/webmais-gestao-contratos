import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { invalidateContractCaches } from '../../lib/cache.js';

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

clientsRoutes.put('/:id', async (req, res, next) => {
  try {
    const data = clientSchema.parse(req.body);
    const existing = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new HttpError(404, 'Cliente não encontrado');
    }
    const client = await prisma.client.update({ where: { id: req.params.id }, data });
    await invalidateContractCaches();
    res.json(client);
  } catch (err) {
    next(err);
  }
});

clientsRoutes.delete('/:id', async (req, res, next) => {
  try {
    const contracts = await prisma.contract.count({ where: { clientId: req.params.id } });
    if (contracts > 0) {
      throw new HttpError(409, 'Cliente possui contratos vinculados e não pode ser excluído');
    }
    await prisma.client.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
