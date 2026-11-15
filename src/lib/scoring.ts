import type { NumericAnswer, Question } from './types';
import { fmt } from './format';

/** Réponse donnée par l'utilisateur. `null` = « Je ne sais pas » / sans réponse. */
export type Given = string[] | number | null;

export type Scoring = { right: number; wrong: number; blank: number };

/** Barème « entraînement » : 1 point par bonne réponse, pas de pénalité. */
export const TRAINING_SCORING: Scoring = { right: 1, wrong: 0, blank: 0 };

export function isNumericAnswer(a: Question['answer']): a is NumericAnswer {
  return !Array.isArray(a);
}

/** Juste/faux d'une réponse ; `null` si sans réponse. */
export function checkAnswer(q: Question, given: Given, defaultTolPct = 2): boolean | null {
  if (given === null || (Array.isArray(given) && given.length === 0)) return null;
  const ans = q.answer;
  if (isNumericAnswer(ans)) {
    if (typeof given !== 'number') return false;
    const tol = (ans.tolerancePct ?? defaultTolPct) / 100;
    if (ans.value === 0) return Math.abs(given) <= Math.max(tol, 1e-9);
    return Math.abs(given - ans.value) <= tol * Math.abs(ans.value) + 1e-12;
  }
  if (!Array.isArray(given)) return false;
  if (q.type === 'order') {
    return given.length === ans.length && given.every((id, i) => id === ans[i]);
  }
  // single / truefalse / multi : ensemble exact (tout ou rien pour multi)
  const a = new Set(ans);
  const g = new Set(given);
  return a.size === g.size && [...a].every((id) => g.has(id));
}

export function pointsFor(correct: boolean | null, s: Scoring): number {
  return correct === null ? s.blank : correct ? s.right : s.wrong;
}

/** Note sur 20 : le total peut être négatif sur une question, mais la note est bornée à [0 ; 20]. */
export function on20(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.min(20, Math.max(0, (score / maxScore) * 20));
}

/** Texte lisible de la bonne réponse (pour la correction et l'historique). */
export function answerText(q: Question): string {
  const ans = q.answer;
  if (isNumericAnswer(ans)) return `${fmt(ans.value, 3)} ${ans.unit}`.trim();
  const label = (id: string) => q.choices?.find((c) => c.id === id)?.text ?? id;
  if (q.type === 'order') return ans.map((id, i) => `${i + 1}. ${label(id)}`).join('\n');
  return ans.map(label).join(' ; ');
}

export function givenText(q: Question, given: Given): string {
  if (given === null || (Array.isArray(given) && given.length === 0)) return 'Sans réponse';
  if (typeof given === 'number') {
    const unit = isNumericAnswer(q.answer) ? q.answer.unit : '';
    return `${fmt(given, 4)} ${unit}`.trim();
  }
  const label = (id: string) => q.choices?.find((c) => c.id === id)?.text ?? id;
  if (q.type === 'order') return given.map((id, i) => `${i + 1}. ${label(id)}`).join('\n');
  return given.map(label).join(' ; ');
}
