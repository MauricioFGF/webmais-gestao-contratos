import { useCallback, useEffect, useState } from 'react';
import { contractsApi } from '../api/services';
import { CONTRACT_TYPE_LABELS, type Contract, type ContractSummary } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { SummaryCards } from '../components/SummaryCards';
import { ContractFormModal } from '../components/ContractFormModal';
import { extractErrorMessage, useToast } from '../components/useToast';

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

type ModalState = { mode: 'create' } | { mode: 'edit'; contractId: string } | null;

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [summary, setSummary] = useState<ContractSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightId, setHighlightId] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    const [listRes, summaryRes] = await Promise.all([
      contractsApi.list(),
      contractsApi.summary(),
    ]);
    setContracts(listRes.data);
    setSummary(summaryRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClose(contract: Contract) {
    if (!window.confirm(`Encerrar o contrato ${contract.number}? Essa ação é definitiva.`)) return;
    try {
      const { data: updated } = await contractsApi.close(contract.id);
      setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setHighlightId(updated.id);
      toast.success(`Contrato ${updated.number} encerrado com sucesso`);
      setTimeout(() => setHighlightId(''), 2500);
      const { data } = await contractsApi.summary();
      setSummary(data);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Não foi possível encerrar o contrato'));
    }
  }

  async function handleDelete(contract: Contract) {
    if (!window.confirm(`Excluir o contrato ${contract.number}? Essa ação não pode ser desfeita.`))
      return;
    try {
      await contractsApi.remove(contract.id);
      toast.success(`Contrato ${contract.number} excluído`);
      await load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Não foi possível excluir o contrato'));
    }
  }

  function handleSaved() {
    setModal(null);
    load();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Contratos</h2>
          <p className="page-subtitle">Gerencie contratos vinculados aos seus clientes</p>
        </div>
        <button type="button" className="button" onClick={() => setModal({ mode: 'create' })}>
          + Novo contrato
        </button>
      </div>

      <SummaryCards summary={summary} />

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="empty">
                  Carregando contratos...
                </td>
              </tr>
            )}
            {!loading && contracts.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  Nenhum contrato cadastrado ainda. Clique em "Novo contrato" para começar.
                </td>
              </tr>
            )}
            {contracts.map((c) => (
              <tr key={c.id} className={c.id === highlightId ? 'row-highlight' : ''}>
                <td data-label="Número">{c.number}</td>
                <td data-label="Cliente">{c.client.name}</td>
                <td data-label="Tipo">{CONTRACT_TYPE_LABELS[c.type]}</td>
                <td data-label="Valor">{formatCurrency(c.value)}</td>
                <td data-label="Vencimento">{formatDate(c.dueDate)}</td>
                <td data-label="Status">
                  <StatusBadge status={c.status} />
                </td>
                <td className="actions" data-label="Ações">
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => setModal({ mode: 'edit', contractId: c.id })}
                  >
                    Editar
                  </button>
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
      </div>

      {modal && (
        <ContractFormModal
          contractId={modal.mode === 'edit' ? modal.contractId : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
