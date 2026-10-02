import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Promocao } from '../../../models';
import { PdpCurrencyPipe } from '../../../pipes';
import { PdpCard } from '../card/card';

@Component({
  selector: 'pdp-promo-card',
  standalone: true,
  imports: [PdpCard, PdpCurrencyPipe],
  templateUrl: './promo-card.html',
  styleUrl: './promo-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpPromoCard {
  readonly promocao = input.required<Promocao>();
  readonly loading = input<boolean>(false);

  readonly order = output<Promocao>();

  onOrderClick(): void {
    if (!this.loading()) {
      this.order.emit(this.promocao());
    }
  }
}
