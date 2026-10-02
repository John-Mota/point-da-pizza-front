import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageKey = 'pdp-theme';

  readonly theme = signal<Theme>(this.getInitialTheme());
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    this.applyThemeToDocument(this.theme());

    if (this.isBrowser && typeof window !== 'undefined' && window.matchMedia) {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener?.('change', (e) => {
          if (!this.getStoredTheme()) {
            this.setTheme(e.matches ? 'dark' : 'light', false);
          }
        });
      } catch {
        // Fallback para navegadores sem suporte a matchMedia listener
      }
    }
  }

  setTheme(newTheme: Theme, persist = true): void {
    this.theme.set(newTheme);
    this.applyThemeToDocument(newTheme);

    if (persist && this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, newTheme);
      } catch {
        // Storage bloqueado em modo anônimo
      }
    }
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme, true);
  }

  private getInitialTheme(): Theme {
    if (!this.isBrowser) {
      return 'light';
    }

    const stored = this.getStoredTheme();
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    try {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Ignora erro de avaliação de media query
    }

    return 'light';
  }

  private getStoredTheme(): string | null {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  private applyThemeToDocument(theme: Theme): void {
    try {
      const root = this.document?.documentElement;
      if (root) {
        root.setAttribute('data-theme', theme);
      }
    } catch {
      // Manipulação fora do DOM
    }
  }
}
