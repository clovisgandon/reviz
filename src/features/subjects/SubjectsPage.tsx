import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';
import { ChevronRightIcon } from '@/components/Icons';

export function SubjectsPage() {
  const subjects = useLiveQuery(async () => {
    const list = await db.subjects.orderBy('name').toArray();
    return Promise.all(
      list.map(async (s) => ({ ...s, count: await db.questions.where('subjectId').equals(s.id).count() })),
    );
  }, []);

  return (
    <>
      <PageHeader title="Matières" />
      <main className="mx-auto max-w-xl space-y-3 px-4">
        {subjects?.map((s) => (
          <Link key={s.id} to={`/matieres/${s.id}`} className="card flex items-center gap-3 p-4">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{ background: s.color + '22' }}
              aria-hidden
            >
              {s.emoji}
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{s.name}</span>
              <span className="tabular text-sm text-muted">
                {s.count} question{s.count > 1 ? 's' : ''} · {s.themes.length} thèmes
              </span>
            </span>
            <ChevronRightIcon className="h-5 w-5 text-muted" />
          </Link>
        ))}
        <button type="button" className="btn-ghost w-full" disabled>
          + Nouvelle matière
        </button>
        <p className="text-center text-xs text-muted">Création de matières : étape 7.</p>
      </main>
    </>
  );
}
