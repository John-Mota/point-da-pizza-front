import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemConfigurado, Produto } from '../../../../shared/models';
import { PRODUTOS_MOCK } from '../../data';
import { PdpProdutoDetalhe } from './produto-detalhe';
import { ProdutoDetalheService } from './produto-detalhe.service';

describe('PdpProdutoDetalhe & ProdutoDetalheService', () => {
  let fixture: ComponentFixture<PdpProdutoDetalhe>;
  let component: PdpProdutoDetalhe;
  let service: ProdutoDetalheService;

  const pizzaComOpcoes: Produto = {
    ...PRODUTOS_MOCK.find((p) => p.id === 'prod-trad-1')!,
    tamanhos: [
      { id: 'P', nome: 'Pequena (P)', preco: 29.9 },
      { id: 'G', nome: 'Grande (G)', preco: 39.9 },
    ],
    bordas: [
      { id: 'requeijao', nome: 'Requeijão', acrescimo: 0 },
      { id: 'cheddar', nome: 'Cheddar', acrescimo: 6.0 },
    ],
  };

  const bebidaSemOpcoes: Produto = {
    ...PRODUTOS_MOCK.find((p) => p.id === 'prod-beb-1')!,
    tamanhos: undefined,
    bordas: undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdpProdutoDetalhe],
    }).compileComponents();

    service = TestBed.inject(ProdutoDetalheService);
    service.fechar();
    fixture = TestBed.createComponent(PdpProdutoDetalhe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    service.fechar();
  });

  it('não deve abrir caso o produto esteja indisponível', () => {
    service.abrir({ ...bebidaSemOpcoes, disponivel: false });
    fixture.detectChanges();

    expect(service.aberto()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('produto com tamanhos exige escolha: sem escolher não emite e mostra erro "Escolha um tamanho"; escolhendo, o total muda', () => {
    const adicionados: ItemConfigurado[] = [];
    component.adicionar.subscribe((item) => adicionados.push(item));

    service.abrir(pizzaComOpcoes);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const confirmarBtn = hostEl.querySelector<HTMLButtonElement>('.pdp-detalhe__confirmar')!;
    expect(confirmarBtn.disabled).toBe(false);

    // Tenta confirmar sem escolher tamanho
    confirmarBtn.click();
    fixture.detectChanges();

    expect(adicionados.length).toBe(0);
    expect(service.aberto()).toBe(true);
    const erroEl = hostEl.querySelector('#pdp-detalhe-erro-tamanho');
    expect(erroEl?.textContent).toContain('Escolha um tamanho');

    // Escolhe o tamanho Grande (G) = R$ 39,90
    const radiosTamanho = hostEl.querySelectorAll<HTMLButtonElement>(
      '[aria-labelledby="pdp-detalhe-label-tamanho"] [role="radio"]'
    );
    expect(radiosTamanho.length).toBe(2);
    radiosTamanho[1].click();
    fixture.detectChanges();

    expect(hostEl.querySelector('#pdp-detalhe-erro-tamanho')).toBeNull();
    expect(hostEl.querySelector('.pdp-detalhe__total-valor')?.textContent).toContain('R$ 39,90');
  });

  it('borda soma o acréscimo, quantidade multiplica, exibe total em BRL correto e emite ItemConfigurado ao confirmar', () => {
    const adicionados: ItemConfigurado[] = [];
    component.adicionar.subscribe((item) => adicionados.push(item));

    service.abrir(pizzaComOpcoes);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;

    // 1. Escolhe tamanho G (39,90)
    const radiosTamanho = hostEl.querySelectorAll<HTMLButtonElement>(
      '[aria-labelledby="pdp-detalhe-label-tamanho"] [role="radio"]'
    );
    radiosTamanho[1].click();
    fixture.detectChanges();

    // 2. Verifica opções de borda: "Sem borda" padrão, "Requeijão" (acréscimo 0 sem valor), "Cheddar" (+ R$ 6,00)
    const radiosBorda = hostEl.querySelectorAll<HTMLButtonElement>(
      '[aria-labelledby="pdp-detalhe-label-borda"] [role="radio"]'
    );
    expect(radiosBorda.length).toBe(3);
    expect(radiosBorda[0].getAttribute('aria-checked')).toBe('true');
    expect(radiosBorda[1].textContent).not.toContain('R$');
    expect(radiosBorda[2].textContent).toContain('+ R$ 6,00');

    // Seleciona borda Cheddar (+6,00 => unitário 45,90)
    radiosBorda[2].click();
    fixture.detectChanges();
    expect(component.precoUnitario()).toBe(45.9);

    // 3. Aumenta quantidade para 2 (45,90 * 2 = 91,80)
    const btnMais = hostEl.querySelector<HTMLButtonElement>('.pdp-qty-stepper__btn--plus')!;
    btnMais.click();
    fixture.detectChanges();

    expect(component.quantidade()).toBe(2);
    expect(component.total()).toBe(91.8);
    expect(hostEl.querySelector('.pdp-detalhe__total-valor')?.textContent).toContain('R$ 91,80');

    // 4. Confirma e verifica ItemConfigurado emitido
    hostEl.querySelector<HTMLButtonElement>('.pdp-detalhe__confirmar')!.click();
    fixture.detectChanges();

    expect(adicionados).toEqual([
      {
        produto: pizzaComOpcoes,
        tamanhoId: 'G',
        bordaId: 'cheddar',
        observacao: undefined,
        quantidade: 2,
        precoUnitario: 45.9,
        total: 91.8,
      },
    ]);
    expect(service.aberto()).toBe(false);
  });

  it('produto sem tamanhos nem bordas abre apenas com observação e quantidade', () => {
    service.abrir(bebidaSemOpcoes);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.querySelector('[aria-labelledby="pdp-detalhe-label-tamanho"]')).toBeNull();
    expect(hostEl.querySelector('[aria-labelledby="pdp-detalhe-label-borda"]')).toBeNull();
    expect(hostEl.querySelector('#pdp-detalhe-obs')).toBeTruthy();
    expect(hostEl.querySelector('pdp-quantity-stepper')).toBeTruthy();
  });

  it('Esc fecha o modal, retorna o foco ao botão de origem e a observação respeita o limite de 200 caracteres', () => {
    const botaoOrigem = document.createElement('button');
    botaoOrigem.textContent = 'Pedir Origem';
    document.body.appendChild(botaoOrigem);
    botaoOrigem.focus();

    try {
      service.abrir(bebidaSemOpcoes, botaoOrigem);
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      const textarea = hostEl.querySelector<HTMLTextAreaElement>('#pdp-detalhe-obs')!;
      textarea.value = 'A'.repeat(250);
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.observacao().length).toBe(200);
      expect(hostEl.querySelector('.pdp-detalhe__contador')?.textContent).toContain('200/200');

      const dialog = hostEl.querySelector<HTMLElement>('[role="dialog"]')!;
      dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(service.aberto()).toBe(false);
      expect(document.activeElement).toBe(botaoOrigem);
    } finally {
      botaoOrigem.remove();
    }
  });
});

