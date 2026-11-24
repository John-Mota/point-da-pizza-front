import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdpStatusBadge } from './status-badge';
import { StatusPedido } from '../../../models';

describe('PdpStatusBadge', () => {
  let fixture: ComponentFixture<PdpStatusBadge>;
  let component: PdpStatusBadge;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpStatusBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpStatusBadge);
    component = fixture.componentInstance;
  });

  const cases: Array<{ status: StatusPedido; expectedText: string; expectedClass: string }> = [
    { status: 'recebido', expectedText: 'Recebido', expectedClass: 'status-recebido' },
    { status: 'em-producao', expectedText: 'Em produção', expectedClass: 'status-em-producao' },
    { status: 'a-caminho', expectedText: 'A caminho', expectedClass: 'status-a-caminho' },
    { status: 'entregue', expectedText: 'Entregue', expectedClass: 'status-entregue' },
    { status: 'cancelado', expectedText: 'Cancelado', expectedClass: 'status-cancelado' },
  ];

  for (const { status, expectedText, expectedClass } of cases) {
    it(`deve exibir o rótulo "${expectedText}" e a classe "${expectedClass}" para o status "${status}"`, () => {
      fixture.componentRef.setInput('status', status);
      fixture.detectChanges();

      const badgeEl = fixture.nativeElement.querySelector('.pdp-status-badge');
      expect(badgeEl?.textContent.trim()).toBe(expectedText);
      expect(badgeEl?.classList.contains(expectedClass)).toBe(true);
    });
  }
});
