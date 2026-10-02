import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let doc: Document;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve inicializar com tema claro por padrão caso não haja preferência salva', () => {
    expect(service.theme()).toBeDefined();
    expect(doc.documentElement.getAttribute('data-theme')).toBe(service.theme());
  });

  it('deve alternar tema entre light e dark ao chamar toggleTheme', () => {
    service.setTheme('light');
    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');

    service.toggleTheme();
    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('pdp-theme')).toBe('dark');

    service.toggleTheme();
    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('pdp-theme')).toBe('light');
  });

  it('deve persistir a alteração de tema no localStorage', () => {
    service.setTheme('dark');
    expect(localStorage.getItem('pdp-theme')).toBe('dark');

    service.setTheme('light');
    expect(localStorage.getItem('pdp-theme')).toBe('light');
  });
});
