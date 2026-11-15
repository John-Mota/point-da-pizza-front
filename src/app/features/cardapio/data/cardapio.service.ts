import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { API_BASE_URL, construirUrlApi } from '../../../core/api';
import { Categoria, Loja, Produto, SecaoCardapio } from '../../../shared/models';
import { LojaService } from './loja.service';

export type { SecaoCardapio } from '../../../shared/models';

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
 */
export function normalizarSecoesCardapio(secoes: readonly SecaoCardapio[]): SecaoCardapio[] {
  return [...(secoes ?? [])]
    .filter((secao) => Boolean(secao?.categoria) && Array.isArray(secao?.produtos))
    .map((secao) => ({
      categoria: secao.categoria,
      produtos: secao.produtos,
    }))
    .filter((secao) => secao.produtos.length > 0)
    .sort((a, b) => a.categoria.ordem - b.categoria.ordem);
}

/**
 * Extrai os produtos em destaque disponíveis ordenados por `ordemDestaque`.
 */
export function extrairDestaques(secoes: readonly SecaoCardapio[]): Produto[] {
  const todosProdutos = secoes.flatMap((secao) => secao.produtos);
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
      this.cacheCardapio$ = this.http.get<SecaoCardapio[]>(url).pipe(
        map((secoes) => normalizarSecoesCardapio(secoes)),
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
