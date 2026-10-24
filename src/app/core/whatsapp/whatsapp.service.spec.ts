import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { parseEnv } from '../../../../scripts/gerar-env.mjs';
import { WHATSAPP_RAW_NUMBER, WhatsappService } from './whatsapp.service';

describe('gerar-env parser (parseEnv)', () => {
  it('deve ignorar comentários, linhas vazias, espaços e remover aspas', () => {
    const conteudo = `
      # Comentário inicial
      
      WHATS_APP = "11999990000"
      OUTRA_CHAVE = 'valor com espaco'
      COM_COMENTARIO = 11988887777 # comentário inline
      LINHA_INVALIDA_SEM_IGUAL
    `;

    const parsed = parseEnv(conteudo);
    expect(parsed).toEqual({
      WHATS_APP: '11999990000',
      OUTRA_CHAVE: 'valor com espaco',
      COM_COMENTARIO: '11988887777',
    });
  });

  it('deve retornar objeto sem WHATS_APP quando a variável estiver ausente ou vazia', () => {
    expect(parseEnv('# apenas comentário\n\n')).toEqual({});
    expect(parseEnv('WHATS_APP=   ')).toEqual({ WHATS_APP: '' });
  });
});

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
    const longo = criarServico('5511987654321'); // 13 dígitos (já com 55, fora da regra de 10-11 dígitos)
    expect(longo.disponivel).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
  });
});

