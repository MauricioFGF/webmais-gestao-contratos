import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createTestClient, deleteTestClient, deleteTestUser, loginAsTestUser } from '../../test/helpers.js';
import { invalidateContractCaches } from '../../lib/cache.js';

function contractNumber() {
  return `CT-${randomUUID().slice(0, 8)}`;
}

describe('contracts routes (integração)', () => {
  let agent: Awaited<ReturnType<typeof loginAsTestUser>>['agent'];
  let userId: string;
  let client: Awaited<ReturnType<typeof createTestClient>>;
  const createdContractIds: string[] = [];

  beforeAll(async () => {
    const session = await loginAsTestUser();
    agent = session.agent;
    userId = session.user.id;
    client = await createTestClient();
  });

  afterEach(async () => {
    await invalidateContractCaches();
  });

  afterAll(async () => {
    await Promise.all(createdContractIds.map((id) => agent.delete(`/contracts/${id}`)));
    await deleteTestClient(client.id);
    await deleteTestUser(userId);
  });

  it('POST /contracts calcula o valor como soma dos itens menos o desconto', async () => {
    const res = await agent.post('/contracts').send({
      number: contractNumber(),
      clientId: client.id,
      type: 'PRODUTO',
      discount: 30,
      dueDate: '2027-01-01',
      items: [
        { description: 'Licença', quantity: 2, unitPrice: 100 },
        { description: 'Suporte', quantity: 1, unitPrice: 50 },
      ],
    });

    expect(res.status).toBe(201);
    expect(res.body.value).toBe('220');
    expect(res.body.status).toBe('ATIVO');
    expect(res.body.items).toHaveLength(2);
    createdContractIds.push(res.body.id);
  });

  it('POST /contracts ignora um "value" enviado pelo cliente (nunca aceito da API)', async () => {
    const res = await agent.post('/contracts').send({
      number: contractNumber(),
      clientId: client.id,
      value: 999999,
      dueDate: '2027-01-01',
      items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.value).toBe('10');
    createdContractIds.push(res.body.id);
  });

  it('POST /contracts sem itens retorna 400', async () => {
    const res = await agent.post('/contracts').send({
      number: contractNumber(),
      clientId: client.id,
      dueDate: '2027-01-01',
      items: [],
    });

    expect(res.status).toBe(400);
  });

  it('POST /contracts com vencimento passado já nasce VENCIDO', async () => {
    const res = await agent.post('/contracts').send({
      number: contractNumber(),
      clientId: client.id,
      dueDate: '2020-01-01',
      items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('VENCIDO');
    createdContractIds.push(res.body.id);
  });

  it('PATCH /contracts/:id/encerrar marca ENCERRADO', async () => {
    const created = await agent.post('/contracts').send({
      number: contractNumber(),
      clientId: client.id,
      dueDate: '2027-01-01',
      items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
    });
    createdContractIds.push(created.body.id);

    const res = await agent.patch(`/contracts/${created.body.id}/encerrar`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ENCERRADO');
  });

  it('PUT em um contrato ENCERRADO mantém o status (definitivo, mesmo com data futura)', async () => {
    const created = await agent.post('/contracts').send({
      number: contractNumber(),
      clientId: client.id,
      dueDate: '2027-01-01',
      items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
    });
    createdContractIds.push(created.body.id);
    await agent.patch(`/contracts/${created.body.id}/encerrar`);

    const updated = await agent.put(`/contracts/${created.body.id}`).send({
      number: created.body.number,
      clientId: client.id,
      dueDate: '2030-01-01',
      items: [{ description: 'Item', quantity: 1, unitPrice: 20 }],
    });

    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('ENCERRADO');
    expect(updated.body.value).toBe('20');
  });

  it('GET /contracts/summary reflete as contagens por status', async () => {
    const res = await agent.get('/contracts/summary');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ATIVO');
    expect(res.body).toHaveProperty('VENCIDO');
    expect(res.body).toHaveProperty('ENCERRADO');
    expect(res.body.VENCIDO).toBeGreaterThanOrEqual(1);
    expect(res.body.ENCERRADO).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /contracts/:id remove o contrato', async () => {
    const created = await agent.post('/contracts').send({
      number: contractNumber(),
      clientId: client.id,
      dueDate: '2027-01-01',
      items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
    });

    const res = await agent.delete(`/contracts/${created.body.id}`);
    expect(res.status).toBe(204);

    const list = await agent.get('/contracts');
    expect(list.body.some((c: { id: string }) => c.id === created.body.id)).toBe(false);
  });
});
