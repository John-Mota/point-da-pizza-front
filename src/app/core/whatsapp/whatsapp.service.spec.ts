import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { WHATSAPP_RAW_NUMBER, WhatsappService } from './whatsapp.service';

describe('WhatsappService', () => {
  function criarServico(valorBruto: string): WhatsappService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: WHATSAPP_RAW_NUMBER, useValue: valorBruto }],
    });
    return TestBed.inject(WhatsappService);
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve normalizar número de 11 dígitos adicionando 55 na frente e marcar disponivel = true', () => {
    const service = criarServico('(11) 98765-4321');

    expect(service.disponivel).toBe(true);
    expect(service.numero).toBe('5511987654321');
    expect(service.numeroFormatado).toBe('(11) 98765-4321');
    expect(service.link()).toBe('https://wa.me/5511987654321');
  });

  it('deve codificar a mensagem com encodeURIComponent no método link(mensagem)', () => {
    const service = criarServico('11987654321');
    const url = service.link('Olá! Quero pedir 1 Pizza G & Coca 2L');

    expect(url).toBe(
      'https://wa.me/5511987654321?text=' +
        encodeURIComponent('Olá! Quero pedir 1 Pizza G & Coca 2L')
    );
  });

  it('deve marcar disponivel = false e emitir aviso no console quando o número for vazio ou inválido', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const vazio = criarServico('');
    expect(vazio.disponivel).toBe(false);
    expect(vazio.numero).toBe('');
    expect(vazio.link('Oi')).toBe('');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockClear();
    const curto = criarServico('12345');
    expect(curto.disponivel).toBe(false);
    expect(curto.link()).toBe('');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockClear();
    const longo = criarServico('5511987654321');
    expect(longo.disponivel).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
  });
});
