import type { RevizDB } from './db';
import { STAB1 } from '@/subjects/stab1/meta';
import type { Flashcard, Question } from '@/lib/types';

/** Version des contenus intégrés : à incrémenter quand les banques changent. */
export const BUILTIN_VERSION = 1;

/** Charge les banques JSON intégrées (vides tant que l'étape 4 n'est pas faite). */
function loadBuiltinQuestions(): Question[] {
  const mods = import.meta.glob<{ default: Question[] }>('../subjects/*/questions/*.json', { eager: true });
  return Object.values(mods).flatMap((m) => m.default);
}
function loadBuiltinFlashcards(): Flashcard[] {
  const mods = import.meta.glob<{ default: Flashcard[] }>('../subjects/*/flashcards.json', { eager: true });
  return Object.values(mods).flatMap((m) => m.default);
}

/**
 * Installe ou met à jour les contenus intégrés (merge par id) sans toucher à
 * l'historique, aux réglages ni aux questions créées par l'utilisateur.
 */
export async function seedBuiltins(db: RevizDB, questions = loadBuiltinQuestions(), flashcards = loadBuiltinFlashcards()) {
  const current = (await db.settings.get('builtinVersion'))?.value as number | undefined;
  const hasStab1 = await db.subjects.get(STAB1.id);
  if (current === BUILTIN_VERSION && hasStab1) return { updated: false };

  await db.transaction('rw', [db.subjects, db.questions, db.flashcards, db.settings], async () => {
    // On conserve la date d'examen éventuellement réglée par l'utilisateur.
    await db.subjects.put({ ...STAB1, examDate: hasStab1?.examDate ?? STAB1.examDate });
    if (questions.length) await db.questions.bulkPut(questions);
    // Retire les anciennes questions intégrées qui n'existent plus dans la nouvelle version.
    const ids = new Set(questions.map((q) => q.id));
    const stale = await db.questions.where('origin').equals('builtin').filter((q) => !ids.has(q.id)).primaryKeys();
    if (stale.length) await db.questions.bulkDelete(stale);
    if (flashcards.length) await db.flashcards.bulkPut(flashcards);
    await db.settings.put({ key: 'builtinVersion', value: BUILTIN_VERSION });
  });
  return { updated: true };
}
