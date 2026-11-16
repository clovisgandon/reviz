import type { Generator } from '@/features/table/types';
import type { DataBlock } from '@/lib/types';
import { IPE, HEA, HEB, IPE_PARTIEL, STEEL, E_STEEL, FLECHES_LIMITES } from '../formulaire/tables';
import { r, t, f, n, s, deg, step, pick } from './util';

const POLY = (page: number) => ({ docName: 'POLY_2026_metal.pdf', page });
const PARTIEL = (page: number) => ({ docName: 'Partiel_2023_STAB01.pdf', page });
const TD = (page: number) => ({ docName: 'CORRIGE_TD_2024.pdf', page });

type Prof = { name: string; A: number; Iy: number; Wely: number; Wply: number; Avz: number; Iz?: number; Wplz?: number };
const catalogue = (kind: 'partiel' | 'poly'): Prof[] =>
  kind === 'partiel' ? IPE_PARTIEL : IPE.filter((p) => p.h <= 300).map((p) => ({ ...p }));
const catBlock = (list: Prof[], title: string): DataBlock => ({
  kind: 'table',
  title,
  columns: ['Profilé', 'A (cm²)', 'I_y (cm⁴)', 'W_el,y (cm³)', 'W_pl,y (cm³)', 'A_vz (cm²)'],
  rows: list.map((p) => [p.name, p.A, p.Iy, p.Wely, p.Wply, p.Avz]),
});
const wMm = (p: number, Lm: number, Icm4: number) => (5 * p * (Lm * 1000) ** 4) / (384 * E_STEEL * Icm4 * 1e4);

// =====================================================================
// M1 — Panne IPE (calqué sur le partiel 2023)
// =====================================================================
type M1 = { L: number; g: number; q: number; pELS: number; pELU: number; usage: 'toiture' | 'plancher'; cat: 'partiel' | 'poly'; IyImpose?: number };
const limits = (u: M1['usage']) => (u === 'toiture' ? { max: 200, w3: 250 } : { max: 200, w3: 300 });

