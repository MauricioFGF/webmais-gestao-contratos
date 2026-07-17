import type { ContractStatus } from '../../generated/prisma/enums.js';

export interface ContractItemInput {
  quantity: number;
  unitPrice: number;
}

export function computeContractValue(items: ContractItemInput[], discount: number): number {
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return Math.max(round2(total - discount), 0);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function resolveContractStatus(
  dueDate: Date,
  currentStatus: ContractStatus | null,
  now: Date = new Date(),
): ContractStatus {
  if (currentStatus === 'ENCERRADO') return 'ENCERRADO';
  return dueDate < now ? 'VENCIDO' : 'ATIVO';
}
