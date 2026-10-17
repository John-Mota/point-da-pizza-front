import { ChangeDetectionStrategy, Component, input, isDevMode } from '@angular/core';
import { Loja } from '../../../shared/models';

@Component({
  selector: 'pdp-rodape',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="pdp-area-slot" data-area="rodape" aria-label="Rodapé da loja">
      @if (devMode) {
        <span class="pdp-area-slot__label">rodape</span>
      }
    </footer>
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
export class PdpRodape {
  readonly loja = input<Loja | null>(null);
  protected readonly devMode = isDevMode();
}

