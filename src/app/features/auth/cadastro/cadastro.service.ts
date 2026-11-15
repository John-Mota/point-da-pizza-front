import { Injectable, inject } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth';
import { CadastroPayload } from '../../../shared/models';

export type CadastroErrorField = 'nome' | 'telefone' | 'email' | 'senha' | 'confirmarSenha' | 'foto';

export interface CadastroServerError {
  field?: CadastroErrorField;
  message: string;
}

export interface CadastroResponse {
  mensagem: string;
}

@Injectable({
  providedIn: 'root',
})
export class CadastroService {
  private readonly authService = inject(AuthService);
  private simulatedError: CadastroServerError | null = null;

  /**
   * Permite simular um erro de servidor (ex.: e-mail já cadastrado) em testes ou prototipação.
   */
  definirErroSimulado(error: CadastroServerError | null): void {
    this.simulatedError = error;
  }

  criarConta(payload: CadastroPayload): Observable<CadastroResponse> {
    if (this.simulatedError) {
      const err = this.simulatedError;
      return throwError(() => err).pipe(delay(800));
    }

    if (payload.email === 'jaexiste@pointdapizza.com') {
      const err: CadastroServerError = {
        field: 'email',
        message: 'Este e-mail já está cadastrado',
      };
      return throwError(() => err).pipe(delay(800));
    }

    this.authService.registrarUsuario(payload);

    return of({
      mensagem: `Conta criada com sucesso para ${payload.nome}!`,
    }).pipe(delay(800));
  }
}

