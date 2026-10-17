import { ChangeDetectionStrategy, Component, input, isDevMode } from '@angular/core';
import { Combo, Promocao } from '../../../shared/models';

@Component({
  selector: 'pdp-promocoes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pdp-area-slot" data-area="promocoes" aria-label="Promoções em destaque">
      @if (devMode) {
        <span class="pdp-area-slot__label">promocoes</span>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .pdp-area-slot {
      padding: var(--space-16);
      border: 1.5px dashed var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 600;
    }
  `,
})
export class PdpPromocoes {
  readonly promocoes = input<Promocao[]>([]);
  readonly combos = input<Combo[]>([]);
  protected readonly devMode = isDevMode();
}

