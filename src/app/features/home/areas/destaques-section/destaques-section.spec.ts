import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Produto } from '../../../../shared/models';
import { PRODUTOS_MOCK } from '../../data';
import {
  AUTOPLAY_INTERVAL_MS,
  PdpDestaquesSection,
  SWIPE_THRESHOLD_PX,
} from './destaques-section';

describe('PdpDestaquesSection', () => {
  let fixture: ComponentFixture<PdpDestaquesSection>;
  let component: PdpDestaquesSection;

  const cincoDestaques: Produto[] = PRODUTOS_MOCK.slice(0, 5).map((p, idx) => ({
    ...p,
    id: `dest-${idx + 1}`,
    nome: `Destaque ${idx + 1}`,
    destaque: true,
    disponivel: true,
  }));

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [PdpDestaquesSection],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function criarComponente(itens: Produto[] = cincoDestaques): void {
    fixture = TestBed.createComponent(PdpDestaquesSection);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('destaques', itens);
    fixture.detectChanges();
  }

  it('deve avançar o índice ativo a cada 5s com 5 destaques e dar a volta no último (loop infinito)', () => {
    criarComponente(cincoDestaques);

    expect(component.indiceAtivo()).toBe(0);
    const hostEl = fixture.nativeElement as HTMLElement;
    const slides = hostEl.querySelectorAll('.pdp-destaques__slide');
    expect(slides.length).toBe(5);
    expect(slides[0].classList.contains('pdp-destaques__slide--center')).toBe(true);
    expect(slides[4].classList.contains('pdp-destaques__slide--prev')).toBe(true);
    expect(slides[1].classList.contains('pdp-destaques__slide--next')).toBe(true);
    expect(slides[0].getAttribute('aria-current')).toBe('true');

    // Avança 1..4
    for (let esperado = 1; esperado <= 4; esperado++) {
      vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS);
      fixture.detectChanges();
      expect(component.indiceAtivo()).toBe(esperado);
    }

    // No último (4), mais 5s dá a volta para 0
    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS);
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(0);
    expect(hostEl.querySelector('.pdp-destaques__track')?.getAttribute('aria-live')).toBe('off');
  });

  it('deve pausar ao entrar com o mouse, ao receber foco e ao clicar no botão de pausa; retomando depois (exceto pausa manual)', () => {
    criarComponente(cincoDestaques);
    const hostEl = fixture.nativeElement as HTMLElement;
    const section = hostEl.querySelector<HTMLElement>('.pdp-destaques')!;

    // 1. Mouse enter pausa
    section.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS * 2);
    expect(component.indiceAtivo()).toBe(0);

    // Mouse leave retoma
    section.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS);
    expect(component.indiceAtivo()).toBe(1);

    // 2. Focusin pausa
    section.dispatchEvent(new FocusEvent('focusin'));
    fixture.detectChanges();
    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS * 2);
    expect(component.indiceAtivo()).toBe(1);

    // Focusout para fora retoma
    section.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));
    fixture.detectChanges();
    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS);
    expect(component.indiceAtivo()).toBe(2);

    // 3. Pausa manual (via botão caso exista ou método alternarPausaManual)
    const pauseBtn = hostEl.querySelector<HTMLButtonElement>('.pdp-destaques__pause-btn');
    if (pauseBtn) {
      expect(pauseBtn.getAttribute('aria-label')).toBe('Pausar destaques');
      pauseBtn.click();
    } else {
      component.alternarPausaManual();
    }
    fixture.detectChanges();

    expect(component.pausadoManualmente()).toBe(true);
    if (pauseBtn) {
      expect(pauseBtn.getAttribute('aria-label')).toBe('Retomar destaques');
    }

    // Mesmo entrando e saindo com o mouse, continua pausado porque foi pausa manual
    section.dispatchEvent(new MouseEvent('mouseenter'));
    section.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS * 3);
    expect(component.indiceAtivo()).toBe(2);

    // Alternar novamente retoma
    if (pauseBtn) {
      pauseBtn.click();
    } else {
      component.alternarPausaManual();
    }
    fixture.detectChanges();
    expect(component.pausadoManualmente()).toBe(false);
    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS);
    expect(component.indiceAtivo()).toBe(3);
  });

  it('deve mudar o item pelas setas, bolinhas, teclado e deslize; centralizar card lateral ao clicar e emitir (pedir) sem mover ao clicar em "Pedir"', () => {
    criarComponente(cincoDestaques);
    const hostEl = fixture.nativeElement as HTMLElement;
    const pedidos: Produto[] = [];
    component.pedir.subscribe((p) => pedidos.push(p));

    // Setas próximo e anterior
    const btnNext = hostEl.querySelector<HTMLButtonElement>('.pdp-destaques__arrow--next')!;
    const btnPrev = hostEl.querySelector<HTMLButtonElement>('.pdp-destaques__arrow--prev')!;

    btnNext.click();
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(1);
    expect(hostEl.querySelector('.pdp-destaques__track')?.getAttribute('aria-live')).toBe('polite');

    btnPrev.click();
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(0);

    // Bolinhas indicadoras
    const dots = hostEl.querySelectorAll<HTMLButtonElement>('.pdp-destaques__dot');
    expect(dots.length).toBe(5);
    dots[3].click();
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(3);
    expect(dots[3].getAttribute('aria-current')).toBe('true');

    // Clicar em um card lateral (ex.: índice 4 que é o 'next' do 3) traz para o centro sem emitir pedir
    const slides = hostEl.querySelectorAll<HTMLElement>('.pdp-destaques__slide');
    slides[4].click();
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(4);
    expect(pedidos.length).toBe(0);

    // Clicar no botão "Pedir" de um card lateral (ex.: índice 0) emite o produto e NÃO move o carrossel
    const ctaSlide0 = slides[0].querySelector<HTMLButtonElement>('.pdp-destaque-card__cta')!;
    ctaSlide0.click();
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(4);
    expect(pedidos).toEqual([cincoDestaques[0]]);

    // Teclado ArrowRight / ArrowLeft
    const section = hostEl.querySelector<HTMLElement>('.pdp-destaques')!;
    section.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(0);

    section.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(4);

    // Deslize (pointerdown + pointerup >= 40px)
    const stage = hostEl.querySelector<HTMLElement>('.pdp-destaques__stage')!;
    stage.dispatchEvent(new MouseEvent('pointerdown', { clientX: 200 }));
    stage.dispatchEvent(new MouseEvent('pointerup', { clientX: 200 - (SWIPE_THRESHOLD_PX + 10) }));
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(0);
  });

  it('deve exibir cards estáticos sem controles e sem autoplay quando houver 2 ou menos itens, e não renderizar nada com 0 itens', () => {
    // Com 2 itens
    criarComponente(cincoDestaques.slice(0, 2));
    const hostEl = fixture.nativeElement as HTMLElement;

    expect(component.ehCarrossel()).toBe(false);
    expect(hostEl.querySelectorAll('.pdp-destaques__slide--static').length).toBe(2);
    expect(hostEl.querySelector('.pdp-destaques__pause-btn')).toBeNull();
    expect(hostEl.querySelector('.pdp-destaques__arrow')).toBeNull();
    expect(hostEl.querySelector('.pdp-destaques__dots')).toBeNull();

    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS * 3);
    fixture.detectChanges();
    expect(component.indiceAtivo()).toBe(0);

    // Com 0 itens
    fixture.componentRef.setInput('destaques', []);
    fixture.detectChanges();
    expect(hostEl.querySelector('.pdp-destaques')).toBeNull();
  });

  it('deve começar pausado quando prefers-reduced-motion: reduce estiver ativo', () => {
    const matchMediaOriginal = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(
        (query: string) =>
          ({
            matches: query.includes('prefers-reduced-motion: reduce'),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as unknown as MediaQueryList
      ),
    });

    try {
      criarComponente(cincoDestaques);
      const hostEl = fixture.nativeElement as HTMLElement;

      expect(component.pausadoManualmente()).toBe(true);
      const pauseBtn = hostEl.querySelector<HTMLButtonElement>('.pdp-destaques__pause-btn');
      if (pauseBtn) {
        expect(pauseBtn.getAttribute('aria-label')).toBe('Retomar destaques');
      }

      vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS * 3);
      fixture.detectChanges();
      expect(component.indiceAtivo()).toBe(0);
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: matchMediaOriginal,
      });
    }
  });

  it('deve limpar o timer ao destruir o componente', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    criarComponente(cincoDestaques);

    fixture.destroy();
    expect(clearSpy).toHaveBeenCalled();

    const indiceAntes = component.indiceAtivo();
    vi.advanceTimersByTime(AUTOPLAY_INTERVAL_MS * 3);
    expect(component.indiceAtivo()).toBe(indiceAntes);
  });
});
