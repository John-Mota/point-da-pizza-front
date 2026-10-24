import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TextareaModule } from 'primeng/textarea';
import { BordaProdutoOpcao, ItemConfigurado, Produto } from '../../../../shared/models';
import { PdpCurrencyPipe } from '../../../../shared/pipes';
import { PdpQuantityStepper } from '../../../../shared/ui';
import { ProdutoDetalheService } from './produto-detalhe.service';

export const SEM_BORDA_ID = 'sem-borda';
export const MAX_OBSERVACAO_CHARS = 200;

@Component({
  selector: 'pdp-produto-detalhe',
  standalone: true,
  imports: [ButtonModule, RippleModule, TextareaModule, PdpQuantityStepper, PdpCurrencyPipe],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpProdutoDetalhe {
  private readonly detalheService = inject(ProdutoDetalheService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Permite passar um produto por input ou usar o ProdutoDetalheService. */
  readonly produto = input<Produto | null>(null);
  readonly adicionar = output<ItemConfigurado>();
  readonly fechado = output<void>();

  protected readonly maxObservacao = MAX_OBSERVACAO_CHARS;

  readonly produtoEfetivo = computed<Produto | null>(
    () => this.produto() ?? this.detalheService.produtoAberto()
  );

  readonly tamanhoSelecionadoId = signal<string | null>(null);
  readonly bordaSelecionadaId = signal<string>(SEM_BORDA_ID);
  readonly observacao = signal<string>('');
  readonly quantidade = signal<number>(1);
  readonly erroTamanho = signal<boolean>(false);
  readonly imagemFalhou = signal<boolean>(false);

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>('dialogEl');
  private readonly tituloRef = viewChild<ElementRef<HTMLElement>>('tituloEl');
  private readonly grupoTamanhoRef = viewChild<ElementRef<HTMLElement>>('grupoTamanhoEl');
  private readonly radioTamanhoRefs = viewChildren<ElementRef<HTMLButtonElement>>('radioTamanhoBtn');
  private readonly radioBordaRefs = viewChildren<ElementRef<HTMLButtonElement>>('radioBordaBtn');

  private bodyOverflowAnterior = '';
  private bodyPaddingRightAnterior = '';
  private scrollTravado = false;

  readonly mostrarImagem = computed(
    () => Boolean(this.produtoEfetivo()?.imagemUrl) && !this.imagemFalhou()
  );

  readonly temTamanhos = computed(() => (this.produtoEfetivo()?.tamanhos?.length ?? 0) > 0);
  readonly temBordas = computed(() => (this.produtoEfetivo()?.bordas?.length ?? 0) > 0);

  readonly opcoesBorda = computed<BordaProdutoOpcao[]>(() => {
    const bordas = this.produtoEfetivo()?.bordas ?? [];
    if (bordas.length === 0) {
      return [];
    }
    return [{ id: SEM_BORDA_ID, nome: 'Sem borda', acrescimo: 0 }, ...bordas];
  });

  readonly precoBase = computed<number>(() => {
    const prod = this.produtoEfetivo();
    if (!prod) {
      return 0;
    }
    if (this.temTamanhos()) {
      const escolhido = prod.tamanhos?.find((t) => t.id === this.tamanhoSelecionadoId());
      return escolhido ? escolhido.preco : prod.preco;
    }
    return prod.preco;
  });

  readonly acrescimoBorda = computed<number>(() => {
    if (!this.temBordas()) {
      return 0;
    }
    const borda = this.opcoesBorda().find((b) => b.id === this.bordaSelecionadaId());
    return borda?.acrescimo ?? 0;
  });

  readonly precoUnitario = computed<number>(() =>
    Number((this.precoBase() + this.acrescimoBorda()).toFixed(2))
  );

  readonly total = computed<number>(() =>
    Number((this.precoUnitario() * this.quantidade()).toFixed(2))
  );

  constructor() {
    effect(() => {
      const atual = this.produtoEfetivo();
      if (atual) {
        this.tamanhoSelecionadoId.set(null);
        this.bordaSelecionadaId.set(SEM_BORDA_ID);
        this.observacao.set('');
        this.quantidade.set(1);
        this.erroTamanho.set(false);
        this.imagemFalhou.set(false);
        this.travarScrollBody();

        queueMicrotask(() => {
          this.tituloRef()?.nativeElement.focus?.();
        });
      } else {
        this.destravarScrollBody();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.destravarScrollBody();
    });
  }

  aoErroImagem(): void {
    this.imagemFalhou.set(true);
  }

  selecionarTamanho(id: string): void {
    this.tamanhoSelecionadoId.set(id);
    if (this.erroTamanho()) {
      this.erroTamanho.set(false);
    }
  }

  selecionarBorda(id: string): void {
    this.bordaSelecionadaId.set(id);
  }

  aoDigitarObservacao(event: Event): void {
    const alvo = event.target as HTMLTextAreaElement | null;
    const valor = (alvo?.value ?? '').slice(0, MAX_OBSERVACAO_CHARS);
    if (alvo && alvo.value !== valor) {
      alvo.value = valor;
    }
    this.observacao.set(valor);
  }

  aoTeclarGrupoTamanho(event: KeyboardEvent, indexAtual: number): void {
    const opcoes = this.produtoEfetivo()?.tamanhos ?? [];
    if (opcoes.length === 0) {
      return;
    }
    const proximoIdx = this.calcularProximoIndiceRadio(event.key, indexAtual, opcoes.length);
    if (proximoIdx === null) {
      return;
    }
    event.preventDefault();
    this.selecionarTamanho(opcoes[proximoIdx].id);
    this.radioTamanhoRefs()[proximoIdx]?.nativeElement.focus();
  }

  aoTeclarGrupoBorda(event: KeyboardEvent, indexAtual: number): void {
    const opcoes = this.opcoesBorda();
    if (opcoes.length === 0) {
      return;
    }
    const proximoIdx = this.calcularProximoIndiceRadio(event.key, indexAtual, opcoes.length);
    if (proximoIdx === null) {
      return;
    }
    event.preventDefault();
    this.selecionarBorda(opcoes[proximoIdx].id);
    this.radioBordaRefs()[proximoIdx]?.nativeElement.focus();
  }

  aoTeclarDialog(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.fechar();
      return;
    }

    if (event.key === 'Tab') {
      this.manterFocoNoDialog(event);
    }
  }

  aoConfirmar(): void {
    const prod = this.produtoEfetivo();
    if (!prod) {
      return;
    }

    if (this.temTamanhos() && !this.tamanhoSelecionadoId()) {
      this.erroTamanho.set(true);
      const grupoEl = this.grupoTamanhoRef()?.nativeElement;
      grupoEl?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
      });
      const primeiroRadio = this.radioTamanhoRefs()[0]?.nativeElement;
      primeiroRadio?.focus?.();
      return;
    }

    const bordaEscolhida =
      this.temBordas() && this.bordaSelecionadaId() !== SEM_BORDA_ID
        ? this.bordaSelecionadaId()
        : undefined;
    const obsTexto = this.observacao().trim();

    const item: ItemConfigurado = {
      produto: prod,
      tamanhoId: this.temTamanhos() ? (this.tamanhoSelecionadoId() ?? undefined) : undefined,
      bordaId: bordaEscolhida,
      observacao: obsTexto ? obsTexto : undefined,
      quantidade: this.quantidade(),
      precoUnitario: this.precoUnitario(),
      total: this.total(),
    };

    this.adicionar.emit(item);
    this.fechar();
  }

  fechar(): void {
    this.detalheService.fechar();
    this.fechado.emit();
  }

  private calcularProximoIndiceRadio(
    key: string,
    indexAtual: number,
    total: number
  ): number | null {
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      return (indexAtual + 1) % total;
    }
    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      return (indexAtual - 1 + total) % total;
    }
    return null;
  }

  private manterFocoNoDialog(event: KeyboardEvent): void {
    const container = this.dialogRef()?.nativeElement;
    if (!container || !this.isBrowser) {
      return;
    }

    const focaveis = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focaveis.length === 0) {
      return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const ativo = this.document.activeElement as HTMLElement | null;

    if (event.shiftKey && (ativo === primeiro || ativo === container || !container.contains(ativo))) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && ativo === ultimo) {
      event.preventDefault();
      primeiro.focus();
    }
  }

  private travarScrollBody(): void {
    if (!this.isBrowser || this.scrollTravado) {
      return;
    }
    const body = this.document.body;
    const docEl = this.document.documentElement;
    if (!body) {
      return;
    }

    this.bodyOverflowAnterior = body.style.overflow;
    this.bodyPaddingRightAnterior = body.style.paddingRight;

    const larguraScrollbar =
      (this.document.defaultView?.innerWidth ?? 0) - (docEl?.clientWidth ?? 0);
    if (larguraScrollbar > 0) {
      body.style.paddingRight = `${larguraScrollbar}px`;
    }
    body.style.overflow = 'hidden';
    this.scrollTravado = true;
  }

  private destravarScrollBody(): void {
    if (!this.isBrowser || !this.scrollTravado) {
      return;
    }
    const body = this.document.body;
    if (body) {
      body.style.overflow = this.bodyOverflowAnterior;
      body.style.paddingRight = this.bodyPaddingRightAnterior;
    }
    this.scrollTravado = false;
  }
}

