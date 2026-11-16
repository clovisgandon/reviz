import type { Generator } from '@/features/table/types';
import { KMOD, KMOD_VALUES, KDEF, GAMMA_M_BOIS, CALVI, woodBlock, wood, kh } from '../formulaire/tables';
import { r, t, f, n, s, step, pick } from './util';

const MEMO = (page: number) => ({ docName: 'MEMO - STAB - BM - Justification des éléments simples aux EUROCODES 3 & 5 2022.pdf', page });
const PARTIEL = (page: number) => ({ docName: 'Partiel_2023_STAB01.pdf', page });
const TD = (page: number) => ({ docName: 'CORRIGE_TD_2024.pdf', page });

type Lieu = 'maison' | 'garage' | 'extérieur';
const CS: Record<Lieu, 1 | 2 | 3> = { maison: 1, garage: 2, extérieur: 3 };
const DUREES = ['permanente', 'long terme', 'moyen terme', 'court terme', 'instantanée'];
const kmodOf = (cs: 1 | 2 | 3, duree: string) => KMOD_VALUES[cs][DUREES.indexOf(duree)];
const gammaOf = (name: string) => GAMMA_M_BOIS[wood(name).kind];
const csChoices = () => [1, 2, 3].map((c) => ({ id: String(c), text: `Classe de service ${c}` }));
const dureeChoices = () => DUREES.map((d) => ({ id: d, text: d }));

// =====================================================================
// B1 — Solive / panne rectangulaire (partiel 2023)
// =====================================================================
type B1 = { wood: string; b: number; h: number; L: number; e: number; G: number; Q: number; lieu: Lieu };
const pp = (p: B1) => (p.b * p.h * wood(p.wood).rhomean * 10) / 1e9; // kN/m (g ≈ 10)

