import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Categoria, Combo, Loja, Produto, Promocao } from '../../shared/models';
import { PdpCard } from '../../shared/ui/cards';
import {
  PdpCategoriasNav,
  PdpDestaquesSection,
  PdpLojaHeader,
  PdpRodape,
} from './areas';
import { PdpProdutosLista } from './components';
import { CardapioService, SecaoCardapio } from './data';

/** Pílula fixa que aponta para a seção Destaque (id "cat-destaque"). */
export const CATEGORIA_DESTAQUE: Categoria = { id: 'destaque', nome: 'Destaque', ordem: 0 };

@Component({
  selector: 'pdp-home-page',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
    PdpCard,
    PdpLojaHeader,
    PdpCategoriasNav,
    PdpDestaquesSection,
    PdpProdutosLista,
    PdpRodape,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpHomePage implements OnInit {
  private readonly cardapioService = inject(CardapioService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal<boolean>(true);
  readonly erro = signal<string | null>(null);

  readonly loja = signal<Loja | null>(null);
  readonly cardapio = signal<SecaoCardapio[]>([]);
  readonly categoriaAtivaId = signal<string | null>(null);
  readonly produtos = signal<Produto[]>([]);
  readonly promocoes = signal<Promocao[]>([]);
  readonly combos = signal<Combo[]>([]);
  readonly ultimoProdutoPedido = signal<Produto | null>(null);

  readonly destaques = computed(() =>
    this.produtos().filter((produto) => produto.destaque && produto.disponivel)
  );

  /** Pílulas da barra: Destaque (se houver) + exatamente as categorias da lista. */
  readonly categorias = computed<Categoria[]>(() => [
    ...(this.destaques().length > 0 ? [CATEGORIA_DESTAQUE] : []),
    ...this.cardapio().map((secao) => secao.categoria),
  ]);

  ngOnInit(): void {
    this.carregarCardapio();
  }

  aoSelecionarCategoria(categoriaId: string): void {
    this.categoriaAtivaId.set(categoriaId);
  }

  aoPedirDestaque(produto: Produto): void {
    this.ultimoProdutoPedido.set(produto);
  }

  /** Abrirá o detalhe do produto na etapa 6. Intencionalmente vazio por enquanto. */
  aoPedirProduto(_produto: Produto): void {}

  carregarCardapio(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.cardapioService
      .carregarCardapio()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dados) => {
          this.loja.set(dados.loja);
          this.produtos.set(dados.produtos);
          this.cardapio.set(dados.cardapio);
          const primeira = this.categorias()[0];
          if (!this.categoriaAtivaId() && primeira) {
            this.categoriaAtivaId.set(primeira.id);
          }
          this.promocoes.set(dados.promocoes);
          this.combos.set(dados.combos);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.erro.set(
            'Não foi possível carregar o cardápio agora. Verifique sua conexão e tente novamente.'
          );
        },
      });
  }
}