export const M1_PANNE: Generator<M1> = {
  id: 'm1-panne-ipe',
  code: 'M1',
  title: 'Panne IPE : flexion, tranchant, flèches',
  group: 'Métal',
  themeIds: ['metal-elu', 'metal-els'],
  level: 2,
  description: 'Le sujet type du partiel métal : choix du chargement, M_Ed, choix de l’IPE, M_pl,Rd, V_pl,Rd et flèches.',
  params: (rand) => {
    const g = step(0.4, 1.2, 0.05, rand);
    const q = step(0.6, 2.0, 0.1, rand);
    return {
      L: step(3.5, 6.5, 0.25, rand), g, q,
      pELS: +(g + q).toFixed(2), pELU: +(1.35 * g + 1.5 * q).toFixed(2),
      usage: rand() < 0.75 ? 'toiture' : 'plancher', cat: 'poly',
    };
  },
  official: [
    { label: 'Partiel 2023 (I_y = 1200 cm⁴ imposé)', params: { L: 5.5, g: 0.7, q: 1.4, pELS: 2.1, pELU: 3.1, usage: 'toiture', cat: 'partiel', IyImpose: 1200 } },
    { label: 'Partiel 2023 avec les vraies inerties du catalogue', params: { L: 5.5, g: 0.7, q: 1.4, pELS: 2.1, pELU: 3.1, usage: 'toiture', cat: 'partiel' } },
  ],
  statement: (p) => r`Panne de ${p.usage === 'toiture' ? 'toiture (accès pour entretien seulement)' : 'plancher courant'} sur deux appuis simples, portée $L = ${t(p.L)}$ m, profilé IPE en acier S235 (classe 1).
Charges : $G = ${t(p.g)}$ kN/ml, $Q = ${t(p.q)}$ kN/ml, soit $G + Q = ${t(p.pELS)}$ kN/ml (ELS) et $1{,}35G + 1{,}5Q = ${t(p.pELU)}$ kN/ml (ELU).${p.IyImpose ? r` Pour la flèche, l'énoncé impose $I_y = ${t(p.IyImpose, 0)}$ cm⁴.` : ''}
Dimensionne la panne et vérifie-la (moment, tranchant, flèches).`,
  data: (p) => [
    catBlock(catalogue(p.cat), p.cat === 'partiel' ? 'Catalogue IPE donné au partiel 2023' : 'Catalogue IPE (poly p.38-41)'),
    { kind: 'formula', latex: r`M_{pl,Rd} = \frac{W_{pl,y}f_y}{\gamma_{M0}}\quad V_{pl,Rd} = A_{vz}\frac{f_y/\sqrt3}{\gamma_{M0}}\quad w = \frac{5pL^4}{384EI}\quad E = 210\,000\ \text{MPa}` },
    FLECHES_LIMITES,
  ],
  steps: [
    {
      key: 'charge', kind: 'choice', label: 'Quel chargement utilise-t-on pour le calcul de la flèche ?',
      choices: (p) => [{ id: 'els', text: `ELS : G + Q = ${f(p.pELS)} kN/ml` }, { id: 'elu', text: `ELU : 1,35G + 1,5Q = ${f(p.pELU)} kN/ml` }],
      hint: 'Les flèches sont un critère de service.',
      answer: () => 'els',
      explain: () => r`La flèche est un **état limite de service** : on prend la combinaison caractéristique $G + Q$, sans coefficients 1,35 et 1,5 (réservés aux vérifications de résistance).`,
    },
    {
      key: 'MEd', kind: 'numeric', unit: 'kN·m', label: 'Moment fléchissant maximal $M_{Ed}$', hint: r`$M_{Ed} = p_{ELU}L^2/8$`,
      answer: (p) => (p.pELU * p.L ** 2) / 8,
      explain: (p, v) => r`$$M_{Ed} = \frac{p_{ELU}L^2}{8} = \frac{${t(p.pELU)}\times${t(p.L)}^2}{8} = ${t(n(v, 'MEd'))}\ \text{kN·m}$$`,
    },
    {
      key: 'Wmin', kind: 'numeric', unit: 'cm³', label: 'Module plastique minimal $W_{pl,y}$', hint: r`$W_{pl,y} \ge M_{Ed}\gamma_{M0}/f_y$ (attention aux unités)`,
      answer: (_p, v) => (n(v, 'MEd') * 1e6) / 235 / 1e3,
      explain: (_p, v) => r`$$W_{pl,y} \ge \frac{M_{Ed}\,\gamma_{M0}}{f_y} = \frac{${t(n(v, 'MEd'))}\times10^6}{235} = ${t(n(v, 'Wmin') * 1e3, 0)}\ \text{mm}^3 = ${t(n(v, 'Wmin'), 1)}\ \text{cm}^3$$`,
    },
    {
      key: 'profil', kind: 'choice', label: 'Quel est le plus petit IPE qui convient ?',
      choices: (p) => catalogue(p.cat).map((c) => ({ id: c.name, text: `${c.name} (W_pl,y = ${f(c.Wply)} cm³)` })),
      hint: 'Le premier profilé du catalogue dont W_pl,y dépasse le minimum.',
      answer: (p, v) => (catalogue(p.cat).find((c) => c.Wply >= n(v, 'Wmin')) ?? catalogue(p.cat).at(-1)!).name,
      explain: (p, v) => {
        const c = catalogue(p.cat).find((x) => x.name === s(v, 'profil'))!;
        return r`On parcourt le catalogue : le **${c.name}** a $W_{pl,y} = ${t(c.Wply)}$ cm³ ≥ ${t(n(v, 'Wmin'), 1)} cm³ et le profilé précédent ne suffit pas. Les IPE en S235 sont de classe 1 → on utilise $W_{pl}$.`;
      },
    },
    {
      key: 'Mpl', kind: 'numeric', unit: 'kN·m', label: r`Moment résistant $M_{pl,Rd}$ du profilé choisi`, hint: r`$M_{pl,Rd} = W_{pl,y}f_y/\gamma_{M0}$`,
      answer: (p, v) => (catalogue(p.cat).find((c) => c.name === s(v, 'profil'))!.Wply * 235) / 1000,
      explain: (p, v) => {
        const c = catalogue(p.cat).find((x) => x.name === s(v, 'profil'))!;
        return r`$$M_{pl,Rd} = \frac{${t(c.Wply)}\times10^3\times235}{1{,}00} = ${t(n(v, 'Mpl'))}\ \text{kN·m}$$`;
      },
    },
    {
      key: 'etaM', kind: 'numeric', unit: '%', label: r`Taux de travail en flexion $M_{Ed}/M_{pl,Rd}$`, hint: r`$\eta = M_{Ed}/M_{pl,Rd}\times100$`,
      answer: (_p, v) => (n(v, 'MEd') / n(v, 'Mpl')) * 100,
      explain: (_p, v) => r`$$\eta = \frac{${t(n(v, 'MEd'))}}{${t(n(v, 'Mpl'))}} = ${t(n(v, 'etaM'), 0)}\ \%$$ ${n(v, 'etaM') <= 100 ? '≤ 100 % → vérifié en flexion.' : '> 100 % → **non vérifié**.'}`,
    },
    {
      key: 'VEd', kind: 'numeric', unit: 'kN', label: 'Effort tranchant maximal $V_{Ed}$', hint: r`$V_{Ed} = p_{ELU}L/2$`,
      answer: (p) => (p.pELU * p.L) / 2,
      explain: (p, v) => r`$$V_{Ed} = \frac{${t(p.pELU)}\times${t(p.L)}}{2} = ${t(n(v, 'VEd'))}\ \text{kN}$$`,
    },
    {
      key: 'Vpl', kind: 'numeric', unit: 'kN', label: r`Résistance au cisaillement $V_{pl,Rd}$`, hint: r`$V_{pl,Rd} = A_{vz}(f_y/\sqrt3)/\gamma_{M0}$, $A_{vz}$ en mm²`,
      answer: (p, v) => (catalogue(p.cat).find((c) => c.name === s(v, 'profil'))!.Avz * 100 * 235) / Math.sqrt(3) / 1000,
      explain: (p, v) => {
        const c = catalogue(p.cat).find((x) => x.name === s(v, 'profil'))!;
        return r`$$V_{pl,Rd} = ${t(c.Avz * 100, 0)}\ \text{mm}^2\times\frac{235}{\sqrt3} = ${t(n(v, 'Vpl'), 1)}\ \text{kN}$$ Taux : $${t(n(v, 'VEd'))}/${t(n(v, 'Vpl'), 1)} = ${t((n(v, 'VEd') / n(v, 'Vpl')) * 100, 0)}\ \%$.`;
      },
    },
    {
      key: 'interaction', kind: 'choice', label: 'Faut-il réduire le moment résistant à cause de l’effort tranchant ?',
      choices: () => [{ id: 'non', text: 'Non : V_Ed ≤ 0,5 V_pl,Rd' }, { id: 'oui', text: 'Oui : V_Ed > 0,5 V_pl,Rd' }],
      hint: 'Comparer V_Ed à la moitié de V_pl,Rd.',
      answer: (_p, v) => (n(v, 'VEd') <= 0.5 * n(v, 'Vpl') ? 'non' : 'oui'),
      explain: (_p, v) => r`$0{,}5\,V_{pl,Rd} = ${t(0.5 * n(v, 'Vpl'), 1)}$ kN ; $V_{Ed} = ${t(n(v, 'VEd'))}$ kN → ${n(v, 'VEd') <= 0.5 * n(v, 'Vpl') ? 'pas d’interaction M-V (cas courant).' : 'il faut réduire M_pl,Rd.'}`,
    },
    {
      key: 'wmax', kind: 'numeric', unit: 'mm', label: (p) => r`Flèche $w_{max}$ sous $G + Q$${p.IyImpose ? ` (avec $I_y = ${t(p.IyImpose, 0)}$ cm⁴ imposé)` : ''}`,
      hint: r`$w = 5pL^4/(384EI)$ avec p en N/mm, L en mm, I en mm⁴`,
      answer: (p, v) => wMm(p.pELS, p.L, p.IyImpose ?? catalogue(p.cat).find((c) => c.name === s(v, 'profil'))!.Iy),
      explain: (p, v) => {
        const I = p.IyImpose ?? catalogue(p.cat).find((c) => c.name === s(v, 'profil'))!.Iy;
        return r`$$w_{max} = \frac{5\times${t(p.pELS)}\times${t(p.L * 1000, 0)}^4}{384\times210\,000\times${t(I, 1)}\times10^4} = ${t(n(v, 'wmax'), 1)}\ \text{mm}$$ Limite : $L/${limits(p.usage).max} = ${t((p.L * 1000) / limits(p.usage).max, 1)}$ mm.`;
      },
    },
    {
      key: 'w3', kind: 'numeric', unit: 'mm', label: r`Flèche $w_3$ sous $Q$ seul`, hint: 'Même formule avec la charge variable seulement',
      answer: (p, v) => wMm(p.q, p.L, p.IyImpose ?? catalogue(p.cat).find((c) => c.name === s(v, 'profil'))!.Iy),
      explain: (p, v) => r`$$w_3 = w_{max}\times\frac{Q}{G+Q} = ${t(n(v, 'w3'), 1)}\ \text{mm}$$ Limite : $L/${limits(p.usage).w3} = ${t((p.L * 1000) / limits(p.usage).w3, 1)}$ mm.`,
    },
    {
      key: 'fleches', kind: 'choice', label: 'Les flèches sont-elles vérifiées ?',
      choices: () => [{ id: 'ok', text: 'Oui, les deux limites sont respectées' }, { id: 'ko', text: 'Non, au moins une limite est dépassée' }],
      hint: 'Comparer w_max et w_3 aux limites du tableau.',
      answer: (p, v) => (n(v, 'wmax') <= (p.L * 1000) / limits(p.usage).max && n(v, 'w3') <= (p.L * 1000) / limits(p.usage).w3 ? 'ok' : 'ko'),
      explain: (p, v) => r`$w_{max} = ${t(n(v, 'wmax'), 1)}$ mm vs $${t((p.L * 1000) / limits(p.usage).max, 1)}$ mm ; $w_3 = ${t(n(v, 'w3'), 1)}$ mm vs $${t((p.L * 1000) / limits(p.usage).w3, 1)}$ mm.${p.IyImpose ? r` ⚠️ Avec l'inertie réelle du profilé choisi, le résultat serait différent : l'énoncé impose 1200 cm⁴, incohérent avec le catalogue (voir le 2e cas officiel).` : ''}`,
    },
  ],
  conclusion: (p, v) =>
    r`**Conclusion type** : avec un **${s(v, 'profil')}**, $M_{Ed} = ${t(n(v, 'MEd'))} \le M_{pl,Rd} = ${t(n(v, 'Mpl'))}$ kN·m (taux ${t(n(v, 'etaM'), 0)} %) et $V_{Ed} = ${t(n(v, 'VEd'))} \le V_{pl,Rd} = ${t(n(v, 'Vpl'), 1)}$ kN : la panne est vérifiée à l'ELU. Flèches : ${s(v, 'fleches') === 'ok' ? 'vérifiées' : `**non vérifiées** → il faut un profilé plus inertiel${p.cat === 'partiel' && !p.IyImpose ? ' (IPE 140 au partiel 2023)' : ''}`}.`,
  source: [PARTIEL(1), PARTIEL(2), POLY(19), POLY(23), POLY(14)],
};

