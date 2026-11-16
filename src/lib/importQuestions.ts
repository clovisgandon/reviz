import { FlashcardSchema, QuestionSchema } from './schemas';
import type { Flashcard, Origin, Question, Subject, Theme } from './types';
import { uid } from './random';

/**
 * Import tolérant de questions (JSON collé, fichier, ou réponse de l'IA).
 * On accepte des formes « humaines » (thème par son nom, choix en simple liste de textes,
 * réponse en texte, vrai/faux sans choix…) puis on valide avec le schéma zod strict.
 */

export type ImportError = { index: number; label: string; messages: string[] };
export type ImportResult = { questions: Question[]; flashcards: Flashcard[]; errors: ImportError[]; newThemes: Theme[] };

/** Retire les ```json … ``` et le texte autour, puis parse. Lève une erreur lisible si ce n'est pas du JSON. */
export function extractJson(text: string): unknown {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.search(/[[{]/);
  if (start < 0) throw new Error('Aucun JSON trouvé (il doit commencer par [ ou {).');
  const end = Math.max(t.lastIndexOf(']'), t.lastIndexOf('}'));
  t = t.slice(start, end + 1);
  try {
    return JSON.parse(t);
  } catch (e) {
    throw new Error(`JSON invalide : ${(e as Error).message}`);
  }
}

export function slugify(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'theme'
  );
}

type Raw = Record<string, unknown>;
const LETTERS = 'abcdefghijklmnop';

/** Résout un thème (id ou nom) ; crée le thème s'il est inconnu. */
function themeResolver(subject: Subject) {
  const themes = [...subject.themes];
  const created: Theme[] = [];
  const resolve = (v: unknown): string | null => {
    if (typeof v !== 'string' || !v.trim()) return null;
    const s = v.trim();
    const hit = themes.find((t) => t.id === s) ?? themes.find((t) => t.name.toLowerCase() === s.toLowerCase());
    if (hit) return hit.id;
    let id = slugify(s);
    while (themes.some((t) => t.id === id)) id += '-2';
    const t = { id, name: s };
    themes.push(t);
    created.push(t);
    return id;
  };
  return { resolve, created };
}

function themeIdsOf(r: Raw, resolve: (v: unknown) => string | null): string[] {
  const raw = r.themeIds ?? r.themes ?? r.theme ?? r.themeId;
  const list = Array.isArray(raw) ? raw : raw !== undefined ? [raw] : [];
  const ids = [...new Set(list.map(resolve).filter((x): x is string => !!x))];
  return ids.length ? ids : [resolve('Général')!];
}

function normalizeQuestion(r: Raw, subject: Subject, origin: Origin, resolve: (v: unknown) => string | null, taken: Set<string>): unknown {
  const type = String(r.type ?? (r.choices ? 'single' : 'numeric')).toLowerCase();
  const q: Raw = { ...r };
  q.subjectId = subject.id;
  q.origin = origin;
  q.themeIds = themeIdsOf(r, resolve);
  delete q.theme;
  delete q.themes;
  delete q.themeId;
  q.type = type === 'vraifaux' || type === 'true_false' || type === 'boolean' ? 'truefalse' : type === 'multiple' ? 'multi' : type;
  q.level = [1, 2, 3].includes(Number(r.level)) ? Number(r.level) : 2;
  if (typeof q.prompt !== 'string' && typeof r.question === 'string') q.prompt = r.question;
  delete q.question;

  // Choix : liste de textes → { id, text }
  if (Array.isArray(r.choices)) {
    q.choices = r.choices.map((c, i) => (typeof c === 'string' || typeof c === 'number' ? { id: LETTERS[i], text: String(c) } : c));
  }
  if (q.type === 'truefalse' && !Array.isArray(q.choices)) q.choices = [{ id: 'v', text: 'Vrai' }, { id: 'f', text: 'Faux' }];

  // Réponse
  const choices = (q.choices as { id: string; text: string }[] | undefined) ?? [];
  const toId = (a: unknown): unknown => {
    if (typeof a === 'boolean' && q.type === 'truefalse') return choices[a ? 0 : 1]?.id;
    if (typeof a === 'number' && q.type !== 'numeric' && Number.isInteger(a) && choices[a]) return choices[a].id;
    if (typeof a === 'string') {
      if (choices.some((c) => c.id === a)) return a;
      const byText = choices.find((c) => c.text.trim().toLowerCase() === a.trim().toLowerCase());
      if (byText) return byText.id;
      if (q.type === 'truefalse') return /^(v|vrai|true|oui)$/i.test(a) ? choices[0]?.id : /^(f|faux|false|non)$/i.test(a) ? choices[1]?.id : a;
    }
    return a;
  };
  if (q.type === 'numeric') {
    if (typeof r.answer === 'number') q.answer = { value: r.answer, unit: typeof r.unit === 'string' ? r.unit : '' };
    else if (r.answer && typeof r.answer === 'object' && !Array.isArray(r.answer)) {
      const a = r.answer as Raw;
      q.answer = { ...a, value: Number(a.value), unit: typeof a.unit === 'string' ? a.unit : '' };
    }
    delete q.unit;
  } else if (r.answer !== undefined) {
    q.answer = (Array.isArray(r.answer) ? r.answer : [r.answer]).map(toId);
  }

  // Sources : texte → { docName }
  if (typeof r.source === 'string') q.source = [{ docName: r.source }];
  else if (r.source && !Array.isArray(r.source)) q.source = [r.source];
  if (Array.isArray(q.source)) q.source = (q.source as Raw[]).map((s) => (s && typeof s.page === 'string' ? { ...s, page: parseInt(s.page as string, 10) || undefined } : s));

  // Identifiant : on garde celui fourni s'il est libre, sinon on en génère un.
  let id = typeof r.id === 'string' && r.id.trim() ? r.id.trim() : '';
  if (!id || taken.has(id)) id = `${subject.id}-${origin}-${uid()}`;
  taken.add(id);
  q.id = id;
  return q;
}

function labelOf(r: unknown, i: number): string {
  const p = r && typeof r === 'object' ? ((r as Raw).prompt ?? (r as Raw).question ?? (r as Raw).front) : undefined;
  return typeof p === 'string' ? p.slice(0, 80) : `élément n°${i + 1}`;
}

/** Normalise puis valide. `existingIds` = ids déjà en base (pour ne jamais écraser une question). */
export function normalizeImport(raw: unknown, subject: Subject, origin: Origin, existingIds: Iterable<string> = []): ImportResult {
  const obj = raw as Raw;
  const rawQuestions: unknown[] = Array.isArray(raw) ? raw : Array.isArray(obj?.questions) ? (obj.questions as unknown[]) : [];
  const rawCards: unknown[] = !Array.isArray(raw) && Array.isArray(obj?.flashcards) ? (obj.flashcards as unknown[]) : [];
  if (!rawQuestions.length && !rawCards.length) throw new Error('Le JSON doit être une liste de questions, ou un objet { "questions": [...] }.');

  const { resolve, created } = themeResolver(subject);
  const taken = new Set(existingIds);
  const questions: Question[] = [];
  const flashcards: Flashcard[] = [];
  const errors: ImportError[] = [];

  rawQuestions.forEach((r, i) => {
    if (!r || typeof r !== 'object') return errors.push({ index: i, label: labelOf(r, i), messages: ['ce n’est pas un objet'] });
    const res = QuestionSchema.safeParse(normalizeQuestion(r as Raw, subject, origin, resolve, taken));
    if (res.success) questions.push(res.data as Question);
    else errors.push({ index: i, label: labelOf(r, i), messages: res.error.issues.map((x) => (x.path.length ? `${x.path.join('.')} : ${x.message}` : x.message)) });
  });

  rawCards.forEach((r, i) => {
    const c = { ...(r as Raw), subjectId: subject.id, themeIds: themeIdsOf((r ?? {}) as Raw, resolve), id: `${subject.id}-fc-${uid()}` };
    const res = FlashcardSchema.safeParse(c);
    if (res.success) flashcards.push(res.data as Flashcard);
    else errors.push({ index: rawQuestions.length + i, label: `carte : ${labelOf(r, i)}`, messages: res.error.issues.map((x) => `${x.path.join('.')} : ${x.message}`) });
  });

  // Seuls les thèmes réellement utilisés sont créés.
  const used = new Set([...questions, ...flashcards].flatMap((q) => q.themeIds));
  return { questions, flashcards, errors, newThemes: created.filter((t) => used.has(t.id)) };
}
