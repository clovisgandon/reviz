import { Fragment, memo, type ReactNode } from 'react';
import katex from 'katex';

/**
 * Mini-rendu Markdown + KaTeX, sans HTML brut :
 * titres « # », paragraphes, retours à la ligne, listes « - », **gras**, *italique*, `code`,
 * formules $…$ (en ligne) et $$…$$ (centrées). « \$ » = dollar littéral.
 */

function tex(src: string, display: boolean): string {
  return katex.renderToString(src, { displayMode: display, throwOnError: false, strict: 'ignore', trust: false, output: 'html' });
}

function Math({ src, display = false }: { src: string; display?: boolean }) {
  return (
    <span
      className={display ? 'my-2 block overflow-x-auto overflow-y-hidden py-1' : undefined}
      // KaTeX produit du HTML sûr (trust: false) à partir de la formule.
      dangerouslySetInnerHTML={{ __html: tex(src, display) }}
    />
  );
}

const INLINE_SRC = /(\\\$)|\$([^$\n]+?)\$|\*\*(.+?)\*\*|\*([^*\n]+?)\*|`([^`\n]+?)`/.source;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  // Une regex par appel : inline() est récursif (gras/italique) et lastIndex ne doit pas être partagé.
  const re = new RegExp(INLINE_SRC, 'g');
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${k++}`;
    if (m[1]) out.push('$');
    else if (m[2] !== undefined) out.push(<Math key={key} src={m[2]} />);
    else if (m[3] !== undefined) out.push(<strong key={key}>{inline(m[3], key)}</strong>);
    else if (m[4] !== undefined) out.push(<em key={key}>{inline(m[4], key)}</em>);
    else if (m[5] !== undefined)
      out.push(
        <code key={key} className="rounded bg-surface2 px-1 text-[0.9em]">
          {m[5]}
        </code>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function lines(text: string, keyBase: string): ReactNode[] {
  return text.split('\n').flatMap((l, i, arr) => [
    <Fragment key={`${keyBase}-l${i}`}>{inline(l, `${keyBase}-l${i}`)}</Fragment>,
    i < arr.length - 1 ? <br key={`${keyBase}-br${i}`} /> : null,
  ]);
}

const HEADING = /^(#{1,4})\s+(.+)$/;

function blocks(text: string, keyBase: string): ReactNode[] {
  return text
    // un titre « # … » forme toujours son propre bloc
    .replace(/^(#{1,4}\s+.+)$/gm, '\n\n$1\n\n')
    .split(/\n{2,}/)
    .map((b) => b.replace(/^\n+|\n+$/g, ''))
    .filter((b) => b.trim() !== '')
    .map((b, i) => {
      const key = `${keyBase}-b${i}`;
      const h = b.match(HEADING);
      if (h) {
        const cls = h[1].length === 1 ? 'mt-3 mb-1 text-lg font-bold' : 'mt-3 mb-1 font-bold';
        return (
          <p key={key} role="heading" aria-level={h[1].length + 1} className={cls}>
            {inline(h[2], key)}
          </p>
        );
      }
      const ls = b.split('\n');
      if (ls.every((l) => /^\s*[-•]\s+/.test(l))) {
        return (
          <ul key={key} className="my-1 list-disc space-y-1 pl-5">
            {ls.map((l, j) => (
              <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ''), `${key}-${j}`)}</li>
            ))}
          </ul>
        );
      }
      if (ls.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
        return (
          <ol key={key} className="my-1 list-decimal space-y-1 pl-5">
            {ls.map((l, j) => (
              <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ''), `${key}-${j}`)}</li>
            ))}
          </ol>
        );
      }
      return (
        <p key={key} className="my-1">
          {lines(b, key)}
        </p>
      );
    });
}

export const Rich = memo(function Rich({ text, className }: { text: string; className?: string }) {
  // Découpe d'abord les formules centrées $$…$$ (elles peuvent tenir sur plusieurs lignes).
  const parts = text.split(/\$\$([\s\S]+?)\$\$/g);
  return (
    <div className={`rich leading-relaxed ${className ?? ''}`}>
      {parts.map((p, i) => (i % 2 === 1 ? <Math key={i} src={p.trim()} display /> : <Fragment key={i}>{blocks(p, `p${i}`)}</Fragment>))}
    </div>
  );
});

/** Rendu sur une seule ligne (choix de réponse, cellules de tableau). */
export function RichInline({ text }: { text: string }) {
  return <>{lines(text, 'i')}</>;
}
