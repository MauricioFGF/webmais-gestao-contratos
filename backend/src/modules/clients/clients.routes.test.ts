import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { deleteTestClient, deleteTestUser, loginAsTestUser } from '../../test/helpers.js';

describe('clients routes (integração)', () => {
  let agent: Awaited<ReturnType<typeof loginAsTestUser>>['agent'];
  let userId: string;
  const createdClientIds: string[] = [];

  beforeAll(async () => {
    const session = await loginAsTestUser();
    agent = session.agent;
    userId = session.user.id;
  });

  afterAll(async () => {
    await Promise.all(createdClientIds.map(deleteTestClient));
    await deleteTestUser(userId);
  });

  it('POST /clients cria um cliente novo', async () => {
    const document = randomUUID().replace(/-/g, '').slice(0, 14);
    const res = await agent.post('/clients').send({ name: 'Cliente Integração', document });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Cliente Integração', document });
    createdClientIds.push(res.body.id);
  });

  it('POST /clients com documento duplicado retorna 409', async () => {
    const document = randomUUID().replace(/-/g, '').slice(0, 14);
    const first = await agent.post('/clients').send({ name: 'Primeiro', document });
    createdClientIds.push(first.body.id);

    const second = await agent.post('/clients').send({ name: 'Segundo', document });

    expect(second.status).toBe(409);
    expect(second.body.message).toMatch(/duplicado/i);
  });

  it('POST /clients sem nome retorna 400 com detalhe do campo', async () => {
    const res = await agent.post('/clients').send({ document: randomUUID() });

    expect(res.status).toBe(400);
    expect(res.body.issues.name).toBeDefined();
  });

  it('GET /clients lista clientes cadastrados', async () => {
    const res = await agent.get('/clients');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c: { id: string }) => c.id === createdClientIds[0])).toBe(true);
  });

  it('PUT /clients/:id atualiza nome e documento', async () => {
    const document = randomUUID().replace(/-/g, '').slice(0, 14);
    const created = await agent.post('/clients').send({ name: 'Nome Antigo', document });
    createdClientIds.push(created.body.id);

    const updated = await agent
      .put(`/clients/${created.body.id}`)
      .send({ name: 'Nome Novo', document });

    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Nome Novo');
  });

  it('DELETE /clients/:id remove cliente sem contratos', async () => {
    const document = randomUUID().replace(/-/g, '').slice(0, 14);
    const created = await agent.post('/clients').send({ name: 'Descartável', document });

    const res = await agent.delete(`/clients/${created.body.id}`);
    expect(res.status).toBe(204);

    const list = await agent.get('/clients');
    expect(list.body.some((c: { id: string }) => c.id === created.body.id)).toBe(false);
  });

  it('DELETE /clients/:id com contrato vinculado retorna 409', async () => {
    const document = randomUUID().replace(/-/g, '').slice(0, 14);
    const client = await agent.post('/clients').send({ name: 'Com Contrato', document });
    createdClientIds.push(client.body.id);

    const contract = await agent.post('/contracts').send({
      number: `CT-${randomUUID().slice(0, 8)}`,
      clientId: client.body.id,
      dueDate: '2027-01-01',
      items: [{ description: 'Item', quantity: 1, unitPrice: 100 }],
    });
    expect(contract.status).toBe(201);

    const res = await agent.delete(`/clients/${client.body.id}`);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/contratos vinculados/i);

    await agent.delete(`/contracts/${contract.body.id}`);
  });
});
