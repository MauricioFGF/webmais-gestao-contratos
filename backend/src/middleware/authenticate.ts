import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../config/authCookie.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: 'Sessão inválida ou expirada' });
  }
}
