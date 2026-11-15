import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_RETRY_DELAY_MS, ApiError, errorInterceptor } from '../../../core/api';
import { Categoria } from '../../../shared/models';
import { criarLoja, criarProduto, criarSecoesCardapioPadrao } from '../../../testing';
import { CardapioService, montarCardapio } from './cardapio.service';
import { LojaService } from './loja.service';

describe('LojaService & CardapioService', () => {
  let cardapioService: CardapioService;
  let lojaService: LojaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_RETRY_DELAY_MS, useValue: 1 },
      ],
    });

    cardapioService = TestBed.inject(CardapioService);
    lojaService = TestBed.inject(LojaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('LojaService deve buscar GET /api/loja e compartilhar o cache entre consumidores', async () => {
    const lojaEsperada = criarLoja();

    const p1 = firstValueFrom(lojaService.obterLoja());
    const p2 = firstValueFrom(cardapioService.obterLoja());

    const reqs = httpMock.match('/api/loja');
    expect(reqs.length).toBe(1);
    expect(reqs[0].request.method).toBe('GET');
    reqs[0].flush(lojaEsperada);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(lojaEsperada);
    expect(r2).toEqual(lojaEsperada);
  });

  it('CardapioService deve realizar UMA única requisição GET /api/cardapio para listarCardapio, listarDestaques, obterCategorias e obterProdutos', async () => {
    const secoes = criarSecoesCardapioPadrao();

    const pCardapio = firstValueFrom(cardapioService.listarCardapio());
    const pDestaques = firstValueFrom(cardapioService.listarDestaques());
    const pCategorias = firstValueFrom(cardapioService.obterCategorias());
    const pProdutos = firstValueFrom(cardapioService.obterProdutos());

    const reqs = httpMock.match('/api/cardapio');
    expect(reqs.length).toBe(1);
    expect(reqs[0].request.method).toBe('GET');
    reqs[0].flush(secoes);

    const [cardapio, destaques, categorias, produtos] = await Promise.all([
      pCardapio,
      pDestaques,
      pCategorias,
      pProdutos,
    ]);

    expect(cardapio.map((s) => s.categoria.id)).toEqual(['pizzas', 'bebidas', 'combos']);
    expect(destaques.map((d) => d.id)).toEqual(['prod-trad-1', 'prod-trad-2', 'prod-combo-1']);
    expect(categorias.map((c) => c.id)).toEqual(['pizzas', 'bebidas', 'combos']);
    expect(produtos.length).toBe(4);
  });

  it('deve fazer 1 retry automático em GET /api/cardapio quando a primeira tentativa falhar', async () => {
    const secoes = criarSecoesCardapioPadrao();
    const promessa = firstValueFrom(cardapioService.listarCardapio());

    const req1 = httpMock.expectOne('/api/cardapio');
    req1.flush(null, { status: 503, statusText: 'Service Unavailable' });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const req2 = httpMock.expectOne('/api/cardapio');
    req2.flush(secoes);

    const resultado = await promessa;
    expect(resultado.length).toBe(3);
  });

  it('deve propagar ApiError quando GET /api/cardapio falhar na tentativa inicial e no retry', async () => {
    const promessa = firstValueFrom(cardapioService.listarCardapio());

    const req1 = httpMock.expectOne('/api/cardapio');
    req1.error(new ProgressEvent('error'));

    await new Promise((resolve) => setTimeout(resolve, 10));

    const req2 = httpMock.expectOne('/api/cardapio');
    req2.error(new ProgressEvent('error'));

    await expect(promessa).rejects.toEqual({
      status: 0,
      mensagem: 'Não foi possível conectar ao servidor',
    } satisfies ApiError);
  });

  it('montarCardapio ordena pela ordem da categoria e descarta categorias sem produtos', () => {
    const categorias: Categoria[] = [
      { id: 'b', nome: 'B', ordem: 2 },
      { id: 'vazia', nome: 'Vazia', ordem: 0 },
      { id: 'a', nome: 'A', ordem: 1 },
    ];
    const produtos = [
      criarProduto({ id: 'p1', categoriaId: 'b' }),
      criarProduto({ id: 'p2', categoriaId: 'a' }),
    ];

    const resultado = montarCardapio(categorias, produtos);
    expect(resultado.map((s) => s.categoria.id)).toEqual(['a', 'b']);
  });
});
