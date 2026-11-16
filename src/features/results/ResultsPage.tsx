import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { Attempt, AttemptItem, Question, Subject } from '@/lib/types';
import { fmt, fmtDate, fmtDuration } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { Feedback, levelStars } from '@/components/Feedback';
import { QuestionBody } from '@/components/QuestionCard';
import { Rich, RichInline } from '@/components/Rich';
import { findGenerator } from '@/subjects/stab1/generators';
import { paramsFor, solve } from '@/features/table/types';
import { ScoreLine } from '@/components/Charts';
import type { Given } from '@/lib/scoring';
import { createSession } from '@/features/quiz/engine';

export const MODE_LABEL: Record<Attempt['mode'], string> = {
  theme: 'Entraînement',
  srs: 'Révision des erreurs',
  flash: 'Flash / Formules',
  exam: 'Partiel blanc',
  table: 'Contrôle sur table',
  sudden: 'Mort subite',
};

type ThemeStat = { id: string; name: string; ok: number; total: number };

export function themeStats(items: AttemptItem[], qs: Record<string, Question>, subject?: Subject): ThemeStat[] {
  const map = new Map<string, ThemeStat>();
  for (const it of items) {
    const q = it.questionId ? qs[it.questionId] : undefined;
    if (!q) continue;
    for (const t of q.themeIds.slice(0, 1)) {
      const s = map.get(t) ?? { id: t, name: subject?.themes.find((x) => x.id === t)?.name ?? t, ok: 0, total: 0 };
      s.total++;
      if (it.correct) s.ok++;
      map.set(t, s);
    }
  }
  return [...map.values()].sort((a, b) => a.ok / a.total - b.ok / b.total);
}

function ItemReview({ q, item, index }: { q: Question; item: AttemptItem; index: number }) {
  const [open, setOpen] = useState(false);
  const icon = item.correct === true ? '✅' : item.correct === false ? '❌' : '➖';
  return (
    <li className="card">
      <button type="button" className="flex min-h-[52px] w-full items-center gap-3 px-3 py-2 text-left" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span aria-label={item.correct ? 'juste' : item.correct === false ? 'faux' : 'sans réponse'}>{icon}</span>
        <span className="tabular w-6 text-sm text-muted">{index + 1}.</span>
        <span className="line-clamp-2 flex-1 text-sm">
          <RichInline text={q.prompt.split('\n')[0]} />
        </span>
        <span className="text-xs text-site">{levelStars(q.level)}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-line p-3">
          <QuestionBody q={q} />
          <Feedback q={q} given={item.given as Given} correct={item.correct} />
        </div>
      )}
    </li>
  );
}

/** Détail d'un contrôle sur table : chaque étape avec la réponse et la valeur attendue. */
function TableReview({ genId, seed, cas, items, useMine = false, title = 'Étapes', redo = true }: {
  genId?: string; seed?: number; cas?: string | number | null; items: AttemptItem[]; useMine?: boolean; title?: string; redo?: boolean;
}) {
  const nav = useNavigate();
  const cfg = { seed, cas };
  const g = genId ? findGenerator(genId) : undefined;
  if (!g) return null;
  const params = paramsFor(g, seed ?? 0, cas != null ? Number(cas) : undefined);
  const res = solve(g, params, items.map((i) => (i.given as { value: number | string | null })?.value ?? null), useMine);
  const attempt = { items };
  return (
    <section className="space-y-2">
      <h2 className="font-semibold">{title}</h2>
      {title !== 'Étapes' && <div className="card p-3 text-sm"><Rich text={g.statement(params)} /></div>}
      <ol className="space-y-2">
        {res.steps.map((st, i) => (
          <li key={st.step.key} className="card p-3 text-sm">
            <p className="font-semibold">
              {attempt.items[i]?.correct ? '✅' : attempt.items[i]?.correct === null ? '➖' : '❌'} {i + 1}. <RichInline text={st.label} />
            </p>
            <Rich text={st.explanation} />
          </li>
        ))}
      </ol>
      <div className="card p-3 text-sm"><Rich text={res.conclusion} /></div>
      {redo && (
        <button type="button" className="btn-accent w-full" onClick={() => nav(`/table/${g.id}?${cfg.cas != null ? `cas=${cfg.cas}` : `seed=${cfg.seed}`}`)}>
          🔁 Refaire ce sujet
        </button>
      )}
    </section>
  );
}

