import type { ContractStatus } from '../api/types';

const LABELS: Record<ContractStatus, string> = {
  ATIVO: 'Ativo',
  VENCIDO: 'Vencido',
  ENCERRADO: 'Encerrado',
};

export function StatusBadge({ status }: { status: ContractStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{LABELS[status]}</span>;
}
