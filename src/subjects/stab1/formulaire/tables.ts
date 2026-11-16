/**
 * Tableaux de référence STAB 1, relevés dans les PDF (voir docs/NOTES_STAB1.md).
 * Réutilisés par la fiche formulaire, les blocs Données des questions et les générateurs.
 */
import type { DataBlock } from '@/lib/types';
import profils from '../../../../docs/data/profils_poly.json';

// ---------- Acier ----------
export type Profile = {
  name: string; G: number; h: number; b: number; tw: number; tf: number; r: number;
  A: number; Iy: number; Wely: number; Wply: number; iy: number; Avz: number;
  Iz: number; Welz: number; Wplz: number; iz: number; classe: number;
};
function rows(family: 'IPE' | 'HEA' | 'HEB' | 'UPN'): Profile[] {
  return (profils[family].rows as (string | number)[][]).map((r) => ({
    name: r[0] as string, G: +r[1], h: +r[2], b: +r[3], tw: +r[4], tf: +r[5], r: +r[6], A: +r[7],
    Iy: +r[8], Wely: +r[9], Wply: +r[10], iy: +r[11], Avz: +r[12], Iz: +r[13], Welz: +r[14], Wplz: +r[15], iz: +r[16], classe: +r[17],
  }));
}
export const IPE = rows('IPE');
export const HEA = rows('HEA');
export const HEB = rows('HEB');
export const UPN = rows('UPN');

/** Catalogue donné au partiel 2023 (IPE 80 à 180, S235, classe 1). */
export const IPE_PARTIEL = (profils.IPE_partiel2023.rows as (string | number)[][]).map((r) => ({
  name: r[0] as string, A: +r[1], Iy: +r[2], Wely: +r[3], Wply: +r[4], iy: +r[5], Iz: +r[6], Welz: +r[7], Wplz: +r[8], Avz: +r[9],
}));

export const CORNIERES = (profils.corniere.rows as (string | number)[][]).map((r) => ({ name: r[0] as string, A: +r[1] }));

export const STEEL: Record<string, { fy: number; fu: number }> = {
  S235: { fy: 235, fu: 360 },
  S275: { fy: 275, fu: 430 },
  S355: { fy: 355, fu: 490 },
  S450: { fy: 440, fu: 550 },
};
export const E_STEEL = 210000;
export const GAMMA_M0 = 1.0;
export const GAMMA_M2 = 1.25;

export function catalogueBlock(names: string[], cols: ('A' | 'Iy' | 'Wely' | 'Wply' | 'Avz' | 'Iz' | 'Wplz' | 'G')[], title = 'Extrait du catalogue (poly métal p.38-41)'): DataBlock {
  const label: Record<string, string> = {
    A: 'A (cm²)', Iy: 'I_y (cm⁴)', Wely: 'W_el,y (cm³)', Wply: 'W_pl,y (cm³)', Avz: 'A_vz (cm²)', Iz: 'I_z (cm⁴)', Wplz: 'W_pl,z (cm³)', G: 'G (kg/m)',
  };
  const all = [...IPE, ...HEA, ...HEB, ...UPN];
  return {
    kind: 'table',
    title,
    columns: ['Profilé', ...cols.map((c) => label[c])],
    rows: names.map((n) => {
      const p = all.find((x) => x.name === n)!;
      return [n, ...cols.map((c) => p[c])];
    }),
  };
}

export const FLECHES_LIMITES: DataBlock = {
  kind: 'table',
  title: 'Valeurs limites des flèches verticales (Annexe nationale, poly p.14)',
  columns: ['Condition', 'w_max', 'w_3'],
  rows: [
    ['Toitures en général (accès entretien seul)', 'L/200', 'L/250'],
    ['Toitures avec personnel autre qu’entretien', 'L/200', 'L/300'],
    ['Planchers en général', 'L/200', 'L/300'],
    ['Planchers/toitures avec cloisons fragiles ou rigides', 'L/250', 'L/350'],
    ['Planchers supportant des poteaux', 'L/400', 'L/500'],
    ['w_max nuisant à l’aspect', 'L/250', '—'],
  ],
};

