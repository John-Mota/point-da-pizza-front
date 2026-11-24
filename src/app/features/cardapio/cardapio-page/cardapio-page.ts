import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { catchError, forkJoin, of } from 'rxjs';
import { isApiError } from '../../../core/api';
import { AuthService } from '../../../core/auth';
import { Categoria, ItemConfigurado, Loja, Produto, SecaoCardapio } from '../../../shared/models';
import { PdpCard } from '../../../shared/ui/cards';
import { CarrinhoService, PdpCarrinhoBarra, PdpCarrinhoDrawer } from '../../carrinho';
import { PdpCategoriasNav } from '../components/categorias-nav/categorias-nav';
import { PdpDestaquesSection } from '../components/destaques-section/destaques-section';
import { PdpLojaTopo } from '../components/loja-topo/loja-topo';
import { PdpProdutoDetalhe } from '../components/produto-detalhe/produto-detalhe';
import { ProdutoDetalheService } from '../components/produto-detalhe/produto-detalhe.service';
import { PdpProdutosLista } from '../components/produtos-lista/produtos-lista';
import { PdpRodape } from '../components/rodape/rodape';
import { CardapioService, extrairDestaques } from '../data/cardapio.service';
import { LojaService } from '../data/loja.service';

/** Pílula fixa que aponta para a seção Destaque (id "cat-destaque"). */
export const CATEGORIA_DESTAQUE: Categoria = { id: 'destaque', nome: 'Destaque', ordem: 0 };

@Component({
  selector: 'pdp-cardapio-page',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
    PdpCard,
    PdpLojaTopo,
    PdpCategoriasNav,
    PdpDestaquesSection,
    PdpProdutosLista,
    PdpProdutoDetalhe,
    PdpCarrinhoBarra,
    PdpCarrinhoDrawer,
    PdpRodape,
  ],
  templateUrl: './cardapio-page.html',
  styleUrl: './cardapio-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpCardapioPage implements OnInit {
  private readonly cardapioService = inject(CardapioService);
  private readonly lojaService = inject(LojaService);
  private readonly produtoDetalheService = inject(ProdutoDetalheService);
  protected readonly carrinhoService = inject(CarrinhoService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly carregando = signal<boolean>(true);
  readonly erro = signal<string | null>(null);
  readonly erroLoja = signal<string | null>(null);

  readonly loja = signal<Loja | null>(null);
  readonly cardapio = signal<SecaoCardapio[]>([]);
  readonly categoriaAtivaId = signal<string | null>(null);
  readonly ultimoProdutoPedido = signal<Produto | null>(null);

  readonly produtos = computed<Produto[]>(() =>
    this.cardapio().flatMap((secao) => secao.produtos)
  );

  readonly destaques = computed<Produto[]>(() => extrairDestaques(this.cardapio()));

  /** Pílulas da barra: Destaque (se houver) + exatamente as categorias da lista. */
  readonly categorias = computed<Categoria[]>(() => [
    ...(this.destaques().length > 0 ? [CATEGORIA_DESTAQUE] : []),
    ...this.cardapio().map((secao) => secao.categoria),
  ]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarCardapio(false);
    }
  }

  aoSelecionarCategoria(categoriaId: string): void {
    this.categoriaAtivaId.set(categoriaId);
  }

  aoPedirDestaque(produto: Produto): void {
    this.ultimoProdutoPedido.set(produto);
    this.produtoDetalheService.abrir(produto);
  }

  aoPedirProduto(produto: Produto): void {
    this.ultimoProdutoPedido.set(produto);
    this.produtoDetalheService.abrir(produto);
  }

  aoAdicionarItem(item: ItemConfigurado): void {
    this.carrinhoService.adicionar(item);
  }

  carregarCardapio(forcarRecarga = true): void {
    if (forcarRecarga) {
      this.cardapioService.invalidarCache();
    }

    this.carregando.set(true);
    this.erro.set(null);
    this.erroLoja.set(null);

    const lojaSegura$ = this.lojaService.obterLoja().pipe(
      catchError(() => {
        this.erroLoja.set('Informações da loja indisponíveis no momento.');
        return of(null);
      })
    );

    forkJoin({
      loja: lojaSegura$,
      cardapio: this.cardapioService.listarCardapio(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ loja, cardapio }) => {
          this.loja.set(loja);
          this.cardapio.set(cardapio);
          const primeira = this.categorias()[0];
          if (!this.categoriaAtivaId() && primeira) {
            this.categoriaAtivaId.set(primeira.id);
          }
          this.carregando.set(false);
        },
        error: (err: unknown) => {
          this.carregando.set(false);
          if (isApiError(err) && err.status === 401) {
            this.authService.sair();
            void this.router.navigate(['/login']);
            return;
          }
          const mensagem = isApiError(err)
            ? err.mensagem
            : 'Não foi possível carregar o cardápio agora. Verifique sua conexão e tente novamente.';
          this.erro.set(mensagem);
        },
      });
  }
}
