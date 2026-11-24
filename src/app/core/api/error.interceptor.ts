import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TimeoutError, catchError, retry, tap, throwError, timeout, timer } from 'rxjs';
import { AuthService } from '../auth';
import { ApiCampoErro, ApiError, isApiError } from './api-error.model';
import { API_RETRY_DELAY_MS, API_TIMEOUT_MS } from './api.config';

export function mapearErroHttp(erro: unknown): ApiError {
  if (isApiError(erro)) {
    return erro;
  }

  if (erro instanceof TimeoutError) {
    return {
      status: 408,
      mensagem: 'O servidor demorou para responder. Tente novamente.',
    };
  }

  if (erro instanceof HttpErrorResponse) {
    const corpo = erro.error;
    const camposExtraidos = extrairCamposErro(corpo);
    const mensagemCorpo =
      corpo && typeof corpo === 'object' && typeof corpo.mensagem === 'string'
        ? corpo.mensagem.trim()
        : '';

    if (erro.status === 0) {
      return {
        status: 0,
        mensagem: 'Não foi possível conectar ao servidor',
      };
    }

    if (erro.status === 408 || erro.status === 504) {
      return {
        status: erro.status,
        mensagem: mensagemCorpo || 'O servidor demorou para responder. Tente novamente.',
        ...(camposExtraidos ? { campos: camposExtraidos } : {}),
      };
    }

    if (erro.status === 404) {
      return {
        status: 404,
        mensagem: mensagemCorpo || 'Recurso não encontrado.',
        ...(camposExtraidos ? { campos: camposExtraidos } : {}),
      };
    }

    if (erro.status >= 500) {
      return {
        status: erro.status,
        mensagem: mensagemCorpo || 'Erro interno no servidor. Tente novamente em instantes.',
        ...(camposExtraidos ? { campos: camposExtraidos } : {}),
      };
    }

    return {
      status: erro.status,
      mensagem: mensagemCorpo || 'Não foi possível concluir a solicitação.',
      ...(camposExtraidos ? { campos: camposExtraidos } : {}),
    };
  }

  return {
    status: 0,
    mensagem: 'Não foi possível conectar ao servidor',
  };
}

function extrairCamposErro(corpo: unknown): ApiCampoErro[] | undefined {
  if (!corpo || typeof corpo !== 'object') {
    return undefined;
  }
  const lista = (corpo as { campos?: unknown }).campos;
  if (!Array.isArray(lista)) {
    return undefined;
  }
  const validos = lista.filter(
    (item): item is ApiCampoErro =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as ApiCampoErro).campo === 'string' &&
      typeof (item as ApiCampoErro).mensagem === 'string'
  );
  return validos.length > 0 ? validos : undefined;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const timeoutMs = inject(API_TIMEOUT_MS);
  const retryDelayMs = inject(API_RETRY_DELAY_MS);
  const authService = inject(AuthService);
  const ehGetIdempotente = req.method.toUpperCase() === 'GET';
  const ehLogin = req.url.endsWith('/auth/login') || req.url.includes('/auth/login?');

  const fluxo$ = next(req).pipe(
    timeout(timeoutMs),
    tap({
      error: (erro: unknown) => {
        if (!ehLogin && erro instanceof HttpErrorResponse && erro.status === 401) {
          authService.sair();
        }
      },
    })
  );

  const comRetry$ = ehGetIdempotente
    ? fluxo$.pipe(
        retry({
          count: 1,
          delay: () => timer(retryDelayMs),
        })
      )
    : fluxo$;

  return comRetry$.pipe(
    catchError((erro: unknown) => {
      const apiError = mapearErroHttp(erro);
      return throwError(() => apiError);
    })
  );
};
