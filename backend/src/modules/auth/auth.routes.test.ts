import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { createTestUser, deleteTestUser } from '../../test/helpers.js';

describe('auth routes (integração)', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    user = await createTestUser('senha-correta');
  });

  afterAll(async () => {
    await deleteTestUser(user.id);
  });

  it('POST /auth/login com credenciais válidas retorna o usuário e seta cookie httpOnly', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: 'senha-correta' });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: user.id, email: user.email });
    expect(res.body.token).toBeUndefined();

    const cookie = res.headers['set-cookie']?.[0] ?? '';
    expect(cookie).toMatch(/^token=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('POST /auth/login com senha errada retorna 401 genérico', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: 'senha-errada' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciais inválidas');
  });

  it('POST /auth/login com e-mail inexistente retorna a mesma mensagem genérica (não vaza existência)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'ninguem@webmais.com', password: 'qualquer' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciais inválidas');
  });

  it('GET /auth/me sem cookie retorna 401', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('fluxo completo: login -> me autenticado -> logout -> me volta a 401', async () => {
    const agent = request.agent(app);

    const login = await agent.post('/auth/login').send({ email: user.email, password: 'senha-correta' });
    expect(login.status).toBe(200);

    const me = await agent.get('/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(user.email);

    const logout = await agent.post('/auth/logout');
    expect(logout.status).toBe(204);

    const meAfterLogout = await agent.get('/auth/me');
    expect(meAfterLogout.status).toBe(401);
  });

  it('rotas protegidas (/clients) recusam acesso sem sessão', async () => {
    const res = await request(app).get('/clients');
    expect(res.status).toBe(401);
  });
});
