import { http } from './http';
import type { Client, Contract, ContractInput, ContractSummary } from './types';

export interface AuthUser {
  id: string;
  email: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    http.post<{ user: AuthUser }>('/auth/login', { email, password }),
  logout: () => http.post('/auth/logout'),
  me: () => http.get<{ user: AuthUser }>('/auth/me'),
};

export const clientsApi = {
  list: () => http.get<Client[]>('/clients'),
  create: (data: { name: string; document: string }) => http.post<Client>('/clients', data),
  update: (id: string, data: { name: string; document: string }) =>
    http.put<Client>(`/clients/${id}`, data),
  remove: (id: string) => http.delete(`/clients/${id}`),
};

export const contractsApi = {
  list: () => http.get<Contract[]>('/contracts'),
  summary: () => http.get<ContractSummary>('/contracts/summary'),
  get: (id: string) => http.get<Contract>(`/contracts/${id}`),
  create: (data: ContractInput) => http.post<Contract>('/contracts', data),
  update: (id: string, data: ContractInput) => http.put<Contract>(`/contracts/${id}`, data),
  close: (id: string) => http.patch<Contract>(`/contracts/${id}/encerrar`),
  remove: (id: string) => http.delete(`/contracts/${id}`),
};
