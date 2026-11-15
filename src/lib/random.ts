/** Générateur pseudo-aléatoire reproductible (mulberry32) : même seed → même sujet. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

export function shuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** Entier dans [min, max] (bornes incluses). */
export function int(min: number, max: number, rand: () => number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

/** Valeur dans [min, max] arrondie au pas donné (ex. 0,05). */
export function step(min: number, max: number, stepSize: number, rand: () => number): number {
  const n = Math.round((max - min) / stepSize);
  return +(min + int(0, n, rand) * stepSize).toFixed(6);
}

export function uid(prefix = ''): string {
  const r = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random()).slice(2);
  return prefix + r;
}
