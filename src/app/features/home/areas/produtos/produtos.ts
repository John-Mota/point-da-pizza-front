import { ChangeDetectionStrategy, Component, input, isDevMode } from '@angular/core';
import { Categoria, Produto } from '../../../../shared/models';

@Component({
  selector: 'pdp-produtos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pdp-area-slot" data-area="produtos" aria-label="Lista de produtos do cardápio">
      @if (devMode) {
        <span class="pdp-area-slot__label">produtos</span>
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
export class PdpProdutos {
  readonly categorias = input<Categoria[]>([]);
  readonly produtos = input<Produto[]>([]);
  protected readonly devMode = isDevMode();
}

