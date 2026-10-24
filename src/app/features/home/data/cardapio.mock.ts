import {
  Categoria,
  Combo,
  HorarioFuncionamento,
  Loja,
  Produto,
  Promocao,
  TamanhoPizza,
  TipoBorda,
} from '../../../shared/models';

/**
 * Horários de funcionamento da loja (0 = Domingo, 1 = Segunda ... 6 = Sábado).
 * Segunda-feira (dia 1) ausente = fechado.
 * Altere aqui para atualizar os horários de abertura e fechamento da loja.
 */
export const HORARIOS_LOJA_MOCK: HorarioFuncionamento[] = [
  { dia: 0, abre: '18:00', fecha: '23:30' }, // Domingo
  { dia: 2, abre: '18:00', fecha: '23:30' }, // Terça-feira
  { dia: 3, abre: '18:00', fecha: '23:30' }, // Quarta-feira
  { dia: 4, abre: '18:00', fecha: '23:30' }, // Quinta-feira
  { dia: 5, abre: '18:00', fecha: '23:30' }, // Sexta-feira
  { dia: 6, abre: '18:00', fecha: '23:30' }, // Sábado
];

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
  slogan: 'Sabor que te leva ao ponto!',
  logoUrl: '/img/logo.png',
  capaUrl: '/img/categoria-pizzas.jpg',
  aberta: true,
  horarios: HORARIOS_LOJA_MOCK,
  endereco: 'Av. Principal, 450 - Centro, Fortaleza/CE',
  telefone: '85988776655',
  whatsapp: '5585988776655',
  formasPagamento: ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro'],
};

/**
 * Categorias do cardápio (dados provisórios, até a integração com a API).
 * Categorias sem produtos não são exibidas na home.
 */
export const CATEGORIAS_MOCK: Categoria[] = [
  { id: 'pizzas', nome: 'Pizzas', ordem: 1, imagemUrl: '/img/categoria-pizzas.jpg' },
  { id: 'pasteis', nome: 'Pastéis', ordem: 2, imagemUrl: '/img/categoria-pasteis.jpg' },
  { id: 'pasteis-especiais', nome: 'Pastéis Especiais', ordem: 3 },
  { id: 'calzones', nome: 'Calzones', ordem: 4, imagemUrl: '/img/calzone-assado.jpg' },
  { id: 'porcoes', nome: 'Porções', ordem: 5 },
  { id: 'bebidas', nome: 'Bebidas', ordem: 6, imagemUrl: '/img/categoria-bebidas.jpg' },
  { id: 'combos', nome: 'Combos', ordem: 7 },
  { id: 'lasanhas', nome: 'Lasanhas', ordem: 8, imagemUrl: '/img/lasanha-bolonhesa.jpg' },
];

export const PROMOCOES_MOCK: Promocao[] = [
  {
    id: 'promo-1',
    titulo: '2 Pizzas G com borda de requeijão',
    descricao: 'Duas pizzas grandes nos sabores tradicionais já com borda recheada de requeijão inclusa.',
    preco: 62.0,
    selo: 'Super Oferta',
    diasValidos: 'Todos os dias',
    imagemUrl: '/img/promo-2-pizzas-g-pizza-p-chocolate-coca-2l.jpg',
  },
  {
    id: 'promo-2',
    titulo: '1 Pizza G com borda + refrigerante 1L',
    descricao: 'Uma pizza grande tradicional com borda de requeijão acompanhada de refrigerante 1 litro gelado.',
    preco: 36.9,
    selo: 'Mais Pedido',
    diasValidos: 'Terça a Quinta',
    imagemUrl: '/img/promo-1-pizza-g-borda-refri-1l.jpg',
  },
  {
    id: 'promo-3',
    titulo: '2 Calzones + refrigerante 1L',
    descricao: 'Dois calzones bem recheados assados no forno + 1 refrigerante de 1 litro.',
    preco: 41.9,
    selo: 'Combo Especial',
    diasValidos: 'Todos os dias',
    imagemUrl: '/img/promo-pizza-g-pizza-p-chocolate-refri-1l.jpg',
  },
];

