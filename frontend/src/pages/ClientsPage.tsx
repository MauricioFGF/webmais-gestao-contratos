import { useEffect, useState, type FormEvent } from 'react';
import { clientsApi } from '../api/services';
import type { Client } from '../api/types';
import { extractErrorMessage, useToast } from '../components/useToast';

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function load() {
    const { data } = await clientsApi.list();
    setClients(data);
    setLoading(false);
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
        toast.success(`Cliente ${name} atualizado com sucesso`);
      } else {
        await clientsApi.create({ name, document });
        toast.success(`Cliente ${name} cadastrado com sucesso`);
      }
      cancelEdit();
      await load();
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Erro ao salvar cliente');
      setError(message);
      toast.error(message);
    }
  }

  async function handleDelete(client: Client) {
    if (!window.confirm(`Excluir o cliente ${client.name}?`)) return;
    try {
      await clientsApi.remove(client.id);
      toast.success(`Cliente ${client.name} excluído`);
      if (editingId === client.id) cancelEdit();
      await load();
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Erro ao excluir cliente');
      setError(message);
      toast.error(message);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Clientes</h2>
          <p className="page-subtitle">Cadastre os clientes vinculados aos contratos</p>
        </div>
      </div>

      <form className="card form-inline" onSubmit={handleSubmit}>
        <label>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Documento (CPF/CNPJ)
          <input value={document} onChange={(e) => setDocument(e.target.value)} required />
        </label>
        <div className="form-inline-actions">
          <button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              Cancelar
            </button>
          )}
        </div>
        {error && <p className="error">{error}</p>}
      </form>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Documento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="empty">
                  Carregando clientes...
                </td>
              </tr>
            )}
            {!loading && clients.length === 0 && (
              <tr>
                <td colSpan={3} className="empty">
                  Nenhum cliente cadastrado ainda.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className={c.id === editingId ? 'row-highlight' : ''}>
                <td data-label="Nome">{c.name}</td>
                <td data-label="Documento">{c.document}</td>
                <td className="actions" data-label="Ações">
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
      </div>
    </>
  );
}
