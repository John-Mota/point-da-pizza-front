import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { criarPizzaComOpcoes } from '../../testing';
import { API_RETRY_DELAY_MS, ApiError, errorInterceptor } from '../api';
import { PedidoService, montarPedidoNovo } from './pedidos.service';

describe('PedidoService', () => {
  let service: PedidoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_RETRY_DELAY_MS, useValue: 1 },
      ],
    });

    service = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve enviar POST /api/pedidos com cabeçalho Idempotency-Key e converter criadoEm para Date', async () => {
    const pizza = criarPizzaComOpcoes();
    const novo = montarPedidoNovo(
      [
        {
          id: 'item-1',
          produto: pizza,
          tamanhoId: 'G',
          tamanhoNome: 'Grande (G)',
          quantidade: 1,
          precoUnitario: 34.9,
          total: 34.9,
        },
      ],
      {
        clienteNome: 'Carlos Mendes',
        clienteTelefone: '(85) 99999-1122',
        tipoEntrega: 'entrega',
        endereco: 'Rua das Flores, 120 - Aldeota',
        formaPagamento: 'Pix',
      },
      34.9
    );

    const promessa = firstValueFrom(service.criarPedido(novo, 'idem-chave-fixa-123'));

    const req = httpMock.expectOne('/api/pedidos');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toBe('idem-chave-fixa-123');
    expect(req.request.body).toEqual(novo);

    req.flush({
      id: 'ped-101',
      numero: '#101',
      cliente: 'Carlos Mendes',
      telefone: '(85) 99999-1122',
      tipoEntrega: 'entrega',
      endereco: 'Rua das Flores, 120 - Aldeota',
      formaPagamento: 'Pix',
      itens: [{ nome: pizza.nome, quantidade: 1, opcoes: ['Tamanho: Grande (G)'] }],
      total: 34.9,
      status: 'recebido',
      criadoEm: '2026-10-20T22:00:00Z',
    });

    const criado = await promessa;
    expect(criado.numero).toBe('#101');
    expect(criado.criadoEm).toBeInstanceOf(Date);
    expect(service.pedidos().length).toBe(1);
  });

  it('não deve repetir automaticamente (sem retry) requisições POST quando ocorrer falha', async () => {
    const pizza = criarPizzaComOpcoes();
    const novo = montarPedidoNovo(
      [
        {
          id: 'item-1',
          produto: pizza,
          quantidade: 1,
          precoUnitario: 32.9,
          total: 32.9,
        },
      ],
      {
        clienteNome: 'Carlos Mendes',
        clienteTelefone: '(85) 99999-1122',
        tipoEntrega: 'retirada',
        formaPagamento: 'Pix',
      },
      32.9
    );

    const promessa = firstValueFrom(service.criarPedido(novo, 'idem-sem-retry'));

    const req = httpMock.expectOne('/api/pedidos');
    req.flush({ mensagem: 'Falha ao salvar pedido.' }, { status: 500, statusText: 'Server Error' });

    await expect(promessa).rejects.toEqual({
      status: 500,
      mensagem: 'Falha ao salvar pedido.',
    } satisfies ApiError);
  });
});
