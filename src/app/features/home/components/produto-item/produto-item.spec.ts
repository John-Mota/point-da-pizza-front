import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Produto } from '../../../../shared/models';
import { PRODUTOS_MOCK } from '../../data';
import { PdpProdutoItem } from './produto-item';

describe('PdpProdutoItem', () => {
  let fixture: ComponentFixture<PdpProdutoItem>;

  const pizza = PRODUTOS_MOCK.find((p) => p.id === 'prod-trad-1')!;
  const bebida = PRODUTOS_MOCK.find((p) => p.id === 'prod-beb-1')!;

  function criar(produto: Produto): HTMLElement {
    fixture = TestBed.createComponent(PdpProdutoItem);
    fixture.componentRef.setInput('produto', produto);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PdpProdutoItem] }).compileComponents();
  });

  it('com tamanhos mostra "A partir de" com o menor preço', () => {
    const el = criar(pizza);
    const menor = Math.min(...pizza.tamanhos!.map((t) => t.preco));
    const preco = el.querySelector('.pdp-produto-item__preco')!.textContent!.replace(/\s+/g, ' ');

    expect(preco).toContain('A partir de');
    expect(preco).toContain(`R$ ${menor.toFixed(2).replace('.', ',')}`);
  });

  it('sem tamanhos mostra o preço direto, sem "A partir de"', () => {
    const el = criar(bebida);
    const preco = el.querySelector('.pdp-produto-item__preco')!.textContent!;
    expect(preco).not.toContain('A partir de');
    expect(preco).toContain('R$ 8,00');
  });

  it('sem imagem não renderiza a miniatura (sem espaço vazio)', () => {
    const el = criar({ ...bebida, imagemUrl: undefined });
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.pdp-produto-item--sem-imagem')).toBeTruthy();
  });

  it('cai para "sem imagem" quando a imagem falha ao carregar', () => {
    const el = criar(bebida);
    const img = el.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('88');
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(el.querySelector('img')).toBeNull();
  });

  it('indisponível: selo e botão desabilitado, sem emitir', () => {
    const el = criar({ ...bebida, disponivel: false });
    const emitidos: Produto[] = [];
    fixture.componentInstance.pedir.subscribe((p) => emitidos.push(p));

    const btn = el.querySelector<HTMLButtonElement>('.pdp-produto-item__cta')!;
    expect(btn.disabled).toBe(true);
    expect(el.textContent).toContain('Indisponível');
    btn.click();
    expect(emitidos).toEqual([]);
  });

  it('clique em "Pedir" emite o produto correto', () => {
    const el = criar(pizza);
    const emitidos: Produto[] = [];
    fixture.componentInstance.pedir.subscribe((p) => emitidos.push(p));

    const btn = el.querySelector<HTMLButtonElement>('.pdp-produto-item__cta')!;
    expect(btn.getAttribute('aria-label')).toBe(`Pedir ${pizza.nome}`);
    btn.click();
    expect(emitidos).toEqual([pizza]);
  });
});

