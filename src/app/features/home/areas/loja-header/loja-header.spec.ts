import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClockService } from '../../../../core/clock';
import { WHATSAPP_RAW_NUMBER } from '../../../../core/whatsapp';
import { LOJA_MOCK } from '../../data';
import { PdpLojaHeader } from './loja-header';

class FakeClockService extends ClockService {
  currentDate = new Date('2026-10-20T19:00:00-03:00'); // Terça-feira às 19:00 (aberto)

  override now(): Date {
    return this.currentDate;
  }
}

describe('PdpLojaHeader', () => {
  let fixture: ComponentFixture<PdpLojaHeader>;
  let component: PdpLojaHeader;
  let fakeClock: FakeClockService;

  beforeEach(async () => {
    fakeClock = new FakeClockService();

    await TestBed.configureTestingModule({
      imports: [PdpLojaHeader],
      providers: [
        provideRouter([]),
        { provide: ClockService, useValue: fakeClock },
        { provide: WHATSAPP_RAW_NUMBER, useValue: '11987654321' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpLojaHeader);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('loja', LOJA_MOCK);
    fixture.detectChanges();
  });

  it('deve exibir "Aberto agora" quando o relógio falso estiver dentro do horário de funcionamento', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const badge = hostEl.querySelector('.pdp-loja-header__badge');

    expect(badge?.textContent).toContain('Aberto agora');
    expect(badge?.classList.contains('pdp-loja-header__badge--open')).toBe(true);
    expect(hostEl.querySelector('.pdp-loja-header__next-open')).toBeNull();
  });

  it('deve exibir "Fechado" e a previsão de abertura quando o relógio falso estiver fora do horário', () => {
    fakeClock.currentDate = new Date('2026-10-20T17:00:00-03:00');
    component.atualizarRelogio();
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const badge = hostEl.querySelector('.pdp-loja-header__badge');
    const nextOpen = hostEl.querySelector('.pdp-loja-header__next-open');

    expect(badge?.textContent).toContain('Fechado');
    expect(badge?.classList.contains('pdp-loja-header__badge--closed')).toBe(true);
    expect(nextOpen?.textContent).toContain('Abre hoje às 18h');
  });

  it('deve abrir e fechar o popup de informações da pizzaria ao clicar no ícone de informações', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const toggleBtn = hostEl.querySelector<HTMLButtonElement>('.pdp-loja-header__info-toggle');
    const panel = hostEl.querySelector<HTMLElement>('#pdp-loja-info-painel');

    expect(toggleBtn).toBeTruthy();
    expect(panel).toBeTruthy();
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.hidden).toBe(true);

    toggleBtn?.click();
    fixture.detectChanges();

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.hidden).toBe(false);
    expect(panel?.textContent).toContain(LOJA_MOCK.endereco);

    const linhaHoje = panel?.querySelector('.pdp-loja-header__schedule-row--today');
    expect(linhaHoje?.textContent).toContain('Terça-feira');
    expect(linhaHoje?.textContent).toContain('Hoje');

    toggleBtn?.click();
    fixture.detectChanges();

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.hidden).toBe(true);
  });

  it('deve usar o WhatsappService para gerar o link do WhatsApp e exibir o telefone do WhatsappService caso a loja não tenha telefone', () => {
    fixture.componentRef.setInput('loja', {
      ...LOJA_MOCK,
      telefone: undefined,
    });
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const whatsappLink = hostEl.querySelector<HTMLAnchorElement>('.pdp-loja-header__whatsapp-btn');

    expect(whatsappLink).toBeTruthy();
    expect(whatsappLink?.getAttribute('href')).toBe('https://wa.me/5511987654321');
    expect(whatsappLink?.getAttribute('target')).toBe('_blank');
    expect(whatsappLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(component.telefoneFormatado()).toBe('(11) 98765-4321');
  });

  it('deve ocultar o botão de WhatsApp quando o WhatsappService não tiver número disponível', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PdpLojaHeader],
      providers: [
        provideRouter([]),
        { provide: ClockService, useValue: fakeClock },
        { provide: WHATSAPP_RAW_NUMBER, useValue: '' },
      ],
    }).compileComponents();

    const f = TestBed.createComponent(PdpLojaHeader);
    f.componentRef.setInput('loja', LOJA_MOCK);
    f.detectChanges();

    const hostEl = f.nativeElement as HTMLElement;
    expect(hostEl.querySelector('.pdp-loja-header__whatsapp-btn')).toBeNull();
  });

  it('deve exibir /img/logo.png na esquerda, /img/logo-entregador-point-da-pizza.png no centro e abrir o menu do usuário com Configurar e Sair', () => {
    fixture.componentRef.setInput('loja', {
      ...LOJA_MOCK,
      logoUrl: undefined,
    });
    fixture.componentRef.setInput('usuarioFotoUrl', '/img/logo.png');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const fallbackImg = hostEl.querySelector<HTMLImageElement>('.pdp-loja-header__logo-fallback');
    const centerImg = hostEl.querySelector<HTMLImageElement>('.pdp-loja-header__center-img');
    expect(fallbackImg?.getAttribute('src')).toBe('/img/logo.png');
    expect(centerImg?.getAttribute('src')).toBe('/img/logo-entregador-point-da-pizza.png');
    expect(hostEl.querySelector('.pdp-loja-header__user-img')).toBeTruthy();

    const userBtn = hostEl.querySelector<HTMLButtonElement>('.pdp-loja-header__user-btn');
    const userMenu = hostEl.querySelector<HTMLElement>('#pdp-user-menu');
    expect(userMenu?.hidden).toBe(true);

    userBtn?.click();
    fixture.detectChanges();

    expect(userMenu?.hidden).toBe(false);
    expect(userMenu?.textContent).toContain('Configurar');
    expect(userMenu?.textContent).toContain('Sair');
  });
});
