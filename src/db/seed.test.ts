import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { RevizDB } from './db';
import { seedBuiltins } from './seed';
import type { Question } from '@/lib/types';

const q = (id: string, origin: Question['origin'] = 'builtin'): Question => ({
  id,
  subjectId: 'stab1',
  themeIds: ['vent'],
  level: 1,
  type: 'truefalse',
  prompt: 'x',
  choices: [
    { id: 'v', text: 'Vrai' },
    { id: 'f', text: 'Faux' },
  ],
  answer: ['v'],
  explanation: 'x',
  origin,
});

describe('seedBuiltins', () => {
  it('installe STAB 1 puis met à jour par id sans toucher aux questions perso ni à l’historique', async () => {
    const db = new RevizDB('test-seed-' + Math.random());
    await seedBuiltins(db, [q('a'), q('b')], []);
    expect(await db.subjects.get('stab1')).toBeTruthy();
    expect(await db.questions.count()).toBe(2);

    await db.questions.put(q('perso', 'manual'));
    await db.attempts.put({ id: 't', subjectId: 'stab1', mode: 'theme', startedAt: 1, config: {}, items: [], score: 0, maxScore: 0, scoreOn20: 0 });
    // Même contenu → rien à faire ; contenu modifié → fusion.
    expect((await seedBuiltins(db, [q('a'), q('b')], [])).updated).toBe(false);
    await seedBuiltins(db, [q('a'), q('c')], []);
    const ids = (await db.questions.toArray()).map((x) => x.id).sort();
    expect(ids).toEqual(['a', 'c', 'perso']);
    expect(await db.attempts.count()).toBe(1);
  });
});
