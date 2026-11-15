import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PEDIDOS_STORAGE_KEY, PedidosService } from '../../../../core/pedidos';
import { WHATSAPP_RAW_NUMBER } from '../../../../core/whatsapp';
import { ItemConfigurado, Produto } from '../../../../shared/models';
import { PRODUTOS_MOCK } from '../../data';
import { PdpCarrinhoBarra } from './carrinho-barra';
import { PdpCarrinhoDrawer } from './carrinho-drawer';
import { CARRINHO_STORAGE_KEY, CarrinhoService } from './carrinho.service';

describe('CarrinhoService, PedidosService, PdpCarrinhoBarra & PdpCarrinhoDrawer', () => {
  let carrinhoService: CarrinhoService;
  let pedidosService: PedidosService;
  let drawerFixture: ComponentFixture<PdpCarrinhoDrawer>;
  let barraFixture: ComponentFixture<PdpCarrinhoBarra>;

  const pizza: Produto = PRODUTOS_MOCK.find((p) => p.id === 'prod-trad-1')!;
  const bebida: Produto = PRODUTOS_MOCK.find((p) => p.id === 'prod-beb-1')!;

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

    await TestBed.configureTestingModule({
      imports: [PdpCarrinhoDrawer, PdpCarrinhoBarra],
      providers: [{ provide: WHATSAPP_RAW_NUMBER, useValue: '11987654321' }],
    }).compileComponents();

    carrinhoService = TestBed.inject(CarrinhoService);
    pedidosService = TestBed.inject(PedidosService);
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

  it('deve validar os campos obrigatórios no checkout e, ao confirmar, registrar o pedido no PedidosService, abrir o link do WhatsApp e limpar a sacola', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    carrinhoService.adicionar(itemPizzaG);
    carrinhoService.abrir();
    drawerFixture.detectChanges();

    const hostEl = drawerFixture.nativeElement as HTMLElement;

    // Avança da sacola para o checkout
    hostEl.querySelector<HTMLButtonElement>('.pdp-carrinho__cta')!.click();
    drawerFixture.detectChanges();
    expect(drawerFixture.componentInstance.etapa()).toBe('checkout');

    // Tenta enviar sem preencher nome
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
