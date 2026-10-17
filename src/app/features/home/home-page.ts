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
  PdpProdutos,
  PdpRodape,
} from './areas';
import { CardapioService } from './data';

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
    PdpProdutos,
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
  readonly categorias = signal<Categoria[]>([]);
  readonly categoriaAtivaId = signal<string | null>(null);
  readonly produtos = signal<Produto[]>([]);
  readonly promocoes = signal<Promocao[]>([]);
  readonly combos = signal<Combo[]>([]);
  readonly ultimoProdutoPedido = signal<Produto | null>(null);

  readonly destaques = computed(() =>
    this.produtos().filter((produto) => produto.destaque && produto.disponivel)
  );

  ngOnInit(): void {
    this.carregarCardapio();
  }

  aoSelecionarCategoria(categoriaId: string): void {
    this.categoriaAtivaId.set(categoriaId);
  }

  aoPedirDestaque(produto: Produto): void {
    this.ultimoProdutoPedido.set(produto);
  }

  carregarCardapio(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.cardapioService
      .carregarCardapio()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dados) => {
          this.loja.set(dados.loja);
          this.categorias.set(dados.categorias);
          if (!this.categoriaAtivaId() && dados.categorias.length > 0) {
            this.categoriaAtivaId.set(dados.categorias[0].id);
          }
          this.produtos.set(dados.produtos);
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

