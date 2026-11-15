import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginPayload, LoginResponse, UsuarioLogado } from '../../shared/models';
import { API_BASE_URL, construirUrlApi } from '../api';
import { formatarTelefoneBr } from '../whatsapp/whatsapp.service';

export const USUARIO_LOGADO_STORAGE_KEY = 'pdp-usuario-logado';
export const AUTH_TOKEN_STORAGE_KEY = 'pdp-auth-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly redeOnline = signal<boolean>(this.lerRedeOnlineInicial());
  readonly usuario = signal<UsuarioLogado | null>(this.carregarUsuarioInicial());
  readonly token = signal<string | null>(this.carregarTokenInicial());

  /** Indica se o cliente está online (conectado e com sessão autenticada). */
  readonly estaOnline = computed<boolean>(() => this.redeOnline() && this.usuario() !== null);

  constructor() {
    if (this.isBrowser) {
      const win = this.document.defaultView;
      if (win) {
        const onOnline = () => this.redeOnline.set(true);
        const onOffline = () => this.redeOnline.set(false);
        win.addEventListener('online', onOnline);
        win.addEventListener('offline', onOffline);
        this.destroyRef.onDestroy(() => {
          win.removeEventListener('online', onOnline);
          win.removeEventListener('offline', onOffline);
        });
      }
    }
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    const url = construirUrlApi(this.apiBaseUrl, '/auth/login');
    return this.http.post<LoginResponse>(url, payload).pipe(
      tap((resposta) => {
        if (resposta.usuario) {
          this.definirSessao(resposta.usuario, resposta.token);
        } else if (resposta.token) {
          this.definirToken(resposta.token);
        }
      })
    );
  }

  obterToken(): string {
    return this.token() ?? '';
  }

  definirToken(token: string | null | undefined): void {
    const limpo = token?.trim() || null;
    this.token.set(limpo);
    if (!this.isBrowser) {
      return;
    }
    try {
      if (limpo) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, limpo);
      } else {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    } catch {
      // Ignora falhas de localStorage
    }
  }

  definirSessao(usuario: UsuarioLogado, token?: string): void {
    const normalizado: UsuarioLogado = {
      nome: usuario.nome.trim(),
      telefone: formatarTelefoneBr(usuario.telefone) || usuario.telefone.trim(),
      email: usuario.email?.trim().toLowerCase(),
      endereco: usuario.endereco.trim(),
      complemento: usuario.complemento?.trim(),
      fotoUrl: usuario.fotoUrl,
    };
    this.usuario.set(normalizado);
    this.salvarSessao(normalizado);
    if (token !== undefined) {
      this.definirToken(token);
    }
  }

  atualizarPerfil(dados: Partial<UsuarioLogado>): void {
    const atual = this.usuario();
    if (!atual) {
      return;
    }

    const atualizado: UsuarioLogado = {
      ...atual,
      ...(dados.nome?.trim() ? { nome: dados.nome.trim() } : {}),
      ...(dados.telefone?.trim() ? { telefone: dados.telefone.trim() } : {}),
      ...(dados.endereco?.trim() ? { endereco: dados.endereco.trim() } : {}),
      ...(dados.complemento !== undefined
        ? { complemento: dados.complemento.trim() || undefined }
        : {}),
    };

    this.usuario.set(atualizado);
    this.salvarSessao(atualizado);
  }

  sair(): void {
    this.usuario.set(null);
    this.token.set(null);
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.removeItem(USUARIO_LOGADO_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      // Ignora falhas de localStorage
    }
  }

  private lerRedeOnlineInicial(): boolean {
    if (!this.isBrowser) {
      return true;
    }
    const nav = this.document.defaultView?.navigator;
    return nav ? nav.onLine !== false : true;
  }

  private carregarUsuarioInicial(): UsuarioLogado | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const bruto = localStorage.getItem(USUARIO_LOGADO_STORAGE_KEY);
      if (!bruto) {
        return null;
      }
      const lido = JSON.parse(bruto) as Partial<UsuarioLogado>;
      if (lido && typeof lido.nome === 'string' && lido.nome.trim()) {
        return {
          nome: lido.nome.trim(),
          telefone: lido.telefone?.trim() ?? '',
          email: lido.email,
          endereco: lido.endereco?.trim() ?? '',
          complemento: lido.complemento,
          fotoUrl: lido.fotoUrl,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private carregarTokenInicial(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const lido = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      return lido?.trim() || null;
    } catch {
      return null;
    }
  }

  private salvarSessao(usuario: UsuarioLogado): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(USUARIO_LOGADO_STORAGE_KEY, JSON.stringify(usuario));
    } catch {
      // Ignora falhas de localStorage
    }
  }
}
