import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { findGenerator } from '@/subjects/stab1/generators';
import { paramsFor, solve } from './types';
import { Rich, RichInline } from '@/components/Rich';
import { DataPanel } from '@/components/DataBlocks';
import { CloseIcon } from '@/components/Icons';
import { Sources, levelStars } from '@/components/Feedback';
import { fmt, parseNumber } from '@/lib/format';
import { newSeed, uid } from '@/lib/random';
import { on20 } from '@/lib/scoring';
import { vibrate } from '@/lib/platform';
import { db } from '@/db/db';
import type { Attempt } from '@/lib/types';

type Answer = { given: number | string | null; hint: boolean; timeMs: number };
const HINT_PENALTY = 0.5;

/** Un exercice de contrôle sur table, étape par étape. */
export function TableExercisePage() {
  const { genId = '' } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const g = findGenerator(genId);
  const cas = sp.get('cas');
  const seed = Number(sp.get('seed') ?? 0);
  const params = useMemo(() => (g ? paramsFor(g, seed, cas !== null ? Number(cas) : undefined) : null), [g, seed, cas]);

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [useMine, setUseMine] = useState(false);
  const savedRef = useRef<string | null>(null);
  const startedAt = useRef(Date.now());
  const shownAt = useRef(Date.now());
  const currentRef = useRef<HTMLDivElement>(null);

  // Nouveau sujet → on repart de zéro.
  useEffect(() => {
    setAnswers([]); setDraft(''); setError(''); setHintOpen(false); savedRef.current = null;
    startedAt.current = Date.now(); shownAt.current = Date.now();
    window.scrollTo({ top: 0 });
  }, [genId, seed, cas]);

  const res = useMemo(() => (g && params ? solve(g, params, answers.map((a) => a.given), useMine) : null), [g, params, answers, useMine]);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Enregistrement automatique dans l'historique à la fin de l'exercice.
    if (g && answers.length >= g.steps.length) void saveRef.current?.();
  }, [answers.length, g]);
  const saveRef = useRef<(() => Promise<string>) | null>(null);

  if (!g || !params || !res) {
    return (
      <main className="p-6 pt-[calc(24px+env(safe-area-inset-top))] text-center">
        <p>Exercice introuvable.</p>
        <button type="button" className="btn-primary mt-4" onClick={() => nav(-1)}>Retour</button>
      </main>
    );
  }

  const idx = answers.length;
  const done = idx >= g.steps.length;
  const cur = res.steps[idx];
  const pointsOf = (i: number) => (res.steps[i].right ? Math.max(0, 1 - (answers[i].hint ? HINT_PENALTY : 0)) : 0);
  const score = answers.reduce((sum, _a, i) => sum + pointsOf(i), 0);

  const submit = (given: number | string | null) => {
    const a: Answer = { given, hint: hintOpen, timeMs: Date.now() - shownAt.current };
    const next = [...answers, a];
    setAnswers(next);
    setDraft(''); setError(''); setHintOpen(false);
    shownAt.current = Date.now();
    const ok = given !== null && solve(g, params, next.map((x) => x.given), useMine).steps[idx].right;
    vibrate(ok ? 30 : [60, 40, 60]);
  };

  const validate = () => {
    if (cur.step.kind === 'numeric') {
      const v = parseNumber(draft);
      if (v === null) return setError('Saisis un nombre (virgule ou point acceptés), ou touche « Je ne sais pas ».');
      submit(v);
    } else {
      if (!draft) return setError('Choisis une réponse, ou touche « Je ne sais pas ».');
      submit(draft);
    }
  };

  const save = async () => {
    if (savedRef.current) return savedRef.current;
    const max = g.steps.length;
    const attempt: Attempt = {
      id: uid('a-'),
      subjectId: 'stab1',
      mode: 'table',
      startedAt: startedAt.current,
      endedAt: Date.now(),
      config: { title: `${g.code} — ${g.title}${cas !== null ? ` (${g.official?.[Number(cas)]?.label})` : ''}`, generatorId: g.id, seed, cas, useMine },
      items: res.steps.map((st, i) => ({
        generatorId: g.id, seed, given: { step: st.step.key, value: answers[i].given, expected: st.expected, hint: answers[i].hint },
        correct: answers[i].given === null ? null : st.right, points: pointsOf(i), timeMs: answers[i].timeMs,
      })),
      score, maxScore: max, scoreOn20: on20(score, max),
    };
    savedRef.current = attempt.id;
    await db.attempts.put(attempt);
    return attempt.id;
  };

  saveRef.current = save;

  return (
    <div className="min-h-full pb-[calc(110px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-safe-t backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-2">
          <button type="button" onClick={() => nav(-1)} aria-label="Quitter" className="-ml-2 flex h-11 w-11 items-center justify-center text-muted">
            <CloseIcon className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {g.code} · {g.title} <span className="text-site">{levelStars(g.level)}</span>
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={g.steps.length} aria-valuenow={idx}>
              <div className="h-full bg-steel transition-all" style={{ width: `${(idx / g.steps.length) * 100}%` }} />
            </div>
          </div>
          <span className="tabular shrink-0 text-sm font-bold">{fmt(score, 1)}/{g.steps.length}</span>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-4 px-4 pt-4">
        <section className="card p-4 text-[16px]">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Énoncé {cas !== null ? `· ${g.official?.[Number(cas)]?.label}` : `· sujet n° ${seed}`}
          </p>
          <Rich text={g.statement(params)} />
        </section>
        <DataPanel blocks={g.data(params)} defaultOpen={false} />

        <label className="flex min-h-[44px] items-center gap-3 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--c-steel))]" checked={useMine} onChange={(e) => setUseMine(e.target.checked)} />
          Continuer avec ma valeur en cas d’erreur (sinon : avec la bonne valeur)
        </label>

        <ol className="space-y-3">
          {res.steps.slice(0, idx).map((st, i) => (
            <li key={st.step.key} className={`rounded-2xl border-2 p-3 ${st.right ? 'border-ok bg-ok/10' : answers[i].given === null ? 'border-line bg-surface2' : 'border-ko bg-ko/10'}`}>
              <p className="text-sm font-semibold">
                {st.right ? '✅' : answers[i].given === null ? '➖' : '❌'} {i + 1}. <RichInline text={st.label} />
                <span className="tabular float-right text-xs">{fmt(pointsOf(i), 1)} pt{answers[i].hint ? ' (indice)' : ''}</span>
              </p>
              {!st.right && (
                <p className="mt-1 text-sm">
                  {answers[i].given !== null && <>Ta réponse : <b>{typeof answers[i].given === 'number' ? fmt(answers[i].given as number, 4) : st.choices?.find((c) => c.id === answers[i].given)?.text ?? answers[i].given}</b> · </>}
                  Attendu : <b>{typeof st.expected === 'number' ? `${fmt(st.expected, 3)} ${st.step.unit ?? ''}` : st.choices?.find((c) => c.id === st.expected)?.text ?? st.expected}</b>
                </p>
              )}
              <div className="mt-1 text-sm">
                <Rich text={st.explanation} />
              </div>
            </li>
          ))}
        </ol>

        {!done && cur && (
          <section ref={currentRef} className="card border-2 border-steel p-4" aria-live="polite">
            <p className="mb-2 font-semibold">
              Étape {idx + 1}/{g.steps.length} — <RichInline text={cur.label} />
            </p>
            {hintOpen && (
              <p className="mb-2 rounded-lg bg-site/10 p-2 text-sm">
                💡 <RichInline text={cur.step.hint} /> <span className="text-xs text-muted">(−{fmt(HINT_PENALTY, 1)} pt)</span>
              </p>
            )}
            {cur.step.kind === 'numeric' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text" inputMode="decimal" autoComplete="off" enterKeyHint="done" aria-label="Ta réponse"
                  className="field tabular flex-1 text-lg" placeholder="ta valeur" value={draft}
                  onChange={(e) => (setDraft(e.target.value), setError(''))}
                  onKeyDown={(e) => e.key === 'Enter' && validate()}
                />
                {cur.step.unit && <span className="min-w-[3rem] font-semibold text-muted">{cur.step.unit}</span>}
              </div>
            ) : (
              <div role="radiogroup" className="space-y-2">
                {cur.choices?.map((c) => (
                  <button key={c.id} type="button" role="radio" aria-checked={draft === c.id} onClick={() => (setDraft(c.id), setError(''))}
                    className={`flex min-h-[48px] w-full items-center rounded-xl border-2 px-3 text-left text-sm ${draft === c.id ? 'border-steel bg-steel/10' : 'border-line bg-surface'}`}>
                    <RichInline text={c.text} />
                  </button>
                ))}
              </div>
            )}
            {error && <p role="alert" className="mt-2 text-sm font-medium text-ko">{error}</p>}
          </section>
        )}

        {done && (
          <section className="card space-y-3 p-4">
            <p className="tabular text-center text-3xl font-bold text-steel">
              {fmt(on20(score, g.steps.length), 1)}<span className="text-lg text-muted">/20</span>
            </p>
            <p className="text-center text-sm text-muted">{fmt(score, 1)} point(s) sur {g.steps.length} étapes</p>
            <Rich text={res.conclusion} />
            <Sources q={{ source: g.source } as never} />
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-2">
          {!done ? (
            <>
              <button type="button" className="btn-ghost px-3" disabled={hintOpen} onClick={() => setHintOpen(true)} aria-label="Indice (−0,5 point)">💡</button>
              <button type="button" className="btn-ghost flex-[0.8] text-sm" onClick={() => submit(null)}>Je ne sais pas</button>
              <button type="button" className="btn-primary flex-1 text-lg" onClick={validate}>Valider</button>
            </>
          ) : (
            <>
              <button type="button" className="btn-ghost flex-1" onClick={() => nav(`/table/${g.id}?seed=${newSeed()}`, { replace: true })}>Nouveau sujet</button>
              <button type="button" className="btn-primary flex-1" onClick={async () => nav(`/resultats/${await save()}`, { replace: true })}>Voir dans l’historique</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
