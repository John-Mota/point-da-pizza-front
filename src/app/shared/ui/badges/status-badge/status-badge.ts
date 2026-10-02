import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusPedido } from '../../../models';

@Component({
  selector: 'pdp-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpStatusBadge {
  readonly status = input.required<StatusPedido>();

  readonly label = computed(() => {
    switch (this.status()) {
      case 'recebido':
        return 'Recebido';
      case 'em-producao':
        return 'Em produção';
      case 'a-caminho':
        return 'A caminho';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return this.status();
    }
  });

  readonly statusClass = computed(() => `status-${this.status()}`);
}
