import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';
import type { Level } from '@/lib/types';
import { createSession, seenQuestionIds, selectQuestions } from './engine';

const LEVELS: { v: Level | 'mix'; label: string }[] = [
  { v: 'mix', label: 'Mélange' },
  { v: 1, label: '★ Découverte' },
  { v: 2, label: '★★ Application' },
  { v: 3, label: '★★★ Expert' },
];

/** Mode 1 : entraînement par thème (correction immédiate). */
export function QuizSetupPage() {
  const { subjectId = '' } = useParams();
  const nav = useNavigate();
  const subject = useLiveQuery(() => db.subjects.get(subjectId), [subjectId]);
  const questions = useLiveQuery(() => db.questions.where('subjectId').equals(subjectId).toArray(), [subjectId]);
  const [themes, setThemes] = useState<string[]>([]);
  const [level, setLevel] = useState<Level | 'mix'>('mix');
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);

  if (!subject || !questions) return <PageHeader title="Entraînement" back />;

  const countFor = (themeId: string) => questions.filter((q) => q.themeIds.includes(themeId)).length;
  const available = questions.filter(
    (q) => (themes.length === 0 || q.themeIds.some((t) => themes.includes(t))) && (level === 'mix' || q.level === level),
  ).length;
  const toggle = (id: string) => setThemes((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const start = async () => {
    setBusy(true);
    const cfg = { themeIds: themes, level, count };
    const picked = selectQuestions(questions, cfg, await seenQuestionIds(subjectId));
    const names = themes.map((t) => subject.themes.find((x) => x.id === t)?.name ?? t);
    const id = await createSession({
      subjectId,
      mode: 'theme',
      title: names.length === 0 ? 'Tous les thèmes' : names.length <= 2 ? names.join(' + ') : `${names.length} thèmes`,
      questions: picked,
      config: cfg,
    });
    nav(`/serie/${id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title="Entraînement" back />
      <main className="mx-auto max-w-xl space-y-5 px-4 pb-28">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Thèmes</h2>
            <button type="button" className="min-h-[44px] text-sm font-semibold text-steel" onClick={() => setThemes([])}>
              Tous
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subject.themes.map((t) => {
              const on = themes.includes(t.id);
              const n = countFor(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  disabled={n === 0}
                  onClick={() => toggle(t.id)}
                  className={`min-h-[40px] rounded-full border px-3 text-sm disabled:opacity-40 ${on ? 'border-steel bg-steel text-white dark:text-bg' : 'border-line bg-surface'}`}
                >
                  {t.name} <span className="tabular opacity-70">· {n}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Niveau</h2>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((l) => (
              <button
                key={String(l.v)}
                type="button"
                aria-pressed={level === l.v}
                onClick={() => setLevel(l.v)}
                className={`min-h-[44px] rounded-xl border text-sm font-medium ${level === l.v ? 'border-steel bg-steel/10 text-steel' : 'border-line bg-surface'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Nombre de questions</h2>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={count === n}
                onClick={() => setCount(n)}
                className={`tabular min-h-[44px] rounded-xl border font-semibold ${count === n ? 'border-steel bg-steel/10 text-steel' : 'border-line bg-surface'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 border-t border-line bg-bg/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <button type="button" className="btn-primary w-full text-lg" disabled={available === 0 || busy} onClick={start}>
            {available === 0 ? 'Aucune question pour ce choix' : `Commencer · ${Math.min(count, available)} question${Math.min(count, available) > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </>
  );
}
