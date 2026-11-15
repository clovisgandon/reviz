import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { useSetting } from '@/lib/settings';

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export function daysUntil(dateIso: string, now = new Date()): number | null {
  if (!dateIso) return null;
  const target = new Date(dateIso + 'T00:00:00');
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function HomePage() {
  const examDate = useSetting('examDate');
  const days = daysUntil(examDate);

  return (
    <>
      <PageHeader title={greeting()} />
      <main className="mx-auto max-w-xl space-y-4 px-4">
        <section className="card p-4" aria-label="Compte à rebours">
          {days === null ? (
            <p className="text-muted">
              Indique la date de ton partiel dans <Link to="/reglages" className="font-semibold text-steel">Réglages</Link> pour voir le compte à rebours.
            </p>
          ) : (
            <p>
              <span className="tabular text-4xl font-bold text-steel">{Math.max(days, 0)}</span>{' '}
              <span className="text-muted">{days === 0 ? 'c’est aujourd’hui !' : days < 0 ? 'jours (partiel passé)' : days === 1 ? 'jour avant le partiel' : 'jours avant le partiel'}</span>
            </p>
          )}
        </section>

        <button type="button" className="btn-primary w-full py-4 text-lg" disabled>
          Continuer
        </button>
        <p className="-mt-2 text-center text-xs text-muted">Aucune série en cours.</p>

        <section aria-label="Raccourcis" className="grid grid-cols-1 gap-3">
          <Link to="/matieres/stab1" className="card flex min-h-[56px] items-center gap-3 px-4">
            <span className="text-2xl" aria-hidden>📝</span>
            <span className="font-semibold">Partiel blanc STAB 1</span>
          </Link>
          <Link to="/matieres/stab1" className="card flex min-h-[56px] items-center gap-3 px-4">
            <span className="text-2xl" aria-hidden>🧮</span>
            <span className="font-semibold">Contrôle sur table</span>
          </Link>
          <Link to="/matieres/stab1" className="card flex min-h-[56px] items-center gap-3 px-4">
            <span className="text-2xl" aria-hidden>🔁</span>
            <span className="font-semibold">Révision de mes erreurs</span>
          </Link>
        </section>

        <section aria-label="Statistiques" className="grid grid-cols-3 gap-3 text-center">
          <div className="card p-3">
            <p className="tabular text-2xl font-bold">0</p>
            <p className="text-xs text-muted">jours d’affilée</p>
          </div>
          <div className="card p-3">
            <p className="tabular text-2xl font-bold">–</p>
            <p className="text-xs text-muted">réussite 7 j</p>
          </div>
          <div className="card p-3">
            <p className="text-sm font-semibold">–</p>
            <p className="text-xs text-muted">à retravailler</p>
          </div>
        </section>
      </main>
    </>
  );
}
