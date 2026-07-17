import type { ContractSummary } from '../api/types';

export function SummaryCards({ summary }: { summary: ContractSummary | null }) {
  return (
    <div className="summary-cards">
      <div className="card summary summary-ativo">
        <span className="summary-icon">●</span>
        <div>
          <span className="summary-count">{summary?.ATIVO ?? '–'}</span>
          <span className="summary-label">Ativos</span>
        </div>
      </div>
      <div className="card summary summary-vencido">
        <span className="summary-icon">●</span>
        <div>
          <span className="summary-count">{summary?.VENCIDO ?? '–'}</span>
          <span className="summary-label">Vencidos</span>
        </div>
      </div>
      <div className="card summary summary-encerrado">
        <span className="summary-icon">●</span>
        <div>
          <span className="summary-count">{summary?.ENCERRADO ?? '–'}</span>
          <span className="summary-label">Encerrados</span>
        </div>
      </div>
    </div>
  );
}
