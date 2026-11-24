import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Styleguide } from './styleguide';
import { ThemeService } from '../../core/theme';

describe('Styleguide', () => {
  let fixture: ComponentFixture<Styleguide>;
  let component: Styleguide;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Styleguide],
      providers: [ThemeService],
    }).compileComponents();

    fixture = TestBed.createComponent(Styleguide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar e renderizar a página do styleguide com título e seções', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.styleguide__title')?.textContent).toContain('Point da Pizza');
    expect(compiled.querySelectorAll('.styleguide__section').length).toBe(8);
  });

  it('deve atualizar o lastAction ao disparar ações nos cards', () => {
    component.onActionTriggered('Teste de ação executada');
    fixture.detectChanges();

    const statusVal = fixture.nativeElement.querySelector('.styleguide__status-val');
    expect(statusVal?.textContent.trim()).toBe('Teste de ação executada');
  });
});