export const COMBOS_MOCK: Combo[] = [
  {
    id: 'combo-1',
    titulo: '2 Pizzas G com borda de requeijão',
    itens: ['2 Pizzas Grandes Tradicionais', 'Borda de requeijão nas duas pizzas'],
    preco: 62.0,
    precoOriginal: 79.8,
    imagemUrl: '/img/promo-2-pizzas-g-pizza-p-chocolate-coca-2l.jpg',
  },
  {
    id: 'combo-2',
    titulo: '1 Pizza G com borda + refrigerante 1L',
    itens: ['1 Pizza Grande Tradicional', '1 Borda de requeijão', '1 Refrigerante 1L'],
    preco: 36.9,
    precoOriginal: 46.9,
    imagemUrl: '/img/promo-1-pizza-g-borda-refri-1l.jpg',
  },
  {
    id: 'combo-3',
    titulo: '2 Calzones + refrigerante 1L',
    itens: ['2 Calzones Tradicionais', '1 Refrigerante 1L'],
    preco: 41.9,
    precoOriginal: 51.0,
    imagemUrl: '/img/calzone-assado.jpg',
  },
];

/**
 * Produtos do cardápio (dados provisórios). Para adicionar um produto, inclua-o aqui
 * com o `categoriaId` de uma categoria de CATEGORIAS_MOCK.
 */
