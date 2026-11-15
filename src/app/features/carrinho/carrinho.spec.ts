import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import {
  AUTH_STATUS_STORAGE_KEY,
  AuthService,
  MOCK_USUARIO_ONLINE,
  USUARIO_LOGADO_STORAGE_KEY,
} from '../../core/auth';
import { PEDIDOS_STORAGE_KEY, PedidosService } from '../../core/pedidos';
import { WHATSAPP_RAW_NUMBER } from '../../core/whatsapp/whatsapp.service';
import { ItemConfigurado, Produto } from '../../shared/models';
import { PdpCarrinhoBarra } from './carrinho-barra/carrinho-barra';
import { PdpCarrinhoDrawer } from './carrinho-drawer/carrinho-drawer';
import { CARRINHO_STORAGE_KEY, CarrinhoService } from './carrinho.service';

describe('CarrinhoService, PedidosService, PdpCarrinhoBarra & PdpCarrinhoDrawer', () => {
  let carrinhoService: CarrinhoService;
  let pedidosService: PedidosService;
  let authService: AuthService;
  let drawerFixture: ComponentFixture<PdpCarrinhoDrawer>;
  let barraFixture: ComponentFixture<PdpCarrinhoBarra>;

  const pizza: Produto = {
    id: 'prod-trad-1',
    categoriaId: 'pizzas',
    nome: 'Pizza Calabresa Acebolada',
    descricao: 'Molho artesanal, mussarela derretida e calabresa fatiada.',
    preco: 32.9,
    disponivel: true,
    tamanhos: [
      { id: 'P', nome: 'Pequena (P)', preco: 29.9 },
      { id: 'G', nome: 'Grande (G)', preco: 34.9 },
    ],
    bordas: [{ id: 'requeijao', nome: 'Requeijão', acrescimo: 0 }],
  };
  const bebida: Produto = {
    id: 'prod-beb-1',
    categoriaId: 'bebidas',
    nome: 'Refrigerante 1 Litro',
    descricao: 'Refrigerante gelado 1 litro.',
    preco: 8.0,
    disponivel: true,
  };

  const itemPizzaG: ItemConfigurado = {
    produto: pizza,
    tamanhoId: 'G',
    bordaId: 'requeijao',
    observacao: 'Sem cebola',
    quantidade: 1,
    precoUnitario: 34.9,
    total: 34.9,
  };

  const itemBebida: ItemConfigurado = {
    produto: bebida,
    quantidade: 2,
    precoUnitario: 8.0,
    total: 16.0,
  };

  beforeEach(async () => {
    localStorage.removeItem(CARRINHO_STORAGE_KEY);
    localStorage.removeItem(PEDIDOS_STORAGE_KEY);
    localStorage.removeItem(USUARIO_LOGADO_STORAGE_KEY);
    localStorage.removeItem(AUTH_STATUS_STORAGE_KEY);

    await TestBed.configureTestingModule({
      imports: [PdpCarrinhoDrawer, PdpCarrinhoBarra],
      providers: [{ provide: WHATSAPP_RAW_NUMBER, useValue: '11987654321' }],
    }).compileComponents();

    carrinhoService = TestBed.inject(CarrinhoService);
    pedidosService = TestBed.inject(PedidosService);
    authService = TestBed.inject(AuthService);
    carrinhoService.limpar();
    pedidosService.limpar();

    drawerFixture = TestBed.createComponent(PdpCarrinhoDrawer);
    barraFixture = TestBed.createComponent(PdpCarrinhoBarra);
    drawerFixture.detectChanges();
    barraFixture.detectChanges();
  });

  afterEach(() => {
    carrinhoService.fechar();
    carrinhoService.limpar();
    pedidosService.limpar();
    localStorage.removeItem(USUARIO_LOGADO_STORAGE_KEY);
    localStorage.removeItem(AUTH_STATUS_STORAGE_KEY);
    vi.restoreAllMocks();
  });

  it('deve adicionar itens, somar quantidades de itens idênticos e calcular total corretamente', () => {
    expect(carrinhoService.vazio()).toBe(true);

    carrinhoService.adicionar(itemPizzaG);
    expect(carrinhoService.itens().length).toBe(1);
    expect(carrinhoService.quantidadeTotal()).toBe(1);
    expect(carrinhoService.total()).toBe(34.9);

    // Adiciona o mesmo item novamente -> incrementa quantidade na mesma linha
    carrinhoService.adicionar(itemPizzaG);
    expect(carrinhoService.itens().length).toBe(1);
    expect(carrinhoService.quantidadeTotal()).toBe(2);
    expect(carrinhoService.total()).toBe(69.8);

    // Adiciona produto diferente -> nova linha
    carrinhoService.adicionar(itemBebida);
    expect(carrinhoService.itens().length).toBe(2);
    expect(carrinhoService.quantidadeTotal()).toBe(4);
    expect(carrinhoService.total()).toBe(85.8);
  });

  it('deve alterar quantidade, remover quando quantidade <= 0 e exibir a barra flutuante apenas quando houver itens e a gaveta estiver fechada', () => {
    expect(barraFixture.nativeElement.querySelector('.pdp-carrinho-barra')).toBeNull();

    const criado = carrinhoService.adicionar(itemPizzaG);
    barraFixture.detectChanges();

    const barraEl = barraFixture.nativeElement as HTMLElement;
    const barraBtn = barraEl.querySelector<HTMLButtonElement>('.pdp-carrinho-barra__btn');
    expect(barraBtn).toBeTruthy();
    expect(barraBtn?.textContent).toContain('R$ 34,90');

    // Altera quantidade para 3
    carrinhoService.alterarQuantidade(criado.id, 3);
    barraFixture.detectChanges();
    expect(carrinhoService.total()).toBe(104.7);

    // Quando a gaveta abre, a barra flutuante se oculta
    barraBtn?.click();
    barraFixture.detectChanges();
    drawerFixture.detectChanges();
    expect(carrinhoService.aberto()).toBe(true);
    expect(barraEl.querySelector('.pdp-carrinho-barra')).toBeNull();

    // Remove o item quando quantidade vai a 0
    carrinhoService.alterarQuantidade(criado.id, 0);
    expect(carrinhoService.vazio()).toBe(true);
  });

  it('deve preencher automaticamente nome, telefone e endereço no checkout quando o usuário estiver online', () => {
    expect(authService.estaOnline()).toBe(true);

    carrinhoService.adicionar(itemPizzaG);
    carrinhoService.abrir();
    drawerFixture.detectChanges();

    const hostEl = drawerFixture.nativeElement as HTMLElement;
    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta')!.click();
    drawerFixture.detectChanges();

    expect(drawerFixture.componentInstance.etapa()).toBe('checkout');
    expect(drawerFixture.componentInstance.clienteNome()).toBe(MOCK_USUARIO_ONLINE.nome);
    expect(drawerFixture.componentInstance.clienteTelefone()).toBe(MOCK_USUARIO_ONLINE.telefone);
    expect(drawerFixture.componentInstance.endereco()).toBe(MOCK_USUARIO_ONLINE.endereco);
  });

  it('deve validar os campos obrigatórios no checkout quando offline e, ao confirmar, registrar o pedido no PedidosService, abrir o link do WhatsApp e limpar a sacola', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    authService.sair();
    drawerFixture.detectChanges();

    carrinhoService.adicionar(itemPizzaG);
    carrinhoService.abrir();
    drawerFixture.detectChanges();

    const hostEl = drawerFixture.nativeElement as HTMLElement;

    // Avança da sacola para o checkout
    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta')!.click();
    drawerFixture.detectChanges();
    expect(drawerFixture.componentInstance.etapa()).toBe('checkout');

    // Tenta enviar sem preencher nome (usuário offline começa com campos vazios)
    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta--whatsapp')!.click();
    drawerFixture.detectChanges();
    expect(hostEl.querySelector('#pdp-checkout-erro')?.textContent).toContain('Informe seu nome');
    expect(pedidosService.pedidos().length).toBe(0);

    // Preenche nome, telefone e endereço
    drawerFixture.componentInstance.clienteNome.set('Carlos Mendes');
    drawerFixture.componentInstance.clienteTelefone.set('(85) 99999-1122');
    drawerFixture.componentInstance.endereco.set('Rua das Flores, 120 - Aldeota');
    drawerFixture.componentInstance.selecionarFormaPagamento('Dinheiro');
    drawerFixture.componentInstance.trocoPara.set('50');
    drawerFixture.detectChanges();

    // Confirma o pedido
    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta--whatsapp')!.click();
    drawerFixture.detectChanges();

    // 1. Registrado no PedidosService (painel admin)
    expect(pedidosService.pedidos().length).toBe(1);
    const registrado = pedidosService.pedidos()[0];
    expect(registrado.numero).toBe('#101');
    expect(registrado.cliente).toBe('Carlos Mendes');
    expect(registrado.status).toBe('recebido');
    expect(registrado.total).toBe(34.9);

    // 2. Link do WhatsApp aberto com os dados codificados
    expect(openSpy).toHaveBeenCalledTimes(1);
    const urlAberta = String(openSpy.mock.calls[0][0]);
    expect(urlAberta).toContain('https://wa.me/5511987654321?text=');
    expect(decodeURIComponent(urlAberta)).toContain('Carlos Mendes');
    expect(decodeURIComponent(urlAberta)).toContain(pizza.nome);
    expect(decodeURIComponent(urlAberta)).toContain('Rua das Flores, 120 - Aldeota');

    // 3. Sacola limpa e estado concluído exibido
    expect(carrinhoService.vazio()).toBe(true);
    expect(drawerFixture.componentInstance.etapa()).toBe('concluido');
    expect(hostEl.textContent).toContain('Pedido #101 registrado!');
  });
});
