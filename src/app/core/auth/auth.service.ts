import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CadastroPayload, UsuarioLogado } from '../../shared/models';
import { formatarTelefoneBr } from '../whatsapp/whatsapp.service';

export const USUARIO_LOGADO_STORAGE_KEY = 'pdp-usuario-logado';
export const USUARIOS_CADASTRADOS_STORAGE_KEY = 'pdp-usuarios-cadastrados';
export const AUTH_STATUS_STORAGE_KEY = 'pdp-auth-status';

export const MOCK_USUARIO_ONLINE: UsuarioLogado = {
  nome: 'Point da Pizza',
  telefone: '(85) 99999-9999',
  email: 'pointdapizza@gmail.com',
  endereco: 'Rua da Pizzaria, 123 - Centro',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly redeOnline = signal<boolean>(this.lerRedeOnlineInicial());
  readonly usuario = signal<UsuarioLogado | null>(this.carregarUsuarioInicial());

  /** Indica se o cliente está online (conectado e com sessão ativa). */
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

  registrarUsuario(payload: CadastroPayload): UsuarioLogado {
    const telefoneFormatado = payload.telefone
      ? formatarTelefoneBr(payload.telefone) || payload.telefone
      : MOCK_USUARIO_ONLINE.telefone;

    const novoUsuario: UsuarioLogado = {
      nome: payload.nome.trim(),
      telefone: telefoneFormatado,
      email: payload.email?.trim().toLowerCase(),
      endereco: payload.endereco?.trim() || MOCK_USUARIO_ONLINE.endereco,
      complemento: payload.complemento?.trim(),
    };

    const lista = this.carregarUsuariosCadastrados();
    const filtrada = lista.filter(
      (u) =>
        (novoUsuario.email ? u.email !== novoUsuario.email : true) &&
        u.telefone.replace(/\D/g, '') !== novoUsuario.telefone.replace(/\D/g, '')
    );
    this.salvarUsuariosCadastrados([novoUsuario, ...filtrada]);
    return novoUsuario;
  }

  entrar(credenciais: {
    email?: string;
    telefone?: string;
    nome?: string;
    endereco?: string;
    complemento?: string;
  }): UsuarioLogado {
    const emailLimpo = credenciais.email?.trim().toLowerCase();
    const telDigitos = (credenciais.telefone ?? '').replace(/\D/g, '');
    const cadastrados = this.carregarUsuariosCadastrados();

    const encontrado = cadastrados.find(
      (u) =>
        (emailLimpo && u.email?.toLowerCase() === emailLimpo) ||
        (telDigitos && u.telefone.replace(/\D/g, '') === telDigitos)
    );

    const usuarioAtivo: UsuarioLogado = encontrado ?? {
      nome:
        credenciais.nome?.trim() ||
        (emailLimpo && emailLimpo !== MOCK_USUARIO_ONLINE.email
          ? this.extrairNomeDeEmail(emailLimpo)
          : MOCK_USUARIO_ONLINE.nome),
      telefone: telDigitos
        ? formatarTelefoneBr(telDigitos) || credenciais.telefone!.trim()
        : MOCK_USUARIO_ONLINE.telefone,
      email: emailLimpo || MOCK_USUARIO_ONLINE.email,
      endereco: credenciais.endereco?.trim() || MOCK_USUARIO_ONLINE.endereco,
      complemento: credenciais.complemento?.trim(),
    };

    this.usuario.set(usuarioAtivo);
    this.salvarSessao(usuarioAtivo);
    return usuarioAtivo;
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
      ...(dados.complemento !== undefined ? { complemento: dados.complemento.trim() || undefined } : {}),
    };

    this.usuario.set(atualizado);
    this.salvarSessao(atualizado);
  }

  sair(): void {
    this.usuario.set(null);
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(AUTH_STATUS_STORAGE_KEY, 'offline');
      localStorage.removeItem(USUARIO_LOGADO_STORAGE_KEY);
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
      return MOCK_USUARIO_ONLINE;
    }
    try {
      const status = localStorage.getItem(AUTH_STATUS_STORAGE_KEY);
      if (status === 'offline') {
        return null;
      }

      const bruto = localStorage.getItem(USUARIO_LOGADO_STORAGE_KEY);
      if (bruto) {
        const lido = JSON.parse(bruto) as Partial<UsuarioLogado>;
        if (lido && typeof lido.nome === 'string' && lido.nome.trim()) {
          return {
            nome: lido.nome.trim(),
            telefone: lido.telefone?.trim() || MOCK_USUARIO_ONLINE.telefone,
            email: lido.email,
            endereco: lido.endereco?.trim() || MOCK_USUARIO_ONLINE.endereco,
            complemento: lido.complemento,
            fotoUrl: lido.fotoUrl,
          };
        }
      }

      return MOCK_USUARIO_ONLINE;
    } catch {
      return MOCK_USUARIO_ONLINE;
    }
  }

  private salvarSessao(usuario: UsuarioLogado): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(AUTH_STATUS_STORAGE_KEY, 'online');
      localStorage.setItem(USUARIO_LOGADO_STORAGE_KEY, JSON.stringify(usuario));
    } catch {
      // Ignora falhas de localStorage
    }
  }

  private carregarUsuariosCadastrados(): UsuarioLogado[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const bruto = localStorage.getItem(USUARIOS_CADASTRADOS_STORAGE_KEY);
      if (!bruto) {
        return [];
      }
      const lista = JSON.parse(bruto);
      return Array.isArray(lista) ? (lista as UsuarioLogado[]) : [];
    } catch {
      return [];
    }
  }

  private salvarUsuariosCadastrados(lista: UsuarioLogado[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(USUARIOS_CADASTRADOS_STORAGE_KEY, JSON.stringify(lista));
    } catch {
      // Ignora falhas de localStorage
    }
  }

  private extrairNomeDeEmail(email: string): string {
    const local = email.split('@')[0] ?? '';
    const partes = local
      .replace(/[._-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (partes.length === 0) {
      return MOCK_USUARIO_ONLINE.nome;
    }
    return partes.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
}