export const B1_SOLIVE: Generator<B1> = {
  id: 'b1-solive',
  code: 'B1',
  title: 'Solive bois : flexion, cisaillement, flèches',
  group: 'Bois',
  themeIds: ['bois-elu', 'bois-els', 'bois-coef'],
  level: 2,
  description: 'Le sujet type du partiel bois : classe de service, k_mod, k_h, f_m,d, σ, τ, puis flèches selon le mémo.',
  params: (rand) => {
    const w = pick(['GL24h', 'GL24h', 'GL28h', 'C24'], rand);
    const lc = wood(w).kind === 'LC';
    return {
      wood: w, b: lc ? pick([80, 100, 115], rand) : pick([63, 75, 100], rand), h: lc ? pick([200, 225, 250, 280], rand) : pick([175, 200, 225], rand),
      L: step(3.5, 5.5, 0.25, rand), e: pick([0.4, 0.5, 0.6], rand), G: step(0.5, 1.5, 0.05, rand), Q: pick([1.5, 2.0, 2.3, 2.5], rand), lieu: rand() < 0.7 ? 'maison' : 'garage',
    };
  },
  official: [{ label: 'Partiel 2023 (GL24h 100 × 250, La Rochelle)', params: { wood: 'GL24h', b: 100, h: 250, L: 5.5, e: 0.6, G: 1.15, Q: 2.3, lieu: 'maison' } }],
  statement: (p) => r`Solive rectangulaire **${p.wood}** de section $${p.b}\times${p.h}$ mm, ${p.lieu === 'maison' ? 'à l’intérieur d’une maison' : 'dans un garage non chauffé'}, portée $L = ${t(p.L)}$ m, entraxe ${t(p.e * 1000, 0)} mm, sans contre-flèche.
Charges uniformes : $G = ${t(p.G)}$ kN/m² (hors poids propre, $\rho_{mean}$ du bois à ajouter), $Q = ${t(p.Q)}$ kN/m² (catégorie A : $\psi_2 = 0{,}3$). Vérifie la solive (ELU puis ELS, critères « bâtiment courant »).`,
  data: (p) => [woodBlock([p.wood]), KMOD, { kind: 'text', title: 'γ_M et k_def', content: 'γ_M : BM 1,30 ; LC 1,25. k_def : CS1 0,6 ; CS2 0,8 ; CS3 2,0.' },
    { kind: 'formula', latex: r`f_{m,d} = \frac{f_{m,k}k_{mod}k_h}{\gamma_M}\quad \sigma = \frac{6M}{bh^2}\quad \tau = \frac{3V}{2bh}\quad U = \frac{5ql^4}{384E_{0,mean}I}` }, CALVI],
  steps: [
    { key: 'cs', kind: 'choice', label: 'Classe de service', hint: 'Intérieur chauffé / abrité non chauffé / extérieur', choices: csChoices, answer: (p) => String(CS[p.lieu]),
      explain: (p) => `${p.lieu === 'maison' ? 'Intérieur chauffé (humidité < 13 %) → CS1.' : p.lieu === 'garage' ? 'Abrité non chauffé (13–20 %) → CS2.' : 'Extérieur (> 20 %) → CS3.'}` },
    { key: 'duree', kind: 'choice', label: 'Classe de durée à retenir pour la combinaison G + Q', hint: 'Action de plus courte durée de la combinaison', choices: dureeChoices, answer: () => 'moyen terme',
      explain: () => r`G est permanente, l'exploitation est en **moyen terme** : on retient l'action de plus courte durée → moyen terme.` },
    { key: 'kmod', kind: 'numeric', unit: '', label: r`$k_{mod}$`, hint: 'Tableau du mémo p.7', tol: 0, answer: (_p, v) => kmodOf(Number(v.cs) as 1, s(v, 'duree')),
      explain: (_p, v) => r`CS${s(v, 'cs')}, ${s(v, 'duree')} → $k_{mod} = ${t(n(v, 'kmod'))}$` },
    { key: 'gM', kind: 'numeric', unit: '', label: r`$\gamma_M$`, hint: 'BM 1,30 ; LC 1,25', tol: 0, answer: (p) => gammaOf(p.wood),
      explain: (p) => r`${p.wood} est du ${wood(p.wood).kind === 'LC' ? 'lamellé-collé → 1,25' : 'bois massif → 1,30'}.` },
    { key: 'kh', kind: 'numeric', unit: '', label: r`$k_h$`, hint: r`LC : $\min[(600/h)^{0,1};1{,}1]$ si h < 600 ; BM : $\min[(150/h)^{0,2};1{,}3]$ si h < 150`, tol: 1,
      answer: (p) => kh(wood(p.wood).kind, p.h),
      explain: (p, v) => (wood(p.wood).kind === 'LC' ? r`$k_h = (600/${p.h})^{0,1} = ${t(n(v, 'kh'), 3)}$` : p.h < 150 ? r`$k_h = (150/${p.h})^{0,2} = ${t(n(v, 'kh'), 3)}$` : r`BM avec $h \ge 150$ mm → $k_h = 1$`) },
    { key: 'fmd', kind: 'numeric', unit: 'MPa', label: r`$f_{m,d}$`, hint: r`$f_{m,k}k_{mod}k_h/\gamma_M$`, answer: (p, v) => (wood(p.wood).fm * n(v, 'kmod') * n(v, 'kh')) / n(v, 'gM'),
      explain: (p, v) => r`$$f_{m,d} = \frac{${wood(p.wood).fm}\times${t(n(v, 'kmod'))}\times${t(n(v, 'kh'), 3)}}{${t(n(v, 'gM'))}} = ${t(n(v, 'fmd'))}\ \text{MPa}$$` },
    { key: 'pu', kind: 'numeric', unit: 'kN/ml', label: 'Charge ELU linéique (avec poids propre)', hint: '1,35(G·e + pp) + 1,5·Q·e', answer: (p) => 1.35 * (p.G * p.e + pp(p)) + 1.5 * p.Q * p.e,
      explain: (p, v) => r`$pp = ${p.b / 1000}\times${p.h / 1000}\times${t((wood(p.wood).rhomean * 10) / 1000, 1)} = ${t(pp(p), 3)}$ kN/ml.
$$p_u = 1{,}35\,(${t(p.G)}\times${t(p.e)} + ${t(pp(p), 3)}) + 1{,}5\times${t(p.Q)}\times${t(p.e)} = ${t(n(v, 'pu'), 3)}\ \text{kN/ml}$$` },
    { key: 'MEd', kind: 'numeric', unit: 'kN·m', label: r`$M_{Ed}$`, hint: r`$p_uL^2/8$`, answer: (p, v) => (n(v, 'pu') * p.L ** 2) / 8,
      explain: (p, v) => r`$M_{Ed} = ${t(n(v, 'pu'), 3)}\times${t(p.L)}^2/8 = ${t(n(v, 'MEd'))}$ kN·m` },
    { key: 'sig', kind: 'numeric', unit: 'MPa', label: r`$\sigma_{m,d}$`, hint: r`$6M/(bh^2)$, M en N·mm`, answer: (p, v) => (6 * n(v, 'MEd') * 1e6) / (p.b * p.h ** 2),
      explain: (p, v) => r`$$\sigma_{m,d} = \frac{6\times${t(n(v, 'MEd'))}\times10^6}{${p.b}\times${p.h}^2} = ${t(n(v, 'sig'))}\ \text{MPa}$$ Taux : ${t((n(v, 'sig') / n(v, 'fmd')) * 100, 0)} %.` },
    { key: 'VEd', kind: 'numeric', unit: 'kN', label: r`$V_{Ed}$`, hint: r`$p_uL/2$`, answer: (p, v) => (n(v, 'pu') * p.L) / 2,
      explain: (p, v) => r`$V_{Ed} = ${t(n(v, 'pu'), 3)}\times${t(p.L)}/2 = ${t(n(v, 'VEd'))}$ kN` },
    { key: 'tau', kind: 'numeric', unit: 'MPa', label: r`$\tau_d$`, hint: r`$3V/(2bh)$`, answer: (p, v) => (3 * n(v, 'VEd') * 1000) / (2 * p.b * p.h),
      explain: (p, v) => r`$\tau_d = \dfrac{3\times${t(n(v, 'VEd') * 1000, 0)}}{2\times${p.b}\times${p.h}} = ${t(n(v, 'tau'), 3)}$ MPa` },
    { key: 'fvd', kind: 'numeric', unit: 'MPa', label: r`$f_{v,d}$`, hint: r`$f_{v,k}k_{mod}k_{cr}/\gamma_M$, $k_{cr} = 1$`, answer: (p, v) => (wood(p.wood).fv * n(v, 'kmod')) / n(v, 'gM'),
      explain: (p, v) => r`$f_{v,d} = ${t(wood(p.wood).fv, 1)}\times${t(n(v, 'kmod'))}/${t(n(v, 'gM'))} = ${t(n(v, 'fvd'))}$ MPa → taux ${t((n(v, 'tau') / n(v, 'fvd')) * 100, 0)} %` },
    { key: 'Uq', kind: 'numeric', unit: 'mm', label: r`Flèche instantanée $U_{inst,Q}$`, hint: r`$5ql^4/(384EI)$ avec $q = Q\cdot e$, $I = bh^3/12$`,
      answer: (p) => (5 * p.Q * p.e * (p.L * 1000) ** 4) / (384 * wood(p.wood).E0mean * ((p.b * p.h ** 3) / 12)),
      explain: (p, v) => r`$I = ${p.b}\times${p.h}^3/12 = ${t((p.b * p.h ** 3) / 12 / 1e6, 1)}\times10^6$ mm⁴ ; $q = ${t(p.Q * p.e, 2)}$ N/mm.
$$U_{inst,Q} = \frac{5\times${t(p.Q * p.e, 2)}\times${t(p.L * 1000, 0)}^4}{384\times${t(wood(p.wood).E0mean, 0)}\times I} = ${t(n(v, 'Uq'))}\ \text{mm}$$ Limite $l/300 = ${t((p.L * 1000) / 300)}$ mm.` },
    { key: 'Wnet', kind: 'numeric', unit: 'mm', label: r`Flèche finale $W_{net,fin} = U_{fin,G} + U_{fin,Q}$`, hint: r`$(1+k_{def})U_{inst,G} + (1+\psi_2k_{def})U_{inst,Q}$`,
      answer: (p, v) => {
        const kd = KDEF[Number(v.cs) as 1];
        const uG = (n(v, 'Uq') * (p.G * p.e + pp(p))) / (p.Q * p.e);
        return (1 + kd) * uG + (1 + 0.3 * kd) * n(v, 'Uq');
      },
      explain: (p, v) => {
        const kd = KDEF[Number(v.cs) as 1];
        const uG = (n(v, 'Uq') * (p.G * p.e + pp(p))) / (p.Q * p.e);
        return r`$U_{inst,G} = ${t(uG)}$ mm (g = ${t(p.G * p.e + pp(p), 3)} kN/ml) ; $k_{def} = ${t(kd)}$ ; $\psi_2 = 0{,}3$.
$$W_{net,fin} = ${t(1 + kd)}\times${t(uG)} + ${t(1 + 0.3 * kd, 2)}\times${t(n(v, 'Uq'))} = ${t(n(v, 'Wnet'), 1)}\ \text{mm}$$ Limite $l/200 = ${t((p.L * 1000) / 200, 1)}$ mm (sans contre-flèche, $W_{fin} = W_{net,fin}$ ≤ l/125 est moins sévère).`;
      } },
    { key: 'ccl', kind: 'choice', label: 'Les flèches sont-elles vérifiées ?', hint: 'U_inst,Q ≤ l/300 et W_net,fin ≤ l/200', choices: () => [{ id: 'ok', text: 'Oui' }, { id: 'ko', text: 'Non' }],
      answer: (p, v) => (n(v, 'Uq') <= (p.L * 1000) / 300 && n(v, 'Wnet') <= (p.L * 1000) / 200 ? 'ok' : 'ko'),
      explain: (p, v) => r`$U_{inst,Q} = ${t(n(v, 'Uq'), 1)}$ vs ${t((p.L * 1000) / 300, 1)} mm ; $W_{net,fin} = ${t(n(v, 'Wnet'), 1)}$ vs ${t((p.L * 1000) / 200, 1)} mm.` },
  ],
  conclusion: (_p, v) => r`**Conclusion type** : flexion ${t((n(v, 'sig') / n(v, 'fmd')) * 100, 0)} % (${n(v, 'sig') <= n(v, 'fmd') ? 'vérifiée' : 'non vérifiée'}), cisaillement ${t((n(v, 'tau') / n(v, 'fvd')) * 100, 0)} %, flèches ${s(v, 'ccl') === 'ok' ? 'vérifiées' : 'non vérifiées'} : ${n(v, 'sig') <= n(v, 'fmd') && s(v, 'ccl') === 'ok' ? 'la solive convient' : 'il faut augmenter la section'}.`,
  source: [PARTIEL(3), MEMO(2), MEMO(3), MEMO(6), MEMO(7)],
};

