import { useState } from 'react';
import type { Level, Question, QuestionType, Subject, Theme } from '@/lib/types';
import { QuestionSchema } from '@/lib/schemas';
import { uid } from '@/lib/random';
import { parseNumber } from '@/lib/format';
import { TYPE_LABEL } from '@/lib/genPrompt';
import { themesFromNames } from '@/lib/subjects';

type Choice = { id: string; text: string; correct: boolean };
const LETTERS = 'abcdefghij';

/** Formulaire simple pour écrire ou corriger une question à la main. */
export function QuestionEditor({ subject, initial, onSave, onCancel, saveLabel = 'Enregistrer' }: {
  subject: Subject;
  initial?: Question;
  onSave: (q: Question, newTheme: Theme | null) => void | Promise<void>;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const num = initial && !Array.isArray(initial.answer) ? initial.answer : null;
  const [themeId, setThemeId] = useState(initial?.themeIds[0] ?? subject.themes[0]?.id ?? '__new');
  const [newTheme, setNewTheme] = useState('');
  const [level, setLevel] = useState<Level>(initial?.level ?? 2);
  const [type, setType] = useState<QuestionType>(initial?.type ?? 'single');
  const [prompt, setPrompt] = useState(initial?.prompt ?? '');
  const [choices, setChoices] = useState<Choice[]>(() => {
    if (initial?.choices) {
      const ans = Array.isArray(initial.answer) ? initial.answer : [];
      const list = initial.type === 'order' ? ans.map((id) => initial.choices!.find((c) => c.id === id)!).filter(Boolean) : initial.choices;
      return list.map((c) => ({ ...c, correct: ans.includes(c.id) }));
    }
    return [0, 1, 2, 3].map((i) => ({ id: LETTERS[i], text: '', correct: i === 0 }));
  });
  const [value, setValue] = useState(num ? String(num.value).replace('.', ',') : '');
  const [unit, setUnit] = useState(num?.unit ?? '');
  const [tol, setTol] = useState(num?.tolerancePct !== undefined ? String(num.tolerancePct) : '');
  const [explanation, setExplanation] = useState(initial?.explanation ?? '');
  const [srcDoc, setSrcDoc] = useState(initial?.source?.[0]?.docName ?? '');
  const [srcPage, setSrcPage] = useState(initial?.source?.[0]?.page ? String(initial.source[0].page) : '');
  const [examStyle, setExamStyle] = useState(initial?.examStyle ?? false);
  const [errors, setErrors] = useState<string[]>([]);

  const setType2 = (t: QuestionType) => {
    setType(t);
    if (t === 'truefalse') setChoices([{ id: 'v', text: 'Vrai', correct: true }, { id: 'f', text: 'Faux', correct: false }]);
    else if (type === 'truefalse') setChoices([0, 1, 2, 3].map((i) => ({ id: LETTERS[i], text: '', correct: i === 0 })));
  };
  const toggleCorrect = (id: string) =>
    setChoices((cs) => cs.map((c) => (type === 'multi' ? (c.id === id ? { ...c, correct: !c.correct } : c) : { ...c, correct: c.id === id })));
  const move = (i: number, d: number) =>
    setChoices((cs) => {
      const j = i + d;
      if (j < 0 || j >= cs.length) return cs;
      const n = [...cs];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const save = async () => {
    let theme: Theme | null = null;
    let tid = themeId;
    if (themeId === '__new') {
      if (!newTheme.trim()) return setErrors(['Donne un nom au nouveau thème.']);
      const all = themesFromNames([newTheme], subject.themes);
      theme = all.length > subject.themes.length ? all[all.length - 1] : null;
      tid = theme?.id ?? all.find((t) => t.name.toLowerCase() === newTheme.trim().toLowerCase())!.id;
    }
    const filled = choices.filter((c) => c.text.trim());
    const page = parseInt(srcPage, 10);
    const q: Question = {
      ...initial,
      id: initial?.id ?? `${subject.id}-manual-${uid()}`,
      subjectId: subject.id,
      themeIds: [tid, ...(initial?.themeIds.slice(1) ?? [])].filter((x, i, a) => a.indexOf(x) === i),
      level, type, prompt: prompt.trim(), explanation: explanation.trim(),
      origin: initial?.origin ?? 'manual',
      examStyle,
      source: srcDoc.trim() ? [{ docName: srcDoc.trim(), ...(page > 0 ? { page } : {}) }] : undefined,
      ...(type === 'numeric'
        ? { choices: undefined, answer: { value: parseNumber(value) ?? NaN, unit: unit.trim(), ...(tol.trim() ? { tolerancePct: parseNumber(tol) ?? 2 } : {}) } }
        : {
            choices: filled.map(({ id, text }) => ({ id, text: text.trim() })),
            answer: type === 'order' ? filled.map((c) => c.id) : filled.filter((c) => c.correct).map((c) => c.id),
          }),
    };
    if (q.wrongChoiceHints && q.choices) q.wrongChoiceHints = Object.fromEntries(Object.entries(q.wrongChoiceHints).filter(([k]) => q.choices!.some((c) => c.id === k)));
    const res = QuestionSchema.safeParse(q);
    if (!res.success) {
      const msgs = res.error.issues.map((x) => {
        const p = x.path.join('.');
        if (p === 'prompt') return 'L’énoncé est vide.';
        if (p === 'explanation') return 'L’explication est vide.';
        if (p.startsWith('answer')) return type === 'numeric' ? 'La valeur attendue n’est pas un nombre.' : 'Coche au moins une bonne réponse (sur une proposition remplie).';
        if (/au moins 2 choix/.test(x.message)) return 'Remplis au moins 2 propositions.';
        if (/une seule bonne réponse/.test(x.message)) return 'Coche une seule bonne réponse (sur une proposition remplie).';
        return `${p ? `${p} : ` : ''}${x.message}`;
      });
      return setErrors([...new Set(msgs)]);
    }
    setErrors([]);
    await onSave(res.data as Question, theme);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Thème</span>
          <select className="field" value={themeId} onChange={(e) => setThemeId(e.target.value)}>
            {subject.themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            <option value="__new">+ Nouveau thème…</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Niveau</span>
          <select className="field" value={level} onChange={(e) => setLevel(Number(e.target.value) as Level)}>
            <option value={1}>★ Découverte</option>
            <option value={2}>★★ Application</option>
            <option value={3}>★★★ Expert</option>
          </select>
        </label>
      </div>
      {themeId === '__new' && <input className="field" placeholder="Nom du nouveau thème" aria-label="Nom du nouveau thème" value={newTheme} onChange={(e) => setNewTheme(e.target.value)} />}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">Type</span>
        <select className="field" value={type} onChange={(e) => setType2(e.target.value as QuestionType)}>
          {(Object.keys(TYPE_LABEL) as QuestionType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">Énoncé (Markdown, formules entre $…$)</span>
        <textarea className="field min-h-[96px] py-2" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </label>

      {type === 'numeric' ? (
        <div className="grid grid-cols-3 gap-2">
          <label className="col-span-1 block"><span className="mb-1 block text-xs font-semibold text-muted">Valeur</span>
            <input className="field tabular" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Unité</span>
            <input className="field" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kN·m" /></label>
          <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Tolérance %</span>
            <input className="field tabular" inputMode="decimal" value={tol} onChange={(e) => setTol(e.target.value)} placeholder="2" /></label>
        </div>
      ) : (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs font-semibold text-muted">
            {type === 'order' ? 'Étapes, dans le bon ordre' : type === 'multi' ? 'Propositions (coche toutes les bonnes)' : 'Propositions (coche la bonne)'}
          </legend>
          {choices.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              {type === 'order' ? (
                <span className="flex shrink-0 flex-col">
                  <button type="button" className="h-6 w-8 text-muted" aria-label="Monter" onClick={() => move(i, -1)}>▲</button>
                  <button type="button" className="h-6 w-8 text-muted" aria-label="Descendre" onClick={() => move(i, 1)}>▼</button>
                </span>
              ) : (
                <input type={type === 'multi' ? 'checkbox' : 'radio'} name="correct" checked={c.correct} onChange={() => toggleCorrect(c.id)}
                  className="h-6 w-6 shrink-0 accent-[rgb(var(--c-ok))]" aria-label={`Bonne réponse : proposition ${i + 1}`} />
              )}
              <input className="field flex-1" value={c.text} disabled={type === 'truefalse'} aria-label={`Proposition ${i + 1}`}
                onChange={(e) => setChoices((cs) => cs.map((x) => (x.id === c.id ? { ...x, text: e.target.value } : x)))} />
              {type !== 'truefalse' && choices.length > 2 && (
                <button type="button" className="h-11 w-9 shrink-0 text-muted" aria-label={`Retirer la proposition ${i + 1}`} onClick={() => setChoices((cs) => cs.filter((x) => x.id !== c.id))}>✕</button>
              )}
            </div>
          ))}
          {type !== 'truefalse' && choices.length < 8 && (
            <button type="button" className="text-sm font-semibold text-steel" onClick={() => setChoices((cs) => [...cs, { id: LETTERS.split('').find((l) => !cs.some((x) => x.id === l))!, text: '', correct: false }])}>
              + Ajouter une proposition
            </button>
          )}
        </fieldset>
      )}

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">Explication (affichée après la réponse)</span>
        <textarea className="field min-h-[96px] py-2" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="col-span-2 block"><span className="mb-1 block text-xs font-semibold text-muted">Source (nom du document)</span>
          <input className="field" value={srcDoc} onChange={(e) => setSrcDoc(e.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Page</span>
          <input className="field tabular" inputMode="numeric" value={srcPage} onChange={(e) => setSrcPage(e.target.value)} /></label>
      </div>
      <label className="flex min-h-[44px] items-center justify-between">
        <span className="text-sm">Style examen (utilisable au partiel blanc)</span>
        <input type="checkbox" className="h-6 w-6 accent-[rgb(var(--c-steel))]" checked={examStyle} onChange={(e) => setExamStyle(e.target.checked)} />
      </label>
      {initial?.data?.length ? <p className="text-xs text-muted">Les blocs Données de la question ({initial.data.length}) sont conservés tels quels.</p> : null}

      {errors.length > 0 && (
        <ul role="alert" className="list-disc rounded-xl bg-ko/10 p-3 pl-7 text-sm">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
      <div className="flex gap-2">
        <button type="button" className="btn-ghost flex-1" onClick={onCancel}>Annuler</button>
        <button type="button" className="btn-primary flex-1" onClick={save}>{saveLabel}</button>
      </div>
    </div>
  );
}
