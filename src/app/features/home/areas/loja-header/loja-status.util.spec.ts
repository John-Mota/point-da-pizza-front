import { HorarioFuncionamento } from '../../../../shared/models';
import { HORARIOS_LOJA_MOCK } from '../../data';
import { calcularStatusLoja, formatarProximaAbertura } from './loja-status.util';

describe('calcularStatusLoja (America/Fortaleza UTC-3)', () => {
  const horariosPadrao: HorarioFuncionamento[] = HORARIOS_LOJA_MOCK;

  it('deve retornar aberta=true às 19:00 de terça-feira no fuso de Fortaleza', () => {
    // 2026-10-20 é uma terça-feira. 19:00 em Fortaleza (-03:00) = 22:00 UTC
    const terca19h = new Date('2026-10-20T19:00:00-03:00');
    const resultado = calcularStatusLoja(horariosPadrao, terca19h);

    expect(resultado.aberta).toBe(true);
    expect(resultado.proximaAbertura).toBeUndefined();
  });

  it('deve retornar aberta=false às 17:00 de terça-feira com próxima abertura "hoje" às 18:00', () => {
    const terca17h = new Date('2026-10-20T17:00:00-03:00');
    const resultado = calcularStatusLoja(horariosPadrao, terca17h);

    expect(resultado.aberta).toBe(false);
    expect(resultado.proximaAbertura).toEqual({
      quando: 'hoje',
      dia: 2,
      horario: '18:00',
    });
    expect(formatarProximaAbertura(resultado.proximaAbertura)).toBe('Abre hoje às 18h');
  });

  it('deve retornar aberta=false na segunda-feira com próxima abertura "amanha" (terça) às 18:00', () => {
    // 2026-10-19 é uma segunda-feira
    const segunda14h = new Date('2026-10-19T14:00:00-03:00');
    const resultado = calcularStatusLoja(horariosPadrao, segunda14h);

    expect(resultado.aberta).toBe(false);
    expect(resultado.proximaAbertura).toEqual({
      quando: 'amanha',
      dia: 2,
      horario: '18:00',
    });
    expect(formatarProximaAbertura(resultado.proximaAbertura)).toBe('Abre amanhã às 18h');
  });

  it('deve retornar aberta=true depois da meia-noite quando o horário do dia anterior atravessa o dia', () => {
    const horariosMadrugada: HorarioFuncionamento[] = [
      { dia: 6, abre: '18:00', fecha: '01:00' }, // Sábado até 01:00 de domingo
      { dia: 0, abre: '18:00', fecha: '23:30' }, // Domingo à noite
    ];

    // 2026-10-18 é domingo, 00:30 em Fortaleza (-03:00)
    const domingo00h30 = new Date('2026-10-18T00:30:00-03:00');
    const resultadoAberto = calcularStatusLoja(horariosMadrugada, domingo00h30);
    expect(resultadoAberto.aberta).toBe(true);

    // Às 01:15 de domingo já fechou, próxima abertura é hoje (domingo) às 18:00
    const domingo01h15 = new Date('2026-10-18T01:15:00-03:00');
    const resultadoFechado = calcularStatusLoja(horariosMadrugada, domingo01h15);
    expect(resultadoFechado.aberta).toBe(false);
    expect(resultadoFechado.proximaAbertura).toEqual({
      quando: 'hoje',
      dia: 0,
      horario: '18:00',
    });
  });

  it('deve retornar próxima abertura "amanha" quando já passou do horário de fechamento do dia', () => {
    // Terça-feira às 23:45 (fechou às 23:30) -> abre amanhã (quarta, dia 3) às 18:00
    const terca23h45 = new Date('2026-10-20T23:45:00-03:00');
    const resultado = calcularStatusLoja(horariosPadrao, terca23h45);

    expect(resultado.aberta).toBe(false);
    expect(resultado.proximaAbertura).toEqual({
      quando: 'amanha',
      dia: 3,
      horario: '18:00',
    });
  });
});

