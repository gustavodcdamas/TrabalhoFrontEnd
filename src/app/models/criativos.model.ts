// criativos.model.ts
export interface criativos {
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

export interface CreateCriativosRequest {
  titulo?: string;
  cliente: string;
  descricao: string;
  image?: File;
  status?: string;
}

export interface UpdateCriativosRequest {
  titulo?: string;
  cliente?: string;
  descricao?: string;
  image?: File;
  status?: string;
}

export interface CriativosStats {
  total: number;
  ativos: number;
  inativos: number;
  excluidos: number;
  recentes: number;
  percentualAtivos: number;
}