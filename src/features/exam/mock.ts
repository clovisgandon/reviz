import { db, type Session } from '@/db/db';
import type { Attempt, AttemptItem, Question } from '@/lib/types';
import { newSeed, rng, shuffle, uid } from '@/lib/random';
import { checkAnswer, pointsFor, type Given, type Scoring } from '@/lib/scoring';
import { getSetting } from '@/lib/settings';
import { parseNumber } from '@/lib/format';
import { findGenerator } from '@/subjects/stab1/generators';
import { paramsFor, solve } from '@/features/table/types';
import { recordSrs } from '@/features/quiz/engine';
import type { Draft } from '@/components/AnswerInput';
import EXAMS from '@/subjects/stab1/exams.json';

/** Nombre de questions du partiel blanc d'une matière perso. */
export const MOCK_QCM_COUNT = 20;

export type MockExercise = { genId: string; seed: number; cas?: number; weight: number; answers: (string | null)[] };

/** Copie de partiel blanc en cours (sauvegardée à chaque saisie). */
export type MockState = {
  kind: 'mock';
  title: string;
  questionIds: string[];
  choiceOrder: Record<string, string[]>;
  /** brouillons QCM par question (compatible avec le compteur de l'accueil) */
  answers: Record<string, Draft>;
  exercises: MockExercise[];
  qcmWeight: number;
  scoring: Scoring;
  tolerancePct: number;
  startedAt: number;
  durationMin: number;
  official?: string;
};

// Répartition des QCM par famille de thèmes (calquée sur le partiel : actions, puis cours métal/bois/BA).
const QCM_PLAN = (withBA: boolean): [string[], number][] => [
  [['ec0', 'charges'], 1],
  [['neige'], 2],
  [['vent'], 2],
  [['stabilite', 'metal-materiau', 'metal-elu', 'metal-els', 'metal-pieds-mixte'], 2],
  [['bois-coef', 'bois-elu', 'bois-els'], withBA ? 1 : 2],
  ...(withBA ? ([[['ba-materiaux', 'ba-enrobage', 'ba-ancrage', 'ba-poteaux', 'ba-flexion'], 1]] as [string[], number][]) : []),
];

export function pickQcm(pool: Question[], withBA: boolean, seed: number): Question[] {
  const rand = rng(seed);
  const exam = pool.filter((q) => q.examStyle && q.type !== 'order');
  const used = new Set<string>(['stab1-qcmA-001']);
  const out: Question[] = [];
  const first = pool.find((q) => q.id === 'stab1-qcmA-001');
  if (first) out.push(first); // le piège d'attention en tête, comme au vrai QCM
  for (const [themes, count] of QCM_PLAN(withBA)) {
    const cand = shuffle(exam.filter((q) => !used.has(q.id) && q.themeIds.some((t) => themes.includes(t))), rand).slice(0, count);
    for (const q of cand) (used.add(q.id), out.push(q));
  }
  return out;
}

function orderFor(qs: Question[], rand: () => number) {
  return Object.fromEntries(qs.map((q) => {
    const ids = (q.choices ?? []).map((c) => c.id);
    return [q.id, q.type === 'truefalse' || q.tags?.includes('ordre-fixe') ? ids : shuffle(ids, rand)];
  }));
}

export async function createMock(opts: { subjectId: string; withBA: boolean; durationMin: number; official2023?: boolean }): Promise<string> {
  const seed = newSeed();
  const rand = rng(seed);
  const pool = await db.questions.where('subjectId').equals(opts.subjectId).toArray();
  let qcm: Question[];
  let exercises: MockExercise[];
  let title: string;
  let scoring = await getSetting('scoring');
  if (opts.subjectId !== 'stab1') {
    // Matière perso : QCM seul (pas de générateurs), questions « style examen » en priorité, barème de la matière.
    const subject = await db.subjects.get(opts.subjectId);
    const usable = pool.filter((q) => q.type !== 'order');
    const exam = shuffle(usable.filter((q) => q.examStyle), rand);
    const rest = shuffle(usable.filter((q) => !q.examStyle), rand);
    qcm = [...exam, ...rest].slice(0, MOCK_QCM_COUNT);
    exercises = [];
    title = `Partiel blanc · ${subject?.name ?? ''}`.trim();
    if (subject) scoring = subject.examConfig.scoring;
  } else if (opts.official2023) {
    const ids = EXAMS.find((e) => e.id === 'qcm-neige-vent-A')!.questionIds;
    qcm = (await db.questions.bulkGet(ids)).filter((q): q is Question => !!q);
    exercises = [
      { genId: 'm1-panne-ipe', seed: 0, cas: 0, weight: 6, answers: [] },
      { genId: 'b1-solive', seed: 0, cas: 0, weight: 6, answers: [] },
    ];
    title = 'Partiel 2023 (sujet original)';
  } else {
    qcm = pickQcm(pool, opts.withBA, seed);
    const ba = opts.withBA ? [{ genId: shuffle(['ba4-flexion', 'ba5-poteau', 'ba2-enrobage', 'ba3-ancrage'], rand)[0], seed: newSeed(), weight: 4, answers: [] }] : [];
    exercises = [
      { genId: 'm1-panne-ipe', seed: newSeed(), weight: opts.withBA ? 5 : 6, answers: [] },
      { genId: 'b1-solive', seed: newSeed(), weight: opts.withBA ? 5 : 6, answers: [] },
      ...ba,
    ];
    title = `Partiel blanc${opts.withBA ? ' (avec BA)' : ''}`;
  }
  const state: MockState = {
    kind: 'mock', title, questionIds: qcm.map((q) => q.id), choiceOrder: orderFor(qcm, rand), answers: {},
    exercises, qcmWeight: 20 - exercises.reduce((s, e) => s + e.weight, 0),
    scoring, tolerancePct: await getSetting('numericTolerancePct'),
    startedAt: Date.now(), durationMin: opts.durationMin, official: opts.official2023 ? 'partiel-2023' : undefined,
  };
  const session: Session = { id: uid('s-'), subjectId: opts.subjectId, mode: 'exam', createdAt: Date.now(), updatedAt: Date.now(), state };
  await db.sessions.put(session);
  return session.id;
}

