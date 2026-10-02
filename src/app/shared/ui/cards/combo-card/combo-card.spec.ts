import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdpComboCard } from './combo-card';
import { Combo } from '../../../models';

describe('PdpComboCard', () => {
  let fixture: ComponentFixture<PdpComboCard>;
  let component: PdpComboCard;

  const mockCombo: Combo = {
    id: 'c1',
    titulo: 'Combo Família Feliz',
    itens: ['1 Pizza Grande', '1 Refrigerante 2L', '1 Borda Recheada'],
    preco: 79.9,
    precoOriginal: 99.9,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpComboCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpComboCard);
    component = fixture.componentInstance;
  });

  it('deve renderizar título, lista de itens, preço original riscado e economia calculada', () => {
    fixture.componentRef.setInput('combo', mockCombo);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.pdp-combo-card__title');
    const items = fixture.nativeElement.querySelectorAll('.pdp-combo-card__item');
    const originalPriceEl = fixture.nativeElement.querySelector('.pdp-combo-card__price-original');
    const currentPriceEl = fixture.nativeElement.querySelector('.pdp-combo-card__price-current');
    const savingsEl = fixture.nativeElement.querySelector('.pdp-combo-card__savings');

    expect(titleEl?.textContent.trim()).toBe('Combo Família Feliz');
    expect(items.length).toBe(3);
    expect(originalPriceEl?.textContent.trim()).toBe('De R$ 99,90');
    expect(currentPriceEl?.textContent.trim()).toBe('R$ 79,90');
    expect(savingsEl?.textContent.trim()).toBe('Você economiza R$ 20,00');
  });

  it('não deve exibir preço original nem economia se precoOriginal não for informado', () => {
    const comboSemDesconto: Combo = {
      id: 'c2',
      titulo: 'Combo Individual',
      itens: ['1 Broto', '1 Lata'],
      preco: 35.0,
    };

    fixture.componentRef.setInput('combo', comboSemDesconto);
    fixture.detectChanges();

    const originalPriceEl = fixture.nativeElement.querySelector('.pdp-combo-card__price-original');
    const savingsEl = fixture.nativeElement.querySelector('.pdp-combo-card__savings');

    expect(originalPriceEl).toBeNull();
    expect(savingsEl).toBeNull();
  });

  it('deve emitir o combo no output (choose) ao clicar no botão', () => {
    fixture.componentRef.setInput('combo', mockCombo);
    fixture.detectChanges();

    let emittedCombo: Combo | undefined;
    component.choose.subscribe((c) => (emittedCombo = c));

    const btn = fixture.nativeElement.querySelector('.pdp-combo-card__btn') as HTMLButtonElement;
    btn.click();

    expect(emittedCombo).toEqual(mockCombo);
  });
});