// =====================================================================
// B2 — Combinaison dimensionnante (charge / k_mod)
// =====================================================================
type B2 = { G: number; S: number; W: number; cs: 1 | 2 | 3; alt: number };
const combos = (p: B2) => {
  const snow = p.alt > 1000 ? 2 : 3; // MT au-dessus de 1000 m, CT sinon
  const k = (i: number) => KMOD_VALUES[p.cs][i];
  return [
    { id: 'c1', label: '1,35G', val: 1.35 * p.G, kmod: k(0) },
    { id: 'c2', label: '1,35G + 1,5S', val: 1.35 * p.G + 1.5 * p.S, kmod: k(snow) },
    { id: 'c3', label: '1,35G + 1,5W', val: 1.35 * p.G + 1.5 * p.W, kmod: k(4) },
    { id: 'c4', label: '1,35G + 1,5S + 0,9W', val: 1.35 * p.G + 1.5 * p.S + 0.9 * p.W, kmod: k(4) },
    { id: 'c5', label: '1,35G + 1,5W + 0,75S', val: 1.35 * p.G + 1.5 * p.W + 0.75 * p.S, kmod: k(4) },
  ];
};

export const B2_COMBI: Generator<B2> = {
  id: 'b2-combinaison',
  code: 'B2',
  title: 'Combinaison dimensionnante en bois (charge / k_mod)',
  group: 'Bois',
  themeIds: ['bois-elu', 'bois-coef', 'ec0'],
  level: 2,
  description: 'Calcul des combinaisons ELU, k_mod de chacune, rapport charge/k_mod et choix de la combinaison dimensionnante.',
  params: (rand) => ({ G: step(0.8, 1.6, 0.01, rand), S: step(0.5, 2.0, 0.01, rand), W: step(0.3, 1.5, 0.01, rand), cs: pick([1, 2] as const, rand), alt: pick([100, 360, 800, 1200], rand) }),
  official: [{ label: 'TD garage (panne bois)', params: { G: 1.163, S: 1.227, W: 0.62, cs: 2, alt: 360 } }],
  statement: (p) => r`Panne bois en classe de service ${p.cs}, altitude ${p.alt} m. Charges linéiques perpendiculaires à la panne : $G = ${t(p.G, 3)}$ ; neige $S = ${t(p.S, 3)}$ ; vent en pression $W = ${t(p.W, 3)}$ kN/ml ($\psi_0$ : neige 0,5 ; vent 0,6). Détermine la combinaison ELU dimensionnante.`,
  data: () => [KMOD, { kind: 'text', title: 'Durées', content: 'G permanente ; neige < 1000 m court terme (> 1000 m moyen terme) ; vent instantané. k_mod d’une combinaison = celui de l’action la plus courte.' }],
  steps: [
    ...[1, 2, 3, 4].map((i) => ({
      key: `v${i + 1}`, kind: 'numeric' as const, unit: 'kN/ml', label: `Valeur de la combinaison ${combos({ G: 0, S: 0, W: 0, cs: 1, alt: 0 })[i].label}`,
      hint: 'Remplacer G, S et W par leurs valeurs', answer: (p: B2) => combos(p)[i].val,
      explain: (p: B2) => r`${combos(p)[i].label} = $${t(combos(p)[i].val, 3)}$ kN/ml`,
    })),
    { key: 'kmod2', kind: 'numeric', unit: '', label: r`$k_{mod}$ de la combinaison $1{,}35G + 1{,}5S$`, hint: 'Durée de la neige selon l’altitude', tol: 0, answer: (p) => combos(p)[1].kmod,
      explain: (p) => r`Neige ${p.alt > 1000 ? 'au-dessus de 1000 m → moyen terme' : 'sous 1000 m → court terme'}, CS${p.cs} → $k_{mod} = ${t(combos(p)[1].kmod)}$.` },
    { key: 'dim', kind: 'choice', label: 'Quelle combinaison est dimensionnante ?', hint: 'La plus grande valeur de charge / k_mod',
      choices: (p) => combos(p).map((c) => ({ id: c.id, text: c.label })),
      answer: (p) => combos(p).reduce((a, b) => (b.val / b.kmod > a.val / a.kmod ? b : a)).id,
      explain: (p) => combos(p).map((c) => `${c.label} : ${f(c.val, 2)}/${f(c.kmod)} = ${f(c.val / c.kmod, 2)}`).join(' ; ') + ' → on garde le plus grand rapport.' },
    { key: 'ratio', kind: 'numeric', unit: 'kN/ml', label: 'Rapport charge / k_mod de la combinaison dimensionnante', hint: 'Valeur / k_mod',
      answer: (p, v) => { const c = combos(p).find((x) => x.id === s(v, 'dim'))!; return c.val / c.kmod; },
      explain: (p, v) => { const c = combos(p).find((x) => x.id === s(v, 'dim'))!; return r`${c.label} : $${t(c.val, 3)}/${t(c.kmod)} = ${t(c.val / c.kmod, 3)}$ kN/ml`; } },
  ],
  conclusion: (p, v) => { const c = combos(p).find((x) => x.id === s(v, 'dim'))!; return r`**Conclusion type** : la combinaison **${c.label}** ($k_{mod} = ${t(c.kmod)}$) est dimensionnante ; on vérifie la panne avec $p_u = ${t(c.val, 2)}$ kN/ml et ce $k_{mod}$ (pas avec le rapport, qui sert seulement à comparer).`; },
  source: [TD(29), TD(30), MEMO(7)],
};

