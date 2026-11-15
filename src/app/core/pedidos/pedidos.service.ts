import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import {
  DadosFinalizacaoPedido,
  ItemCarrinho,
  ItemPedidoNovo,
  PedidoCriado,
  PedidoNovo,
  StatusPedido,
} from '../../shared/models';
import { API_BASE_URL, construirUrlApi } from '../api';

export interface PedidoCriadoWire extends Omit<PedidoCriado, 'criadoEm'> {
  criadoEm: string | Date;
}

export function gerarIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const aleatorio = Math.random().toString(36).slice(2, 12);
  return `pdp-${Date.now()}-${aleatorio}`;
}

export function montarPedidoNovo(
  itensCarrinho: readonly ItemCarrinho[],
  dados: DadosFinalizacaoPedido,
  total: number
): PedidoNovo {
  const itens: ItemPedidoNovo[] = itensCarrinho.map((item) => ({
    produtoId: item.produto.id,
    nome: item.produto.nome,
    quantidade: item.quantidade,
    ...(item.tamanhoId ? { tamanhoId: item.tamanhoId } : {}),
    ...(item.tamanhoNome ? { tamanhoNome: item.tamanhoNome } : {}),
    ...(item.bordaId ? { bordaId: item.bordaId } : {}),
    ...(item.bordaNome ? { bordaNome: item.bordaNome } : {}),
    ...(item.observacao ? { observacao: item.observacao } : {}),
    precoUnitario: Number(item.precoUnitario.toFixed(2)),
    total: Number(item.total.toFixed(2)),
  }));

  return {
    clienteNome: dados.clienteNome.trim(),
    clienteTelefone: dados.clienteTelefone.trim(),
    tipoEntrega: dados.tipoEntrega,
    ...(dados.tipoEntrega === 'entrega' && dados.endereco?.trim()
      ? { endereco: dados.endereco.trim() }
      : {}),
    ...(dados.tipoEntrega === 'entrega' && dados.complemento?.trim()
      ? { complemento: dados.complemento.trim() }
      : {}),
    formaPagamento: dados.formaPagamento,
    ...(dados.formaPagamento === 'Dinheiro' && dados.trocoPara && dados.trocoPara > 0
      ? { trocoPara: Number(dados.trocoPara.toFixed(2)) }
      : {}),
    itens,
    total: Number(total.toFixed(2)),
  };
}

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly lista = signal<PedidoCriado[]>([]);

  readonly pedidos = this.lista.asReadonly();
  readonly totalPedidos = computed(() => this.lista().length);

  criarPedido(novo: PedidoNovo, idempotencyKey?: string): Observable<PedidoCriado> {
    const url = construirUrlApi(this.apiBaseUrl, '/pedidos');
    const chave = (idempotencyKey ?? '').trim() || gerarIdempotencyKey();
    const headers = new HttpHeaders({
      'Idempotency-Key': chave,
    });

    return this.http.post<PedidoCriadoWire>(url, novo, { headers }).pipe(
      map((resposta) => this.converterResposta(resposta)),
      tap((pedidoCriado) => {
        this.lista.update((atuais) => [pedidoCriado, ...atuais]);
      })
    );
  }

  atualizarStatus(id: string, status: StatusPedido): void {
    this.lista.update((atuais) => atuais.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  limpar(): void {
    this.lista.set([]);
  }

  private converterResposta(wire: PedidoCriadoWire): PedidoCriado {
    return {
      ...wire,
      criadoEm: wire.criadoEm instanceof Date ? wire.criadoEm : new Date(wire.criadoEm),
    };
  }
}

export { PedidoService as PedidosService };