export function draftToGiven(q: Question, d: Draft | undefined): Given {
  if (!d) return null;
  if (q.type === 'numeric') return d.text.trim() === '' ? null : parseNumber(d.text);
  return d.ids.length ? d.ids : null;
}

export type MockGrade = {
  qcm: { points: number; max: number; note: number; weight: number };
  exercises: { genId: string; title: string; right: number; steps: number; note: number; weight: number }[];
  total: number;
  items: AttemptItem[];
};

/** Correction de la copie : QCM au barème +2/−1/0, exercices au prorata des étapes justes. */
export function gradeMock(st: MockState, questions: Record<string, Question>): MockGrade {
  const items: AttemptItem[] = [];
  let pts = 0;
  for (const id of st.questionIds) {
    const q = questions[id];
    if (!q) continue;
    const given = draftToGiven(q, st.answers[id]);
    const correct = checkAnswer(q, given, st.tolerancePct);
    const p = pointsFor(correct, st.scoring);
    pts += p;
    items.push({ questionId: id, given, correct, points: p, timeMs: 0 });
  }
  const max = st.questionIds.length * st.scoring.right;
  const qcmNote = max > 0 ? (Math.max(0, pts) / max) * st.qcmWeight : 0;
  const exercises = st.exercises.map((e) => {
    const g = findGenerator(e.genId)!;
    const given = g.steps.map((s, i) => {
      const raw = e.answers[i];
      if (raw === null || raw === undefined || raw === '') return null;
      return s.kind === 'numeric' ? parseNumber(String(raw)) : raw;
    });
    const res = solve(g, paramsFor(g, e.seed, e.cas), given, false);
    const right = res.steps.filter((x) => x.right).length;
    res.steps.forEach((x, i) =>
      items.push({ generatorId: e.genId, seed: e.seed, given: { step: x.step.key, value: given[i], expected: x.expected, cas: e.cas }, correct: given[i] === null ? null : x.right, points: x.right ? e.weight / g.steps.length : 0, timeMs: 0 }),
    );
    return { genId: e.genId, title: `${g.code} — ${g.title}`, right, steps: g.steps.length, note: (right / g.steps.length) * e.weight, weight: e.weight };
  });
  const total = qcmNote + exercises.reduce((s, e) => s + e.note, 0);
  return { qcm: { points: pts, max, note: qcmNote, weight: st.qcmWeight }, exercises, total, items };
}

export async function submitMock(session: Session, st: MockState): Promise<string> {
  const qs = (await db.questions.bulkGet(st.questionIds)).filter((q): q is Question => !!q);
  const g = gradeMock(st, Object.fromEntries(qs.map((q) => [q.id, q])));
  const attempt: Attempt = {
    id: uid('a-'), subjectId: session.subjectId, mode: 'exam', startedAt: st.startedAt, endedAt: Date.now(),
    config: { title: st.title, mock: true, official: st.official, parts: { qcm: g.qcm, exercises: g.exercises }, exercises: st.exercises.map(({ genId, seed, cas }) => ({ genId, seed, cas })), scoring: st.scoring },
    items: g.items, score: +g.total.toFixed(2), maxScore: 20, scoreOn20: Math.min(20, g.total),
  };
  await db.transaction('rw', [db.attempts, db.sessions, db.srs], async () => {
    await db.attempts.put(attempt);
    await db.sessions.delete(session.id);
    await recordSrs(g.items.filter((i) => i.questionId).map((i) => [i.questionId!, i.correct]));
  });
  return attempt.id;
}
