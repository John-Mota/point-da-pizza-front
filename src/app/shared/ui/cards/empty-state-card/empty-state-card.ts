import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PdpCard } from '../card/card';

@Component({
  selector: 'pdp-empty-state-card',
  standalone: true,
  imports: [PdpCard],
  templateUrl: './empty-state-card.html',
  styleUrl: './empty-state-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpEmptyStateCard {
  readonly icone = input<string>('🍕');
  readonly titulo = input.required<string>();
  readonly texto = input.required<string>();
  readonly acaoLabel = input<string | undefined>(undefined);
  readonly loading = input<boolean>(false);

  readonly action = output<void>();

  onActionClick(): void {
    if (!this.loading()) {
      this.action.emit();
    }
  }
}
