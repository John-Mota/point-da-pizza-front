import { Categoria } from '../../../../shared/models';

export const ICONE_CATEGORIA_PADRAO = '🍽️';

/**
 * Mapa centralizado de ícones/emojis por categoria do cardápio.
 * As chaves são comparadas (sem acentos e em minúsculas) contra o id e o nome da categoria.
 * A ordem das chaves prioriza termos mais específicos (ex.: "doces" antes de "pizzas").
 */
export const MAPA_ICONES_CATEGORIA: ReadonlyArray<{ readonly chave: string; readonly icone: string }> = [
  { chave: 'destaque', icone: '⭐' },
  { chave: 'promoc', icone: '🔥' },
  { chave: 'oferta', icone: '🔥' },
  { chave: 'combo', icone: '🎁' },
  { chave: 'doce', icone: '🍫' },
  { chave: 'pastel', icone: '🥟' },
  { chave: 'pasteis', icone: '🥟' },
  { chave: 'calzone', icone: '🌙' },
  { chave: 'lasanha', icone: '🍝' },
  { chave: 'massa', icone: '🍝' },
  { chave: 'porc', icone: '🍟' },
  { chave: 'petisco', icone: '🍟' },
  { chave: 'bebida', icone: '🥤' },
  { chave: 'refri', icone: '🥤' },
  { chave: 'suco', icone: '🥤' },
  { chave: 'pizza', icone: '🍕' },
  { chave: 'tradicion', icone: '🍕' },
];

function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function obterIconeCategoria(
  categoria: Pick<Categoria, 'id' | 'nome'> | string
): string {
  const textoAlvo =
    typeof categoria === 'string'
      ? normalizarTexto(categoria)
      : `${normalizarTexto(categoria.nome)} ${normalizarTexto(categoria.id)}`;

  for (const item of MAPA_ICONES_CATEGORIA) {
    if (textoAlvo.includes(item.chave)) {
      return item.icone;
    }
  }

  return ICONE_CATEGORIA_PADRAO;
}

