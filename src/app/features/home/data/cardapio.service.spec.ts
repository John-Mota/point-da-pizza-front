import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CardapioService } from './cardapio.service';

describe('CardapioService', () => {
  let service: CardapioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardapioService);
  });

  it('deve devolver os dados da loja Point da Pizza', async () => {
    const loja = await firstValueFrom(service.obterLoja());

    expect(loja.nome).toBe('Point da Pizza');
    expect(loja.aberta).toBe(true);
    expect(loja.formasPagamento.length).toBeGreaterThan(0);
  });

  it('deve devolver as 5 categorias ordenadas e 3 a 4 produtos por categoria', async () => {
    const categorias = await firstValueFrom(service.obterCategorias());
    const produtos = await firstValueFrom(service.obterProdutos());

    expect(categorias.map((c) => c.nome)).toEqual([
      'Promoções',
      'Pizzas tradicionais',
      'Pizzas doces',
      'Pastéis e calzones',
      'Bebidas',
    ]);

    for (const cat of categorias) {
      const daCategoria = produtos.filter((p) => p.categoriaId === cat.id);
      expect(daCategoria.length).toBeGreaterThanOrEqual(3);
      expect(daCategoria.length).toBeLessThanOrEqual(4);
    }

    const precosPromocoes = produtos
      .filter((p) => p.categoriaId === 'cat-promocoes')
      .map((p) => p.preco);
    expect(precosPromocoes).toEqual(expect.arrayContaining([62.0, 36.9, 41.9]));
  });
});

