import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  CATEGORIAS_MOCK,
  COMBOS_MOCK,
  CardapioDados,
  CardapioService,
  LOJA_MOCK,
  PRODUTOS_MOCK,
  PROMOCOES_MOCK,
} from './data';
import { PdpHomePage } from './home-page';

describe('PdpHomePage', () => {
  let fixture: ComponentFixture<PdpHomePage>;
  let component: PdpHomePage;
  let cardapioService: CardapioService;

  const mockDados: CardapioDados = {
    loja: LOJA_MOCK,
    categorias: CATEGORIAS_MOCK,
    produtos: PRODUTOS_MOCK,
    promocoes: PROMOCOES_MOCK,
    combos: COMBOS_MOCK,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpHomePage],
    }).compileComponents();

    cardapioService = TestBed.inject(CardapioService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve mostrar estado de carregando primeiro e depois exibir as 5 áreas nomeadas', () => {
    const resposta$ = new Subject<CardapioDados>();
    vi.spyOn(cardapioService, 'carregarCardapio').mockReturnValue(resposta$.asObservable());

    fixture = TestBed.createComponent(PdpHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(component.carregando()).toBe(true);
    expect(hostEl.querySelector('.pdp-home__loading')).toBeTruthy();
    expect(hostEl.querySelectorAll('.pdp-skeleton').length).toBe(5);
    expect(hostEl.querySelector('.pdp-home__areas')).toBeNull();

    // Emite os dados e conclui o carregamento
    resposta$.next(mockDados);
    resposta$.complete();
    fixture.detectChanges();

    expect(component.carregando()).toBe(false);
    expect(component.erro()).toBeNull();
    expect(hostEl.querySelector('.pdp-home__loading')).toBeNull();

    const areas = Array.from(hostEl.querySelectorAll('[data-area]')).map((el) =>
      el.getAttribute('data-area')
    );
    expect(areas).toEqual([
      'loja-header',
      'categorias-nav',
      'promocoes',
      'produtos',
      'rodape',
    ]);
  });

  it('deve exibir o estado de erro e botão "Tentar de novo" quando o serviço falhar, e recarregar ao clicar', () => {
    const spy = vi
      .spyOn(cardapioService, 'carregarCardapio')
      .mockReturnValueOnce(throwError(() => new Error('Falha de rede')))
      .mockReturnValueOnce(of(mockDados));

    fixture = TestBed.createComponent(PdpHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(component.carregando()).toBe(false);
    expect(component.erro()).toBeTruthy();

    const retryBtn = hostEl.querySelector<HTMLButtonElement>('.pdp-home__retry-btn');
    expect(retryBtn).toBeTruthy();
    expect(retryBtn?.textContent).toContain('Tentar de novo');

    retryBtn?.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(2);
    expect(component.erro()).toBeNull();
    expect(hostEl.querySelector('[data-area="loja-header"]')).toBeTruthy();
  });
});

