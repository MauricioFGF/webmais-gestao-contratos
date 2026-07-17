import { prisma } from '../../config/prisma';
import { invalidateContractCaches } from '../../lib/cache';

// Marca como VENCIDO todo contrato ATIVO cuja data de vencimento já passou.
// Usado pelo job periódico (BullMQ) e como lazy-check na listagem.
export async function expireOverdueContracts(): Promise<number> {
  const { count } = await prisma.contract.updateMany({
    where: { status: 'ATIVO', dueDate: { lt: new Date() } },
    data: { status: 'VENCIDO' },
  });
  if (count > 0) {
    await invalidateContractCaches();
  }
  return count;
}
