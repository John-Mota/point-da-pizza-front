import {
  Categoria,
  Combo,
  Loja,
  Produto,
  Promocao,
  TamanhoPizza,
  TipoBorda,
} from '../../../shared/models';

export const TAMANHOS_PIZZA_MOCK: TamanhoPizza[] = [
  { sigla: 'M', nome: 'Média (6 fatias)', fatias: 6, maxSabores: 2, precoBase: 29.9 },
  { sigla: 'G', nome: 'Grande (8 fatias)', fatias: 8, maxSabores: 2, precoBase: 34.9 },
  { sigla: 'GG', nome: 'Gigante (12 fatias)', fatias: 12, maxSabores: 3, precoBase: 44.9 },
];

export const BORDAS_MOCK: TipoBorda[] = [
  { id: 'borda-sem', nome: 'Sem borda recheada', precoAdicional: 0 },
  { id: 'borda-requeijao', nome: 'Borda de requeijão', precoAdicional: 5.0 },
  { id: 'borda-cheddar', nome: 'Borda de cheddar', precoAdicional: 6.0 },
  { id: 'borda-chocolate', nome: 'Borda de chocolate', precoAdicional: 7.0 },
];

export const LOJA_MOCK: Loja = {
  nome: 'Point da Pizza',
  slogan: 'A pizza mais recheada e crocante da região!',
  logoUrl: '/img/logo.png',
  aberta: true,
  horarios: 'Terça a Domingo, das 18h às 23h30',
  tempoEntrega: '35–50 min',
  pedidoMinimo: 25.0,
  taxaEntrega: 5.0,
  endereco: 'Av. Principal, 450 - Centro, Fortaleza/CE',
  telefone: '85988776655',
  whatsapp: '5585988776655',
  formasPagamento: ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro'],
};

export const CATEGORIAS_MOCK: Categoria[] = [
  { id: 'cat-promocoes', nome: 'Promoções', ordem: 1 },
  { id: 'cat-tradicionais', nome: 'Pizzas tradicionais', ordem: 2 },
  { id: 'cat-doces', nome: 'Pizzas doces', ordem: 3 },
  { id: 'cat-pasteis-calzones', nome: 'Pastéis e calzones', ordem: 4 },
  { id: 'cat-bebidas', nome: 'Bebidas', ordem: 5 },
];

export const PROMOCOES_MOCK: Promocao[] = [
  {
    id: 'promo-1',
    titulo: '2 Pizzas G com borda de requeijão',
    descricao: 'Duas pizzas grandes nos sabores tradicionais já com borda recheada de requeijão inclusa.',
    preco: 62.0,
    selo: 'Super Oferta',
    diasValidos: 'Todos os dias',
  },
  {
    id: 'promo-2',
    titulo: '1 Pizza G com borda + refrigerante 1L',
    descricao: 'Uma pizza grande tradicional com borda de requeijão acompanhada de refrigerante 1 litro gelado.',
    preco: 36.9,
    selo: 'Mais Pedido',
    diasValidos: 'Terça a Quinta',
  },
  {
    id: 'promo-3',
    titulo: '2 Calzones + refrigerante 1L',
    descricao: 'Dois calzones bem recheados assados no forno + 1 refrigerante de 1 litro.',
    preco: 41.9,
    selo: 'Combo Especial',
    diasValidos: 'Todos os dias',
  },
];

export const COMBOS_MOCK: Combo[] = [
  {
    id: 'combo-1',
    titulo: '2 Pizzas G com borda de requeijão',
    itens: ['2 Pizzas Grandes Tradicionais', 'Borda de requeijão nas duas pizzas'],
    preco: 62.0,
    precoOriginal: 79.8,
  },
  {
    id: 'combo-2',
    titulo: '1 Pizza G com borda + refrigerante 1L',
    itens: ['1 Pizza Grande Tradicional', '1 Borda de requeijão', '1 Refrigerante 1L'],
    preco: 36.9,
    precoOriginal: 46.9,
  },
  {
    id: 'combo-3',
    titulo: '2 Calzones + refrigerante 1L',
    itens: ['2 Calzones Tradicionais', '1 Refrigerante 1L'],
    preco: 41.9,
    precoOriginal: 51.0,
  },
];

