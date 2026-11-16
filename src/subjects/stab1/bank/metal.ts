import { Bank, COURS, POLY, MEMO, PARTIEL, TD, r, t, round } from './helpers';
import { IPE, HEA, HEB, catalogueBlock, FLECHES_LIMITES, IPE_PARTIEL, CORNIERES, E_STEEL } from '../formulaire/tables';
import type { DataBlock } from '@/lib/types';

const prof = (n: string) => [...IPE, ...HEA, ...HEB].find((p) => p.name === n)!;
const MPL: DataBlock = { kind: 'formula', latex: r`M_{pl,Rd} = \frac{W_{pl,y}\,f_y}{\gamma_{M0}} \qquad f_y = 235\ \text{MPa},\ \gamma_{M0} = 1{,}00` };
const VPL: DataBlock = { kind: 'formula', latex: r`V_{pl,Rd} = A_{vz}\,\frac{f_y/\sqrt3}{\gamma_{M0}}` };
const NUR: DataBlock = { kind: 'formula', latex: r`N_{pl,Rd} = \frac{A f_y}{\gamma_{M0}} \qquad N_{u,Rd} = 0{,}9\,\frac{A_{net} f_u}{\gamma_{M2}},\ \gamma_{M2} = 1{,}25` };
const FLECHE: DataBlock = { kind: 'formula', latex: r`w = \frac{5\,p\,L^4}{384\,E\,I_y} \qquad E = 210\,000\ \text{MPa}` };
const PARTIEL_CAT: DataBlock = {
  kind: 'table',
  title: 'Catalogue IPE donné au partiel 2023 (S235, classe 1)',
  columns: ['Profilé', 'A (cm²)', 'I_y (cm⁴)', 'W_el,y (cm³)', 'W_pl,y (cm³)', 'A_vz (cm²)'],
  rows: IPE_PARTIEL.map((p) => [p.name, p.A, p.Iy, p.Wely, p.Wply, p.Avz]),
};

