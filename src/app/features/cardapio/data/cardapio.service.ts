import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { API_BASE_URL, construirUrlApi } from '../../../core/api';
import {
  BordaProdutoOpcao,
  Categoria,
  Loja,
  Produto,
  SecaoCardapio,
  TamanhoProdutoOpcao,
} from '../../../shared/models';
import { LojaService } from './loja.service';

export type { SecaoCardapio } from '../../../shared/models';

function normalizarTamanhos(bruto: unknown): TamanhoProdutoOpcao[] | undefined {
  if (!Array.isArray(bruto) || bruto.length === 0) {
    return undefined;
  }
  const tamanhos = bruto
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: String(item['id'] ?? item['codigo'] ?? '').trim(),
      nome: String(item['nome'] ?? '').trim(),
      preco: Number(item['preco'] ?? 0),
    }))
    .filter((t) => Boolean(t.id && t.nome));

  return tamanhos.length > 0 ? tamanhos : undefined;
}

function normalizarBordas(bruto: unknown): BordaProdutoOpcao[] | undefined {
  if (!Array.isArray(bruto) || bruto.length === 0) {
    return undefined;
  }
  const bordas = bruto
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: String(item['id'] ?? item['codigo'] ?? '').trim(),
      nome: String(item['nome'] ?? '').trim(),
      acrescimo: Number(item['acrescimo'] ?? 0),
    }))
    .filter((b) => Boolean(b.id && b.nome));

  return bordas.length > 0 ? bordas : undefined;
}

function normalizarProduto(bruto: unknown, categoriaPadrao?: Categoria): Produto | null {
  if (!bruto || typeof bruto !== 'object') {
    return null;
  }
  const p = bruto as Record<string, unknown>;
  const id = String(p['id'] ?? '').trim();
  const nome = String(p['nome'] ?? '').trim();
  if (!id || !nome) {
    return null;
  }

  const categoriaId = String(p['categoriaId'] ?? categoriaPadrao?.id ?? '').trim();
  const categoriaNome =
    typeof p['categoria'] === 'string' && p['categoria'].trim()
      ? p['categoria'].trim()
      : categoriaPadrao?.nome;

  const precoBase = Number(p['preco'] ?? 0);
  const precoOriginalBruto = p['precoOriginal'];
  const precoPromocionalBruto = p['precoPromocional'];

  let preco = precoBase;
  let precoOriginal: number | undefined;

  if (precoOriginalBruto != null && Number(precoOriginalBruto) > precoBase) {
    precoOriginal = Number(precoOriginalBruto);
  } else if (precoPromocionalBruto != null && Number(precoPromocionalBruto) > 0 && Number(precoPromocionalBruto) < precoBase) {
    preco = Number(precoPromocionalBruto);
    precoOriginal = precoBase;
  }

  const tamanhos = normalizarTamanhos(p['tamanhos']);
  const bordas = normalizarBordas(p['bordas']);
  const seloDestaque =
    typeof p['seloDestaque'] === 'string' && p['seloDestaque'].trim()
      ? p['seloDestaque'].trim()
      : typeof p['etiqueta'] === 'string' && p['etiqueta'].trim()
        ? p['etiqueta'].trim()
        : undefined;

  return {
    id,
    categoriaId,
    ...(categoriaNome ? { categoria: categoriaNome } : {}),
    nome,
    descricao: typeof p['descricao'] === 'string' ? p['descricao'] : '',
    preco,
    ...(precoOriginal !== undefined ? { precoOriginal } : {}),
    ...(typeof p['imagemUrl'] === 'string' && p['imagemUrl'].trim()
      ? { imagemUrl: p['imagemUrl'].trim() }
      : {}),
    disponivel: p['disponivel'] !== false,
    ...(typeof p['destaque'] === 'boolean' ? { destaque: p['destaque'] } : {}),
    ...(typeof p['ordemDestaque'] === 'number' ? { ordemDestaque: p['ordemDestaque'] } : {}),
    ...(seloDestaque ? { seloDestaque } : {}),
    ...(tamanhos ? { tamanhos } : {}),
    ...(bordas ? { bordas } : {}),
  };
}

/**
 * Agrupa os produtos por categoria, na ordem das categorias e na ordem original
 * dos produtos, omitindo categorias sem nenhum produto.
 */
export function montarCardapio(
  categorias: readonly Categoria[],
  produtos: readonly Produto[]
): SecaoCardapio[] {
  return [...categorias]
    .sort((a, b) => a.ordem - b.ordem)
    .map((categoria) => ({
      categoria,
      produtos: produtos.filter((p) => p.categoriaId === categoria.id),
    }))
    .filter((secao) => secao.produtos.length > 0);
}

/**
 * Ordena e filtra seções vindas da API garantindo apenas categorias com produtos.
 * Aceita:
 * - `SecaoCardapio[]` (`[{ categoria, produtos }]`)
 * - `{ secoes: SecaoCardapio[] }`
 * - `{ categorias: Categoria[], produtos: Produto[] }`
 * - `Array<Categoria & { produtos: Produto[] }>`
 */
