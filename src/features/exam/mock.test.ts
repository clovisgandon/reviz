import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Question } from '@/lib/types';
import { gradeMock, pickQcm, type MockState } from './mock';
import { findGenerator } from '@/subjects/stab1/generators';
import { paramsFor, solve } from '@/features/table/types';

const dir = join(__dirname, '../../subjects/stab1/questions');
const pool: Question[] = readdirSync(dir).flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));

describe('partiel blanc', () => {
  it('tire ~10 QCM style examen, piège « Cocher A » en tête, avec ou sans BA', () => {
    const a = pickQcm(pool, true, 7);
    expect(a[0].id).toBe('stab1-qcmA-001');
    expect(a.length).toBe(10);
    expect(a.some((q) => q.themeIds.some((t) => t.startsWith('ba-')))).toBe(true);
    const b = pickQcm(pool, false, 7);
    expect(b.some((q) => q.themeIds.some((t) => t.startsWith('ba-')))).toBe(false);
    expect(new Set(a.map((q) => q.id)).size).toBe(a.length);
  });

  it('note : QCM +2/−1/0 ramené au poids de la partie + exercices au prorata', () => {
    const qcm = pickQcm(pool, false, 3);
    const qs = Object.fromEntries(qcm.map((q) => [q.id, q]));
    const answers: MockState['answers'] = {};
    // Q1 juste, Q2 fausse, le reste sans réponse
    const q1 = qcm[0];
    answers[q1.id] = { ids: q1.answer as string[], text: '' };
    const q2 = qcm.find((q, i) => i > 0 && q.type === 'single')!;
    answers[q2.id] = { ids: [q2.choices!.find((c) => !(q2.answer as string[]).includes(c.id))!.id], text: '' };
    const m1 = findGenerator('m1-panne-ipe')!;
    const res = solve(m1, paramsFor(m1, 0, 0));
    const st: MockState = {
      kind: 'mock', title: 't', questionIds: qcm.map((q) => q.id), choiceOrder: {}, answers,
      exercises: [{ genId: 'm1-panne-ipe', seed: 0, cas: 0, weight: 6, answers: res.steps.map((s) => String(s.expected)) }],
      qcmWeight: 14, scoring: { right: 2, wrong: -1, blank: 0 }, tolerancePct: 2, startedAt: 0, durationMin: 90,
    };
    const g = gradeMock(st, qs);
    expect(g.qcm.points).toBe(1); // +2 −1
    expect(g.qcm.note).toBeCloseTo((1 / (2 * qcm.length)) * 14, 5);
    expect(g.exercises[0].right).toBe(m1.steps.length);
    expect(g.exercises[0].note).toBeCloseTo(6, 5);
    expect(g.total).toBeCloseTo(6 + (1 / 20) * 14, 5);
  });
});
