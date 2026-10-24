import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { Produto } from '../../../../shared/models';
import { SecaoCardapio } from '../../data';
import { PdpProdutoItem } from '../produto-item';

@Component({
  selector: 'pdp-produtos-lista',
  standalone: true,
  imports: [SkeletonModule, PdpProdutoItem],
  templateUrl: './produtos-lista.html',
  styleUrl: './produtos-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpProdutosLista {
  readonly secoes = input<SecaoCardapio[]>([]);
  readonly carregando = input<boolean>(false);
  readonly pedir = output<Produto>();

  protected readonly skeletonCategorias = [1, 2] as const;
  protected readonly skeletonItens = [1, 2, 3] as const;

  aoPedir(produto: Produto): void {
    this.pedir.emit(produto);
  }
}

