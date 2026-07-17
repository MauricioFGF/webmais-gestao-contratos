import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client.js';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Dados inválidos', issues: err.flatten().fieldErrors });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Registro duplicado (campo único já cadastrado)' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
  }
  console.error(err);
  return res.status(500).json({ message: 'Erro interno' });
}
