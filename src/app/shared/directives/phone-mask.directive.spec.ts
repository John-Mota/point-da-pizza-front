import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PdpPhoneMask } from './phone-mask.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, PdpPhoneMask],
  template: `<input type="tel" pdpPhoneMask [formControl]="phoneControl" />`,
})
class TestHostComponent {
  readonly phoneControl = new FormControl<string>('', { nonNullable: true });
}

describe('PdpPhoneMask', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('deve formatar visualmente como (85) 99999-9999 e armazenar apenas dígitos no FormControl', () => {
    inputEl.value = '85988776655';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('(85) 98877-6655');
    expect(host.phoneControl.value).toBe('85988776655');
  });

  it('deve formatar o valor visual ao receber dígitos via writeValue', () => {
    host.phoneControl.setValue('85999998888');
    fixture.detectChanges();

    expect(inputEl.value).toBe('(85) 99999-8888');
  });
});

