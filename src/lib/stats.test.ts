import { describe, expect, it } from 'vitest';
import { streak, successRate } from './stats';
import type { Attempt } from './types';

const day = 86400000;
const now = new Date(2026, 10, 16, 12).getTime();
const att = (startedAt: number, results: (boolean | null)[]): Attempt => ({
  id: String(startedAt),
  subjectId: 's',
  mode: 'theme',
  startedAt,
  config: {},
  items: results.map((correct) => ({ given: null, correct, points: 0, timeMs: 0 })),
  score: 0,
  maxScore: 0,
  scoreOn20: 0,
});

describe('stats', () => {
  it('streak : jours consécutifs, tolère « pas encore joué aujourd’hui »', () => {
    expect(streak([att(now, []), att(now - day, []), att(now - 2 * day, [])], now)).toBe(3);
    expect(streak([att(now - day, []), att(now - 2 * day, [])], now)).toBe(2);
    expect(streak([att(now - 3 * day, [])], now)).toBe(0);
  });
  it('réussite sur 7 jours, sans compter les « sans réponse »', () => {
    const r = successRate([att(now, [true, false, null, true]), att(now - 10 * day, [false])], 7, now);
    expect(r).toBeCloseTo(2 / 3);
  });
});
