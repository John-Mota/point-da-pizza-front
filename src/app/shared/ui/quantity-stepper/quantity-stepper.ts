import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'pdp-quantity-stepper',
  standalone: true,
  imports: [ButtonModule, RippleModule],
  templateUrl: './quantity-stepper.html',
  styleUrl: './quantity-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpQuantityStepper {
  readonly valor = model<number>(1);
  readonly min = input<number>(1);
  readonly max = input<number>(20);
  readonly desabilitado = input<boolean>(false);
  readonly rotulo = input<string>('Quantidade');

  readonly podeDiminuir = computed(() => !this.desabilitado() && this.valor() > this.min());
  readonly podeAumentar = computed(() => !this.desabilitado() && this.valor() < this.max());

  diminuir(): void {
    if (this.podeDiminuir()) {
      this.valor.update((atual) => Math.max(this.min(), atual - 1));
    }
  }

  aumentar(): void {
    if (this.podeAumentar()) {
      this.valor.update((atual) => Math.min(this.max(), atual + 1));
    }
  }
}

