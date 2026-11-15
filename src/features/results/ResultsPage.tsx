import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { Attempt, AttemptItem, Question, Subject } from '@/lib/types';
import { fmt, fmtDate, fmtDuration } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { Feedback, levelStars } from '@/components/Feedback';
import { QuestionBody } from '@/components/QuestionCard';
import { RichInline } from '@/components/Rich';
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
