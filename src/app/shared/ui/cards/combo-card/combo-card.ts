import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Combo } from '../../../models';
import { PdpCurrencyPipe } from '../../../pipes';
import { PdpCard } from '../card/card';

@Component({
  selector: 'pdp-combo-card',
  standalone: true,
  imports: [PdpCard, PdpCurrencyPipe],
  templateUrl: './combo-card.html',
  styleUrl: './combo-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpComboCard {
  readonly combo = input.required<Combo>();
  readonly loading = input<boolean>(false);

  readonly choose = output<Combo>();

  readonly economia = computed(() => {
    const original = this.combo().precoOriginal;
    const atual = this.combo().preco;
    if (original && original > atual) {
      return original - atual;
    }
    return 0;
  });

  onChooseClick(): void {
    if (!this.loading()) {
      this.choose.emit(this.combo());
    }
  }
}
