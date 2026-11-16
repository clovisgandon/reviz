import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';
import { newSeed, rng, shuffle } from '@/lib/random';
import { createSession } from '@/features/quiz/engine';
import { getSetting } from '@/lib/settings';
import { GENERATORS_BY_SUBJECT } from '@/subjects/stab1/generators';
import STAB1_EXAMS from '@/subjects/stab1/exams.json';

type Mode = { id: string; emoji: string; name: string; to?: string; ready: boolean };

export function SubjectPage() {
  const { subjectId = '' } = useParams();
  const nav = useNavigate();
  const data = useLiveQuery(async () => {
    const subject = await db.subjects.get(subjectId);
    if (!subject) return null;
    const questions = await db.questions.where('subjectId').equals(subjectId).toArray();
    // Maîtrise par thème = % de réussite sur la dernière réponse à chaque question.
    const attempts = await db.attempts.where('subjectId').equals(subjectId).sortBy('startedAt');
    const last = new Map<string, boolean>();
    for (const a of attempts) for (const i of a.items) if (i.questionId) last.set(i.questionId, i.correct === true);
    const mastery = new Map<string, { ok: number; seen: number; total: number }>();
    for (const q of questions)
      for (const t of q.themeIds) {
        const m = mastery.get(t) ?? { ok: 0, seen: 0, total: 0 };
        m.total++;
        if (last.has(q.id)) {
          m.seen++;
          if (last.get(q.id)) m.ok++;
        }
        mastery.set(t, m);
      }
    return { subject, questions, mastery };
  }, [subjectId]);

  if (data === undefined) return <PageHeader title="…" back />;
  if (data === null) return <PageHeader title="Matière introuvable" back />;
  const { subject, questions, mastery } = data;

  const fixed = subjectId === 'stab1' ? STAB1_EXAMS : [];
  const startFixed = async (e: (typeof STAB1_EXAMS)[number]) => {
    const qs = (await db.questions.bulkGet(e.questionIds)).filter((q): q is NonNullable<typeof q> => !!q);
    const id = await createSession({
      subjectId,
      mode: e.examScoring ? 'exam' : 'theme',
      title: e.title,
      questions: qs,
      config: { fixedExam: e.id },
      deferred: e.examScoring,
      scoring: e.examScoring ? await getSetting('scoring') : undefined,
      durationMin: e.durationMin,
      shuffleChoices: false,
    });
    nav(`/serie/${id}`);
  };

  const suddenDeath = async () => {
    const id = await createSession({
      subjectId,
      mode: 'sudden',
      title: 'Mort subite',
      questions: shuffle(questions, rng(newSeed())),
      config: {},
      stopOnError: true,
    });
    nav(`/serie/${id}`);
  };

  const modes: Mode[] = [
    { id: 'theme', emoji: '🎯', name: 'Entraînement par thème', to: `/matieres/${subjectId}/entrainement`, ready: true },
    { id: 'srs', emoji: '🔁', name: 'Révision des erreurs', ready: false },
    { id: 'flash', emoji: '🃏', name: 'Flash / Formules', ready: false },
    { id: 'exam', emoji: '📝', name: 'Partiel blanc', ready: false },
    { id: 'table', emoji: '🧮', name: 'Contrôle sur table', to: `/matieres/${subjectId}/table`, ready: (GENERATORS_BY_SUBJECT[subjectId]?.length ?? 0) > 0 },
    { id: 'sudden', emoji: '⚡', name: 'Mort subite', ready: questions.length > 0 },
  ];

  return (
    <>
      <PageHeader title={`${subject.emoji} ${subject.name}`} back />
      <main className="mx-auto max-w-xl space-y-5 px-4">
        <section aria-labelledby="modes-h">
          <h2 id="modes-h" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Modes de jeu · <span className="tabular">{questions.length}</span> questions
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {modes.map((m) => {
              const inner = (
                <>
                  <span className="text-2xl" aria-hidden>
                    {m.emoji}
                  </span>
                  <span className="text-sm font-semibold">{m.name}</span>
                  {!m.ready && <span className="text-[11px] text-muted">bientôt</span>}
                </>
              );
              const cls = 'card flex min-h-[96px] w-full flex-col justify-between p-3 text-left';
              return (
                <li key={m.id}>
                  {m.ready && m.to ? (
                    <Link to={m.to} className={cls}>
                      {inner}
                    </Link>
                  ) : m.ready && m.id === 'sudden' ? (
                    <button type="button" onClick={suddenDeath} className={cls}>
                      {inner}
                    </button>
                  ) : (
                    <div className={`${cls} opacity-50`} aria-disabled>
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {fixed.length > 0 && (
          <section aria-labelledby="fixed-h">
            <h2 id="fixed-h" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
              Sujets officiels
            </h2>
            <ul className="space-y-2">
              {fixed.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => startFixed(e)} className="card flex w-full items-center gap-3 p-3 text-left">
                    <span className="text-2xl" aria-hidden>
                      {e.examScoring ? '🗒️' : '📄'}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{e.title}</span>
                      <span className="block text-xs text-muted">
                        {e.questionIds.length} questions · {e.description}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link to={`/matieres/${subjectId}/formulaire`} className="card flex min-h-[56px] items-center gap-3 px-4">
          <span className="text-2xl" aria-hidden>
            📐
          </span>
          <span className="flex-1 font-semibold">Fiche formulaire</span>
          <span className="text-xs text-muted">tableaux & formules</span>
        </Link>

        <section aria-labelledby="themes-h">
          <h2 id="themes-h" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Thèmes et maîtrise
          </h2>
          <ul className="card divide-y divide-line">
            {subject.themes.map((t) => {
              const m = mastery.get(t.id);
              const pct = m && m.seen ? Math.round((m.ok / m.total) * 100) : 0;
              return (
                <li key={t.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span>{t.name}</span>
                    <span className="tabular text-muted">
                      {m?.seen ? `${pct} %` : '—'} · {m?.total ?? 0} q.
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface2">
                    <div className="h-full bg-ok" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-1 text-xs text-muted">Maîtrise = part des questions du thème réussies la dernière fois.</p>
        </section>
      </main>
    </>
  );
}
