import type { CookieOptions } from 'express';
import { env } from './env.js';

export const AUTH_COOKIE_NAME = 'token';

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
};
