import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { Attempt } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { ChevronRightIcon } from '@/components/Icons';
import { DailyBars, ScoreLine, ThemeHeat } from '@/components/Charts';
import { fmt, fmtDate, fmtDuration } from '@/lib/format';
import { MODE_LABEL } from '@/features/results/ResultsPage';

const PERIODS = [
  { id: '7', label: '7 jours', days: 7 },
  { id: '30', label: '30 jours', days: 30 },
  { id: 'all', label: 'Tout', days: 0 },
];

/** Historique : filtres, graphiques de progression et liste de toutes les tentatives. */
export function HistoryPage() {
  const data = useLiveQuery(async () => {
    const [attempts, subjects, questions] = await Promise.all([
      db.attempts.orderBy('startedAt').reverse().toArray(),
      db.subjects.toArray(),
      db.questions.toArray(),
    ]);
    return { attempts, subjects, qTheme: new Map(questions.map((q) => [q.id, q.themeIds[0]])) };
  }, []);
  const [subject, setSubject] = useState('all');
  const [mode, setMode] = useState<'all' | Attempt['mode']>('all');
  const [period, setPeriod] = useState('30');

  const filtered = useMemo(() => {
    if (!data) return [];
    const days = PERIODS.find((p) => p.id === period)!.days;
    const from = days ? Date.now() - days * 86400000 : 0;
    return data.attempts.filter((a) => (subject === 'all' || a.subjectId === subject) && (mode === 'all' || a.mode === mode) && a.startedAt >= from);
  }, [data, subject, mode, period]);

  const daily = useMemo(() => {
    const days = period === '7' ? 7 : 30;
    const out = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (days - 1 - i));
      return { day: d.toDateString(), date: d, n: 0 };
    });
    for (const a of filtered) {
      const k = new Date(a.startedAt).toDateString();
      const slot = out.find((o) => o.day === k);
      if (slot) slot.n += a.items.filter((i) => i.questionId).length;
    }
    return out;
  }, [filtered, period]);

  const heat = useMemo(() => {
    if (!data) return [];
    const subj = data.subjects.find((s) => s.id === (subject === 'all' ? 'stab1' : subject));
    if (!subj) return [];
    const acc = new Map<string, { ok: number; n: number }>();
    for (const a of filtered)
      for (const i of a.items) {
        const t = i.questionId ? data.qTheme.get(i.questionId) : undefined;
        if (!t) continue;
        const s = acc.get(t) ?? { ok: 0, n: 0 };
        s.n++;
        if (i.correct) s.ok++;
        acc.set(t, s);
      }
    return subj.themes.map((t) => ({ name: t.name, ...(acc.get(t.id) ?? { ok: 0, n: 0 }) }));
  }, [data, filtered, subject]);

  if (!data) return <PageHeader title="Historique" />;
  const subjects = Object.fromEntries(data.subjects.map((s) => [s.id, s]));
  const scored = [...filtered].reverse().filter((a) => a.mode !== 'flash' && a.maxScore > 0);

  const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" aria-pressed={on} onClick={onClick} className={`min-h-[36px] shrink-0 rounded-full border px-3 text-sm ${on ? 'border-steel bg-steel text-white dark:text-bg' : 'border-line bg-surface'}`}>
      {children}
    </button>
  );

  return (
    <>
      <PageHeader title="Historique" />
      <main className="mx-auto max-w-xl space-y-4 px-4 pb-4">
        {/* Filtres sur une seule rangée défilante, au-dessus des graphiques */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtres">
          {PERIODS.map((p) => <Chip key={p.id} on={period === p.id} onClick={() => setPeriod(p.id)}>{p.label}</Chip>)}
          <select aria-label="Matière" className="field min-h-[36px] w-auto shrink-0 py-0 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="all">Toutes matières</option>
            {data.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select aria-label="Mode" className="field min-h-[36px] w-auto shrink-0 py-0 text-sm" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
            <option value="all">Tous modes</option>
            {Object.entries(MODE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {data.attempts.length === 0 ? (
          <div className="card p-6 text-center text-muted">
            <p className="text-3xl" aria-hidden>📈</p>
            <p className="mt-2">Pas encore de tentative. Lance une série pour voir ta progression ici.</p>
          </div>
        ) : (
          <>
            <section className="card p-4" aria-labelledby="c1">
              <h2 id="c1" className="text-sm font-semibold">Évolution de la note /20</h2>
              <p className="mb-2 text-xs text-muted">{scored.length} tentative(s) notée(s) sur la période</p>
              {scored.length ? <ScoreLine points={scored.map((a) => ({ x: a.startedAt, y: a.scoreOn20 }))} /> : <p className="text-sm text-muted">Aucune tentative notée.</p>}
            </section>

            <section className="card p-4" aria-labelledby="c2">
              <h2 id="c2" className="mb-2 text-sm font-semibold">Questions faites par jour</h2>
              <DailyBars days={daily} />
            </section>

            <section className="card p-4" aria-labelledby="c3">
              <h2 id="c3" className="text-sm font-semibold">Réussite par thème</h2>
              <p className="mb-2 text-xs text-muted">% de bonnes réponses · nombre de réponses (plus foncé = mieux réussi)</p>
              <ThemeHeat rows={heat} />
            </section>

            <section aria-labelledby="c4" className="space-y-2">
              <h2 id="c4" className="text-sm font-semibold uppercase tracking-wide text-muted">Tentatives ({filtered.length})</h2>
              {filtered.map((a) => {
                const s = subjects[a.subjectId];
                const title = (a.config as { title?: string })?.title;
                return (
                  <Link key={a.id} to={`/resultats/${a.id}`} className="card flex items-center gap-3 p-3">
                    <span className="text-2xl" aria-hidden>{s?.emoji ?? '📚'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{MODE_LABEL[a.mode]}{title ? ` · ${title}` : ''}</span>
                      <span className="tabular block text-xs text-muted">{s?.name} · {fmtDate(a.startedAt)}{a.endedAt ? ` · ${fmtDuration(a.endedAt - a.startedAt)}` : ''}</span>
                    </span>
                    <span className="tabular text-lg font-bold">{a.mode === 'flash' ? `${a.score}/${a.maxScore}` : fmt(a.scoreOn20, 1)}</span>
                    <ChevronRightIcon className="h-5 w-5 text-muted" />
                  </Link>
                );
              })}
            </section>
          </>
        )}
      </main>
    </>
  );
}
