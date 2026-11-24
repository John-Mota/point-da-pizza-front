import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdpOrderCard } from './order-card';
import { Pedido } from '../../../models';

describe('PdpOrderCard', () => {
  let fixture: ComponentFixture<PdpOrderCard>;
  let component: PdpOrderCard;

  const mockPedido: Pedido = {
    id: 'ord-101',
    numero: '101',
    cliente: 'Maria Oliveira',
    itens: [
      { nome: 'Pizza Portuguesa G', quantidade: 1, opcoes: ['Borda Requeijão'] },
      { nome: 'Guaraná 2L', quantidade: 1 },
    ],
    total: 68.0,
    status: 'recebido',
    criadoEm: new Date(Date.now() - 1000 * 60 * 12), // 12 minutos atrás
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpOrderCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpOrderCard);
    component = fixture.componentInstance;
  });

  it('deve renderizar número do pedido, cliente, itens, tempo relativo e total formatado', () => {
    fixture.componentRef.setInput('pedido', mockPedido);
    fixture.detectChanges();

    const numberEl = fixture.nativeElement.querySelector('.pdp-order-card__number');
    const clientEl = fixture.nativeElement.querySelector('.pdp-order-card__client-name');
    const timeEl = fixture.nativeElement.querySelector('.pdp-order-card__time');
    const items = fixture.nativeElement.querySelectorAll('.pdp-order-card__item');
    const totalEl = fixture.nativeElement.querySelector('.pdp-order-card__total-value');
    const advanceBtn = fixture.nativeElement.querySelector('.pdp-order-card__btn--advance');

    expect(numberEl?.textContent.trim()).toBe('Pedido #101');
    expect(clientEl?.textContent.trim()).toBe('Maria Oliveira');
    expect(timeEl?.textContent.trim()).toBe('há 12 min');
    expect(items.length).toBe(2);
    expect(totalEl?.textContent.trim()).toBe('R$ 68,00');
    expect(advanceBtn?.textContent.trim()).toBe('Iniciar produção');
  });

  it('deve alterar o rótulo do botão de avançar de acordo com o status', () => {
    fixture.componentRef.setInput('pedido', { ...mockPedido, status: 'em-producao' });
    fixture.detectChanges();
    let advanceBtn = fixture.nativeElement.querySelector('.pdp-order-card__btn--advance');
    expect(advanceBtn?.textContent.trim()).toBe('Enviar para entrega');

    fixture.componentRef.setInput('pedido', { ...mockPedido, status: 'a-caminho' });
    fixture.detectChanges();
    advanceBtn = fixture.nativeElement.querySelector('.pdp-order-card__btn--advance');
    expect(advanceBtn?.textContent.trim()).toBe('Concluir entrega');
  });

  it('não deve exibir o botão de avançar quando status for entregue ou cancelado', () => {
    fixture.componentRef.setInput('pedido', { ...mockPedido, status: 'entregue' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pdp-order-card__btn--advance')).toBeNull();

    fixture.componentRef.setInput('pedido', { ...mockPedido, status: 'cancelado' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pdp-order-card__btn--advance')).toBeNull();
  });

  it('deve emitir os outputs corretos ao clicar em "Ver detalhes" e no botão de avançar', () => {
    fixture.componentRef.setInput('pedido', mockPedido);
    fixture.detectChanges();

    let detailsEmitted: Pedido | undefined;
    let advanceEmitted: Pedido | undefined;

    component.details.subscribe((p) => (detailsEmitted = p));
    component.advance.subscribe((p) => (advanceEmitted = p));

    const ghostBtn = fixture.nativeElement.querySelector('.pdp-order-card__btn--ghost') as HTMLButtonElement;
    ghostBtn.click();
    expect(detailsEmitted).toEqual(mockPedido);

    const advanceBtn = fixture.nativeElement.querySelector('.pdp-order-card__btn--advance') as HTMLButtonElement;
    advanceBtn.click();
    expect(advanceEmitted).toEqual(mockPedido);
  });
});