// =====================================================================
// 6. Métal – matériau & profilés
// =====================================================================
const mat = new Bank('metal-materiau');
mat
  .single(1, 'L’acier est un alliage de fer et de carbone. Quelle est la teneur en carbone (en masse) ?', ['moins de 0,008 %', '*entre 0,02 % et 2 %', 'entre 2,1 % et 5 %', 'environ 10 %'],
    r`Poly p.3 : l'acier contient du fer (très majoritaire) et **0,02 % à 2 %** de carbone. En dessous de 0,008 %, on parle de « fer » (malléable) ; au-delà de 2,1 %, de **fonte**. Plus il y a de carbone, plus l'acier est dur et moins il est ductile (aciers doux → extra-durs).`,
    { src: [POLY(3)], exam: true, hints: { c: 'Au-delà de 2,1 % de carbone, c’est de la fonte.' } })
  .single(1, 'Un alliage fer-carbone contenant plus de 2,1 % de carbone s’appelle…', ['un acier extra-dur', '*une fonte', 'un acier inoxydable', 'du fer pur'],
    r`Au-delà de 2,1 % de carbone, « la température de fusion et les propriétés mécaniques de l'alliage sont très modifiées et l'on parle de **fonte** » (poly p.3). La fonte est fragile, peu ductile : elle n'est pas utilisée pour les profilés de charpente.`,
    { src: [POLY(3)], exam: true })
  .single(1, 'Quelle proportion de la charpente métallique et des bardages est recyclée ?', ['50 %', '75 %', '*95 %', '100 %'],
    r`Poly p.4 : grâce à la filière ferraille, **95 %** de la structure métallique et des bardages sont recyclés, contre 50 % des armatures du béton armé. Le recyclage (démolition, déconstruction) fait partie des atouts environnementaux de la construction métallique.`,
    { src: [POLY(4)], exam: true })
  .multi(1, 'Coche les **inconvénients** de l’acier cités dans le poly.', ['*Grande énergie de fabrication', '*Mauvaise résistance à la corrosion', '*Mauvaise tenue au feu', 'Faible ductilité', 'Impossible à recycler'],
    r`Poly p.4 : inconvénients = **énergie de fabrication**, **corrosion** (remède : peinture, galvanisation, inox) et **feu** (perte de résistance, remède : flocage, peintures intumescentes). La ductilité est au contraire un atout, et l'acier est recyclable à 95 %.`,
    { src: [POLY(4)], exam: true })
  .single(1, 'Limite d’élasticité $f_y$ d’un acier **S235** (épaisseur ≤ 40 mm) ?', ['*235 MPa', '275 MPa', '360 MPa', '510 MPa'],
    r`La désignation « S235 » donne directement la **limite d'élasticité** $f_y = 235$ MPa pour la gamme d'épaisseur la plus faible (t ≤ 40 mm). Sa résistance à la traction vaut $f_u = 360$ MPa (poly p.44 ; mémo p.1). Au-delà de 40 mm, $f_y$ tombe à 215 MPa.`,
    { src: [POLY(44), MEMO(1)], exam: true, hints: { c: '360 MPa est f_u (rupture), pas f_y.' } })
  .single(1, 'Résistance à la traction $f_u$ d’un acier **S235** ?', ['235 MPa', '*360 MPa', '430 MPa', '490 MPa'],
    r`Tableau 10.1 du poly : S235 → $f_y = 235$, $f_u = 360$ MPa ; S275 → 275 / 430 ; S355 → 355 / 490 ; S450 → 440 / 550. $f_u$ intervient au droit des trous : $N_{u,Rd} = 0{,}9\,A_{net}\,f_u/\gamma_{M2}$.`,
    { src: [POLY(44), MEMO(1)], exam: true })
  .single(2, 'Limite d’élasticité d’un acier **S355** pour une épaisseur de **50 mm** ?', ['355 MPa', '*335 MPa', '315 MPa', '490 MPa'],
    r`Pour $40 < t \le 80$ mm, les valeurs baissent : S235 → 215 ; S275 → 255 ; **S355 → 335** ; S450 → 410 MPa (poly p.44, mémo p.1). Le chiffre de la nuance correspond à la gamme d'épaisseur **la plus faible**.`,
    { src: [POLY(44), MEMO(1)] })
  .num(1, 'Module d’élasticité longitudinal $E$ de l’acier (en MPa) ?', 210000, 'MPa',
    r`Poly p.44 : $E = 210\,000$ MPa ; coefficient de Poisson ν = 0,3 ; masse volumique 7850 kg/m³ ; dilatation $1{,}2\cdot10^{-5}$ K⁻¹. E sert au calcul des flèches $w = 5pL^4/384EI$ (attention aux unités : N et mm → MPa).`,
    { src: [POLY(44)], exam: true, tol: 1 })
  .single(1, 'Quelle caractéristique géométrique sert au calcul de la **flèche** ?', ['l’aire A', '*le moment d’inertie I', 'le module élastique W_el', 'le module plastique W_pl'],
    r`Table 1.1 du poly : **A** (cm²) → traction/compression ; **I** (cm⁴) → **flexion, calcul de la déformation (flèche)** ; $W_{el}$ (cm³) → résistance élastique ; $W_{pl}$ (cm³) → résistance plastique. On travaille avec $I_y$ (axe fort).`,
    { src: [POLY(6)], exam: true })
  .single(1, 'Sur un profilé en I, l’axe **y-y** est…', ['*parallèle aux semelles (axe fort)', 'perpendiculaire aux semelles (axe faible)', 'l’axe longitudinal de la barre', 'la diagonale de la section'],
    r`Poly p.6 (figure 1.3) : l'axe **y-y est parallèle aux semelles** (forte inertie, la panne fléchit « normalement » autour de lui) ; l'axe z-z est perpendiculaire aux semelles (faible inertie). L'axe x est l'axe longitudinal de la barre.`,
    { src: [POLY(6)], exam: true })
  .single(2, 'Pour une section de **classe 1 ou 2**, le moment résistant se calcule avec…', ['*le module plastique $W_{pl}$', 'le module élastique $W_{el}$', 'le moment d’inertie $I$', 'l’aire $A$'],
    r`Poly p.19 : classe 1 ou 2 → $M_{pl,Rd} = W_{pl} f_y/\gamma_{M0}$ (la section peut se plastifier entièrement) ; classe 3 → $M_{el,Rd} = W_{el} f_y/\gamma_{M0}$ (voilement local avant plastification). Les IPE en S235 sont de classe 1 en flexion.`,
    { src: [POLY(19), MEMO(2)], exam: true, hints: { b: 'W_el sert pour les sections de classe 3.' } })
  .single(2, 'La **ductilité** d’un acier est caractérisée par…', ['sa limite d’élasticité', '*son allongement à la rupture', 'son module d’Young', 'sa masse volumique'],
    r`Poly p.5 : « L'**allongement à la rupture** caractérise la ductilité de l'acier, qualité que l'on recherche dans les aciers de construction afin d'éviter les ruptures fragiles. » $A = (L_R - L_0)/L_0$, mesuré à l'essai de traction.`,
    { src: [POLY(5)] })
  .single(1, 'Comment améliore-t-on la tenue au feu d’une charpente métallique ?', ['par galvanisation', '*par flocage ou peinture intumescente', 'en augmentant la teneur en carbone', 'en utilisant de la fonte'],
    r`Poly p.4 : la mauvaise résistance au feu (perte de résistance mécanique) se compense par des **flocages** ou des **peintures intumescentes**. La galvanisation et la peinture classique protègent contre la **corrosion**. La construction mixte améliore aussi la tenue au feu (p.28).`,
    { src: [POLY(4)], exam: true, hints: { a: 'La galvanisation protège de la corrosion, pas du feu.' } })
  .num(2, r`Calcule $\varepsilon = \sqrt{235/f_y}$ pour un acier S355.`, 0.81, '',
    r`$$\varepsilon = \sqrt{\frac{235}{355}} = \sqrt{0{,}662} = 0{,}814 \approx 0{,}81$$
ε sert aux limites d'élancement de la classification (ex. âme fléchie classe 1 : $c/t \le 72\varepsilon$). Plus l'acier est résistant, plus ε est petit et plus les parois doivent être épaisses pour rester en classe 1 (poly p.20).`,
    { src: [POLY(20)], tol: 1.5 })
  .num(2, 'Module de cisaillement de l’acier $G = E/(2(1+\\nu))$ avec $E = 210\\,000$ MPa et $\\nu = 0{,}3$ ?', 80769, 'MPa',
    r`$$G = \frac{210\,000}{2\times1{,}3} = 80\,769\ \text{MPa} \approx 81\ \text{GPa}$$
(poly p.44). G intervient dans les calculs de torsion et de déversement (non traités en STAB 1).`,
    { src: [POLY(44)], tol: 1 })
  .single(2, 'Que signifie la désignation **S235** ?', [
    '*acier de construction (S) de limite d’élasticité minimale 235 MPa (faibles épaisseurs)',
    'acier inoxydable à 23,5 % de chrome',
    'acier de résistance à la rupture 235 MPa',
    'acier soudable de 235 mm d’épaisseur maximale',
  ], r`Poly p.44 : « Les aciers sont désignés par une lettre (S pour les aciers de construction) et un nombre, la **limite d'élasticité** pour la gamme d'épaisseur la plus faible. » S235 : $f_y = 235$ MPa, $f_u = 360$ MPa pour t ≤ 40 mm.`,
    { src: [POLY(44)], exam: true });
// Lecture du catalogue
for (const [name, key, label, unit] of [
  ['IPE 200', 'Wply', r`W_{pl,y}`, 'cm³'],
  ['HEA 200', 'Iy', r`I_y`, 'cm⁴'],
  ['IPE 160', 'Avz', r`A_{vz}`, 'cm²'],
  ['HEB 200', 'A', r`A`, 'cm²'],
] as const) {
  const p = prof(name);
  const list = name.startsWith('IPE') ? ['IPE 140', 'IPE 160', 'IPE 180', 'IPE 200', 'IPE 220'] : ['HEA 180', 'HEA 200', 'HEB 180', 'HEB 200'];
  mat.num(1, r`Lis dans le catalogue la valeur de $${label}$ du **${name}**.`, p[key], unit,
    r`Lecture directe : ${name} → $${label} = ${t(p[key], 2)}$ ${unit}. Piège de lecture : ne pas confondre la ligne (profilé) ni la colonne (W_el / W_pl, axe y / axe z). Dans le poly, les valeurs statiques sont sur la page qui suit celle des dimensions, avec des unités multipliées (×10⁴ mm⁴ = cm⁴, ×10³ mm³ = cm³, ×10² mm² = cm²).`,
    { src: [POLY(name.startsWith('IPE') ? 39 : 31)], data: [catalogueBlock(list, ['A', 'Iy', 'Wely', 'Wply', 'Avz'])], tol: 1 });
}

