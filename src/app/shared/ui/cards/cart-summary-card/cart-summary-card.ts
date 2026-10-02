import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PdpCurrencyPipe } from '../../../pipes';
import { PdpCard } from '../card/card';

@Component({
  selector: 'pdp-cart-summary-card',
  standalone: true,
  imports: [PdpCard, PdpCurrencyPipe],
  templateUrl: './cart-summary-card.html',
  styleUrl: './cart-summary-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpCartSummaryCard {
  readonly subtotal = input.required<number>();
  readonly taxaEntrega = input.required<number>();
  readonly desconto = input<number>(0);
  readonly ctaLabel = input<string>('Finalizar pelo WhatsApp');
  readonly desabilitado = input<boolean>(false);
  readonly loading = input<boolean>(false);

  readonly checkout = output<void>();

  readonly temDesconto = computed(() => (this.desconto() ?? 0) > 0);

  readonly total = computed(() => {
    const sub = this.subtotal();
    const taxa = this.taxaEntrega();
    const desc = this.desconto() ?? 0;
    return Math.max(0, sub + taxa - desc);
  });

  onCheckoutClick(): void {
    if (!this.desabilitado() && !this.loading()) {
      this.checkout.emit();
    }
  }
}