type MockParts = { qcm: { points: number; max: number; note: number; weight: number }; exercises: { genId: string; title: string; right: number; steps: number; note: number; weight: number }[] };

/** Copie corrigée d'un partiel blanc : note par partie, comparaison, corrigé des exercices. */
function MockReview({ attempt }: { attempt: Attempt }) {
  const cfg = attempt.config as { parts: MockParts; exercises: { genId: string; seed: number; cas?: number }[] };
  const history = useLiveQuery(
    async () => (await db.attempts.where('subjectId').equals(attempt.subjectId).toArray())
      .filter((a) => a.mode === 'exam' && (a.config as { mock?: boolean }).mock).sort((a, b) => a.startedAt - b.startedAt),
    [attempt.subjectId],
  );
  const prev = history?.filter((a) => a.startedAt < attempt.startedAt) ?? [];
  const last = prev.at(-1);
  const avg = prev.length ? prev.reduce((s, a) => s + a.scoreOn20, 0) / prev.length : null;
  return (
    <>
      <section className="card p-4" aria-labelledby="parts-h">
        <h2 id="parts-h" className="mb-2 font-semibold">Détail de la note</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-line">
            <tr><td className="py-2">QCM <span className="text-xs text-muted">(brut {fmt(cfg.parts.qcm.points, 1)} pts sur {fmt(cfg.parts.qcm.max)}, plancher 0)</span></td><td className="tabular py-2 text-right font-semibold">{fmt(cfg.parts.qcm.note, 2)} / {fmt(cfg.parts.qcm.weight)}</td></tr>
            {cfg.parts.exercises.map((e) => (
              <tr key={e.genId}><td className="py-2">{e.title} ({e.right}/{e.steps} étapes)</td><td className="tabular py-2 text-right font-semibold">{fmt(e.note, 2)} / {fmt(e.weight)}</td></tr>
            ))}
          </tbody>
        </table>
        {prev.length > 0 && (
          <p className="mt-3 text-sm">
            Partiel blanc précédent : <b className="tabular">{fmt(last!.scoreOn20, 1)}/20</b>
            {' '}({attempt.scoreOn20 >= last!.scoreOn20 ? '+' : ''}{fmt(attempt.scoreOn20 - last!.scoreOn20, 1)}) · moyenne des {prev.length} précédents : <b className="tabular">{fmt(avg!, 1)}</b>
          </p>
        )}
        {history && history.length > 1 && (
          <div className="mt-3" aria-label="Évolution des notes de partiel blanc">
            <ScoreLine points={history.map((a) => ({ x: a.startedAt, y: a.scoreOn20, current: a.id === attempt.id }))} />
          </div>
        )}
      </section>
      {cfg.exercises.map((e, k) => (
        <TableReview key={k} genId={e.genId} seed={e.seed} cas={e.cas} redo={false}
          items={attempt.items.filter((i) => i.generatorId === e.genId && i.seed === e.seed)} title={`Corrigé — ${cfg.parts.exercises[k]?.title ?? e.genId}`} />
      ))}
    </>
  );
}

