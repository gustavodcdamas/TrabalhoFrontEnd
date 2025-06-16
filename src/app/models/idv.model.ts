// idv.model.ts
export interface idv {
  id: string;
  titulo: string;
  cliente: string;
  descricao: string;
  image: string;
  status: 'ativo' | 'inativo' | 'excluido';
  excluidoPor?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
  dataExclusao?: Date;
}

export interface CreateIdvRequest {
  titulo?: string;
  cliente: string;
  descricao: string;
  image?: File;
  status?: string;
}

export interface UpdateIdvRequest {
  titulo?: string;
  cliente?: string;
  descricao?: string;
  image?: File;
  status?: string;
}

export interface IdvStats {
  total: number;
  ativos: number;
  inativos: number;
  excluidos: number;
  recentes: number;
  percentualAtivos: number;
}