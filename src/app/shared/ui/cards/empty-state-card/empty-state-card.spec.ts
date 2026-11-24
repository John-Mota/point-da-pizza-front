import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdpEmptyStateCard } from './empty-state-card';

describe('PdpEmptyStateCard', () => {
  let fixture: ComponentFixture<PdpEmptyStateCard>;
  let component: PdpEmptyStateCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpEmptyStateCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpEmptyStateCard);
    component = fixture.componentInstance;
  });

  it('deve renderizar ícone, título, texto e botão de ação quando informado', () => {
    fixture.componentRef.setInput('icone', '🍕');
    fixture.componentRef.setInput('titulo', 'Seu carrinho está vazio');
    fixture.componentRef.setInput('texto', 'Que tal adicionar uma pizza quentinha hoje?');
    fixture.componentRef.setInput('acaoLabel', 'Ver cardápio');
    fixture.detectChanges();

    const iconEl = fixture.nativeElement.querySelector('.pdp-empty-state-card__icon');
    const titleEl = fixture.nativeElement.querySelector('.pdp-empty-state-card__title');
    const textEl = fixture.nativeElement.querySelector('.pdp-empty-state-card__text');
    const btnEl = fixture.nativeElement.querySelector('.pdp-empty-state-card__btn');

    expect(iconEl?.textContent.trim()).toBe('🍕');
    expect(titleEl?.textContent.trim()).toBe('Seu carrinho está vazio');
    expect(textEl?.textContent.trim()).toBe('Que tal adicionar uma pizza quentinha hoje?');
    expect(btnEl?.textContent.trim()).toBe('Ver cardápio');
  });

  it('não deve renderizar botão se acaoLabel não for fornecido', () => {
    fixture.componentRef.setInput('titulo', 'Nenhum pedido encontrado');
    fixture.componentRef.setInput('texto', 'Não há pedidos neste status no momento.');
    fixture.detectChanges();

    const btnEl = fixture.nativeElement.querySelector('.pdp-empty-state-card__btn');
    expect(btnEl).toBeNull();
  });

  it('deve emitir o evento action ao clicar no botão', () => {
    fixture.componentRef.setInput('titulo', 'Carrinho vazio');
    fixture.componentRef.setInput('texto', 'Adicione itens');
    fixture.componentRef.setInput('acaoLabel', 'Explorar');
    fixture.detectChanges();

    let actionCalled = false;
    component.action.subscribe(() => (actionCalled = true));

    const btn = fixture.nativeElement.querySelector('.pdp-empty-state-card__btn') as HTMLButtonElement;
    btn.click();

    expect(actionCalled).toBe(true);
  });
});
