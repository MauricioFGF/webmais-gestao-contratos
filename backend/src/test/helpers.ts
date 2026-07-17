import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/prisma.js';

export async function createTestUser(password = 'senha123') {
  const email = `test-${randomUUID()}@webmais.com`;
  const passwordHash = await bcrypt.hash(password, 4);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  return { ...user, password };
}

export async function deleteTestUser(id: string) {
  await prisma.user.delete({ where: { id } }).catch(() => {});
}

export async function loginAsTestUser() {
  const user = await createTestUser();
  const agent = request.agent(app);
  const res = await agent.post('/auth/login').send({ email: user.email, password: user.password });
  if (res.status !== 200) {
    throw new Error(`Falha ao autenticar usuário de teste: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { agent, user };
}

export async function createTestClient(overrides: Partial<{ name: string; document: string }> = {}) {
  return prisma.client.create({
    data: {
      name: overrides.name ?? `Cliente Teste ${randomUUID().slice(0, 8)}`,
      document: overrides.document ?? randomUUID().replace(/-/g, '').slice(0, 14),
    },
  });
}

export async function deleteTestClient(id: string) {
  await prisma.client.delete({ where: { id } }).catch(() => {});
}

export async function deleteTestContract(id: string) {
  await prisma.contract.delete({ where: { id } }).catch(() => {});
}
