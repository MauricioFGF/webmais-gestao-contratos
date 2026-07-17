import type { ContractSummary } from '../api/types';

export function SummaryCards({ summary }: { summary: ContractSummary | null }) {
  return (
    <div className="summary-cards">
      <div className="card summary summary-ativo">
        <span className="summary-count">{summary?.ATIVO ?? '–'}</span>
        <span>Ativos</span>
      </div>
      <div className="card summary summary-vencido">
        <span className="summary-count">{summary?.VENCIDO ?? '–'}</span>
        <span>Vencidos</span>
      </div>
      <div className="card summary summary-encerrado">
        <span className="summary-count">{summary?.ENCERRADO ?? '–'}</span>
        <span>Encerrados</span>
      </div>
    </div>
  );
}
