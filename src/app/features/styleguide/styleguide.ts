import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ThemeService } from '../../core/theme';
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
import {
  EXEMPLO_COMBO_COM_DESCONTO,
  EXEMPLO_COMBO_SEM_DESCONTO,
  EXEMPLO_PEDIDO_A_CAMINHO,
  EXEMPLO_PEDIDO_CANCELADO,
  EXEMPLO_PEDIDO_EM_PRODUCAO,
  EXEMPLO_PEDIDO_ENTREGUE,
  EXEMPLO_PEDIDO_RECEBIDO,
  EXEMPLO_PRODUTO_COM_IMAGEM,
  EXEMPLO_PRODUTO_SEM_IMAGEM,
  EXEMPLO_PROMOCAO,
} from './styleguide.demo-data';

@Component({
  selector: 'app-styleguide',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
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

  readonly exemploProdutoComImagem = EXEMPLO_PRODUTO_COM_IMAGEM;
  readonly exemploProdutoSemImagem = EXEMPLO_PRODUTO_SEM_IMAGEM;
  readonly exemploPromocao = EXEMPLO_PROMOCAO;
  readonly exemploComboComDesconto = EXEMPLO_COMBO_COM_DESCONTO;
  readonly exemploComboSemDesconto = EXEMPLO_COMBO_SEM_DESCONTO;
  readonly exemploPedidoRecebido = EXEMPLO_PEDIDO_RECEBIDO;
  readonly exemploPedidoEmProducao = EXEMPLO_PEDIDO_EM_PRODUCAO;
  readonly exemploPedidoACaminho = EXEMPLO_PEDIDO_A_CAMINHO;
  readonly exemploPedidoEntregue = EXEMPLO_PEDIDO_ENTREGUE;
  readonly exemploPedidoCancelado = EXEMPLO_PEDIDO_CANCELADO;

  onActionTriggered(descricao: string): void {
    this.lastAction.set(descricao);
  }

  printStyleguide(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
