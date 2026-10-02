import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Pedido } from '../../../models';
import { PdpCurrencyPipe } from '../../../pipes';
import { PdpStatusBadge } from '../../badges';
import { PdpCard } from '../card/card';

@Component({
  selector: 'pdp-order-card',
  standalone: true,
  imports: [PdpCard, PdpStatusBadge, PdpCurrencyPipe],
  templateUrl: './order-card.html',
  styleUrl: './order-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpOrderCard {
  readonly pedido = input.required<Pedido>();
  readonly loading = input<boolean>(false);

  readonly details = output<Pedido>();
  readonly advance = output<Pedido>();

  readonly tempoRelativo = computed(() => {
    const agora = Date.now();
    const criado = new Date(this.pedido().criadoEm).getTime();
    const diffSegundos = Math.max(0, Math.floor((agora - criado) / 1000));

    if (diffSegundos < 60) {
      return 'agora mesmo';
    }
    const diffMinutos = Math.floor(diffSegundos / 60);
    if (diffMinutos < 60) {
      return `há ${diffMinutos} min`;
    }
    const diffHoras = Math.floor(diffMinutos / 60);
    if (diffHoras < 24) {
      return `há ${diffHoras} h`;
    }
    const diffDias = Math.floor(diffHoras / 24);
    return `há ${diffDias} d`;
  });

  readonly podeAvancar = computed(() => {
    const s = this.pedido().status;
    return s !== 'entregue' && s !== 'cancelado';
  });

  readonly proximoRotulo = computed(() => {
    switch (this.pedido().status) {
      case 'recebido':
        return 'Iniciar produção';
      case 'em-producao':
        return 'Enviar para entrega';
      case 'a-caminho':
        return 'Concluir entrega';
      default:
        return '';
    }
  });

  onDetailsClick(): void {
    if (!this.loading()) {
      this.details.emit(this.pedido());
    }
  }

  onAdvanceClick(): void {
    if (!this.loading() && this.podeAvancar()) {
      this.advance.emit(this.pedido());
    }
  }
}
