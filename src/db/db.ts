import Dexie, { type Table } from 'dexie';
import type {
  Attempt,
  DocumentFile,
  ErrorReport,
  Favorite,
  Flashcard,
  Question,
  SrsState,
  Subject,
} from '@/lib/types';

/** Réglage clé/valeur (date du partiel, barème, clé API…). */
export type Setting = { key: string; value: unknown };

/** Série en cours, pour le bouton « Continuer » de l'accueil. */
export type Session = {
  id: string;
  subjectId: string;
  mode: Attempt['mode'];
  createdAt: number;
  updatedAt: number;
  state: unknown;
};

export class RevizDB extends Dexie {
  subjects!: Table<Subject, string>;
  questions!: Table<Question, string>;
  flashcards!: Table<Flashcard, string>;
  attempts!: Table<Attempt, string>;
  srs!: Table<SrsState, string>;
  documents!: Table<DocumentFile, string>;
  settings!: Table<Setting, string>;
  reports!: Table<ErrorReport, string>;
  favorites!: Table<Favorite, string>;
  sessions!: Table<Session, string>;

  constructor(name = 'reviz') {
    super(name);
    this.version(1).stores({
      subjects: 'id, name, builtIn',
      questions: 'id, subjectId, *themeIds, level, type, origin, examStyle',
      flashcards: 'id, subjectId, *themeIds',
      attempts: 'id, subjectId, mode, startedAt',
      srs: 'questionId, due, box',
      documents: 'id, subjectId, addedAt',
      settings: 'key',
      reports: 'id, questionId, createdAt',
      favorites: 'questionId, addedAt',
      sessions: 'id, subjectId, updatedAt',
    });
  }
}

export const db = new RevizDB();
