import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

@Component({
  selector: 'pdp-photo-upload',
  standalone: true,
  templateUrl: './photo-upload.html',
  styleUrl: './photo-upload.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PdpPhotoUpload),
      multi: true,
    },
  ],
})
export class PdpPhotoUpload implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  readonly name = input<string>('');
  readonly inputId = input<string>('pdp-photo-upload-input');

  readonly value = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isDragging = signal<boolean>(false);
  readonly isDisabled = signal<boolean>(false);

  readonly initials = computed(() => {
    const raw = this.name().trim().replace(/\s+/g, ' ');
    if (!raw) return '';
    const words = raw.split(' ').filter((w) => /\p{L}/u.test(w));
    if (words.length === 0) return '';
    const firstLetter = (word: string): string => {
      const match = word.match(/\p{L}/u);
      return match ? match[0].toUpperCase() : '';
    };
    if (words.length === 1) {
      return firstLetter(words[0]);
    }
    return `${firstLetter(words[0])}${firstLetter(words[words.length - 1])}`;
  });

  private onChange: (value: File | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.revokePreviewUrl();
    });
  }

  writeValue(file: File | null): void {
    this.revokePreviewUrl();
    this.errorMessage.set(null);

    if (file instanceof File) {
      this.value.set(file);
      this.createPreviewUrl(file);
    } else {
      this.value.set(null);
    }
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  triggerFileInput(): void {
    if (this.isDisabled()) return;
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0] ?? null;
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isDisabled()) {
      this.isDragging.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (this.isDisabled()) return;

    const file = event.dataTransfer?.files?.[0] ?? null;
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file: File): void {
    const isAllowedMime = (ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type);
    const isAllowedExt = !file.type && /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!isAllowedMime && !isAllowedExt) {
      this.revokePreviewUrl();
      this.value.set(null);
      this.errorMessage.set('Use JPG, PNG ou WebP');
      this.resetNativeInput();
      this.onChange(null);
      this.onTouched();
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      this.revokePreviewUrl();
      this.value.set(null);
      this.errorMessage.set('A foto deve ter no máximo 2 MB');
      this.resetNativeInput();
      this.onChange(null);
      this.onTouched();
      return;
    }

    this.revokePreviewUrl();
    this.errorMessage.set(null);
    this.value.set(file);
    this.createPreviewUrl(file);
    this.onChange(file);
    this.onTouched();
  }

  removePhoto(): void {
    if (this.isDisabled()) return;
    this.revokePreviewUrl();
    this.value.set(null);
    this.errorMessage.set(null);
    this.resetNativeInput();
    this.onChange(null);
    this.onTouched();
  }

  private createPreviewUrl(file: File): void {
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      this.previewUrl.set(URL.createObjectURL(file));
    }
  }

  private revokePreviewUrl(): void {
    const currentUrl = this.previewUrl();
    if (currentUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(currentUrl);
    }
    this.previewUrl.set(null);
  }

  private resetNativeInput(): void {
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
}

