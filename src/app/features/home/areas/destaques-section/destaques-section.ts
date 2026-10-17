import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Combo, Produto, Promocao } from '../../../../shared/models';
import { PdpDestaqueCard } from '../destaque-card';
import { DestaquesAutoplayService } from './destaques-autoplay.service';

/** Intervalo de passagem automática do carrossel em milissegundos (5 segundos). */
export const AUTOPLAY_INTERVAL_MS = 5000;

/** Escala visual dos cards laterais (anterior e próximo). */
export const SIDE_CARD_SCALE = 0.82;

/** Opacidade visual dos cards laterais (anterior e próximo). */
export const SIDE_CARD_OPACITY = 0.6;

/** Distância mínima em pixels para considerar deslize (swipe) no ponteiro/toque. */
export const SWIPE_THRESHOLD_PX = 40;

/** Duração da transição suave entre slides em milissegundos. */
export const TRANSITION_DURATION_MS = 500;

export type PosicaoSlideDestaque =
  | 'center'
  | 'prev'
  | 'next'
  | 'hidden-left'
  | 'hidden-right'
  | 'static';

export interface SlideDestaque {
  produto: Produto;
  indice: number;
  offset: -2 | -1 | 0 | 1 | 2;
  posicao: PosicaoSlideDestaque;
  ativo: boolean;
}

@Component({
  selector: 'pdp-destaques-section, pdp-promocoes',
  standalone: true,
  imports: [ButtonModule, RippleModule, PdpDestaqueCard],
  providers: [DestaquesAutoplayService],
  templateUrl: './destaques-section.html',
  styleUrl: './destaques-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--pdp-side-scale]': 'escalaLateral',
    '[style.--pdp-side-opacity]': 'opacidadeLateral',
    '[style.--pdp-transition-ms]': 'duracaoTransicaoMs + "ms"',
  },
})
export class PdpDestaquesSection {
  private readonly autoplayService = inject(DestaquesAutoplayService);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly destaques = input<Produto[]>([]);
  readonly promocoes = input<Promocao[]>([]);
  readonly combos = input<Combo[]>([]);

  readonly pedir = output<Produto>();

  readonly escalaLateral = SIDE_CARD_SCALE;
  readonly opacidadeLateral = SIDE_CARD_OPACITY;
  readonly duracaoTransicaoMs = TRANSITION_DURATION_MS;

  readonly indiceAtivo = signal<number>(0);
  readonly pausadoManualmente = signal<boolean>(false);
  readonly mouseSobre = signal<boolean>(false);
  readonly focoDentro = signal<boolean>(false);
  readonly arrastando = signal<boolean>(false);
  readonly abaOculta = signal<boolean>(false);
  readonly modoAriaLive = signal<'off' | 'polite'>('off');

  private pointerStartX: number | null = null;
  private pointerSwiped = false;

  readonly totalItens = computed(() => this.destaques().length);
  readonly ehCarrossel = computed(() => this.totalItens() >= 3);

  readonly autoplayPausado = computed(
    () =>
      !this.ehCarrossel() ||
      this.pausadoManualmente() ||
      this.mouseSobre() ||
      this.focoDentro() ||
      this.arrastando() ||
      this.abaOculta()
  );

  readonly slides = computed<SlideDestaque[]>(() => {
    const lista = this.destaques();
    const total = lista.length;
    if (total === 0) {
      return [];
    }

    if (total < 3) {
      return lista.map((produto, indice) => ({
        produto,
        indice,
        offset: 0,
        posicao: 'static',
        ativo: true,
      }));
    }

    const ativo = ((this.indiceAtivo() % total) + total) % total;

    return lista.map((produto, indice) => {
      const diff = (indice - ativo + total) % total;
      if (diff === 0) {
        return { produto, indice, offset: 0, posicao: 'center', ativo: true };
      }
      if (diff === 1) {
        return { produto, indice, offset: 1, posicao: 'next', ativo: false };
      }
      if (diff === total - 1) {
        return { produto, indice, offset: -1, posicao: 'prev', ativo: false };
      }
      if (diff <= total / 2) {
        return { produto, indice, offset: 2, posicao: 'hidden-right', ativo: false };
      }
      return { produto, indice, offset: -2, posicao: 'hidden-left', ativo: false };
    });
  });

