import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Produto } from '../../../../shared/models';
import { PdpCurrencyPipe } from '../../../../shared/pipes';

/** Tamanho (px) da miniatura quadrada do item. */
export const PRODUTO_ITEM_THUMB_PX = 88;

@Component({
  selector: 'pdp-produto-item',
  standalone: true,
  imports: [ButtonModule, TagModule, PdpCurrencyPipe],
  templateUrl: './produto-item.html',
  styleUrl: './produto-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpProdutoItem {
  readonly produto = input.required<Produto>();
  readonly pedir = output<Produto>();

  protected readonly thumbPx = PRODUTO_ITEM_THUMB_PX;
  private readonly imagemFalhou = signal(false);

  readonly indisponivel = computed(() => this.produto().disponivel === false);

  readonly mostrarImagem = computed(() => !!this.produto().imagemUrl && !this.imagemFalhou());

  /** Menor preço entre os tamanhos (quando houver); caso contrário, null. */
  readonly menorPrecoTamanho = computed<number | null>(() => {
    const precos = (this.produto().tamanhos ?? [])
      .map((t) => t.precoBase)
      .filter((p): p is number => typeof p === 'number');
    return precos.length > 0 ? Math.min(...precos) : null;
  });

  readonly precoExibido = computed(() => this.menorPrecoTamanho() ?? this.produto().preco);

  aoErroImagem(): void {
    this.imagemFalhou.set(true);
  }

  aoClicarPedir(): void {
    if (!this.indisponivel()) {
      this.pedir.emit(this.produto());
    }
  }
}

