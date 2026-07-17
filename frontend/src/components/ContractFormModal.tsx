import { useEffect, useState, type FormEvent } from 'react';
import { clientsApi, contractsApi } from '../api/services';
import { CONTRACT_TYPE_LABELS, type Client, type Contract, type ContractType } from '../api/types';
import { computeContractTotal } from '../lib/contractTotal';
import { Modal } from './Modal';
import { extractErrorMessage, useToast } from './useToast';

interface ItemRow {
  description: string;
  quantity: string;
  unitPrice: string;
}

const emptyItem: ItemRow = { description: '', quantity: '1', unitPrice: '' };

interface ContractFormModalProps {
  contractId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ContractFormModal({ contractId, onClose, onSaved }: ContractFormModalProps) {
  const isEdit = !!contractId;
  const toast = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [number, setNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<ContractType>('SERVICO');
  const [discount, setDiscount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItem }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(isEdit);

  useEffect(() => {
    clientsApi.list().then(({ data }) => setClients(data));
    if (contractId) {
      contractsApi.get(contractId).then(({ data }: { data: Contract }) => {
        setNumber(data.number);
        setClientId(data.clientId);
        setType(data.type);
        setDiscount(data.discount);
        setDueDate(data.dueDate.slice(0, 10));
        setItems(
          data.items.map((i) => ({
            description: i.description,
            quantity: String(i.quantity),
            unitPrice: i.unitPrice,
          })),
        );
        setInitializing(false);
      });
    }
  }, [contractId]);

  const total = computeContractTotal(items, discount);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      number,
      clientId,
      type,
      discount: Number(discount) || 0,
      dueDate,
      items: items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };
    try {
      if (isEdit && contractId) {
        await contractsApi.update(contractId, payload);
        toast.success(`Contrato ${number} atualizado com sucesso`);
      } else {
        await contractsApi.create(payload);
        toast.success(`Contrato ${number} cadastrado com sucesso`);
      }
      onSaved();
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Erro ao salvar contrato');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Editar contrato' : 'Novo contrato'} onClose={onClose}>
      {initializing ? (
        <p className="modal-loading">Carregando contrato...</p>
      ) : (
        <form className="form-stacked" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Número
              <input value={number} onChange={(e) => setNumber(e.target.value)} required />
            </label>
            <label>
              Cliente
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.document})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Tipo
              <select value={type} onChange={(e) => setType(e.target.value as ContractType)}>
                {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Vencimento
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </label>
          </div>

          <fieldset className="items-fieldset">
            <legend>Itens do contrato</legend>
            {items.map((item, index) => (
              <div className="item-row" key={index}>
                <label>
                  Descrição
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Qtd.
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Preço unit. (R$)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                    required
                  />
                </label>
                <button
                  type="button"
                  className="btn-small btn-danger"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  title="Remover item"
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="btn-secondary btn-small" onClick={addItem}>
              + Adicionar item
            </button>
          </fieldset>

          <div className="form-row">
            <label>
              Desconto (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </label>
            <p className="contract-total">
              Valor total:{' '}
              <strong>
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </p>
          </div>

          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
