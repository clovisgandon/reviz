import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, type Session } from '@/db/db';
import type { Question, Subject } from '@/lib/types';
import { parseNumber } from '@/lib/format';
import { vibrate } from '@/lib/platform';
import type { Given } from '@/lib/scoring';
import { AnswerInput, emptyDraft, type Draft } from '@/components/AnswerInput';
import { Feedback, FavoriteButton, ReportButton, levelStars } from '@/components/Feedback';
import { QuestionBody } from '@/components/QuestionCard';
import { CloseIcon } from '@/components/Icons';
import { finishSession, grade, saveState, type QuizState } from './engine';

function Chrono({ startedAt, durationMin, onTimeout }: { startedAt: number; durationMin: number; onTimeout: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, startedAt + durationMin * 60000 - now);
  useEffect(() => {
    if (left === 0) onTimeout();
  }, [left, onTimeout]);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <span className={`tabular rounded-lg px-2 py-0.5 text-sm font-bold ${left < 5 * 60000 ? 'bg-ko/15 text-ko' : 'bg-surface2'}`} aria-label="Temps restant">
      ⏱ {m}:{String(s).padStart(2, '0')}
    </span>
  );
}

function draftToGiven(q: Question, d: Draft): Given | 'invalid' {
  if (q.type === 'numeric') {
    if (d.text.trim() === '') return null;
    const n = parseNumber(d.text);
    return n === null ? 'invalid' : n;
  }
  return d.ids.length ? d.ids : null;
}

/** Joue une série (entraînement, erreurs, mort subite, partiel blanc QCM). */
export function QuizPage() {
  const { sessionId = '' } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [state, setState] = useState<QuizState | null>(null);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [subject, setSubject] = useState<Subject | undefined>();
  const [draft, setDraft] = useState<Draft>({ ids: [], text: '' });
  const [error, setError] = useState('');
  const shownAt = useRef(Date.now());
  const finishing = useRef(false);

  useEffect(() => {
    (async () => {
      const s = await db.sessions.get(sessionId);
      if (!s) return setSession(null);
      const st = s.state as QuizState;
      const qs = await db.questions.bulkGet(st.questionIds);
      setQuestions(Object.fromEntries(qs.filter((q): q is Question => !!q).map((q) => [q.id, q])));
      setSubject(await db.subjects.get(s.subjectId));
      setSession(s);
      setState(st);
    })();
  }, [sessionId]);

  const q = state ? questions[state.questionIds[state.index]] : undefined;
  const order = useMemo(() => (q && state ? state.choiceOrder[q.id] ?? [] : []), [q, state]);
  const answered = q && state ? state.answers[q.id] : undefined;
  const showFeedback = !!answered && !state?.deferred;

  // Nouveau brouillon à chaque question.
  useEffect(() => {
    if (!q) return;
    setDraft(emptyDraft(q, order));
    setError('');
    shownAt.current = Date.now();
    window.scrollTo({ top: 0 });
  }, [q, order]);

  const finish = useCallback(
    async (st: QuizState) => {
      if (!session || finishing.current) return;
      finishing.current = true;
      const attemptId = await finishSession(session, st);
      nav(`/resultats/${attemptId}`, { replace: true });
    },
    [session, nav],
  );

  const onTimeout = useCallback(() => state && finish(state), [state, finish]);

  if (session === null)
    return (
      <main className="mx-auto max-w-xl p-6 pt-[calc(24px+env(safe-area-inset-top))] text-center">
        <p className="text-lg">Cette série n’existe plus (terminée ou supprimée).</p>
        <button type="button" className="btn-primary mt-4" onClick={() => nav('/', { replace: true })}>
          Retour à l’accueil
        </button>
      </main>
    );
  if (!session || !state) return null;
  if (!q) {
    // Questions supprimées entre-temps : on termine proprement.
    if (state.questionIds.length === 0 || state.index >= state.questionIds.length) void finish(state);
    return null;
  }

  const total = state.questionIds.length;
  const isLast = state.index >= total - 1;
  const theme = subject?.themes.find((t) => t.id === q.themeIds[0])?.name ?? q.themeIds[0];
  const stoppedHere = state.stopOnError && answered && answered.correct !== true;

  const submit = async (given: Given) => {
    const a = grade(q, given, state, Date.now() - shownAt.current);
    const next: QuizState = { ...state, answers: { ...state.answers, [q.id]: a } };
    if (state.deferred) {
      // Partiel blanc : pas de correction, on enchaîne.
      if (isLast) return finish(next);
      next.index = state.index + 1;
    } else {
      vibrate(a.correct ? 30 : [60, 40, 60]);
    }
    setState(next);
    await saveState(session, next);
  };

  const validate = () => {
    const g = draftToGiven(q, draft);
    if (g === 'invalid') return setError('Nombre invalide : utilise des chiffres, avec une virgule ou un point.');
    if (g === null) return setError('Choisis une réponse, ou touche « Je ne sais pas ».');
    void submit(g);
  };

  const goNext = async () => {
    if (isLast || stoppedHere) return finish(state);
    const next = { ...state, index: state.index + 1 };
    setState(next);
    await saveState(session, next);
  };

  const quit = () => nav(-1);

  return (
    <div className="min-h-full pb-[calc(96px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-safe-t backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-2">
          <button type="button" onClick={quit} aria-label="Quitter (la série est sauvegardée)" className="-ml-2 flex h-11 w-11 items-center justify-center text-muted">
            <CloseIcon className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="tabular font-bold">
                {state.index + 1}/{total}
              </span>
              {state.durationMin ? <Chrono startedAt={state.startedAt} durationMin={state.durationMin} onTimeout={onTimeout} /> : null}
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={state.index + 1}>
              <div className="h-full bg-steel transition-all" style={{ width: `${((state.index + (answered ? 1 : 0)) / total) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-xl items-center gap-2 px-4 pb-2 text-xs text-muted">
          <span className="truncate">{theme}</span>
          <span aria-label={`Niveau ${q.level}`} className="text-site">
            {levelStars(q.level)}
          </span>
          <span className="ml-auto truncate">{state.title}</span>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-4 px-4 pt-4">
        <QuestionBody q={q} />
        <AnswerInput q={q} order={order} draft={draft} onChange={(d) => (setDraft(d), setError(''))} locked={showFeedback} />
        {error && (
          <p role="alert" className="text-sm font-medium text-ko">
            {error}
          </p>
        )}
        {showFeedback && answered && (
          <>
            <Feedback q={q} given={answered.given} correct={answered.correct} points={state.scoring.wrong !== 0 ? answered.points : undefined} />
            <div className="flex flex-wrap gap-2">
              <FavoriteButton questionId={q.id} />
              <ReportButton questionId={q.id} />
            </div>
            {stoppedHere && <p className="text-center font-semibold">💥 Mort subite : série terminée.</p>}
          </>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-2">
          {showFeedback ? (
            <button type="button" className="btn-primary flex-1 text-lg" onClick={goNext}>
              {isLast || stoppedHere ? 'Voir le résultat' : 'Question suivante →'}
            </button>
          ) : (
            <>
              <button type="button" className="btn-ghost flex-[0.8]" onClick={() => void submit(null)}>
                Je ne sais pas
              </button>
              <button type="button" className="btn-primary flex-1 text-lg" onClick={validate}>
                {state.deferred && isLast ? 'Terminer' : 'Valider'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