// =====================================================================
// 7. Métal – ELU
// =====================================================================
const elu = new Bank('metal-elu');
const mpl = (n: string) => (prof(n).Wply * 235) / 1000; // kN·m
const vpl = (n: string) => (prof(n).Avz * 100 * 235) / Math.sqrt(3) / 1000; // kN
elu
  .num(2, r`Une panne IPE 120 en S235 (classe 1) reprend $V_{Ed} = 8{,}4$ kN. Calcule $V_{pl,Rd}$.`, 85.6, 'kN',
    r`$$V_{pl,Rd} = 6{,}31\times10^{2}\ \text{mm}^2 \times \frac{235/\sqrt3}{1{,}00} = 85\,600\ \text{N} = 85{,}6\ \text{kN}$$
On vérifie $V_{Ed} = 8{,}4 \le 85{,}6$ kN (taux 10 %) et $V_{Ed} \le 0{,}5\,V_{pl,Rd} = 42{,}8$ kN : on ne tient pas compte de l'effort tranchant dans le moment résistant.

**Erreurs fréquentes** : oublier le $\sqrt3$ (→ 148 kN), laisser $A_{vz}$ en cm² (→ 0,86 kN), prendre l'aire totale $A$ au lieu de $A_{vz}$ (→ 179 kN).`,
    { id: 'stab1-metal-elu-012', src: [POLY(23), PARTIEL(1)], tags: ['partiel-2023'], exam: true,
      data: [{ kind: 'table', title: 'Extrait catalogue IPE (partiel 2023)', columns: ['Profilé', 'A (cm²)', 'A_vz (cm²)'], rows: [['IPE 120', 13.2, 6.31]] }, VPL] })
  .order(2, 'Remets dans l’ordre la démarche de dimensionnement d’une panne IPE en flexion simple (méthode du TD garage).', [
    r`Calculer la charge ELU linéique $p_u$ (combinaison la plus défavorable × entraxe)`,
    r`Calculer $M_{Ed} = p_u L^2/8$`,
    r`En déduire $W_{pl,y} \ge M_{Ed}\,\gamma_{M0}/f_y$`,
    'Choisir le plus petit IPE (classe 1) qui convient dans le catalogue',
    r`Vérifier le tranchant : $V_{Ed} \le V_{pl,Rd}$ et $V_{Ed} \le 0{,}5\,V_{pl,Rd}$`,
    r`Vérifier les flèches à l'ELS ($w_{max}$ et $w_3$)`,
  ], r`On part toujours des **charges** : combinaisons d'actions, charge linéique = charge surfacique × entraxe (× cos α pour la neige). Puis **sollicitation** $M_{Ed}$, **module nécessaire** $W_{pl,y}$, **choix du profilé** dans le catalogue (le plus petit qui convient, IPE = classe 1). On vérifie ensuite les autres critères ELU avec le profilé choisi (tranchant, et l'interaction M-V si $V_{Ed} > 0{,}5 V_{pl,Rd}$), puis l'**ELS** (flèches avec $I_y$ du profilé).

Dans le TD garage : $p_u = 3{,}94$ kN/ml → $M_{Ed} = 7{,}88$ kN·m → $W_{pl,y} \ge 32{,}9$ cm³ → IPE 100.`,
    { id: 'stab1-metal-elu-order-001', src: [TD(18), POLY(19)], tags: ['démarche'] })
  .num(2, r`Diagonale en cornière L50×5 ($A = 4{,}80$ cm²), acier S235. Calcule $N_{pl,Rd}$.`, 112.8, 'kN',
    r`$$N_{pl,Rd} = \frac{A f_y}{\gamma_{M0}} = \frac{480\ \text{mm}^2\times235}{1{,}00} = 112\,800\ \text{N} = 112{,}8\ \text{kN}$$
C'est la résistance de la **section brute**. S'il y a des trous de boulons, il faut aussi vérifier $N_{u,Rd}$ sur la section nette (poly p.18).`,
    { src: [POLY(18), POLY(42)], data: [NUR, { kind: 'table', title: 'Cornière (poly p.42)', columns: ['Profil', 'A (cm²)'], rows: [['L50×5', CORNIERES.find((c) => c.name === 'L50x50x5')!.A]] }], exam: true })
  .num(2, r`Plat de $100\times10$ mm percé de **2 trous** de $d_0 = 18$ mm dans la même section. Calcule l'aire nette $A_{net}$.`, 6.4, 'cm²',
    r`Poly p.18 (rangées parallèles) : $A_{net} = b\,t - n\,d_0\,t$.
$$A_{net} = 100\times10 - 2\times18\times10 = 1000 - 360 = 640\ \text{mm}^2 = 6{,}40\ \text{cm}^2$$
On ne retire que les trous situés **dans une même section transversale**.`,
    { src: [POLY(18)] })
  .num(3, r`Même plat S235 ($A_{net} = 640$ mm², $f_u = 360$ MPa). Calcule $N_{u,Rd}$.`, round(0.9 * 640 * 360 / 1.25 / 1000, 1), 'kN',
    r`$$N_{u,Rd} = 0{,}9\,\frac{A_{net} f_u}{\gamma_{M2}} = 0{,}9\times\frac{640\times360}{1{,}25} = 165\,900\ \text{N} = 165{,}9\ \text{kN}$$
À comparer à $N_{pl,Rd} = 1000\times235 = 235$ kN (section brute) : ici c'est la section nette qui gouverne. γ_M2 = 1,25 (rupture), γ_M0 = 1,00 (plastification).`,
    { src: [POLY(18)], data: [NUR] })
  .num(2, r`TD garage : tirant en cornière **L20×3** ($A = 1{,}12$ cm²), S235. Calcule $N_{pl,Rd}$.`, 26.3, 'kN',
    r`$$N_{pl,Rd} = \frac{112\ \text{mm}^2\times235}{1{,}00} = 26\,320\ \text{N} = 26{,}3\ \text{kN} \ge N_{Ed} = 10{,}67\ \text{kN}$$
(corrigé TD p.26). La cornière L20×3 n'est pas dans le catalogue du poly : son aire est donnée dans le corrigé.`,
    { src: [TD(26)], data: [NUR] })
  .num(3, r`Même cornière L20×3 attachée par un boulon M8 (trou $d_0 = 9$ mm, épaisseur 3 mm, un seul trou dans la section). Calcule $N_{u,Rd}$ (S235, $f_u = 360$ MPa).`, 22.03, 'kN',
    r`$A_{net} = 1{,}12 - 0{,}9\times0{,}3 = 0{,}85$ cm² (on retire $d_0\,t$ pour **un seul** trou).
$$N_{u,Rd} = 0{,}9\times\frac{85\times360}{1{,}25} = 22\,030\ \text{N} = 22{,}03\ \text{kN} \ge 10{,}67\ \text{kN}$$
La cornière est validée en traction : $N_{Ed} \le N_{pl,Rd}$ et $N_{Ed} \le N_{u,Rd}$ (corrigé p.28).`,
    { src: [TD(28)], data: [NUR] })
  .num(2, r`Partiel 2023 : $M_{Ed} = 11{,}6$ kN·m, IPE en S235. Calcule le module plastique **minimal** $W_{pl,y}$.`, 49.4, 'cm³',
    r`$$W_{pl,y} \ge \frac{M_{Ed}\,\gamma_{M0}}{f_y} = \frac{11{,}6\times10^6\ \text{N·mm}}{235} = 49\,362\ \text{mm}^3 = 49{,}4\ \text{cm}^3$$
Conversion clé : 1 kN·m = $10^6$ N·mm et 1 cm³ = $10^3$ mm³.`,
    { src: [PARTIEL(1), POLY(19)], tags: ['partiel-2023'], exam: true, data: [MPL] })
  .single(2, r`Partiel 2023 : il faut $W_{pl,y} \ge 49{,}4$ cm³. Quel est le plus petit IPE qui convient ?`, ['IPE 100', '*IPE 120', 'IPE 140', 'IPE 160'],
    r`Catalogue du partiel : IPE 100 → $W_{pl,y} = 39{,}41$ cm³ < 49,4 ✗ ; **IPE 120 → 60,73 cm³ ≥ 49,4 ✓**. Alors $M_{pl,Rd} = 60{,}73\times235/1000 = 14{,}27$ kN·m et $\eta = 11{,}6/14{,}27 = 81\ \%$. Attention : il faudra aussi vérifier la flèche, qui peut imposer un profilé plus grand.`,
    { src: [PARTIEL(1)], tags: ['partiel-2023'], exam: true, data: [PARTIEL_CAT], hints: { a: 'W_pl,y = 39,41 cm³ < 49,4 cm³.' } })
  .num(2, 'Calcule le taux de travail en flexion de l’IPE 120 du partiel : $M_{Ed} = 11{,}6$ kN·m, $M_{pl,Rd} = 14{,}27$ kN·m.', 81.3, '%',
    r`$$\eta = \frac{M_{Ed}}{M_{pl,Rd}} = \frac{11{,}6}{14{,}27} = 0{,}813 = 81\ \%$$
η ≤ 100 % → **le profilé convient** vis-à-vis du moment fléchissant. Une conclusion rédigée attendue au partiel : « M_Ed ≤ M_pl,Rd, l'IPE 120 est vérifié en flexion (taux de travail 81 %) ».`,
    { src: [PARTIEL(1)], tags: ['partiel-2023'], tol: 1.5 })
  .num(3, r`TD garage, IPE 100 : $M_{Ed,y} = 7{,}88$ ; $M_{pl,Rd,y} = 9{,}26$ ; $M_{Ed,z} = 1{,}80$ ; $M_{pl,Rd,z} = 2{,}16$ kN·m ; $N_{Ed} = 0$. Calcule le critère de flexion déviée.`, 1.557, '',
    r`Section en I, $n = 0$ → $M_{N,Rd} = M_{pl,Rd}$ et $\alpha = 2$, $\beta = 5n$ avec $\beta \ge 1$ → $\beta = 1$.
$$\left(\frac{7{,}88}{9{,}26}\right)^2 + \left(\frac{1{,}80}{2{,}16}\right)^1 = 0{,}72 + 0{,}83 = 1{,}55 > 1$$
**Non vérifié** → on passe à l'IPE 120 : $(7{,}88/14{,}26)^2 + 1{,}80/3{,}20 = 0{,}31 + 0{,}56 = 0{,}87 \le 1$ → OK.
⚠️ Le corrigé écrit « 0,31 + 0,43 = 0,74 » : $1{,}80/3{,}20$ vaut 0,56, pas 0,43. La conclusion (IPE 120 vérifié) reste juste.`,
    { src: [TD(20), POLY(24)], tol: 1.5,
      data: [{ kind: 'formula', title: 'Flexion biaxiale (poly p.24)', latex: r`\left(\frac{M_{y,Ed}}{M_{N,y,Rd}}\right)^{\alpha} + \left(\frac{M_{z,Ed}}{M_{N,z,Rd}}\right)^{\beta} \le 1 \quad\text{I : } \alpha = 2,\ \beta = 5n \ge 1` }] })
  .single(2, 'Flexion déviée d’un profilé en I **sans effort normal** : valeurs de $\\alpha$ et $\\beta$ ?', [r`$\alpha = \beta = 1$`, r`*$\alpha = 2$, $\beta = 1$`, r`$\alpha = \beta = 2$`, r`$\alpha = 1$, $\beta = 2$`],
    r`Table 5.7 du poly (I ou H laminés) : $\alpha = 2$ et $\beta = 5n$ avec $\beta \ge 1$. Sans effort normal, $n = N_{Ed}/N_{pl,Rd} = 0$ → $\beta = 1$ (borne). Le critère devient $(M_y/M_{pl,y})^2 + M_z/M_{pl,z} \le 1$ (TD garage p.20). Pour les tubes circulaires, $\alpha = \beta = 2$.`,
    { src: [POLY(24), TD(20)], exam: true })
  .tf(1, r`Si $V_{Ed} \le 0{,}5\,V_{pl,Rd}$, on ne tient pas compte de l'effort tranchant dans le calcul du moment résistant.`, true,
    r`**Vrai.** Poly p.23 : « Le moment résistant plastique d'une section est réduit par la présence de cisaillement. Toutefois, si $V_{Ed} \le 0{,}5\,V_{pl,Rd}$ on ne tient pas compte de son action. » C'est le cas presque toujours pour les pannes (partiel : 8,4 kN ≪ 42,8 kN).`,
    { src: [POLY(23)], exam: true })
  .single(2, 'Un profilé a une âme de **classe 2** et des semelles de **classe 1**. Quelle est sa classe ?', ['classe 1', '*classe 2', 'classe 3', 'on ne peut pas conclure'],
    r`Poly p.21 : « La classe du profilé est donnée par le **maximum** de la classe de l'âme ou de la semelle. » Âme classe 2 + semelle classe 1 → **profilé de classe 2** → on peut encore utiliser $W_{pl}$ ($M_{pl,Rd}$). C'est la paroi la plus élancée qui gouverne le risque de voilement local.`,
    { src: [POLY(21)], exam: true })
  .single(1, 'Pour une section de **classe 3**, le moment résistant vaut…', [r`$W_{pl}\,f_y/\gamma_{M0}$`, r`*$W_{el}\,f_y/\gamma_{M0}$`, r`$I\,f_y/\gamma_{M0}$`, r`$A\,f_y/\gamma_{M0}$`],
    r`Classe 3 : la fibre extrême atteint $f_y$ mais le voilement local empêche la plastification complète → $M_{el,Rd} = W_{el} f_y/\gamma_{M0}$ (poly p.19, mémo p.2). Les classes 1 et 2 utilisent $W_{pl}$ ; la classe 4 (sections minces) n'est pas traitée en STAB 1.`,
    { src: [POLY(19), MEMO(2)], exam: true })
  .num(2, r`Poteau court (massif, sans flambement) en **HEA 100**, acier **S275**. Calcule $N_{pl,Rd}$ en compression.`, round(prof('HEA 100').A * 100 * 275 / 1000, 1), 'kN',
    r`Poly p.19 : pièce massive → $N_{pl,Rd} = A f_y/\gamma_{M0}$ (flambement négligé).
$$N_{pl,Rd} = 21{,}2\times10^2\times275 = 583\,000\ \text{N} = 583\ \text{kN}$$
Pièce « massive » = longueur inférieure à 6 fois sa plus petite dimension ; sinon il faut un calcul au flambement (hors programme).`,
    { src: [POLY(19)], data: [catalogueBlock(['HEA 100', 'HEA 120'], ['A', 'Iy'])] })
  .single(2, 'À quoi sert le coefficient $\\gamma_{M2} = 1{,}25$ ?', ['à la résistance des sections brutes', '*à la résistance à la rupture des sections nettes (trous)', 'aux instabilités (flambement)', 'aux flèches'],
    r`Poly p.44 : $\gamma_{M0} = 1{,}00$ (résistance des sections), $\gamma_{M1} = 1{,}00$ (instabilités), **$\gamma_{M2} = 1{,}25$ (rupture des sections transversales, au droit des trous)** → $N_{u,Rd} = 0{,}9 A_{net} f_u/\gamma_{M2}$.`,
    { src: [POLY(44), POLY(18)], exam: true })
  .num(3, r`IPE 100 : $A = 10{,}3$ cm², $b = 55$ mm, $t_f = 5{,}7$ mm. Calcule $a = (A - 2\,b\,t_f)/A$ (table 5.7).`, 0.391, '',
    r`$$a = \frac{1030 - 2\times55\times5{,}7}{1030} = \frac{1030 - 627}{1030} = 0{,}391$$
a représente la part d'âme dans la section. Avec $n = 0$ : $n \le 0{,}5a$ et $n \le 0{,}25$ → $M_{N,y,Rd} = M_{pl,y,Rd}$ ; $n \le a$ → $M_{N,z,Rd} = M_{pl,z,Rd}$ (TD garage p.20).`,
    { src: [TD(20), POLY(24)], tol: 1.5 })
  .order(3, 'Remets dans l’ordre la vérification d’un tirant boulonné (TD garage).', [
    'Calculer l’effort ELU dans le tirant (1,5 × effort du vent, projection selon l’angle)',
    r`En déduire l'aire minimale $A \ge N_{Ed}\,\gamma_{M0}/f_y$`,
    'Choisir une section commerciale (rond, cornière)',
    r`Vérifier $N_{Ed} \le N_{pl,Rd}$ (section brute)`,
    r`Calculer $A_{net}$ au droit du trou`,
    r`Vérifier $N_{Ed} \le N_{u,Rd} = 0{,}9 A_{net} f_u/\gamma_{M2}$`,
  ], r`Corrigé TD p.25-28 : $F = 1{,}5\times4{,}44 = 6{,}65$ kN → $N_{Ed} = 6{,}65/\sin38{,}56° = 10{,}67$ kN → $A \ge 0{,}454$ cm² → L20×3 → $N_{pl,Rd} = 26{,}3$ kN → $A_{net} = 0{,}85$ cm² → $N_{u,Rd} = 22{,}03$ kN : vérifié.`,
    { src: [TD(25), TD(26), TD(28)] });
