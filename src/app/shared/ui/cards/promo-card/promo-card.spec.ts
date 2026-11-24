import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdpPromoCard } from './promo-card';
import { Promocao } from '../../../models';

describe('PdpPromoCard', () => {
  let fixture: ComponentFixture<PdpPromoCard>;
  let component: PdpPromoCard;

  const mockPromocao: Promocao = {
    id: 'pr1',
    titulo: 'Quinta da Pizza em Dobro',
    descricao: 'Peça uma pizza grande tradicional e ganhe uma média doce.',
    preco: 69.9,
    selo: 'Mais Vendida',
    diasValidos: 'Terça a Quinta',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpPromoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpPromoCard);
    component = fixture.componentInstance;
  });

  it('deve renderizar título, descrição, selo inclinado e preço formatado', () => {
    fixture.componentRef.setInput('promocao', mockPromocao);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.pdp-promo-card__title');
    const descEl = fixture.nativeElement.querySelector('.pdp-promo-card__desc');
    const badgeEl = fixture.nativeElement.querySelector('.pdp-promo-card__badge');
    const priceEl = fixture.nativeElement.querySelector('.pdp-promo-card__price');

    expect(titleEl?.textContent.trim()).toBe('Quinta da Pizza em Dobro');
    expect(descEl?.textContent.trim()).toContain('Peça uma pizza grande tradicional');
    expect(badgeEl?.textContent.trim()).toBe('Mais Vendida');
    expect(priceEl?.textContent.trim()).toBe('R$ 69,90');
  });

  it('deve emitir a promoção no output (order) ao clicar em "Pedir agora"', () => {
    fixture.componentRef.setInput('promocao', mockPromocao);
    fixture.detectChanges();

    let emittedPromo: Promocao | undefined;
    component.order.subscribe((p) => (emittedPromo = p));

    const btn = fixture.nativeElement.querySelector('.pdp-promo-card__btn') as HTMLButtonElement;
    btn.click();

    expect(emittedPromo).toEqual(mockPromocao);
  });

  it('deve exibir skeleton quando loading for true', () => {
    fixture.componentRef.setInput('promocao', mockPromocao);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('.pdp-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.pdp-promo-card__title')).toBeNull();
  });
});
