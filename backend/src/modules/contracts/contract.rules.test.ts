import { describe, expect, it } from 'vitest';
import { computeContractValue, resolveContractStatus } from './contract.rules.js';

describe('computeContractValue', () => {
  it('soma quantity * unitPrice de todos os itens', () => {
    const items = [
      { quantity: 2, unitPrice: 100 },
      { quantity: 1, unitPrice: 50 },
    ];
    expect(computeContractValue(items, 0)).toBe(250);
  });

  it('subtrai o desconto do total', () => {
    const items = [{ quantity: 2, unitPrice: 100 }];
    expect(computeContractValue(items, 30)).toBe(170);
  });

  it('nunca retorna negativo quando o desconto excede o total', () => {
    const items = [{ quantity: 1, unitPrice: 10 }];
    expect(computeContractValue(items, 999)).toBe(0);
  });

  it('arredonda para 2 casas decimais', () => {
    const items = [{ quantity: 3, unitPrice: 0.1 }];
    expect(computeContractValue(items, 0)).toBe(0.3);
  });
});

describe('resolveContractStatus', () => {
  const now = new Date('2026-07-17T12:00:00Z');

  it('retorna ATIVO para vencimento futuro', () => {
    expect(resolveContractStatus(new Date('2026-12-31'), null, now)).toBe('ATIVO');
  });

  it('retorna VENCIDO para vencimento passado', () => {
    expect(resolveContractStatus(new Date('2026-01-01'), null, now)).toBe('VENCIDO');
  });

  it('retorna VENCIDO para vencimento passado mesmo se estava ATIVO', () => {
    expect(resolveContractStatus(new Date('2026-01-01'), 'ATIVO', now)).toBe('VENCIDO');
  });

  it('ENCERRADO é definitivo, mesmo com data vencida', () => {
    expect(resolveContractStatus(new Date('2026-01-01'), 'ENCERRADO', now)).toBe('ENCERRADO');
  });

  it('ENCERRADO é definitivo, mesmo com data futura', () => {
    expect(resolveContractStatus(new Date('2026-12-31'), 'ENCERRADO', now)).toBe('ENCERRADO');
  });
});
