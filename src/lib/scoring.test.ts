import { describe, expect, it } from 'vitest';
import { checkAnswer, on20, pointsFor } from './scoring';
import { parseNumber } from './format';
import type { Question } from './types';

const base = { subjectId: 's', themeIds: ['t'], level: 1 as const, prompt: '', explanation: '', origin: 'manual' as const };
const choices = ['a', 'b', 'c', 'd'].map((id) => ({ id, text: id }));

describe('checkAnswer', () => {
  it('single / truefalse', () => {
    const q: Question = { ...base, id: '1', type: 'single', choices, answer: ['b'] };
    expect(checkAnswer(q, ['b'])).toBe(true);
    expect(checkAnswer(q, ['a'])).toBe(false);
    expect(checkAnswer(q, null)).toBe(null);
  });
  it('multi : tout ou rien', () => {
    const q: Question = { ...base, id: '2', type: 'multi', choices, answer: ['a', 'c'] };
    expect(checkAnswer(q, ['c', 'a'])).toBe(true);
    expect(checkAnswer(q, ['a'])).toBe(false);
    expect(checkAnswer(q, ['a', 'c', 'd'])).toBe(false);
    expect(checkAnswer(q, [])).toBe(null);
  });
  it('numeric : tolérance relative (défaut 2 %, ou celle de la question)', () => {
    const q: Question = { ...base, id: '3', type: 'numeric', answer: { value: 85.6, unit: 'kN' } };
    expect(checkAnswer(q, 85.6)).toBe(true);
    expect(checkAnswer(q, 87.2)).toBe(true); // +1,9 %
    expect(checkAnswer(q, 88)).toBe(false); // +2,8 %
    expect(checkAnswer(q, 88, 5)).toBe(true);
    const strict: Question = { ...q, answer: { value: 85.6, unit: 'kN', tolerancePct: 0.5 } };
    expect(checkAnswer(strict, 86.5)).toBe(false);
    const neg: Question = { ...q, answer: { value: -0.37, unit: '' } };
    expect(checkAnswer(neg, -0.37)).toBe(true);
    expect(checkAnswer(neg, 0.37)).toBe(false);
  });
  it('order : ordre exact', () => {
    const q: Question = { ...base, id: '4', type: 'order', choices, answer: ['c', 'a', 'b', 'd'] };
    expect(checkAnswer(q, ['c', 'a', 'b', 'd'])).toBe(true);
    expect(checkAnswer(q, ['a', 'c', 'b', 'd'])).toBe(false);
  });
});

describe('barème', () => {
  it('+2 / −1 / 0 et note bornée', () => {
    const s = { right: 2, wrong: -1, blank: 0 };
    expect(pointsFor(true, s)).toBe(2);
    expect(pointsFor(false, s)).toBe(-1);
    expect(pointsFor(null, s)).toBe(0);
    expect(on20(-3, 20)).toBe(0);
    expect(on20(10, 20)).toBe(10);
    expect(on20(15, 20)).toBe(15);
  });
});

describe('parseNumber', () => {
  it('accepte la virgule et les espaces', () => {
    expect(parseNumber('85,6')).toBe(85.6);
    expect(parseNumber(' 1 200,5 ')).toBe(1200.5);
    expect(parseNumber('-0.37')).toBe(-0.37);
    expect(parseNumber('abc')).toBe(null);
    expect(parseNumber('')).toBe(null);
  });
});
