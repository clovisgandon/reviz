import { useState } from 'react';
import type { DataBlock } from '@/lib/types';
import { Rich, RichInline } from './Rich';
import { fmt } from '@/lib/format';

function Cell({ v }: { v: string | number }) {
  return typeof v === 'number' ? <span className="tabular">{fmt(v, 4)}</span> : <RichInline text={v} />;
}

/** Tableau défilant horizontalement, première colonne figée ; double-tap = agrandir. */
export function DataTable({ block }: { block: Extract<DataBlock, { kind: 'table' }> }) {
  const [big, setBig] = useState(false);
  return (
    <figure className="my-2">
      <figcaption className="mb-1 text-sm font-semibold">
        <RichInline text={block.title} />
      </figcaption>
      <div
        className="overflow-x-auto rounded-xl border border-line"
        onDoubleClick={() => setBig((b) => !b)}
        title="Double-tap pour agrandir"
      >
        <table className={`border-collapse ${big ? 'text-base' : 'text-[13px]'}`}>
          <thead className="bg-surface2">
            <tr>
              {block.columns.map((c, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`whitespace-nowrap border-b border-line px-2 py-1.5 text-left font-semibold ${
                    i === 0 ? 'sticky left-0 z-10 bg-surface2' : ''
                  }`}
                >
                  <RichInline text={c} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i} className="odd:bg-surface even:bg-bg">
                {r.map((v, j) =>
                  j === 0 ? (
                    <th key={j} scope="row" className="sticky left-0 whitespace-nowrap bg-inherit px-2 py-1 text-left font-medium">
                      <Cell v={v} />
                    </th>
                  ) : (
                    <td key={j} className="whitespace-nowrap px-2 py-1 text-right">
                      <Cell v={v} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.note && <p className="mt-1 text-xs text-muted">{block.note}</p>}
    </figure>
  );
}

export function DataBlockView({ block }: { block: DataBlock }) {
  if (block.kind === 'table') return <DataTable block={block} />;
  if (block.kind === 'formula')
    return (
      <div className="my-2">
        {block.title && <p className="text-sm font-semibold">{block.title}</p>}
        <Rich text={`$$${block.latex}$$`} />
      </div>
    );
  return (
    <div className="my-2">
      {block.title && <p className="text-sm font-semibold">{block.title}</p>}
      <Rich text={block.content} className="text-sm" />
    </div>
  );
}

/** Bloc « Données » dépliable affiché avec la question (ouvert par défaut). */
export function DataPanel({ blocks, defaultOpen = true }: { blocks: DataBlock[]; defaultOpen?: boolean }) {
  if (!blocks.length) return null;
  return (
    <details open={defaultOpen} className="card group px-3 py-2">
      <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between font-semibold text-steel">
        📋 Données
        <span className="text-sm text-muted group-open:hidden">afficher</span>
        <span className="hidden text-sm text-muted group-open:inline">masquer</span>
      </summary>
      {blocks.map((b, i) => (
        <DataBlockView key={i} block={b} />
      ))}
    </details>
  );
}
