import type { Values } from '@/features/table/types';
import { step, pick } from '@/lib/random';

export const r = String.raw;

/** Nombre à la française pour du texte (0,61). */
export function f(x: number, d = 2): string {
  if (!Number.isFinite(x)) return '—';
  const v = +x.toFixed(d);
  return v.toLocaleString('fr-FR', { maximumFractionDigits: d }).replace(/ /g, ' ');
}
/** Nombre à la française dans une formule KaTeX. */
export function t(x: number, d = 2): string {
  return f(x, d).replace(/,/g, '{,}').replace(/ /g, '\\,');
}
export const n = (v: Values, k: string) => Number(v[k]);
export const s = (v: Values, k: string) => String(v[k]);
export const deg = (a: number) => (a * Math.PI) / 180;
export { step, pick };
