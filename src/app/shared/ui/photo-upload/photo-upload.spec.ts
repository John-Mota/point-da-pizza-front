import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAX_PHOTO_SIZE_BYTES, PdpPhotoUpload } from './photo-upload';

describe('PdpPhotoUpload', () => {
  let fixture: ComponentFixture<PdpPhotoUpload>;
  let component: PdpPhotoUpload;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpPhotoUpload],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpPhotoUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve rejeitar arquivo .gif e exibir mensagem "Use JPG, PNG ou WebP"', () => {
    const gifFile = new File(['gif-content'], 'avatar.gif', { type: 'image/gif' });
    component.processFile(gifFile);
    fixture.detectChanges();

    expect(component.value()).toBeNull();
    expect(component.errorMessage()).toBe('Use JPG, PNG ou WebP');
  });

  it('deve rejeitar arquivo acima de 2 MB e exibir mensagem "A foto deve ter no máximo 2 MB"', () => {
    const largeBuffer = new Uint8Array(MAX_PHOTO_SIZE_BYTES + 1024);
    const largeFile = new File([largeBuffer], 'grande.jpg', { type: 'image/jpeg' });
    component.processFile(largeFile);
    fixture.detectChanges();

    expect(component.value()).toBeNull();
    expect(component.errorMessage()).toBe('A foto deve ter no máximo 2 MB');
  });

  it('deve aceitar arquivo .jpg válido até 2 MB e limpar o valor ao remover', () => {
    const jpgFile = new File(['jpg-content'], 'perfil.jpg', { type: 'image/jpeg' });
    component.processFile(jpgFile);
    fixture.detectChanges();

    expect(component.value()).toBe(jpgFile);
    expect(component.errorMessage()).toBeNull();

    component.removePhoto();
    fixture.detectChanges();

    expect(component.value()).toBeNull();
    expect(component.previewUrl()).toBeNull();
  });

  it('deve calcular as iniciais corretamente a partir do nome informado', () => {
    fixture.componentRef.setInput('name', 'João Silva');
    fixture.detectChanges();
    expect(component.initials()).toBe('JS');

    fixture.componentRef.setInput('name', "Ana-Maria D'Ávila");
    fixture.detectChanges();
    expect(component.initials()).toBe('AD');
  });
});

