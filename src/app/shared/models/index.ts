export type StatusPedido = 'recebido' | 'em-producao' | 'a-caminho' | 'entregue' | 'cancelado';

export interface Loja {
  nome: string;
  slogan: string;
  logoUrl?: string;
  capaUrl?: string;
  aberta: boolean;
  horarios: string;
  tempoEntrega: string;
  pedidoMinimo: number;
  taxaEntrega: number;
  endereco: string;
  telefone: string;
  whatsapp: string;
  formasPagamento: string[];
}

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
  imagemUrl?: string;
}

export interface TamanhoPizza {
  sigla: 'P' | 'M' | 'G' | 'GG';
  nome: string;
  fatias: number;
  maxSabores: number;
  precoBase?: number;
}

export interface TipoBorda {
  id: string;
  nome: string;
  precoAdicional: number;
}

export interface Produto {
  id: string;
  categoriaId: string;
  categoria?: string;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  disponivel: boolean;
  tamanhos?: TamanhoPizza[];
  bordas?: TipoBorda[];
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
  imagemUrl?: string;
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

export interface CadastroPayload {
  nome: string;
  telefone?: string;
  telefoneWhatsapp: boolean;
  email?: string;
  senha: string;
  foto?: File;
}
