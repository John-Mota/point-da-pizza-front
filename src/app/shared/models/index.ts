export type StatusPedido = 'recebido' | 'em-producao' | 'a-caminho' | 'entregue' | 'cancelado';

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  categoria: string;
}

export interface Combo {
  id: string;
  titulo: string;
  itens: string[];
  preco: number;
  precoOriginal?: number;
  imagemUrl?: string;
}

export interface Promocao {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  selo?: string;
  diasValidos?: string;
}

export interface ItemPedido {
  nome: string;
  quantidade: number;
  opcoes?: string[];
}

export interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  itens: ItemPedido[];
  total: number;
  status: StatusPedido;
  criadoEm: Date;
}
