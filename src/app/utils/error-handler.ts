// utils/error-handler.ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('status' in error) {
      return `Erro HTTP ${error.status}`;
    }
  }
  return 'Ocorreu um erro desconhecido';
}