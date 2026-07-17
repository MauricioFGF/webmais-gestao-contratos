import { useEffect, useState, type FormEvent } from 'react';
import { clientsApi } from '../api/services';
import type { Client } from '../api/types';
import { Toast } from '../components/Toast';

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  async function load() {
    const { data } = await clientsApi.list();
    setClients(data);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(client: Client) {
    setEditingId(client.id);
    setName(client.name);
    setDocument(client.document);
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setDocument('');
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await clientsApi.update(editingId, { name, document });
        setToast('Cliente atualizado com sucesso');
      } else {
        await clientsApi.create({ name, document });
        setToast('Cliente cadastrado com sucesso');
      }
      cancelEdit();
      await load();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Erro ao salvar cliente';
      setError(message);
    }
  }

  async function handleDelete(client: Client) {
    if (!window.confirm(`Excluir o cliente ${client.name}?`)) return;
    try {
      await clientsApi.remove(client.id);
      setToast(`Cliente ${client.name} excluído`);
      if (editingId === client.id) cancelEdit();
      await load();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Erro ao excluir cliente';
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
        <button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</button>
        {editingId && (
          <button type="button" className="btn-secondary" onClick={cancelEdit}>
            Cancelar
          </button>
        )}
        {error && <p className="error">{error}</p>}
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Documento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 && (
            <tr>
              <td colSpan={3} className="empty">
                Nenhum cliente cadastrado
              </td>
            </tr>
          )}
          {clients.map((c) => (
            <tr key={c.id} className={c.id === editingId ? 'row-highlight' : ''}>
              <td>{c.name}</td>
              <td>{c.document}</td>
              <td className="actions">
                <button className="btn-small" onClick={() => startEdit(c)}>
                  Editar
                </button>
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
