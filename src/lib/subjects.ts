import { db } from '@/db/db';
import type { Flashcard, Question, Subject, Theme } from './types';
import { slugify } from './importQuestions';

export const SUBJECT_COLORS = ['#3B6E9E', '#E07A1F', '#2E8B57', '#7B4FB8', '#C0392B', '#178F8F', '#8A6D3B', '#5A6B7B'];
export const SUBJECT_EMOJIS = ['📘', '📐', '🏗️', '🧪', '⚡', '🌍', '🧮', '💧', '🔩', '🪵', '🧱', '📊', '🗣️', '💻'];

export async function freeSubjectId(name: string): Promise<string> {
  const base = slugify(name) || 'matiere';
  let id = base;
  for (let i = 2; await db.subjects.get(id); i++) id = `${base}-${i}`;
  return id;
}

export function themesFromNames(names: string[], existing: Theme[] = []): Theme[] {
  const out = [...existing];
  for (const raw of names) {
    const name = raw.trim();
    if (!name || out.some((t) => t.name.toLowerCase() === name.toLowerCase())) continue;
    let id = slugify(name);
    while (out.some((t) => t.id === id)) id += '-2';
    out.push({ id, name });
  }
  return out;
}

/** Ajoute des questions (et cartes) à la banque, avec les nouveaux thèmes éventuels. */
export async function addToBank(subjectId: string, questions: Question[], flashcards: Flashcard[], newThemes: Theme[]) {
  await db.transaction('rw', [db.subjects, db.questions, db.flashcards], async () => {
    const s = await db.subjects.get(subjectId);
    if (!s) throw new Error('Matière introuvable');
    const themes = [...s.themes];
    for (const t of newThemes) if (!themes.some((x) => x.id === t.id)) themes.push(t);
    // Un thème utilisé mais absent de la matière (ex. créé pendant la relecture) est ajouté aussi.
    if (themes.length !== s.themes.length) await db.subjects.update(subjectId, { themes });
    if (questions.length) await db.questions.bulkPut(questions);
    if (flashcards.length) await db.flashcards.bulkPut(flashcards);
  });
}

/** Supprime une matière perso et tout ce qui s'y rattache. */
export async function deleteSubject(subject: Subject) {
  if (subject.builtIn) throw new Error('La matière intégrée ne peut pas être supprimée.');
  await db.transaction('rw', [db.subjects, db.questions, db.flashcards, db.documents, db.attempts, db.sessions, db.srs, db.favorites, db.reports], async () => {
    const qids = await db.questions.where('subjectId').equals(subject.id).primaryKeys();
    await db.srs.bulkDelete(qids);
    await db.favorites.bulkDelete(qids);
    await db.reports.where('questionId').anyOf(qids).delete();
    await db.questions.where('subjectId').equals(subject.id).delete();
    await db.flashcards.where('subjectId').equals(subject.id).delete();
    await db.documents.where('subjectId').equals(subject.id).delete();
    await db.attempts.where('subjectId').equals(subject.id).delete();
    await db.sessions.where('subjectId').equals(subject.id).delete();
    await db.subjects.delete(subject.id);
  });
}

/** Supprime une question perso (avec son état de révision). */
export async function deleteQuestion(id: string) {
  await db.transaction('rw', [db.questions, db.srs, db.favorites], async () => {
    await db.questions.delete(id);
    await db.srs.delete(id);
    await db.favorites.delete(id);
  });
}
