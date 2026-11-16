import { describe, expect, it } from 'vitest';
import { extractJson, normalizeImport } from './importQuestions';
import { split } from '@/features/generation/generate';
import { copyablePrompt } from './genPrompt';
import { matchDoc } from './documents';
import type { Subject } from './types';

const subject: Subject = {
  id: 'meca', name: 'Mécanique des sols', color: '#000', emoji: '🧱', builtIn: false,
  themes: [{ id: 'tassement', name: 'Tassement' }],
  examConfig: { scoring: { right: 1, wrong: 0, blank: 0 }, durationMin: 60 },
};

describe('import de questions', () => {
  it('extrait le JSON d’une réponse avec bloc de code et texte autour', () => {
    expect(extractJson('Voici :\n```json\n[{"a":1}]\n```\nBonne révision')).toEqual([{ a: 1 }]);
    expect(() => extractJson('pas de json ici')).toThrow(/Aucun JSON/);
  });

  it('accepte des formes simples et les normalise', () => {
    const raw = {
      questions: [
        { theme: 'Tassement', type: 'single', prompt: 'Unité de Cc ?', choices: ['sans unité', 'kPa'], answer: 'sans unité', explanation: 'Cc est un indice.', source: 'cours.pdf' },
        { theme: 'Perméabilité', type: 'truefalse', prompt: 'k s’exprime en m/s.', answer: true, explanation: 'Oui, loi de Darcy.', level: 1 },
        { theme: 'tassement', type: 'numeric', prompt: 'Tassement ?', answer: { value: 12.5, unit: 'cm' }, explanation: 'Calcul.', source: [{ docName: 'TD.pdf', page: '3' }] },
      ],
    };
    const r = normalizeImport(raw, subject, 'import', []);
    expect(r.errors).toEqual([]);
    expect(r.questions).toHaveLength(3);
    const [q1, q2, q3] = r.questions;
    expect(q1.themeIds).toEqual(['tassement']);
    expect(q1.choices).toEqual([{ id: 'a', text: 'sans unité' }, { id: 'b', text: 'kPa' }]);
    expect(q1.answer).toEqual(['a']);
    expect(q1.source).toEqual([{ docName: 'cours.pdf' }]);
    expect(q1.origin).toBe('import');
    expect(q1.level).toBe(2);
    expect(q2.answer).toEqual(['v']);
    expect(q2.themeIds).toEqual(['permeabilite']);
    expect(r.newThemes).toEqual([{ id: 'permeabilite', name: 'Perméabilité' }]);
    expect(q3.source?.[0].page).toBe(3);
    expect(new Set(r.questions.map((q) => q.id)).size).toBe(3);
  });

  it('rejette une question invalide avec un message lisible, garde les autres', () => {
    const r = normalizeImport(
      [
        { type: 'single', prompt: 'Q ?', choices: ['x', 'y'], answer: 'z', explanation: 'e' },
        { type: 'single', prompt: 'Q2 ?', choices: ['x', 'y'], answer: 'x', explanation: 'e' },
      ],
      subject, 'ai', [],
    );
    expect(r.questions).toHaveLength(1);
    expect(r.errors[0].messages.join(' ')).toMatch(/absente des choix/);
    expect(r.questions[0].themeIds).toEqual(['general']);
  });

  it('ne réutilise jamais un id déjà en base', () => {
    const r = normalizeImport([{ id: 'stab1-vent-001', type: 'truefalse', prompt: 'p', answer: 'faux', explanation: 'e' }], subject, 'import', ['stab1-vent-001']);
    expect(r.questions[0].id).not.toBe('stab1-vent-001');
    expect(r.questions[0].answer).toEqual(['f']);
  });

  it('refuse un JSON sans questions', () => {
    expect(() => normalizeImport({ foo: 1 }, subject, 'import')).toThrow();
  });
});

describe('génération', () => {
  it('répartit le nombre de questions sur les paquets', () => {
    expect(split(10, [1])).toEqual([10]);
    expect(split(10, [3, 1])).toEqual([8, 2]);
    expect(split(2, [1, 1, 1]).reduce((s, x) => s + x, 0)).toBe(2);
    expect(split(5, [100, 1, 1, 1, 1, 1]).every((x) => x >= 1)).toBe(true);
    expect(split(5, [100, 1, 1, 1, 1, 1]).reduce((s, x) => s + x, 0)).toBe(5);
  });

  it('le prompt copiable contient le schéma et les options', () => {
    const p = copyablePrompt(subject, { themeNames: ['Tassement'], level: 3, count: 7, types: ['numeric'], examStyle: true, instructions: 'unités SI', docNames: ['cours.pdf'] });
    expect(p).toContain('"questions"');
    expect(p).toContain('Écris 7 questions, niveau 3');
    expect(p).toContain('Tassement');
    expect(p).toContain('cours.pdf');
    expect(p).toContain('unités SI');
  });

  it('retrouve un document cité avec ou sans extension', () => {
    const docs = [{ name: 'POLY_2026_metal.pdf' }, { name: 'TD1.PDF' }];
    expect(matchDoc(docs, 'POLY_2026_metal.pdf')?.name).toBe('POLY_2026_metal.pdf');
    expect(matchDoc(docs, 'poly_2026_metal')?.name).toBe('POLY_2026_metal.pdf');
    expect(matchDoc(docs, 'TD1.pdf')?.name).toBe('TD1.PDF');
    expect(matchDoc(docs, 'autre.pdf')).toBeUndefined();
  });
});
