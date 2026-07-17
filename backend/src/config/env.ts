function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET é obrigatório em produção');
  }
  return 'dev-secret';
}

export const env = {
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: resolveJwtSecret(),
  // REDIS_URL (clouds gerenciadas) tem precedência sobre host/port (dev local)
  redisUrl: process.env.REDIS_URL,
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: Number(process.env.REDIS_PORT ?? 6379),
};
