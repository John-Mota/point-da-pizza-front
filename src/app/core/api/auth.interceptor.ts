import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth';
import { API_BASE_URL } from './api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  const authService = inject(AuthService);

  const baseLimpa = (apiBaseUrl || '/api').replace(/\/+$/, '');
  const isApiRequest = req.url.startsWith(baseLimpa) || req.url.startsWith('/api');
  const isAuthEndpoint =
    req.url.endsWith('/auth/login') ||
    req.url.endsWith('/auth/cadastro') ||
    req.url.includes('/auth/login?') ||
    req.url.includes('/auth/cadastro?');

  if (!isApiRequest || isAuthEndpoint) {
    return next(req);
  }

  const token = authService.obterToken().trim();
  if (!token) {
    return next(req);
  }

  const clonada = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(clonada);
};
