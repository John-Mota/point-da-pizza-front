import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { Produto } from '../../../../shared/models';
import { PdpCurrencyPipe } from '../../../../shared/pipes';
import { obterIconeCategoria } from '../categorias-nav/categorias-icons.map';

@Component({
  selector: 'pdp-destaque-card',
  standalone: true,
  imports: [ButtonModule, RippleModule, TagModule, PdpCurrencyPipe],
  templateUrl: './destaque-card.html',
  styleUrl: './destaque-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpDestaqueCard {
  readonly produto = input.required<Produto>();
  readonly ativo = input<boolean>(false);

  readonly pedir = output<Produto>();

  readonly erroImagem = signal<boolean>(false);

  readonly mostrarImagem = computed(() => Boolean(this.produto().imagemUrl) && !this.erroImagem());

  readonly emojiFallback = computed(() => {
    const p = this.produto();
    return obterIconeCategoria(p.categoria ?? p.categoriaId);
  });

  readonly selo = computed(() => this.produto().seloDestaque || 'Destaque');

  aoErroImagem(): void {
    this.erroImagem.set(true);
  }

  aoClicarPedir(event: Event): void {
    event.stopPropagation();
    this.pedir.emit(this.produto());
  }
}
