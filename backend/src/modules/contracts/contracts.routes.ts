import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { CACHE_KEYS, getCached, setCached, invalidateContractCaches } from '../../lib/cache.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { expireOverdueContracts } from './contracts.service.js';
import { computeContractValue, resolveContractStatus } from './contract.rules.js';

const itemSchema = z.object({
  description: z.string().min(1, 'Descrição do item é obrigatória'),
  quantity: z.coerce.number().int().positive('Quantidade deve ser um inteiro positivo'),
  unitPrice: z.coerce.number().positive('Preço unitário deve ser positivo'),
});

const contractSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  clientId: z.string().uuid('Cliente inválido'),
  type: z.enum(['SERVICO', 'PRODUTO', 'ASSINATURA']).default('SERVICO'),
  discount: z.coerce.number().min(0, 'Desconto não pode ser negativo').default(0),
  dueDate: z.coerce.date(),
  items: z.array(itemSchema).min(1, 'Contrato precisa de pelo menos um item'),
});

const clientInclude = {
  client: { select: { id: true, name: true, document: true } },
  items: { select: { id: true, description: true, quantity: true, unitPrice: true } },
};

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
    const { items, ...data } = contractSchema.parse(req.body);
    const contract = await prisma.contract.create({
      data: {
        ...data,
        value: computeContractValue(items, data.discount),
        status: resolveContractStatus(data.dueDate, null),
        items: { create: items },
      },
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
    const { items, ...data } = contractSchema.parse(req.body);
    const existing = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new HttpError(404, 'Contrato não encontrado');
    }
    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: {
        ...data,
        value: computeContractValue(items, data.discount),
        status: resolveContractStatus(data.dueDate, existing.status),
        items: { deleteMany: {}, create: items },
      },
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
