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
  it('titres Markdown, même collés au texte', () => {
    const html = renderToStaticMarkup(<Rich text={'# Notes\nLe module $E$ vaut 210 GPa.\n## Détail'} />);
    expect(html).toContain('role="heading" aria-level="2"');
    expect(html).toContain('>Notes</p>');
    expect(html).toContain('aria-level="3"');
    expect(html).not.toContain('# Notes');
    // un « # » au milieu d'une phrase reste du texte
    expect(renderToStaticMarkup(<Rich text={'Le profilé n°3 # pas un titre'} />)).toContain('# pas un titre');
  });
});