export const PRODUTOS_MOCK: Produto[] = [
  // Combos (4 produtos)
  {
    id: 'prod-promo-1',
    categoriaId: 'combos',
    categoria: 'Combos',
    nome: '2 Pizzas G com borda de requeijão',
    descricao: 'Escolha até 2 sabores por pizza grande, ambas com borda recheada de requeijão cremoso.',
    preco: 62.0,
    precoOriginal: 79.8,
    imagemUrl: '/img/promo-2-pizzas-g-pizza-p-chocolate-coca-2l.jpg',
    disponivel: true,
    destaque: true,
    seloDestaque: 'Super Oferta',
  },
  {
    id: 'prod-promo-2',
    categoriaId: 'combos',
    categoria: 'Combos',
    nome: '1 Pizza G com borda + refrigerante 1L',
    descricao: '1 pizza grande tradicional com borda de requeijão + 1 refrigerante de 1 litro gelado.',
    preco: 36.9,
    precoOriginal: 46.9,
    imagemUrl: '/img/promo-1-pizza-g-borda-refri-1l.jpg',
    disponivel: true,
    destaque: true,
    seloDestaque: 'Mais Pedido',
  },
  {
    id: 'prod-promo-3',
    categoriaId: 'combos',
    categoria: 'Combos',
    nome: '2 Calzones + refrigerante 1L',
    descricao: '2 calzones assados na hora bem recheados + 1 refrigerante de 1 litro.',
    preco: 41.9,
    precoOriginal: 51.0,
    imagemUrl: '/img/calzone-assado.jpg',
    disponivel: true,
    destaque: true,
    seloDestaque: 'Combo Especial',
  },
  {
    id: 'prod-promo-4',
    categoriaId: 'combos',
    categoria: 'Combos',
    nome: 'Combo Família 2 Pizzas G + Pizza P Doce + Refri 2L',
    descricao: '2 pizzas grandes com borda de requeijão + 1 pizza pequena de chocolate + 1 refrigerante de 2 litros.',
    preco: 89.9,
    precoOriginal: 109.9,
    imagemUrl: '/img/promo-pizza-g-pizza-p-chocolate-refri-1l.jpg',
    disponivel: true,
    destaque: true,
    seloDestaque: 'Combo Família',
  },

  // Pizzas tradicionais
  {
    id: 'prod-trad-1',
    categoriaId: 'pizzas',
    categoria: 'Pizzas',
    nome: 'Pizza Calabresa Acebolada',
    descricao: 'Molho artesanal, mussarela derretida, calabresa fatiada, cebola roxa e orégano.',
    preco: 32.9,
    imagemUrl: '/img/pizza-calabresa-pepperoni.jpg',
    disponivel: true,
    destaque: true,
    seloDestaque: 'Favorita da Casa',
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-trad-2',
    categoriaId: 'pizzas',
    categoria: 'Pizzas',
    nome: 'Pizza Mussarela Tradicional',
    descricao: 'Molho artesanal, camada dupla de mussarela derretida, rodelas de tomate e orégano.',
    preco: 34.9,
    imagemUrl: '/img/pizza-mussarela.jpg',
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-trad-3',
    categoriaId: 'pizzas',
    categoria: 'Pizzas',
    nome: 'Pizza Marguerita Especial',
    descricao: 'Molho artesanal, mussarela, tomates selecionados, folhas de manjericão fresco e azeite.',
    preco: 35.9,
    imagemUrl: '/img/pizza-tomate-manjericao.jpg',
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-trad-4',
    categoriaId: 'pizzas',
    categoria: 'Pizzas',
    nome: 'Pizza Quatro Queijos da Casa',
    descricao: 'Molho artesanal, mussarela especial, requeijão cremoso, parmesão gratinado e orégano.',
    preco: 37.9,
    imagemUrl: '/img/pizza-mussarela-especial.jpg',
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },

  // Pizzas doces
  {
    id: 'prod-doce-1',
    categoriaId: 'pizzas',
    categoria: 'Pizzas',
    nome: 'Pizza Brigadeiro Tradicional',
    descricao: 'Cobertura generosa de chocolate ao leite cremoso com granulado crocante e cerejas.',
    preco: 33.9,
    imagemUrl: '/img/pizza-chocolate.jpg',
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-doce-2',
    categoriaId: 'pizzas',
    categoria: 'Pizzas',
    nome: 'Pizza Chocolate com Morango',
    descricao: 'Chocolate ao leite derretido coberto com morangos frescos selecionados e leite condensado.',
    preco: 36.9,
    imagemUrl: '/img/pizza-chocolate.jpg',
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },
  {
    id: 'prod-doce-3',
    categoriaId: 'pizzas',
    categoria: 'Pizzas',
    nome: 'Pizza Romeu e Julieta',
    descricao: 'Mussarela especial combinada com goiabada cremosa derretida no forno.',
    preco: 32.9,
    imagemUrl: '/img/pizza-mussarela-especial.jpg',
    disponivel: true,
    tamanhos: TAMANHOS_PIZZA_MOCK,
    bordas: BORDAS_MOCK,
  },

  // Calzones, pastéis e lasanhas
  {
    id: 'prod-calz-1',
    categoriaId: 'calzones',
    categoria: 'Calzones',
    nome: 'Calzone Frango com Requeijão',
    descricao: 'Massa fechada assada no forno, recheada com frango desfiado, mussarela, milho e requeijão.',
    preco: 21.9,
    imagemUrl: '/img/calzone-assado.jpg',
    disponivel: true,
  },
  {
    id: 'prod-calz-2',
    categoriaId: 'calzones',
    categoria: 'Calzones',
    nome: 'Calzone Calabresa com Queijo',
    descricao: 'Massa dourada recheada com calabresa defumada, mussarela, cebola e orégano.',
    preco: 21.9,
    imagemUrl: '/img/calzone-assado.jpg',
    disponivel: true,
  },
  {
    id: 'prod-calz-3',
    categoriaId: 'pasteis',
    categoria: 'Pastéis',
    nome: 'Pastel de Forno Carne de Sol',
    descricao: 'Pastel grande assado com recheio cremoso de carne de sol e queijo coalho.',
    preco: 16.9,
    imagemUrl: '/img/pastel-forno.jpg',
    disponivel: true,
  },
  {
    id: 'prod-calz-4',
    categoriaId: 'lasanhas',
    categoria: 'Lasanhas',
    nome: 'Lasanha à Bolonhesa da Casa',
    descricao: 'Lasanha artesanal bem recheada com molho à bolonhesa, presunto e mussarela gratinada.',
    preco: 24.9,
    imagemUrl: '/img/lasanha-bolonhesa.jpg',
    disponivel: true,
  },

  // Bebidas
  {
    id: 'prod-beb-1',
    categoriaId: 'bebidas',
    categoria: 'Bebidas',
    nome: 'Refrigerante 1 Litro',
    descricao: 'Coca-Cola, Guaraná Antarctica, Pepsi ou São Geraldo de 1 litro bem gelado.',
    preco: 8.0,
    imagemUrl: '/img/refri-coca-cola-1l.jpg',
    disponivel: true,
  },
  {
    id: 'prod-beb-2',
    categoriaId: 'bebidas',
    categoria: 'Bebidas',
    nome: 'Refrigerante 2 Litros',
    descricao: 'Coca-Cola, Guaraná Antarctica, Sukita ou Cajuína São Geraldo 2 litros.',
    preco: 13.0,
    imagemUrl: '/img/refri-coca-cola-2l.jpg',
    disponivel: true,
  },
  {
    id: 'prod-beb-3',
    categoriaId: 'bebidas',
    categoria: 'Bebidas',
    nome: 'Refrigerante Lata 350ml',
    descricao: 'Coca-Cola original ou Guaraná Antarctica em lata 350ml.',
    preco: 5.5,
    imagemUrl: '/img/refri-coca-cola-lata-350ml.jpg',
    disponivel: true,
  },
  {
    id: 'prod-beb-4',
    categoriaId: 'bebidas',
    categoria: 'Bebidas',
    nome: 'Suco Natural 500ml',
    descricao: 'Suco gelado de acerola, cajá, goiaba, graviola, manga ou maracujá feito na hora (500ml).',
    preco: 7.5,
    imagemUrl: '/img/suco-maracuja.jpg',
    disponivel: true,
  },
];