// =====================================================================
// M2 — Tirant de contreventement
// =====================================================================
type M2 = { Fk: number; angle: number; steel: string; d0: number };
const CORN: { name: string; A: number; t: number }[] = [
  { name: 'L20×3', A: 1.12, t: 3 }, { name: 'L25×3', A: 1.42, t: 3 }, { name: 'L30×3', A: 1.74, t: 3 },
  { name: 'L35×3,5', A: 2.35, t: 3.5 }, { name: 'L40×4', A: 3.08, t: 4 }, { name: 'L50×5', A: 4.8, t: 5 }, { name: 'L60×6', A: 6.91, t: 6 },
];
const corn = (name: string) => CORN.find((c) => c.name === name)!;

export const M2_TIRANT: Generator<M2> = {
  id: 'm2-tirant',
  code: 'M2',
  title: 'Tirant de palée (cornière boulonnée)',
  group: 'Métal',
  themeIds: ['metal-elu', 'stabilite'],
  level: 2,
  description: 'Effort ELU dans la diagonale, aire minimale, choix de la cornière, section brute et section nette.',
  params: (rand) => ({ Fk: step(3, 15, 0.1, rand), angle: step(30, 55, 0.5, rand), steel: pick(['S235', 'S235', 'S275'], rand), d0: pick([9, 11, 13], rand) }),
  official: [{ label: 'TD garage (L20×3, boulon M8)', params: { Fk: 4.44, angle: 38.56, steel: 'S235', d0: 9 } }],
  statement: (p) => r`Une palée de stabilité reprend un effort horizontal de vent caractéristique $F_k = ${t(p.Fk)}$ kN. La diagonale (cornière à ailes égales, acier ${p.steel}) fait un angle $\alpha = ${t(p.angle, 2)}°$ avec l'horizontale du point de vue de la formule $N = F/\sin\alpha$ du TD. Elle est attachée par **un** boulon (trou $d_0 = ${p.d0}$ mm). Dimensionne la diagonale.`,
  data: (p) => [
    { kind: 'table', title: 'Cornières à ailes égales', columns: ['Profil', 'A (cm²)', 't (mm)'], rows: CORN.map((c) => [c.name, c.A, c.t]), note: 'L20×3 : valeur du corrigé TD ; L25 et L30 : valeurs catalogue standard (absentes du poly).' },
    { kind: 'formula', latex: r`N_{pl,Rd} = \frac{Af_y}{\gamma_{M0}}\quad N_{u,Rd} = 0{,}9\,\frac{A_{net}f_u}{\gamma_{M2}}\quad A_{net} = A - d_0\,t\quad \gamma_{M2} = 1{,}25` },
    { kind: 'text', title: 'Acier', content: `${p.steel} : f_y = ${STEEL[p.steel].fy} MPa ; f_u = ${STEEL[p.steel].fu} MPa.` },
  ],
  steps: [
    { key: 'FEd', kind: 'numeric', unit: 'kN', label: 'Effort horizontal de calcul (ELU, vent seul)', hint: '1,5 × F_k', answer: (p) => 1.5 * p.Fk,
      explain: (p, v) => r`Le vent est la seule action variable : $F_{Ed} = 1{,}5\times${t(p.Fk)} = ${t(n(v, 'FEd'))}$ kN.` },
    { key: 'NEd', kind: 'numeric', unit: 'kN', label: 'Effort de traction dans la diagonale $N_{Ed}$', hint: r`$N_{Ed} = F_{Ed}/\sin\alpha$`, answer: (p, v) => n(v, 'FEd') / Math.sin(deg(p.angle)),
      explain: (p, v) => r`$$N_{Ed} = \frac{${t(n(v, 'FEd'))}}{\sin ${t(p.angle, 2)}°} = ${t(n(v, 'NEd'))}\ \text{kN}$$ Seule la diagonale tendue travaille.` },
    { key: 'Amin', kind: 'numeric', unit: 'cm²', label: 'Aire minimale de la section brute', hint: r`$A \ge N_{Ed}\gamma_{M0}/f_y$`, tol: 2.5,
      answer: (p, v) => (n(v, 'NEd') * 1000) / STEEL[p.steel].fy / 100,
      explain: (p, v) => r`$$A \ge \frac{${t(n(v, 'NEd') * 1000, 0)}}{${STEEL[p.steel].fy}} = ${t(n(v, 'Amin') * 100, 1)}\ \text{mm}^2 = ${t(n(v, 'Amin'), 3)}\ \text{cm}^2$$` },
    { key: 'profil', kind: 'choice', label: 'Plus petite cornière qui convient en section brute ?', hint: 'Première cornière dont A ≥ A_min.',
      choices: () => CORN.map((c) => ({ id: c.name, text: `${c.name} (A = ${f(c.A)} cm²)` })),
      answer: (_p, v) => (CORN.find((c) => c.A >= n(v, 'Amin')) ?? CORN.at(-1)!).name,
      explain: (_p, v) => r`**${s(v, 'profil')}** : $A = ${t(corn(s(v, 'profil')).A)}$ cm² ≥ ${t(n(v, 'Amin'), 3)} cm².` },
    { key: 'Npl', kind: 'numeric', unit: 'kN', label: r`$N_{pl,Rd}$ de la cornière choisie`, hint: r`$N_{pl,Rd} = Af_y/\gamma_{M0}$`,
      answer: (p, v) => (corn(s(v, 'profil')).A * 100 * STEEL[p.steel].fy) / 1000,
      explain: (p, v) => r`$$N_{pl,Rd} = ${t(corn(s(v, 'profil')).A * 100, 0)}\times${STEEL[p.steel].fy} = ${t(n(v, 'Npl'), 1)}\ \text{kN}$$` },
    { key: 'Anet', kind: 'numeric', unit: 'cm²', label: 'Aire nette au droit du trou', hint: r`$A_{net} = A - d_0\,t$ (un seul trou)`,
      answer: (p, v) => corn(s(v, 'profil')).A - (p.d0 * corn(s(v, 'profil')).t) / 100,
      explain: (p, v) => r`$$A_{net} = ${t(corn(s(v, 'profil')).A)} - ${p.d0}\times${t(corn(s(v, 'profil')).t, 1)}/100 = ${t(n(v, 'Anet'), 3)}\ \text{cm}^2$$ On ne retire qu'**un** trou (une seule rangée).` },
    { key: 'Nu', kind: 'numeric', unit: 'kN', label: r`$N_{u,Rd}$ au droit du trou`, hint: r`$0{,}9A_{net}f_u/\gamma_{M2}$`,
      answer: (p, v) => (0.9 * n(v, 'Anet') * 100 * STEEL[p.steel].fu) / 1.25 / 1000,
      explain: (p, v) => r`$$N_{u,Rd} = 0{,}9\times\frac{${t(n(v, 'Anet') * 100, 0)}\times${STEEL[p.steel].fu}}{1{,}25} = ${t(n(v, 'Nu'), 2)}\ \text{kN}$$` },
    { key: 'ccl', kind: 'choice', label: 'La cornière est-elle vérifiée ?', hint: 'Deux conditions : section brute et section nette.',
      choices: () => [{ id: 'ok', text: 'Oui : N_Ed ≤ N_pl,Rd et N_Ed ≤ N_u,Rd' }, { id: 'ko', text: 'Non : une condition n’est pas respectée' }],
      answer: (_p, v) => (n(v, 'NEd') <= n(v, 'Npl') && n(v, 'NEd') <= n(v, 'Nu') ? 'ok' : 'ko'),
      explain: (_p, v) => r`$N_{Ed} = ${t(n(v, 'NEd'))}$ ; $N_{pl,Rd} = ${t(n(v, 'Npl'), 1)}$ ; $N_{u,Rd} = ${t(n(v, 'Nu'))}$ kN. ${n(v, 'NEd') > n(v, 'Nu') ? 'La section nette ne passe pas : prendre la cornière suivante.' : ''}` },
  ],
  conclusion: (_p, v) => r`**Conclusion type** : diagonale **${s(v, 'profil')}**, $N_{Ed} = ${t(n(v, 'NEd'))}$ kN, taux ${t((n(v, 'NEd') / Math.min(n(v, 'Npl'), n(v, 'Nu'))) * 100, 0)} % (section ${n(v, 'Nu') < n(v, 'Npl') ? 'nette' : 'brute'} déterminante) : ${s(v, 'ccl') === 'ok' ? 'vérifiée' : 'non vérifiée'}.`,
  source: [TD(25), TD(26), TD(28), POLY(18)],
};

