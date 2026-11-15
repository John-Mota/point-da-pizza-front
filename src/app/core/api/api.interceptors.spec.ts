import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService, AUTH_TOKEN_STORAGE_KEY, USUARIO_LOGADO_STORAGE_KEY } from '../auth';
import { API_RETRY_DELAY_MS, ApiError, authInterceptor, errorInterceptor } from './index';

describe('authInterceptor & errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.removeItem(USUARIO_LOGADO_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_RETRY_DELAY_MS, useValue: 1 },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    authService.sair();
  });

  it('não deve adicionar cabeçalho Authorization quando não houver token no AuthService', () => {
    http.get('/api/loja').subscribe();

    const req = httpMock.expectOne('/api/loja');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ nome: 'Point da Pizza' });
  });

  it('deve adicionar Authorization: Bearer {token} quando o AuthService possuir token', () => {
    authService.definirToken('token-teste-123');

    http.get('/api/loja').subscribe();

    const req = httpMock.expectOne('/api/loja');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-teste-123');
    req.flush({ nome: 'Point da Pizza' });
  });

  it('deve mapear erro 400/409 com mensagem e lista de campos em ApiError', async () => {
    const promessa = firstValueFrom(http.post('/api/auth/cadastro', { email: 'duplicado@teste.com' }));

    const req = httpMock.expectOne('/api/auth/cadastro');
    req.flush(
      {
        mensagem: 'Dados inválidos no cadastro.',
        campos: [{ campo: 'email', mensagem: 'Este e-mail já está cadastrado' }],
      },
      { status: 409, statusText: 'Conflict' }
    );

    await expect(promessa).rejects.toEqual({
      status: 409,
      mensagem: 'Dados inválidos no cadastro.',
      campos: [{ campo: 'email', mensagem: 'Este e-mail já está cadastrado' }],
    } satisfies ApiError);
  });

  it('deve fornecer mensagens padrão em português para erro de rede (status 0), 404 e 500', async () => {
    const pRede = firstValueFrom(http.post('/api/pedidos', {}));
    httpMock.expectOne('/api/pedidos').error(new ProgressEvent('error'));
    await expect(pRede).rejects.toEqual({
      status: 0,
      mensagem: 'Não foi possível conectar ao servidor',
    } satisfies ApiError);

    const p404 = firstValueFrom(http.post('/api/inexistente', {}));
    httpMock.expectOne('/api/inexistente').flush(null, { status: 404, statusText: 'Not Found' });
    await expect(p404).rejects.toEqual({
      status: 404,
      mensagem: 'Recurso não encontrado.',
    } satisfies ApiError);

    const p500 = firstValueFrom(http.post('/api/erro-interno', {}));
    httpMock
      .expectOne('/api/erro-interno')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await expect(p500).rejects.toEqual({
      status: 500,
      mensagem: 'Erro interno no servidor. Tente novamente em instantes.',
    } satisfies ApiError);
  });
});
