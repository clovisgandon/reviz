import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { selectQuestions } from './engine';
import type { Question } from '@/lib/types';

const mk = (id: string, theme: string, level: 1 | 2 | 3): Question => ({
  id,
  subjectId: 's',
  themeIds: [theme],
  level,
  type: 'single',
  prompt: '',
  choices: [
    { id: 'a', text: 'a' },
    { id: 'b', text: 'b' },
  ],
  answer: ['a'],
  explanation: '',
  origin: 'manual',
});

const pool = [mk('1', 'vent', 1), mk('2', 'vent', 2), mk('3', 'neige', 1), mk('4', 'vent', 1), mk('5', 'neige', 3)];

describe('selectQuestions', () => {
  it('filtre par thème et niveau', () => {
    const r = selectQuestions(pool, { themeIds: ['vent'], level: 1, count: 10, seed: 1 });
    expect(r.map((q) => q.id).sort()).toEqual(['1', '4']);
  });
  it('mélange : tous niveaux, nombre limité, reproductible avec la seed', () => {
    const a = selectQuestions(pool, { themeIds: [], level: 'mix', count: 3, seed: 42 });
    const b = selectQuestions(pool, { themeIds: [], level: 'mix', count: 3, seed: 42 });
    expect(a).toHaveLength(3);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
  it('privilégie les questions jamais vues', () => {
    const r = selectQuestions(pool, { themeIds: ['vent'], level: 'mix', count: 2, seed: 3 }, new Set(['1', '2']));
    expect(r.map((q) => q.id)).toContain('4');
    expect(r[0].id).toBe('4');
  });
});