export const PRODUTOS_MOCK: Produto[] = [
  // 1. Promoções (4 produtos)
  {
    id: 'prod-promo-1',
    categoriaId: 'cat-promocoes',
    categoria: 'Promoções',
    nome: '2 Pizzas G com borda de requeijão',
    descricao: 'Escolha até 2 sabores por pizza grande, ambas com borda recheada de requeijão cremoso.',
    preco: 62.0,
    disponivel: true,
  },
  {
    id: 'prod-promo-2',
    categoriaId: 'cat-promocoes',
    categoria: 'Promoções',
    nome: '1 Pizza G com borda + refrigerante 1L',
    descricao: '1 pizza grande tradicional com borda de requeijão + 1 refrigerante de 1 litro gelado.',
    preco: 36.9,
    disponivel: true,
  },
  {
    id: 'prod-promo-3',
    categoriaId: 'cat-promocoes',
    categoria: 'Promoções',
    nome: '2 Calzones + refrigerante 1L',
    descricao: '2 calzones assados na hora bem recheados + 1 refrigerante de 1 litro.',
    preco: 41.9,
    disponivel: true,
  },
  {
    id: 'prod-promo-4',
    categoriaId: 'cat-promocoes',
    categoria: 'Promoções',
    nome: 'Combo Família 2 Pizzas G + refrigerante 2L',
    descricao: '2 pizzas grandes com borda de requeijão + 1 refrigerante de 2 litros para toda a família.',
    preco: 69.9,
    disponivel: true,
  },

  // 2. Pizzas tradicionais (4 produtos)
  {
    id: 'prod-trad-1',
    categoriaId: 'cat-tradicionais',
    categoria: 'Pizzas tradicionais',
    nome: 'Pizza Calabresa Acebolada',
    descricao: 'Molho artesanal, mussarela derretida, calabresa fatiada, cebola roxa e orégano.',
    preco: 32.9,
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-trad-2',
    categoriaId: 'cat-tradicionais',
    categoria: 'Pizzas tradicionais',
    nome: 'Pizza Frango com Requeijão',
    descricao: 'Molho artesanal, mussarela, peito de frango desfiado temperado, milho e requeijão cremoso.',
    preco: 34.9,
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-trad-3',
    categoriaId: 'cat-tradicionais',
    categoria: 'Pizzas tradicionais',
    nome: 'Pizza Portuguesa da Casa',
    descricao: 'Molho artesanal, mussarela, presunto, ovos cozidos, cebola, pimentão, azeitonas e orégano.',
    preco: 35.9,
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-trad-4',
    categoriaId: 'cat-tradicionais',
    categoria: 'Pizzas tradicionais',
    nome: 'Pizza Carne de Sol com Queijo Coalho',
    descricao: 'Molho artesanal, mussarela, carne de sol desfiada na manteiga da terra, queijo coalho e cebola.',
    preco: 37.9,
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },

  // 3. Pizzas doces (3 produtos)
  {
    id: 'prod-doce-1',
    categoriaId: 'cat-doces',
    categoria: 'Pizzas doces',
    nome: 'Pizza Brigadeiro Tradicional',
    descricao: 'Cobertura generosa de chocolate ao leite cremoso com granulado crocante.',
    preco: 33.9,
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-doce-2',
    categoriaId: 'cat-doces',
    categoria: 'Pizzas doces',
    nome: 'Pizza Chocolate com Morango',
    descricao: 'Chocolate ao leite derretido coberto com morangos frescos selecionados e leite condensado.',
    preco: 36.9,
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-doce-3',
    categoriaId: 'cat-doces',
    categoria: 'Pizzas doces',
    nome: 'Pizza Romeu e Julieta',
    descricao: 'Mussarela especial combinada com goiabada cremosa derretida no forno.',
    preco: 32.9,
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },

  // 4. Pastéis e calzones (4 produtos)
  {
    id: 'prod-calz-1',
    categoriaId: 'cat-pasteis-calzones',
    categoria: 'Pastéis e calzones',
    nome: 'Calzone Frango com Requeijão',
    descricao: 'Massa fechada assada no forno, recheada com frango desfiado, mussarela, milho e requeijão.',
    preco: 21.9,
    disponivel: true,
  },
  {
    id: 'prod-calz-2',
    categoriaId: 'cat-pasteis-calzones',
    categoria: 'Pastéis e calzones',
    nome: 'Calzone Calabresa com Queijo',
    descricao: 'Massa dourada recheada com calabresa defumada, mussarela, cebola e orégano.',
    preco: 21.9,
    disponivel: true,
  },
  {
    id: 'prod-calz-3',
    categoriaId: 'cat-pasteis-calzones',
    categoria: 'Pastéis e calzones',
    nome: 'Pastel Forno Carne de Sol',
    descricao: 'Pastel grande assado com recheio cremoso de carne de sol e queijo coalho.',
    preco: 16.9,
    disponivel: true,
  },
  {
    id: 'prod-calz-4',
    categoriaId: 'cat-pasteis-calzones',
    categoria: 'Pastéis e calzones',
    nome: 'Pastel Forno Misto Especial',
    descricao: 'Pastel grande assado com presunto, mussarela e requeijão cremoso.',
    preco: 14.9,
    disponivel: true,
  },

  // 5. Bebidas (4 produtos)
  {
    id: 'prod-beb-1',
    categoriaId: 'cat-bebidas',
    categoria: 'Bebidas',
    nome: 'Refrigerante 1 Litro',
    descricao: 'Coca-Cola, Guaraná Antarctica ou São Geraldo de 1 litro bem gelado.',
    preco: 8.0,
    disponivel: true,
  },
  {
    id: 'prod-beb-2',
    categoriaId: 'cat-bebidas',
    categoria: 'Bebidas',
    nome: 'Refrigerante 2 Litros',
    descricao: 'Coca-Cola, Guaraná Antarctica ou Cajuína São Geraldo 2 litros.',
    preco: 13.0,
    disponivel: true,
  },
  {
    id: 'prod-beb-3',
    categoriaId: 'cat-bebidas',
    categoria: 'Bebidas',
    nome: 'Refrigerante Lata 350ml',
    descricao: 'Coca-Cola original, Coca-Cola Zero ou Guaraná Antarctica em lata 350ml.',
    preco: 5.5,
    disponivel: true,
  },
  {
    id: 'prod-beb-4',
    categoriaId: 'cat-bebidas',
    categoria: 'Bebidas',
    nome: 'Suco Natural 500ml',
    descricao: 'Suco gelado de laranja, acerola ou maracujá feito na hora (500ml).',
    preco: 7.5,
    disponivel: true,
  },
];

