import { prisma } from '../../config/prisma.js';
import { invalidateContractCaches } from '../../lib/cache.js';

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
