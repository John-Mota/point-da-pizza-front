import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Faz o parse simples de conteúdo .env no formato KEY=VALUE,
 * ignorando linhas vazias e comentários iniciados por #.
 *
 * @param {string} conteudo
 * @returns {Record<string, string>}
 */
export function parseEnv(conteudo) {
  /** @type {Record<string, string>} */
  const resultado = {};
  if (typeof conteudo !== 'string') {
    return resultado;
  }

  const linhas = conteudo.split(/\r?\n/);
  for (const linhaBruta of linhas) {
    const linha = linhaBruta.trim();
    if (!linha || linha.startsWith('#')) {
      continue;
    }

    const idxIgual = linha.indexOf('=');
    if (idxIgual <= 0) {
      continue;
    }

    const chave = linha.slice(0, idxIgual).trim();
    let valor = linha.slice(idxIgual + 1).trim();

    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1).trim();
    } else {
      const idxComentario = valor.indexOf(' #');
      if (idxComentario !== -1) {
        valor = valor.slice(0, idxComentario).trim();
      }
    }

    if (chave) {
      resultado[chave] = valor;
    }
  }

  return resultado;
}

/**
 * Gera o conteúdo TypeScript de environment.generated.ts.
 *
 * @param {string} whatsapp
 * @returns {string}
 */
export function gerarConteudoEnvironmentTs(whatsapp) {
  const seguro = String(whatsapp ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `// Arquivo gerado automaticamente por scripts/gerar-env.mjs. Não edite manualmente.
export const environment: { readonly whatsapp: string } = {
  whatsapp: '${seguro}',
};

export const whatsapp: string = environment.whatsapp;
`;
}

/**
 * Lê o arquivo .env da raiz e gera src/environments/environment.generated.ts.
 *
 * @param {{ rootDir?: string; logger?: Pick<Console, 'warn'> }} [opcoes]
 * @returns {{ whatsapp: string; avisou: boolean }}
 */
export function executarGeracaoEnv(opcoes = {}) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const rootDir = opcoes.rootDir ?? resolve(__dirname, '..');
  const logger = opcoes.logger ?? console;

  const envPath = resolve(rootDir, '.env');
  const destinoPath = resolve(rootDir, 'src/environments/environment.generated.ts');

  let whatsappValor = '';
  let avisou = false;

  if (!existsSync(envPath)) {
    logger.warn(
      '[gerar-env] Aviso: arquivo .env não encontrado na raiz. Gerando environment.generated.ts com whatsapp vazio.'
    );
    avisou = true;
  } else {
    const conteudo = readFileSync(envPath, 'utf-8');
    const variaveis = parseEnv(conteudo);
    whatsappValor = (variaveis.WHATS_APP ?? '').trim();

    if (!whatsappValor) {
      logger.warn(
        '[gerar-env] Aviso: variável WHATS_APP ausente ou vazia no .env. Gerando environment.generated.ts com whatsapp vazio.'
      );
      avisou = true;
    }
  }

  mkdirSync(dirname(destinoPath), { recursive: true });
  writeFileSync(destinoPath, gerarConteudoEnvironmentTs(whatsappValor), 'utf-8');

  return { whatsapp: whatsappValor, avisou };
}

const isExecucaoDireta =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isExecucaoDireta) {
  executarGeracaoEnv();
}

