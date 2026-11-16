import { db as defaultDb, type RevizDB, type Session, type Setting } from '@/db/db';
import type { Attempt, DocumentFile, ErrorReport, Favorite, Flashcard, Question, SrsState, Subject } from './types';
import { FlashcardSchema, QuestionSchema } from './schemas';
import { blobToBase64 } from './documents';

/**
 * Sauvegarde complète des données de l'utilisateur dans un fichier .json.
 * Ce qui est livré avec l'appli (questions et cartes intégrées) n'est pas exporté : il revient tout seul.
 * La clé API n'est jamais exportée (un fichier de sauvegarde circule plus facilement qu'un téléphone).
 */

export const BACKUP_FORMAT = 'reviz-backup';
export const BACKUP_VERSION = 1;
const SKIP_SETTINGS = new Set(['apiKey', 'builtinVersion']);

type ExportedDoc = Omit<DocumentFile, 'blob'> & { data?: string; size: number };

export type Backup = {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: number;
  appVersion?: string;
  withDocuments: boolean;
  tables: {
    subjects: Subject[];
    questions: Question[];
    flashcards: Flashcard[];
    attempts: Attempt[];
    srs: SrsState[];
    settings: Setting[];
    reports: ErrorReport[];
    favorites: Favorite[];
    sessions: Session[];
    documents: ExportedDoc[];
  };
};

export async function exportData(opts: { withDocuments: boolean; appVersion?: string }, db: RevizDB = defaultDb): Promise<Backup> {
  const docs = await db.documents.toArray();
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    appVersion: opts.appVersion,
    withDocuments: opts.withDocuments,
    tables: {
      subjects: await db.subjects.toArray(),
      questions: await db.questions.filter((q) => q.origin !== 'builtin').toArray(),
      flashcards: await db.flashcards.filter((c) => !!c.origin && c.origin !== 'builtin').toArray(),
      attempts: await db.attempts.toArray(),
      srs: await db.srs.toArray(),
      settings: (await db.settings.toArray()).filter((s) => !SKIP_SETTINGS.has(s.key)),
      reports: await db.reports.toArray(),
      favorites: await db.favorites.toArray(),
      sessions: await db.sessions.toArray(),
      // Sans les fichiers, on garde la fiche (nom, texte extrait) pour savoir quoi ré-ajouter.
      documents: await Promise.all(
        docs.map(async ({ blob, ...d }) => ({ ...d, size: blob.size, ...(opts.withDocuments ? { data: await blobToBase64(blob) } : {}) })),
      ),
    },
  };
}

function base64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

export type ImportSummary = { subjects: number; questions: number; attempts: number; documents: number; skipped: number };

/** Lit et vérifie un fichier de sauvegarde (rien n'est écrit tant que tout n'est pas lisible). */
export function parseBackup(text: string): Backup {
  let j: Backup;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error('Ce fichier n’est pas un JSON lisible.');
  }
  if (j?.format !== BACKUP_FORMAT || typeof j.tables !== 'object') throw new Error('Ce fichier n’est pas une sauvegarde RéviZ.');
  if (j.version > BACKUP_VERSION) throw new Error('Sauvegarde faite avec une version plus récente de l’appli : mets l’appli à jour d’abord.');
  for (const k of ['subjects', 'questions', 'flashcards', 'attempts', 'srs', 'settings', 'reports', 'favorites', 'sessions', 'documents'] as const) {
    if (j.tables[k] !== undefined && !Array.isArray(j.tables[k])) throw new Error(`Sauvegarde abîmée (${k}).`);
    j.tables[k] ??= [] as never;
  }
  return j;
}

/**
 * Restaure une sauvegarde.
 * - « fusion » : ajoute / met à jour par identifiant, sans rien effacer ;
 * - « remplacement » : efface d'abord toutes les données perso (historique, matières perso, documents…), STAB 1 reste.
 */
export async function importData(b: Backup, mode: 'merge' | 'replace', db: RevizDB = defaultDb): Promise<ImportSummary> {
  const t = b.tables;
  let skipped = 0;
  const questions = t.questions.filter((q) => {
    const ok = QuestionSchema.safeParse(q).success && q.origin !== 'builtin';
    if (!ok) skipped++;
    return ok;
  });
  const flashcards = t.flashcards.filter((c) => {
    const ok = FlashcardSchema.safeParse(c).success;
    if (!ok) skipped++;
    return ok;
  });
  const docs: DocumentFile[] = t.documents
    .filter((d) => typeof d.data === 'string')
    .map(({ data, size: _size, ...d }) => ({ ...d, blob: base64ToBlob(data!, d.mime) }));
  const builtinIds = new Set((await db.subjects.toArray()).filter((s) => s.builtIn).map((s) => s.id));

  await db.transaction('rw', [db.subjects, db.questions, db.flashcards, db.attempts, db.srs, db.settings, db.reports, db.favorites, db.sessions, db.documents], async () => {
    if (mode === 'replace') {
      await Promise.all([db.attempts.clear(), db.srs.clear(), db.reports.clear(), db.favorites.clear(), db.sessions.clear(), db.documents.clear()]);
      await db.questions.filter((q) => q.origin !== 'builtin').delete();
      await db.flashcards.filter((c) => !!c.origin && c.origin !== 'builtin').delete();
      await db.subjects.filter((s) => !s.builtIn).delete();
    }
    for (const s of t.subjects) {
      // Matière intégrée : on ne reprend que la date d'examen choisie par l'utilisateur.
      if (builtinIds.has(s.id) || s.builtIn) {
        if (builtinIds.has(s.id)) await db.subjects.update(s.id, { examDate: s.examDate });
      } else await db.subjects.put(s);
    }
    await db.questions.bulkPut(questions);
    await db.flashcards.bulkPut(flashcards);
    await db.attempts.bulkPut(t.attempts);
    await db.srs.bulkPut(t.srs);
    await db.settings.bulkPut(t.settings.filter((s) => !SKIP_SETTINGS.has(s.key)));
    await db.reports.bulkPut(t.reports);
    await db.favorites.bulkPut(t.favorites);
    await db.sessions.bulkPut(t.sessions);
    await db.documents.bulkPut(docs);
  });
  return { subjects: t.subjects.filter((s) => !s.builtIn).length, questions: questions.length, attempts: t.attempts.length, documents: docs.length, skipped };
}

/** Propose le fichier : feuille de partage iOS (« Enregistrer dans Fichiers ») si possible, sinon téléchargement. */
export async function saveFile(name: string, text: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([text], name, { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: name });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
      // sinon : on retombe sur le téléchargement
    }
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}

/** Efface l'historique (toutes matières ou une seule). Les questions et documents restent. */
export async function resetHistory(subjectId: string | null, db: RevizDB = defaultDb) {
  await db.transaction('rw', [db.attempts, db.srs, db.sessions, db.questions], async () => {
    if (!subjectId) {
      await Promise.all([db.attempts.clear(), db.srs.clear(), db.sessions.clear()]);
      return;
    }
    const qids = await db.questions.where('subjectId').equals(subjectId).primaryKeys();
    await db.srs.bulkDelete(qids);
    await db.attempts.where('subjectId').equals(subjectId).delete();
    await db.sessions.where('subjectId').equals(subjectId).delete();
  });
}

/** Le rappel « Sauvegarde ta progression » : tous les 7 jours, dès qu'il y a quelque chose à perdre. */
export function backupDue(lastBackupAt: number, firstActivityAt: number | null, now = Date.now()): boolean {
  if (firstActivityAt === null) return false;
  const ref = Math.max(lastBackupAt, firstActivityAt);
  return now - ref > 7 * 86400000;
}
