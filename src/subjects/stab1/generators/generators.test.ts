import { describe, expect, it } from 'vitest';
import { solve, paramsFor, type AnyGenerator } from '@/features/table/types';
import { STAB1_GENERATORS, findGenerator } from './index';

/** Valeurs des corrigés officiels (docs/NOTES_STAB1.md §8.5 du prompt) — égalité à 1 % près. */
const REF: Record<string, Record<number, Record<string, number | string>>> = {
  'm1-panne-ipe': {
    // Partiel 2023 : M_Ed recalculé = 3,1 × 5,5²/8 = 11,72 (énoncé : 11,6) ; IPE 120 ; V_pl,Rd 85,6 ; w 9,93 / 6,62 mm
    0: { charge: 'els', MEd: 11.72, Wmin: 49.88, profil: 'IPE 120', Mpl: 14.27, Vpl: 85.6, interaction: 'non', wmax: 9.93, w3: 6.62, fleches: 'ok' },
    // Vraie inertie de l'IPE 120 : w = 37,5 mm > 27,5 → flèches non vérifiées
    1: { profil: 'IPE 120', wmax: 37.5, fleches: 'ko' },
  },
  'm2-tirant': { 0: { FEd: 6.66, NEd: 10.67, Amin: 0.454, profil: 'L20×3', Npl: 26.3, Anet: 0.85, Nu: 22.03, ccl: 'ok' } },
  'm3-flexion-deviee': { 0: { My: 7.88, Mz: 1.8, profil: 'IPE 120', Mply: 14.26, Mplz: 3.196, crit: 0.868 } },
  'm4-compression-traction': { 0: { A: 21.2, fy: 275, Npl: 583 } },
  'b1-solive': { 0: { cs: '1', duree: 'moyen terme', kmod: 0.8, gM: 1.25, kh: 1.09, fmd: 16.77, MEd: 11.88, sig: 11.4, VEd: 8.64, tau: 0.518, fvd: 2.24, Uq: 10.98, Wnet: 23.08 } },
  'b2-combinaison': { 0: { v2: 3.41, v3: 2.5, v4: 3.97, v5: 3.42, kmod2: 0.9, dim: 'c2', ratio: 3.79 } },
  'b3-tirant-bois': { 0: { kmod: 1.1, gM: 1.3, kl: 1.074, ftd: 13.18, Anet: 6370, sig: 1.675 } },
  'b4-flexion-deviee-bois': { 0: { fmd: 18.65, My: 27.84, Mz: 7.44, sy: 17.75, sz: 11.07, c1: 1.37, c2: 1.26, ccl: 'ko' } },
  'a1-neige': { 0: { sk0: 0.45, ds: 0.16, sk: 0.61, mu: 0.8, s: 0.488, exc: 'oui', sacc: 0.8 }, 1: { sk: 0.45, s: 0.36, sacc: 0.8 } },
  'a2-vent': { 0: { qb: 0.4225, qp: 0.570, e: 20, A: 4, cpeD: 0.7, pD: 0.57, pF: -1.14, pA: -0.80 } },
  'a3-combinaisons': { 0: { G: 1.165, S: 1.225, Wp: 0.621, c6: 3.86, c8: 3.33, dim: 'c6' } },
  'ba1-materiaux': { 0: { fcd: 16.6, fcm: 32.9, fctm: 2.56, fctk: 1.79, fctmfl: 2.56, Ecm: 31447, Eceff: 10482, fyd: 434.8 }, 1: { fcm: 43, fckt: 28.34 } },
  'ba2-enrobage': {
    0: { S: 'S3', cdur: 20, cnomL: 30, c: 30, d: 358 },
    1: { S: 'S3', cdur: 10, cnomL: 30, cnomT: 20, c: 25, d: 339 },
    2: { S: 'S5', cdur: 50, cnomL: 60, cnomT: 60, c: 60 },
  },
  'ba3-ancrage': {
    0: { fctd: 1.2, eta1: 1, fbd: 2.69, lb: 323 },
    1: { fctd: 1.35, fbd: 3.04, lb: 457, lbmin: 160 },
    2: { eta1: 0.7, fbd: 1.89, lb: 646 },
  },
  'ba4-flexion': { 0: { fcd: 16.67, mu: 0.281, muyd: 0.372, comp: 'non', beta: 0.831, As: 10.38, Asmin: 1.07, barres: '3HA16 + 3HA14' } },
  'ba5-poteau': {
    0: { alpha: 0.661, As: 0, Asmin: 0.966, ccl: 'min' },
    1: { alpha: 0.643, As: 8.56, ccl: 'ok' },
    2: { alpha: 0.589, As: 29.8, ccl: 'trop' },
  },
};

describe('générateurs du contrôle sur table', () => {
  it('au moins 15 générateurs, ids uniques, chacun avec un cas officiel', () => {
    expect(STAB1_GENERATORS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(STAB1_GENERATORS.map((g) => g.id)).size).toBe(STAB1_GENERATORS.length);
    for (const g of STAB1_GENERATORS) expect(g.official?.length, g.id).toBeGreaterThan(0);
  });

  for (const [id, cases] of Object.entries(REF)) {
    for (const [idx, ref] of Object.entries(cases)) {
      it(`${id} — ${findGenerator(id)?.official?.[+idx]?.label}`, () => {
        const g = findGenerator(id) as AnyGenerator;
        const res = solve(g, paramsFor(g, 0, +idx));
        const val = (k: string) => {
          const st = res.steps.find((x) => x.step.key === k);
          if (!st) throw new Error(`étape ${k} absente`);
          return st.expected;
        };
        for (const [k, want] of Object.entries(ref)) {
          const got = val(k);
          if (typeof want === 'string') expect(got, k).toBe(want);
          else if (want === 0) expect(got, k).toBe(0);
          else expect(Math.abs((Number(got) - want) / want), `${k} : ${got} vs ${want}`).toBeLessThanOrEqual(0.01);
        }
      });
    }
  }

  it('données aléatoires : 200 tirages par générateur sans valeur invalide, reproductibles avec la seed', () => {
    for (const g of STAB1_GENERATORS) {
      for (let seed = 1; seed <= 200; seed++) {
        const res = solve(g, paramsFor(g, seed));
        for (const st of res.steps) {
          if (st.step.kind === 'numeric') expect(Number.isFinite(Number(st.expected)), `${g.id} seed ${seed} ${st.step.key}`).toBe(true);
          else expect(st.choices?.some((c) => c.id === st.expected), `${g.id} seed ${seed} ${st.step.key} = ${st.expected}`).toBe(true);
          expect(st.explanation.length).toBeGreaterThan(10);
        }
      }
      expect(JSON.stringify(paramsFor(g, 42))).toBe(JSON.stringify(paramsFor(g, 42)));
    }
  });

  it('« continuer avec ma valeur » propage la valeur de l’élève', () => {
    const g = findGenerator('m1-panne-ipe')!;
    const p = paramsFor(g, 0, 0);
    const given = [null, 20]; // M_Ed faux (20 au lieu de 11,72)
    expect(Number(solve(g, p, given, true).steps[2].expected)).toBeCloseTo((20e6 / 235) / 1e3, 3);
    expect(Number(solve(g, p, given, false).steps[2].expected)).toBeCloseTo(49.88, 1);
  });
});
