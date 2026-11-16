import type { Generator } from '@/features/table/types';
import { CMIN_DUR, CMIN_DUR_VALUES, EXPO_COLS, SECTIONS_ACIER, barArea } from '../formulaire/tables';
import { r, t, f, n, s, step, pick } from './util';

const BA = (k: number) => ({ docName: `Correction_TD${k}_moodle.pdf`, page: 1 });
const BA4 = { docName: 'Correction_TD4_moodle_Q3.pdf', page: 1 };
const EC = { docName: 'Eurocodes (EN / Annexe nationale)', note: 'valeur EC standard, non trouvée dans le cours' };

const fctm = (fck: number) => 0.3 * fck ** (2 / 3);
const fyd = (fyk: number) => fyk / 1.15;

// =====================================================================
// BA1 — Caractéristiques des matériaux (TD1)
// =====================================================================
type BA1 = { fck: number; fyk: number; h: number; tj: number };
export const BA1_MATERIAUX: Generator<BA1> = {
  id: 'ba1-materiaux',
  code: 'BA1',
  title: 'Caractéristiques du béton et de l’acier',
  group: 'Béton armé',
  themeIds: ['ba-materiaux'],
  level: 1,
  description: 'f_cd, f_cm, f_ctm, f_ctk, f_ctm,fl, E_cm, E_c,eff, f_yd, ε_yd et résistance au jeune âge.',
  params: (rand) => ({ fck: pick([20, 25, 30, 35, 40], rand), fyk: pick([400, 500, 500], rand), h: pick([300, 400, 500, 700], rand), tj: pick([3, 7, 10, 14, 20], rand) }),
  official: [
    { label: 'TD1 questions 1 à 4 (f_cd = 16,6 MPa)', params: { fck: 24.9, fyk: 500, h: 700, tj: 10 } },
    { label: 'TD1 question 5 (C35 à 10 jours)', params: { fck: 35, fyk: 500, h: 500, tj: 10 } },
  ],
  statement: (p) => r`Béton de résistance caractéristique $f_{ck} = ${t(p.fck, 1)}$ MPa (ciment CEM 42,5N, $s = 0{,}25$), aciers B${p.fyk}. Poutre de hauteur $h = ${p.h}$ mm. Calcule les caractéristiques de calcul des matériaux.`,
  data: () => [{ kind: 'formula', latex: r`f_{cd} = \frac{f_{ck}}{1{,}5}\ \ f_{cm} = f_{ck} + 8\ \ f_{ctm} = 0{,}3f_{ck}^{2/3}\ \ f_{ctk,0,05} = 0{,}7f_{ctm}\ \ f_{ctm,fl} = \max\left[\left(1{,}6 - \tfrac{h}{1000}\right)f_{ctm} ; f_{ctm}\right]` },
    { kind: 'formula', latex: r`E_{cm} = 22\,000\left(\frac{f_{cm}}{10}\right)^{0,3}\ \ E_{c,eff} = \frac{E_{cm}}{1+\varphi}\ (\varphi = 2)\ \ \beta_{cc}(t) = e^{s(1 - \sqrt{28/t})}\ \ f_{ck}(t) = \beta_{cc}f_{cm} - 8` }],
  steps: [
    { key: 'fcd', kind: 'numeric', unit: 'MPa', label: '$f_{cd}$', hint: 'f_ck / 1,5', answer: (p) => p.fck / 1.5, explain: (p, v) => r`$${t(p.fck, 1)}/1{,}5 = ${t(n(v, 'fcd'))}$ MPa` },
    { key: 'fcm', kind: 'numeric', unit: 'MPa', label: '$f_{cm}$', hint: 'f_ck + 8', tol: 0.5, answer: (p) => p.fck + 8, explain: (p, v) => r`$${t(p.fck, 1)} + 8 = ${t(n(v, 'fcm'), 1)}$ MPa` },
    { key: 'fctm', kind: 'numeric', unit: 'MPa', label: '$f_{ctm}$', hint: r`$0{,}3f_{ck}^{2/3}$`, answer: (p) => fctm(p.fck), explain: (p, v) => r`$0{,}3\times${t(p.fck, 1)}^{2/3} = ${t(n(v, 'fctm'))}$ MPa` },
    { key: 'fctk', kind: 'numeric', unit: 'MPa', label: '$f_{ctk,0,05}$', hint: '0,7 f_ctm', answer: (_p, v) => 0.7 * n(v, 'fctm'), explain: (_p, v) => r`$0{,}7\times${t(n(v, 'fctm'))} = ${t(n(v, 'fctk'))}$ MPa` },
    { key: 'fctmfl', kind: 'numeric', unit: 'MPa', label: '$f_{ctm,fl}$ de la poutre', hint: r`$\max[(1{,}6 - h/1000)f_{ctm} ; f_{ctm}]$`, answer: (p, v) => Math.max((1.6 - p.h / 1000) * n(v, 'fctm'), n(v, 'fctm')),
      explain: (p, v) => r`$\max(${t(1.6 - p.h / 1000, 2)}\times${t(n(v, 'fctm'))}\ ;\ ${t(n(v, 'fctm'))}) = ${t(n(v, 'fctmfl'))}$ MPa` },
    { key: 'Ecm', kind: 'numeric', unit: 'MPa', label: '$E_{cm}$', hint: r`$22\,000(f_{cm}/10)^{0,3}$`, answer: (_p, v) => 22000 * (n(v, 'fcm') / 10) ** 0.3,
      explain: (_p, v) => r`$22\,000\times(${t(n(v, 'fcm'), 1)}/10)^{0,3} = ${t(n(v, 'Ecm'), 0)}$ MPa` },
    { key: 'Eceff', kind: 'numeric', unit: 'MPa', label: '$E_{c,eff}$ (φ = 2)', hint: 'E_cm / 3', answer: (_p, v) => n(v, 'Ecm') / 3, explain: (_p, v) => r`$${t(n(v, 'Ecm'), 0)}/3 = ${t(n(v, 'Eceff'), 0)}$ MPa (module différé)` },
    { key: 'fyd', kind: 'numeric', unit: 'MPa', label: '$f_{yd}$', hint: 'f_yk / 1,15', answer: (p) => fyd(p.fyk), explain: (p, v) => r`$${p.fyk}/1{,}15 = ${t(n(v, 'fyd'), 1)}$ MPa` },
    { key: 'eyd', kind: 'numeric', unit: '‰', label: r`$\varepsilon_{yd}$`, hint: 'f_yd / E_s, E_s = 200 000 MPa', answer: (_p, v) => (n(v, 'fyd') / 200000) * 1000,
      explain: (_p, v) => r`$${t(n(v, 'fyd'), 1)}/200\,000 = ${t(n(v, 'eyd'), 2)}$ ‰ (le corrigé TD1 calcule f_yk/E_s = 2,5 ‰)` },
    { key: 'fckt', kind: 'numeric', unit: 'MPa', label: (p) => `$f_{ck}$ à ${p.tj} jours`, hint: r`$\beta_{cc} = e^{0,25(1-\sqrt{28/t})}$ puis $\beta_{cc}f_{cm} - 8$`,
      answer: (p, v) => Math.exp(0.25 * (1 - Math.sqrt(28 / p.tj))) * n(v, 'fcm') - 8,
      explain: (p, v) => r`$\beta_{cc}(${p.tj}) = ${t(Math.exp(0.25 * (1 - Math.sqrt(28 / p.tj))), 3)}$ ; $f_{cm}(t) = ${t(Math.exp(0.25 * (1 - Math.sqrt(28 / p.tj))) * n(v, 'fcm'), 2)}$ ; $f_{ck}(t) = ${t(n(v, 'fckt'), 2)}$ MPa (valable à partir de 3 jours).` },
  ],
  conclusion: (p, v) => r`**À retenir** : béton $f_{cd} = ${t(n(v, 'fcd'))}$ MPa, $E_{cm} = ${t(n(v, 'Ecm') / 1000, 1)}$ GPa ; acier $f_{yd} = ${t(n(v, 'fyd'), 0)}$ MPa.${p.fck === 24.9 ? ' f_ck = 24,9 ≈ 25 MPa → C25/30 (le corrigé indique « C20 » par erreur).' : ''}`,
  source: [BA(1)],
};

