import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';
import { ChevronRightIcon } from '@/components/Icons';
import { fmt, fmtDate, fmtDuration } from '@/lib/format';
import { MODE_LABEL } from '@/features/results/ResultsPage';

/** Historique chronologique (les graphiques et filtres arrivent à l'étape 6). */
export function HistoryPage() {
  const data = useLiveQuery(async () => {
    const [attempts, subjects] = await Promise.all([db.attempts.orderBy('startedAt').reverse().toArray(), db.subjects.toArray()]);
    return { attempts, subjects: Object.fromEntries(subjects.map((s) => [s.id, s])) };
  }, []);

  return (
    <>
      <PageHeader title="Historique" />
      <main className="mx-auto max-w-xl space-y-2 px-4">
        {data?.attempts.length === 0 && (
          <div className="card p-6 text-center text-muted">
            <p className="text-3xl" aria-hidden>
              📈
            </p>
            <p className="mt-2">Pas encore de tentative. Lance une série pour voir ta progression ici.</p>
          </div>
        )}
        {data?.attempts.map((a) => {
          const s = data.subjects[a.subjectId];
          const title = (a.config as { title?: string })?.title;
          return (
            <Link key={a.id} to={`/resultats/${a.id}`} className="card flex items-center gap-3 p-3">
              <span className="text-2xl" aria-hidden>
                {s?.emoji ?? '📚'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                  {MODE_LABEL[a.mode]}
                  {title ? ` · ${title}` : ''}
                </span>
                <span className="tabular block text-xs text-muted">
                  {s?.name} · {fmtDate(a.startedAt)}
                  {a.endedAt ? ` · ${fmtDuration(a.endedAt - a.startedAt)}` : ''}
                </span>
              </span>
              <span className="tabular text-lg font-bold">{fmt(a.scoreOn20, 1)}</span>
              <ChevronRightIcon className="h-5 w-5 text-muted" />
            </Link>
          );
        })}
      </main>
    </>
  );
}
