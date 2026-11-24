import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pdpCurrency',
  standalone: true,
})
export class PdpCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00';
    }
    const formatted = value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$ ${formatted}`;
  }
}