// =====================================================================
// B3 — Tirant bois
// =====================================================================
type B3 = { wood: string; b: number; h: number; N: number; cs: 1 | 2 | 3; duree: string; dTrou: number };
export const B3_TIRANT: Generator<B3> = {
  id: 'b3-tirant-bois',
  code: 'B3',
  title: 'Tirant bois en traction axiale',
  group: 'Bois',
  themeIds: ['bois-elu', 'bois-coef'],
  level: 2,
  description: 'k_mod, γ_M, k_l, f_t,0,d, section nette au droit du boulon et taux de travail.',
  params: (rand) => ({ wood: pick(['C24', 'C24', 'C30', 'GL24h'], rand), b: pick([50, 63, 70, 75], rand), h: pick([100, 105, 125, 150], rand), N: step(5, 40, 0.5, rand), cs: pick([1, 2] as const, rand), duree: rand() < 0.6 ? 'instantanée' : 'court terme', dTrou: pick([12, 14, 18], rand) }),
  official: [{ label: 'TD garage (C24 70 × 105)', params: { wood: 'C24', b: 70, h: 105, N: 10.67, cs: 2, duree: 'instantanée', dTrou: 14 } }],
  statement: (p) => r`Diagonale de contreventement en **${p.wood}**, section $${p.b}\times${p.h}$ mm, classe de service ${p.cs}, effort de traction ELU $N_{Ed} = ${t(p.N)}$ kN (combinaison dont l'action la plus courte est en durée **${p.duree}**). Assemblage par boulon : un trou de ${p.dTrou} mm traverse la hauteur ${p.h} mm. Vérifie le tirant.`,
  data: (p) => [woodBlock([p.wood]), KMOD, { kind: 'formula', latex: r`\sigma_{t,0,d} = \frac{N}{A_{net}} \le f_{t,0,d} = \frac{f_{t,0,k}\,k_{mod}\,k_l}{\gamma_M}\qquad k_l = k_h\ (\text{BM, LC})` }],
  steps: [
    { key: 'kmod', kind: 'numeric', unit: '', label: r`$k_{mod}$`, hint: 'Classe de service + durée la plus courte', tol: 0, answer: (p) => kmodOf(p.cs, p.duree),
      explain: (p, v) => r`CS${p.cs}, ${p.duree} → $k_{mod} = ${t(n(v, 'kmod'))}$` },
    { key: 'gM', kind: 'numeric', unit: '', label: r`$\gamma_M$`, hint: 'BM 1,30 ; LC 1,25', tol: 0, answer: (p) => gammaOf(p.wood), explain: (p) => `${p.wood} → γ_M = ${f(gammaOf(p.wood))}` },
    { key: 'kl', kind: 'numeric', unit: '', label: r`$k_l$`, hint: 'Comme k_h pour BM et LC (h = plus grande dimension)', tol: 1, answer: (p) => kh(wood(p.wood).kind, Math.max(p.b, p.h)),
      explain: (p, v) => r`$h = ${Math.max(p.b, p.h)}$ mm → $k_l = ${t(n(v, 'kl'), 3)}$` },
    { key: 'ftd', kind: 'numeric', unit: 'MPa', label: r`$f_{t,0,d}$`, hint: r`$f_{t,0,k}k_{mod}k_l/\gamma_M$`, answer: (p, v) => (wood(p.wood).ft0 * n(v, 'kmod') * n(v, 'kl')) / n(v, 'gM'),
      explain: (p, v) => r`$$f_{t,0,d} = \frac{${t(wood(p.wood).ft0, 1)}\times${t(n(v, 'kmod'))}\times${t(n(v, 'kl'), 3)}}{${t(n(v, 'gM'))}} = ${t(n(v, 'ftd'))}\ \text{MPa}$$` },
    { key: 'Anet', kind: 'numeric', unit: 'mm²', label: 'Section nette au droit du trou', hint: 'b × (h − d_trou)', answer: (p) => p.b * (p.h - p.dTrou),
      explain: (p, v) => r`$A_{net} = ${p.b}\times(${p.h} - ${p.dTrou}) = ${t(n(v, 'Anet'), 0)}$ mm²` },
    { key: 'sig', kind: 'numeric', unit: 'MPa', label: r`$\sigma_{t,0,d}$`, hint: 'N / A_net (N en N)', answer: (p, v) => (p.N * 1000) / n(v, 'Anet'),
      explain: (p, v) => r`$\sigma = ${t(p.N * 1000, 0)}/${t(n(v, 'Anet'), 0)} = ${t(n(v, 'sig'), 3)}$ MPa` },
    { key: 'eta', kind: 'numeric', unit: '%', label: 'Taux de travail', hint: 'σ / f_t,0,d', answer: (_p, v) => (n(v, 'sig') / n(v, 'ftd')) * 100,
      explain: (_p, v) => r`$\eta = ${t(n(v, 'sig'), 3)}/${t(n(v, 'ftd'))} = ${t(n(v, 'eta'), 0)}\ \%$` },
  ],
  conclusion: (_p, v) => r`**Conclusion type** : $\sigma_{t,0,d} = ${t(n(v, 'sig'), 2)} ${n(v, 'eta') <= 100 ? '\\le' : '>'} f_{t,0,d} = ${t(n(v, 'ftd'))}$ MPa (taux ${t(n(v, 'eta'), 0)} %) : ${n(v, 'eta') <= 100 ? 'le tirant est vérifié' : 'le tirant n’est pas vérifié'}. (Corrigé TD : 13 %, il divise par 13,3 au lieu de 13,18.)`,
  source: [TD(43), TD(44), MEMO(4)],
};