// ---------- Bois ----------
export const KMOD: DataBlock = {
  kind: 'table',
  title: 'k_mod — BM / LC / LVL / CP (mémo p.7)',
  columns: ['Classe de service', 'Perm.', 'Long terme', 'Moyen terme', 'Court terme', 'Instant.'],
  rows: [
    ['1', 0.6, 0.7, 0.8, 0.9, 1.1],
    ['2', 0.6, 0.7, 0.8, 0.9, 1.1],
    ['3', 0.5, 0.55, 0.65, 0.7, 0.9],
  ],
};
export const KMOD_VALUES: Record<1 | 2 | 3, number[]> = { 1: [0.6, 0.7, 0.8, 0.9, 1.1], 2: [0.6, 0.7, 0.8, 0.9, 1.1], 3: [0.5, 0.55, 0.65, 0.7, 0.9] };
export const DUREES = ['permanente', 'long terme', 'moyen terme', 'court terme', 'instantanée'] as const;
export const KDEF: Record<1 | 2 | 3, number> = { 1: 0.6, 2: 0.8, 3: 2.0 };
export const GAMMA_M_BOIS: Record<string, number> = { BM: 1.3, LC: 1.25, LVL: 1.2 };

export type Wood = { name: string; kind: 'BM' | 'LC'; fm: number; ft0: number; fc0: number; fv: number; E0mean: number; E005: number; rhok: number; rhomean: number };
export const WOODS: Wood[] = [
  { name: 'C18', kind: 'BM', fm: 18, ft0: 10, fc0: 18, fv: 3.4, E0mean: 9000, E005: 6000, rhok: 320, rhomean: 380 },
  { name: 'C24', kind: 'BM', fm: 24, ft0: 14.5, fc0: 21, fv: 4.0, E0mean: 11000, E005: 7400, rhok: 350, rhomean: 420 },
  { name: 'C30', kind: 'BM', fm: 30, ft0: 19, fc0: 24, fv: 4.0, E0mean: 12000, E005: 8000, rhok: 380, rhomean: 460 },
  { name: 'D30', kind: 'BM', fm: 30, ft0: 18, fc0: 24, fv: 3.9, E0mean: 11000, E005: 9200, rhok: 530, rhomean: 640 },
  { name: 'GL20h', kind: 'LC', fm: 20, ft0: 16, fc0: 20, fv: 3.5, E0mean: 8400, E005: 7000, rhok: 340, rhomean: 370 },
  { name: 'GL22h', kind: 'LC', fm: 22, ft0: 17.6, fc0: 22, fv: 3.5, E0mean: 10500, E005: 8800, rhok: 370, rhomean: 410 },
  { name: 'GL24h', kind: 'LC', fm: 24, ft0: 19.2, fc0: 24, fv: 3.5, E0mean: 11500, E005: 9600, rhok: 385, rhomean: 420 },
  { name: 'GL26h', kind: 'LC', fm: 26, ft0: 20.8, fc0: 26, fv: 3.5, E0mean: 12100, E005: 10100, rhok: 405, rhomean: 445 },
  { name: 'GL28h', kind: 'LC', fm: 28, ft0: 22.4, fc0: 28, fv: 3.5, E0mean: 12600, E005: 10500, rhok: 425, rhomean: 460 },
  { name: 'GL30h', kind: 'LC', fm: 30, ft0: 24, fc0: 30, fv: 3.5, E0mean: 13600, E005: 11300, rhok: 430, rhomean: 480 },
  { name: 'GL32h', kind: 'LC', fm: 32, ft0: 25.6, fc0: 32, fv: 3.5, E0mean: 14200, E005: 11800, rhok: 440, rhomean: 490 },
];
export const wood = (n: string) => WOODS.find((w) => w.name === n)!;

export function woodBlock(names: string[]): DataBlock {
  return {
    kind: 'table',
    title: 'Propriétés des bois (mémo p.8), N/mm² et kg/m³',
    columns: ['Classe', 'f_m,k', 'f_t,0,k', 'f_c,0,k', 'f_v,k', 'E_0,mean', 'ρ_mean'],
    rows: names.map((n) => {
      const w = wood(n);
      return [n, w.fm, w.ft0, w.fc0, w.fv, w.E0mean, w.rhomean];
    }),
  };
}

/** k_h selon le mémo p.2 (h en mm = plus grande dimension). */
export function kh(kind: 'BM' | 'LC' | 'LVL', h: number): number {
  if (kind === 'BM') return h < 150 ? Math.min((150 / h) ** 0.2, 1.3) : 1;
  if (kind === 'LC') return h < 600 ? Math.min((600 / h) ** 0.1, 1.1) : 1;
  return h !== 300 ? Math.min((300 / h) ** 0.12, 1.2) : 1;
}

export const CALVI: DataBlock = {
  kind: 'table',
  title: 'Critères de flèche « selon Calvi » (mémo p.6)',
  columns: ['Cas', 'W_inst(Q)', 'W_net,fin', 'W_fin'],
  rows: [
    ['Bâtiment courant — éléments structuraux', 'l/300', 'l/200', 'l/125'],
    ['Bâtiment courant — chevrons', '—', 'l/150', 'l/125'],
    ['Bâtiment agricole — éléments structuraux', 'l/200', 'l/150', 'l/100'],
    ['Bâtiment agricole — chevrons', '—', 'l/150', 'l/100'],
  ],
};

