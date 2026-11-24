import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ApiError } from '../../../core/api';
import { AuthService } from '../../../core/auth';
import { criarUsuarioLogado } from '../../../testing';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve inicializar com o método de e-mail ativo por padrão e formulário inválido', () => {
    expect(component.loginType()).toBe('email');
    expect(component.loginForm.valid).toBe(false);
  });

  it('deve renderizar a imagem do logotipo oficial no cabeçalho', () => {
    const el = fixture.nativeElement as HTMLElement;
    const logoImg = el.querySelector<HTMLImageElement>('.login__logo');
    expect(logoImg).toBeTruthy();
    expect(logoImg?.getAttribute('src')).toBe('/img/logo.png');
    expect(logoImg?.getAttribute('alt')).toBe('Point da Pizza');
  });

  describe('Validação de Senha (8 a 10 caracteres, maiúscula, minúscula e número)', () => {
    const passwordCtrl = () => component.loginForm.get('password');

    it('deve rejeitar senha com menos de 8 caracteres', () => {
      passwordCtrl()?.setValue('Piz123');
      expect(passwordCtrl()?.errors?.['minlength']).toBeTruthy();
      expect(component.hasMinLength()).toBe(false);
      expect(component.isPasswordValid()).toBe(false);
    });

    it('deve rejeitar senha com mais de 10 caracteres', () => {
      passwordCtrl()?.setValue('Pizza123456');
      expect(passwordCtrl()?.errors?.['maxlength']).toBeTruthy();
      expect(component.hasMinLength()).toBe(false);
      expect(component.isPasswordValid()).toBe(false);
    });

    it('deve rejeitar senha sem letra maiúscula', () => {
      passwordCtrl()?.setValue('pizza123');
      expect(passwordCtrl()?.errors?.['requiresUppercase']).toBeTruthy();
      expect(component.hasUppercase()).toBe(false);
      expect(component.isPasswordValid()).toBe(false);
    });

    it('deve rejeitar senha sem letra minúscula', () => {
      passwordCtrl()?.setValue('PIZZA123');
      expect(passwordCtrl()?.errors?.['requiresLowercase']).toBeTruthy();
      expect(component.hasLowercase()).toBe(false);
      expect(component.isPasswordValid()).toBe(false);
    });

    it('deve rejeitar senha sem números', () => {
      passwordCtrl()?.setValue('PizzaTop');
      expect(passwordCtrl()?.errors?.['requiresNumber']).toBeTruthy();
      expect(component.hasNumber()).toBe(false);
      expect(component.isPasswordValid()).toBe(false);
    });

    it('deve aceitar senha válida com 8 a 10 caracteres contendo maiúscula, minúscula e número', () => {
      passwordCtrl()?.setValue('Pizza123');
      expect(passwordCtrl()?.errors).toBeNull();
      expect(component.isPasswordValid()).toBe(true);

      passwordCtrl()?.setValue('P0intPizza');
      expect(passwordCtrl()?.errors).toBeNull();
      expect(component.isPasswordValid()).toBe(true);
    });

    it('deve exibir mensagem de senha incompleta quando tocado com menos de 8 caracteres e não exibir lista de regras', () => {
      passwordCtrl()?.setValue('Piz12');
      passwordCtrl()?.markAsTouched();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.login__rules')).toBeNull();

      const errSpan = el.querySelector('.login__err');
      expect(errSpan?.textContent).toContain(
        'A senha não está completa: digite no mínimo 8 caracteres.'
      );
    });
  });

  describe('Alternância de E-mail e Telefone', () => {
    it('deve validar e-mail quando loginType for "email"', () => {
      component.setLoginType('email');
      const emailCtrl = component.loginForm.get('email');
      const phoneCtrl = component.loginForm.get('phone');

      emailCtrl?.setValue('invalido');
      expect(emailCtrl?.valid).toBe(false);

      emailCtrl?.setValue('cliente@pointdapizza.com.br');
      expect(emailCtrl?.valid).toBe(true);
      expect(phoneCtrl?.validator).toBeNull();
    });

    it('deve validar telefone quando loginType for alterado para "phone"', () => {
      component.setLoginType('phone');
      expect(component.loginType()).toBe('phone');

      const emailCtrl = component.loginForm.get('email');
      const phoneCtrl = component.loginForm.get('phone');

      expect(emailCtrl?.validator).toBeNull();

      phoneCtrl?.setValue('8599999');
      expect(phoneCtrl?.valid).toBe(false);

      phoneCtrl?.setValue('(85) 99999-9999');
      expect(phoneCtrl?.valid).toBe(true);
    });

    it('deve formatar número de telefone corretamente na digitação', () => {
      expect(component.formatPhone('85988776655')).toBe('(85) 98877-6655');
    });
  });

  describe('Visibilidade de Senha', () => {
    it('deve alternar a visibilidade da senha ao chamar toggleShowPassword', () => {
      expect(component.showPassword()).toBe(false);
      component.toggleShowPassword();
      expect(component.showPassword()).toBe(true);
      component.toggleShowPassword();
      expect(component.showPassword()).toBe(false);
    });
  });

  describe('Submissão do Formulário via AuthService', () => {
    it('deve marcar campos como tocados ao submeter formulário inválido', () => {
      component.onSubmit();
      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);
      expect(component.isSubmitting()).toBe(false);
    });

    it('deve chamar AuthService.login e redirecionar para a home em caso de sucesso', () => {
      const router = TestBed.inject(Router);
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const loginSpy = vi.spyOn(authService, 'login').mockReturnValue(
        of({
          mensagem: 'Autenticação efetuada com sucesso para joao@pizzaria.com!',
          usuario: criarUsuarioLogado({ email: 'joao@pizzaria.com' }),
        })
      );

      component.loginForm.patchValue({
        email: 'joao@pizzaria.com',
        password: 'Pizza123',
      });

      component.onSubmit();

      expect(loginSpy).toHaveBeenCalledWith({
        email: 'joao@pizzaria.com',
        senha: 'Pizza123',
        lembrarMe: false,
      });
      expect(component.isSubmitting()).toBe(false);
      expect(component.submitSuccess()).toContain('joao@pizzaria.com');
      expect(navSpy).toHaveBeenCalledWith(['/']);
    });

    it('deve exibir mensagem de ApiError quando o login falhar', () => {
      const erroApi: ApiError = {
        status: 401,
        mensagem: 'E-mail ou senha inválidos.',
      };
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => erroApi));

      component.loginForm.patchValue({
        email: 'joao@pizzaria.com',
        password: 'Pizza123',
      });

      component.onSubmit();

      expect(component.isSubmitting()).toBe(false);
      expect(component.submitError()).toBe('E-mail ou senha inválidos.');
    });
  });
});
