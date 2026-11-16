/**
 * Outils d'écriture de la banque STAB 1 (compilée en JSON par scripts/build-bank.ts).
 * Les ids sont stables : stab1-<thème>-<n°> dans l'ordre d'écriture (on ajoute toujours à la fin).
 */
import type { DataBlock, Level, Question, SourceRef } from '@/lib/types';

export const r = String.raw;

/** Nombre à la française pour du texte : 0,61 */
export function f(x: number, d = 2): string {
  const v = +x.toFixed(d);
  return v.toLocaleString('fr-FR', { maximumFractionDigits: d, useGrouping: true }).replace(/ /g, ' ');
}
/** Nombre à la française dans une formule KaTeX : 0{,}61 (et espace fine des milliers) */
export function t(x: number, d = 2): string {
  return f(x, d).replace(/,/g, '{,}').replace(/ /g, '\\,');
}
export const round = (x: number, d = 2) => +x.toFixed(d);

// ---------- Sources ----------
export const COURS = (page: number, note?: string): SourceRef => ({ docName: 'STAB1_Cours_2_2022_Masson.pdf', page, ...(note ? { note } : {}) });
export const POLY = (page: number, note?: string): SourceRef => ({ docName: 'POLY_2026_metal.pdf', page, ...(note ? { note } : {}) });
export const MEMO = (page: number, note?: string): SourceRef => ({
  docName: 'MEMO - STAB - BM - Justification des éléments simples aux EUROCODES 3 & 5 2022.pdf',
  page,
  ...(note ? { note } : {}),
});
export const QCMA = (page: number, note?: string): SourceRef => ({ docName: 'QCM_neige_et_vent_A_corrigé.pdf', page, ...(note ? { note } : {}) });
export const PARTIEL = (page: number, note?: string): SourceRef => ({ docName: 'Partiel_2023_STAB01.pdf', page, ...(note ? { note } : {}) });
export const TD = (page: number, note?: string): SourceRef => ({ docName: 'CORRIGE_TD_2024.pdf', page, ...(note ? { note } : {}) });
export const SUJBA = (page: number, note?: string): SourceRef => ({ docName: 'Sujets_de_TD_STAB1_BA_2026-2027.pdf', page, ...(note ? { note } : {}) });
export const BA = (n: 1 | 2 | 3 | 4 | 5, note?: string, file?: string): SourceRef => ({
  docName: file ?? `Correction_TD${n}_moodle.pdf`,
  page: 1,
  ...(note ? { note } : {}),
});
export const BA4 = (q3 = true, note?: string): SourceRef => ({
  docName: q3 ? 'Correction_TD4_moodle_Q3.pdf' : 'Correction_TD4_moodle_Q1_et_Q2.pdf',
  page: 1,
  ...(note ? { note } : {}),
});
export const EC = (note = 'valeur EC standard, non trouvée dans le cours'): SourceRef => ({ docName: 'Eurocodes (EN / Annexe nationale)', note });

// ---------- Construction ----------
type Opt = {
  id?: string;
  data?: DataBlock[];
  hints?: Record<string, string>;
  src: SourceRef[];
  tags?: string[];
  exam?: boolean;
  figure?: Question['figure'];
  themes?: string[];
};
const LETTERS = 'abcdefgh';

/**
 * Questions calculatoires à plusieurs étapes (ou à piège) classées « Expert ».
 * Liste tenue à part pour équilibrer la répartition 40 / 40 / 20 sans changer les ids.
 */
const LEVEL3 = new Set([
  'stab1-ec0-013', 'stab1-charges-002', 'stab1-neige-016', 'stab1-neige-023', 'stab1-neige-025',
  'stab1-vent-018', 'stab1-vent-019', 'stab1-vent-020', 'stab1-stabilite-008',
  'stab1-metal-elu-004', 'stab1-metal-elu-016', 'stab1-metal-els-006', 'stab1-metal-els-010',
  'stab1-bois-coef-013', 'stab1-bois-elu-001', 'stab1-bois-elu-006', 'stab1-bois-elu-019', 'stab1-bois-els-005', 'stab1-bois-els-006',
  'stab1-ba-ancrage-005', 'stab1-ba-ancrage-011', 'stab1-ba-enrobage-007', 'stab1-ba-enrobage-008',
  'stab1-ba-flexion-005', 'stab1-ba-flexion-006', 'stab1-ba-materiaux-008', 'stab1-ba-materiaux-017',
  'stab1-ba-poteaux-006', 'stab1-ba-poteaux-007',
]);

/** Ids déjà attribués (toutes banques) : un id automatique déjà pris reçoit le suffixe « b ». */
const USED = new Set<string>();

export class Bank {
  readonly items: Question[] = [];
  private n = 0;
  constructor(readonly theme: string) {}

  private push(q: Omit<Question, 'id' | 'subjectId' | 'origin' | 'themeIds'>, o: Opt) {
    this.n++;
    let id = o.id ?? `stab1-${this.theme}-${String(this.n).padStart(3, '0')}`;
    if (o.id && USED.has(id)) throw new Error(`id explicite en double : ${id}`);
    while (USED.has(id)) id += 'b';
    USED.add(id);
    if (LEVEL3.has(id)) q = { ...q, level: 3 };
    const out: Question = {
      id,
      subjectId: 'stab1',
      themeIds: o.themes ?? [this.theme],
      ...q,
      source: o.src,
      origin: 'builtin',
    };
    if (o.data) out.data = o.data;
    if (o.figure) out.figure = o.figure;
    if (o.tags?.length) out.tags = o.tags;
    if (o.exam) out.examStyle = true;
    if (o.hints) out.wrongChoiceHints = o.hints;
    this.items.push(out);
    return this;
  }

  /** Choix : préfixer la (les) bonne(s) réponse(s) par « * ». Ids a, b, c… Indices par lettre. */
  private choices(list: string[]) {
    const choices = list.map((c, i) => ({ id: LETTERS[i], text: c.replace(/^\*/, '') }));
    const answer = list.flatMap((c, i) => (c.startsWith('*') ? [LETTERS[i]] : []));
    return { choices, answer };
  }

  single(level: Level, prompt: string, list: string[], explanation: string, o: Opt) {
    const { choices, answer } = this.choices(list);
    if (answer.length !== 1) throw new Error(`${this.theme} #${this.n + 1} : single sans réponse unique`);
    return this.push({ level, type: 'single', prompt, choices, answer, explanation }, o);
  }
  multi(level: Level, prompt: string, list: string[], explanation: string, o: Opt) {
    const { choices, answer } = this.choices(list);
    return this.push({ level, type: 'multi', prompt, choices, answer, explanation }, o);
  }
  tf(level: Level, prompt: string, value: boolean, explanation: string, o: Opt) {
    return this.push(
      { level, type: 'truefalse', prompt, choices: [{ id: 'v', text: 'Vrai' }, { id: 'f', text: 'Faux' }], answer: [value ? 'v' : 'f'], explanation },
      o,
    );
  }
  num(level: Level, prompt: string, value: number, unit: string, explanation: string, o: Opt & { tol?: number }) {
    return this.push(
      { level, type: 'numeric', prompt, answer: { value, unit, ...(o.tol !== undefined ? { tolerancePct: o.tol } : {}) }, explanation },
      o,
    );
  }
  /** Étapes dans le bon ordre ; l'appli les mélange. */
  order(level: Level, prompt: string, steps: string[], explanation: string, o: Opt) {
    const choices = steps.map((s, i) => ({ id: LETTERS[i], text: s }));
    return this.push({ level, type: 'order', prompt, choices, answer: choices.map((c) => c.id), explanation }, o);
  }
}