/** Résultats d'une tentative (fin de série et détail depuis l'historique). */
export function ResultsPage() {
  const { attemptId = '' } = useParams();
  const nav = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const data = useLiveQuery(async () => {
    const attempt = await db.attempts.get(attemptId);
    if (!attempt) return null;
    const ids = attempt.items.map((i) => i.questionId).filter((x): x is string => !!x);
    const qs = (await db.questions.bulkGet(ids)).filter((q): q is Question => !!q);
    return { attempt, qs: Object.fromEntries(qs.map((q) => [q.id, q])), subject: await db.subjects.get(attempt.subjectId) };
  }, [attemptId]);

  if (data === undefined) return <PageHeader title="Résultats" back />;
  if (data === null) return <PageHeader title="Tentative introuvable" back />;
  const { attempt, qs, subject } = data;
  const ok = attempt.items.filter((i) => i.correct === true).length;
  const blank = attempt.items.filter((i) => i.correct === null).length;
  const missed = attempt.items.filter((i) => i.correct !== true && i.questionId && qs[i.questionId]);
  const stats = themeStats(attempt.items, qs, subject);
  const listed = showAll ? attempt.items : missed;
  const title = (attempt.config as { title?: string })?.title;

  const redoMistakes = async () => {
    const questions = missed.map((i) => qs[i.questionId!]);
    const id = await createSession({
      subjectId: attempt.subjectId,
      mode: 'theme',
      title: 'Mes erreurs',
      questions,
      config: { redoOf: attempt.id },
    });
    nav(`/serie/${id}`);
  };

  return (
    <>
      <PageHeader title="Résultats" back />
      <main className="mx-auto max-w-xl space-y-4 px-4 pb-6">
        <section className="card p-5 text-center">
          <p className="text-sm text-muted">
            {MODE_LABEL[attempt.mode]}
            {title ? ` · ${title}` : ''} · {fmtDate(attempt.startedAt)}
          </p>
          <p className="tabular mt-2 text-5xl font-bold text-steel">
            {fmt(attempt.scoreOn20, 1)}
            <span className="text-2xl text-muted">/20</span>
          </p>
          <p className="tabular mt-2 text-sm">
            {ok} juste{ok > 1 ? 's' : ''} sur {attempt.items.length}
            {blank ? ` · ${blank} sans réponse` : ''} · {fmt(attempt.score, 1)} / {fmt(attempt.maxScore, 1)} pts
          </p>
          {attempt.endedAt && <p className="tabular text-sm text-muted">Durée : {fmtDuration(attempt.endedAt - attempt.startedAt)}</p>}
        </section>

        {stats.length > 0 && (
          <section className="card p-4" aria-labelledby="th-h">
            <h2 id="th-h" className="mb-3 font-semibold">
              Réussite par thème
            </h2>
            <ul className="space-y-3">
              {stats.map((s) => {
                const pct = Math.round((s.ok / s.total) * 100);
                return (
                  <li key={s.id}>
                    <div className="flex justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="tabular font-semibold">
                        {s.ok}/{s.total} · {pct} %
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface2">
                      <div className={`h-full ${pct >= 70 ? 'bg-ok' : pct >= 40 ? 'bg-site' : 'bg-ko'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {attempt.mode === 'table' && (
          <TableReview genId={(attempt.config as { generatorId?: string }).generatorId} seed={(attempt.config as { seed?: number }).seed}
            cas={(attempt.config as { cas?: string | null }).cas} items={attempt.items} useMine={!!(attempt.config as { useMine?: boolean }).useMine} />
        )}
        {attempt.mode === 'exam' && (attempt.config as { mock?: boolean }).mock && <MockReview attempt={attempt} />}

        {missed.length > 0 && (
          <button type="button" className="btn-accent w-full" onClick={redoMistakes}>
            🔁 Refaire uniquement mes erreurs ({missed.length})
          </button>
        )}

        <section aria-labelledby="rev-h">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="rev-h" className="font-semibold">
              {showAll ? 'Toutes les questions' : missed.length ? 'Questions ratées' : 'Sans faute 🎉'}
            </h2>
            <button type="button" className="min-h-[44px] text-sm font-semibold text-steel" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Seulement les ratées' : 'Tout voir'}
            </button>
          </div>
          <ul className="space-y-2">
            {listed.map((it) => {
              const q = it.questionId ? qs[it.questionId] : undefined;
              return q ? <ItemReview key={q.id} q={q} item={it} index={attempt.items.indexOf(it)} /> : null;
            })}
          </ul>
        </section>
      </main>
    </>
  );
}