// =====================================================================
// BA2 — Enrobage et dispositions (TD2)
// =====================================================================
type BA2 = { expo: string; fck: number; duree: 50 | 100; phiL: number; phiT: number; h: number; b: number; nb: number; dg: number };
const EXPO_IDX: Record<string, number> = { X0: 0, XC1: 1, XC2: 2, XC3: 2, XC4: 3, XD1: 4, XS1: 4, XD2: 5, XS2: 5, XD3: 6, XS3: 6 };
const SEUIL: Record<number, number> = { 0: 30, 1: 30, 2: 30, 3: 35, 4: 40, 5: 40, 6: 45 };
const classe = (p: BA2) => {
  const i = EXPO_IDX[p.expo];
  let c = 4 + (p.duree === 100 ? 2 : 0) - (p.fck >= SEUIL[i] ? 1 : 0);
  c = Math.max(1, Math.min(6, c));
  return `S${c}`;
};
const cdur = (p: BA2) => CMIN_DUR_VALUES[classe(p)][EXPO_IDX[p.expo]];
const cale = (x: number) => Math.ceil(x / 5) * 5;

export const BA2_ENROBAGE: Generator<BA2> = {
  id: 'ba2-enrobage',
  code: 'BA2',
  title: 'Enrobage, hauteur utile et espacement',
  group: 'Béton armé',
  themeIds: ['ba-enrobage'],
  level: 2,
  description: 'Classe structurale, c_min,dur, c_nom des barres et des cadres, cale réelle, d et e_h.',
  params: (rand) => ({ expo: pick(['XC1', 'XC1', 'XC3', 'XC4', 'XD1', 'XD3'], rand), fck: pick([25, 30, 35, 40, 45], rand), duree: rand() < 0.85 ? 50 : 100, phiL: pick([12, 14, 16, 20], rand), phiT: pick([6, 8], rand), h: pick([350, 400, 450, 500], rand), b: pick([200, 220, 250, 300], rand), nb: pick([2, 3, 4], rand), dg: pick([15, 20], rand) }),
  official: [
    { label: 'TD2 exercice 2 (poutre XC3, C30, 4HA12)', params: { expo: 'XC3', fck: 30, duree: 50, phiL: 12, phiT: 6, h: 400, b: 300, nb: 4, dg: 15 } },
    { label: 'TD2 exercice 3 (XC1, C35, 3HA20)', params: { expo: 'XC1', fck: 35, duree: 50, phiL: 20, phiT: 6, h: 380, b: 180, nb: 3, dg: 15 } },
    { label: 'TD2 exercice 1 (pont XD3, C45, 100 ans)', params: { expo: 'XD3', fck: 45, duree: 100, phiL: 16, phiT: 6, h: 500, b: 300, nb: 3, dg: 20 } },
  ],
  statement: (p) => r`Poutre $b\times h = ${p.b}\times${p.h}$ mm, exposition **${p.expo}**, béton C${p.fck}, durée d'utilisation ${p.duree} ans. Armatures : ${p.nb} HA${p.phiL} sur un lit, cadres HA${p.phiT}, granulat maximal $d_g = ${p.dg}$ mm. Détermine l'enrobage, la hauteur utile et l'espacement des barres.`,
  data: () => [CMIN_DUR, { kind: 'formula', latex: r`c_{nom} = \max(\varphi\ ;\ c_{min,dur}\ ;\ 10) + 10\quad d = h - c - \varphi_t - \varphi_L/2\quad e_h = \frac{b - 2c - 2\varphi_t - n\varphi_L}{n - 1} \ge \max(20 ; \varphi_L ; d_g + 5)` }],
  steps: [
    { key: 'S', kind: 'choice', label: 'Classe structurale', hint: 'S4 ; +2 pour 100 ans ; −1 si béton de résistance élevée', choices: () => ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((x) => ({ id: x, text: x })),
      answer: (p) => classe(p), explain: (p) => `Classe de référence S4 (50 ans)${p.duree === 100 ? ' + 2 (100 ans)' : ''}${p.fck >= SEUIL[EXPO_IDX[p.expo]] ? ` − 1 (C${p.fck} ≥ C${SEUIL[EXPO_IDX[p.expo]]} en ${p.expo})` : ''} → ${classe(p)}.` },
    { key: 'cdur', kind: 'numeric', unit: 'mm', label: '$c_{min,dur}$', hint: 'Tableau 4.4N', tol: 0, answer: (p) => cdur(p), explain: (p) => `Ligne ${classe(p)}, colonne ${EXPO_COLS[EXPO_IDX[p.expo]]} → ${cdur(p)} mm.` },
    { key: 'cnomL', kind: 'numeric', unit: 'mm', label: '$c_{nom}$ des barres longitudinales', hint: 'max(φ_L ; c_min,dur ; 10) + 10', tol: 0, answer: (p) => Math.max(p.phiL, cdur(p), 10) + 10,
      explain: (p, v) => r`$\max(${p.phiL} ; ${cdur(p)} ; 10) + 10 = ${n(v, 'cnomL')}$ mm` },
    { key: 'cnomT', kind: 'numeric', unit: 'mm', label: '$c_{nom}$ des cadres', hint: 'max(φ_t ; c_min,dur ; 10) + 10', tol: 0, answer: (p) => Math.max(p.phiT, cdur(p), 10) + 10,
      explain: (p, v) => r`$\max(${p.phiT} ; ${cdur(p)} ; 10) + 10 = ${n(v, 'cnomT')}$ mm` },
    { key: 'c', kind: 'numeric', unit: 'mm', label: 'Enrobage réel retenu sous les cadres (cales de 5 en 5 mm)', hint: 'max(c_nom,cadres ; c_nom,barres − φ_t), arrondi au 5 mm supérieur', tol: 0,
      answer: (p, v) => cale(Math.max(n(v, 'cnomT'), n(v, 'cnomL') - p.phiT)),
      explain: (p, v) => r`$\max(${n(v, 'cnomT')} ; ${n(v, 'cnomL')} - ${p.phiT}) = ${Math.max(n(v, 'cnomT'), n(v, 'cnomL') - p.phiT)}$ mm → cale de **${n(v, 'c')} mm**.` },
    { key: 'd', kind: 'numeric', unit: 'mm', label: 'Hauteur utile $d$', hint: 'h − c − φ_t − φ_L/2', tol: 0.5, answer: (p, v) => p.h - n(v, 'c') - p.phiT - p.phiL / 2,
      explain: (p, v) => r`$${p.h} - ${n(v, 'c')} - ${p.phiT} - ${p.phiL / 2} = ${t(n(v, 'd'), 1)}$ mm` },
    { key: 'eh', kind: 'numeric', unit: 'mm', label: 'Espacement libre $e_h$ entre barres', hint: '(b − 2c − 2φ_t − n φ_L)/(n − 1)', answer: (p, v) => (p.b - 2 * n(v, 'c') - 2 * p.phiT - p.nb * p.phiL) / (p.nb - 1),
      explain: (p, v) => r`$(${p.b} - 2\times${n(v, 'c')} - 2\times${p.phiT} - ${p.nb}\times${p.phiL})/${p.nb - 1} = ${t(n(v, 'eh'), 1)}$ mm` },
    { key: 'ccl', kind: 'choice', label: (p) => `L’espacement convient-il (min = ${Math.max(20, p.phiL, p.dg + 5)} mm) ?`, hint: 'max(20 ; φ_L ; d_g + 5)', choices: () => [{ id: 'ok', text: 'Oui' }, { id: 'ko', text: 'Non : barres trop serrées' }],
      answer: (p, v) => (n(v, 'eh') >= Math.max(20, p.phiL, p.dg + 5) ? 'ok' : 'ko'), explain: (p, v) => `e_h = ${f(n(v, 'eh'), 1)} mm vs ${Math.max(20, p.phiL, p.dg + 5)} mm.` },
  ],
  conclusion: (_p, v) => r`**À retenir** : cale de ${n(v, 'c')} mm, $d = ${t(n(v, 'd'), 0)}$ mm, $e_h = ${t(n(v, 'eh'), 0)}$ mm (${s(v, 'ccl') === 'ok' ? 'OK' : 'insuffisant : autre ferraillage ou 2 lits'}). Les corrigés TD2/TD5 donnent parfois des $e_h$ plus faibles de ~10 mm (méthode non expliquée, voir NOTES).`,
  source: [BA(2), BA(5)],
};

