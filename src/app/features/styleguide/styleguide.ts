import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/theme';
import { Combo, Pedido, Produto, Promocao } from '../../shared/models';
import {
  PdpCard,
  PdpCartSummaryCard,
  PdpComboCard,
  PdpEmptyStateCard,
  PdpKpiCard,
  PdpOrderCard,
  PdpProductCard,
  PdpPromoCard,
} from '../../shared/ui/cards';

@Component({
  selector: 'app-styleguide',
  standalone: true,
  imports: [
    PdpCard,
    PdpProductCard,
    PdpPromoCard,
    PdpComboCard,
    PdpOrderCard,
    PdpCartSummaryCard,
    PdpKpiCard,
    PdpEmptyStateCard,
  ],
  templateUrl: './styleguide.html',
  styleUrl: './styleguide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Styleguide {
  protected readonly themeService = inject(ThemeService);

  readonly lastAction = signal<string>('Nenhuma ação realizada');

  // Mocks para Produto
  readonly mockProdutoComImagem: Produto = {
    id: 'prod-1',
    nome: 'Pizza Calabresa Nobre',
    descricao: 'Calabresa artesanal defumada, fatias finas de cebola roxa, azeitonas pretas e orégano fresco.',
    preco: 44.9,
    imagemUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
    categoria: 'Pizzas Salgadas',
  };

  readonly mockProdutoSemImagem: Produto = {
    id: 'prod-2',
    nome: 'Pizza Frango com Catupiry',
    descricao: 'Peito de frango desfiado temperado com ervas finas e legítimo Catupiry cremoso.',
    preco: 48.0,
    categoria: 'Pizzas Salgadas',
  };

  // Mock para Promoção
  readonly mockPromocao: Promocao = {
    id: 'promo-1',
    titulo: 'Quinta em Dobro Point',
    descricao: 'Compre uma pizza grande salgada e receba uma pizza média doce com borda vulcão de cortesia.',
    preco: 69.9,
    selo: 'Mais Pedida',
    diasValidos: 'Terças e Quintas',
  };

  // Mock para Combo
  readonly mockComboComDesconto: Combo = {
    id: 'combo-1',
    titulo: 'Super Combo Galera',
    itens: ['2 Pizzas Grandes Tradicionais', '1 Refrigerante 2 Litros gelado', '1 Borda Recheada de Cheddar'],
    preco: 89.9,
    precoOriginal: 114.9,
  };

  readonly mockComboSemDesconto: Combo = {
    id: 'combo-2',
    titulo: 'Combo Casal Perfeito',
    itens: ['1 Pizza Média Especial', '2 Bebidas em Lata 350ml'],
    preco: 52.0,
  };

  // Mocks para Pedidos (cada status)
  readonly mockPedidoRecebido: Pedido = {
    id: 'ped-201',
    numero: '201',
    cliente: 'Carlos Eduardo',
    itens: [
      { nome: 'Pizza 4 Queijos G', quantidade: 1, opcoes: ['Massa Fina'] },
      { nome: 'Refrigerante 2L', quantidade: 1 },
    ],
    total: 72.5,
    status: 'recebido',
    criadoEm: new Date(Date.now() - 1000 * 60 * 5),
  };

  readonly mockPedidoEmProducao: Pedido = {
    id: 'ped-202',
    numero: '202',
    cliente: 'Fernanda Lima',
    itens: [{ nome: 'Pizza Margherita G', quantidade: 1 }],
    total: 46.0,
    status: 'em-producao',
    criadoEm: new Date(Date.now() - 1000 * 60 * 22),
  };

  readonly mockPedidoACaminho: Pedido = {
    id: 'ped-203',
    numero: '203',
    cliente: 'Lucas Silveira',
    itens: [{ nome: 'Pizza Pepperoni G', quantidade: 2 }],
    total: 98.0,
    status: 'a-caminho',
    criadoEm: new Date(Date.now() - 1000 * 60 * 40),
  };

  readonly mockPedidoEntregue: Pedido = {
    id: 'ped-204',
    numero: '204',
    cliente: 'Juliana Costa',
    itens: [{ nome: 'Pizza Brigadeiro M', quantidade: 1 }],
    total: 38.0,
    status: 'entregue',
    criadoEm: new Date(Date.now() - 1000 * 60 * 95),
  };

  readonly mockPedidoCancelado: Pedido = {
    id: 'ped-205',
    numero: '205',
    cliente: 'Marcos Souza',
    itens: [{ nome: 'Pizza Portuguesa G', quantidade: 1 }],
    total: 54.0,
    status: 'cancelado',
    criadoEm: new Date(Date.now() - 1000 * 60 * 180),
  };

  onActionTriggered(descricao: string): void {
    this.lastAction.set(descricao);
  }

  printStyleguide(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
