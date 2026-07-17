export interface Client {
  id: string;
  name: string;
  document: string;
  createdAt: string;
}

export type ContractStatus = 'ATIVO' | 'VENCIDO' | 'ENCERRADO';

export type ContractType = 'SERVICO' | 'PRODUTO' | 'ASSINATURA';

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  SERVICO: 'Serviço',
  PRODUTO: 'Produto',
  ASSINATURA: 'Assinatura',
};

export interface ContractItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
}

export interface Contract {
  id: string;
  number: string;
  clientId: string;
  client: Pick<Client, 'id' | 'name' | 'document'>;
  type: ContractType;
  currency: string;
  value: string;
  discount: string;
  dueDate: string;
  status: ContractStatus;
  items: ContractItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractSummary {
  ATIVO: number;
  VENCIDO: number;
  ENCERRADO: number;
}

export interface ContractItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ContractInput {
  number: string;
  clientId: string;
  type: ContractType;
  discount: number;
  dueDate: string;
  items: ContractItemInput[];
}
