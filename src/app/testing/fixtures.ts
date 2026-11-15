import {
  BordaProdutoOpcao,
  Categoria,
  HorarioFuncionamento,
  Loja,
  PedidoCriado,
  Produto,
  SecaoCardapio,
  TamanhoProdutoOpcao,
  UsuarioLogado,
} from '../shared/models';

export function criarHorariosPadrao(): HorarioFuncionamento[] {
  return [
    { dia: 0, abre: '18:00', fecha: '23:30' },
    { dia: 2, abre: '18:00', fecha: '23:30' },
    { dia: 3, abre: '18:00', fecha: '23:30' },
    { dia: 4, abre: '18:00', fecha: '23:30' },
    { dia: 5, abre: '18:00', fecha: '23:30' },
    { dia: 6, abre: '18:00', fecha: '23:30' },
  ];
}

export function criarLoja(overrides: Partial<Loja> = {}): Loja {
  return {
    nome: 'Point da Pizza',
    slogan: 'Sabor que te leva ao ponto!',
    logoUrl: '/img/logo.png',
    capaUrl: '/img/categoria-pizzas.jpg',
    aberta: true,
    horarios: criarHorariosPadrao(),
    endereco: 'Av. Principal, 450 - Centro, Fortaleza/CE',
    telefone: '85988776655',
    formasPagamento: ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro'],
    ...overrides,
  };
}

export function criarCategoria(overrides: Partial<Categoria> = {}): Categoria {
  return {
    id: 'pizzas',
    nome: 'Pizzas',
    ordem: 1,
    ...overrides,
  };
}

export function criarCategoriasPadrao(): Categoria[] {
  return [
    { id: 'pizzas', nome: 'Pizzas', ordem: 1 },
    { id: 'pasteis', nome: 'Pastéis', ordem: 2 },
    { id: 'pasteis-especiais', nome: 'Pastéis Especiais', ordem: 3 },
    { id: 'calzones', nome: 'Calzones', ordem: 4 },
    { id: 'porcoes', nome: 'Porções', ordem: 5 },
    { id: 'bebidas', nome: 'Bebidas', ordem: 6 },
    { id: 'combos', nome: 'Combos', ordem: 7 },
    { id: 'lasanhas', nome: 'Lasanhas', ordem: 8 },
  ];
}

export function criarTamanhosPadrao(): TamanhoProdutoOpcao[] {
  return [
    { id: 'P', nome: 'Pequena (P)', preco: 29.9 },
    { id: 'G', nome: 'Grande (G)', preco: 34.9 },
  ];
}

export function criarBordasPadrao(): BordaProdutoOpcao[] {
  return [{ id: 'requeijao', nome: 'Requeijão', acrescimo: 0 }];
}

export function criarProduto(overrides: Partial<Produto> = {}): Produto {
  return {
    id: 'prod-1',
    categoriaId: 'pizzas',
    categoria: 'Pizzas',
    nome: 'Pizza Calabresa',
    descricao: 'Molho artesanal, mussarela e calabresa fatiada.',
    preco: 32.9,
    imagemUrl: '/img/pizza-calabresa-pepperoni.jpg',
    disponivel: true,
    ...overrides,
  };
}

export function criarPizzaComOpcoes(overrides: Partial<Produto> = {}): Produto {
  return criarProduto({
    id: 'prod-trad-1',
    nome: 'Pizza Calabresa Acebolada',
    preco: 32.9,
    destaque: true,
    ordemDestaque: 1,
    seloDestaque: 'Favorita da Casa',
    tamanhos: criarTamanhosPadrao(),
    bordas: criarBordasPadrao(),
    ...overrides,
  });
}

export function criarBebida(overrides: Partial<Produto> = {}): Produto {
  return criarProduto({
    id: 'prod-beb-1',
    categoriaId: 'bebidas',
    categoria: 'Bebidas',
    nome: 'Refrigerante 1 Litro',
    descricao: 'Refrigerante de 1 litro gelado.',
    preco: 8.0,
    imagemUrl: '/img/refri-coca-cola-1l.jpg',
    ...overrides,
  });
}

export function criarSecoesCardapioPadrao(): SecaoCardapio[] {
  return [
    {
      categoria: { id: 'pizzas', nome: 'Pizzas', ordem: 1 },
      produtos: [
        criarPizzaComOpcoes(),
        criarProduto({
          id: 'prod-trad-2',
          nome: 'Pizza Mussarela Tradicional',
          preco: 34.9,
          destaque: true,
          ordemDestaque: 2,
          tamanhos: criarTamanhosPadrao(),
          bordas: criarBordasPadrao(),
        }),
      ],
    },
    {
      categoria: { id: 'bebidas', nome: 'Bebidas', ordem: 6 },
      produtos: [criarBebida()],
    },
    {
      categoria: { id: 'combos', nome: 'Combos', ordem: 7 },
      produtos: [
        criarProduto({
          id: 'prod-combo-1',
          categoriaId: 'combos',
          categoria: 'Combos',
          nome: 'Combo 2 Pizzas G',
          preco: 62.0,
          precoOriginal: 79.8,
          destaque: true,
          ordemDestaque: 3,
          seloDestaque: 'Super Oferta',
        }),
      ],
    },
  ];
}

export function criarPedidoCriado(overrides: Partial<PedidoCriado> = {}): PedidoCriado {
  return {
    id: 'ped-101',
    numero: '#101',
    cliente: 'Carlos Mendes',
    telefone: '(85) 99999-1122',
    tipoEntrega: 'entrega',
    endereco: 'Rua das Flores, 120 - Aldeota',
    formaPagamento: 'Dinheiro',
    trocoPara: 50,
    itens: [{ nome: 'Pizza Calabresa Acebolada', quantidade: 1, opcoes: ['Tamanho: Grande (G)'] }],
    total: 34.9,
    status: 'recebido',
    criadoEm: new Date('2026-10-20T19:00:00-03:00'),
    ...overrides,
  };
}

export function criarUsuarioLogado(overrides: Partial<UsuarioLogado> = {}): UsuarioLogado {
  return {
    nome: 'Maria Silva',
    telefone: '(85) 99999-9999',
    email: 'maria@exemplo.com',
    endereco: 'Rua das Flores, 100 - Centro',
    ...overrides,
  };
}
