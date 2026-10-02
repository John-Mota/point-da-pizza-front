import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdpCartSummaryCard } from './cart-summary-card';

describe('PdpCartSummaryCard', () => {
  let fixture: ComponentFixture<PdpCartSummaryCard>;
  let component: PdpCartSummaryCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpCartSummaryCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpCartSummaryCard);
    component = fixture.componentInstance;
  });

  it('deve calcular o total corretamente sem desconto e exibir valores', () => {
    fixture.componentRef.setInput('subtotal', 80.0);
    fixture.componentRef.setInput('taxaEntrega', 7.5);
    fixture.componentRef.setInput('desconto', 0);
    fixture.detectChanges();

    const discountRow = fixture.nativeElement.querySelector('.pdp-cart-summary__row--discount');
    const totalEl = fixture.nativeElement.querySelector('.pdp-cart-summary__value-total');

    expect(discountRow).toBeNull();
    expect(totalEl?.textContent.trim()).toBe('R$ 87,50');
  });

  it('deve exibir a linha de desconto e abater do total quando desconto > 0', () => {
    fixture.componentRef.setInput('subtotal', 80.0);
    fixture.componentRef.setInput('taxaEntrega', 7.5);
    fixture.componentRef.setInput('desconto', 10.0);
    fixture.detectChanges();

    const discountRow = fixture.nativeElement.querySelector('.pdp-cart-summary__row--discount');
    const totalEl = fixture.nativeElement.querySelector('.pdp-cart-summary__value-total');

    expect(discountRow).toBeTruthy();
    expect(discountRow?.textContent).toContain('- R$ 10,00');
    expect(totalEl?.textContent.trim()).toBe('R$ 77,50');
  });

  it('deve emitir o evento checkout ao clicar no botão CTA', () => {
    fixture.componentRef.setInput('subtotal', 50.0);
    fixture.componentRef.setInput('taxaEntrega', 5.0);
    fixture.detectChanges();

    let checkoutCalled = false;
    component.checkout.subscribe(() => (checkoutCalled = true));

    const btn = fixture.nativeElement.querySelector('.pdp-cart-summary__btn') as HTMLButtonElement;
    btn.click();

    expect(checkoutCalled).toBe(true);
  });

  it('deve desabilitar o botão quando desabilitado for true', () => {
    fixture.componentRef.setInput('subtotal', 0);
    fixture.componentRef.setInput('taxaEntrega', 0);
    fixture.componentRef.setInput('desabilitado', true);
    fixture.detectChanges();

    let checkoutCalled = false;
    component.checkout.subscribe(() => (checkoutCalled = true));

    const btn = fixture.nativeElement.querySelector('.pdp-cart-summary__btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    btn.click();
    expect(checkoutCalled).toBe(false);
  });
});
