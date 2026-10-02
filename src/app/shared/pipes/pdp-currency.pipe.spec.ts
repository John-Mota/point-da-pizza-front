import { PdpCurrencyPipe } from './pdp-currency.pipe';

describe('PdpCurrencyPipe', () => {
  const pipe = new PdpCurrencyPipe();

  it('deve formatar números para padrão monetário BRL com vírgula', () => {
    expect(pipe.transform(36.9)).toBe('R$ 36,90');
    expect(pipe.transform(120)).toBe('R$ 120,00');
    expect(pipe.transform(0)).toBe('R$ 0,00');
    expect(pipe.transform(1450.5)).toBe('R$ 1.450,50');
  });

  it('deve lidar com valores nulos e indefinidos de forma segura', () => {
    expect(pipe.transform(null)).toBe('R$ 0,00');
    expect(pipe.transform(undefined)).toBe('R$ 0,00');
    expect(pipe.transform(NaN)).toBe('R$ 0,00');
  });
});
