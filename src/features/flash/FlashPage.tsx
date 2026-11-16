import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { Attempt, Flashcard } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Rich } from '@/components/Rich';
import { newSeed, rng, shuffle, uid } from '@/lib/random';
import { on20 } from '@/lib/scoring';
import { vibrate } from '@/lib/platform';

type Result = { cardId: string; knew: boolean; round: number };

/** Mode 3 : cartes recto-verso de formules, auto-évaluation « je savais / je ne savais pas ». */
export function FlashPage() {
  const { subjectId = '' } = useParams();
  const nav = useNavigate();
  const data = useLiveQuery(async () => ({
    cards: await db.flashcards.where('subjectId').equals(subjectId).toArray(),
    subject: await db.subjects.get(subjectId),
  }), [subjectId]);
  const [themes, setThemes] = useState<string[]>([]);
  const [queue, setQueue] = useState<Flashcard[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [savedId, setSavedId] = useState<string | null>(null);

  const available = useMemo(() => (data?.cards ?? []).filter((c) => themes.length === 0 || c.themeIds.some((t) => themes.includes(t))), [data, themes]);
  const themeIds = useMemo(() => [...new Set((data?.cards ?? []).flatMap((c) => c.themeIds))], [data]);

  const start = () => {
    setQueue(shuffle(available, rng(newSeed())));
    setPos(0); setFlipped(false); setResults([]); setStartedAt(Date.now()); setSavedId(null);
  };

  const finished = queue !== null && pos >= queue.length;
  const firstRound = results.filter((r) => r.round === 0);
  const known = firstRound.filter((r) => r.knew).length;

  useEffect(() => {
    if (!finished || savedId || !queue?.length) return;
    const attempt: Attempt = {
      id: uid('a-'), subjectId, mode: 'flash', startedAt, endedAt: Date.now(),
      config: { title: themes.length ? `${themes.length} thème(s)` : 'Toutes les formules', themes },
      items: firstRound.map((r) => ({ given: { cardId: r.cardId, knew: r.knew }, correct: r.knew, points: r.knew ? 1 : 0, timeMs: 0 })),
      score: known, maxScore: firstRound.length, scoreOn20: on20(known, firstRound.length),
    };
    setSavedId(attempt.id);
    void db.attempts.put(attempt);
  }, [finished, savedId, queue, subjectId, startedAt, themes, firstRound, known]);

  const answer = (knew: boolean) => {
    if (!queue) return;
    const card = queue[pos];
    const round = results.some((r) => r.cardId === card.id) ? 1 : 0;
    setResults((rs) => [...rs, { cardId: card.id, knew, round }]);
    // Une carte ratée au premier passage revient une fois à la fin.
    if (!knew && round === 0) setQueue((q) => [...q!, card]);
    vibrate(knew ? 20 : [40, 30, 40]);
    setFlipped(false);
    setPos((p) => p + 1);
  };

  if (!data) return <PageHeader title="Flash / Formules" back />;
  const themeName = (id: string) => data.subject?.themes.find((t) => t.id === id)?.name ?? id;

  if (queue === null)
    return (
      <>
        <PageHeader title="Flash / Formules" back />
        <main className="mx-auto max-w-xl space-y-4 px-4 pb-28">
          <p className="text-sm text-muted">Lis le recto, récite la formule dans ta tête, retourne la carte et dis honnêtement si tu la savais. Les cartes ratées reviennent à la fin.</p>
          <div className="flex flex-wrap gap-2">
            {themeIds.map((t) => (
              <button key={t} type="button" aria-pressed={themes.includes(t)} onClick={() => setThemes((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))}
                className={`min-h-[40px] rounded-full border px-3 text-sm ${themes.includes(t) ? 'border-steel bg-steel text-white dark:text-bg' : 'border-line bg-surface'}`}>
                {themeName(t)} · {data.cards.filter((c) => c.themeIds.includes(t)).length}
              </button>
            ))}
          </div>
        </main>
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 border-t border-line bg-bg/95 p-3 backdrop-blur">
          <div className="mx-auto max-w-xl">
            <button type="button" className="btn-primary w-full text-lg" disabled={!available.length} onClick={start}>
              Commencer · {available.length} cartes
            </button>
          </div>
        </div>
      </>
    );

  if (finished)
    return (
      <>
        <PageHeader title="Flash / Formules" back />
        <main className="mx-auto max-w-xl space-y-4 px-4">
          <section className="card p-5 text-center">
            <p className="tabular text-5xl font-bold text-steel">{known}<span className="text-2xl text-muted">/{firstRound.length}</span></p>
            <p className="mt-1 text-sm text-muted">formules sues du premier coup</p>
          </section>
          <button type="button" className="btn-primary w-full" onClick={start}>Recommencer</button>
          <button type="button" className="btn-ghost w-full" onClick={() => nav(-1)}>Terminer</button>
        </main>
      </>
    );

  const card = queue[pos];
  return (
    <>
      <PageHeader title={`Carte ${Math.min(pos + 1, queue.length)}/${queue.length}`} back />
      <main className="mx-auto max-w-xl space-y-4 px-4 pb-32">
        <p className="text-center text-xs text-muted">{themeName(card.themeIds[0])}{results.some((r) => r.cardId === card.id) ? ' · 2e passage' : ''}</p>
        <button type="button" onClick={() => setFlipped((f) => !f)} aria-label={flipped ? 'Voir le recto' : 'Retourner la carte'}
          className={`card flex min-h-[280px] w-full flex-col items-center justify-center p-6 text-center transition ${flipped ? 'border-steel' : ''}`}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{flipped ? 'Verso' : 'Recto'}</p>
          <div className={flipped ? 'text-[17px]' : 'text-xl font-semibold'}>
            <Rich text={flipped ? card.back : card.front} />
          </div>
          {!flipped && <p className="mt-6 text-sm text-steel">Touche pour retourner</p>}
          {flipped && card.source?.[0] && <p className="mt-4 text-xs text-muted">📖 {card.source[0].docName}{card.source[0].page ? ` p.${card.source[0].page}` : ''}</p>}
        </button>
      </main>
      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 border-t border-line bg-bg/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-2">
          {flipped ? (
            <>
              <button type="button" className="btn flex-1 border-2 border-ko bg-ko/10 text-ink" onClick={() => answer(false)}>❌ Je ne savais pas</button>
              <button type="button" className="btn flex-1 border-2 border-ok bg-ok/10 text-ink" onClick={() => answer(true)}>✅ Je savais</button>
            </>
          ) : (
            <button type="button" className="btn-primary w-full text-lg" onClick={() => setFlipped(true)}>Retourner</button>
          )}
        </div>
      </div>
    </>
  );
}
