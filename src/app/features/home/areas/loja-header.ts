import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClockService } from '../../../core/clock';
import { ThemeService } from '../../../core/theme';
import { DiaSemana, Loja } from '../../../shared/models';
import { PdpCurrencyPipe } from '../../../shared/pipes';
import {
  NOMES_DIAS_SEMANA,
  StatusLojaResult,
  calcularStatusLoja,
  formatarProximaAbertura,
  obterAgoraFortaleza,
} from './loja-status.util';

export interface HorarioDiaView {
  dia: DiaSemana;
  nomeDia: string;
  hoje: boolean;
  abertoNoDia: boolean;
  descricaoHorario: string;
}

const ORDEM_DIAS_SEMANA: readonly DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];

@Component({
  selector: 'pdp-loja-header',
  standalone: true,
  imports: [RouterLink, PdpCurrencyPipe],
  templateUrl: './loja-header.html',
  styleUrl: './loja-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpLojaHeader implements OnInit {
  readonly loja = input<Loja | null>(null);

  protected readonly themeService = inject(ThemeService);
  private readonly clockService = inject(ClockService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly painelAberto = signal<boolean>(false);
  readonly erroCapa = signal<boolean>(false);
  readonly erroLogo = signal<boolean>(false);
  readonly agora = signal<Date>(this.clockService.now());

  readonly statusLoja = computed<StatusLojaResult>(() => {
    const dados = this.loja();
    if (!dados) {
      return { aberta: false };
    }
    return calcularStatusLoja(dados.horarios, this.agora());
  });

  readonly textoProximaAbertura = computed<string>(() => {
    const status = this.statusLoja();
    if (status.aberta || !status.proximaAbertura) {
      return '';
    }
    return formatarProximaAbertura(status.proximaAbertura);
  });

  readonly whatsappUrl = computed<string>(() => {
    const bruto = this.loja()?.whatsapp ?? '';
    const digitos = bruto.replace(/\D/g, '');
    if (!digitos) {
      return 'https://wa.me/';
    }
    const comDdi = digitos.startsWith('55') ? digitos : `55${digitos}`;
    return `https://wa.me/${comDdi}`;
  });

  readonly telefoneLimpo = computed<string>(() => {
    const bruto = this.loja()?.telefone ?? '';
    return bruto.replace(/\D/g, '');
  });

  readonly telefoneFormatado = computed<string>(() => {
    const digitos = this.telefoneLimpo();
    if (digitos.length === 11) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    }
    if (digitos.length === 10) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return this.loja()?.telefone ?? '';
  });

  readonly horariosSemana = computed<HorarioDiaView[]>(() => {
    const dados = this.loja();
    const horarios = dados?.horarios ?? [];
    const { dia: diaHoje } = obterAgoraFortaleza(this.agora());

    return ORDEM_DIAS_SEMANA.map((dia) => {
      const turnos = horarios.filter((h) => h.dia === dia);
      const abertoNoDia = turnos.length > 0;
      const descricaoHorario = abertoNoDia
        ? turnos.map((t) => `${t.abre} às ${t.fecha}`).join(' / ')
        : 'Fechado';

      return {
        dia,
        nomeDia: NOMES_DIAS_SEMANA[dia],
        hoje: dia === diaHoje,
        abertoNoDia,
        descricaoHorario,
      };
    });
  });

  ngOnInit(): void {
    this.atualizarRelogio();

    if (isPlatformBrowser(this.platformId)) {
      const timerId = setInterval(() => {
        this.atualizarRelogio();
      }, 60_000);

      this.destroyRef.onDestroy(() => {
        clearInterval(timerId);
      });
    }
  }

  atualizarRelogio(): void {
    this.agora.set(this.clockService.now());
  }

  alternarPainelInfo(): void {
    this.painelAberto.update((aberto) => !aberto);
  }

  alternarTema(): void {
    this.themeService.toggleTheme();
  }
}
