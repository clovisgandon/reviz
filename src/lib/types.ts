// Modèle de données (prompt §7). Les schémas zod de validation sont dans ./schemas.ts.

export type Level = 1 | 2 | 3;
export type QuestionType = 'single' | 'multi' | 'truefalse' | 'numeric' | 'order';
export type Origin = 'builtin' | 'ai' | 'import' | 'manual';
export type AttemptMode = 'theme' | 'srs' | 'flash' | 'exam' | 'table' | 'sudden';

export type Theme = { id: string; name: string; parentId?: string };

export type ExamConfig = {
  /** points pour une bonne réponse / une fausse / sans réponse (QCM) */
  scoring: { right: number; wrong: number; blank: number };
  durationMin: number;
  includeConcrete?: boolean;
};

export type Subject = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  examDate?: string;
  themes: Theme[];
  examConfig: ExamConfig;
  builtIn: boolean;
  createdAt?: number;
};

export type DataBlock =
  | { kind: 'table'; title: string; columns: string[]; rows: (string | number)[][]; note?: string }
  | { kind: 'formula'; title?: string; latex: string }
  | { kind: 'text'; title?: string; content: string };

export type NumericAnswer = { value: number; unit: string; tolerancePct?: number };

export type SourceRef = { docName: string; page?: number; note?: string };

export type Question = {
  id: string;
  subjectId: string;
  themeIds: string[];
  level: Level;
  type: QuestionType;
  prompt: string;
  figure?: { kind: 'svg' | 'image'; content: string; alt: string };
  data?: DataBlock[];
  choices?: { id: string; text: string }[];
  answer: string[] | NumericAnswer;
  explanation: string;
  wrongChoiceHints?: Record<string, string>;
  source?: SourceRef[];
  tags?: string[];
  origin: Origin;
  examStyle?: boolean;
};

export type AttemptItem = {
  questionId?: string;
  generatorId?: string;
  seed?: number;
  given: unknown;
  correct: boolean | null;
  points: number;
  timeMs: number;
};

export type Attempt = {
  id: string;
  subjectId: string;
  mode: AttemptMode;
  startedAt: number;
  endedAt?: number;
  config: unknown;
  items: AttemptItem[];
  score: number;
  maxScore: number;
  scoreOn20: number;
};

export type SrsState = { questionId: string; box: number; due: number; streak: number };

export type DocumentFile = {
  id: string;
  subjectId: string;
  name: string;
  mime: string;
  blob: Blob;
  pages?: { n: number; text: string }[];
  addedAt: number;
};

export type Flashcard = {
  id: string;
  subjectId: string;
  themeIds: string[];
  front: string;
  back: string;
  source?: SourceRef[];
  /** absent = carte intégrée */
  origin?: Origin;
};

export type ErrorReport = { id: string; questionId: string; message: string; createdAt: number };
export type Favorite = { questionId: string; addedAt: number };
