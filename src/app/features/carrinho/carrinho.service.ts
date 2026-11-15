import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { PedidosService } from '../../core/pedidos';
import { WhatsappService } from '../../core/whatsapp/whatsapp.service';
import {
  DadosFinalizacaoPedido,
  ItemCarrinho,
  ItemConfigurado,
  Pedido,
} from '../../shared/models';

export const CARRINHO_STORAGE_KEY = 'pdp-carrinho';
export const MAX_QTD_ITEM_CARRINHO = 20;

export function formatarMoedaBr(valor: number): string {
  const num = Number.isFinite(valor) ? valor : 0;
  return `R$ ${num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

@Injectable({
  providedIn: 'root',
})
export class CarrinhoService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly pedidosService = inject(PedidosService);
  private readonly whatsappService = inject(WhatsappService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private elementoOrigem: HTMLElement | null = null;
  private contadorId = 1;

  private readonly listaItens = signal<ItemCarrinho[]>(this.carregarInicial());
  readonly aberto = signal<boolean>(false);

  readonly itens = this.listaItens.asReadonly();

  readonly vazio = computed<boolean>(() => this.listaItens().length === 0);

  readonly quantidadeTotal = computed<number>(() =>
    this.listaItens().reduce((soma, item) => soma + item.quantidade, 0)
  );

  readonly subtotal = computed<number>(() =>
    Number(this.listaItens().reduce((soma, item) => soma + item.total, 0).toFixed(2))
  );

  readonly total = computed<number>(() => this.subtotal());

  adicionar(configurado: ItemConfigurado): ItemCarrinho {
    const obsNormalizada = configurado.observacao?.trim() || undefined;
    const tamanhoNome = configurado.tamanhoId
      ? configurado.produto.tamanhos?.find((t) => t.id === configurado.tamanhoId)?.nome ??
        configurado.tamanhoId
      : undefined;
    const bordaNome = configurado.bordaId
      ? configurado.produto.bordas?.find((b) => b.id === configurado.bordaId)?.nome ??
        configurado.bordaId
      : undefined;

    const atuais = this.listaItens();
    const idxExistente = atuais.findIndex(
      (item) =>
        item.produto.id === configurado.produto.id &&
        item.tamanhoId === configurado.tamanhoId &&
        item.bordaId === configurado.bordaId &&
        (item.observacao ?? undefined) === obsNormalizada
    );

    if (idxExistente >= 0) {
      const existente = atuais[idxExistente];
      const novaQtd = Math.min(
        MAX_QTD_ITEM_CARRINHO,
        existente.quantidade + Math.max(1, configurado.quantidade)
      );
      const atualizado: ItemCarrinho = {
        ...existente,
        quantidade: novaQtd,
        total: Number((existente.precoUnitario * novaQtd).toFixed(2)),
      };
      const novaLista = atuais.map((item, idx) => (idx === idxExistente ? atualizado : item));
      this.atualizarLista(novaLista);
      return atualizado;
    }

    const qtd = Math.min(MAX_QTD_ITEM_CARRINHO, Math.max(1, configurado.quantidade));
    const novoItem: ItemCarrinho = {
      ...configurado,
      id: `cart-${Date.now()}-${this.contadorId++}`,
      observacao: obsNormalizada,
      tamanhoNome,
      bordaNome,
      quantidade: qtd,
      total: Number((configurado.precoUnitario * qtd).toFixed(2)),
    };

    this.atualizarLista([...atuais, novoItem]);
    return novoItem;
  }

  alterarQuantidade(itemId: string, novaQuantidade: number): void {
    if (novaQuantidade <= 0) {
      this.remover(itemId);
      return;
    }

    const qtdLimitada = Math.min(MAX_QTD_ITEM_CARRINHO, novaQuantidade);
    const novaLista = this.listaItens().map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantidade: qtdLimitada,
            total: Number((item.precoUnitario * qtdLimitada).toFixed(2)),
          }
        : item
    );
    this.atualizarLista(novaLista);
  }

  remover(itemId: string): void {
    const novaLista = this.listaItens().filter((item) => item.id !== itemId);
    this.atualizarLista(novaLista);
  }

  limpar(): void {
    this.atualizarLista([]);
  }

  abrir(origem?: HTMLElement | null): void {
    if (origem) {
      this.elementoOrigem = origem;
    } else if (this.isBrowser && this.document.activeElement instanceof HTMLElement) {
      this.elementoOrigem = this.document.activeElement;
    } else {
      this.elementoOrigem = null;
    }
    this.aberto.set(true);
  }

  fechar(): void {
    if (!this.aberto()) {
      return;
    }
    const origem = this.elementoOrigem;
    this.elementoOrigem = null;
    this.aberto.set(false);

    if (this.isBrowser && origem && typeof origem.focus === 'function') {
      origem.focus();
    }
  }

  gerarMensagemWhatsapp(dados: DadosFinalizacaoPedido, numeroPedido?: string): string {
    const cabecalho = numeroPedido
      ? `*Novo Pedido ${numeroPedido} - Point da Pizza*`
      : '*Novo Pedido - Point da Pizza*';

    const linhasItens = this.listaItens().map((item) => {
      const detalhes: string[] = [];
      if (item.tamanhoNome) {
        detalhes.push(`Tam: ${item.tamanhoNome}`);
      }
      if (item.bordaNome) {
        detalhes.push(`Borda: ${item.bordaNome}`);
      }
      if (item.observacao) {
        detalhes.push(`Obs: ${item.observacao}`);
      }
      const sufixoDetalhes = detalhes.length > 0 ? ` (${detalhes.join(' | ')})` : '';
      return `- ${item.quantidade}x ${item.produto.nome}${sufixoDetalhes}: ${formatarMoedaBr(item.total)}`;
    });

    const linhaEntrega =
      dados.tipoEntrega === 'entrega'
        ? `Entrega: ${[dados.endereco?.trim(), dados.complemento?.trim()].filter(Boolean).join(' - ')}`
        : 'Retirada no balcão';

    const linhaTroco =
      dados.formaPagamento === 'Dinheiro' && dados.trocoPara && dados.trocoPara > 0
        ? ` (Troco para ${formatarMoedaBr(dados.trocoPara)})`
        : '';

    return [
      cabecalho,
      '',
      `*Cliente:* ${dados.clienteNome.trim()}`,
      `*Telefone:* ${dados.clienteTelefone.trim()}`,
      '',
      '*Itens do pedido:*',
      ...linhasItens,
      '',
      `*Modalidade:* ${linhaEntrega}`,
      `*Pagamento:* ${dados.formaPagamento}${linhaTroco}`,
      `*Total:* ${formatarMoedaBr(this.total())}`,
    ].join('\n');
  }

  finalizarPedido(dados: DadosFinalizacaoPedido): { pedido: Pedido; whatsappUrl: string } {
    const itensAtuais = this.listaItens();
    const valorTotal = this.total();
    const pedido = this.pedidosService.registrarPedido(itensAtuais, dados, valorTotal);
    const mensagem = this.gerarMensagemWhatsapp(dados, pedido.numero);
    const whatsappUrl = this.whatsappService.link(mensagem);

    this.limpar();
    return { pedido, whatsappUrl };
  }

  private atualizarLista(novaLista: ItemCarrinho[]): void {
    this.listaItens.set(novaLista);
    this.salvarStorage(novaLista);
  }

  private carregarInicial(): ItemCarrinho[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const bruto = localStorage.getItem(CARRINHO_STORAGE_KEY);
      if (!bruto) {
        return [];
      }
      const parsed = JSON.parse(bruto) as ItemCarrinho[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private salvarStorage(itens: readonly ItemCarrinho[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(CARRINHO_STORAGE_KEY, JSON.stringify(itens));
    } catch {
      // Ignora erros de armazenamento
    }
  }
}
