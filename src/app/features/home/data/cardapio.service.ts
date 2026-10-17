import { Injectable } from '@angular/core';
import { delay, forkJoin, Observable, of } from 'rxjs';
import { Categoria, Combo, Loja, Produto, Promocao } from '../../../shared/models';
import {
  CATEGORIAS_MOCK,
  COMBOS_MOCK,
  LOJA_MOCK,
  PRODUTOS_MOCK,
  PROMOCOES_MOCK,
} from './cardapio.mock';

export interface CardapioDados {
  loja: Loja;
  categorias: Categoria[];
  produtos: Produto[];
  promocoes: Promocao[];
  combos: Combo[];
}

@Injectable({
  providedIn: 'root',
})
export class CardapioService {
  private readonly delayMs = 120;

  obterLoja(): Observable<Loja> {
    return of(LOJA_MOCK).pipe(delay(this.delayMs));
  }

  obterCategorias(): Observable<Categoria[]> {
    const ordenadas = [...CATEGORIAS_MOCK].sort((a, b) => a.ordem - b.ordem);
    return of(ordenadas).pipe(delay(this.delayMs));
  }

  obterProdutos(): Observable<Produto[]> {
    return of(PRODUTOS_MOCK).pipe(delay(this.delayMs));
  }

  obterPromocoes(): Observable<Promocao[]> {
    return of(PROMOCOES_MOCK).pipe(delay(this.delayMs));
  }

  obterCombos(): Observable<Combo[]> {
    return of(COMBOS_MOCK).pipe(delay(this.delayMs));
  }

  carregarCardapio(): Observable<CardapioDados> {
    return forkJoin({
      loja: this.obterLoja(),
      categorias: this.obterCategorias(),
      produtos: this.obterProdutos(),
      promocoes: this.obterPromocoes(),
      combos: this.obterCombos(),
    });
  }
}

