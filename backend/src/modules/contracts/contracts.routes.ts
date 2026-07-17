import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { CACHE_KEYS, getCached, setCached, invalidateContractCaches } from '../../lib/cache';
import { HttpError } from '../../middleware/errorHandler';
import { expireOverdueContracts } from './contracts.service';

const contractSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  clientId: z.string().uuid('Cliente inválido'),
  value: z.coerce.number().positive('Valor deve ser positivo'),
  dueDate: z.coerce.date(),
});

const clientInclude = { client: { select: { id: true, name: true, document: true } } };

export const contractsRoutes = Router();

contractsRoutes.get('/', async (_req, res, next) => {
  try {
    const cached = await getCached<unknown[]>(CACHE_KEYS.contracts);
    if (cached) {
      return res.json(cached);
    }
    await expireOverdueContracts();
    const contracts = await prisma.contract.findMany({
      include: clientInclude,
      orderBy: { createdAt: 'desc' },
    });
    await setCached(CACHE_KEYS.contracts, contracts);
    res.json(contracts);
  } catch (err) {
    next(err);
  }
});

contractsRoutes.get('/summary', async (_req, res, next) => {
  try {
    const cached = await getCached<Record<string, number>>(CACHE_KEYS.summary);
    if (cached) {
      return res.json(cached);
    }
    await expireOverdueContracts();
    const groups = await prisma.contract.groupBy({ by: ['status'], _count: { _all: true } });
    const summary = { ATIVO: 0, VENCIDO: 0, ENCERRADO: 0 };
    for (const g of groups) {
      summary[g.status] = g._count._all;
    }
    await setCached(CACHE_KEYS.summary, summary);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

contractsRoutes.get('/:id', async (req, res, next) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: clientInclude,
    });
    if (!contract) {
      throw new HttpError(404, 'Contrato não encontrado');
    }
    res.json(contract);
  } catch (err) {
    next(err);
  }
});

contractsRoutes.post('/', async (req, res, next) => {
  try {
    const data = contractSchema.parse(req.body);
    const status = data.dueDate < new Date() ? 'VENCIDO' : 'ATIVO';
    const contract = await prisma.contract.create({
      data: { ...data, status },
      include: clientInclude,
    });
    await invalidateContractCaches();
    res.status(201).json(contract);
  } catch (err) {
    next(err);
  }
});

contractsRoutes.put('/:id', async (req, res, next) => {
  try {
    const data = contractSchema.parse(req.body);
    const existing = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new HttpError(404, 'Contrato não encontrado');
    }
    // Encerrado é definitivo; para os demais, recalcula pelo novo vencimento
    const status =
      existing.status === 'ENCERRADO'
        ? 'ENCERRADO'
        : data.dueDate < new Date()
          ? 'VENCIDO'
          : 'ATIVO';
    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: { ...data, status },
      include: clientInclude,
    });
    await invalidateContractCaches();
    res.json(contract);
  } catch (err) {
    next(err);
  }
});

contractsRoutes.patch('/:id/encerrar', async (req, res, next) => {
  try {
    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: { status: 'ENCERRADO' },
      include: clientInclude,
    });
    await invalidateContractCaches();
    res.json(contract);
  } catch (err) {
    next(err);
  }
});

contractsRoutes.delete('/:id', async (req, res, next) => {
  try {
    await prisma.contract.delete({ where: { id: req.params.id } });
    await invalidateContractCaches();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