// =====================================================================
// M3 — Flexion déviée d'une panne inclinée
// =====================================================================
type M3 = { L: number; p: number; alpha: number; pz?: number; py?: number };
const IPE_POLY = IPE.filter((x) => x.h <= 240);
const ipe = (name: string) => IPE.find((x) => x.name === name)!;
const crit = (My: number, Mz: number, pr: (typeof IPE)[number]) => (My / ((pr.Wply * 235) / 1000)) ** 2 + Mz / ((pr.Wplz * 235) / 1000);

export const M3_DEVIEE: Generator<M3> = {
  id: 'm3-flexion-deviee',
  code: 'M3',
  title: 'Panne inclinée en flexion déviée',
  group: 'Métal',
  themeIds: ['metal-elu'],
  level: 3,
  description: 'Projection des charges sur z et y, moments M_y et M_z, critère (M_y/M_pl,y)² + M_z/M_pl,z ≤ 1.',
  params: (rand) => ({ L: step(3, 5, 0.5, rand), p: step(1.5, 4, 0.1, rand), alpha: step(10, 30, 1, rand) }),
  official: [{ label: 'TD garage (panne de 4 m)', params: { L: 4, p: 4.04, alpha: 15, pz: 3.94, py: 0.9 } }],
  statement: (p) => r`Panne IPE en S235 sur deux appuis, portée $L = ${t(p.L)}$ m, versant incliné à $\alpha = ${p.alpha}°$, sans liernes. ${p.pz !== undefined ? r`Après projection (corrigé TD) : $p_{u,z} = ${t(p.pz)}$ kN/ml et $p_{u,y} = ${t(p.py!)}$ kN/ml.` : r`Charge ELU **verticale** $p_u = ${t(p.p)}$ kN/ml.`} Vérifie la panne en flexion déviée ($N_{Ed} = 0$).`,
  data: () => [
    { kind: 'table', title: 'IPE (poly p.39)', columns: ['Profilé', 'W_pl,y (cm³)', 'W_pl,z (cm³)'], rows: IPE_POLY.map((x) => [x.name, x.Wply, x.Wplz]) },
    { kind: 'formula', latex: r`\left(\frac{M_{y,Ed}}{M_{pl,y,Rd}}\right)^{2} + \left(\frac{M_{z,Ed}}{M_{pl,z,Rd}}\right)^{1} \le 1\qquad (\text{I}, n = 0 : \alpha = 2,\ \beta = 1)` },
  ],
  steps: [
    { key: 'pz', kind: 'numeric', unit: 'kN/ml', label: r`Composante perpendiculaire au versant $p_{u,z}$`, hint: r`$p\cos\alpha$`,
      answer: (p) => p.pz ?? p.p * Math.cos(deg(p.alpha)),
      explain: (p, v) => (p.pz !== undefined ? r`Valeur donnée : $p_{u,z} = ${t(n(v, 'pz'))}$ kN/ml.` : r`$p_{u,z} = ${t(p.p)}\cos${p.alpha}° = ${t(n(v, 'pz'))}$ kN/ml.`) },
    { key: 'py', kind: 'numeric', unit: 'kN/ml', label: r`Composante parallèle au versant $p_{u,y}$`, hint: r`$p\sin\alpha$`,
      answer: (p) => p.py ?? p.p * Math.sin(deg(p.alpha)),
      explain: (p, v) => (p.py !== undefined ? r`Valeur donnée : $p_{u,y} = ${t(n(v, 'py'))}$ kN/ml.` : r`$p_{u,y} = ${t(p.p)}\sin${p.alpha}° = ${t(n(v, 'py'))}$ kN/ml.`) },
    { key: 'My', kind: 'numeric', unit: 'kN·m', label: r`$M_{Ed,y}$`, hint: r`$p_zL^2/8$`, answer: (p, v) => (n(v, 'pz') * p.L ** 2) / 8,
      explain: (p, v) => r`$M_{Ed,y} = ${t(n(v, 'pz'))}\times${t(p.L)}^2/8 = ${t(n(v, 'My'))}$ kN·m` },
    { key: 'Mz', kind: 'numeric', unit: 'kN·m', label: r`$M_{Ed,z}$`, hint: r`$p_yL^2/8$`, answer: (p, v) => (n(v, 'py') * p.L ** 2) / 8,
      explain: (p, v) => r`$M_{Ed,z} = ${t(n(v, 'py'))}\times${t(p.L)}^2/8 = ${t(n(v, 'Mz'))}$ kN·m` },
    { key: 'profil', kind: 'choice', label: 'Plus petit IPE qui vérifie le critère de flexion déviée ?', hint: 'Teste les IPE dans l’ordre avec le critère.',
      choices: () => IPE_POLY.map((x) => ({ id: x.name, text: x.name })),
      answer: (_p, v) => (IPE_POLY.find((x) => crit(n(v, 'My'), n(v, 'Mz'), x) <= 1) ?? IPE_POLY.at(-1)!).name,
      explain: (_p, v) => IPE_POLY.slice(0, IPE_POLY.findIndex((x) => x.name === s(v, 'profil')) + 1)
        .map((x) => `${x.name} : ${f(crit(n(v, 'My'), n(v, 'Mz'), x), 2)}`).join(' ; ') + ` → le premier ≤ 1 est le **${s(v, 'profil')}**.` },
    { key: 'Mply', kind: 'numeric', unit: 'kN·m', label: r`$M_{pl,y,Rd}$ du profilé choisi`, hint: r`$W_{pl,y}f_y$`, answer: (_p, v) => (ipe(s(v, 'profil')).Wply * 235) / 1000,
      explain: (_p, v) => r`$M_{pl,y,Rd} = ${t(ipe(s(v, 'profil')).Wply)}\times235/1000 = ${t(n(v, 'Mply'))}$ kN·m` },
    { key: 'Mplz', kind: 'numeric', unit: 'kN·m', label: r`$M_{pl,z,Rd}$ du profilé choisi`, hint: r`$W_{pl,z}f_y$`, answer: (_p, v) => (ipe(s(v, 'profil')).Wplz * 235) / 1000,
      explain: (_p, v) => r`$M_{pl,z,Rd} = ${t(ipe(s(v, 'profil')).Wplz)}\times235/1000 = ${t(n(v, 'Mplz'))}$ kN·m` },
    { key: 'crit', kind: 'numeric', unit: '', label: 'Valeur du critère de flexion déviée', hint: r`$(M_y/M_{pl,y})^2 + M_z/M_{pl,z}$`,
      answer: (_p, v) => (n(v, 'My') / n(v, 'Mply')) ** 2 + n(v, 'Mz') / n(v, 'Mplz'),
      explain: (_p, v) => r`$$\left(\frac{${t(n(v, 'My'))}}{${t(n(v, 'Mply'))}}\right)^2 + \frac{${t(n(v, 'Mz'))}}{${t(n(v, 'Mplz'))}} = ${t(n(v, 'crit'), 2)}$$ ${n(v, 'crit') <= 1 ? '≤ 1 → vérifié.' : '> 1 → non vérifié.'}` },
  ],
  conclusion: (_p, v) => r`**Conclusion type** : avec un **${s(v, 'profil')}**, le critère vaut ${t(n(v, 'crit'), 2)} ${n(v, 'crit') <= 1 ? '≤ 1 : la panne est vérifiée en flexion déviée' : '> 1 : non vérifiée'}. Penser ensuite aux flèches selon y (liernes à L/2 → flèche ÷ 16).`,
  source: [TD(19), TD(20), POLY(24)],
};

