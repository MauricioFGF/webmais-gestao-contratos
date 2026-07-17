import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { authenticate, type AuthRequest } from './authenticate.js';
import { env } from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../config/authCookie.js';

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('authenticate', () => {
  it('rejeita com 401 quando não há cookie de sessão', () => {
    const req = { cookies: {} } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Não autenticado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejeita com 401 quando o token é inválido', () => {
    const req = { cookies: { [AUTH_COOKIE_NAME]: 'token-invalido' } } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sessão inválida ou expirada' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejeita token assinado com outro segredo', () => {
    const foreignToken = jwt.sign({ sub: 'user-1' }, 'segredo-errado');
    const req = { cookies: { [AUTH_COOKIE_NAME]: foreignToken } } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejeita token expirado', () => {
    const expiredToken = jwt.sign({ sub: 'user-1' }, env.jwtSecret, { expiresIn: -1 });
    const req = { cookies: { [AUTH_COOKIE_NAME]: expiredToken } } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('libera a requisição e popula req.userId com token válido', () => {
    const token = jwt.sign({ sub: 'user-42' }, env.jwtSecret, { expiresIn: '1h' });
    const req = { cookies: { [AUTH_COOKIE_NAME]: token } } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe('user-42');
    expect(res.status).not.toHaveBeenCalled();
  });
});
