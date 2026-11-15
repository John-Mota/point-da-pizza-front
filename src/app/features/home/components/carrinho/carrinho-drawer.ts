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
  untracked,
  viewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { PdpPhoneMask } from '../../../../shared/directives';
import { DadosFinalizacaoPedido, Pedido, TipoEntrega } from '../../../../shared/models';
import { PdpCurrencyPipe } from '../../../../shared/pipes';
import { PdpEmptyStateCard, PdpQuantityStepper } from '../../../../shared/ui';
import { CarrinhoService } from './carrinho.service';

export type EtapaCarrinhoDrawer = 'sacola' | 'checkout' | 'concluido';

const FORMAS_PAGAMENTO_PADRAO: readonly string[] = [
  'Pix',
  'Cartão de crédito',
  'Cartão de débito',
  'Dinheiro',
];

@Component({
  selector: 'pdp-carrinho-drawer',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
    InputTextModule,
    PdpPhoneMask,
    PdpCurrencyPipe,
    PdpQuantityStepper,
    PdpEmptyStateCard,
  ],
  templateUrl: './carrinho-drawer.html',
  styleUrl: './carrinho-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpCarrinhoDrawer {
  protected readonly carrinhoService = inject(CarrinhoService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly formasPagamento = input<readonly string[]>([]);
  readonly pedidoFinalizado = output<Pedido>();

  readonly etapa = signal<EtapaCarrinhoDrawer>('sacola');
  readonly clienteNome = signal<string>('');
  readonly clienteTelefone = signal<string>('');
  readonly tipoEntrega = signal<TipoEntrega>('entrega');
  readonly endereco = signal<string>('');
  readonly complemento = signal<string>('');
  readonly formaPagamento = signal<string>('Pix');
  readonly trocoPara = signal<string>('');
  readonly erroValidacao = signal<string | null>(null);
  readonly ultimoPedido = signal<Pedido | null>(null);

  private readonly tituloRef = viewChild<ElementRef<HTMLElement>>('tituloEl');

  private bodyOverflowAnterior = '';
  private scrollTravado = false;

  readonly formasPagamentoEfetivas = computed<readonly string[]>(() => {
    const lista = this.formasPagamento();
    return lista.length > 0 ? lista : FORMAS_PAGAMENTO_PADRAO;
  });

  constructor() {
    effect(() => {
      const aberto = this.carrinhoService.aberto();
      untracked(() => {
        if (aberto) {
          this.etapa.set('sacola');
          this.erroValidacao.set(null);
          const primeiraForma = this.formasPagamentoEfetivas()[0] ?? 'Pix';
          if (!this.formaPagamento()) {
            this.formaPagamento.set(primeiraForma);
          }
          this.travarScrollBody();
          queueMicrotask(() => {
            this.tituloRef()?.nativeElement.focus?.();
          });
        } else {
          this.destravarScrollBody();
        }
      });
    });

    this.destroyRef.onDestroy(() => {
      this.destravarScrollBody();
    });
  }

  alterarQuantidade(itemId: string, novaQtd: number): void {
    this.carrinhoService.alterarQuantidade(itemId, novaQtd);
  }

  removerItem(itemId: string): void {
    this.carrinhoService.remover(itemId);
  }

  limparSacola(): void {
    this.carrinhoService.limpar();
  }

  irParaCheckout(): void {
    if (this.carrinhoService.vazio()) {
      return;
    }
    this.erroValidacao.set(null);
    this.etapa.set('checkout');
  }

  voltarParaSacola(): void {
    this.erroValidacao.set(null);
    this.etapa.set('sacola');
  }

  selecionarTipoEntrega(tipo: TipoEntrega): void {
    this.tipoEntrega.set(tipo);
    this.erroValidacao.set(null);
  }

  selecionarFormaPagamento(forma: string): void {
    this.formaPagamento.set(forma);
    this.erroValidacao.set(null);
  }

  aoDigitarCampo(
    sinal: typeof this.clienteNome,
    event: Event
  ): void {
    const alvo = event.target as HTMLInputElement | null;
    sinal.set(alvo?.value ?? '');
    if (this.erroValidacao()) {
      this.erroValidacao.set(null);
    }
  }

  confirmarPedido(): void {
    if (this.carrinhoService.vazio()) {
      return;
    }

    const nome = this.clienteNome().trim();
    if (nome.length < 2) {
      this.erroValidacao.set('Informe seu nome para identificar o pedido.');
      return;
    }

    const digitosTel = this.clienteTelefone().replace(/\D/g, '');
    if (digitosTel.length < 10) {
      this.erroValidacao.set('Informe um telefone com DDD válido.');
      return;
    }

    if (this.tipoEntrega() === 'entrega' && this.endereco().trim().length < 5) {
      this.erroValidacao.set('Informe o endereço completo para entrega.');
      return;
    }

    const valorTrocoNum = Number(this.trocoPara().replace(',', '.'));
    const dados: DadosFinalizacaoPedido = {
      clienteNome: nome,
      clienteTelefone: this.clienteTelefone().trim(),
      tipoEntrega: this.tipoEntrega(),
      endereco: this.tipoEntrega() === 'entrega' ? this.endereco().trim() : undefined,
      complemento:
        this.tipoEntrega() === 'entrega' && this.complemento().trim()
          ? this.complemento().trim()
          : undefined,
      formaPagamento: this.formaPagamento(),
      trocoPara:
        this.formaPagamento() === 'Dinheiro' && Number.isFinite(valorTrocoNum) && valorTrocoNum > 0
          ? valorTrocoNum
          : undefined,
    };

    const { pedido, whatsappUrl } = this.carrinhoService.finalizarPedido(dados);
    this.ultimoPedido.set(pedido);
    this.etapa.set('concluido');
    this.pedidoFinalizado.emit(pedido);

    if (this.isBrowser && whatsappUrl) {
      this.document.defaultView?.open?.(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  }

  aoTeclarDialog(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.fechar();
    }
  }

  fechar(): void {
    this.carrinhoService.fechar();
  }

  private travarScrollBody(): void {
    if (!this.isBrowser || this.scrollTravado) {
      return;
    }
    const body = this.document.body;
    if (body) {
      this.bodyOverflowAnterior = body.style.overflow;
      body.style.overflow = 'hidden';
      this.scrollTravado = true;
    }
  }

  private destravarScrollBody(): void {
    if (!this.isBrowser || !this.scrollTravado) {
      return;
    }
    const body = this.document.body;
    if (body) {
      body.style.overflow = this.bodyOverflowAnterior;
    }
    this.scrollTravado = false;
  }
}
