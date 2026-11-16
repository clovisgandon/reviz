import type { Generator } from '@/features/table/types';
import { SK, deltaS, mu1, NEIGE_TABLE, ALTITUDE_TABLE, MU_TABLE, VB0, CPE_MURS, CPE_TOIT_PLAT, PSI } from '../formulaire/tables';
import { r, t, f, n, s, deg, step, pick } from './util';

const COURS = (page: number) => ({ docName: 'STAB1_Cours_2_2022_Masson.pdf', page });
const TD = (page: number) => ({ docName: 'CORRIGE_TD_2024.pdf', page });
const POLY = (page: number) => ({ docName: 'POLY_2026_metal.pdf', page });

// =====================================================================
// A1 — Neige
// =====================================================================
type A1 = { ville: string; region: string; alt: number; alpha: number; Ce: number };
const VILLES: [string, string][] = [['La Rochelle', 'A2'], ['Paris', 'A1'], ['Clermont-Ferrand', 'A2'], ['Lyon', 'C2'], ['Strasbourg', 'C1'], ['Grenoble', 'D'], ['Nancy', 'C1'], ['Dijon', 'B1']];

export const A1_NEIGE: Generator<A1> = {
  id: 'a1-neige',
  code: 'A1',
  title: 'Charge de neige sur une toiture',
  group: 'Actions',
  themeIds: ['neige'],
  level: 2,
  description: 's_k selon la région et l’altitude, μ1 selon la pente, charge normale et charge accidentelle.',
  params: (rand) => {
    const [ville, region] = pick(VILLES, rand);
    return { ville, region, alt: step(0, 900, 10, rand), alpha: pick([0, 10, 15, 20, 30, 35, 40, 45], rand), Ce: rand() < 0.85 ? 1 : 1.25 };
  },
  official: [
    { label: 'TD garage (Clermont-Ferrand, 360 m, 15°)', params: { ville: 'Clermont-Ferrand', region: 'A2', alt: 360, alpha: 15, Ce: 1 } },
    { label: 'Cours : La Rochelle, toiture plate', params: { ville: 'La Rochelle', region: 'A2', alt: 25, alpha: 0, Ce: 1 } },
  ],
  statement: (p) => r`Bâtiment à **${p.ville}** (région de neige **${p.region}**), altitude ${p.alt} m, toiture à ${p.alpha === 0 ? 'plate' : `2 versants inclinés à ${p.alpha}°`}, site ${p.Ce === 1 ? 'normal ($C_e = 1$)' : 'protégé ($C_e = 1{,}25$)'}, $C_t = 1$. Détermine les charges de neige sur la toiture.`,
  data: () => [NEIGE_TABLE, ALTITUDE_TABLE, MU_TABLE, { kind: 'formula', latex: r`s = \mu_1\,C_e\,C_t\,s_k\qquad s_{acc} = \mu_1\,C_e\,C_t\,s_{Ad}` }],
  steps: [
    { key: 'sk0', kind: 'numeric', unit: 'kN/m²', label: 'Valeur de $s_k$ de la région (altitude ≤ 200 m)', hint: 'Lecture du tableau', tol: 0.5, answer: (p) => SK[p.region].sk,
      explain: (p) => r`Région ${p.region} → $s_{k,0} = ${t(SK[p.region].sk)}$ kN/m².` },
    { key: 'ds', kind: 'numeric', unit: 'kN/m²', label: 'Majoration d’altitude $\\Delta s$ (0 si ≤ 200 m)', hint: 'Formule de la tranche d’altitude', tol: 2, answer: (p) => deltaS(p.alt, p.region),
      explain: (p, v) => (p.alt <= 200 ? r`Altitude ≤ 200 m → $\Delta s = 0$.` : r`${p.alt <= 500 ? r`$\Delta s_1 = ${p.alt}/1000 - 0{,}20$` : r`$\Delta s_1 = 1{,}5\times${p.alt}/1000 - 0{,}45$`} $= ${t(n(v, 'ds'), 3)}$ kN/m².`) },
    { key: 'sk', kind: 'numeric', unit: 'kN/m²', label: '$s_k$ au sol', hint: 's_k,0 + Δs', answer: (_p, v) => n(v, 'sk0') + n(v, 'ds'),
      explain: (_p, v) => r`$s_k = ${t(n(v, 'sk0'))} + ${t(n(v, 'ds'), 3)} = ${t(n(v, 'sk'), 3)}$ kN/m²` },
    { key: 'mu', kind: 'numeric', unit: '', label: 'Coefficient de forme $\\mu_1$', hint: '0,8 jusqu’à 30°, puis 0,8(60 − α)/30', tol: 1, answer: (p) => mu1(p.alpha),
      explain: (p, v) => (p.alpha <= 30 ? r`$\alpha = ${p.alpha}° \le 30°$ → $\mu_1 = 0{,}8$` : r`$\mu_1 = 0{,}8\,(60 - ${p.alpha})/30 = ${t(n(v, 'mu'), 3)}$`) },
    { key: 's', kind: 'numeric', unit: 'kN/m²', label: 'Charge de neige sur la toiture $s$', hint: r`$\mu_1 C_e C_t s_k$`, answer: (p, v) => n(v, 'mu') * p.Ce * n(v, 'sk'),
      explain: (p, v) => r`$s = ${t(n(v, 'mu'), 3)}\times${t(p.Ce)}\times1\times${t(n(v, 'sk'), 3)} = ${t(n(v, 's'), 3)}$ kN/m²` },
    { key: 'exc', kind: 'choice', label: 'Faut-il étudier une neige exceptionnelle (accidentelle) ?', hint: 'Regarder la colonne s_Ad',
      choices: () => [{ id: 'oui', text: 'Oui' }, { id: 'non', text: 'Non' }], answer: (p) => (SK[p.region].sAd ? 'oui' : 'non'),
      explain: (p) => (SK[p.region].sAd ? `Région ${p.region} : s_Ad = ${f(SK[p.region].sAd!)} kN/m² → oui (combinaison accidentelle).` : `Région ${p.region} : pas de s_Ad → non.`) },
    { key: 'sacc', kind: 'numeric', unit: 'kN/m²', label: 'Charge accidentelle sur la toiture (0 si pas de neige exceptionnelle)', hint: r`$\mu_1 C_e C_t s_{Ad}$`,
      answer: (p, v) => (SK[p.region].sAd ? n(v, 'mu') * p.Ce * SK[p.region].sAd! : 0),
      explain: (p, v) => (SK[p.region].sAd ? r`$s_{acc} = ${t(n(v, 'mu'), 3)}\times${t(p.Ce)}\times${t(SK[p.region].sAd!)} = ${t(n(v, 'sacc'), 3)}$ kN/m² (sans majoration d'altitude, à combiner sans coefficients 1,35/1,5).` : 'Pas de neige exceptionnelle : 0.') },
  ],
  conclusion: (_p, v) => r`**À retenir** : charge normale $s = ${t(n(v, 's'), 2)}$ kN/m² (action variable) ; ${s(v, 'exc') === 'oui' ? r`charge accidentelle $${t(n(v, 'sacc'), 2)}$ kN/m² (combinaison accidentelle, non cumulée avec l'accumulation)` : 'pas de charge accidentelle de neige'}.`,
  source: [COURS(14), COURS(17), COURS(19), COURS(22), TD(3)],
};

// =====================================================================
// A2 — Vent sur un bâtiment à toiture plate
// =====================================================================
type A2 = { region: number; ce: number; b: number; d: number; h: number; rho: number };
const cpeD = (hd: number) => (hd <= 0.25 ? 0.7 : hd >= 1 ? 0.8 : 0.7 + (0.1 * (hd - 0.25)) / 0.75);

export const A2_VENT: Generator<A2> = {
  id: 'a2-vent',
  code: 'A2',
  title: 'Pressions de vent (toiture plate)',
  group: 'Actions',
  themeIds: ['vent'],
  level: 2,
  description: 'v_b, q_b, q_p, paramètre e, c_pe interpolé et pressions nettes avec c_pi = +0,2 / −0,3.',
  params: (rand) => {
    const h = step(4, 12, 0.5, rand);
    return { region: pick([1, 2, 3, 4], rand), ce: step(1.2, 2.2, 0.05, rand), b: step(10, 30, 1, rand), d: step(15, 60, 1, rand), h, rho: 1.225 };
  },
  official: [{ label: 'Cours : La Rochelle 20 × 50 × 10 m (ρ = 1,25 comme la diapo)', params: { region: 3, ce: 1.35, b: 20, d: 50, h: 10, rho: 1.25 } }],
  statement: (p) => r`Bâtiment rectangulaire à toiture plate et arêtes vives, région de vent ${p.region}, largeur au vent $b = ${p.b}$ m, profondeur $d = ${p.d}$ m, hauteur $h = ${t(p.h)}$ m (une seule bande, $z_e = h$). On lit sur l'abaque $c_e(z_e) = ${t(p.ce)}$. Prendre $\rho = ${t(p.rho, 3)}$ kg/m³, $c_{dir} = c_{season} = 1$ et $c_{pi} = +0{,}2$ ou $-0{,}3$ (le plus défavorable).`,
  data: () => [{ kind: 'table', title: 'v_b,0', columns: ['Région', '1', '2', '3', '4'], rows: [['m/s', 22, 24, 26, 28]] }, CPE_MURS, CPE_TOIT_PLAT],
  steps: [
    { key: 'vb', kind: 'numeric', unit: 'm/s', label: '$v_b$', hint: 'Carte des régions', tol: 0, answer: (p) => VB0[p.region], explain: (p) => `Région ${p.region} → v_b = v_b,0 = ${VB0[p.region]} m/s.` },
    { key: 'qb', kind: 'numeric', unit: 'kN/m²', label: '$q_b$', hint: r`$\tfrac12\rho v_b^2$ en kN/m²`, answer: (p, v) => (0.5 * p.rho * n(v, 'vb') ** 2) / 1000,
      explain: (p, v) => r`$q_b = 0{,}5\times${t(p.rho, 3)}\times${t(n(v, 'vb'), 0)}^2 = ${t(n(v, 'qb') * 1000, 0)}$ N/m² $= ${t(n(v, 'qb'), 3)}$ kN/m²` },
    { key: 'qp', kind: 'numeric', unit: 'kN/m²', label: '$q_p(z_e)$', hint: r`$c_e\,q_b$`, answer: (p, v) => p.ce * n(v, 'qb'),
      explain: (p, v) => r`$q_p = ${t(p.ce)}\times${t(n(v, 'qb'), 3)} = ${t(n(v, 'qp'), 3)}$ kN/m²` },
    { key: 'e', kind: 'numeric', unit: 'm', label: 'Paramètre $e$', hint: 'min(b ; 2h)', tol: 0.5, answer: (p) => Math.min(p.b, 2 * p.h),
      explain: (p, v) => r`$e = \min(${p.b}\ ;\ 2\times${t(p.h)}) = ${t(n(v, 'e'))}$ m` },
    { key: 'A', kind: 'numeric', unit: 'm', label: 'Largeur de la zone A sur les murs latéraux', hint: 'e/5 (si e < d)', tol: 1, answer: (p, v) => Math.min(n(v, 'e') / 5, p.d),
      explain: (_p, v) => r`$e/5 = ${t(n(v, 'e') / 5)}$ m` },
    { key: 'cpeD', kind: 'numeric', unit: '', label: '$c_{pe,10}$ de la face au vent (zone D)', hint: 'Interpolation sur h/d', tol: 1, answer: (p) => cpeD(p.h / p.d),
      explain: (p, v) => r`$h/d = ${t(p.h / p.d, 3)}$ → $c_{pe,D} = ${t(n(v, 'cpeD'), 3)}$ (0,7 si h/d ≤ 0,25 ; 0,8 si h/d ≥ 1 ; interpolation entre).` },
    { key: 'pD', kind: 'numeric', unit: 'kN/m²', label: 'Pression nette la plus défavorable sur la zone D', hint: 'q_p (c_pe − c_pi) avec c_pi = −0,3', answer: (_p, v) => n(v, 'qp') * (n(v, 'cpeD') + 0.3),
      explain: (_p, v) => r`$p = ${t(n(v, 'qp'), 3)}\times(${t(n(v, 'cpeD'), 2)} + 0{,}3) = ${t(n(v, 'pD'), 3)}$ kN/m² (surpression)` },
    { key: 'pF', kind: 'numeric', unit: 'kN/m²', label: 'Pression nette la plus défavorable en toiture, zone F ($c_{pe,10} = -1{,}8$)', hint: 'c_pi = +0,2 aggrave la dépression', answer: (_p, v) => n(v, 'qp') * (-1.8 - 0.2),
      explain: (_p, v) => r`$p = ${t(n(v, 'qp'), 3)}\times(-1{,}8 - 0{,}2) = ${t(n(v, 'pF'), 3)}$ kN/m² (dépression)` },
    { key: 'pA', kind: 'numeric', unit: 'kN/m²', label: 'Pression nette la plus défavorable sur la zone A ($c_{pe,10} = -1{,}2$)', hint: 'Même raisonnement que F', answer: (_p, v) => n(v, 'qp') * (-1.2 - 0.2),
      explain: (_p, v) => r`$p = ${t(n(v, 'qp'), 3)}\times(-1{,}2 - 0{,}2) = ${t(n(v, 'pA'), 3)}$ kN/m²` },
  ],
  conclusion: (_p, v) => r`**À retenir** : $q_p = ${t(n(v, 'qp'), 3)}$ kN/m² ; face au vent ${t(n(v, 'pD'), 2)} kN/m² ; zone A ${t(n(v, 'pA'), 2)} kN/m² ; toiture zone F ${t(n(v, 'pF'), 2)} kN/m². Toujours combiner $c_{pe}$ avec le $c_{pi}$ qui **aggrave**.`,
  source: [COURS(47), COURS(58), COURS(63), COURS(68), COURS(72), COURS(73)],
};

// =====================================================================
// A3 — Combinaisons d'actions sur une panne
// =====================================================================
type A3 = { G: number; S: number; Wp: number; Wd: number; e: number; alpha: number; pp: number };
export const A3_COMBI: Generator<A3> = {
  id: 'a3-combinaisons',
  code: 'A3',
  title: 'Combinaisons d’actions sur une panne',
  group: 'Actions',
  themeIds: ['ec0', 'charges'],
  level: 2,
  description: 'Charges linéiques (entraxe, cos α pour la neige), projection sur z, combinaisons ELU et soulèvement.',
  params: (rand) => ({ G: step(0.3, 0.8, 0.01, rand), S: step(0.36, 1.2, 0.01, rand), Wp: step(0.1, 0.4, 0.01, rand), Wd: -step(0.3, 0.9, 0.01, rand), e: step(1.5, 3, 0.05, rand), alpha: pick([5, 10, 15, 20, 25], rand), pp: step(0.05, 0.2, 0.01, rand) }),
  official: [{ label: 'TD garage (sans poids propre de la panne)', params: { G: 0.45, S: 0.49, Wp: 0.24, Wd: -0.45, e: 2.588, alpha: 15, pp: 0 } }],
  statement: (p) => r`Pannes espacées de $e = ${t(p.e, 3)}$ m sur un versant incliné à $\alpha = ${p.alpha}°$ (altitude < 1000 m). Charges : $G = ${t(p.G)}$ kN/m² (rampant) + poids propre de la panne ${t(p.pp)} kN/ml ; neige $S = ${t(p.S)}$ kN/m² (projection horizontale) ; vent ⊥ versant $W^+ = +${t(p.Wp)}$ et $W^- = ${t(p.Wd)}$ kN/m². Établis les combinaisons ELU selon l'axe z de la panne.`,
  data: () => [PSI, { kind: 'formula', latex: r`G_{lin} = G\,e + pp\quad S_{lin} = S\,e\cos\alpha\quad W_{lin} = W\,e\quad X_z = X_{lin}\cos\alpha\ (\text{charges verticales})` }],
  steps: [
    { key: 'G', kind: 'numeric', unit: 'kN/ml', label: 'Charge permanente linéique $G_{lin}$', hint: 'G·e + pp', answer: (p) => p.G * p.e + p.pp, explain: (p, v) => r`$${t(p.G)}\times${t(p.e, 3)} + ${t(p.pp)} = ${t(n(v, 'G'), 3)}$ kN/ml` },
    { key: 'S', kind: 'numeric', unit: 'kN/ml', label: 'Neige linéique (verticale) $S_{lin}$', hint: 'S·e·cos α', answer: (p) => p.S * p.e * Math.cos(deg(p.alpha)),
      explain: (p, v) => r`$${t(p.S)}\times${t(p.e, 3)}\times\cos${p.alpha}° = ${t(n(v, 'S'), 3)}$ kN/ml (neige par m² horizontal)` },
    { key: 'Wp', kind: 'numeric', unit: 'kN/ml', label: 'Vent en pression linéique $W^+_{lin}$', hint: 'W·e (déjà ⊥ au versant)', answer: (p) => p.Wp * p.e, explain: (p, v) => r`$${t(p.Wp)}\times${t(p.e, 3)} = ${t(n(v, 'Wp'), 3)}$ kN/ml` },
    { key: 'Wd', kind: 'numeric', unit: 'kN/ml', label: 'Vent en dépression linéique $W^-_{lin}$', hint: 'W·e', answer: (p) => p.Wd * p.e, explain: (p, v) => r`$${t(p.Wd)}\times${t(p.e, 3)} = ${t(n(v, 'Wd'), 3)}$ kN/ml` },
    { key: 'c6', kind: 'numeric', unit: 'kN/ml', label: r`Combinaison $1{,}35G + 1{,}5S + 1{,}5\times0{,}6\,W^+$ selon z`, hint: 'Projeter G et S (× cos α), pas le vent',
      answer: (p, v) => 1.35 * n(v, 'G') * Math.cos(deg(p.alpha)) + 1.5 * n(v, 'S') * Math.cos(deg(p.alpha)) + 0.9 * n(v, 'Wp'),
      explain: (p, v) => r`$1{,}35\times${t(n(v, 'G'), 3)}\cos${p.alpha}° + 1{,}5\times${t(n(v, 'S'), 3)}\cos${p.alpha}° + 0{,}9\times${t(n(v, 'Wp'), 3)} = ${t(n(v, 'c6'), 3)}$ kN/ml` },
    { key: 'c8', kind: 'numeric', unit: 'kN/ml', label: r`Combinaison $1{,}35G + 1{,}5W^+ + 1{,}5\times0{,}5\,S$ selon z`, hint: 'Vent dominant, neige d’accompagnement ψ0 = 0,5',
      answer: (p, v) => 1.35 * n(v, 'G') * Math.cos(deg(p.alpha)) + 1.5 * n(v, 'Wp') + 0.75 * n(v, 'S') * Math.cos(deg(p.alpha)),
      explain: (p, v) => r`$1{,}35\times${t(n(v, 'G'), 3)}\cos${p.alpha}° + 1{,}5\times${t(n(v, 'Wp'), 3)} + 0{,}75\times${t(n(v, 'S'), 3)}\cos${p.alpha}° = ${t(n(v, 'c8'), 3)}$ kN/ml` },
    { key: 'c5', kind: 'numeric', unit: 'kN/ml', label: r`Soulèvement : $1{,}00G + 1{,}5W^-$ selon z`, hint: 'G favorable → 1,00', answer: (p, v) => n(v, 'G') * Math.cos(deg(p.alpha)) + 1.5 * n(v, 'Wd'),
      explain: (p, v) => r`$1{,}00\times${t(n(v, 'G'), 3)}\cos${p.alpha}° + 1{,}5\times(${t(n(v, 'Wd'), 3)}) = ${t(n(v, 'c5'), 3)}$ kN/ml${n(v, 'c5') < 0 ? ' → soulèvement net' : ''}` },
    { key: 'dim', kind: 'choice', label: 'Combinaison descendante dimensionnante ?', hint: 'La plus grande des deux', choices: () => [{ id: 'c6', text: 'Neige dominante (1,35G + 1,5S + 0,9W⁺)' }, { id: 'c8', text: 'Vent dominant (1,35G + 1,5W⁺ + 0,75S)' }],
      answer: (_p, v) => (n(v, 'c6') >= n(v, 'c8') ? 'c6' : 'c8'), explain: (_p, v) => `${f(n(v, 'c6'), 3)} vs ${f(n(v, 'c8'), 3)} kN/ml.` },
  ],
  conclusion: (_p, v) => r`**À retenir** : charge de calcul descendante $p_{u,z} = ${t(Math.max(n(v, 'c6'), n(v, 'c8')), 2)}$ kN/ml (${s(v, 'dim') === 'c6' ? 'neige' : 'vent'} dominant) ; soulèvement $${t(n(v, 'c5'), 2)}$ kN/ml. (Le corrigé TD trouve 3,86 et 3,33 kN/ml ; il écrit −0,905 en soulèvement avec un W⁻ incohérent de −0,52 kN/m².)`,
  source: [TD(16), TD(17), TD(18), POLY(12)],
};

export const ACTIONS_GENERATORS = [A1_NEIGE, A2_VENT, A3_COMBI];
