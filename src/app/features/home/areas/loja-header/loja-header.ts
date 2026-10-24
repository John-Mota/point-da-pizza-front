import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { ClockService } from '../../../../core/clock';
import { ThemeService } from '../../../../core/theme';
import { WhatsappService, formatarTelefoneBr } from '../../../../core/whatsapp';
import { DiaSemana, Loja } from '../../../../shared/models';
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
  imports: [ButtonModule, AvatarModule, TagModule, RippleModule],
  templateUrl: './loja-header.html',
  styleUrl: './loja-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdpLojaHeader implements OnInit {
  readonly loja = input<Loja | null>(null);
  readonly usuarioFotoUrl = input<string | null>(null);
  readonly usuarioNome = input<string>('Cliente');

  readonly configurar = output<void>();
  readonly sair = output<void>();

  protected readonly themeService = inject(ThemeService);
  protected readonly whatsappService = inject(WhatsappService);
  private readonly router = inject(Router);
  private readonly clockService = inject(ClockService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly painelAberto = signal<boolean>(false);
  readonly menuUsuarioAberto = signal<boolean>(false);
  readonly erroLogo = signal<boolean>(false);
  readonly erroFotoUsuario = signal<boolean>(false);
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

  readonly whatsappDisponivel = computed<boolean>(() => this.whatsappService.disponivel);

  readonly whatsappUrl = computed<string>(() => this.whatsappService.link());

  readonly telefoneLimpo = computed<string>(() => {
    const bruto = (this.loja()?.telefone ?? '').replace(/\D/g, '');
    return bruto || this.whatsappService.digitosLocais;
  });

  readonly telefoneFormatado = computed<string>(() => {
    const bruto = (this.loja()?.telefone ?? '').replace(/\D/g, '');
    if (bruto) {
      return formatarTelefoneBr(bruto) || (this.loja()?.telefone ?? '');
    }
    return this.whatsappService.numeroFormatado;
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

  @HostListener('document:keydown.escape')
  aoPressionarEscape(): void {
    if (this.painelAberto()) {
      this.painelAberto.set(false);
    }
    if (this.menuUsuarioAberto()) {
      this.menuUsuarioAberto.set(false);
    }
  }

  atualizarRelogio(): void {
    this.agora.set(this.clockService.now());
  }

  alternarPainelInfo(): void {
    this.menuUsuarioAberto.set(false);
    this.painelAberto.update((aberto) => !aberto);
  }

  fecharPainelInfo(): void {
    this.painelAberto.set(false);
  }

  alternarMenuUsuario(): void {
    this.painelAberto.set(false);
    this.menuUsuarioAberto.update((aberto) => !aberto);
  }

  fecharMenuUsuario(): void {
    this.menuUsuarioAberto.set(false);
  }

  aoClicarConfigurar(): void {
    this.menuUsuarioAberto.set(false);
    this.configurar.emit();
  }

  aoClicarSair(): void {
    this.menuUsuarioAberto.set(false);
    this.sair.emit();
    void this.router.navigate(['/login']);
  }

  alternarTema(): void {
    this.themeService.toggleTheme();
  }
}
