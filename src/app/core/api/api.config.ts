import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

export const API_TIMEOUT_MS = new InjectionToken<number>('API_TIMEOUT_MS', {
  providedIn: 'root',
  factory: () => 15_000,
});

export const API_RETRY_DELAY_MS = new InjectionToken<number>('API_RETRY_DELAY_MS', {
  providedIn: 'root',
  factory: () => 500,
});

export function construirUrlApi(baseUrl: string, caminho: string): string {
  const baseLimpa = (baseUrl || '/api').replace(/\/+$/, '');
  const caminhoLimpo = caminho.startsWith('/') ? caminho : `/${caminho}`;
  return `${baseLimpa}${caminhoLimpo}`;
}
