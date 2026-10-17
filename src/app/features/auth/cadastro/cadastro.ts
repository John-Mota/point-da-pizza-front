import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PdpPhoneMask } from '../../../shared/directives';
import { CadastroPayload } from '../../../shared/models';
import { PdpCard, PdpPhotoUpload } from '../../../shared/ui';
import { CadastroServerError, CadastroService } from './cadastro.service';
import {
  cadastroPasswordValidator,
  contactGroupValidator,
  emailValidator,
  fullNameValidator,
  normalizeFullName,
  passwordMatchValidator,
  phoneValidator,
} from './cadastro.validators';

export interface CadastroFormControls {
  nome: FormControl<string>;
  telefone: FormControl<string>;
  telefoneWhatsapp: FormControl<boolean>;
  email: FormControl<string>;
  senha: FormControl<string>;
  confirmarSenha: FormControl<string>;
  foto: FormControl<File | null>;
}

const FIELD_FOCUS_ORDER: ReadonlyArray<{
  controlName: keyof CadastroFormControls;
  elementId: string;
}> = [
  { controlName: 'nome', elementId: 'pdp-cadastro-nome' },
  { controlName: 'telefone', elementId: 'pdp-cadastro-telefone' },
  { controlName: 'email', elementId: 'pdp-cadastro-email' },
  { controlName: 'senha', elementId: 'pdp-cadastro-senha' },
  { controlName: 'confirmarSenha', elementId: 'pdp-cadastro-confirmar-senha' },
];

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PdpCard,
    PdpPhotoUpload,
    PdpPhoneMask,
  ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cadastro {
  private readonly router = inject(Router);
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cadastroService = inject(CadastroService);

  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly hasAttemptedSubmit = signal<boolean>(false);
  readonly showErrorSummary = signal<boolean>(false);
  readonly submitSuccess = signal<string | null>(null);

  readonly nomeValue = signal<string>('');
  readonly telefoneValue = signal<string>('');
  readonly senhaValue = signal<string>('');

  readonly isPhoneValid = computed(() =>
    /^[1-9]{2}9\d{8}$/.test(this.telefoneValue().replace(/\D/g, ''))
  );

  readonly hasMinLength = computed(() => this.senhaValue().length >= 8);
  readonly hasLetter = computed(() => /\p{L}/u.test(this.senhaValue()));
  readonly hasNumber = computed(() => /\d/.test(this.senhaValue()));

  readonly cadastroForm = new FormGroup<CadastroFormControls>(
    {
      nome: new FormControl<string>('', {
        nonNullable: true,
        validators: [fullNameValidator],
      }),
      telefone: new FormControl<string>('', {
        nonNullable: true,
        validators: [phoneValidator],
      }),
      telefoneWhatsapp: new FormControl<boolean>(
        { value: false, disabled: true },
        { nonNullable: true }
      ),
      email: new FormControl<string>('', {
        nonNullable: true,
        validators: [emailValidator],
      }),
      senha: new FormControl<string>('', {
        nonNullable: true,
        validators: [cadastroPasswordValidator],
      }),
      confirmarSenha: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      foto: new FormControl<File | null>(null),
    },
    {
      validators: [contactGroupValidator, passwordMatchValidator],
    }
  );

  constructor() {
    this.cadastroForm.controls.nome.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.nomeValue.set(val ?? '');
      });

    this.cadastroForm.controls.telefone.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        const current = val ?? '';
        this.telefoneValue.set(current);

        const validPhone = /^[1-9]{2}9\d{8}$/.test(current.replace(/\D/g, ''));
        const whatsappCtrl = this.cadastroForm.controls.telefoneWhatsapp;

        if (validPhone) {
          if (whatsappCtrl.disabled) {
            whatsappCtrl.enable({ emitEvent: false });
          }
        } else {
          if (whatsappCtrl.value !== false) {
            whatsappCtrl.setValue(false, { emitEvent: false });
          }
          if (whatsappCtrl.enabled) {
            whatsappCtrl.disable({ emitEvent: false });
          }
        }
      });

    this.cadastroForm.controls.senha.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.senhaValue.set(val ?? '');
        this.cadastroForm.controls.confirmarSenha.updateValueAndValidity({
          onlySelf: true,
          emitEvent: false,
        });
        this.cadastroForm.updateValueAndValidity({ emitEvent: false });
      });

    this.cadastroForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.cadastroForm.valid && this.showErrorSummary()) {
          this.showErrorSummary.set(false);
        }
      });
  }

  shouldShowError(controlName: keyof CadastroFormControls): boolean {
    const ctrl = this.cadastroForm.controls[controlName];
    return (ctrl.touched || this.hasAttemptedSubmit()) && ctrl.invalid;
  }

  onNomeBlur(): void {
    const ctrl = this.cadastroForm.controls.nome;
    ctrl.markAsTouched();
    const normalized = normalizeFullName(ctrl.value);
    if (ctrl.value !== normalized) {
      ctrl.setValue(normalized);
    }
  }

  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\s+/g, '').toLowerCase();
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    this.cadastroForm.controls.email.setValue(sanitized, {
      emitModelToViewChange: false,
    });
  }

  onEmailBlur(): void {
    const ctrl = this.cadastroForm.controls.email;
    ctrl.markAsTouched();
    const sanitized = ctrl.value.replace(/\s+/g, '').toLowerCase();
    if (ctrl.value !== sanitized) {
      ctrl.setValue(sanitized);
    }
  }

  toggleShowPassword(): void {
    this.showPassword.update((prev) => !prev);
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update((prev) => !prev);
  }

  submit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.submitSuccess.set(null);

    const nomeCtrl = this.cadastroForm.controls.nome;
    const normalizedNome = normalizeFullName(nomeCtrl.value);
    if (nomeCtrl.value !== normalizedNome) {
      nomeCtrl.setValue(normalizedNome);
    }

    const emailCtrl = this.cadastroForm.controls.email;
    const normalizedEmail = emailCtrl.value.replace(/\s+/g, '').toLowerCase();
    if (emailCtrl.value !== normalizedEmail) {
      emailCtrl.setValue(normalizedEmail);
    }

    this.cadastroForm.updateValueAndValidity();

    if (this.cadastroForm.invalid) {
      this.hasAttemptedSubmit.set(true);
      this.showErrorSummary.set(true);
      this.cadastroForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    this.showErrorSummary.set(false);
    this.isSubmitting.set(true);

    const raw = this.cadastroForm.getRawValue();
    const telefoneDigits = raw.telefone.replace(/\D/g, '');
    const emailClean = raw.email.trim().toLowerCase();

    const payload: CadastroPayload = {
      nome: normalizeFullName(raw.nome),
      ...(telefoneDigits ? { telefone: telefoneDigits } : {}),
      telefoneWhatsapp: this.isPhoneValid() ? Boolean(raw.telefoneWhatsapp) : false,
      ...(emailClean ? { email: emailClean } : {}),
      senha: raw.senha,
      ...(raw.foto ? { foto: raw.foto } : {}),
    };

    this.cadastroService
      .criarConta(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(response.mensagem);
          void this.router.navigate(['/login']);
        },
        error: (err: CadastroServerError) => {
          this.isSubmitting.set(false);
          if (err?.field && err.field in this.cadastroForm.controls) {
            const targetCtrl = this.cadastroForm.controls[err.field];
            targetCtrl.setErrors({
              ...(targetCtrl.errors ?? {}),
              serverError: err.message,
            });
            targetCtrl.markAsTouched();
            this.hasAttemptedSubmit.set(true);
            this.showErrorSummary.set(true);
            this.focusFirstInvalidField();
          }
        },
      });
  }

  private focusFirstInvalidField(): void {
    const root = this.hostEl.nativeElement;
    for (const item of FIELD_FOCUS_ORDER) {
      const ctrl = this.cadastroForm.controls[item.controlName];
      if (ctrl.invalid) {
        const element = root.querySelector<HTMLElement>(`#${item.elementId}`);
        element?.focus();
        break;
      }
    }
  }
}

