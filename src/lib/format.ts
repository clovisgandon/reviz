/** Formatage à la française (virgule décimale, espace fine pour les milliers). */
export function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const d = abs !== 0 && abs < 0.01 ? 4 : digits;
  return n.toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: 0 });
}

/** Lit un nombre saisi par l'utilisateur : accepte « 85,6 », « 85.6 », « 1 200 », « 1,2e3 ». */
export function parseNumber(s: string): number | null {
  const t = s.trim().replace(/\s| | /g, '').replace(',', '.');
  if (t === '' || t === '-' || t === '.') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h} h ${String(m).padStart(2, '0')}`;
  if (m) return `${m} min ${String(sec).padStart(2, '0')}`;
  return `${sec} s`;
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}
