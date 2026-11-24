import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable()
export class DestaquesAutoplayService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private visibilityListener: (() => void) | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.limparTudo();
    });
  }

  ehNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  prefereMovimentoReduzido(): boolean {
    if (!this.ehNavegador() || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  iniciar(intervaloMs: number, callback: () => void): void {
    this.parar();
    if (!this.ehNavegador()) {
      return;
    }
    this.timerId = setInterval(() => {
      callback();
    }, intervaloMs);
  }

  parar(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  estaAtivo(): boolean {
    return this.timerId !== null;
  }

  observarVisibilidadeAba(aoMudarVisibilidade: (oculta: boolean) => void): void {
    this.removerObservadorVisibilidade();
    if (!this.ehNavegador() || !this.document) {
      return;
    }

    const handler = (): void => {
      aoMudarVisibilidade(this.document.visibilityState === 'hidden');
    };

    this.visibilityListener = handler;
    this.document.addEventListener('visibilitychange', handler);
  }

  private removerObservadorVisibilidade(): void {
    if (this.visibilityListener && this.document) {
      this.document.removeEventListener('visibilitychange', this.visibilityListener);
      this.visibilityListener = null;
    }
  }

  limparTudo(): void {
    this.parar();
    this.removerObservadorVisibilidade();
  }
}

