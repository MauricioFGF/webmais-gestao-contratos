import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi, contractsApi } from '../api/services';
import type { Client } from '../api/types';

export function ContractFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [number, setNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clientsApi.list().then(({ data }) => setClients(data));
    if (id) {
      contractsApi.get(id).then(({ data }) => {
        setNumber(data.number);
        setClientId(data.clientId);
        setValue(data.value);
        setDueDate(data.dueDate.slice(0, 10));
      });
    }
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = { number, clientId, value: Number(value), dueDate };
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
        <label>
          Valor (R$)
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
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
