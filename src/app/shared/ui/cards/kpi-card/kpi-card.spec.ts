import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdpKpiCard } from './kpi-card';

describe('PdpKpiCard', () => {
  let fixture: ComponentFixture<PdpKpiCard>;
  let component: PdpKpiCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpKpiCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpKpiCard);
    component = fixture.componentInstance;
  });

  it('deve renderizar rótulo e valor formatado', () => {
    fixture.componentRef.setInput('rotulo', 'Faturamento Hoje');
    fixture.componentRef.setInput('valor', 'R$ 3.450,00');
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('.pdp-kpi-card__label');
    const valueEl = fixture.nativeElement.querySelector('.pdp-kpi-card__value');

    expect(labelEl?.textContent.trim()).toBe('Faturamento Hoje');
    expect(valueEl?.textContent.trim()).toBe('R$ 3.450,00');
  });

  it('deve exibir variação positiva em verde com classe correspondente', () => {
    fixture.componentRef.setInput('rotulo', 'Pedidos');
    fixture.componentRef.setInput('valor', '142');
    fixture.componentRef.setInput('variacao', 12.5);
    fixture.detectChanges();

    const badgeEl = fixture.nativeElement.querySelector('.pdp-kpi-card__badge');
    expect(badgeEl?.classList.contains('pdp-kpi-card__badge--positive')).toBe(true);
    expect(badgeEl?.textContent.trim()).toBe('+12,5%');
  });

  it('deve exibir variação negativa em vermelho com classe correspondente', () => {
    fixture.componentRef.setInput('rotulo', 'Ticket Médio');
    fixture.componentRef.setInput('valor', 'R$ 45,20');
    fixture.componentRef.setInput('variacao', -4.8);
    fixture.detectChanges();

    const badgeEl = fixture.nativeElement.querySelector('.pdp-kpi-card__badge');
    expect(badgeEl?.classList.contains('pdp-kpi-card__badge--negative')).toBe(true);
    expect(badgeEl?.textContent.trim()).toBe('-4,8%');
  });

  it('deve renderizar a barra de meta com atributos de acessibilidade quando informada', () => {
    fixture.componentRef.setInput('rotulo', 'Meta Diária');
    fixture.componentRef.setInput('valor', '85%');
    fixture.componentRef.setInput('meta', 85);
    fixture.detectChanges();

    const progressTrack = fixture.nativeElement.querySelector('.pdp-kpi-card__progress-track');
    expect(progressTrack?.getAttribute('role')).toBe('progressbar');
    expect(progressTrack?.getAttribute('aria-valuenow')).toBe('85');
    expect(progressTrack?.getAttribute('aria-valuemin')).toBe('0');
    expect(progressTrack?.getAttribute('aria-valuemax')).toBe('100');

    const progressBar = fixture.nativeElement.querySelector('.pdp-kpi-card__progress-bar');
    expect(progressBar?.style.width).toBe('85%');
  });
});
