import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import {
  DadosFinalizacaoPedido,
  ItemCarrinho,
  ItemPedido,
  Pedido,
  StatusPedido,
} from '../../shared/models';

export const PEDIDOS_STORAGE_KEY = 'pdp-pedidos';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly lista = signal<Pedido[]>(this.carregarInicial());

  readonly pedidos = this.lista.asReadonly();
  readonly totalPedidos = computed(() => this.lista().length);

  registrarPedido(
    itensCarrinho: readonly ItemCarrinho[],
    dados: DadosFinalizacaoPedido,
    total: number
  ): Pedido {
    const proximoNumero = 101 + this.lista().length;
    const numeroStr = `#${proximoNumero}`;
    const itens: ItemPedido[] = itensCarrinho.map((item) => {
      const opcoes: string[] = [];
      if (item.tamanhoNome) {
        opcoes.push(`Tamanho: ${item.tamanhoNome}`);
      }
      if (item.bordaNome) {
        opcoes.push(`Borda: ${item.bordaNome}`);
      }
      if (item.observacao) {
        opcoes.push(`Obs.: ${item.observacao}`);
      }
      return {
        nome: item.produto.nome,
        quantidade: item.quantidade,
        opcoes: opcoes.length > 0 ? opcoes : undefined,
      };
    });

    const enderecoCompleto =
      dados.tipoEntrega === 'entrega'
        ? [dados.endereco?.trim(), dados.complemento?.trim()].filter(Boolean).join(' - ')
        : 'Retirada no balcão';

    const novoPedido: Pedido = {
      id: `ped-${proximoNumero}-${Date.now()}`,
      numero: numeroStr,
      cliente: dados.clienteNome.trim(),
      telefone: dados.clienteTelefone.trim(),
      tipoEntrega: dados.tipoEntrega,
      endereco: enderecoCompleto,
      formaPagamento: dados.formaPagamento,
      trocoPara: dados.formaPagamento === 'Dinheiro' ? dados.trocoPara : undefined,
      itens,
      total: Number(total.toFixed(2)),
      status: 'recebido',
      criadoEm: new Date(),
    };

    this.lista.update((atuais) => {
      const atualizados = [novoPedido, ...atuais];
      this.salvarStorage(atualizados);
      return atualizados;
    });

    return novoPedido;
  }

  atualizarStatus(id: string, status: StatusPedido): void {
    this.lista.update((atuais) => {
      const atualizados = atuais.map((p) => (p.id === id ? { ...p, status } : p));
      this.salvarStorage(atualizados);
      return atualizados;
    });
  }

  limpar(): void {
    this.lista.set([]);
    this.salvarStorage([]);
  }

  private carregarInicial(): Pedido[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const bruto = localStorage.getItem(PEDIDOS_STORAGE_KEY);
      if (!bruto) {
        return [];
      }
      const parsed = JSON.parse(bruto) as Pedido[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((p) => ({
        ...p,
        criadoEm: new Date(p.criadoEm),
      }));
    } catch {
      return [];
    }
  }

  private salvarStorage(pedidos: readonly Pedido[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(PEDIDOS_STORAGE_KEY, JSON.stringify(pedidos));
    } catch {
      // Ignora erros de cota de armazenamento
    }
  }
}
