import type { RevizDB } from './db';
import { STAB1 } from '@/subjects/stab1/meta';
import type { Flashcard, Question } from '@/lib/types';

/** Empreinte des contenus intégrés : toute modification des banques déclenche la mise à jour. */
function fingerprint(x: unknown): string {
  const s = JSON.stringify(x);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return `${s.length}-${h.toString(36)}`;
}

/** Charge les banques JSON intégrées (fichiers séparés du bundle principal, précachés pour le hors ligne). */
async function loadBuiltinQuestions(): Promise<Question[]> {
  const mods = import.meta.glob<{ default: Question[] }>('../subjects/*/questions/*.json');
  return (await Promise.all(Object.values(mods).map((load) => load()))).flatMap((m) => m.default);
}
async function loadBuiltinFlashcards(): Promise<Flashcard[]> {
  const mods = import.meta.glob<{ default: Flashcard[] }>('../subjects/*/flashcards.json');
  return (await Promise.all(Object.values(mods).map((load) => load()))).flatMap((m) => m.default);
}

/**
 * Installe ou met à jour les contenus intégrés (merge par id) sans toucher à
 * l'historique, aux réglages ni aux questions créées par l'utilisateur.
 */
export async function seedBuiltins(db: RevizDB, q?: Question[], fc?: Flashcard[]) {
  const questions = q ?? (await loadBuiltinQuestions());
  const flashcards = fc ?? (await loadBuiltinFlashcards());
  const version = fingerprint([STAB1, questions, flashcards]);
  const current = (await db.settings.get('builtinVersion'))?.value;
  const hasStab1 = await db.subjects.get(STAB1.id);
  if (current === version && hasStab1) return { updated: false };

  await db.transaction('rw', [db.subjects, db.questions, db.flashcards, db.settings], async () => {
    // On conserve la date d'examen éventuellement réglée par l'utilisateur.
    await db.subjects.put({ ...STAB1, examDate: hasStab1?.examDate ?? STAB1.examDate });
    if (questions.length) await db.questions.bulkPut(questions);
    // Retire les anciennes questions intégrées qui n'existent plus dans la nouvelle version.
    const ids = new Set(questions.map((q) => q.id));
    const stale = await db.questions.where('origin').equals('builtin').filter((q) => !ids.has(q.id)).primaryKeys();
    if (stale.length) await db.questions.bulkDelete(stale);
    if (flashcards.length) await db.flashcards.bulkPut(flashcards);
    await db.settings.put({ key: 'builtinVersion', value: version });
  });
  return { updated: true };
}
