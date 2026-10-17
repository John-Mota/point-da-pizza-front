import { DiaSemana, HorarioFuncionamento } from '../../../shared/models';

export interface ProximaAberturaLoja {
  quando: 'hoje' | 'amanha' | 'dia';
  dia: DiaSemana;
  horario: string;
}

export interface StatusLojaResult {
  aberta: boolean;
  proximaAbertura?: ProximaAberturaLoja;
}

export const NOMES_DIAS_SEMANA: Record<DiaSemana, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

const FORTALEZA_UTC_OFFSET_MS = -3 * 60 * 60 * 1000;

export function obterAgoraFortaleza(agora: Date): { dia: DiaSemana; minutos: number } {
  const fortalezaEpoch = new Date(agora.getTime() + FORTALEZA_UTC_OFFSET_MS);
  const dia = fortalezaEpoch.getUTCDay() as DiaSemana;
  const minutos = fortalezaEpoch.getUTCHours() * 60 + fortalezaEpoch.getUTCMinutes();
  return { dia, minutos };
}

function parseHorarioParaMinutos(horario: string): number {
  const [horasStr = '0', minutosStr = '0'] = horario.trim().split(':');
  const horas = Number(horasStr);
  const minutos = Number(minutosStr);
  if (Number.isNaN(horas) || Number.isNaN(minutos)) {
    return 0;
  }
  return horas * 60 + minutos;
}

/**
 * Calcula de forma pura se a loja está aberta no instante `agora` considerando
 * o fuso horário fixo America/Fortaleza (UTC-3, sem horário de verão),
 * suportando turnos que atravessam a meia-noite e dias fechados.
 */
export function calcularStatusLoja(
  horarios: readonly HorarioFuncionamento[],
  agora: Date
): StatusLojaResult {
  if (!horarios || horarios.length === 0) {
    return { aberta: false };
  }

  const { dia: diaAtual, minutos: minutosAgora } = obterAgoraFortaleza(agora);
  const diaAnterior = ((diaAtual + 6) % 7) as DiaSemana;

  // 1. Verifica se ainda está dentro de um turno iniciado no dia anterior que atravessou a meia-noite
  const turnosOntem = horarios.filter((h) => h.dia === diaAnterior);
  for (const turno of turnosOntem) {
    const abreMin = parseHorarioParaMinutos(turno.abre);
    const fechaMin = parseHorarioParaMinutos(turno.fecha);
    const atravessaMeiaNoite = fechaMin <= abreMin;

    if (atravessaMeiaNoite && fechaMin > 0 && minutosAgora < fechaMin) {
      return { aberta: true };
    }
  }

  // 2. Verifica se está dentro de algum turno do dia atual
  const turnosHoje = horarios.filter((h) => h.dia === diaAtual);
  for (const turno of turnosHoje) {
    const abreMin = parseHorarioParaMinutos(turno.abre);
    const fechaMin = parseHorarioParaMinutos(turno.fecha);
    const atravessaMeiaNoite = fechaMin <= abreMin;

    if (atravessaMeiaNoite) {
      if (minutosAgora >= abreMin) {
        return { aberta: true };
      }
    } else if (minutosAgora >= abreMin && minutosAgora < fechaMin) {
      return { aberta: true };
    }
  }

  // 3. Caso fechada, encontra a próxima abertura a partir de hoje (offset 0..7)
  for (let offset = 0; offset <= 7; offset++) {
    const diaCandidato = ((diaAtual + offset) % 7) as DiaSemana;
    const turnosCandidatos = horarios
      .filter((h) => h.dia === diaCandidato)
      .slice()
      .sort((a, b) => parseHorarioParaMinutos(a.abre) - parseHorarioParaMinutos(b.abre));

    for (const turno of turnosCandidatos) {
      const abreMin = parseHorarioParaMinutos(turno.abre);
      if (offset === 0) {
        if (abreMin > minutosAgora) {
          return {
            aberta: false,
            proximaAbertura: {
              quando: 'hoje',
              dia: diaCandidato,
              horario: turno.abre,
            },
          };
        }
      } else {
        return {
          aberta: false,
          proximaAbertura: {
            quando: offset === 1 ? 'amanha' : 'dia',
            dia: diaCandidato,
            horario: turno.abre,
          },
        };
      }
    }
  }

  return { aberta: false };
}

export function formatarHorarioCurto(horario: string): string {
  const [horasStr = '00', minutosStr = '00'] = horario.trim().split(':');
  const horas = String(Number(horasStr));
  if (minutosStr === '00') {
    return `${horas}h`;
  }
  return `${horas}h${minutosStr}`;
}

export function formatarProximaAbertura(proxima?: ProximaAberturaLoja): string {
  if (!proxima) {
    return 'Sem previsão de abertura';
  }
  const horarioFormatado = formatarHorarioCurto(proxima.horario);
  if (proxima.quando === 'hoje') {
    return `Abre hoje às ${horarioFormatado}`;
  }
  if (proxima.quando === 'amanha') {
    return `Abre amanhã às ${horarioFormatado}`;
  }
  const nomeDia = NOMES_DIAS_SEMANA[proxima.dia].toLowerCase();
  return `Abre ${nomeDia} às ${horarioFormatado}`;
}

