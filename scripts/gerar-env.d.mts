export function parseEnv(conteudo: string): Record<string, string>;
export function gerarConteudoEnvironmentTs(whatsapp: string): string;
export function executarGeracaoEnv(opcoes?: {
  rootDir?: string;
  logger?: Pick<Console, 'warn'>;
}): { whatsapp: string; avisou: boolean };