// =====================================================================
// B4 — Flexion déviée bois
// =====================================================================
type B4 = { wood: string; b: number; h: number; L: number; pz: number; py: number; cs: 1 | 2 | 3; duree: string };
export const B4_DEVIEE: Generator<B4> = {
  id: 'b4-flexion-deviee-bois',
  code: 'B4',
  title: 'Panne bois en flexion déviée',
  group: 'Bois',
  themeIds: ['bois-elu'],
  level: 3,
  description: 'Moments sur les deux axes, contraintes σ_m,y,d et σ_m,z,d, double critère avec k_m = 0,7.',
  params: (rand) => ({ wood: pick(['GL24h', 'GL28h', 'C24'], rand), b: pick([100, 115, 120], rand), h: pick([200, 240, 280], rand), L: step(3, 5, 0.5, rand), pz: step(1.5, 4, 0.05, rand), py: step(0.3, 1.2, 0.05, rand), cs: 2, duree: 'court terme' }),
  official: [{ label: 'TD garage (GL24h 120 × 280 sur 8 m)', params: { wood: 'GL24h', b: 120, h: 280, L: 8, pz: 3.48, py: 0.93, cs: 2, duree: 'court terme' } }],
  statement: (p) => r`Panne **${p.wood}** $${p.b}\times${p.h}$ mm, portée $L = ${t(p.L)}$ m, CS${p.cs}, action la plus courte : ${p.duree}. Charges ELU : $p_z = ${t(p.pz)}$ kN/ml (⊥ versant) et $p_y = ${t(p.py)}$ kN/ml (// versant). Vérifie la flexion déviée ($k_m = 0{,}7$).`,
  data: (p) => [woodBlock([p.wood]), KMOD, { kind: 'formula', latex: r`\frac{\sigma_{m,y,d}}{f_{m,d}} + k_m\frac{\sigma_{m,z,d}}{f_{m,d}} \le 1\quad k_m\frac{\sigma_{m,y,d}}{f_{m,d}} + \frac{\sigma_{m,z,d}}{f_{m,d}} \le 1` }],
  steps: [
    { key: 'kmod', kind: 'numeric', unit: '', label: r`$k_{mod}$`, hint: 'CS + durée', tol: 0, answer: (p) => kmodOf(p.cs, p.duree), explain: (p, v) => r`CS${p.cs}, ${p.duree} → ${t(n(v, 'kmod'))}` },
    { key: 'fmd', kind: 'numeric', unit: 'MPa', label: r`$f_{m,d}$ (k_h avec h = plus grande dimension)`, hint: r`$f_{m,k}k_{mod}k_h/\gamma_M$`,
      answer: (p, v) => (wood(p.wood).fm * n(v, 'kmod') * kh(wood(p.wood).kind, Math.max(p.b, p.h))) / gammaOf(p.wood),
      explain: (p, v) => r`$k_h = ${t(kh(wood(p.wood).kind, Math.max(p.b, p.h)), 3)}$ ; $f_{m,d} = ${wood(p.wood).fm}\times${t(n(v, 'kmod'))}\times${t(kh(wood(p.wood).kind, Math.max(p.b, p.h)), 3)}/${t(gammaOf(p.wood))} = ${t(n(v, 'fmd'))}$ MPa` },
    { key: 'My', kind: 'numeric', unit: 'kN·m', label: r`$M_y$`, hint: r`$p_zL^2/8$`, answer: (p) => (p.pz * p.L ** 2) / 8, explain: (p, v) => r`$${t(p.pz)}\times${t(p.L)}^2/8 = ${t(n(v, 'My'))}$ kN·m` },
    { key: 'Mz', kind: 'numeric', unit: 'kN·m', label: r`$M_z$`, hint: r`$p_yL^2/8$`, answer: (p) => (p.py * p.L ** 2) / 8, explain: (p, v) => r`$${t(p.py)}\times${t(p.L)}^2/8 = ${t(n(v, 'Mz'))}$ kN·m` },
    { key: 'sy', kind: 'numeric', unit: 'MPa', label: r`$\sigma_{m,y,d}$`, hint: r`$6M_y/(bh^2)$`, answer: (p, v) => (6 * n(v, 'My') * 1e6) / (p.b * p.h ** 2),
      explain: (p, v) => r`$6\times${t(n(v, 'My'))}\times10^6/(${p.b}\times${p.h}^2) = ${t(n(v, 'sy'))}$ MPa` },
    { key: 'sz', kind: 'numeric', unit: 'MPa', label: r`$\sigma_{m,z,d}$`, hint: r`$6M_z/(hb^2)$ : on inverse b et h`, answer: (p, v) => (6 * n(v, 'Mz') * 1e6) / (p.h * p.b ** 2),
      explain: (p, v) => r`$6\times${t(n(v, 'Mz'))}\times10^6/(${p.h}\times${p.b}^2) = ${t(n(v, 'sz'))}$ MPa` },
    { key: 'c1', kind: 'numeric', unit: '', label: r`Critère 1 : $\sigma_y/f + 0{,}7\,\sigma_z/f$`, hint: 'k_m sur le terme z', answer: (_p, v) => (n(v, 'sy') + 0.7 * n(v, 'sz')) / n(v, 'fmd'),
      explain: (_p, v) => r`$(${t(n(v, 'sy'))} + 0{,}7\times${t(n(v, 'sz'))})/${t(n(v, 'fmd'))} = ${t(n(v, 'c1'), 2)}$` },
    { key: 'c2', kind: 'numeric', unit: '', label: r`Critère 2 : $0{,}7\,\sigma_y/f + \sigma_z/f$`, hint: 'k_m sur le terme y', answer: (_p, v) => (0.7 * n(v, 'sy') + n(v, 'sz')) / n(v, 'fmd'),
      explain: (_p, v) => r`$(0{,}7\times${t(n(v, 'sy'))} + ${t(n(v, 'sz'))})/${t(n(v, 'fmd'))} = ${t(n(v, 'c2'), 2)}$` },
    { key: 'ccl', kind: 'choice', label: 'Conclusion', hint: 'Les deux critères ≤ 1 ?', choices: () => [{ id: 'ok', text: 'Vérifié' }, { id: 'ko', text: 'Non vérifié' }],
      answer: (_p, v) => (n(v, 'c1') <= 1 && n(v, 'c2') <= 1 ? 'ok' : 'ko'), explain: (_p, v) => `Critères : ${f(n(v, 'c1'), 2)} et ${f(n(v, 'c2'), 2)}.` },
  ],
  conclusion: (p, v) => r`**Conclusion type** : critères ${t(n(v, 'c1') * 100, 0)} % et ${t(n(v, 'c2') * 100, 0)} % → ${s(v, 'ccl') === 'ok' ? 'la panne est vérifiée en flexion déviée' : `non vérifiée${p.L >= 8 ? ' : le TD ajoute un appui intermédiaire (2 pannes de 4 m)' : ' : augmenter la section ou ajouter des liernes'}`}.`,
  source: [TD(32), TD(33), TD(34)],
};

export const BOIS_GENERATORS = [B1_SOLIVE, B2_COMBI, B3_TIRANT, B4_DEVIEE];
