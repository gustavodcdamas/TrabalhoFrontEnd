export interface landing {
  id: string;
  titulo: string;
  cliente: string;
  descricao: string;
  image: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
  status: 'ativo' | 'inativo' | 'excluido';
  excluidoPor?: string;
  dataExclusao?: Date;
}