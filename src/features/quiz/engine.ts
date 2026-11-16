import { db, type Session } from '@/db/db';
import type { Attempt, AttemptMode, Level, Question } from '@/lib/types';
import { newSeed, rng, shuffle, uid } from '@/lib/random';
import { checkAnswer, on20, pointsFor, TRAINING_SCORING, type Given, type Scoring } from '@/lib/scoring';
import { getSetting } from '@/lib/settings';

/** Réponse enregistrée pour une question de la série. */
export type QuizAnswer = { given: Given; correct: boolean | null; points: number; timeMs: number };

/** État d'une série en cours, sauvegardé à chaque réponse (bouton « Continuer »). */
export type QuizState = {
  title: string;
  questionIds: string[];
  /** ordre d'affichage des choix par question (mélangé une fois pour toutes) */
  choiceOrder: Record<string, string[]>;
  index: number;
  answers: Record<string, QuizAnswer>;
  scoring: Scoring;
  tolerancePct: number;
  /** true = correction seulement à la fin (partiel blanc) */
  deferred: boolean;
  /** chrono en minutes (partiel blanc), sinon absent */
  durationMin?: number;
  /** mort subite : s'arrête à la première erreur */
  stopOnError?: boolean;
  startedAt: number;
  config: unknown;
};

export type ThemeConfig = { themeIds: string[]; level: Level | 'mix'; count: number; seed?: number };

/** Tirage des questions : priorité aux questions jamais vues, puis mélange (seed reproductible). */
export function selectQuestions(pool: Question[], cfg: ThemeConfig, seen: Set<string> = new Set()): Question[] {
  const rand = rng(cfg.seed ?? newSeed());
  const filtered = pool.filter(
    (q) =>
      (cfg.themeIds.length === 0 || q.themeIds.some((t) => cfg.themeIds.includes(t))) &&
      (cfg.level === 'mix' || q.level === cfg.level),
  );
  const fresh = shuffle(filtered.filter((q) => !seen.has(q.id)), rand);
  const old = shuffle(filtered.filter((q) => seen.has(q.id)), rand);
  return [...fresh, ...old].slice(0, cfg.count);
}

function choiceOrderFor(questions: Question[], rand: () => number, shuffleChoices = true): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const q of questions) {
    const ids = (q.choices ?? []).map((c) => c.id);
    // Vrai/Faux jamais mélangés ; « order » toujours mélangé (c'est l'exercice).
    // Tag « ordre-fixe » ou sujet officiel : les lettres comptent (ex. « Cocher la réponse A »).
    const keep = q.type === 'truefalse' || q.tags?.includes('ordre-fixe') || (!shuffleChoices && q.type !== 'order');
    out[q.id] = keep ? ids : shuffle(ids, rand);
  }
  return out;
}

export async function createSession(params: {
  subjectId: string;
  mode: AttemptMode;
  title: string;
  questions: Question[];
  config: unknown;
  deferred?: boolean;
  scoring?: Scoring;
  durationMin?: number;
  stopOnError?: boolean;
  seed?: number;
  /** false = garder l'ordre des propositions (sujets officiels) */
  shuffleChoices?: boolean;
}): Promise<string> {
  const rand = rng(params.seed ?? newSeed());
  const state: QuizState = {
    title: params.title,
    questionIds: params.questions.map((q) => q.id),
    choiceOrder: choiceOrderFor(params.questions, rand, params.shuffleChoices ?? true),
    index: 0,
    answers: {},
    scoring: params.scoring ?? TRAINING_SCORING,
    tolerancePct: await getSetting('numericTolerancePct'),
    deferred: params.deferred ?? false,
    durationMin: params.durationMin,
    stopOnError: params.stopOnError,
    startedAt: Date.now(),
    config: params.config,
  };
  const session: Session = {
    id: uid('s-'),
    subjectId: params.subjectId,
    mode: params.mode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state,
  };
  await db.sessions.put(session);
  return session.id;
}

export function grade(q: Question, given: Given, state: QuizState, timeMs: number): QuizAnswer {
  const correct = checkAnswer(q, given, state.tolerancePct);
  return { given, correct, points: pointsFor(correct, state.scoring), timeMs };
}

export async function saveState(session: Session, state: QuizState) {
  await db.sessions.put({ ...session, state, updatedAt: Date.now() });
}

/** Clôt la série : crée la tentative dans l'historique, supprime la session. */
export async function finishSession(session: Session, state: QuizState): Promise<string> {
  const items = state.questionIds.map((id) => {
    const a = state.answers[id];
    return {
      questionId: id,
      given: a?.given ?? null,
      correct: a ? a.correct : null,
      points: a?.points ?? state.scoring.blank,
      timeMs: a?.timeMs ?? 0,
    };
  });
  // En mort subite, seules les questions jouées comptent.
  const played = state.stopOnError ? items.filter((i) => state.answers[i.questionId!]) : items;
  const score = played.reduce((s, i) => s + i.points, 0);
  const maxScore = played.length * state.scoring.right;
  const attempt: Attempt = {
    id: uid('a-'),
    subjectId: session.subjectId,
    mode: session.mode,
    startedAt: state.startedAt,
    endedAt: Date.now(),
    config: { ...(state.config as object), title: state.title, scoring: state.scoring },
    items: played,
    score,
    maxScore,
    scoreOn20: on20(score, maxScore),
  };
  await db.transaction('rw', [db.attempts, db.sessions], async () => {
    await db.attempts.put(attempt);
    await db.sessions.delete(session.id);
  });
  return attempt.id;
}

/** Ids des questions déjà vues dans une matière (pour privilégier les nouvelles). */
export async function seenQuestionIds(subjectId: string): Promise<Set<string>> {
  const attempts = await db.attempts.where('subjectId').equals(subjectId).toArray();
  return new Set(attempts.flatMap((a) => a.items.map((i) => i.questionId).filter((x): x is string => !!x)));
}