// ---------- Actions ----------
export const PSI: DataBlock = {
  kind: 'table',
  title: 'Coefficients ψ pour les bâtiments (poly p.12, mémo p.7)',
  columns: ['Action', 'ψ0', 'ψ1', 'ψ2'],
  rows: [
    ['Exploitation cat. A (habitation)', 0.7, 0.5, 0.3],
    ['Exploitation cat. B (bureaux)', 0.7, 0.5, 0.3],
    ['Exploitation cat. C (réunion)', 0.7, 0.7, 0.6],
    ['Exploitation cat. E (stockage)', 1.0, 0.9, 0.8],
    ['Toits cat. H', 0, 0, 0],
    ['Neige, H ≤ 1000 m', 0.5, 0.2, 0],
    ['Neige, H > 1000 m', 0.7, 0.5, 0.2],
    ['Vent', 0.6, 0.2, 0],
  ],
};

export const SK: Record<string, { sk: number; sAd: number | null }> = {
  A1: { sk: 0.45, sAd: null }, A2: { sk: 0.45, sAd: 1.0 }, B1: { sk: 0.55, sAd: 1.0 }, B2: { sk: 0.55, sAd: 1.35 },
  C1: { sk: 0.65, sAd: null }, C2: { sk: 0.65, sAd: 1.35 }, D: { sk: 0.9, sAd: 1.8 }, E: { sk: 1.4, sAd: null },
};
export const NEIGE_TABLE: DataBlock = {
  kind: 'table',
  title: 'Charge de neige au sol, altitude ≤ 200 m (cours p.14-17)',
  columns: ['Région', 's_k (kN/m²)', 's_Ad (kN/m²)'],
  rows: Object.entries(SK).map(([r, v]) => [r, v.sk, v.sAd ?? '—']),
};
export const ALTITUDE_TABLE: DataBlock = {
  kind: 'table',
  title: 'Majoration d’altitude Δs (cours p.17), A en m',
  columns: ['Altitude', 'Δs1 (régions A1 à D)', 'Δs2 (région E)'],
  rows: [
    ['200 à 500 m', 'A/1000 − 0,20', '1,5A/1000 − 0,30'],
    ['500 à 1000 m', '1,5A/1000 − 0,45', '3,5A/1000 − 1,30'],
    ['1000 à 2000 m', '3,5A/1000 − 2,45', '7A/1000 − 4,80'],
  ],
};
export function deltaS(alt: number, region: string): number {
  const E = region === 'E';
  if (alt <= 200) return 0;
  if (alt <= 500) return E ? (1.5 * alt) / 1000 - 0.3 : alt / 1000 - 0.2;
  if (alt <= 1000) return E ? (3.5 * alt) / 1000 - 1.3 : (1.5 * alt) / 1000 - 0.45;
  return E ? (7 * alt) / 1000 - 4.8 : (3.5 * alt) / 1000 - 2.45;
}
export function mu1(alpha: number): number {
  if (alpha <= 30) return 0.8;
  if (alpha < 60) return (0.8 * (60 - alpha)) / 30;
  return 0;
}
export const MU_TABLE: DataBlock = {
  kind: 'formula',
  title: 'Coefficient de forme μ1 (cours p.22)',
  latex: String.raw`\mu_1 = \begin{cases} 0{,}8 & 0° \le \alpha \le 30° \\ 0{,}8\,\dfrac{60-\alpha}{30} & 30° < \alpha < 60° \\ 0 & \alpha \ge 60° \end{cases}`,
};

export const VB0: Record<number, number> = { 1: 22, 2: 24, 3: 26, 4: 28 };
export const RHO_AIR = 1.225;

