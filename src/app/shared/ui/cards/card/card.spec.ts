import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardPadding, CardVariant, PdpCard } from './card';

@Component({
  standalone: true,
  imports: [PdpCard],
  template: `
    <pdp-card [variant]="variant()" [interactive]="interactive()" [padding]="padding()">
      <div card-media>Media Content</div>
      <div card-header>Header Content</div>
      <p>Body Content</p>
      <div card-footer>Footer Content</div>
    </pdp-card>
  `,
})
class TestHostComponent {
  readonly variant = signal<CardVariant>('default');
  readonly interactive = signal(false);
  readonly padding = signal<CardPadding>('md');
}

describe('PdpCard', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, PdpCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve renderizar o card e projetar slots de media, header, body e footer', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Media Content');
    expect(el.textContent).toContain('Header Content');
    expect(el.textContent).toContain('Body Content');
    expect(el.textContent).toContain('Footer Content');
  });

  it('deve aplicar as classes corretas de variante', () => {
    const cardEl = fixture.nativeElement.querySelector('.pdp-card') as HTMLElement;
    expect(cardEl.classList.contains('pdp-card--default')).toBe(true);

    host.variant.set('promo');
    fixture.detectChanges();
    expect(cardEl.classList.contains('pdp-card--promo')).toBe(true);

    host.variant.set('outlined');
    fixture.detectChanges();
    expect(cardEl.classList.contains('pdp-card--outlined')).toBe(true);
  });

  it('deve aplicar classe e tabindex interativos quando interactive for true', () => {
    const cardEl = fixture.nativeElement.querySelector('.pdp-card') as HTMLElement;
    expect(cardEl.getAttribute('tabindex')).toBeNull();
    expect(cardEl.classList.contains('pdp-card--interactive')).toBe(false);

    host.interactive.set(true);
    fixture.detectChanges();
    expect(cardEl.getAttribute('tabindex')).toBe('0');
    expect(cardEl.classList.contains('pdp-card--interactive')).toBe(true);
  });
});
