import { useEffect, useState, type FormEvent } from 'react';
import { clientsApi } from '../api/services';
import type { Client } from '../api/types';
import { Toast } from '../components/Toast';

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  async function load() {
    const { data } = await clientsApi.list();
    setClients(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await clientsApi.create({ name, document });
      setName('');
      setDocument('');
      setToast('Cliente cadastrado com sucesso');
      await load();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Erro ao cadastrar cliente';
      setError(message);
    }
  }

  return (
    <>
      <h2>Clientes</h2>
      <form className="card form-inline" onSubmit={handleSubmit}>
        <label>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Documento (CPF/CNPJ)
          <input value={document} onChange={(e) => setDocument(e.target.value)} required />
        </label>
        <button type="submit">Cadastrar</button>
        {error && <p className="error">{error}</p>}
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Documento</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 && (
            <tr>
              <td colSpan={2} className="empty">
                Nenhum cliente cadastrado
              </td>
            </tr>
          )}
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.document}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}
