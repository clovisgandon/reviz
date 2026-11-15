import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';

const MODES = [
  { id: 'theme', emoji: '🎯', name: 'Entraînement par thème' },
  { id: 'srs', emoji: '🔁', name: 'Révision des erreurs' },
  { id: 'flash', emoji: '🃏', name: 'Flash / Formules' },
  { id: 'exam', emoji: '📝', name: 'Partiel blanc' },
  { id: 'table', emoji: '🧮', name: 'Contrôle sur table' },
  { id: 'sudden', emoji: '⚡', name: 'Mort subite' },
];

export function SubjectPage() {
  const { subjectId = '' } = useParams();
  const subject = useLiveQuery(() => db.subjects.get(subjectId), [subjectId]);

  if (subject === undefined) return <PageHeader title="…" back />;
  if (subject === null) return <PageHeader title="Matière introuvable" back />;

  return (
    <>
      <PageHeader title={`${subject.emoji} ${subject.name}`} back />
      <main className="mx-auto max-w-xl space-y-5 px-4">
        <section aria-labelledby="themes-h">
          <h2 id="themes-h" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Thèmes
          </h2>
          <div className="flex flex-wrap gap-2">
            {subject.themes.map((t) => (
              <span key={t.id} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm">
                {t.name}
              </span>
            ))}
          </div>
        </section>
        <section aria-labelledby="modes-h">
          <h2 id="modes-h" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Modes de jeu
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {MODES.map((m) => (
              <li key={m.id} className="card flex min-h-[88px] flex-col justify-between p-3 opacity-60">
                <span className="text-2xl" aria-hidden>
                  {m.emoji}
                </span>
                <span className="text-sm font-semibold">{m.name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Les modes arrivent aux étapes 3 à 6.</p>
        </section>
      </main>
    </>
  );
}
