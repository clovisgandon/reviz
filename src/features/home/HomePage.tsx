import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';
import { useSetting } from '@/lib/settings';
import { backupDue } from '@/lib/backup';
import { streak, successRate, weakestTheme } from '@/lib/stats';
import { createSession, dueQuestions, type QuizState } from '@/features/quiz/engine';

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
  const nav = useNavigate();
  const examDate = useSetting('examDate');
  const days = daysUntil(examDate);
  const lastBackup = useSetting('lastBackupAt');

  const data = useLiveQuery(async () => {
    const [session] = await db.sessions.orderBy('updatedAt').reverse().limit(1).toArray();
    const attempts = await db.attempts.toArray();
    const ids = new Set(attempts.flatMap((a) => a.items.map((i) => i.questionId!).filter(Boolean)));
    const qs = (await db.questions.bulkGet([...ids])).filter((q) => !!q);
    const weak = weakestTheme(attempts, new Map(qs.map((q) => [q!.id, q!])));
    const subjects = await db.subjects.toArray();
    const weakName = weak && subjects.flatMap((s) => s.themes).find((t) => t.id === weak.themeId)?.name;
    const due = (await dueQuestions('stab1')).length;
    const first = attempts.length ? Math.min(...attempts.map((a) => a.startedAt)) : null;
    return { session, due, first, streak: streak(attempts), rate: successRate(attempts), weak: weak && { name: weakName ?? weak.themeId, rate: weak.rate } };
  }, []);

  const revise = async () => {
    const qs = (await dueQuestions('stab1')).slice(0, 20);
    if (!qs.length) return alert('Rien à revoir pour l’instant : les questions ratées apparaîtront ici.');
    nav(`/serie/${await createSession({ subjectId: 'stab1', mode: 'srs', title: 'Révision des erreurs', questions: qs, config: {} })}`);
  };

  const st = data?.session?.state as (QuizState & { kind?: string }) | undefined;
  const isMock = st?.kind === 'mock';
  const progress = st ? `${st.title} · ${Object.keys(st.answers).length}/${st.questionIds.length}${isMock ? ' QCM' : ''}` : null;

  return (
    <>
      <PageHeader title={greeting()} />
      <main className="mx-auto max-w-xl space-y-4 px-4">
        {data && backupDue(lastBackup, data.first) && (
          <Link to="/reglages#sauvegarde" className="card flex items-center gap-3 border-2 border-warn p-3" onClick={() => setTimeout(() => document.getElementById('sauvegarde')?.scrollIntoView({ behavior: 'smooth' }), 300)}>
            <span className="text-2xl" aria-hidden>💾</span>
            <span className="flex-1 text-sm">
              <b>Sauvegarde ta progression</b>
              <span className="block text-muted">{lastBackup ? `Dernière sauvegarde il y a ${Math.floor((Date.now() - lastBackup) / 86400000)} jours.` : 'Aucune sauvegarde pour l’instant.'} Exporte tes données dans Réglages.</span>
            </span>
          </Link>
        )}
        <section className="card p-4" aria-label="Compte à rebours">
          {days === null ? (
            <p className="text-muted">
              Indique la date de ton partiel dans{' '}
              <Link to="/reglages" className="font-semibold text-steel">
                Réglages
              </Link>{' '}
              pour voir le compte à rebours.
            </p>
          ) : (
            <p>
              <span className="tabular text-4xl font-bold text-steel">{Math.max(days, 0)}</span>{' '}
              <span className="text-muted">
                {days === 0 ? 'c’est aujourd’hui !' : days < 0 ? 'jours (partiel passé)' : days === 1 ? 'jour avant le partiel' : 'jours avant le partiel'}
              </span>
            </p>
          )}
        </section>

        <button
          type="button"
          className="btn-primary w-full py-4 text-lg"
          onClick={() => (data?.session ? nav(`/${isMock ? 'partiel' : 'serie'}/${data.session.id}`) : nav('/matieres/stab1/entrainement'))}
        >
          {data?.session ? 'Continuer' : 'Commencer une série'}
        </button>
        <p className="-mt-2 text-center text-xs text-muted">{progress ?? 'Aucune série en cours.'}</p>

        <section aria-label="Raccourcis" className="grid grid-cols-1 gap-3">
          <Link to="/matieres/stab1/partiel" className="card flex min-h-[56px] items-center gap-3 px-4">
            <span className="text-2xl" aria-hidden>
              📝
            </span>
            <span className="font-semibold">Partiel blanc STAB 1</span>
          </Link>
          <Link to="/matieres/stab1/table" className="card flex min-h-[56px] items-center gap-3 px-4">
            <span className="text-2xl" aria-hidden>
              🧮
            </span>
            <span className="font-semibold">Contrôle sur table</span>
          </Link>
          <button type="button" onClick={revise} className="card flex min-h-[56px] items-center gap-3 px-4 text-left">
            <span className="text-2xl" aria-hidden>
              🔁
            </span>
            <span className="font-semibold">Révision de mes erreurs ({data?.due ?? 0} question{(data?.due ?? 0) > 1 ? 's' : ''})</span>
          </button>
        </section>

        <section aria-label="Statistiques" className="grid grid-cols-3 gap-3 text-center">
          <div className="card p-3">
            <p className="tabular text-2xl font-bold">{data?.streak ?? 0}</p>
            <p className="text-xs text-muted">jour{(data?.streak ?? 0) > 1 ? 's' : ''} d’affilée</p>
          </div>
          <div className="card p-3">
            <p className="tabular text-2xl font-bold">{data?.rate == null ? '–' : `${Math.round(data.rate * 100)} %`}</p>
            <p className="text-xs text-muted">réussite 7 j</p>
          </div>
          <div className="card p-3">
            <p className="text-sm font-semibold leading-tight">{data?.weak ? data.weak.name : '–'}</p>
            <p className="text-xs text-muted">à retravailler</p>
          </div>
        </section>
      </main>
    </>
  );
}
