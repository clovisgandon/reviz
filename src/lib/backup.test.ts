import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { RevizDB } from '@/db/db';
import { backupDue, exportData, importData, parseBackup, resetHistory } from './backup';
import type { Question, Subject } from './types';

const subj = (id: string, builtIn = false): Subject => ({
  id, name: id, color: '#000', emoji: '📘', builtIn, themes: [{ id: 't', name: 'T' }],
  examConfig: { scoring: { right: 1, wrong: 0, blank: 0 }, durationMin: 60 },
});
const q = (id: string, subjectId: string, origin: Question['origin']): Question => ({
  id, subjectId, themeIds: ['t'], level: 1, type: 'truefalse', prompt: 'p',
  choices: [{ id: 'v', text: 'Vrai' }, { id: 'f', text: 'Faux' }], answer: ['v'], explanation: 'e', origin,
});

async function fill(db: RevizDB) {
  await db.subjects.bulkPut([{ ...subj('stab1', true), examDate: '2027-01-10' }, subj('perso')]);
  await db.questions.bulkPut([q('b1', 'stab1', 'builtin'), q('p1', 'perso', 'import')]);
  await db.flashcards.bulkPut([
    { id: 'stab1-fc-001', subjectId: 'stab1', themeIds: ['t'], front: 'f', back: 'b' },
    { id: 'perso-fc-x', subjectId: 'perso', themeIds: ['t'], front: 'f', back: 'b', origin: 'import' },
  ]);
  await db.attempts.put({ id: 'a1', subjectId: 'perso', mode: 'theme', startedAt: 1, config: {}, items: [], score: 0, maxScore: 1, scoreOn20: 0 });
  await db.srs.put({ questionId: 'p1', box: 2, due: 5, streak: 1 });
  await db.settings.bulkPut([{ key: 'apiKey', value: 'sk-ant-secret' }, { key: 'numericTolerancePct', value: 3 }]);
  await db.documents.put({ id: 'd1', subjectId: 'perso', name: 'cours.txt', mime: 'text/plain', blob: new Blob(['bonjour']), pages: [{ n: 1, text: 'bonjour' }], addedAt: 1 });
}

describe('sauvegarde', () => {
  it('exporte les données perso, jamais la clé API ni le contenu intégré', async () => {
    const db = new RevizDB('bk1');
    await fill(db);
    const b = await exportData({ withDocuments: true }, db);
    expect(b.tables.questions.map((x) => x.id)).toEqual(['p1']);
    expect(b.tables.flashcards.map((x) => x.id)).toEqual(['perso-fc-x']);
    expect(b.tables.settings.map((s) => s.key)).toEqual(['numericTolerancePct']);
    expect(JSON.stringify(b)).not.toContain('sk-ant-secret');
    expect(b.tables.documents[0].data).toBe(btoa('bonjour'));
    const light = await exportData({ withDocuments: false }, db);
    expect(light.tables.documents[0].data).toBeUndefined();
    expect(light.tables.documents[0].name).toBe('cours.txt');
  });

  it('restaure sur un appareil vide, puis le remplacement efface les données perso mais pas STAB 1', async () => {
    const src = new RevizDB('bk2');
    await fill(src);
    const text = JSON.stringify(await exportData({ withDocuments: true }, src));

    const dst = new RevizDB('bk3');
    await dst.subjects.put(subj('stab1', true));
    await dst.questions.put(q('b1', 'stab1', 'builtin'));
    await dst.attempts.put({ id: 'old', subjectId: 'stab1', mode: 'theme', startedAt: 0, config: {}, items: [], score: 0, maxScore: 1, scoreOn20: 0 });

    const merged = await importData(parseBackup(text), 'merge', dst);
    expect(merged).toMatchObject({ subjects: 1, questions: 1, attempts: 1, documents: 1, skipped: 0 });
    expect(await dst.attempts.count()).toBe(2);
    expect((await dst.subjects.get('stab1'))?.examDate).toBe('2027-01-10');
    expect(await (await dst.documents.get('d1'))!.blob.text()).toBe('bonjour');

    await importData(parseBackup(text), 'replace', dst);
    expect((await dst.attempts.toArray()).map((a) => a.id)).toEqual(['a1']);
    expect(await dst.questions.get('b1')).toBeTruthy();
    expect((await dst.subjects.get('stab1'))?.builtIn).toBe(true);
  });

  it('refuse un fichier qui n’est pas une sauvegarde', () => {
    expect(() => parseBackup('{"a":1}')).toThrow(/pas une sauvegarde/);
    expect(() => parseBackup('pas du json')).toThrow(/JSON/);
  });

  it('réinitialise l’historique d’une seule matière', async () => {
    const db = new RevizDB('bk4');
    await fill(db);
    await db.attempts.put({ id: 'a2', subjectId: 'stab1', mode: 'theme', startedAt: 1, config: {}, items: [], score: 0, maxScore: 1, scoreOn20: 0 });
    await resetHistory('perso', db);
    expect((await db.attempts.toArray()).map((a) => a.id)).toEqual(['a2']);
    expect(await db.srs.count()).toBe(0);
    expect(await db.questions.count()).toBe(2);
  });

  it('rappelle de sauvegarder après 7 jours d’activité sans sauvegarde', () => {
    const day = 86400000;
    expect(backupDue(0, null, 100 * day)).toBe(false);
    expect(backupDue(0, 95 * day, 100 * day)).toBe(false);
    expect(backupDue(0, 90 * day, 100 * day)).toBe(true);
    expect(backupDue(98 * day, 50 * day, 100 * day)).toBe(false);
  });
});
