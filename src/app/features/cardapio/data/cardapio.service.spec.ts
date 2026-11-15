import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Categoria } from '../../../shared/models';
import { PRODUTOS_MOCK } from './cardapio.mock';
import { CardapioService, montarCardapio } from './cardapio.service';

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

  it('listarCardapio omite categorias vazias e respeita a ordem das categorias e dos produtos', async () => {
    const cardapio = await firstValueFrom(service.listarCardapio());

    expect(cardapio.map((s) => s.categoria.id)).toEqual([
      'pizzas',
      'pasteis',
      'calzones',
      'bebidas',
      'combos',
      'lasanhas',
    ]);
    expect(cardapio.every((s) => s.produtos.length > 0)).toBe(true);

    const pizzasMock = PRODUTOS_MOCK.filter((p) => p.categoriaId === 'pizzas').map((p) => p.id);
    expect(cardapio[0].produtos.map((p) => p.id)).toEqual(pizzasMock);
  });

  it('montarCardapio ordena pela ordem da categoria e descarta categorias sem produtos', () => {
    const categorias: Categoria[] = [
      { id: 'b', nome: 'B', ordem: 2 },
      { id: 'vazia', nome: 'Vazia', ordem: 0 },
      { id: 'a', nome: 'A', ordem: 1 },
    ];
    const produtos = [
      { ...PRODUTOS_MOCK[0], id: 'p1', categoriaId: 'b' },
      { ...PRODUTOS_MOCK[0], id: 'p2', categoriaId: 'a' },
    ];

    const resultado = montarCardapio(categorias, produtos);
    expect(resultado.map((s) => s.categoria.id)).toEqual(['a', 'b']);
  });
});
