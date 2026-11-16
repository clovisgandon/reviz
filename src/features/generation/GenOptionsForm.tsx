import type { DocumentFile, QuestionType, Subject } from '@/lib/types';
import { TYPE_LABEL, type GenOptions } from '@/lib/genPrompt';
import { fmtSize, isPdf } from '@/lib/documents';

export const defaultOptions = (): GenOptions => ({
  themeNames: [], level: 'mix', count: 10, types: ['single', 'multi', 'truefalse', 'numeric'], examStyle: true, instructions: '', docNames: [],
});

const chip = (on: boolean) => `min-h-[40px] rounded-full border px-3 text-sm ${on ? 'border-steel bg-steel text-white dark:text-bg' : 'border-line bg-surface'}`;

/** Formulaire de génération : documents, thèmes, niveau, nombre, types, style examen, consignes. */
export function GenOptionsForm({ subject, docs, value: o, onChange }: { subject: Subject; docs: DocumentFile[]; value: GenOptions; onChange: (o: GenOptions) => void }) {
  const set = (p: Partial<GenOptions>) => onChange({ ...o, ...p });
  const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

  return (
    <div className="space-y-4">
      {docs.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Documents sources</legend>
          <div className="card divide-y divide-line">
            {docs.map((d) => (
              <label key={d.id} className="flex min-h-[52px] items-center gap-3 px-4">
                <input type="checkbox" className="h-6 w-6 shrink-0 accent-[rgb(var(--c-steel))]" checked={o.docNames.includes(d.name)} onChange={() => set({ docNames: toggle(o.docNames, d.name) })} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{d.name}</span>
                  <span className="tabular block text-xs text-muted">{fmtSize(d.blob.size)}{isPdf(d) && d.pages ? ` · ${d.pages.length} p.` : ''}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Thèmes</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={o.themeNames.length === 0} className={chip(o.themeNames.length === 0)} onClick={() => set({ themeNames: [] })}>✨ Détecter automatiquement</button>
          {subject.themes.map((t) => (
            <button key={t.id} type="button" aria-pressed={o.themeNames.includes(t.name)} className={chip(o.themeNames.includes(t.name))} onClick={() => set({ themeNames: toggle(o.themeNames, t.name) })}>{t.name}</button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Niveau</span>
          <select className="field" value={String(o.level)} onChange={(e) => set({ level: e.target.value === 'mix' ? 'mix' : (Number(e.target.value) as 1 | 2 | 3) })}>
            <option value="mix">Mélange</option>
            <option value="1">★ Découverte</option>
            <option value="2">★★ Application</option>
            <option value="3">★★★ Expert</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Nombre</span>
          <select className="field" value={o.count} onChange={(e) => set({ count: Number(e.target.value) })}>
            {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n} questions</option>)}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Types de questions</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_LABEL) as QuestionType[]).map((t) => (
            <button key={t} type="button" aria-pressed={o.types.includes(t)} className={chip(o.types.includes(t))}
              onClick={() => { const next = toggle(o.types, t); if (next.length) set({ types: next }); }}>{TYPE_LABEL[t]}</button>
          ))}
        </div>
      </fieldset>

      <label className="card flex min-h-[52px] items-center justify-between gap-3 px-4">
        <span className="text-sm">Style examen</span>
        <input type="checkbox" className="h-6 w-6 accent-[rgb(var(--c-steel))]" checked={o.examStyle} onChange={(e) => set({ examStyle: e.target.checked })} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold">Consignes libres <span className="font-normal text-muted">(optionnel)</span></span>
        <textarea className="field min-h-[80px] py-2" value={o.instructions} onChange={(e) => set({ instructions: e.target.value })} placeholder="ex. insiste sur les unités, chapitre 3 seulement, pas de question de cours pur…" />
      </label>
    </div>
  );
}
