import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';

export function HistoryPage() {
  const attempts = useLiveQuery(() => db.attempts.orderBy('startedAt').reverse().limit(100).toArray(), []);
  return (
    <>
      <PageHeader title="Historique" />
      <main className="mx-auto max-w-xl space-y-3 px-4">
        {attempts?.length === 0 && (
          <div className="card p-6 text-center text-muted">
            <p className="text-3xl" aria-hidden>📈</p>
            <p className="mt-2">Pas encore de tentative. Lance une série pour voir ta progression ici.</p>
          </div>
        )}
        {attempts?.map((a) => (
          <div key={a.id} className="card flex items-center justify-between p-4">
            <span>
              <span className="block font-semibold">{a.mode}</span>
              <span className="text-sm text-muted">{new Date(a.startedAt).toLocaleString('fr-FR')}</span>
            </span>
            <span className="tabular text-lg font-bold">{a.scoreOn20.toFixed(1)}/20</span>
          </div>
        ))}
      </main>
    </>
  );
}
