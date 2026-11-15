import type { Attempt, Question } from './types';

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** Jours consécutifs avec au moins une tentative, jusqu'à aujourd'hui (ou hier). */
export function streak(attempts: Pick<Attempt, 'startedAt'>[], now = Date.now()): number {
  const days = new Set(attempts.map((a) => dayKey(a.startedAt)));
  const d = new Date(now);
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1); // la série n'est pas cassée avant minuit
  let n = 0;
  while (days.has(dayKey(d.getTime()))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** % de bonnes réponses sur les N derniers jours (questions répondues uniquement). */
export function successRate(attempts: Attempt[], days = 7, now = Date.now()): number | null {
  const from = now - days * 86400000;
  let ok = 0;
  let n = 0;
  for (const a of attempts) {
    if (a.startedAt < from) continue;
    for (const i of a.items) {
      if (i.correct === null) continue;
      n++;
      if (i.correct) ok++;
    }
  }
  return n ? ok / n : null;
}

/** Thème le plus faible (au moins `minAnswers` réponses sur la période). */
export function weakestTheme(
  attempts: Attempt[],
  questions: Map<string, Question>,
  { days = 30, minAnswers = 3, now = Date.now() } = {},
): { themeId: string; rate: number } | null {
  const from = now - days * 86400000;
  const acc = new Map<string, { ok: number; n: number }>();
  for (const a of attempts) {
    if (a.startedAt < from) continue;
    for (const i of a.items) {
      const q = i.questionId ? questions.get(i.questionId) : undefined;
      if (!q) continue;
      const t = q.themeIds[0];
      const s = acc.get(t) ?? { ok: 0, n: 0 };
      s.n++;
      if (i.correct) s.ok++;
      acc.set(t, s);
    }
  }
  let best: { themeId: string; rate: number } | null = null;
  for (const [themeId, s] of acc) {
    if (s.n < minAnswers) continue;
    const rate = s.ok / s.n;
    if (!best || rate < best.rate) best = { themeId, rate };
  }
  return best;
}
