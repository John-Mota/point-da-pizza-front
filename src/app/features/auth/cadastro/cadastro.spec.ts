import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MAX_PHOTO_SIZE_BYTES } from '../../../shared/ui/photo-upload';
import { Cadastro } from './cadastro';
import { CadastroService } from './cadastro.service';

describe('Cadastro', () => {
  let fixture: ComponentFixture<Cadastro>;
  let component: Cadastro;
  let cadastroService: CadastroService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cadastro],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Cadastro);
    component = fixture.componentInstance;
    cadastroService = TestBed.inject(CadastroService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Validador de nome', () => {
    it('deve considerar "João" inválido (precisa de nome e sobrenome)', () => {
      const nomeCtrl = component.cadastroForm.controls.nome;
      nomeCtrl.setValue('João');
      expect(nomeCtrl.valid).toBe(false);
      expect(nomeCtrl.errors?.['minWords']).toBe(true);
    });

    it('deve considerar "João Silva" e "Ana-Maria D\'Ávila" válidos', () => {
      const nomeCtrl = component.cadastroForm.controls.nome;

      nomeCtrl.setValue('João Silva');
      expect(nomeCtrl.valid).toBe(true);
      expect(nomeCtrl.errors).toBeNull();

      nomeCtrl.setValue("Ana-Maria D'Ávila");
      expect(nomeCtrl.valid).toBe(true);
      expect(nomeCtrl.errors).toBeNull();
    });

    it('deve considerar "J S" inválido (cada palavra deve ter 2 ou mais letras)', () => {
      const nomeCtrl = component.cadastroForm.controls.nome;
      nomeCtrl.setValue('J S');
      expect(nomeCtrl.valid).toBe(false);
      expect(nomeCtrl.errors?.['minWords']).toBe(true);
    });

    it('deve considerar "João 2" inválido (não aceita números)', () => {
      const nomeCtrl = component.cadastroForm.controls.nome;
      nomeCtrl.setValue('João 2');
      expect(nomeCtrl.valid).toBe(false);
      expect(nomeCtrl.errors?.['invalidChars']).toBe(true);
    });
  });

  describe('Contato (telefone ou e-mail)', () => {
    it('deve retornar erro nos dois campos quando telefone e e-mail estiverem vazios', () => {
      const { telefone, email } = component.cadastroForm.controls;
      telefone.setValue('');
      email.setValue('');

      expect(component.cadastroForm.errors?.['contactRequired']).toBe(true);
      expect(telefone.errors?.['contactRequired']).toBe(true);
      expect(email.errors?.['contactRequired']).toBe(true);
    });

    it('deve ser válido quando apenas o e-mail válido for preenchido', () => {
      const { telefone, email } = component.cadastroForm.controls;
      telefone.setValue('');
      email.setValue('cliente@dominio.com');

      expect(component.cadastroForm.errors?.['contactRequired']).toBeFalsy();
      expect(email.valid).toBe(true);
      expect(telefone.valid).toBe(true);
      expect(component.isPhoneValid()).toBe(false);
      expect(component.cadastroForm.controls.telefoneWhatsapp.disabled).toBe(true);
    });

    it('deve ser válido quando apenas o telefone válido (11 dígitos) for preenchido e habilitar opção WhatsApp', () => {
      const { telefone, email, telefoneWhatsapp } = component.cadastroForm.controls;
      email.setValue('');
      telefone.setValue('85999998888');

      expect(component.cadastroForm.errors?.['contactRequired']).toBeFalsy();
      expect(telefone.valid).toBe(true);
      expect(email.valid).toBe(true);
      expect(component.isPhoneValid()).toBe(true);
      expect(telefoneWhatsapp.enabled).toBe(true);
    });

    it('deve invalidar telefone com 10 dígitos', () => {
      const { telefone } = component.cadastroForm.controls;
      telefone.setValue('8599998888'); // 10 dígitos

      expect(telefone.valid).toBe(false);
      expect(telefone.errors?.['invalidPhone']).toBe(true);
      expect(component.isPhoneValid()).toBe(false);
      expect(component.cadastroForm.controls.telefoneWhatsapp.disabled).toBe(true);
    });
  });

  describe('Senha', () => {
    it('deve invalidar "abcdefgh" (sem número), "12345678" (sem letra) e "abc123" (curta)', () => {
      const senhaCtrl = component.cadastroForm.controls.senha;

      senhaCtrl.setValue('abcdefgh');
      expect(senhaCtrl.valid).toBe(false);
      expect(senhaCtrl.errors?.['requiresNumber']).toBe(true);

      senhaCtrl.setValue('12345678');
      expect(senhaCtrl.valid).toBe(false);
      expect(senhaCtrl.errors?.['requiresLetter']).toBe(true);

      senhaCtrl.setValue('abc123');
      expect(senhaCtrl.valid).toBe(false);
      expect(senhaCtrl.errors?.['minlength']).toBeTruthy();
    });

    it('deve validar "abc12345"', () => {
      const senhaCtrl = component.cadastroForm.controls.senha;
      senhaCtrl.setValue('abc12345');

      expect(senhaCtrl.valid).toBe(true);
      expect(senhaCtrl.errors).toBeNull();
    });
  });

  describe('Confirmação de senha', () => {
    it('deve apontar erro quando diferente da senha e revalidar ao mudar a senha', () => {
      const { senha, confirmarSenha } = component.cadastroForm.controls;

      senha.setValue('abc12345');
      confirmarSenha.setValue('outrasenha1');
      expect(confirmarSenha.valid).toBe(false);
      expect(confirmarSenha.errors?.['passwordMismatch']).toBe(true);

      // Muda a senha para coincidir com confirmarSenha -> revalida automaticamente
      senha.setValue('outrasenha1');
      expect(confirmarSenha.valid).toBe(true);
      expect(confirmarSenha.errors).toBeNull();
    });
  });

  describe('Foto de perfil integrada ao formulário', () => {
    it('deve rejeitar .gif e arquivo acima de 2 MB, aceitar .jpg e limpar ao remover', () => {
      const photoDebugEl = fixture.debugElement.children[0].query(
        (de) => de.componentInstance?. processFile !== undefined
      );
      const photoComp = photoDebugEl.componentInstance;
      const fotoCtrl = component.cadastroForm.controls.foto;

      const gifFile = new File(['gif'], 'anim.gif', { type: 'image/gif' });
      photoComp.processFile(gifFile);
      expect(fotoCtrl.value).toBeNull();
      expect(photoComp.errorMessage()).toBe('Use JPG, PNG ou WebP');

      const bigFile = new File([new Uint8Array(MAX_PHOTO_SIZE_BYTES + 100)], 'big.jpg', {
        type: 'image/jpeg',
      });
      photoComp.processFile(bigFile);
      expect(fotoCtrl.value).toBeNull();
      expect(photoComp.errorMessage()).toBe('A foto deve ter no máximo 2 MB');

      const validJpg = new File(['jpg'], 'avatar.jpg', { type: 'image/jpeg' });
      photoComp.processFile(validJpg);
      expect(fotoCtrl.value).toBe(validJpg);
      expect(photoComp.errorMessage()).toBeNull();

      photoComp.removePhoto();
      expect(fotoCtrl.value).toBeNull();
    });
  });

  describe('Envio do formulário', () => {
    it('não deve chamar o serviço quando o formulário for inválido e deve exibir resumo de erro', () => {
      const spy = vi.spyOn(cadastroService, 'criarConta');

      component.submit();
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
      expect(component.showErrorSummary()).toBe(true);
      const summaryEl = (fixture.nativeElement as HTMLElement).querySelector(
        '.cadastro__summary-err'
      );
      expect(summaryEl?.textContent).toContain('Corrija os campos destacados');
    });

    it('deve chamar CadastroService.criarConta com payload correto (telefone só com dígitos e nome normalizado)', () => {
      const spy = vi
        .spyOn(cadastroService, 'criarConta')
        .mockReturnValue(of({ mensagem: 'Conta criada com sucesso!' }));
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.cadastroForm.controls.nome.setValue('  João   Silva  ');
      component.cadastroForm.controls.telefone.setValue('(85) 99999-8888');
      component.cadastroForm.controls.telefoneWhatsapp.setValue(true);
      component.cadastroForm.controls.email.setValue('  JOAO@Dominio.com ');
      component.cadastroForm.controls.senha.setValue('abc12345');
      component.cadastroForm.controls.confirmarSenha.setValue('abc12345');

      component.submit();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({
        nome: 'João Silva',
        telefone: '85999998888',
        telefoneWhatsapp: true,
        email: 'joao@dominio.com',
        senha: 'abc12345',
      });
      expect(navSpy).toHaveBeenCalledWith(['/login']);
    });

    it('deve exibir erro de servidor simulado no campo correspondente via setErrors', () => {
      vi.spyOn(cadastroService, 'criarConta').mockReturnValue(
        throwError(() => ({
          field: 'email' as const,
          message: 'Este e-mail já está cadastrado',
        }))
      );

      component.cadastroForm.controls.nome.setValue('Maria Souza');
      component.cadastroForm.controls.email.setValue('jaexiste@pointdapizza.com');
      component.cadastroForm.controls.senha.setValue('abc12345');
      component.cadastroForm.controls.confirmarSenha.setValue('abc12345');

      component.submit();
      fixture.detectChanges();

      expect(component.cadastroForm.controls.email.errors?.['serverError']).toBe(
        'Este e-mail já está cadastrado'
      );
    });
  });
});

