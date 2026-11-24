import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Loja, SecaoCardapio } from '../../../shared/models';
import { criarLoja, criarSecoesCardapioPadrao } from '../../../testing';
import { CardapioService } from '../data/cardapio.service';
import { LojaService } from '../data/loja.service';
import { PdpCardapioPage } from './cardapio-page';

describe('PdpCardapioPage', () => {
  let fixture: ComponentFixture<PdpCardapioPage>;
  let component: PdpCardapioPage;
  let cardapioService: CardapioService;
  let lojaService: LojaService;

  const lojaFixture: Loja = criarLoja();
  const secoesFixture: SecaoCardapio[] = criarSecoesCardapioPadrao();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpCardapioPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    cardapioService = TestBed.inject(CardapioService);
    lojaService = TestBed.inject(LojaService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve mostrar estado de carregando primeiro e depois exibir as 5 áreas nomeadas', () => {
    const cardapio$ = new Subject<SecaoCardapio[]>();
    vi.spyOn(lojaService, 'obterLoja').mockReturnValue(of(lojaFixture));
    vi.spyOn(cardapioService, 'listarCardapio').mockReturnValue(cardapio$.asObservable());

    fixture = TestBed.createComponent(PdpCardapioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(component.carregando()).toBe(true);
    expect(hostEl.querySelector('.pdp-home__loading')).toBeTruthy();
    expect(hostEl.querySelectorAll('.pdp-skeleton').length).toBe(4);
    expect(hostEl.querySelectorAll('.pdp-produtos-lista__sk-item').length).toBe(6);
    expect(hostEl.querySelector('.pdp-home__areas')).toBeNull();

    cardapio$.next(secoesFixture);
    cardapio$.complete();
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

  it('a barra de categorias e a lista mostram exatamente as mesmas categorias (mais a pílula Destaque)', () => {
    vi.spyOn(lojaService, 'obterLoja').mockReturnValue(of(lojaFixture));
    vi.spyOn(cardapioService, 'listarCardapio').mockReturnValue(of(secoesFixture));

    fixture = TestBed.createComponent(PdpCardapioPage);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const pilulas = Array.from(hostEl.querySelectorAll('.pdp-cat-nav__pill')).map((b) =>
      b.getAttribute('data-cat-id')
    );
    const secoes = Array.from(hostEl.querySelectorAll('pdp-produtos-lista section')).map((s) =>
      s.id.replace(/^cat-/, '')
    );

    expect(pilulas[0]).toBe('destaque');
    expect(hostEl.querySelector('#cat-destaque')).toBeTruthy();
    expect(pilulas.slice(1)).toEqual(secoes);
  });

  it('abrir pelo "Pedir" da lista e do carrossel mostra o mesmo detalhe com o produto certo', () => {
    vi.spyOn(lojaService, 'obterLoja').mockReturnValue(of(lojaFixture));
    vi.spyOn(cardapioService, 'listarCardapio').mockReturnValue(of(secoesFixture));

    fixture = TestBed.createComponent(PdpCardapioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;

    const btnDestaque = hostEl.querySelector<HTMLButtonElement>('.pdp-destaque-card__cta')!;
    btnDestaque.click();
    fixture.detectChanges();

    const tituloModal1 = hostEl.querySelector('#pdp-detalhe-titulo')?.textContent?.trim();
    expect(tituloModal1).toBe(component.destaques()[0].nome);

    hostEl.querySelector<HTMLButtonElement>('.pdp-detalhe__fechar')!.click();
    fixture.detectChanges();
    expect(hostEl.querySelector('#pdp-detalhe-titulo')).toBeNull();

    const btnLista = hostEl.querySelector<HTMLButtonElement>('.pdp-produto-item__cta')!;
    btnLista.click();
    fixture.detectChanges();

    const tituloModal2 = hostEl.querySelector('#pdp-detalhe-titulo')?.textContent?.trim();
    expect(tituloModal2).toBe(component.cardapio()[0].produtos[0].nome);

    const radiosTamanho = hostEl.querySelectorAll<HTMLButtonElement>(
      '[aria-labelledby="pdp-detalhe-label-tamanho"] [role="radio"]'
    );
    if (radiosTamanho.length > 0) {
      radiosTamanho[0].click();
      fixture.detectChanges();
    }
    hostEl.querySelector<HTMLButtonElement>('.pdp-detalhe__confirmar')!.click();
    fixture.detectChanges();

    expect(hostEl.querySelector('.pdp-carrinho-barra__btn')).toBeTruthy();
  });

  it('deve exibir o estado de erro e botão "Tentar de novo" quando o serviço falhar, e recarregar ao clicar', () => {
    vi.spyOn(lojaService, 'obterLoja').mockReturnValue(of(lojaFixture));
    const spy = vi
      .spyOn(cardapioService, 'listarCardapio')
      .mockReturnValueOnce(throwError(() => new Error('Falha de rede')))
      .mockReturnValueOnce(of(secoesFixture));

    fixture = TestBed.createComponent(PdpCardapioPage);
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
