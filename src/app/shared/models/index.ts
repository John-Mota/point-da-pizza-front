export type StatusPedido = 'recebido' | 'em-producao' | 'a-caminho' | 'entregue' | 'cancelado';

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface HorarioFuncionamento {
  dia: DiaSemana;
  abre: string;
  fecha: string;
}

export interface Loja {
  nome: string;
  slogan: string;
  logoUrl?: string;
  capaUrl?: string;
  aberta: boolean;
  horarios: HorarioFuncionamento[];
  endereco: string;
  telefone?: string;
  formasPagamento: string[];
}

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
  imagemUrl?: string;
}

export interface TamanhoProdutoOpcao {
  id: string;
  nome: string;
  preco: number;
}

export interface BordaProdutoOpcao {
  id: string;
  nome: string;
  acrescimo: number;
}

export interface Produto {
  id: string;
  categoriaId: string;
  categoria?: string;
  nome: string;
  descricao: string;
  preco: number;
  precoOriginal?: number;
  imagemUrl?: string;
  disponivel: boolean;
  destaque?: boolean;
  ordemDestaque?: number;
  seloDestaque?: string;
  tamanhos?: TamanhoProdutoOpcao[];
  bordas?: BordaProdutoOpcao[];
}

export interface SecaoCardapio {
  categoria: Categoria;
  produtos: Produto[];
}

export interface ItemConfigurado {
  produto: Produto;
  tamanhoId?: string;
  bordaId?: string;
  observacao?: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
}

export interface ItemCarrinho extends ItemConfigurado {
  id: string;
  tamanhoNome?: string;
  bordaNome?: string;
}

export type TipoEntrega = 'entrega' | 'retirada';

export interface DadosFinalizacaoPedido {
  clienteNome: string;
  clienteTelefone: string;
  tipoEntrega: TipoEntrega;
  endereco?: string;
  complemento?: string;
  formaPagamento: string;
  trocoPara?: number;
}

export interface ItemPedidoNovo {
  produtoId: string;
  nome: string;
  quantidade: number;
  tamanhoId?: string;
  tamanhoNome?: string;
  bordaId?: string;
  bordaNome?: string;
  observacao?: string;
  precoUnitario: number;
  total: number;
}

export interface PedidoNovo {
  clienteNome: string;
  clienteTelefone: string;
  tipoEntrega: TipoEntrega;
  endereco?: string;
  complemento?: string;
  formaPagamento: string;
  trocoPara?: number;
  itens: ItemPedidoNovo[];
  total: number;
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
  telefone?: string;
  tipoEntrega?: TipoEntrega;
  endereco?: string;
  formaPagamento?: string;
  trocoPara?: number;
  itens: ItemPedido[];
  total: number;
  status: StatusPedido;
  criadoEm: Date;
}

export type PedidoCriado = Pedido;

export interface CadastroPayload {
  nome: string;
  telefone?: string;
  telefoneWhatsapp: boolean;
  email?: string;
  endereco?: string;
  complemento?: string;
  senha: string;
  foto?: File;
}

export interface UsuarioLogado {
  nome: string;
  telefone: string;
  email?: string | null;
  endereco: string;
  complemento?: string | null;
  fotoUrl?: string | null;
}

export interface LoginPayload {
  email?: string;
  telefone?: string;
  senha: string;
  lembrarMe?: boolean;
}

export interface LoginResponse {
  mensagem: string;
  usuario?: UsuarioLogado;
  token?: string;
}
