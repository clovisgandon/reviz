import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, type Session } from '@/db/db';
import type { Question } from '@/lib/types';
import { QuestionBody } from '@/components/QuestionCard';
import { AnswerInput, type Draft } from '@/components/AnswerInput';
import { DataPanel } from '@/components/DataBlocks';
import { Rich, RichInline } from '@/components/Rich';
import { CloseIcon } from '@/components/Icons';
import { findGenerator } from '@/subjects/stab1/generators';
import { paramsFor, solve } from '@/features/table/types';
import { Chrono } from '@/features/quiz/QuizPage';
import { submitMock, type MockState } from './mock';
import { fmt } from '@/lib/format';

/** La copie du partiel blanc : tout le sujet sur une page, comme sur table. Pas de correction avant de rendre. */
export function MockExamPage() {
  const { sessionId = '' } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [st, setSt] = useState<MockState | null>(null);
  const [qs, setQs] = useState<Record<string, Question>>({});
  const [confirm, setConfirm] = useState(false);
  const submitting = useRef(false);
  const saveTimer = useRef<number>();

  useEffect(() => {
    (async () => {
      const s = await db.sessions.get(sessionId);
      if (!s || (s.state as MockState).kind !== 'mock') return setSession(null);
      const state = s.state as MockState;
      const list = (await db.questions.bulkGet(state.questionIds)).filter((q): q is Question => !!q);
      setQs(Object.fromEntries(list.map((q) => [q.id, q])));
      setSession(s);
      setSt(state);
    })();
  }, [sessionId]);

  // Sauvegarde automatique (légèrement différée) à chaque saisie.
  const update = (next: MockState) => {
    setSt(next);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (session) void db.sessions.put({ ...session, state: next, updatedAt: Date.now() });
    }, 400);
  };

  const submit = useCallback(async () => {
    if (!session || !st || submitting.current) return;
    submitting.current = true;
    window.clearTimeout(saveTimer.current);
    const id = await submitMock(session, st);
    nav(`/resultats/${id}`, { replace: true });
  }, [session, st, nav]);

  const exercises = useMemo(
    () => (st?.exercises ?? []).map((e) => {
      const g = findGenerator(e.genId)!;
      const p = paramsFor(g, e.seed, e.cas);
      // Libellés et propositions calculés une fois (ils ne dépendent pas des réponses de l'élève).
      const ref = solve(g, p).steps.map((x) => ({ label: x.label, choices: x.choices }));
      return { e, g, p, ref };
    }),
    [st?.exercises],
  );

  if (session === null)
    return (
      <main className="p-6 pt-[calc(24px+env(safe-area-inset-top))] text-center">
        <p>Cette copie n’existe plus (déjà rendue ?).</p>
        <button type="button" className="btn-primary mt-4" onClick={() => nav('/', { replace: true })}>Accueil</button>
      </main>
    );
  if (!session || !st) return null;

  const qcmDone = st.questionIds.filter((id) => { const d = st.answers[id]; return d && (d.ids.length > 0 || d.text.trim() !== ''); }).length;
  const exDone = st.exercises.reduce((s, e) => s + e.answers.filter((a) => a !== null && a !== undefined && a !== '').length, 0);
  const exTotal = exercises.reduce((s, x) => s + x.g.steps.length, 0);

  const setQcm = (id: string, d: Draft) => update({ ...st, answers: { ...st.answers, [id]: d } });
  const setStep = (ei: number, si: number, val: string | null) => {
    const ex = st.exercises.map((e, i) => (i === ei ? { ...e, answers: Object.assign([...e.answers], { [si]: val }) } : e));
    update({ ...st, exercises: ex });
  };

  return (
    <div className="min-h-full pb-[calc(96px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-safe-t backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-2">
          <button type="button" onClick={() => nav(-1)} aria-label="Quitter (copie sauvegardée)" className="-ml-2 flex h-11 w-11 items-center justify-center text-muted">
            <CloseIcon className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{st.title}</p>
            <p className="tabular text-xs text-muted">QCM {qcmDone}/{st.questionIds.length} · exercices {exDone}/{exTotal}</p>
          </div>
          <Chrono startedAt={st.startedAt} durationMin={st.durationMin} onTimeout={submit} />
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-6 px-4 pt-4">
        <section aria-labelledby="p1">
          <h2 id="p1" className="mb-1 text-lg font-bold">Partie 1 — QCM <span className="text-sm font-normal text-muted">({fmt(st.qcmWeight)} pts)</span></h2>
          <p className="mb-3 text-sm text-muted">Bonne réponse +{fmt(st.scoring.right)} · fausse {fmt(st.scoring.wrong)} · sans réponse {fmt(st.scoring.blank)}. Dans le doute, laisse vide.</p>
          <ol className="space-y-4">
            {st.questionIds.map((id, i) => {
              const q = qs[id];
              if (!q) return null;
              const d = st.answers[id] ?? { ids: [], text: '' };
              return (
                <li key={id} className="card space-y-3 p-4">
                  <p className="text-xs font-semibold text-muted">Question {i + 1}</p>
                  <QuestionBody q={q} />
                  <AnswerInput q={q} order={st.choiceOrder[id] ?? []} draft={d} onChange={(nd) => setQcm(id, nd)} locked={false} />
                  {(d.ids.length > 0 || d.text) && (
                    <button type="button" className="text-sm text-muted underline" onClick={() => setQcm(id, { ids: [], text: '' })}>Effacer ma réponse</button>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {exercises.map(({ e, g, p, ref }, ei) => (
          <section key={ei} aria-labelledby={`ex${ei}`} className="space-y-3">
            <h2 id={`ex${ei}`} className="text-lg font-bold">
              Partie {ei + 2} — {g.group === 'Métal' ? 'Construction métallique' : g.group === 'Bois' ? 'Construction bois' : 'Béton armé'} <span className="text-sm font-normal text-muted">({fmt(e.weight)} pts)</span>
            </h2>
            <div className="card p-4"><Rich text={g.statement(p)} /></div>
            <DataPanel blocks={g.data(p)} defaultOpen={false} />
            <ol className="space-y-3">
              {g.steps.map((s, si) => {
                const val = e.answers[si] ?? '';
                const { label, choices } = ref[si];
                return (
                  <li key={s.key} className="card p-3">
                    <p className="mb-2 text-sm font-semibold">{si + 1}. <RichInline text={label} /></p>
                    {s.kind === 'numeric' ? (
                      <div className="flex items-center gap-2">
                        <input type="text" inputMode="decimal" autoComplete="off" aria-label={`Réponse étape ${si + 1}`} className="field tabular flex-1"
                          value={val ?? ''} onChange={(ev) => setStep(ei, si, ev.target.value)} placeholder="ta valeur" />
                        {s.unit && <span className="min-w-[3rem] text-sm font-semibold text-muted">{s.unit}</span>}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2" role="radiogroup">
                        {choices?.map((c) => (
                          <button key={c.id} type="button" role="radio" aria-checked={val === c.id} onClick={() => setStep(ei, si, val === c.id ? null : c.id)}
                            className={`min-h-[44px] rounded-xl border-2 px-3 text-left text-sm ${val === c.id ? 'border-steel bg-steel/10' : 'border-line bg-surface'}`}>
                            <RichInline text={c.text} />
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          {confirm ? (
            <div className="space-y-2">
              <p className="text-center text-sm">
                Rendre la copie ? {st.questionIds.length - qcmDone + exTotal - exDone > 0 ? `${st.questionIds.length - qcmDone + exTotal - exDone} réponse(s) vide(s).` : 'Tout est rempli.'}
              </p>
              <div className="flex gap-2">
                <button type="button" className="btn-ghost flex-1" onClick={() => setConfirm(false)}>Continuer</button>
                <button type="button" className="btn-accent flex-1" onClick={submit}>Rendre</button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn-primary w-full text-lg" onClick={() => setConfirm(true)}>Rendre la copie</button>
          )}
        </div>
      </div>
    </div>
  );
}
