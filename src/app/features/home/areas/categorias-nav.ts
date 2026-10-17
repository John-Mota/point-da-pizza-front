import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { Categoria } from '../../../shared/models';
import { obterIconeCategoria } from './categorias-icons.map';
import { CategoriasScrollSpyService } from './categorias-scroll-spy.service';

@Component({
  selector: 'pdp-categorias-nav',
  standalone: true,
  imports: [ButtonModule, RippleModule, SkeletonModule],
  templateUrl: './categorias-nav.html',
  styleUrl: './categorias-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpCategoriasNav implements OnInit {
  readonly categorias = input<Categoria[]>([]);
  readonly carregando = input<boolean>(false);
  readonly ativaId = model<string | null>(null);
  readonly selecionar = output<string>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollSpyService = inject(CategoriasScrollSpyService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly skeletonItems = [1, 2, 3, 4, 5] as const;

  readonly estaGrudada = signal<boolean>(false);
  readonly podeRolarEsquerda = signal<boolean>(false);
  readonly podeRolarDireita = signal<boolean>(false);

  private readonly listaRef = viewChild<ElementRef<HTMLUListElement>>('listaEl');
  private readonly pillRefs = viewChildren<ElementRef<HTMLButtonElement>>('pillBtn');

  readonly idAtivoEfetivo = computed<string | null>(() => {
    const explicito = this.ativaId();
    if (explicito) {
      return explicito;
    }
    return this.categorias()[0]?.id ?? null;
  });

  constructor() {
    effect(() => {
      const lista = this.categorias();
      const ids = lista.map((c) => c.id);

      if (ids.length > 0 && !this.ativaId()) {
        this.ativaId.set(ids[0]);
      }

      this.configurarScrollSpy(ids);
      queueMicrotask(() => this.atualizarBordasScroll());
    });

    effect(() => {
      const ativo = this.idAtivoEfetivo();
      if (ativo) {
        this.centralizarPilulaPorId(ativo);
      }
    });
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.scrollSpyService.desconectar();
    });

    if (this.isBrowser && typeof window !== 'undefined') {
      const onWindowScroll = () => this.verificarSticky();
      const onWindowResize = () => this.atualizarBordasScroll();

      window.addEventListener('scroll', onWindowScroll, { passive: true });
      window.addEventListener('resize', onWindowResize, { passive: true });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onWindowScroll);
        window.removeEventListener('resize', onWindowResize);
      });
    }
  }

  obterIcone(categoria: Categoria): string {
    return obterIconeCategoria(categoria);
  }

  aoClicarCategoria(id: string, index: number): void {
    this.ativaId.set(id);
    this.selecionar.emit(id);
    this.centralizarPilulaPorIndice(index);
    this.scrollSpyService.rolarParaSecao(id);
  }

  aoPressionarTecla(event: KeyboardEvent, indexAtual: number): void {
    const botoes = this.pillRefs();
    const total = botoes.length;
    if (total === 0) {
      return;
    }

    let proximoIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
        proximoIndex = (indexAtual + 1) % total;
        break;
      case 'ArrowLeft':
        proximoIndex = (indexAtual - 1 + total) % total;
        break;
      case 'Home':
        proximoIndex = 0;
        break;
      case 'End':
        proximoIndex = total - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const alvo = botoes[proximoIndex]?.nativeElement;
    if (alvo) {
      alvo.focus();
      alvo.scrollIntoView?.({
        behavior: this.prefereMovimentoReduzido() ? 'auto' : 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }

  atualizarBordasScroll(): void {
    const ul = this.listaRef()?.nativeElement;
    if (!ul) {
      this.podeRolarEsquerda.set(false);
      this.podeRolarDireita.set(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = ul;
    const maxScroll = scrollWidth - clientWidth;
    this.podeRolarEsquerda.set(scrollLeft > 4);
    this.podeRolarDireita.set(maxScroll - scrollLeft > 4);
  }

  configurarScrollSpy(ids: readonly string[] = this.categorias().map((c) => c.id)): void {
    this.scrollSpyService.observarSecoes(ids, (idVisivel) => {
      if (this.ativaId() !== idVisivel) {
        this.ativaId.set(idVisivel);
      }
    });
  }

  private verificarSticky(): void {
    if (!this.isBrowser) {
      return;
    }
    const rect = this.hostEl.nativeElement.getBoundingClientRect();
    this.estaGrudada.set(rect.top <= 4 && window.scrollY > 16);
  }

  private centralizarPilulaPorId(id: string): void {
    const idx = this.categorias().findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.centralizarPilulaPorIndice(idx);
    }
  }

  private centralizarPilulaPorIndice(index: number): void {
    if (!this.isBrowser) {
      return;
    }
    const botao = this.pillRefs()[index]?.nativeElement;
    botao?.scrollIntoView?.({
      behavior: this.prefereMovimentoReduzido() ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
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