  constructor() {
    if (this.autoplayService.prefereMovimentoReduzido()) {
      this.pausadoManualmente.set(true);
    }

    this.autoplayService.observarVisibilidadeAba((oculta) => {
      this.abaOculta.set(oculta);
    });

    effect(() => {
      const total = this.totalItens();
      if (total > 0 && this.indiceAtivo() >= total) {
        this.indiceAtivo.set(0);
      }
    });

    effect(() => {
      if (this.ehCarrossel() && !this.autoplayPausado()) {
        this.autoplayService.iniciar(AUTOPLAY_INTERVAL_MS, () => {
          this.avancarAutomatico();
        });
      } else {
        this.autoplayService.parar();
      }
    });
  }

  proximo(manual = true): void {
    this.irPara(this.indiceAtivo() + 1, manual);
  }

  anterior(manual = true): void {
    this.irPara(this.indiceAtivo() - 1, manual);
  }

  irPara(indice: number, manual = true): void {
    const total = this.totalItens();
    if (total < 3) {
      return;
    }

    const normalizado = ((indice % total) + total) % total;
    this.modoAriaLive.set(manual ? 'polite' : 'off');
    this.indiceAtivo.set(normalizado);

    if (manual && !this.autoplayPausado()) {
      this.autoplayService.iniciar(AUTOPLAY_INTERVAL_MS, () => {
        this.avancarAutomatico();
      });
    }
  }

  alternarPausaManual(): void {
    this.pausadoManualmente.update((atual) => !atual);
  }

  aoEntrarMouse(): void {
    this.mouseSobre.set(true);
  }

  aoSairMouse(): void {
    this.mouseSobre.set(false);
  }

  aoReceberFoco(): void {
    this.focoDentro.set(true);
  }

  aoPerderFoco(event: FocusEvent): void {
    const proximoAlvo = event.relatedTarget as Node | null;
    const raiz = this.hostRef.nativeElement;
    if (proximoAlvo && raiz.contains(proximoAlvo)) {
      return;
    }
    this.focoDentro.set(false);
  }

  aoPressionarTecla(event: KeyboardEvent): void {
    if (!this.ehCarrossel()) {
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.proximo(true);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.anterior(true);
    }
  }

  aoIniciarToque(event: PointerEvent): void {
    if (!this.ehCarrossel()) {
      return;
    }
    const alvo = event.target as HTMLElement | null;
    if (alvo?.closest('button')) {
      return;
    }
    this.pointerStartX = event.clientX;
    this.pointerSwiped = false;
    this.arrastando.set(true);
  }

  aoFinalizarToque(event: PointerEvent): void {
    if (!this.arrastando() || this.pointerStartX === null) {
      return;
    }
    const deltaX = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    this.arrastando.set(false);

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
      this.pointerSwiped = true;
      if (deltaX < 0) {
        this.proximo(true);
      } else {
        this.anterior(true);
      }
    }
  }

  aoCancelarToque(): void {
    this.pointerStartX = null;
    this.arrastando.set(false);
  }

  aoClicarSlide(indice: number, event: MouseEvent): void {
    if (this.pointerSwiped) {
      this.pointerSwiped = false;
      return;
    }
    const alvo = event.target as HTMLElement | null;
    if (alvo?.closest('.pdp-destaque-card__cta')) {
      return;
    }
    if (this.ehCarrossel() && indice !== this.indiceAtivo()) {
      this.irPara(indice, true);
    }
  }

  aoPedirProduto(produto: Produto): void {
    this.pedir.emit(produto);
  }

  private avancarAutomatico(): void {
    this.irPara(this.indiceAtivo() + 1, false);
  }
}

export { PdpDestaquesSection as PdpPromocoes };

