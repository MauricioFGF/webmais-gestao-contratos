import { describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { z } from 'zod';
import { errorHandler, HttpError } from './errorHandler.js';
import { Prisma } from '../generated/prisma/client.js';

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('HttpError responde com o status e a mensagem definidos', () => {
    const res = mockRes();
    errorHandler(new HttpError(409, 'Registro duplicado'), {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Registro duplicado' });
  });

  it('ZodError vira 400 com os campos inválidos detalhados', () => {
    const res = mockRes();
    const result = z.object({ email: z.string().email() }).safeParse({ email: 'não-é-email' });
    expect(result.success).toBe(false);

    errorHandler(result.error, {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.message).toBe('Dados inválidos');
    expect(payload.issues.email).toBeDefined();
  });

  it('Prisma P2002 (unique constraint) vira 409 duplicado', () => {
    const res = mockRes();
    const err = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });

    errorHandler(err, {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Registro duplicado (campo único já cadastrado)',
    });
  });

  it('Prisma P2025 (registro não encontrado) vira 404', () => {
    const res = mockRes();
    const err = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '7.8.0',
    });

    errorHandler(err, {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Registro não encontrado' });
  });

  it('erro desconhecido vira 500 sem vazar detalhes internos', () => {
    const res = mockRes();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(new Error('detalhe interno sensível'), {} as never, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno' });
    consoleSpy.mockRestore();
  });
});
