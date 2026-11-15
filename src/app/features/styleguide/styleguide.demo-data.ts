import { Combo, Pedido, Produto, Promocao } from '../../shared/models';

export const EXEMPLO_PRODUTO_COM_IMAGEM: Produto = {
  id: 'demo-prod-1',
  categoriaId: 'demo-cat-1',
  nome: 'Pizza Demonstrativa com Imagem',
  descricao: 'Descrição de exemplo para visualização do componente no guia de estilos.',
  preco: 44.9,
  imagemUrl: '/img/logo.png',
  categoria: 'Exemplos',
  disponivel: true,
};

export const EXEMPLO_PRODUTO_SEM_IMAGEM: Produto = {
  id: 'demo-prod-2',
  categoriaId: 'demo-cat-1',
  nome: 'Pizza Demonstrativa sem Imagem',
  descricao: 'Exemplo de exibição do card de produto com placeholder visual da marca.',
  preco: 48.0,
  categoria: 'Exemplos',
  disponivel: true,
};

export const EXEMPLO_PROMOCAO: Promocao = {
  id: 'demo-promo-1',
  titulo: 'Campanha Demonstrativa',
  descricao: 'Exemplo visual de card promocional no catálogo de componentes.',
  preco: 69.9,
  selo: 'Destaque',
  diasValidos: 'Terça a Quinta',
};

export const EXEMPLO_COMBO_COM_DESCONTO: Combo = {
  id: 'demo-combo-1',
  titulo: 'Combo Demonstrativo com Desconto',
  itens: ['Item de exemplo 1', 'Item de exemplo 2'],
  preco: 89.9,
  precoOriginal: 114.9,
};

export const EXEMPLO_COMBO_SEM_DESCONTO: Combo = {
  id: 'demo-combo-2',
  titulo: 'Combo Demonstrativo Regular',
  itens: ['Item de exemplo 1', 'Item de exemplo 2'],
  preco: 52.0,
};

export const EXEMPLO_PEDIDO_RECEBIDO: Pedido = {
  id: 'demo-ped-201',
  numero: '201',
  cliente: 'Cliente Exemplo 1',
  itens: [
    { nome: 'Item Exemplo A', quantidade: 1, opcoes: ['Opção 1'] },
    { nome: 'Item Exemplo B', quantidade: 1 },
  ],
  total: 72.5,
  status: 'recebido',
  criadoEm: new Date('2026-10-20T19:00:00-03:00'),
};

export const EXEMPLO_PEDIDO_EM_PRODUCAO: Pedido = {
  id: 'demo-ped-202',
  numero: '202',
  cliente: 'Cliente Exemplo 2',
  itens: [{ nome: 'Item Exemplo A', quantidade: 1 }],
  total: 46.0,
  status: 'em-producao',
  criadoEm: new Date('2026-10-20T18:45:00-03:00'),
};

export const EXEMPLO_PEDIDO_A_CAMINHO: Pedido = {
  id: 'demo-ped-203',
  numero: '203',
  cliente: 'Cliente Exemplo 3',
  itens: [{ nome: 'Item Exemplo A', quantidade: 2 }],
  total: 98.0,
  status: 'a-caminho',
  criadoEm: new Date('2026-10-20T18:30:00-03:00'),
};

export const EXEMPLO_PEDIDO_ENTREGUE: Pedido = {
  id: 'demo-ped-204',
  numero: '204',
  cliente: 'Cliente Exemplo 4',
  itens: [{ nome: 'Item Exemplo A', quantidade: 1 }],
  total: 38.0,
  status: 'entregue',
  criadoEm: new Date('2026-10-20T18:00:00-03:00'),
};

export const EXEMPLO_PEDIDO_CANCELADO: Pedido = {
  id: 'demo-ped-205',
  numero: '205',
  cliente: 'Cliente Exemplo 5',
  itens: [{ nome: 'Item Exemplo A', quantidade: 1 }],
  total: 54.0,
  status: 'cancelado',
  criadoEm: new Date('2026-10-20T17:30:00-03:00'),
};
