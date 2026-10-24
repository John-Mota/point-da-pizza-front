import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Produto } from '../../../../shared/models';
import { CATEGORIAS_MOCK, PRODUTOS_MOCK, montarCardapio } from '../../data';
import { PdpProdutosLista } from './produtos-lista';

describe('PdpProdutosLista', () => {
  let fixture: ComponentFixture<PdpProdutosLista>;
  const secoes = montarCardapio(CATEGORIAS_MOCK, PRODUTOS_MOCK);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PdpProdutosLista] }).compileComponents();
    fixture = TestBed.createComponent(PdpProdutosLista);
  });

  it('renderiza uma seção "cat-{id}" por categoria com os itens corretos', () => {
    fixture.componentRef.setInput('secoes', secoes);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const sections = Array.from(el.querySelectorAll('section'));
    expect(sections.map((s) => s.id)).toEqual(secoes.map((s) => `cat-${s.categoria.id}`));

    sections.forEach((section, i) => {
      const titulo = section.querySelector('h2')!;
      expect(section.getAttribute('aria-labelledby')).toBe(titulo.id);
      expect(titulo.textContent!.trim()).toBe(secoes[i].categoria.nome);
      const nomes = Array.from(section.querySelectorAll('li h3')).map((h) => h.textContent!.trim());
      expect(nomes).toEqual(secoes[i].produtos.map((p) => p.nome));
    });
  });

  it('repassa o (pedir) do item', () => {
    fixture.componentRef.setInput('secoes', secoes);
    fixture.detectChanges();
    const emitidos: Produto[] = [];
    fixture.componentInstance.pedir.subscribe((p) => emitidos.push(p));

    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLButtonElement>('#cat-bebidas .pdp-produto-item__cta')!.click();
    expect(emitidos).toEqual([secoes.find((s) => s.categoria.id === 'bebidas')!.produtos[0]]);
  });

  it('carregando: 2 categorias com 3 skeletons cada', () => {
    fixture.componentRef.setInput('carregando', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.pdp-produtos-lista__sk-item').length).toBe(6);
  });

  it('vazio: mostra "Cardápio em atualização" sem botões', () => {
    fixture.componentRef.setInput('secoes', []);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cardápio em atualização');
    expect(el.querySelector('button')).toBeNull();
  });
});

