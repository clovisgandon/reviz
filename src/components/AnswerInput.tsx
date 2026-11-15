import type { Question } from '@/lib/types';
import { isNumericAnswer } from '@/lib/scoring';
import { RichInline } from './Rich';

/** Brouillon de réponse : ids cochés / ordonnés, ou texte saisi pour un numérique. */
export type Draft = { ids: string[]; text: string };
export const emptyDraft = (q: Question, order: string[]): Draft => ({ ids: q.type === 'order' ? order : [], text: '' });

type Props = {
  q: Question;
  order: string[];
  draft: Draft;
  onChange: (d: Draft) => void;
  /** après validation : on affiche la correction et on verrouille */
  locked: boolean;
};

const label = (q: Question, id: string) => q.choices?.find((c) => c.id === id)?.text ?? id;
const LETTERS = 'ABCDEFGHIJ';

function Choices({ q, order, draft, onChange, locked }: Props) {
  const multi = q.type === 'multi';
  const correct = new Set(Array.isArray(q.answer) ? q.answer : []);
  const toggle = (id: string) => {
    if (locked) return;
    if (multi) onChange({ ...draft, ids: draft.ids.includes(id) ? draft.ids.filter((x) => x !== id) : [...draft.ids, id] });
    else onChange({ ...draft, ids: draft.ids[0] === id ? [] : [id] });
  };
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label="Réponses" className="space-y-2">
      {multi && !locked && <p className="text-sm text-muted">Coche toutes les bonnes réponses.</p>}
      {order.map((id, i) => {
        const chosen = draft.ids.includes(id);
        const isRight = correct.has(id);
        let tone = chosen ? 'border-steel bg-steel/10' : 'border-line bg-surface';
        let tag: string | null = null;
        if (locked) {
          if (isRight) {
            tone = 'border-ok bg-ok/10';
            tag = chosen ? '✅ Ta réponse — juste' : '✅ Bonne réponse';
          } else if (chosen) {
            tone = 'border-ko bg-ko/10';
            tag = '❌ Ta réponse';
          } else tone = 'border-line bg-surface opacity-70';
        }
        return (
          <button
            key={id}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={chosen}
            aria-disabled={locked}
            onClick={() => toggle(id)}
            className={`flex min-h-[52px] w-full items-start gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition ${tone}`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-sm font-bold ${multi ? 'rounded-md' : 'rounded-full'} ${
                chosen ? 'bg-steel text-white dark:text-bg' : 'bg-surface2 text-muted'
              }`}
              aria-hidden
            >
              {q.type === 'truefalse' ? (i === 0 ? 'V' : 'F') : LETTERS[i]}
            </span>
            <span className="flex-1">
              <RichInline text={label(q, id)} />
              {tag && <span className="mt-1 block text-xs font-semibold">{tag}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function NumericField({ q, draft, onChange, locked }: Props) {
  const unit = isNumericAnswer(q.answer) ? q.answer.unit : '';
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">Ta réponse{unit ? ` (en ${unit})` : ''}</span>
      <span className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          disabled={locked}
          placeholder="ex. 85,6"
          className="field tabular flex-1 text-lg"
          value={draft.text}
          onChange={(e) => onChange({ ...draft, text: e.target.value })}
        />
        {unit && <span className="min-w-[3rem] text-lg font-semibold text-muted">{unit}</span>}
      </span>
    </label>
  );
}

function OrderList({ q, draft, onChange, locked }: Props) {
  const correct = Array.isArray(q.answer) ? q.answer : [];
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (locked || j < 0 || j >= draft.ids.length) return;
    const ids = draft.ids.slice();
    [ids[i], ids[j]] = [ids[j], ids[i]];
    onChange({ ...draft, ids });
  };
  return (
    <ol className="space-y-2" aria-label="Étapes à remettre dans l'ordre">
      {!locked && <p className="text-sm text-muted">Utilise ▲ ▼ pour remettre les étapes dans l’ordre.</p>}
      {draft.ids.map((id, i) => {
        const ok = locked ? correct[i] === id : null;
        return (
          <li
            key={id}
            className={`flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 ${
              ok === null ? 'border-line bg-surface' : ok ? 'border-ok bg-ok/10' : 'border-ko bg-ko/10'
            }`}
          >
            <span className="tabular w-6 text-center font-bold text-muted">{i + 1}</span>
            <span className="flex-1 py-1">
              <RichInline text={label(q, id)} />
              {ok === false && (
                <span className="block text-xs font-semibold">
                  ❌ attendu en position {correct.indexOf(id) + 1}
                </span>
              )}
            </span>
            {!locked && (
              <span className="flex flex-col">
                <button type="button" className="h-9 w-11 rounded-lg text-steel disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Monter l'étape ${i + 1}`}>
                  ▲
                </button>
                <button type="button" className="h-9 w-11 rounded-lg text-steel disabled:opacity-30" disabled={i === draft.ids.length - 1} onClick={() => move(i, 1)} aria-label={`Descendre l'étape ${i + 1}`}>
                  ▼
                </button>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function AnswerInput(props: Props) {
  if (props.q.type === 'numeric') return <NumericField {...props} />;
  if (props.q.type === 'order') return <OrderList {...props} />;
  return <Choices {...props} />;
}