// =====================================================================
// BA3 — Adhérence et ancrage (TD3)
// =====================================================================
type BA3 = { fck: number; fyk: number; phi: number; position: 'inf' | 'sup'; h: number };
export const BA3_ANCRAGE: Generator<BA3> = {
  id: 'ba3-ancrage',
  code: 'BA3',
  title: 'Contrainte d’adhérence et longueur d’ancrage',
  group: 'Béton armé',
  themeIds: ['ba-ancrage'],
  level: 2,
  description: 'f_ctd, η1 selon la position, f_bd, l_b,rqd et l_b,min.',
  params: (rand) => ({ fck: pick([20, 25, 30, 35], rand), fyk: pick([400, 500], rand), phi: pick([8, 10, 12, 14, 16, 20], rand), position: rand() < 0.7 ? 'inf' : 'sup', h: pick([140, 200, 450, 500], rand) }),
  official: [
    { label: 'TD3 cas 1-a (dalle C25, HA8 B500)', params: { fck: 25, fyk: 500, phi: 8, position: 'inf', h: 140 } },
    { label: 'TD3 cas 1-b (poutre C30, HA16 B400)', params: { fck: 30, fyk: 400, phi: 16, position: 'inf', h: 450 } },
    { label: 'TD3 cas 1-c (poutre C25, HA14 B400 en partie haute)', params: { fck: 25, fyk: 400, phi: 14, position: 'sup', h: 450 } },
  ],
  statement: (p) => r`Élément de hauteur ${p.h} mm en béton C${p.fck}, barre HA${p.phi} en acier B${p.fyk} placée en partie **${p.position === 'inf' ? 'inférieure' : 'supérieure'}**. Calcule la contrainte ultime d'adhérence et la longueur d'ancrage de référence (barre tendue, $\eta_2 = 1$).`,
  data: () => [{ kind: 'formula', latex: r`f_{ctd} = \frac{0{,}7\times0{,}3f_{ck}^{2/3}}{1{,}5}\quad f_{bd} = 2{,}25\,\eta_1\eta_2 f_{ctd}\quad l_{b,rqd} = \frac{\varphi}{4}\frac{f_{yd}}{f_{bd}}\quad l_{b,min} = \max(0{,}3l_{b,rqd} ; 10\varphi ; 100)` }],
  steps: [
    { key: 'fctd', kind: 'numeric', unit: 'MPa', label: '$f_{ctd}$', hint: 'f_ctk,0,05 / 1,5', answer: (p) => (0.7 * fctm(p.fck)) / 1.5,
      explain: (p, v) => r`$f_{ctm} = ${t(fctm(p.fck))}$ ; $f_{ctk} = ${t(0.7 * fctm(p.fck))}$ ; $f_{ctd} = ${t(n(v, 'fctd'))}$ MPa` },
    { key: 'eta1', kind: 'numeric', unit: '', label: '$\\eta_1$', hint: '1 si bonnes conditions ; 0,7 si barre haute d’un élément de h > 250 mm', tol: 0, answer: (p) => (p.position === 'sup' && p.h > 250 ? 0.7 : 1),
      explain: (p) => (p.position === 'sup' && p.h > 250 ? 'Barre en partie supérieure d’un élément de plus de 250 mm → conditions médiocres → 0,7.' : 'Bonnes conditions d’adhérence → 1.') },
    { key: 'fbd', kind: 'numeric', unit: 'MPa', label: '$f_{bd}$', hint: '2,25 η1 η2 f_ctd', answer: (_p, v) => 2.25 * n(v, 'eta1') * n(v, 'fctd'),
      explain: (_p, v) => r`$2{,}25\times${t(n(v, 'eta1'), 1)}\times${t(n(v, 'fctd'))} = ${t(n(v, 'fbd'))}$ MPa` },
    { key: 'lb', kind: 'numeric', unit: 'mm', label: '$l_{b,rqd}$', hint: '(φ/4)(f_yd/f_bd)', answer: (p, v) => (p.phi / 4) * (fyd(p.fyk) / n(v, 'fbd')),
      explain: (p, v) => r`$\frac{${p.phi}}{4}\times\frac{${t(fyd(p.fyk), 1)}}{${t(n(v, 'fbd'))}} = ${t(n(v, 'lb'), 0)}$ mm (≈ ${t(n(v, 'lb') / p.phi, 1)}φ)` },
    { key: 'lbmin', kind: 'numeric', unit: 'mm', label: '$l_{b,min}$ (barre tendue)', hint: 'max(0,3 l_b,rqd ; 10φ ; 100 mm)', tol: 1, answer: (p, v) => Math.max(0.3 * n(v, 'lb'), 10 * p.phi, 100),
      explain: (p, v) => r`$\max(${t(0.3 * n(v, 'lb'), 0)} ; ${10 * p.phi} ; 100) = ${t(n(v, 'lbmin'), 0)}$ mm` },
  ],
  conclusion: (_p, v) => r`**À retenir** : $f_{bd} = ${t(n(v, 'fbd'))}$ MPa et $l_{b,rqd} = ${t(n(v, 'lb'), 0)}$ mm ; avec tous les $\alpha_i = 1$, $l_{bd} = \max(l_{b,rqd} ; l_{b,min}) = ${t(Math.max(n(v, 'lb'), n(v, 'lbmin')), 0)}$ mm.`,
  source: [BA(3), EC],
};

