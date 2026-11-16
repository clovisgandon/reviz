import type { SrsState } from './types';

/**
 * Répétition espacée type Leitner, 5 boîtes.
 * - Réponse fausse (ou « je ne sais pas ») → boîte 1, à revoir tout de suite.
 * - Réponse juste → boîte suivante ; l'intervalle grandit : 1 j, 3 j, 7 j, 16 j.
 * Une question ratée revient donc souvent ; réussie 3 fois d'affilée, elle ne revient qu'après une semaine.
 */
export const BOX_INTERVAL_DAYS = [0, 0, 1, 3, 7, 16]; // index = boîte (1 à 5)
const DAY = 86400000;

export function nextState(prev: SrsState | undefined, questionId: string, correct: boolean | null, now = Date.now()): SrsState {
  if (!correct) return { questionId, box: 1, due: now, streak: 0 };
  const box = Math.min(5, (prev?.box ?? 1) + 1);
  return { questionId, box, due: now + BOX_INTERVAL_DAYS[box] * DAY, streak: (prev?.streak ?? 0) + 1 };
}

/** Questions dues, les plus « fragiles » d'abord (petite boîte, puis échéance la plus ancienne). */
export function dueFirst(states: SrsState[], now = Date.now()): SrsState[] {
  return states.filter((s) => s.due <= now).sort((a, b) => a.box - b.box || a.due - b.due);
}
