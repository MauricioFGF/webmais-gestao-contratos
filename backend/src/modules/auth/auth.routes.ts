import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../../config/authCookie.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { authenticate, type AuthRequest } from '../../middleware/authenticate.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Aguarde 1 minuto.' },
});

export const authRoutes = Router();

authRoutes.post('/login', loginRateLimit, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Credenciais inválidas');
    }
    const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: '8h' });
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

authRoutes.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { ...authCookieOptions, maxAge: undefined });
  res.status(204).send();
});

authRoutes.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      throw new HttpError(401, 'Não autenticado');
    }
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});
