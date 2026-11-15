import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Rich } from './Rich';

describe('Rich (Markdown + KaTeX)', () => {
  it('gère le gras imbriqué avec des formules sans boucler', () => {
    const html = renderToStaticMarkup(<Rich text={'Toiture à **un versant $\\alpha$** et *italique*, `code`, prix \\$5'} />);
    expect(html).toContain('<strong>');
    expect(html).toContain('katex');
    expect(html).toContain('<em>italique</em>');
    expect(html).toContain('$5');
  });
  it('formules centrées et listes', () => {
    const html = renderToStaticMarkup(<Rich text={'Calcul :\n$$M = \\frac{pL^2}{8}$$\n- a\n- b'} />);
    expect(html).toContain('katex-display');
    expect(html).toContain('<ul');
  });
});
