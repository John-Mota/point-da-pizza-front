import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function normalizeFullName(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

export function fullNameValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  const normalized = normalizeFullName(control.value);
  if (!normalized) {
    return { required: true };
  }

  if (!/^[\p{L}\s'’-]+$/u.test(normalized)) {
    return { invalidChars: true };
  }

  const words = normalized.split(' ');
  const hasInvalidWordStructure = words.some((word) => !/^\p{L}+(?:['’-]\p{L}+)*$/u.test(word));
  if (hasInvalidWordStructure) {
    return { invalidChars: true };
  }

  const hasMinWordsAndLength =
    words.length >= 2 && words.every((word) => word.replace(/['’-]/g, '').length >= 2);
  if (!hasMinWordsAndLength) {
    return { minWords: true };
  }

  return null;
}

export function phoneValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  const digits = (control.value ?? '').replace(/\D/g, '');
  if (!digits) {
    return null;
  }

  if (!/^[1-9]{2}9\d{8}$/.test(digits)) {
    return { invalidPhone: true };
  }

  return null;
}

export function emailValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  const raw = (control.value ?? '').trim().toLowerCase();
  if (!raw) {
    return null;
  }

  const angularEmailError = Validators.email({ value: raw } as AbstractControl);
  const hasDomainWithDot = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw);

  if (angularEmailError !== null || !hasDomainWithDot) {
    return { email: true };
  }

  return null;
}

function syncChildControlError(
  control: AbstractControl | null,
  errorKey: string,
  shouldSet: boolean
): void {
  if (!control) return;
  const currentErrors = control.errors ? { ...control.errors } : {};

  if (shouldSet) {
    if (!currentErrors[errorKey]) {
      control.setErrors({ ...currentErrors, [errorKey]: true }, { emitEvent: false });
    }
  } else if (currentErrors[errorKey]) {
    delete currentErrors[errorKey];
    const nextErrors = Object.keys(currentErrors).length > 0 ? currentErrors : null;
    control.setErrors(nextErrors, { emitEvent: false });
  }
}

export function contactGroupValidator(group: AbstractControl): ValidationErrors | null {
  const telefoneCtrl = group.get('telefone');
  const emailCtrl = group.get('email');

  const phoneDigits = (telefoneCtrl?.value ?? '').replace(/\D/g, '');
  const emailValue = (emailCtrl?.value ?? '').trim();

  const bothEmpty = phoneDigits.length === 0 && emailValue.length === 0;

  syncChildControlError(telefoneCtrl, 'contactRequired', bothEmpty);
  syncChildControlError(emailCtrl, 'contactRequired', bothEmpty);

  return bothEmpty ? { contactRequired: true } : null;
}

export function cadastroPasswordValidator(
  control: AbstractControl<string | null>
): ValidationErrors | null {
  const value = control.value ?? '';
  if (!value) {
    return { required: true };
  }

  const errors: ValidationErrors = {};

  if (value !== value.trim()) {
    errors['edgeSpaces'] = true;
  }
  if (value.length < 8) {
    errors['minlength'] = { requiredLength: 8, actualLength: value.length };
  }
  if (!/\p{L}/u.test(value)) {
    errors['requiresLetter'] = true;
  }
  if (!/\d/.test(value)) {
    errors['requiresNumber'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const senhaCtrl = group.get('senha');
  const confirmarCtrl = group.get('confirmarSenha');

  const senha = senhaCtrl?.value ?? '';
  const confirmar = confirmarCtrl?.value ?? '';

  const mismatch = confirmar.length > 0 && senha !== confirmar;

  syncChildControlError(confirmarCtrl, 'passwordMismatch', mismatch);

  return mismatch ? { passwordMismatch: true } : null;
}

