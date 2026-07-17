import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi, contractsApi } from '../api/services';
import { CONTRACT_TYPE_LABELS, type Client, type ContractType } from '../api/types';
import { computeContractTotal } from '../lib/contractTotal';

interface ItemRow {
  description: string;
  quantity: string;
  unitPrice: string;
}

const emptyItem: ItemRow = { description: '', quantity: '1', unitPrice: '' };

export function ContractFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [number, setNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<ContractType>('SERVICO');
  const [discount, setDiscount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItem }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clientsApi.list().then(({ data }) => setClients(data));
    if (id) {
      contractsApi.get(id).then(({ data }) => {
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
      });
    }
  }, [id]);

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
      if (isEdit) {
        await contractsApi.update(id, payload);
      } else {
        await contractsApi.create(payload);
      }
      navigate('/contracts');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Erro ao salvar contrato';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>{isEdit ? 'Editar contrato' : 'Novo contrato'}</h2>
      <form className="card form-stacked" onSubmit={handleSubmit}>
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
          <button type="button" className="btn-secondary" onClick={() => navigate('/contracts')}>
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}