// =====================================================================
// M4 — Traction / compression simple
// =====================================================================
type M4 = { profil: string; steel: string; NEd: number; kind: 'compression' | 'traction' };
const ALL = [...HEA, ...HEB, ...IPE];
const prof = (name: string) => ALL.find((x) => x.name === name)!;

export const M4_SIMPLE: Generator<M4> = {
  id: 'm4-compression-traction',
  code: 'M4',
  title: 'Barre en traction ou compression simple',
  group: 'Métal',
  themeIds: ['metal-elu', 'metal-materiau'],
  level: 1,
  description: 'Lecture du catalogue, f_y de la nuance, N_pl,Rd et taux de travail (pièce massive, sans flambement).',
  params: (rand) => {
    const profil = pick(['HEA 100', 'HEA 120', 'HEA 140', 'HEB 100', 'HEB 120', 'IPE 160', 'IPE 200'], rand);
    const steel = pick(['S235', 'S275', 'S355'], rand);
    const cap = (prof(profil).A * 100 * STEEL[steel].fy) / 1000;
    return { profil, steel, NEd: Math.round(cap * step(0.4, 1.1, 0.05, rand)), kind: rand() < 0.5 ? 'compression' : 'traction' };
  },
  official: [{ label: 'HEA 100 en S275 (exemple de la banque)', params: { profil: 'HEA 100', steel: 'S275', NEd: 400, kind: 'compression' } }],
  statement: (p) => r`Une barre courte (pièce massive, flambement négligé) en **${p.profil}**, acier **${p.steel}**, est soumise à un effort de ${p.kind} $N_{Ed} = ${t(p.NEd, 0)}$ kN (ELU). Vérifie-la.`,
  data: (p) => [
    { kind: 'table', title: 'Extrait catalogue', columns: ['Profilé', 'A (cm²)'], rows: [p.profil, ...ALL.filter((x) => x.name !== p.profil).slice(0, 3).map((x) => x.name)].map((nm) => [nm, prof(nm).A]) },
    { kind: 'table', title: 'Nuances (t ≤ 40 mm)', columns: ['Nuance', 'f_y (MPa)', 'f_u (MPa)'], rows: Object.entries(STEEL).map(([k, x]) => [k, x.fy, x.fu]) },
  ],
  steps: [
    { key: 'A', kind: 'numeric', unit: 'cm²', label: (p) => `Aire A du ${p.profil}`, hint: 'Lecture du catalogue', tol: 0.5, answer: (p) => prof(p.profil).A,
      explain: (p) => r`Catalogue : ${p.profil} → $A = ${t(prof(p.profil).A, 1)}$ cm².` },
    { key: 'fy', kind: 'numeric', unit: 'MPa', label: (p) => `Limite d’élasticité de l’acier ${p.steel}`, hint: 'Le nombre de la nuance', tol: 0, answer: (p) => STEEL[p.steel].fy,
      explain: (p) => r`${p.steel} → $f_y = ${STEEL[p.steel].fy}$ MPa (épaisseur ≤ 40 mm).` },
    { key: 'Npl', kind: 'numeric', unit: 'kN', label: r`$N_{pl,Rd}$`, hint: r`$Af_y/\gamma_{M0}$, A en mm²`, answer: (_p, v) => (n(v, 'A') * 100 * n(v, 'fy')) / 1000,
      explain: (_p, v) => r`$$N_{pl,Rd} = \frac{${t(n(v, 'A') * 100, 0)}\times${t(n(v, 'fy'), 0)}}{1{,}00} = ${t(n(v, 'Npl'), 1)}\ \text{kN}$$` },
    { key: 'eta', kind: 'numeric', unit: '%', label: 'Taux de travail', hint: r`$N_{Ed}/N_{pl,Rd}$`, answer: (p, v) => (p.NEd / n(v, 'Npl')) * 100,
      explain: (p, v) => r`$\eta = ${t(p.NEd, 0)}/${t(n(v, 'Npl'), 1)} = ${t(n(v, 'eta'), 0)}\ \%$` },
    { key: 'ccl', kind: 'choice', label: 'Conclusion', hint: 'η ≤ 100 % ?', choices: () => [{ id: 'ok', text: 'Vérifié' }, { id: 'ko', text: 'Non vérifié' }],
      answer: (_p, v) => (n(v, 'eta') <= 100 ? 'ok' : 'ko'), explain: (_p, v) => (n(v, 'eta') <= 100 ? 'N_Ed ≤ N_pl,Rd : la barre convient.' : 'N_Ed > N_pl,Rd : prendre un profilé plus gros ou un acier plus résistant.') },
  ],
  conclusion: (p, v) => r`**Conclusion type** : $N_{Ed} = ${t(p.NEd, 0)}$ kN ${n(v, 'eta') <= 100 ? '≤' : '>'} $N_{pl,Rd} = ${t(n(v, 'Npl'), 1)}$ kN, taux ${t(n(v, 'eta'), 0)} % : ${n(v, 'eta') <= 100 ? 'le profilé convient' : 'le profilé ne convient pas'}.${p.kind === 'traction' ? ' S’il y a des trous, vérifier aussi N_u,Rd.' : ' Pièce élancée : le flambement serait à vérifier.'}`,
  source: [POLY(18), POLY(19), POLY(44)],
};

export const METAL_GENERATORS = [M1_PANNE, M2_TIRANT, M3_DEVIEE, M4_SIMPLE];