for (const n of ['IPE 160', 'IPE 200', 'HEA 160']) {
  const p = prof(n);
  elu.num(2, r`Calcule le moment résistant plastique $M_{pl,Rd,y}$ d'un **${n}** en S235 (classe 1).`, round(mpl(n), 2), 'kN·m',
    r`$$M_{pl,Rd} = \frac{W_{pl,y} f_y}{\gamma_{M0}} = \frac{${t(p.Wply, 1)}\times10^3\ \text{mm}^3\times235}{1{,}00} = ${t(mpl(n), 2)}\ \text{kN·m}$$
Conversion : cm³ × 10³ = mm³ ; N·mm ÷ 10⁶ = kN·m. Erreur fréquente : prendre $W_{el,y}$ (= ${t(p.Wely, 1)}$ cm³) au lieu de $W_{pl,y}$ pour une section de classe 1.`,
    { src: [POLY(19), POLY(name2page(n))], data: [catalogueBlock([n], ['Wely', 'Wply', 'Avz']), MPL], exam: n === 'IPE 160' });
}
for (const n of ['IPE 200', 'HEB 160']) {
  const p = prof(n);
  elu.num(2, r`Calcule la résistance au cisaillement $V_{pl,Rd}$ d'un **${n}** en S235.`, round(vpl(n), 1), 'kN',
    r`$$V_{pl,Rd} = A_{vz}\,\frac{f_y/\sqrt3}{\gamma_{M0}} = ${t(p.Avz * 100, 0)}\ \text{mm}^2\times\frac{235}{\sqrt3} = ${t(vpl(n), 1)}\ \text{kN}$$
$A_{vz}$ (aire de cisaillement) se lit dans le catalogue ; à défaut, $A_v = A - 2bt_f + (t_w + 2r)t_f$ pour un I ou H laminé (table 5.6).`,
    { src: [POLY(23), POLY(name2page(n))], data: [catalogueBlock([n], ['A', 'Avz']), VPL] });
}

