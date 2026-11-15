import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Produto } from '../../../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class ProdutoDetalheService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private elementoOrigem: HTMLElement | null = null;

  readonly produtoAberto = signal<Produto | null>(null);
  readonly aberto = computed(() => this.produtoAberto() !== null);

  abrir(produto: Produto | null | undefined, origem?: HTMLElement | null): void {
    if (!produto || produto.disponivel === false) {
      return;
    }

    if (origem) {
      this.elementoOrigem = origem;
    } else if (this.isBrowser && this.document.activeElement instanceof HTMLElement) {
      this.elementoOrigem = this.document.activeElement;
    } else {
      this.elementoOrigem = null;
    }

    this.produtoAberto.set(produto);
  }

  fechar(): void {
    if (!this.produtoAberto()) {
      return;
    }

    const origem = this.elementoOrigem;
    this.elementoOrigem = null;
    this.produtoAberto.set(null);

    if (this.isBrowser && origem && typeof origem.focus === 'function') {
      origem.focus();
    }
  }
}