export const CPE_MURS: DataBlock = {
  kind: 'table',
  title: 'c_pe des murs verticaux — c_pe,10 (c_pe,1) (cours p.63)',
  columns: ['h/d', 'A', 'B', 'C', 'D', 'E'],
  rows: [
    ['5', '−1,2 (−1,4)', '−0,8 (−1,1)', '−0,5', '+0,8 (+1,0)', '−0,7'],
    ['1', '−1,2 (−1,4)', '−0,8 (−1,1)', '−0,5', '+0,8 (+1,0)', '−0,5'],
    ['≤ 0,25', '−1,2 (−1,4)', '−0,8 (−1,1)', '−0,5', '+0,7 (+1,0)', '−0,3'],
  ],
  note: 'Interpolation linéaire sur h/d. e = min(b ; 2h) ; A sur e/5, B sur 4e/5 si e < d.',
};
export const CPE_TOIT_PLAT: DataBlock = {
  kind: 'table',
  title: 'Toiture plate à arêtes vives — c_pe,10 (cours p.68)',
  columns: ['Zone', 'F', 'G', 'H', 'I'],
  rows: [['c_pe,10', '−1,8', '−1,2', '−0,7', '±0,2']],
};
export const CPE_1VERSANT: DataBlock = {
  kind: 'table',
  title: 'Toiture 1 versant, θ = 0° — c_pe,10 / c_pe,1 (QCM neige et vent A)',
  columns: ['α', 'F', 'G', 'H'],
  rows: [
    ['5°', '−1,7 / −2,5 et 0,0', '−1,2 / −2,0 et 0,0', '−0,6 / −1,2 et 0,0'],
    ['15°', '−0,9 / −2,0 et +0,2', '−0,8 / −1,5 et +0,2', '−0,3 et +0,2'],
    ['30°', '−0,5 / −1,5 et +0,7', '−0,5 / −1,5 et +0,7', '−0,2 et +0,4'],
    ['45°', '0,0 et +0,7', '0,0 et +0,7', '0,0 et +0,6'],
    ['60°', '+0,7', '+0,7', '+0,7'],
    ['75°', '+0,8', '+0,8', '+0,8'],
  ],
};

// ---------- Béton armé ----------
export const BAR_DIAMS = [6, 8, 10, 12, 14, 16, 20, 25, 32, 40];
export const barArea = (phi: number, n = 1) => (n * Math.PI * phi * phi) / 4 / 100; // cm²
export const SECTIONS_ACIER: DataBlock = {
  kind: 'table',
  title: 'Sections d’acier (cm²) pour n barres (corrigé TD1 BA)',
  columns: ['φ (mm)', '1', '2', '3', '4', '5', '6', '7', '8'],
  rows: BAR_DIAMS.slice(0, 9).map((d) => [String(d), ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => +barArea(d, n).toFixed(2))]),
};
export const CMIN_DUR: DataBlock = {
  kind: 'table',
  title: 'c_min,dur (mm) — tableau 4.4N, référence S4 = 50 ans (corrigé TD2)',
  columns: ['Classe', 'X0', 'XC1', 'XC2/XC3', 'XC4', 'XD1/XS1', 'XD2/XS2', 'XD3/XS3'],
  rows: [
    ['S1', 10, 10, 10, 15, 20, 25, 30],
    ['S2', 10, 10, 15, 20, 25, 30, 35],
    ['S3', 10, 10, 20, 25, 30, 35, 40],
    ['S4', 10, 15, 25, 30, 35, 40, 45],
    ['S5', 15, 20, 30, 35, 40, 45, 50],
    ['S6', 20, 25, 35, 40, 45, 50, 55],
  ],
  note: '+2 classes pour 100 ans ; −1 classe si béton de résistance élevée (ex. ≥ C30/37 en XC1-XC3, ≥ C40/50 en XD/XS).',
};
export const CMIN_DUR_VALUES: Record<string, number[]> = {
  S1: [10, 10, 10, 15, 20, 25, 30], S2: [10, 10, 15, 20, 25, 30, 35], S3: [10, 10, 20, 25, 30, 35, 40],
  S4: [10, 15, 25, 30, 35, 40, 45], S5: [15, 20, 30, 35, 40, 45, 50], S6: [20, 25, 35, 40, 45, 50, 55],
};
export const EXPO_COLS = ['X0', 'XC1', 'XC2/XC3', 'XC4', 'XD1/XS1', 'XD2/XS2', 'XD3/XS3'];

export const concrete = (fck: number) => {
  const fcm = fck + 8;
  const fctm = 0.3 * fck ** (2 / 3);
  const fctk005 = 0.7 * fctm;
  return {
    fck, fcm, fcd: fck / 1.5, fctm, fctk005, fctk095: 1.3 * fctm, fctd: fctk005 / 1.5,
    Ecm: 22000 * (fcm / 10) ** 0.3,
  };
};
export const fyd = (fyk: number) => fyk / 1.15;
export const fbd = (fck: number, eta1 = 1, eta2 = 1) => 2.25 * eta1 * eta2 * concrete(fck).fctd;
export const lbrqd = (phi: number, fck: number, fyk: number, eta1 = 1) => (phi / 4) * (fyd(fyk) / fbd(fck, eta1));
