import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { PageHeader } from '@/components/PageHeader';
import { db } from '@/db/db';
import { useSetting } from '@/lib/settings';
import { fmt, fmtDate } from '@/lib/format';
import { createMock } from './mock';

/** Mode 4 : partiel blanc (conditions réelles). */
export function MockSetupPage() {
  const { subjectId = '' } = useParams();
  const nav = useNavigate();
  const defaultBA = useSetting('examIncludeConcrete');
  const defaultDuration = useSetting('examDurationMin');
  const scoring = useSetting('scoring');
  const [withBA, setWithBA] = useState<boolean | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const previous = useLiveQuery(
    async () => (await db.attempts.where('subjectId').equals(subjectId).toArray()).filter((a) => a.mode === 'exam' && (a.config as { mock?: boolean }).mock).sort((a, b) => b.startedAt - a.startedAt),
    [subjectId],
  );
  const ba = withBA ?? defaultBA;
  const dur = duration ?? defaultDuration;

  const start = async (official2023 = false) => {
    setBusy(true);
    const id = await createMock({ subjectId, withBA: official2023 ? false : ba, durationMin: dur, official2023 });
    nav(`/partiel/${id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title="Partiel blanc" back />
      <main className="mx-auto max-w-xl space-y-4 px-4 pb-6">
        <section className="card space-y-2 p-4 text-sm">
          <p className="font-semibold">Comme le vrai partiel :</p>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>~10 questions de QCM (actions, neige, vent, cours métal / bois{ba ? ' / BA' : ''}), barème <b className="text-ink">+{fmt(scoring.right)} / {fmt(scoring.wrong)} / {fmt(scoring.blank)}</b> ;</li>
            <li>un exercice de construction métallique (panne IPE) et un exercice de construction bois (solive){ba ? ', plus un exercice de béton armé' : ''}, données aléatoires ;</li>
            <li>chrono, aucune correction avant la fin, puis copie corrigée et note /20.</li>
          </ul>
          <p className="text-xs text-muted">Barème /20 : {ba ? 'QCM 6 · métal 5 · bois 5 · BA 4' : 'QCM 8 · métal 6 · bois 6'}.</p>
        </section>

        <section className="card divide-y divide-line">
          <label className="flex min-h-[52px] items-center justify-between gap-3 px-4">
            <span>Inclure une partie béton armé</span>
            <input type="checkbox" className="h-6 w-6 accent-[rgb(var(--c-steel))]" checked={ba} onChange={(e) => setWithBA(e.target.checked)} />
          </label>
          <label className="flex min-h-[52px] items-center justify-between gap-3 px-4">
            <span>Durée (min)</span>
            <input type="number" inputMode="numeric" min={10} step={5} className="field tabular w-24 text-right" value={dur} onChange={(e) => setDuration(Number(e.target.value) || 90)} />
          </label>
        </section>

        <button type="button" className="btn-primary w-full py-4 text-lg" disabled={busy} onClick={() => start(false)}>
          Commencer le partiel blanc
        </button>
        <button type="button" className="btn-ghost w-full" disabled={busy} onClick={() => start(true)}>
          📄 Partiel 2023 (sujet original : QCM A + panne IPE + solive)
        </button>

        {!!previous?.length && (
          <section aria-labelledby="prev-h">
            <h2 id="prev-h" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Mes partiels blancs</h2>
            <ul className="card divide-y divide-line">
              {previous.map((a) => (
                <li key={a.id}>
                  <button type="button" className="flex min-h-[52px] w-full items-center justify-between px-4 text-left" onClick={() => nav(`/resultats/${a.id}`)}>
                    <span className="text-sm">
                      {(a.config as { title?: string }).title}
                      <span className="block text-xs text-muted">{fmtDate(a.startedAt)}</span>
                    </span>
                    <span className="tabular text-lg font-bold">{fmt(a.scoreOn20, 1)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