// =====================================================================
// BA4 — Flexion simple, section rectangulaire (TD5)
// =====================================================================
type BA4T = { Mu: number; b: number; d: number; h: number; fck: number; fyk: number };
const OPTIONS = [
  ['3HA12', [[3, 12]]], ['3HA14', [[3, 14]]], ['4HA12', [[4, 12]]], ['3HA16', [[3, 16]]], ['4HA14', [[4, 14]]], ['3HA16 + 2HA12', [[3, 16], [2, 12]]],
  ['3HA20', [[3, 20]]], ['2HA25', [[2, 25]]], ['3HA16 + 3HA14', [[3, 16], [3, 14]]], ['4HA20', [[4, 20]]], ['3HA20 + 3HA16', [[3, 20], [3, 16]]], ['3HA25', [[3, 25]]], ['6HA20', [[6, 20]]],
] as const;
const area = (o: (typeof OPTIONS)[number]) => o[1].reduce((a, [k, d]) => a + barArea(d, k), 0);
const muyd = (fyk: number) => { const a = 3.5 / (3.5 + (fyd(fyk) / 200000) * 1000); return 0.8 * a * (1 - 0.4 * a); };

export const BA4_FLEXION: Generator<BA4T> = {
  id: 'ba4-flexion',
  code: 'BA4',
  title: 'Flexion simple : section rectangulaire',
  group: 'Béton armé',
  themeIds: ['ba-flexion'],
  level: 2,
  description: 'μ_cu, comparaison à μ_cu,yd, β, A_s, section minimale et choix des barres.',
  params: (rand) => {
    const b = pick([0.2, 0.22, 0.25], rand); const d = pick([0.35, 0.4, 0.45], rand); const fck = pick([25, 30, 35], rand); const fyk = 500;
    const Mu = Math.round(step(0.12, 0.3, 0.01, rand) * b * d * d * (fck / 1.5) * 1000);
    return { Mu, b, d, h: Math.round((d + 0.05) * 100) / 100, fck, fyk };
  },
  official: [{ label: 'TD5 question 1 (poutre PT3)', params: { Mu: 150, b: 0.2, d: 0.4, h: 0.45, fck: 25, fyk: 500 } }],
  statement: (p) => r`Poutre rectangulaire $b = ${t(p.b)}$ m, $h = ${t(p.h)}$ m, $d = ${t(p.d)}$ m, béton C${p.fck}, aciers B${p.fyk}, classe XC1. Moment ELU $M_u = ${t(p.Mu, 0)}$ kN·m. Détermine les armatures longitudinales tendues.`,
  data: () => [SECTIONS_ACIER, { kind: 'formula', latex: r`\mu_{cu} = \frac{M_u}{bd^2f_{cd}}\quad \mu_{cu,yd} = 0{,}8\alpha_{yd}(1 - 0{,}4\alpha_{yd}),\ \alpha_{yd} = \frac{3{,}5}{3{,}5 + 1000\varepsilon_{yd}}\quad \beta = \frac{1+\sqrt{1-2\mu}}{2}\quad A_s = \frac{M_u}{\beta d f_{yd}}` }],
  steps: [
    { key: 'fcd', kind: 'numeric', unit: 'MPa', label: '$f_{cd}$', hint: 'f_ck/1,5', answer: (p) => p.fck / 1.5, explain: (p, v) => r`$${p.fck}/1{,}5 = ${t(n(v, 'fcd'))}$ MPa` },
    { key: 'mu', kind: 'numeric', unit: '', label: 'Moment réduit $\\mu_{cu}$', hint: 'M_u en MN·m, b et d en m, f_cd en MPa', answer: (p, v) => p.Mu / 1000 / (p.b * p.d ** 2 * n(v, 'fcd')),
      explain: (p, v) => r`$$\mu_{cu} = \frac{${t(p.Mu / 1000, 3)}}{${t(p.b)}\times${t(p.d)}^2\times${t(n(v, 'fcd'))}} = ${t(n(v, 'mu'), 3)}$$` },
    { key: 'muyd', kind: 'numeric', unit: '', label: '$\\mu_{cu,yd}$', hint: 'B500 : 0,372', answer: (p) => muyd(p.fyk), explain: (p, v) => r`$\varepsilon_{yd} = ${t((fyd(p.fyk) / 200000) * 1000, 2)}$ ‰ → $\mu_{cu,yd} = ${t(n(v, 'muyd'), 3)}$` },
    { key: 'comp', kind: 'choice', label: 'Faut-il des aciers comprimés ?', hint: 'μ_cu > μ_cu,yd ?', choices: () => [{ id: 'non', text: 'Non' }, { id: 'oui', text: 'Oui' }],
      answer: (_p, v) => (n(v, 'mu') <= n(v, 'muyd') ? 'non' : 'oui'), explain: (_p, v) => `${f(n(v, 'mu'), 3)} ${n(v, 'mu') <= n(v, 'muyd') ? '≤' : '>'} ${f(n(v, 'muyd'), 3)}.` },
    { key: 'beta', kind: 'numeric', unit: '', label: '$\\beta = z/d$', hint: '(1 + √(1 − 2μ))/2', answer: (_p, v) => (1 + Math.sqrt(Math.max(0, 1 - 2 * n(v, 'mu')))) / 2,
      explain: (_p, v) => r`$(1 + \sqrt{1 - 2\times${t(n(v, 'mu'), 3)}})/2 = ${t(n(v, 'beta'), 3)}$` },
    { key: 'As', kind: 'numeric', unit: 'cm²', label: '$A_s$', hint: 'M_u/(β d f_yd), en m² puis × 10⁴', answer: (p, v) => (p.Mu / 1000 / (n(v, 'beta') * p.d * fyd(p.fyk))) * 1e4,
      explain: (p, v) => r`$$A_s = \frac{${t(p.Mu / 1000, 3)}}{${t(n(v, 'beta'), 3)}\times${t(p.d)}\times${t(fyd(p.fyk), 1)}} = ${t(n(v, 'As'), 2)}\ \text{cm}^2$$` },
    { key: 'Asmin', kind: 'numeric', unit: 'cm²', label: '$A_{s,min}$', hint: 'max(0,26 f_ctm/f_yk · bd ; 0,0013 bd)', answer: (p) => Math.max((0.26 * fctm(p.fck)) / p.fyk, 0.0013) * p.b * p.d * 1e4,
      explain: (p, v) => r`$\max(0{,}26\times${t(fctm(p.fck))}/${p.fyk} ; 0{,}0013)\times${t(p.b)}\times${t(p.d)} = ${t(n(v, 'Asmin'), 2)}$ cm²` },
    { key: 'barres', kind: 'choice', label: 'Ferraillage le plus économique qui convient ?', hint: 'La plus petite section ≥ max(A_s ; A_s,min)',
      choices: (_p, v) => { const need = Math.max(n(v, 'As'), n(v, 'Asmin')); const ok = OPTIONS.filter((o) => area(o) >= need).slice(0, 3); const ko = OPTIONS.filter((o) => area(o) < need).slice(-2); return [...ko, ...ok].map((o) => ({ id: o[0], text: `${o[0]} (${f(area(o), 2)} cm²)` })); },
      answer: (_p, v) => (OPTIONS.find((o) => area(o) >= Math.max(n(v, 'As'), n(v, 'Asmin'))) ?? OPTIONS.at(-1)!)[0],
      explain: (_p, v) => `Il faut ${f(Math.max(n(v, 'As'), n(v, 'Asmin')), 2)} cm² : ${s(v, 'barres')} est la plus petite section proposée qui suffit (vérifier ensuite enrobage et espacement).` },
  ],
  conclusion: (_p, v) => r`**À retenir** : $\mu_{cu} = ${t(n(v, 'mu'), 3)}$, $A_s = ${t(n(v, 'As'), 2)}$ cm² → **${s(v, 'barres')}**.`,
  source: [BA(5), EC],
};

