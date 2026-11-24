import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, construirUrlApi } from '../../../core/api';
import { CadastroPayload } from '../../../shared/models';

export type CadastroErrorField =
  | 'nome'
  | 'telefone'
  | 'email'
  | 'senha'
  | 'confirmarSenha'
  | 'foto';

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
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  criarConta(payload: CadastroPayload): Observable<CadastroResponse> {
    const url = construirUrlApi(this.apiBaseUrl, '/auth/cadastro');
    const { foto, ...dados } = payload;

    if (foto) {
      const formData = new FormData();
      formData.append(
        'dados',
        new Blob([JSON.stringify(dados)], { type: 'application/json' }),
        'dados.json'
      );
      formData.append('foto', foto, foto.name);
      return this.http.post<CadastroResponse>(url, formData);
    }

    return this.http.post<CadastroResponse>(url, dados);
  }
}
