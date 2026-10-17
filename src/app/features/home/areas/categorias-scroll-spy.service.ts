import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoriasScrollSpyService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private observer: IntersectionObserver | null = null;
  private bloqueioTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private bloqueadoPorClique = false;

  observarSecoes(
    categoriaIds: readonly string[],
    aoEntrarSecao: (categoriaId: string) => void
  ): void {
    this.desconectarObserver();

    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const elementosMap = new Map<Element, string>();
    for (const id of categoriaIds) {
      const el = this.buscarElementoSecao(id);
      if (el) {
        elementosMap.set(el, id);
      }
    }

    if (elementosMap.size === 0) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.bloqueadoPorClique) {
          return;
        }

        const visiveis = entries.filter((entry) => entry.isIntersecting);
        if (visiveis.length === 0) {
          return;
        }

        visiveis.sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const alvo = visiveis[0]?.target;
        if (!alvo) {
          return;
        }

        const idMapeado =
          elementosMap.get(alvo) ??
          (alvo.id.startsWith('cat-') ? alvo.id.slice(4) : alvo.id);

        if (idMapeado) {
          aoEntrarSecao(idMapeado);
        }
      },
      {
        rootMargin: '-15% 0px -65% 0px',
        threshold: [0, 0.1, 0.5],
      }
    );

    for (const el of elementosMap.keys()) {
      this.observer.observe(el);
    }
  }

  rolarParaSecao(categoriaId: string): void {
    if (!this.isBrowser) {
      return;
    }

    const el = this.buscarElementoSecao(categoriaId);
    if (!el) {
      return;
    }

    const reduzMovimento = this.prefereMovimentoReduzido();
    this.bloquearDuranteRolagem(reduzMovimento ? 50 : 650);

    el.scrollIntoView?.({
      behavior: reduzMovimento ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  bloquearDuranteRolagem(duracaoMs = 650): void {
    this.bloqueadoPorClique = true;
    if (this.bloqueioTimeoutId !== null) {
      clearTimeout(this.bloqueioTimeoutId);
    }
    this.bloqueioTimeoutId = setTimeout(() => {
      this.bloqueadoPorClique = false;
      this.bloqueioTimeoutId = null;
    }, duracaoMs);
  }

  estaBloqueado(): boolean {
    return this.bloqueadoPorClique;
  }

  desconectar(): void {
    this.desconectarObserver();
    if (this.bloqueioTimeoutId !== null) {
      clearTimeout(this.bloqueioTimeoutId);
      this.bloqueioTimeoutId = null;
    }
    this.bloqueadoPorClique = false;
  }

  private desconectarObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private buscarElementoSecao(categoriaId: string): HTMLElement | null {
    const idPrefixado = categoriaId.startsWith('cat-')
      ? `cat-${categoriaId}`
      : `cat-${categoriaId}`;
    return (
      this.document.getElementById(idPrefixado) ??
      this.document.getElementById(categoriaId)
    );
  }

  private prefereMovimentoReduzido(): boolean {
    try {
      return (
        typeof window !== 'undefined' &&
        Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
      );
    } catch {
      return false;
    }
  }
}

