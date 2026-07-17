export interface Client {
  id: string;
  name: string;
  document: string;
  createdAt: string;
}

export type ContractStatus = 'ATIVO' | 'VENCIDO' | 'ENCERRADO';

export interface Contract {
  id: string;
  number: string;
  clientId: string;
  client: Pick<Client, 'id' | 'name' | 'document'>;
  value: string;
  dueDate: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContractSummary {
  ATIVO: number;
  VENCIDO: number;
  ENCERRADO: number;
}

export interface ContractInput {
  number: string;
  clientId: string;
  value: number;
  dueDate: string;
}