export function normalizarSecoesCardapio(resposta: unknown): SecaoCardapio[] {
  if (!resposta) {
    return [];
  }

  let listaBruta: unknown[] = [];

  if (Array.isArray(resposta)) {
    listaBruta = resposta;
  } else if (typeof resposta === 'object') {
    const obj = resposta as Record<string, unknown>;
    if (Array.isArray(obj['secoes'])) {
      listaBruta = obj['secoes'];
    } else if (Array.isArray(obj['categorias']) && Array.isArray(obj['produtos'])) {
      const categorias = (obj['categorias'] as unknown[])
        .filter((c): c is Record<string, unknown> => Boolean(c) && typeof c === 'object')
        .map((c, idx) => ({
          id: String(c['id'] ?? '').trim(),
          nome: String(c['nome'] ?? '').trim(),
          ordem: typeof c['ordem'] === 'number' ? c['ordem'] : idx + 1,
          ...(typeof c['imagemUrl'] === 'string' && c['imagemUrl'].trim()
            ? { imagemUrl: c['imagemUrl'].trim() }
            : {}),
        }))
        .filter((c) => Boolean(c.id && c.nome));

      const produtos = (obj['produtos'] as unknown[])
        .map((p) => normalizarProduto(p))
        .filter((p): p is Produto => p !== null);

      return montarCardapio(categorias, produtos);
    }
  }

  const secoes: SecaoCardapio[] = [];

  for (let idx = 0; idx < listaBruta.length; idx++) {
    const item = listaBruta[idx];
    if (!item || typeof item !== 'object') {
      continue;
    }
    const reg = item as Record<string, unknown>;

    // Formato 1: { categoria: { id, nome, ordem, ... }, produtos: [...] }
    // Formato 2: { id, nome, ordem, ..., produtos: [...] } (Categoria com @OneToMany produtos)
    const catBruta =
      reg['categoria'] && typeof reg['categoria'] === 'object'
        ? (reg['categoria'] as Record<string, unknown>)
        : reg;

    if (catBruta['ativa'] === false) {
      continue;
    }

    const catId = String(catBruta['id'] ?? '').trim();
    const catNome = String(catBruta['nome'] ?? '').trim();
    if (!catId || !catNome || !Array.isArray(reg['produtos'])) {
      continue;
    }

    const categoria: Categoria = {
      id: catId,
      nome: catNome,
      ordem: typeof catBruta['ordem'] === 'number' ? catBruta['ordem'] : idx + 1,
      ...(typeof catBruta['imagemUrl'] === 'string' && catBruta['imagemUrl'].trim()
        ? { imagemUrl: catBruta['imagemUrl'].trim() }
        : {}),
    };

    const produtos = (reg['produtos'] as unknown[])
      .map((p) => normalizarProduto(p, categoria))
      .filter((p): p is Produto => p !== null);

    if (produtos.length > 0) {
      secoes.push({ categoria, produtos });
    }
  }

  return secoes.sort((a, b) => a.categoria.ordem - b.categoria.ordem);
}

/**
 * Extrai os produtos em destaque disponíveis ordenados por `ordemDestaque`.
 */
export function extrairDestaques(secoes: readonly SecaoCardapio[]): Produto[] {
  const vistos = new Set<string>();
  const todosProdutos: Produto[] = [];

  for (const secao of secoes) {
    for (const produto of secao.produtos) {
      if (!vistos.has(produto.id)) {
        vistos.add(produto.id);
        todosProdutos.push(produto);
      }
    }
  }

  return todosProdutos
    .filter((produto) => Boolean(produto.destaque) && produto.disponivel)
    .sort(
      (a, b) =>
        (a.ordemDestaque ?? Number.MAX_SAFE_INTEGER) -
        (b.ordemDestaque ?? Number.MAX_SAFE_INTEGER)
    );
}

@Injectable({
  providedIn: 'root',
})
export class CardapioService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly lojaService = inject(LojaService);

  private cacheCardapio$?: Observable<SecaoCardapio[]>;

  obterLoja(): Observable<Loja> {
    return this.lojaService.obterLoja();
  }

  listarCardapio(): Observable<SecaoCardapio[]> {
    if (!this.cacheCardapio$) {
      const url = construirUrlApi(this.apiBaseUrl, '/cardapio');
      this.cacheCardapio$ = this.http.get<unknown>(url).pipe(
        map((secoes) => normalizarSecoesCardapio(secoes)),
        catchError((erro: unknown) => {
          this.cacheCardapio$ = undefined;
          return throwError(() => erro);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.cacheCardapio$;
  }

  listarDestaques(): Observable<Produto[]> {
    return this.listarCardapio().pipe(map((secoes) => extrairDestaques(secoes)));
  }

  obterCategorias(): Observable<Categoria[]> {
    return this.listarCardapio().pipe(map((secoes) => secoes.map((s) => s.categoria)));
  }

  obterProdutos(): Observable<Produto[]> {
    return this.listarCardapio().pipe(map((secoes) => secoes.flatMap((s) => s.produtos)));
  }

  invalidarCache(): void {
    this.cacheCardapio$ = undefined;
    this.lojaService.invalidarCache();
  }
}
