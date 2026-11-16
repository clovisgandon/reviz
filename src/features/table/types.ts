import type { DataBlock, Level, SourceRef } from '@/lib/types';
import { rng } from '@/lib/random';

/** Valeurs connues au fil de l'exercice (résultats des étapes précédentes). */
export type Values = Record<string, number | string>;
export type Choice = { id: string; text: string };

export type Step<P> = {
  /** clé sous laquelle le résultat est stocké pour les étapes suivantes */
  key: string;
  label: string | ((p: P, v: Values) => string);
  kind: 'numeric' | 'choice';
  unit?: string;
  /** tolérance relative en % (défaut 2) */
  tol?: number;
  choices?: (p: P, v: Values) => Choice[];
  /** formule à utiliser (indice payant) */
  hint: string;
  answer: (p: P, v: Values) => number | string;
  /** calcul détaillé (KaTeX) avec les valeurs de la chaîne */
  explain: (p: P, v: Values) => string;
};

export type Generator<P> = {
  id: string;
  code: string;
  title: string;
  group: 'Actions' | 'Métal' | 'Bois' | 'Béton armé';
  themeIds: string[];
  level: Level;
  description: string;
  /** tirage de données réalistes */
  params: (rand: () => number) => P;
  /** cas des corrigés officiels (tests + « refaire le sujet ») */
  official?: { label: string; params: P }[];
  statement: (p: P) => string;
  data: (p: P) => DataBlock[];
  steps: Step<P>[];
  conclusion: (p: P, v: Values) => string;
  source: SourceRef[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGenerator = Generator<any>;

export function paramsFor<P>(g: Generator<P>, seed: number, officialIndex?: number): P {
  if (officialIndex !== undefined && g.official?.[officialIndex]) return g.official[officialIndex].params;
  return g.params(rng(seed));
}

export function labelOf<P>(s: Step<P>, p: P, v: Values): string {
  return typeof s.label === 'function' ? s.label(p, v) : s.label;
}

/** Compare une saisie à la valeur attendue (tolérance relative). */
export function isRight<P>(s: Step<P>, expected: number | string, given: number | string | null): boolean {
  if (given === null) return false;
  if (s.kind === 'choice' || typeof expected === 'string') return String(given) === String(expected);
  if (typeof given !== 'number') return false;
  const tol = (s.tol ?? 2) / 100;
  if (expected === 0) return Math.abs(given) < 1e-9 + tol;
  return Math.abs(given - expected) <= tol * Math.abs(expected) + 1e-12;
}

/**
 * Déroule la chaîne de calcul. Pour chaque étape, la valeur transmise à la suite est
 * la bonne valeur, ou la valeur de l'élève si `useMine` (option « continuer avec ma valeur »).
 */
export function solve<P>(g: Generator<P>, p: P, given: (number | string | null)[] = [], useMine = false) {
  const v: Values = {};
  const out = g.steps.map((s, i) => {
    const expected = s.answer(p, v);
    const explanation = s.explain(p, { ...v, [s.key]: expected });
    const label = labelOf(s, p, v);
    const choices = s.choices?.(p, v);
    const gv = given[i] ?? null;
    const right = isRight(s, expected, gv);
    v[s.key] = useMine && gv !== null && gv !== '' ? gv : expected;
    return { step: s, label, choices, expected, explanation, right, given: gv };
  });
  return { steps: out, values: v, conclusion: g.conclusion(p, v) };
}
