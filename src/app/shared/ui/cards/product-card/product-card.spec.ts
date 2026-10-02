import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdpProductCard } from './product-card';
import { Produto } from '../../../models';

describe('PdpProductCard', () => {
  let fixture: ComponentFixture<PdpProductCard>;
  let component: PdpProductCard;

  const mockProduto: Produto = {
    id: 'p1',
    nome: 'Pizza Calabresa Especial',
    descricao: 'Molho de tomate artesanal, mussarela, calabresa fatiada e cebola roxa.',
    preco: 42.5,
    categoria: 'Pizzas Salgadas',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpProductCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpProductCard);
    component = fixture.componentInstance;
  });

  it('deve renderizar dados do produto e placeholder quando não houver imagem', () => {
    fixture.componentRef.setInput('produto', mockProduto);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.pdp-product-card__title');
    const descEl = fixture.nativeElement.querySelector('.pdp-product-card__desc');
    const priceEl = fixture.nativeElement.querySelector('.pdp-product-card__price');
    const placeholderEl = fixture.nativeElement.querySelector('.pdp-product-card__placeholder');

    expect(titleEl?.textContent.trim()).toBe('Pizza Calabresa Especial');
    expect(descEl?.textContent.trim()).toContain('Molho de tomate artesanal');
    expect(priceEl?.textContent.trim()).toBe('R$ 42,50');
    expect(placeholderEl).toBeTruthy();
  });

  it('deve emitir o produto no output (add) ao clicar em "Adicionar ao carrinho"', () => {
    fixture.componentRef.setInput('produto', mockProduto);
    fixture.detectChanges();

    let emittedProduct: Produto | undefined;
    component.add.subscribe((p) => (emittedProduct = p));

    const btn = fixture.nativeElement.querySelector('.pdp-product-card__action-btn') as HTMLButtonElement;
    btn.click();

    expect(emittedProduct).toEqual(mockProduto);
  });

  it('deve desabilitar o botão e exibir "Indisponível" quando indisponivel for true', () => {
    fixture.componentRef.setInput('produto', mockProduto);
    fixture.componentRef.setInput('indisponivel', true);
    fixture.detectChanges();

    let emitted = false;
    component.add.subscribe(() => (emitted = true));

    const btn = fixture.nativeElement.querySelector('.pdp-product-card__action-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent.trim()).toBe('Indisponível');

    btn.click();
    expect(emitted).toBe(false);
  });

  it('deve exibir skeletons quando loading for true', () => {
    fixture.componentRef.setInput('produto', mockProduto);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('.pdp-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.pdp-product-card__title')).toBeNull();
  });
});