function name2page(n: string) {
  return n.startsWith('IPE') ? 39 : 31;
}

// =====================================================================
// 8. Métal – ELS
// =====================================================================
const els = new Bank('metal-els');
const w = (p: number, L: number, I: number) => (5 * p * L ** 4) / (384 * E_STEEL * I * 1e4); // p N/mm, L mm, I cm⁴ → mm
els
  .single(1, 'Partiel 2023 : quel chargement doit-on considérer pour le calcul de la **flèche** ?', ['*ELS : G + Q = 2,1 kN/ml', 'ELU : 1,35G + 1,5Q = 3,1 kN/ml'],
    r`Les flèches sont un critère de **service** : on les calcule avec les charges **non pondérées** (combinaison caractéristique $G + Q$). Les coefficients 1,35 et 1,5 sont réservés aux vérifications de résistance (ELU : moment, tranchant). C'est la première question du partiel métal.`,
    { src: [PARTIEL(1), POLY(13)], tags: ['partiel-2023'], exam: true })
  .single(1, 'Que désigne $w_3$ ?', ['la contre-flèche', 'la flèche sous charges permanentes', '*la flèche due aux actions variables', 'la flèche totale'],
    r`Poly p.13 : $w_c$ = contre-flèche ; $w_1$ = flèche sous charges permanentes ; $w_2$ = flèche à long terme sous permanentes ; **$w_3$ = flèche due aux actions variables** ; $w_{tot} = w_1 + w_2 + w_3$ ; $w_{max} = w_{tot} - w_c$.`,
    { src: [POLY(13), MEMO(5)], exam: true })
  .single(1, 'Limite de $w_{max}$ pour une **toiture en général** (accès pour entretien seulement) ?', ['L/150', '*L/200', 'L/250', 'L/300'],
    r`Table 4.1 (Annexe nationale) : toitures en général $w_{max} \le L/200$ et $w_3 \le L/250$. Une toiture « en général » est non accessible aux usagers, avec seulement le passage du personnel d'entretien.`,
    { src: [POLY(14), PARTIEL(2)], data: [FLECHES_LIMITES], exam: true })
  .single(1, 'Limite de $w_3$ pour une **toiture en général** ?', ['L/200', '*L/250', 'L/300', 'L/350'],
    r`Table 4.1 : toitures en général → $w_{max} = L/200$, **$w_3 = L/250$** ; planchers en général → L/200 et L/300 ; avec cloisons fragiles → L/250 et L/350 ; planchers supportant des poteaux → L/400 et L/500.`,
    { src: [POLY(14)], data: [FLECHES_LIMITES], exam: true })
  .num(1, 'Panne de toiture de portée $L = 5{,}50$ m : flèche limite $w_{max} = L/200$ ?', 27.5, 'mm',
    r`$$w_{lim} = \frac{L}{200} = \frac{5500\ \text{mm}}{200} = 27{,}5\ \text{mm}$$
et $w_{3,lim} = L/250 = 22$ mm. Travailler en mm évite les erreurs d'unités quand on compare à la flèche calculée.`,
    { src: [PARTIEL(2)], tags: ['partiel-2023'], exam: true })
  .num(2, r`Partiel 2023 : $p = G + Q = 2{,}1$ kN/ml, $L = 5{,}50$ m, $E = 210\,000$ MPa, $I_y = 1200$ cm⁴ (valeur imposée par l'énoncé). Calcule la flèche à mi-portée.`, round(w(2.1, 5500, 1200), 2), 'mm',
    r`Unités N et mm : $p = 2{,}1$ N/mm, $L = 5500$ mm, $I = 1200\times10^4$ mm⁴.
$$w = \frac{5\times2{,}1\times5500^4}{384\times210\,000\times1{,}2\times10^7} = ${t(w(2.1, 5500, 1200), 2)}\ \text{mm} \le 27{,}5\ \text{mm}$$
Vérifié avec l'inertie de l'énoncé. ⚠️ Mais aucun IPE du catalogue n'a $I_y = 1200$ cm⁴ (IPE 120 : 317,8) : voir la question suivante.`,
    { src: [PARTIEL(2)], tags: ['partiel-2023'], exam: true, data: [FLECHE, FLECHES_LIMITES] })
  .num(2, r`Partiel 2023 : flèche $w_3$ sous $Q = 1{,}4$ kN/ml seul ($L = 5{,}50$ m, $I_y = 1200$ cm⁴).`, round(w(1.4, 5500, 1200), 2), 'mm',
    r`$$w_3 = \frac{5\times1{,}4\times5500^4}{384\times210\,000\times1{,}2\times10^7} = ${t(w(1.4, 5500, 1200), 2)}\ \text{mm} \le L/250 = 22\ \text{mm}$$
$w_3$ ne prend que les actions **variables** (ici Q = 1,4 kN/ml), alors que $w_{max}$ prend G + Q.`,
    { src: [PARTIEL(2)], tags: ['partiel-2023'], data: [FLECHE, FLECHES_LIMITES] })
  .num(3, r`Partiel 2023 refait avec la **vraie** inertie de l'IPE 120 ($I_y = 317{,}8$ cm⁴) : flèche sous $G + Q = 2{,}1$ kN/ml, $L = 5{,}50$ m.`, round(w(2.1, 5500, 317.8), 1), 'mm',
    r`$$w = \frac{5\times2{,}1\times5500^4}{384\times210\,000\times317{,}8\times10^4} = ${t(w(2.1, 5500, 317.8), 1)}\ \text{mm} > 27{,}5\ \text{mm}$$
**Non vérifié** : l'énoncé imposait $I_y = 1200$ cm⁴, incohérent avec le catalogue. Avec l'IPE 120 réel, la flèche gouverne le dimensionnement (voir question suivante).`,
    { src: [PARTIEL(1), PARTIEL(2, 'I_y = 1200 cm⁴ incohérent avec le catalogue')], tags: ['partiel-2023', 'corrigé-faux'], data: [PARTIEL_CAT, FLECHE] })
  .single(3, r`Partiel 2023 avec les vraies inerties du catalogue ($L = 5{,}50$ m, $G + Q = 2{,}1$ kN/ml, $Q = 1{,}4$ kN/ml, toiture) : quel est le plus petit IPE qui vérifie **les deux** flèches ?`, ['IPE 120', '*IPE 140', 'IPE 160', 'IPE 180'],
    r`$w$ est inversement proportionnel à $I_y$ : $w = 9{,}93\times1200/I_y$ et $w_3 = 6{,}62\times1200/I_y$.
- IPE 120 ($I_y = 317{,}8$) : $w = 37{,}5 > 27{,}5$ ✗
- **IPE 140** ($I_y = 541{,}2$) : $w = 22{,}0 \le 27{,}5$ ✓ et $w_3 = 14{,}7 \le 22$ ✓
L'IPE 140 suffit (l'IPE 160 marche aussi mais n'est pas le plus petit).`,
    { src: [PARTIEL(1), PARTIEL(2)], tags: ['partiel-2023'], data: [PARTIEL_CAT, FLECHE, FLECHES_LIMITES], hints: { c: 'L’IPE 160 convient, mais l’IPE 140 suffit déjà.' } })
  .num(2, r`TD garage : IPE 120 ($I_y = 318$ cm⁴), $L = 4$ m, charge ELS perpendiculaire au versant $p_z = 2{,}78$ kN/ml. Calcule $w_{max,z}$.`, round(w(2.78, 4000, 318), 1), 'mm',
    r`$$w = \frac{5\times2{,}78\times4000^4}{384\times210\,000\times318\times10^4} = ${t(w(2.78, 4000, 318), 1)}\ \text{mm} \le L/200 = 20\ \text{mm}$$
OK selon z (corrigé p.22 : 0,0138 m). Selon y ($I_z = 27{,}7$ cm⁴), la flèche atteint 36,7 mm → liernes nécessaires.`,
    { src: [TD(22)], data: [FLECHE] })
  .single(2, 'Limite de $w_{max}$ pour des **planchers supportant des poteaux** ?', ['L/200', 'L/250', '*L/400', 'L/500'],
    r`Table 4.1 : planchers supportant des poteaux (sauf si la flèche est incluse dans l'analyse ELU) → $w_{max} = L/400$ et $w_3 = L/500$ : ce sont les critères les plus sévères du tableau, car une flèche du plancher fait descendre les poteaux qu'il porte.`,
    { src: [POLY(14)], data: [FLECHES_LIMITES] })
  .single(1, 'Bâtiment industriel à un niveau sans pont roulant, parois non fragiles : déplacement horizontal limite en tête de poteau ?', ['*H/150', 'H/250', 'H/300', 'H/500'],
    r`Table 4.2 du poly : bâtiment industriel à niveau unique sans pont roulant avec parois non fragiles → **H/150** en tête de poteau (et H/150 en différentiel entre deux portiques). Pour les autres bâtiments à un niveau (exigences d'aspect, parois fragiles) : H/250.`,
    { src: [POLY(14)], exam: true })
  .num(2, 'Portique industriel de hauteur $H = 6$ m (sans pont roulant) : déplacement horizontal admissible en tête ?', 40, 'mm',
    r`$$u_{lim} = \frac{H}{150} = \frac{6000}{150} = 40\ \text{mm}$$
(table 4.2 du poly). Pour un « autre bâtiment à niveau unique », on aurait $H/250 = 24$ mm.`,
    { src: [POLY(14)] })
  .tf(2, r`La flèche $w_{max}$ comparée aux limites tient compte de la contre-flèche : $w_{max} = w_{tot} - w_c$.`, true,
    r`**Vrai.** Poly p.13 et mémo p.5 : $w_{tot} = w_1 + w_2 + w_3$ et $w_{max} = w_{tot} - w_c$, où $w_c$ est la contre-flèche donnée à l'élément non chargé. Sans contre-flèche (cas du partiel), $w_{max} = w_{tot}$.`,
    { src: [POLY(13), MEMO(5)], exam: true })
  .single(2, r`Dans $w = 5pL^4/(384EI)$ avec E en MPa, p en N/mm et L en mm, en quelle unité doit être $I$ ?`, ['cm⁴', '*mm⁴', 'm⁴', 'cm³'],
    r`Avec E en MPa (= N/mm²), p en N/mm (1 kN/m = 1 N/mm) et L en mm, il faut **I en mm⁴** pour obtenir w en mm. Le catalogue donne $I_y$ en cm⁴ : multiplier par $10^4$ (1 cm⁴ = $10^4$ mm⁴). Oublier cette conversion donne une flèche 10 000 fois trop grande.`,
    { src: [PARTIEL(2), POLY(6)], exam: true });

