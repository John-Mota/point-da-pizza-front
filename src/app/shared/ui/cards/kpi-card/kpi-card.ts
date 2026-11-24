import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PdpCard } from '../card/card';

@Component({
  selector: 'pdp-kpi-card',
  standalone: true,
  imports: [PdpCard],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpKpiCard {
  readonly rotulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly variacao = input<number | undefined>(undefined);
  readonly meta = input<number | undefined>(undefined);
  readonly loading = input<boolean>(false);

  readonly hasVariacao = computed(() => this.variacao() !== undefined);
  readonly isPositive = computed(() => (this.variacao() ?? 0) >= 0);

  readonly variacaoFormatada = computed(() => {
    const v = this.variacao();
    if (v === undefined) return '';
    const prefix = v > 0 ? '+' : '';
    return `${prefix}${v.toFixed(1).replace('.', ',')}%`;
  });

  readonly hasMeta = computed(() => this.meta() !== undefined);
  readonly metaClamped = computed(() => Math.min(100, Math.max(0, this.meta() ?? 0)));
}
