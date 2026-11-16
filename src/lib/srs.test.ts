import { describe, expect, it } from 'vitest';
import { dueFirst, nextState } from './srs';

const DAY = 86400000;
describe('répétition espacée (Leitner)', () => {
  it('faux → boîte 1 due immédiatement ; juste → boîte suivante avec intervalle croissant', () => {
    const now = 1_000_000;
    let s = nextState(undefined, 'q', false, now);
    expect(s).toMatchObject({ box: 1, due: now, streak: 0 });
    s = nextState(s, 'q', true, now);
    expect(s).toMatchObject({ box: 2, due: now + DAY, streak: 1 });
    s = nextState(s, 'q', true, now);
    expect(s).toMatchObject({ box: 3, due: now + 3 * DAY, streak: 2 });
    s = nextState(s, 'q', true, now);
    // réussie 3 fois d'affilée → revient dans une semaine
    expect(s).toMatchObject({ box: 4, due: now + 7 * DAY, streak: 3 });
    s = nextState(s, 'q', true, now);
    s = nextState(s, 'q', true, now);
    expect(s.box).toBe(5);
    expect(nextState(s, 'q', null, now).box).toBe(1);
  });
  it('dueFirst : seulement les dues, petites boîtes d’abord', () => {
    const now = 10 * DAY;
    const list = dueFirst(
      [
        { questionId: 'a', box: 3, due: now - DAY, streak: 2 },
        { questionId: 'b', box: 1, due: now, streak: 0 },
        { questionId: 'c', box: 2, due: now + DAY, streak: 1 },
        { questionId: 'd', box: 1, due: now - 2 * DAY, streak: 0 },
      ],
      now,
    );
    expect(list.map((s) => s.questionId)).toEqual(['d', 'b', 'a']);
  });
});
