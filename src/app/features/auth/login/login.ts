import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PdpCard } from '../../../shared/ui/cards';

export type LoginType = 'email' | 'phone';

export const MOCK_USER_CREDENTIALS = {
  email: 'pointdapizza@gmail.com',
  senha: 'John3472',
  nome: 'Point da Pizza',
} as const;

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  if (!value) return null;

  const errors: ValidationErrors = {};
  if (value.length < 8) errors['minlength'] = { requiredLength: 8, actualLength: value.length };
  if (value.length > 10) errors['maxlength'] = { requiredLength: 10, actualLength: value.length };
  if (!/[a-z]/.test(value)) errors['requiresLowercase'] = true;
  if (!/[A-Z]/.test(value)) errors['requiresUppercase'] = true;
  if (!/\d/.test(value)) errors['requiresNumber'] = true;

  return Object.keys(errors).length > 0 ? errors : null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PdpCard],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly loginType = signal<LoginType>('email');
  readonly showPassword = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly submitSuccess = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, passwordValidator]],
    rememberMe: [false],
  });

  // Requisitos da senha em tempo real
  readonly passwordValue = signal<string>('');
  readonly hasMinLength = computed(() => this.passwordValue().length >= 8 && this.passwordValue().length <= 10);
  readonly hasUppercase = computed(() => /[A-Z]/.test(this.passwordValue()));
  readonly hasLowercase = computed(() => /[a-z]/.test(this.passwordValue()));
  readonly hasNumber = computed(() => /\d/.test(this.passwordValue()));
  readonly isPasswordValid = computed(
    () => this.hasMinLength() && this.hasUppercase() && this.hasLowercase() && this.hasNumber()
  );

  constructor() {
    this.loginForm.get('password')?.valueChanges.subscribe((val) => {
      this.passwordValue.set(val || '');
    });
  }

  setLoginType(type: LoginType): void {
    if (this.loginType() === type) return;

    this.loginType.set(type);
    this.submitSuccess.set(null);
    this.submitError.set(null);

    const emailCtrl = this.loginForm.get('email');
    const phoneCtrl = this.loginForm.get('phone');

    if (type === 'email') {
      emailCtrl?.setValidators([Validators.required, Validators.email]);
      phoneCtrl?.clearValidators();
      phoneCtrl?.setValue('');
    } else {
      phoneCtrl?.setValidators([
        Validators.required,
        Validators.pattern(/^\(?\d{2}\)?\s?9\d{4}-?\d{4}$/),
      ]);
      emailCtrl?.clearValidators();
      emailCtrl?.setValue('');
    }

    emailCtrl?.updateValueAndValidity();
    phoneCtrl?.updateValueAndValidity();
  }

  toggleShowPassword(): void {
    this.showPassword.update((prev) => !prev);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatPhone(input.value);
    input.value = formatted;
    this.loginForm.get('phone')?.setValue(formatted, { emitModelToViewChange: false });
  }

  formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  onSubmit(): void {
    this.submitSuccess.set(null);
    this.submitError.set(null);

    if (this.loginType() === 'email') {
      const emailCtrl = this.loginForm.get('email');
      const trimmedEmail = String(emailCtrl?.value ?? '').trim();
      if (emailCtrl && emailCtrl.value !== trimmedEmail) {
        emailCtrl.setValue(trimmedEmail);
      }
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const emailInput = String(this.loginForm.value.email ?? '')
      .trim()
      .toLowerCase();
    const passwordInput = String(this.loginForm.value.password ?? '');
    const identifier = this.loginType() === 'email' ? emailInput : this.loginForm.value.phone;

    // Simulação de login seguro (sem backend)
    setTimeout(() => {
      this.isSubmitting.set(false);

      if (
        this.loginType() === 'email' &&
        emailInput === MOCK_USER_CREDENTIALS.email &&
        passwordInput !== MOCK_USER_CREDENTIALS.senha
      ) {
        this.submitError.set('E-mail ou senha inválidos.');
        return;
      }

      this.submitSuccess.set(`Autenticação efetuada com sucesso para ${identifier}!`);
      void this.router.navigate(['/']);
    }, 700);
  }
}

