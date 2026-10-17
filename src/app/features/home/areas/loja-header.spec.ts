import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClockService } from '../../../core/clock';
import { LOJA_MOCK } from '../data';
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
      providers: [provideRouter([]), { provide: ClockService, useValue: fakeClock }],
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
    // Terça-feira às 17:00 -> Fechado, Abre hoje às 18h
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

  it('deve abrir e fechar o painel de informações da loja com aria-expanded correto', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const toggleBtn = hostEl.querySelector<HTMLButtonElement>('.pdp-loja-header__info-toggle');
    const panel = hostEl.querySelector<HTMLElement>('#pdp-loja-info-painel');

    expect(toggleBtn).toBeTruthy();
    expect(panel).toBeTruthy();
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.hidden).toBe(true);

    // Clica para abrir
    toggleBtn?.click();
    fixture.detectChanges();

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.hidden).toBe(false);
    expect(panel?.textContent).toContain(LOJA_MOCK.endereco);

    // Verifica que Terça-feira (dia 2) está destacada como Hoje
    const linhaHoje = panel?.querySelector('.pdp-loja-header__schedule-row--today');
    expect(linhaHoje?.textContent).toContain('Terça-feira');
    expect(linhaHoje?.textContent).toContain('Hoje');

    // Clica novamente para fechar
    toggleBtn?.click();
    fixture.detectChanges();

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.hidden).toBe(true);
  });

  it('deve gerar o link do WhatsApp formatado apenas com dígitos e DDI 55 em nova aba', () => {
    fixture.componentRef.setInput('loja', {
      ...LOJA_MOCK,
      whatsapp: '(85) 98877-6655',
    });
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const whatsappLink = hostEl.querySelector<HTMLAnchorElement>('.pdp-loja-header__whatsapp-btn');

    expect(whatsappLink).toBeTruthy();
    expect(whatsappLink?.getAttribute('href')).toBe('https://wa.me/5585988776655');
    expect(whatsappLink?.getAttribute('target')).toBe('_blank');
    expect(whatsappLink?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('deve exibir "Grátis" quando a taxa de entrega for zero e logo em texto quando sem logoUrl', () => {
    fixture.componentRef.setInput('loja', {
      ...LOJA_MOCK,
      taxaEntrega: 0,
      logoUrl: undefined,
    });
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.querySelector('.pdp-loja-header__free')?.textContent?.trim()).toBe('Grátis');
    expect(hostEl.querySelector('.pdp-loja-header__logo-fallback')?.textContent).toContain(
      'POINT'
    );
  });
});

