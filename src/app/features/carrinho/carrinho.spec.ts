import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AuthService,
  USUARIO_LOGADO_STORAGE_KEY,
} from '../../core/auth';
import { PedidoService } from '../../core/pedidos';
import { WHATSAPP_RAW_NUMBER } from '../../core/whatsapp/whatsapp.service';
import { ItemConfigurado, Produto } from '../../shared/models';
import {
  criarBebida,
  criarPedidoCriado,
  criarPizzaComOpcoes,
  criarUsuarioLogado,
} from '../../testing';
import { PdpCarrinhoBarra } from './carrinho-barra/carrinho-barra';
import { PdpCarrinhoDrawer } from './carrinho-drawer/carrinho-drawer';
import { CARRINHO_STORAGE_KEY, CarrinhoService } from './carrinho.service';

describe('CarrinhoService, PedidoService, PdpCarrinhoBarra & PdpCarrinhoDrawer', () => {
  let carrinhoService: CarrinhoService;
  let pedidoService: PedidoService;
  let authService: AuthService;
  let drawerFixture: ComponentFixture<PdpCarrinhoDrawer>;
  let barraFixture: ComponentFixture<PdpCarrinhoBarra>;

  const pizza: Produto = criarPizzaComOpcoes();
  const bebida: Produto = criarBebida();

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
    localStorage.removeItem(USUARIO_LOGADO_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);

    await TestBed.configureTestingModule({
      imports: [PdpCarrinhoDrawer, PdpCarrinhoBarra],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WHATSAPP_RAW_NUMBER, useValue: '11987654321' },
      ],
    }).compileComponents();

    carrinhoService = TestBed.inject(CarrinhoService);
    pedidoService = TestBed.inject(PedidoService);
    authService = TestBed.inject(AuthService);
    carrinhoService.limpar();
    pedidoService.limpar();
    authService.sair();

    drawerFixture = TestBed.createComponent(PdpCarrinhoDrawer);
    barraFixture = TestBed.createComponent(PdpCarrinhoBarra);
    drawerFixture.detectChanges();
    barraFixture.detectChanges();
  });

  afterEach(() => {
    carrinhoService.fechar();
    carrinhoService.limpar();
    pedidoService.limpar();
    authService.sair();
    vi.restoreAllMocks();
  });

  it('deve adicionar itens, somar quantidades de itens idênticos e calcular total corretamente', () => {
    expect(carrinhoService.vazio()).toBe(true);

    carrinhoService.adicionar(itemPizzaG);
    expect(carrinhoService.itens().length).toBe(1);
    expect(carrinhoService.quantidadeTotal()).toBe(1);
    expect(carrinhoService.total()).toBe(34.9);

    carrinhoService.adicionar(itemPizzaG);
    expect(carrinhoService.itens().length).toBe(1);
    expect(carrinhoService.quantidadeTotal()).toBe(2);
    expect(carrinhoService.total()).toBe(69.8);

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

    carrinhoService.alterarQuantidade(criado.id, 3);
    barraFixture.detectChanges();
    expect(carrinhoService.total()).toBe(104.7);

    barraBtn?.click();
    barraFixture.detectChanges();
    drawerFixture.detectChanges();
    expect(carrinhoService.aberto()).toBe(true);
    expect(barraEl.querySelector('.pdp-carrinho-barra')).toBeNull();

    carrinhoService.alterarQuantidade(criado.id, 0);
    expect(carrinhoService.vazio()).toBe(true);
  });

  it('deve preencher automaticamente nome, telefone e endereço no checkout quando o usuário estiver online', () => {
    const usuarioFixture = criarUsuarioLogado();
    authService.definirSessao(usuarioFixture, 'token-123');
    drawerFixture.detectChanges();

    expect(authService.estaOnline()).toBe(true);

    carrinhoService.adicionar(itemPizzaG);
    carrinhoService.abrir();
    drawerFixture.detectChanges();

    const hostEl = drawerFixture.nativeElement as HTMLElement;
    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta')!.click();
    drawerFixture.detectChanges();

    expect(drawerFixture.componentInstance.etapa()).toBe('checkout');
    expect(drawerFixture.componentInstance.clienteNome()).toBe(usuarioFixture.nome);
    expect(drawerFixture.componentInstance.clienteTelefone()).toBe(usuarioFixture.telefone);
    expect(drawerFixture.componentInstance.endereco()).toBe(usuarioFixture.endereco);
  });

  it('deve validar os campos obrigatórios no checkout quando offline e, ao confirmar, enviar pedido via PedidoService, abrir o link do WhatsApp e limpar a sacola', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const pedidoRetornado = criarPedidoCriado();
    const criarSpy = vi
      .spyOn(pedidoService, 'criarPedido')
      .mockReturnValue(of(pedidoRetornado));

    carrinhoService.adicionar(itemPizzaG);
    carrinhoService.abrir();
    drawerFixture.detectChanges();

    const hostEl = drawerFixture.nativeElement as HTMLElement;

    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta')!.click();
    drawerFixture.detectChanges();
    expect(drawerFixture.componentInstance.etapa()).toBe('checkout');

    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta--whatsapp')!.click();
    drawerFixture.detectChanges();
    expect(hostEl.querySelector('#pdp-checkout-erro')?.textContent).toContain('Informe seu nome');
    expect(criarSpy).not.toHaveBeenCalled();

    drawerFixture.componentInstance.clienteNome.set('Carlos Mendes');
    drawerFixture.componentInstance.clienteTelefone.set('(85) 99999-1122');
    drawerFixture.componentInstance.endereco.set('Rua das Flores, 120 - Aldeota');
    drawerFixture.componentInstance.selecionarFormaPagamento('Dinheiro');
    drawerFixture.componentInstance.trocoPara.set('50');
    drawerFixture.detectChanges();

    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta--whatsapp')!.click();
    drawerFixture.detectChanges();

    expect(criarSpy).toHaveBeenCalledTimes(1);
    const [, chaveEnviada] = criarSpy.mock.calls[0];
    expect(typeof chaveEnviada).toBe('string');
    expect(chaveEnviada!.length).toBeGreaterThan(5);

    expect(openSpy).toHaveBeenCalledTimes(1);
    const urlAberta = String(openSpy.mock.calls[0][0]);
    expect(urlAberta).toContain('https://wa.me/5511987654321?text=');
    expect(decodeURIComponent(urlAberta)).toContain('Carlos Mendes');
    expect(decodeURIComponent(urlAberta)).toContain(pizza.nome);
    expect(decodeURIComponent(urlAberta)).toContain('Rua das Flores, 120 - Aldeota');

    expect(carrinhoService.vazio()).toBe(true);
    expect(drawerFixture.componentInstance.etapa()).toBe('concluido');
    expect(hostEl.textContent).toContain('Pedido #101 registrado!');
  });
});