// =====================================================================
// BA5 — Poteau en compression centrée (TD4)
// =====================================================================
type BA5 = { lambda: number; NEd: number; b: number; h: number; fck: number; fyk: number; dp: number };
const alpha = (l: number) => (l <= 60 ? 0.86 / (1 + (l / 62) ** 2) : (32 / l) ** 1.3);
function asCalc(p: BA5) {
  const fcd = p.fck / 1.5; const fy = fyd(p.fyk);
  const c = alpha(p.lambda) * (0.75 + 0.5 * p.h);
  const k = (6 * (p.dp / 1000 / p.h)) / (p.b * p.h);
  const A = -c * k * fy; const B = c * (fy - k * p.b * p.h * fcd); const C = c * p.b * p.h * fcd - p.NEd / 1000;
  const root = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
  return Math.max(0, root * 1e4);
}
export const BA5_POTEAU: Generator<BA5> = {
  id: 'ba5-poteau',
  code: 'BA5',
  title: 'Poteau en compression centrée',
  group: 'Béton armé',
  themeIds: ['ba-poteaux'],
  level: 3,
  description: 'Coefficient α, section d’acier (méthode simplifiée avec k_h exact), section minimale et conclusion.',
  params: (rand) => ({ lambda: step(20, 55, 1, rand), NEd: step(300, 1200, 10, rand), b: pick([0.2, 0.22, 0.25, 0.3], rand), h: pick([0.2, 0.25, 0.3], rand), fck: pick([25, 30, 35], rand), fyk: 500, dp: 33 }),
  official: [
    { label: 'TD4 poteau P2', params: { lambda: 34, NEd: 420, b: 0.22, h: 0.2, fck: 35, fyk: 500, dp: 33 } },
    { label: 'TD4 poteau P1', params: { lambda: 36, NEd: 750, b: 0.22, h: 0.2, fck: 35, fyk: 500, dp: 33 } },
    { label: 'TD4 poteau P0', params: { lambda: 42, NEd: 1085, b: 0.22, h: 0.2, fck: 35, fyk: 500, dp: 33 } },
  ],
  statement: (p) => r`Poteau rectangulaire $b = ${t(p.b)}$ m, $h = ${t(p.h)}$ m (dimension dans le plan de flambement), élancement $\lambda = ${p.lambda}$, effort $N_{Ed} = ${t(p.NEd, 0)}$ kN, béton C${p.fck}, aciers B${p.fyk}, $d' = ${p.dp}$ mm. Détermine les armatures longitudinales.`,
  data: () => [SECTIONS_ACIER, { kind: 'formula', latex: r`N_{Rd} = \alpha\,k_h\,(bhf_{cd} + A_sf_{yd})\quad \alpha = \frac{0{,}86}{1 + (\lambda/62)^2}\quad k_h = (0{,}75 + 0{,}5h)(1 - 6\rho\delta),\ \rho = \frac{A_s}{bh},\ \delta = \frac{d'}{h}\quad A_{s,min} = \max\left(\frac{0{,}1N_{Ed}}{f_{yd}} ; 0{,}002bh\right)` }],
  steps: [
    { key: 'alpha', kind: 'numeric', unit: '', label: '$\\alpha$', hint: '0,86/(1 + (λ/62)²) si λ ≤ 60', answer: (p) => alpha(p.lambda), explain: (p, v) => r`$0{,}86/(1 + (${p.lambda}/62)^2) = ${t(n(v, 'alpha'), 3)}$` },
    { key: 'Nb', kind: 'numeric', unit: 'kN', label: 'Résistance du béton seul $b\\,h\\,f_{cd}$', hint: 'b h f_cd en MN puis kN', answer: (p) => p.b * p.h * (p.fck / 1.5) * 1000,
      explain: (p, v) => r`$${t(p.b)}\times${t(p.h)}\times${t(p.fck / 1.5)} = ${t(n(v, 'Nb'), 0)}$ kN` },
    { key: 'As', kind: 'numeric', unit: 'cm²', label: 'Section d’acier de résistance $A_s$ (0 si le béton suffit)', hint: 'Résoudre N_Ed = α k_h (bh f_cd + A_s f_yd) avec k_h fonction de A_s (équation du 2e degré)', tol: 3,
      answer: (p) => asCalc(p),
      explain: (p, v) => r`L'équation $N_{Ed} = \alpha(0{,}75 + 0{,}5h)\left(1 - 6\frac{A_s}{bh}\delta\right)(bhf_{cd} + A_sf_{yd})$ est du second degré en $A_s$ (δ = ${t(p.dp / 1000 / p.h, 3)}). Racine utile : ${n(v, 'As') === 0 ? 'négative → **aucun acier de résistance**' : r`$A_s = ${t(n(v, 'As'), 2)}$ cm²`}. (Avec $k_h$ approché à 0,81 le corrigé obtient une valeur un peu plus forte.)` },
    { key: 'Asmin', kind: 'numeric', unit: 'cm²', label: '$A_{s,min}$', hint: 'max(0,1 N_Ed/f_yd ; 0,002 A_c)', answer: (p) => Math.max((0.1 * p.NEd * 1000) / fyd(p.fyk), 0.002 * p.b * p.h * 1e6) / 100,
      explain: (p, v) => r`$\max(0{,}1\times${t(p.NEd * 1000, 0)}/${t(fyd(p.fyk), 1)}\ ;\ 0{,}002\times${t(p.b * p.h * 1e6, 0)}) = ${t(n(v, 'Asmin') * 100, 1)}$ mm² $= ${t(n(v, 'Asmin'), 3)}$ cm²` },
    { key: 'ccl', kind: 'choice', label: 'Conclusion', hint: 'ρ = A_s/(bh) : au-delà de 4 % la section est insuffisante',
      choices: () => [{ id: 'min', text: 'Pas d’acier de résistance : section minimale (4HA8 au moins)' }, { id: 'ok', text: 'Aciers de résistance, section raisonnable' }, { id: 'trop', text: 'ρ > 4 % : section de béton insuffisante' }],
      answer: (p, v) => (n(v, 'As') <= n(v, 'Asmin') ? 'min' : n(v, 'As') / (p.b * p.h * 1e4) > 0.04 ? 'trop' : 'ok'),
      explain: (p, v) => r`$\rho = ${t(n(v, 'As'), 2)}/${t(p.b * p.h * 1e4, 0)} = ${t((n(v, 'As') / (p.b * p.h * 1e4)) * 100, 1)}\ \%$.` },
  ],
  conclusion: (p, v) => r`**À retenir** : ${s(v, 'ccl') === 'min' ? `béton seul suffisant → section minimale ${f(n(v, 'Asmin'), 2)} cm², au moins 4HA8` : s(v, 'ccl') === 'trop' ? `A_s ≈ ${f(n(v, 'As'), 1)} cm² (ρ > 4 %) → agrandir le poteau (cas du poteau P0 du TD4)` : `A_s = ${f(n(v, 'As'), 2)} cm² → choisir les barres dans le tableau (TD4 P1 : 6HA14 = 9,24 cm²)`}. Cadres espacés au plus de min(20φ_L ; b ; 400 mm) = ${Math.min(20 * 14, p.b * 1000, 400)} mm avec φ_L = 14.`,
  source: [BA4, EC],
};

export const BA_GENERATORS = [BA1_MATERIAUX, BA2_ENROBAGE, BA3_ANCRAGE, BA4_FLEXION, BA5_POTEAU];
