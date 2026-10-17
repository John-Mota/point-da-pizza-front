import { ChangeDetectionStrategy, Component, input, isDevMode } from '@angular/core';
import { Categoria } from '../../../shared/models';

@Component({
  selector: 'pdp-categorias-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="pdp-area-slot" data-area="categorias-nav" aria-label="Navegação de categorias">
      @if (devMode) {
        <span class="pdp-area-slot__label">categorias-nav</span>
      }
    </nav>
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
export class PdpCategoriasNav {
  readonly categorias = input<Categoria[]>([]);
  protected readonly devMode = isDevMode();
}