// =====================================================================
// 9. Métal – pieds de poteaux & construction mixte
// =====================================================================
const pm = new Bank('metal-pieds-mixte');
pm
  .single(1, 'Un pied de poteau de charpente métallique est en général…', ['*une articulation', 'un encastrement', 'un appui glissant', 'une rotule plastique'],
    r`Poly p.25 : les pieds de poteaux réalisent une liaison « **en général une articulation**, rarement un encastrement » entre la structure et son support en béton. L'articulation transmet N et V mais pas de moment, ce qui allège les fondations.`,
    { src: [POLY(25)], exam: true })
  .single(1, 'Par quel élément l’effort de **compression** $N_c$ est-il transmis à la fondation ?', ['*la plaque d’appui (platine)', 'les tiges d’ancrage', 'la bêche', 'les connecteurs'],
    r`Poly p.25 : $N_c$ transite à travers une « plaque d'appui » (**platine**) sur la semelle de fondation en béton ; le rôle de la platine est de **répartir la compression** sur le béton. V passe par frottement ou par une bêche, $N_t$ (soulèvement) par les tiges d'ancrage.`,
    { src: [POLY(25)], exam: true })
  .single(1, 'Par quel élément l’effort **tranchant** $V$ d’un pied de poteau est-il repris ?', ['les tiges d’ancrage', '*le frottement de la platine ou une bêche', 'le scellement de la platine', 'la soudure du poteau'],
    r`Poly p.25 : les efforts tranchants transitent soit par **frottement** de la plaque d'appui sur le massif, soit par **cisaillement d'une bêche**. Les tiges d'ancrage ne sont pas faites pour reprendre le cisaillement : elles reprennent le soulèvement.`,
    { src: [POLY(25)], exam: true })
  .single(1, 'Les **tiges d’ancrage** reprennent…', ['la compression', 'l’effort tranchant', '*les efforts de soulèvement (traction)', 'le moment de flexion du poteau'],
    r`Poly p.25 : « Les tiges d'ancrage reprennent les efforts de **soulèvement** amenés par le poteau » (traction $N_t$, par exemple sous vent en dépression). Types : scellement droit, courbe (crosse), avec plaque d'ancrage, ou ancrées sur un sommier noyé.`,
    { src: [POLY(25)], exam: true })
  .single(1, 'Qu’est-ce qu’une **bêche** ?', ['une tige d’ancrage recourbée', '*une chute de profilé I ou H soudée sous la platine', 'une plaque de répartition en béton', 'un raidisseur de platine'],
    r`Poly p.25 : « La bêche, quasiment obligatoire avec l'Eurocode 3, est généralement une **chute de profilé I ou H de faible hauteur soudée sous la platine**. » Noyée dans le béton de calage, elle reprend l'effort tranchant par butée.`,
    { src: [POLY(25)], exam: true })
  .multi(2, 'Coche les types de tiges d’ancrage présentés dans le poly.', ['*À scellement droit', '*À scellement courbe (crosse)', '*Munies d’une plaque d’ancrage', '*Ancrées sur un sommier noyé dans le béton', 'Soudées sur l’armature de la semelle'],
    r`Poly p.25 (figure 7.3) : tiges **droites**, **courbes** (crosse avec rayon r > 3φ et retour 1,5φ ≤ L2 ≤ 2φ), **avec plaque d'ancrage** d'extrémité, ou **ancrées sur un sommier** noyé dans le béton. Elles ne sont pas soudées aux armatures.`,
    { src: [POLY(25)] })
  .single(1, 'Dans une construction mixte acier-béton, le béton sert surtout à reprendre…', ['*la compression', 'la traction', 'le cisaillement', 'la torsion'],
    r`Poly p.27 : on associe « le **béton pour résister aux efforts de compression** ; l'**acier pour résister aux efforts de traction et aux efforts tranchants** », comme dans le béton armé. L'adhérence entre les deux matériaux réduit les contraintes maximales et les flèches.`,
    { src: [POLY(27)], exam: true })
  .single(1, 'Comment solidarise-t-on la dalle béton et la poutre acier d’une poutre mixte ?', ['par collage', '*par des connecteurs (goujons soudés, cornières, butées)', 'par simple frottement', 'par précontrainte'],
    r`Poly p.27 : la solidarisation est obtenue par des **organes de liaison (connecteurs)** fixés sur l'élément métallique : goujons soudés, cornières soudées ou clouées, butées. Sans connexion, la dalle et la poutre glisseraient l'une sur l'autre et travailleraient séparément.`,
    { src: [POLY(27)], exam: true })
  .single(1, 'Qu’est-ce qu’un **plancher collaborant** ?', [
    '*une dalle mixte : béton coulé sur un bac acier nervuré mince, connecté par goujons',
    'un plancher bois-béton',
    'une dalle préfabriquée posée sur poutrelles',
    'un plancher en caillebotis',
  ], r`Poly p.27-28 : la **dalle mixte ou plancher collaborant** est obtenue en coulant du béton sur des **bacs en acier nervurés à parois minces**, la connexion étant assurée par des ancrages mécaniques (goujons soudés). Des armatures placées dans les ondes permettent un coupe-feu jusqu'à 2 h.`,
    { src: [POLY(27), POLY(28)], exam: true })
  .multi(2, 'Coche les **avantages** de la construction mixte cités dans le poly.', ['*Réduction du poids de la structure à chargement égal', '*Grandes portées entre poteaux (12, 15, 20 m)', '*Meilleure résistance au feu', '*Délais de construction réduits', 'Suppression de toute fondation'],
    r`Poly p.28 : 1) réduction du poids à chargement égal ; 2) portées de 12, 15 ou 20 m (parkings, bureaux sans poteaux) ; 3) augmentation de la résistance au feu ; 4) réduction des délais ; 5) ouvrages d'art de 100 à 300 m économiques. Les fondations restent évidemment nécessaires.`,
    { src: [POLY(28)] })
  .single(2, 'Quelles portées entre poteaux la construction mixte permet-elle couramment en bâtiment (selon le poly) ?', ['3 à 5 m', '6 à 8 m', '*12, 15 ou 20 m', '50 à 100 m'],
    r`Poly p.28 : « Portées entre poteaux de **12, 15 ou 20 mètres** (parkings, facilités d'agencement de bureaux sans poteaux). » Pour les ouvrages d'art (ponts mixtes), on atteint 100 à 300 m de manière économique.`,
    { src: [POLY(28)] })
  .tf(1, 'Avec l’Eurocode 3, la bêche est quasiment obligatoire en pied de poteau.', true,
    r`**Vrai.** Poly p.25 : « La bêche, **quasiment obligatoire avec l'Eurocode 3**, est généralement une chute de profilé I ou H de faible hauteur soudée sous la platine. » On ne compte pas sur le seul frottement pour reprendre l'effort tranchant.`,
    { src: [POLY(25)], exam: true })
  .single(2, 'Un **poteau mixte** peut être…', ['*une section acier enrobée de béton, ou un tube acier rempli de béton', 'un poteau béton armé de barres HA', 'un poteau bois cerclé d’acier', 'un poteau acier peint'],
    r`Poly p.27 (figure 8.2) : le poteau mixte comporte soit une section en acier **totalement ou partiellement enrobée** de béton, soit une **section tubulaire remplie de béton** (éventuellement armé). Le béton augmente la résistance en compression et au feu, l'acier confine le béton.`,
    { src: [POLY(27)] })
  .single(2, 'Pour une tige d’ancrage courbe (crosse), quelle condition sur le rayon de courbure le poly indique-t-il ?', [r`*$r > 3\varphi$`, r`$r > \varphi$`, r`$r < 2\varphi$`, r`$r = 10\varphi$`],
    r`Figure 7.3 du poly : tige courbe avec **$r > 3\varphi$** et longueur de retour $1{,}5\varphi \le L_2 \le 2\varphi$. Un rayon trop faible écraserait le béton à l'intérieur de la courbe et fragiliserait l'acier.`,
    { src: [POLY(25)] });

export const METAL_BANKS = [mat, elu, els, pm];
export { COURS };
