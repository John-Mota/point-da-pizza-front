import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { PdpCurrencyPipe } from '../../../../shared/pipes';
import { CarrinhoService } from './carrinho.service';

@Component({
  selector: 'pdp-carrinho-barra',
  standalone: true,
  imports: [ButtonModule, RippleModule, PdpCurrencyPipe],
  template: `
    @if (!carrinhoService.vazio() && !carrinhoService.aberto()) {
      <aside class="pdp-carrinho-barra" aria-label="Resumo rápido da sacola">
        <button
          pButton
          pRipple
          type="button"
          class="pdp-carrinho-barra__btn"
          [attr.aria-label]="
            'Ver sacola com ' +
            carrinhoService.quantidadeTotal() +
            (carrinhoService.quantidadeTotal() === 1 ? ' item' : ' itens')
          "
          (click)="abrirSacola($event)"
        >
          <span class="pdp-carrinho-barra__badge" aria-hidden="true">
            <i class="pi pi-shopping-bag"></i>
            <strong>{{ carrinhoService.quantidadeTotal() }}</strong>
          </span>

          <span class="pdp-carrinho-barra__label">Ver sacola</span>

          <strong class="pdp-carrinho-barra__total" aria-live="polite">
            {{ carrinhoService.total() | pdpCurrency }}
          </strong>
        </button>
      </aside>
    }
  `,
  styles: `
    .pdp-carrinho-barra {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 40;
      padding: var(--space-12) var(--space-16);
      pointer-events: none;
      display: flex;
      justify-content: center;
    }

    .pdp-carrinho-barra__btn.p-button {
      pointer-events: auto;
      width: 100%;
      max-width: 560px;
      min-height: 52px;
      padding: var(--space-12) var(--space-16);
      border-radius: var(--radius-lg);
      background: var(--brand);
      border: 1.5px solid var(--brand);
      color: var(--brand-contrast);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-12);
      font-weight: 700;

      &:hover:not(:disabled) {
        background: var(--brand-strong);
        border-color: var(--brand-strong);
        color: var(--brand-strong-contrast);
      }
    }

    .pdp-carrinho-barra__badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-8);
      padding: var(--space-4) var(--space-12);
      border-radius: var(--radius-full);
      background: rgba(0, 0, 0, 0.16);
      font-size: 0.875rem;
    }

    .pdp-carrinho-barra__label {
      font-size: 0.95rem;
    }

    .pdp-carrinho-barra__total {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 400;
      letter-spacing: 0.02em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpCarrinhoBarra {
  protected readonly carrinhoService = inject(CarrinhoService);

  abrirSacola(event: Event): void {
    const origem = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.carrinhoService.abrir(origem);
  }
}
