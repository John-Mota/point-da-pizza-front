import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CATEGORIAS_MOCK } from '../data';
import { obterIconeCategoria } from './categorias-icons.map';
import { PdpCategoriasNav } from './categorias-nav';

type ObserverCallback = IntersectionObserverCallback;

describe('PdpCategoriasNav', () => {
  let fixture: ComponentFixture<PdpCategoriasNav>;
  let component: PdpCategoriasNav;
  let observerCallback: ObserverCallback | null = null;
  let observedElements: Element[] = [];
  let originalIntersectionObserver: typeof IntersectionObserver | undefined;

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly scrollMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];

    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback;
    }

    observe = vi.fn((el: Element) => {
      observedElements.push(el);
    });

    unobserve = vi.fn();
    disconnect = vi.fn(() => {
      observedElements = [];
    });
    takeRecords = vi.fn(() => []);
  }

  beforeEach(async () => {
    observerCallback = null;
    observedElements = [];
    originalIntersectionObserver = globalThis.IntersectionObserver;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    await TestBed.configureTestingModule({
      imports: [PdpCategoriasNav],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpCategoriasNav);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    if (originalIntersectionObserver) {
      vi.stubGlobal('IntersectionObserver', originalIntersectionObserver);
    } else {
      vi.unstubAllGlobals();
    }
    vi.restoreAllMocks();
  });

  it('deve renderizar uma pílula por categoria e marcar a ativa com aria-current="true"', () => {
    fixture.componentRef.setInput('categorias', CATEGORIAS_MOCK);
    fixture.componentRef.setInput('ativaId', 'cat-tradicionais');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const botoes = Array.from(hostEl.querySelectorAll<HTMLButtonElement>('.pdp-cat-nav__pill'));

    expect(botoes.length).toBe(CATEGORIAS_MOCK.length);

    const ativa = botoes.find((btn) => btn.getAttribute('aria-current') === 'true');
    expect(ativa).toBeTruthy();
    expect(ativa?.textContent).toContain('Pizzas tradicionais');

    const inativas = botoes.filter((btn) => btn !== ativa);
    for (const btn of inativas) {
      expect(btn.getAttribute('aria-current')).toBeNull();
    }
  });

  it('deve emitir (selecionar) e atualizar a ativa ao clicar em uma pílula', () => {
    fixture.componentRef.setInput('categorias', CATEGORIAS_MOCK);
    fixture.componentRef.setInput('ativaId', CATEGORIAS_MOCK[0].id);
    fixture.detectChanges();

    const selecionadas: string[] = [];
    component.selecionar.subscribe((id) => selecionadas.push(id));

    const hostEl = fixture.nativeElement as HTMLElement;
    const botoes = hostEl.querySelectorAll<HTMLButtonElement>('.pdp-cat-nav__pill');

    // Clica na 3ª categoria (Pizzas doces)
    botoes[2].click();
    fixture.detectChanges();

    expect(selecionadas).toEqual(['cat-doces']);
    expect(component.ativaId()).toBe('cat-doces');
    expect(botoes[2].getAttribute('aria-current')).toBe('true');
    expect(botoes[0].getAttribute('aria-current')).toBeNull();
  });

  it('deve mover o foco entre as pílulas com as setas esquerda/direita e Home/End', () => {
    fixture.componentRef.setInput('categorias', CATEGORIAS_MOCK);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const botoes = Array.from(hostEl.querySelectorAll<HTMLButtonElement>('.pdp-cat-nav__pill'));

    botoes[0].focus();
    expect(document.activeElement).toBe(botoes[0]);

    // Seta direita -> vai para índice 1
    botoes[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(botoes[1]);

    // End -> vai para o último
    botoes[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(botoes[botoes.length - 1]);

    // Seta direita no último -> dá a volta para o primeiro (0)
    botoes[botoes.length - 1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    expect(document.activeElement).toBe(botoes[0]);

    // Seta esquerda no primeiro -> dá a volta para o último
    botoes[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(botoes[botoes.length - 1]);

    // Home -> volta para o primeiro (0)
    botoes[botoes.length - 1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    );
    expect(document.activeElement).toBe(botoes[0]);
  });

  it('deve atualizar a categoria ativa via scroll-spy quando o IntersectionObserver notificar interseção', () => {
    // Cria elementos de seção simulados no DOM
    const secaoTrad = document.createElement('section');
    secaoTrad.id = 'cat-tradicionais';
    const secaoBebidas = document.createElement('section');
    secaoBebidas.id = 'cat-bebidas';
    document.body.appendChild(secaoTrad);
    document.body.appendChild(secaoBebidas);

    try {
      fixture.componentRef.setInput('categorias', CATEGORIAS_MOCK);
      fixture.componentRef.setInput('ativaId', 'cat-promocoes');
      fixture.detectChanges();

      expect(observerCallback).toBeTruthy();
      expect(observedElements).toContain(secaoBebidas);

      // Dispara interseção na seção de bebidas
      observerCallback?.(
        [
          {
            isIntersecting: true,
            intersectionRatio: 0.75,
            target: secaoBebidas,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
      fixture.detectChanges();

      expect(component.ativaId()).toBe('cat-bebidas');
      const hostEl = fixture.nativeElement as HTMLElement;
      const pilulaAtiva = hostEl.querySelector('[aria-current="true"]');
      expect(pilulaAtiva?.textContent).toContain('Bebidas');
    } finally {
      secaoTrad.remove();
      secaoBebidas.remove();
    }
  });

  it('não deve renderizar a barra quando a lista de categorias estiver vazia e não estiver carregando', () => {
    fixture.componentRef.setInput('categorias', []);
    fixture.componentRef.setInput('carregando', false);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.querySelector('nav')).toBeNull();
  });

  it('deve renderizar 5 skeletons em formato de pílula quando carregando=true e mapear ícones corretamente', () => {
    fixture.componentRef.setInput('categorias', []);
    fixture.componentRef.setInput('carregando', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.querySelectorAll('.pdp-cat-nav__skeleton-pill').length).toBe(5);

    expect(obterIconeCategoria({ id: 'cat-promocoes', nome: 'Promoções' })).toBe('🔥');
    expect(obterIconeCategoria({ id: 'cat-tradicionais', nome: 'Pizzas tradicionais' })).toBe('🍕');
    expect(obterIconeCategoria({ id: 'cat-doces', nome: 'Pizzas doces' })).toBe('🍫');
    expect(obterIconeCategoria({ id: 'cat-outros', nome: 'Especialidades' })).toBe('🍽️');
  });
});
