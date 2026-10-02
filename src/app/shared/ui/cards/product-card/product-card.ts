import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Produto } from '../../../models';
import { PdpCurrencyPipe } from '../../../pipes';
import { PdpCard } from '../card/card';

@Component({
  selector: 'pdp-product-card',
  standalone: true,
  imports: [PdpCard, PdpCurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpProductCard {
  readonly produto = input.required<Produto>();
  readonly loading = input<boolean>(false);
  readonly indisponivel = input<boolean>(false);

  readonly add = output<Produto>();

  protected readonly imageError = signal(false);

  onImageError(): void {
    this.imageError.set(true);
  }

  onAddClick(): void {
    if (!this.indisponivel() && !this.loading()) {
      this.add.emit(this.produto());
    }
  }
}
