import { describe, expect, it } from 'vitest';
import { computeContractTotal } from './contractTotal';

describe('computeContractTotal', () => {
  it('soma os itens e subtrai o desconto', () => {
    const items = [
      { quantity: 2, unitPrice: 100 },
      { quantity: 1, unitPrice: 50 },
    ];
    expect(computeContractTotal(items, 30)).toBe(220);
  });

  it('aceita valores como string (estado de formulário)', () => {
    const items = [{ quantity: '2', unitPrice: '10.5' }];
    expect(computeContractTotal(items, '1')).toBe(20);
  });

  it('trata campos vazios como zero', () => {
    const items = [{ quantity: '', unitPrice: '' }];
    expect(computeContractTotal(items, '')).toBe(0);
  });

  it('nunca retorna negativo', () => {
    const items = [{ quantity: 1, unitPrice: 10 }];
    expect(computeContractTotal(items, 50)).toBe(0);
  });
});
