import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { API_BASE_URL, construirUrlApi } from '../../../core/api';
import { DiaSemana, HorarioFuncionamento, Loja } from '../../../shared/models';

function formatarEnderecoObjeto(endereco: Record<string, unknown>): string {
  const rua = typeof endereco['rua'] === 'string' ? endereco['rua'].trim() : '';
  const numero = typeof endereco['numero'] === 'string' ? endereco['numero'].trim() : '';
  const bairro = typeof endereco['bairro'] === 'string' ? endereco['bairro'].trim() : '';
  const cidade = typeof endereco['cidade'] === 'string' ? endereco['cidade'].trim() : '';
  const uf = typeof endereco['uf'] === 'string' ? endereco['uf'].trim() : '';

  const parteRua = [rua, numero].filter(Boolean).join(', ');
  const parteCidade = [cidade, uf].filter(Boolean).join('/');
  const parteBairroCidade = [bairro, parteCidade].filter(Boolean).join(', ');

  return [parteRua, parteBairroCidade].filter(Boolean).join(' - ');
}

export function normalizarLoja(bruto: unknown): Loja {
  const obj = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>;

  let endereco = '';
  if (typeof obj['endereco'] === 'string') {
    endereco = obj['endereco'].trim();
  } else if (obj['endereco'] && typeof obj['endereco'] === 'object') {
    endereco = formatarEnderecoObjeto(obj['endereco'] as Record<string, unknown>);
  }

  const horariosBrutos = Array.isArray(obj['horarios']) ? obj['horarios'] : [];
  const horarios: HorarioFuncionamento[] = horariosBrutos
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .filter((item) => item['fechado'] !== true)
    .map((item) => {
      const diaBruto = Number(item['dia'] ?? item['diaSemana'] ?? 0);
      const dia = (Number.isInteger(diaBruto) && diaBruto >= 0 && diaBruto <= 6
        ? diaBruto
        : 0) as DiaSemana;
      const abre = String(item['abre'] ?? item['abertura'] ?? '18:00').slice(0, 5);
      const fecha = String(item['fecha'] ?? item['fechamento'] ?? '23:30').slice(0, 5);
      return { dia, abre, fecha };
    });

  const pagamentosBrutos = Array.isArray(obj['formasPagamento']) ? obj['formasPagamento'] : [];
  const formasPagamento: string[] = pagamentosBrutos
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }
      if (item && typeof item === 'object') {
        const reg = item as Record<string, unknown>;
        return String(reg['descricao'] ?? reg['nome'] ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);

  const aberta =
    typeof obj['aberta'] === 'boolean'
      ? obj['aberta']
      : typeof obj['aceitaPedidos'] === 'boolean'
        ? obj['aceitaPedidos']
        : true;

  return {
    nome: typeof obj['nome'] === 'string' && obj['nome'].trim() ? obj['nome'].trim() : 'Point da Pizza',
    slogan: typeof obj['slogan'] === 'string' ? obj['slogan'].trim() : '',
    ...(typeof obj['logoUrl'] === 'string' && obj['logoUrl'].trim()
      ? { logoUrl: obj['logoUrl'].trim() }
      : {}),
    ...(typeof obj['capaUrl'] === 'string' && obj['capaUrl'].trim()
      ? { capaUrl: obj['capaUrl'].trim() }
      : {}),
    aberta,
    horarios,
    endereco,
    ...(typeof obj['telefone'] === 'string' && obj['telefone'].trim()
      ? { telefone: obj['telefone'].trim() }
      : {}),
    formasPagamento,
  };
}

@Injectable({
  providedIn: 'root',
})
export class LojaService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private cacheLoja$?: Observable<Loja>;

  obterLoja(): Observable<Loja> {
    if (!this.cacheLoja$) {
      const url = construirUrlApi(this.apiBaseUrl, '/loja');
      this.cacheLoja$ = this.http.get<unknown>(url).pipe(
        map((resposta) => normalizarLoja(resposta)),
        catchError((erro: unknown) => {
          this.cacheLoja$ = undefined;
          return throwError(() => erro);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.cacheLoja$;
  }

  invalidarCache(): void {
    this.cacheLoja$ = undefined;
  }
}
