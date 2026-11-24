import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardVariant = 'default' | 'promo' | 'outlined';
export type CardPadding = 'none' | 'md';

@Component({
  selector: 'pdp-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpCard {
  readonly variant = input<CardVariant>('default');
  readonly interactive = input<boolean>(false);
  readonly padding = input<CardPadding>('md');

  readonly cardClasses = computed(() => {
    return {
      'pdp-card--default': this.variant() === 'default',
      'pdp-card--promo': this.variant() === 'promo',
      'pdp-card--outlined': this.variant() === 'outlined',
      'pdp-card--interactive': this.interactive(),
      'pdp-card--pad-md': this.padding() === 'md',
      'pdp-card--pad-none': this.padding() === 'none',
    };
  });
}
