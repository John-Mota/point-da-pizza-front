export interface ApiCampoErro {
  campo: string;
  mensagem: string;
}

export interface ApiError {
  status: number;
  mensagem: string;
  campos?: ApiCampoErro[];
}

export function isApiError(valor: unknown): valor is ApiError {
  if (!valor || typeof valor !== 'object') {
    return false;
  }
  const candidato = valor as Partial<ApiError>;
  return typeof candidato.status === 'number' && typeof candidato.mensagem === 'string';
}
