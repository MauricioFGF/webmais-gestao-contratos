import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contractsApi } from '../api/services';
import type { Contract, ContractSummary } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { SummaryCards } from '../components/SummaryCards';
import { Toast } from '../components/Toast';

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [summary, setSummary] = useState<ContractSummary | null>(null);
  const [toast, setToast] = useState('');
  const [highlightId, setHighlightId] = useState('');

  const load = useCallback(async () => {
    const [listRes, summaryRes] = await Promise.all([
      contractsApi.list(),
      contractsApi.summary(),
    ]);
    setContracts(listRes.data);
    setSummary(summaryRes.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClose(contract: Contract) {
    if (!window.confirm(`Encerrar o contrato ${contract.number}?`)) return;
    const { data: updated } = await contractsApi.close(contract.id);
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setHighlightId(updated.id);
    setToast(`Contrato ${updated.number} encerrado`);
    setTimeout(() => setHighlightId(''), 2500);
    const { data } = await contractsApi.summary();
    setSummary(data);
  }

  async function handleDelete(contract: Contract) {
    if (!window.confirm(`Excluir o contrato ${contract.number}? Essa ação é definitiva.`)) return;
    await contractsApi.remove(contract.id);
    setToast(`Contrato ${contract.number} excluído`);
    await load();
  }

  return (
    <>
      <div className="page-header">
        <h2>Contratos</h2>
        <Link className="button" to="/contracts/new">
          + Novo contrato
        </Link>
      </div>

      <SummaryCards summary={summary} />

      <table className="table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 && (
            <tr>
              <td colSpan={6} className="empty">
                Nenhum contrato cadastrado
              </td>
            </tr>
          )}
          {contracts.map((c) => (
            <tr key={c.id} className={c.id === highlightId ? 'row-highlight' : ''}>
              <td>{c.number}</td>
              <td>{c.client.name}</td>
              <td>{formatCurrency(c.value)}</td>
              <td>{formatDate(c.dueDate)}</td>
              <td>
                <StatusBadge status={c.status} />
              </td>
              <td className="actions">
                <Link className="button btn-small" to={`/contracts/${c.id}/edit`}>
                  Editar
                </Link>
                {c.status !== 'ENCERRADO' && (
                  <button className="btn-small btn-warn" onClick={() => handleClose(c)}>
                    Encerrar
                  </button>
                )}
                <button className="btn-small btn-danger" onClick={() => handleDelete(c)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}
