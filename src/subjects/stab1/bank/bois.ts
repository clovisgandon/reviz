import { Bank, MEMO, PARTIEL, TD, r, t, round } from './helpers';
import { KMOD, CALVI, woodBlock, kh, wood } from '../formulaire/tables';
import type { DataBlock } from '@/lib/types';

const FMD: DataBlock = { kind: 'formula', title: 'Flexion (mémo p.2)', latex: r`f_{m,d} = \frac{f_{m,k}\,k_{mod}\,k_h}{\gamma_M} \qquad \sigma_{m,d} = \frac{6M}{bh^2}` };
const FVD: DataBlock = { kind: 'formula', title: 'Cisaillement (mémo p.3)', latex: r`f_{v,d} = \frac{f_{v,k}\,k_{mod}\,k_{cr}}{\gamma_M},\ k_{cr} = 1 \qquad \tau_d = \frac{3V}{2bh}` };
const KH: DataBlock = {
  kind: 'formula',
  title: 'Coefficient de hauteur k_h (mémo p.2), h = plus grande dimension',
  latex: r`\text{BM } (h<150) : \min\!\left[\left(\tfrac{150}{h}\right)^{0,2} ; 1{,}3\right] \quad \text{LC } (h<600) : \min\!\left[\left(\tfrac{600}{h}\right)^{0,1} ; 1{,}1\right]`,
};
const GAMMA: DataBlock = { kind: 'text', title: 'γ_M (mémo p.7)', content: 'BM 1,30 ; LC 1,25 ; LVL, CP, OSB 1,20 ; assemblages 1,30 ; accidentel 1,00. k_def : CS1 0,6 ; CS2 0,8 ; CS3 2,0.' };

// Partiel 2023 bois
const P = { b: 100, h: 250, L: 5500, M: 11.88, V: 8.64 };
const khP = kh('LC', 250);
const fmdP = (24 * 0.8 * khP) / 1.25;
const sigP = (6 * P.M * 1e6) / (P.b * P.h ** 2);
const tauP = (3 * P.V * 1e3) / (2 * P.b * P.h);
const fvdP = (3.5 * 0.8) / 1.25;
// TD garage panne GL24h 120×280
const khT = kh('LC', 280);
const fmdT = (24 * 0.9 * khT) / 1.25;
const sigTy = (6 * 27.84e6) / (120 * 280 ** 2);
const sigTz = (6 * 7.44e6) / (280 * 120 ** 2);
// ELS partiel
const I_P = (P.b * P.h ** 3) / 12;
const uPer = (5 * P.L ** 4) / (384 * 11500 * I_P); // mm par N/mm
const qP = 2.3 * 0.6;
const gP = 1.15 * 0.6 + 0.105;
const uQ = qP * uPer;
const uG = gP * uPer;
const ufG = 1.6 * uG;
const ufQ = (1 + 0.3 * 0.6) * uQ;

// =====================================================================
// 10. Bois – matériau & coefficients
// =====================================================================
const bc = new Bank('bois-coef');
bc
  .single(2, 'Panne en GL24h dans un garage non chauffé, combinaison $1{,}35G + 1{,}5S_n$ (altitude 360 m). Quel $k_{mod}$ ?', ['0,6', '0,8', '*0,9', '1,1'],
    r`Garage non chauffé → **classe de service 2** (humidité 13–20 %). Le $k_{mod}$ d'une combinaison est celui de **l'action de plus courte durée** : ici la neige. Sous 1000 m, la neige est en **court terme** → $k_{mod} = 0{,}9$. (Au-dessus de 1000 m elle serait en moyen terme → 0,8.)`,
    { id: 'stab1-bois-coef-020', src: [MEMO(7), TD(30)], exam: true, data: [KMOD],
      hints: { a: '0,6 = permanent : c’est le k_mod de G seul.', b: '0,8 = moyen terme : exploitation, ou neige au-dessus de 1000 m.', d: '1,1 = instantané : vent ou action accidentelle.' } })
  .single(1, 'Solive à l’**intérieur d’une maison chauffée** : classe de service ?', ['*1', '2', '3'],
    r`Mémo p.7 : classe de service **1** = humidité du bois < 13 % (**intérieur chauffé**) ; 2 = 13 à 20 % (sous abri, non chauffé : garage, comble froid) ; 3 = > 20 % (extérieur exposé). Au partiel 2023 (solive dans une maison) → CS1. Ne pas confondre avec les classes de risque biologique.`,
    { src: [MEMO(7), PARTIEL(3)], exam: true })
  .single(1, 'Pergola extérieure non abritée : classe de service ?', ['1', '2', '*3'],
    r`Un élément exposé aux intempéries a une humidité qui dépasse 20 % : **classe de service 3**. Conséquences : $k_{mod}$ plus faibles (0,5 à 0,9) et $k_{def} = 2{,}0$ (fluage beaucoup plus important qu'en CS1/CS2).`,
    { src: [MEMO(7)], exam: true })
  .single(1, 'Classe de durée de chargement du **vent** ?', ['permanente', 'moyen terme', 'court terme', '*instantanée'],
    r`Mémo p.7 : permanente (> 10 ans : poids propre) ; long terme (6 mois–10 ans : stockage) ; moyen terme (1 semaine–6 mois : exploitation, neige > 1000 m) ; court terme (< 1 semaine : neige < 1000 m, entretien) ; **instantanée : vent, actions accidentelles**. D'où $k_{mod} = 1{,}1$ en CS1/CS2 pour une combinaison avec vent.`,
    { src: [MEMO(7)], exam: true })
  .single(1, 'Classe de durée des **charges d’exploitation** d’un logement ?', ['long terme', '*moyen terme', 'court terme', 'instantanée'],
    r`Mémo p.7 : l'exploitation est en **moyen terme** (1 semaine à 6 mois cumulés). Au partiel 2023, la combinaison G + Q (cat. A) prend donc $k_{mod} = 0{,}8$ (CS1) : l'action de plus courte durée est l'exploitation.`,
    { src: [MEMO(7), PARTIEL(3)], exam: true })
  .single(1, 'Neige sur un chalet à **1200 m** d’altitude : classe de durée ?', ['court terme', '*moyen terme', 'long terme', 'instantanée'],
    r`Mémo p.7 : **neige à plus de 1000 m → moyen terme** (elle reste longtemps) ; neige à moins de 1000 m → court terme. Le $k_{mod}$ passe donc de 0,9 à 0,8 en CS1/CS2, et ψ0 de 0,5 à 0,7.`,
    { src: [MEMO(7)], exam: true })
  .single(1, 'Classe de durée du **poids propre** ?', ['*permanente', 'long terme', 'moyen terme', 'court terme'],
    r`Le poids propre agit en permanence (> 10 ans) : classe **permanente**, $k_{mod} = 0{,}6$ en CS1/CS2. C'est pour cela que la combinaison 1,35G seule peut devenir dimensionnante : sa charge est faible mais son $k_{mod}$ aussi (TD garage : 1,57/0,6 = 2,61).`,
    { src: [MEMO(7), TD(30)], exam: true })
  .num(1, 'Lis $k_{mod}$ pour du lamellé-collé en **classe de service 2**, action de **court terme**.', 0.9, '',
    r`Tableau du mémo p.7 (BM/LC/LVL/CP) : CS1 et CS2 → 0,6 / 0,7 / 0,8 / **0,9** / 1,1 (permanent / long / moyen / court terme / instantané). CS3 → 0,5 / 0,55 / 0,65 / 0,7 / 0,9.`,
    { src: [MEMO(7)], data: [KMOD], exam: true, tol: 0 })
  .num(2, 'Lis $k_{mod}$ pour du bois massif en **classe de service 3**, action de **moyen terme**.', 0.65, '',
    r`Mémo p.7, ligne CS3 : 0,5 (perm.) ; 0,55 (long terme) ; **0,65 (moyen terme)** ; 0,7 (court terme) ; 0,9 (instantané). L'humidité élevée réduit la résistance : en CS1/CS2, le moyen terme donne 0,8.`,
    { src: [MEMO(7)], data: [KMOD], tol: 0 })
  .single(2, 'Combinaison $1{,}35G + 1{,}5Q + 1{,}5\\psi_0 W$ (CS1) : quel $k_{mod}$ retenir ?', ['0,6 (G)', '0,8 (exploitation)', '*1,1 (vent, instantané)', 'la moyenne des trois'],
    r`Règle du corrigé TD p.30 : « le $k_{mod}$ est égal au $k_{mod}$ du cas de charge de **plus courte durée** composant la combinaison ». Le vent est instantané → $k_{mod} = 1{,}1$. C'est favorable, mais la combinaison peut ne pas être dimensionnante : on compare ensuite les rapports charge/$k_{mod}$.`,
    { src: [TD(30), MEMO(7)], data: [KMOD] })
  .num(1, 'Coefficient partiel $\\gamma_M$ du **lamellé-collé** ?', 1.25, '',
    r`Mémo p.7 : $\gamma_M$ = 1,30 pour le bois massif (et panneaux de particules, fibres, MDF) ; **1,25 pour le lamellé-collé** ; 1,20 pour LVL, contreplaqué et OSB ; 1,30 pour les assemblages ; 1,00 en combinaison accidentelle. Le LC est plus homogène que le BM, d'où un coefficient plus faible.`,
    { src: [MEMO(7)], data: [GAMMA], exam: true, tol: 0 })
  .num(1, 'Coefficient de fluage $k_{def}$ en **classe de service 2** ?', 0.8, '',
    r`Mémo p.7 : $k_{def}$ = 0,6 (CS1) ; **0,8 (CS2)** ; 2,0 (CS3). Il sert à passer de la flèche instantanée à la flèche finale : $U_{fin,G} = (1 + k_{def})U_{inst,G}$ (TD garage : CS2 → « 1,80 G »).`,
    { src: [MEMO(7), TD(39)], data: [GAMMA], exam: true, tol: 0 })
  .num(2, 'Calcule $k_h$ pour une poutre en **lamellé-collé** de hauteur $h = 250$ mm.', round(khP, 3), '',
    r`LC avec $h < 600$ mm : $k_h = \min\left[(600/h)^{0,1} ; 1{,}1\right]$.
$$k_h = (600/250)^{0,1} = 2{,}4^{0,1} = ${t(khP, 3)} \le 1{,}1$$
On retient ${t(khP, 2)} (valeur du partiel 2023). $k_h$ majore la résistance en flexion des petites sections (effet d'échelle).`,
    { src: [MEMO(2), PARTIEL(3)], data: [KH], tol: 1 })
  .num(2, 'Calcule $k_h$ pour un chevron en **bois massif** de hauteur $h = 100$ mm.', round(kh('BM', 100), 3), '',
    r`BM avec $h < 150$ mm : $k_h = \min\left[(150/h)^{0,2} ; 1{,}3\right]$.
$$k_h = (150/100)^{0,2} = 1{,}5^{0,2} = ${t(kh('BM', 100), 3)}$$
Attention : h est la **plus grande** dimension de la section. Pour $h \ge 150$ mm en BM, $k_h = 1$.`,
    { src: [MEMO(2)], data: [KH], tol: 1 })
  .num(2, 'Calcule $k_h$ pour une panne en **lamellé-collé** $120\\times280$ mm.', round(khT, 3), '',
    r`$$k_h = (600/280)^{0,1} = 2{,}143^{0,1} = ${t(khT, 3)} \approx 1{,}08$$
(TD garage p.32). On prend $h = 280$ mm, la plus grande dimension, même pour la flexion autour de l'axe faible (le corrigé garde 1,08 pour les deux axes).`,
    { src: [TD(32), MEMO(2)], data: [KH], tol: 1 })
  .num(1, 'Calcule $k_h$ pour une solive en **bois massif** de hauteur $h = 200$ mm.', 1, '',
    r`En bois massif, $k_h$ ne s'applique que si $h < 150$ mm. Ici $h = 200$ mm ≥ 150 → **$k_h = 1$**. Piège : appliquer la formule $(150/200)^{0,2} = 0{,}94$, qui réduirait la résistance alors que $k_h$ ne doit jamais être inférieur à 1.`,
    { src: [MEMO(2)], data: [KH], tol: 0 })
  .num(3, 'Tirant en bois massif C24 de section $70\\times105$ mm : calcule $k_l$ (traction).', round(kh('BM', 105), 3), '',
    r`Mémo p.4 : pour BM et LC, $k_l$ se calcule comme $k_h$. $h = 105$ mm < 150 :
$$k_l = (150/105)^{0,2} = 1{,}4286^{0,2} = ${t(kh('BM', 105), 3)}$$
(corrigé TD p.43 : 1,074). Pour le LVL, $k_l = \min[(3000/L)^{0,06} ; 1{,}1]$ dépend de la longueur.`,
    { src: [MEMO(4), TD(43)], tol: 1 })
  .single(2, 'Quelle valeur de $k_{cr}$ le mémo recommande-t-il pour le cisaillement ?', ['0,67', '0,8', '*1', '1,25'],
    r`Mémo p.3 : « $k_{cr}$ est compris entre 0,67 et 1, il est **préférable de prendre 1** ». Ainsi $f_{v,d} = f_{v,k}\,k_{mod}\,k_{cr}/\gamma_M = f_{v,k}\,k_{mod}/\gamma_M$ (partiel 2023 : $3{,}5\times0{,}8/1{,}25 = 2{,}24$ MPa).`,
    { src: [MEMO(3)], exam: true })
  .single(1, 'Valeur de $k_m$ pour une section **rectangulaire** en BM ou LC (flexion déviée) ?', ['*0,7', '1,0', '0,5', '1,1'],
    r`Corrigé TD p.34 : $k_m$ = **0,7 pour les sections rectangulaires** en BM, BLC ou LVL ; 1 pour les autres sections et matériaux. Il réduit le terme de l'autre axe dans les deux critères de flexion déviée (les contraintes maximales ne sont pas atteintes au même point).`,
    { src: [TD(34)], exam: true })
  .num(1, 'Résistance caractéristique en flexion $f_{m,k}$ du **GL24h** ?', 24, 'MPa',
    r`Le nombre de la classe donne $f_{m,k}$ : **GL24h → 24 MPa** (C24 → 24 MPa aussi). Mémo p.8 : GL24h a aussi $f_{t,0,k} = 19{,}2$, $f_{v,k} = 3{,}5$, $E_{0,mean} = 11\,500$ MPa et $\rho_{mean} = 420$ kg/m³.`,
    { src: [MEMO(8)], data: [woodBlock(['C24', 'GL24h'])], exam: true, tol: 0 })
  .num(2, 'Module $E_{0,mean}$ du bois massif **C24** ?', 11000, 'MPa',
    r`Mémo p.8 : C24 → $E_{0,mean} = 11\,000$ MPa ($E_{0,05} = 7400$). Le GL24h a 11 500 MPa. Le module du bois est environ 20 fois plus faible que celui de l'acier (210 000 MPa) : les flèches sont souvent dimensionnantes en bois.`,
    { src: [MEMO(8)], data: [woodBlock(['C18', 'C24', 'C30'])], tol: 0 })
  .single(2, 'Résistance en traction axiale $f_{t,0,k}$ du **C24** à utiliser ?', ['14 MPa', '*14,5 MPa', '19,2 MPa', '24 MPa'],
    r`Mémo p.8 : C24 → **$f_{t,0,k} = 14{,}5$ MPa**. Le corrigé TD (p.44) précise que « la valeur dans le poly de 14 MPa est une ancienne valeur ». 19,2 MPa est la valeur du GL24h ; 24 MPa est $f_{m,k}$.`,
    { src: [MEMO(8), TD(44)], data: [woodBlock(['C24', 'GL24h'])], hints: { a: 'Ancienne valeur de la norme, remplacée par 14,5 MPa.' } });

// =====================================================================
// 11. Bois – ELU
// =====================================================================
const be = new Bank('bois-elu');
be
  .num(2, r`Partiel 2023 : solive GL24h $100\times250$, intérieur de maison (CS1), combinaison $G + Q$ (cat. A), $k_h = ${t(khP, 2)}$. Calcule $f_{m,d}$.`, round(fmdP, 2), 'MPa',
    r`CS1 + exploitation (moyen terme) → $k_{mod} = 0{,}8$ ; LC → $\gamma_M = 1{,}25$.
$$f_{m,d} = \frac{24\times0{,}8\times${t(khP, 3)}}{1{,}25} = ${t(fmdP, 2)}\ \text{MPa}$$
Erreurs fréquentes : prendre $k_{mod} = 0{,}9$ (court terme) ou $\gamma_M = 1{,}3$ (bois massif).`,
    { src: [PARTIEL(3), MEMO(2), MEMO(7)], tags: ['partiel-2023'], exam: true, data: [KMOD, GAMMA, FMD] })
  .num(2, r`Partiel 2023 : $M_{Ed} = 11{,}88$ kN·m sur une solive $100\times250$ mm. Calcule $\sigma_{m,d}$.`, round(sigP, 2), 'MPa',
    r`Section rectangulaire :
$$\sigma_{m,d} = \frac{6M}{bh^2} = \frac{6\times11{,}88\times10^6}{100\times250^2} = ${t(sigP, 2)}\ \text{MPa}$$
Attention aux unités : M en N·mm (× 10⁶), b et h en mm → MPa.`,
    { src: [PARTIEL(3), MEMO(2)], tags: ['partiel-2023'], exam: true, data: [FMD] })
  .num(1, r`Partiel 2023 : $\sigma_{m,d} = ${t(sigP, 2)}$ MPa et $f_{m,d} = ${t(fmdP, 2)}$ MPa. Taux de travail en flexion ?`, round((sigP / fmdP) * 100, 1), '%',
    r`$$\eta = \frac{\sigma_{m,d}}{f_{m,d}} = \frac{${t(sigP, 2)}}{${t(fmdP, 2)}} = ${t((sigP / fmdP) * 100, 0)}\ \%$$
η ≤ 100 % → la solive est **vérifiée en flexion**. Conclusion à rédiger : « $\sigma_{m,d} \le f_{m,d}$, la poutre convient (taux 68 %) ».`,
    { src: [PARTIEL(3)], tags: ['partiel-2023'], tol: 2 })
  .num(2, r`Partiel 2023 : $V_{Ed} = 8{,}64$ kN sur la solive $100\times250$ mm. Calcule $\tau_d$.`, round(tauP, 3), 'MPa',
    r`$$\tau_d = \frac{3V}{2bh} = \frac{3\times8640}{2\times100\times250} = ${t(tauP, 3)}\ \text{MPa}$$
Le facteur 3/2 vient de la répartition parabolique du cisaillement dans un rectangle (maximum à mi-hauteur).`,
    { src: [PARTIEL(3), MEMO(3)], tags: ['partiel-2023'], exam: true, data: [FVD] })
  .num(2, 'Partiel 2023 : GL24h ($f_{v,k} = 3{,}5$ MPa), CS1, moyen terme. Calcule $f_{v,d}$.', round(fvdP, 2), 'MPa',
    r`$$f_{v,d} = \frac{f_{v,k}\,k_{mod}\,k_{cr}}{\gamma_M} = \frac{3{,}5\times0{,}8\times1}{1{,}25} = 2{,}24\ \text{MPa}$$
$\tau_d = 0{,}52 \le 2{,}24$ MPa → taux 23 %, vérifié. Pas de $k_h$ en cisaillement ; $k_{cr} = 1$ selon le mémo.`,
    { src: [PARTIEL(3), MEMO(3)], tags: ['partiel-2023'], exam: true, data: [FVD, KMOD] })
  .num(2, r`TD garage : panne GL24h $120\times280$, CS2, neige < 1000 m (court terme), $k_h = 1{,}08$. Calcule $f_{m,d}$.`, round(fmdT, 2), 'MPa',
    r`Court terme en CS2 → $k_{mod} = 0{,}9$ ; LC → $\gamma_M = 1{,}25$.
$$f_{m,d} = \frac{24\times0{,}9\times1{,}08}{1{,}25} = 18{,}65\ \text{MPa}$$
(corrigé p.32).`,
    { src: [TD(32)], data: [KMOD, FMD] })
  .num(2, r`TD garage : $M_{Ed,y} = 27{,}84$ kN·m sur la panne $120\times280$ mm (h = 280 dans le plan de flexion). Calcule $\sigma_{m,y,d}$.`, round(sigTy, 2), 'MPa',
    r`$$\sigma_{m,y,d} = \frac{6\times27{,}84\times10^6}{120\times280^2} = ${t(sigTy, 2)}\ \text{MPa}$$
Taux : $17{,}75/18{,}65 = 95\ \%$ (corrigé p.32). Autour de z, on inverse b et h : $\sigma_{m,z,d} = 6M_z/(h\,b^2)$.`,
    { src: [TD(32)], data: [FMD] })
  .num(3, r`TD garage, panne de 8 m : $\sigma_{m,y,d} = ${t(sigTy, 2)}$ MPa, $\sigma_{m,z,d} = ${t(sigTz, 2)}$ MPa, $f_{m,d} = ${t(fmdT, 2)}$ MPa, $k_m = 0{,}7$. Calcule le **premier** critère de flexion déviée.`, round(sigTy / fmdT + 0.7 * sigTz / fmdT, 2), '',
    r`$$\frac{\sigma_{m,y,d}}{f_{m,y,d}} + k_m\frac{\sigma_{m,z,d}}{f_{m,z,d}} = ${t(sigTy / fmdT, 3)} + 0{,}7\times${t(sigTz / fmdT, 3)} = ${t(sigTy / fmdT + 0.7 * sigTz / fmdT, 2)} > 1$$
Second critère : $0{,}7\times0{,}95 + 0{,}59 = 1{,}26 > 1$. **Non vérifié** (137 % / 126 %) → le corrigé ajoute un appui intermédiaire (2 pannes de 4 m).`,
    { src: [TD(34)], tol: 2,
      data: [{ kind: 'formula', title: 'Flexion déviée bois', latex: r`\frac{\sigma_{m,y,d}}{f_{m,y,d}} + k_m\frac{\sigma_{m,z,d}}{f_{m,z,d}} \le 1 \quad\text{et}\quad k_m\frac{\sigma_{m,y,d}}{f_{m,y,d}} + \frac{\sigma_{m,z,d}}{f_{m,z,d}} \le 1` }] })
  .single(2, 'TD garage (bois) : combinaisons ELU 1,35G = 1,57 (k_mod 0,6) ; 1,35G + 1,5Sn = 3,41 (0,9) ; 1,35G + 1,5Sn + 1,5ψ0W = 3,97 (1,1) kN/ml. Laquelle est dimensionnante ?', [
    '1,35G (la plus faible charge mais le plus petit k_mod)',
    '*1,35G + 1,5Sn',
    '1,35G + 1,5Sn + 1,5ψ0W (la plus forte charge)',
    'on ne peut pas comparer',
  ], r`En bois, la résistance dépend de $k_{mod}$ : on compare **charge / $k_{mod}$** (corrigé p.30) : $1{,}57/0{,}6 = 2{,}61$ ; $3{,}41/0{,}9 = 3{,}78$ ; $3{,}97/1{,}1 = 3{,}61$. La plus grande valeur, **3,78 → combinaison 3 (1,35G + 1,5Sn)**, est dimensionnante, même si sa charge n'est pas la plus forte.`,
    { src: [TD(30)], exam: true, hints: { c: '3,97/1,1 = 3,61 < 3,41/0,9 = 3,78 : le vent apporte k_mod = 1,1.' } })
  .num(3, 'Calcule le rapport charge/k_mod de la combinaison $1{,}35G + 1{,}5S_n = 3{,}41$ kN/ml (CS2, neige < 1000 m).', round(3.41 / 0.9, 2), 'kN/ml',
    r`Neige < 1000 m → court terme → $k_{mod} = 0{,}9$ (CS2) :
$$\frac{3{,}41}{0{,}9} = 3{,}79\ \text{kN/ml}$$
C'est la plus grande valeur du tableau du corrigé (p.30, arrondi 3,78) → combinaison dimensionnante. Ce rapport sert seulement à **comparer** les combinaisons ; le calcul se fait ensuite avec la vraie charge (3,41) et le vrai $k_{mod}$ (0,9).`,
    { src: [TD(30)], tol: 1 })
  .num(2, 'Solive sur deux appuis : $p = 3$ kN/ml, $L = 5$ m. Calcule le moment maximal.', 9.375, 'kN·m',
    r`Poutre isostatique sous charge uniforme : $M_{max} = pL^2/8$ (à mi-portée) et $V_{max} = pL/2$ (aux appuis).
$$M = \frac{3\times5^2}{8} = 9{,}375\ \text{kN·m}$$
Ces formules servent dans tous les exercices de panne et de solive.`,
    { src: [TD(32)] })
  .num(2, r`Solive C24 de section $75\times200$ mm soumise à $M_{Ed} = 4$ kN·m. Calcule $\sigma_{m,d}$.`, 8, 'MPa',
    r`$$\sigma_{m,d} = \frac{6M}{bh^2} = \frac{6\times4\times10^6}{75\times200^2} = \frac{24\times10^6}{3\times10^6} = 8{,}0\ \text{MPa}$$
Le module de flexion d'un rectangle vaut $W = bh^2/6$ ; h est la dimension dans le plan de flexion.`,
    { src: [MEMO(2)], data: [FMD] })
  .num(2, r`Bois massif C24, $h = 200$ mm, classe de service 1, action de moyen terme. Calcule $f_{m,d}$.`, round((24 * 0.8 * 1) / 1.3, 2), 'MPa',
    r`$k_{mod} = 0{,}8$ (CS1, moyen terme) ; BM → $\gamma_M = 1{,}30$ ; $h = 200 \ge 150$ → $k_h = 1$.
$$f_{m,d} = \frac{24\times0{,}8\times1}{1{,}3} = ${t((24 * 0.8) / 1.3, 2)}\ \text{MPa}$$`,
    { src: [MEMO(2), MEMO(7)], data: [KMOD, GAMMA, FMD], exam: true })
  .single(1, 'Contrainte de flexion dans une section **rectangulaire** $b\\times h$ :', [r`*$\sigma = 6M/(bh^2)$`, r`$\sigma = M/(bh)$`, r`$\sigma = 3M/(2bh)$`, r`$\sigma = 12M/(bh^3)$`],
    r`Mémo p.2 : section rectangulaire → $\sigma_{m,d} = 6M/(bh^2)$ (car $W = I/v = (bh^3/12)/(h/2) = bh^2/6$) ; sinon $\sigma = vM/I$. $3V/(2bh)$ est la formule du **cisaillement**.`,
    { src: [MEMO(2)], exam: true, hints: { c: 'C’est la contrainte de cisaillement 3V/(2bh), avec V et non M.' } })
  .num(2, r`Poutre $100\times200$ mm, effort tranchant $V_{Ed} = 10$ kN. Calcule $\tau_d$.`, 0.75, 'MPa',
    r`$$\tau_d = \frac{3V}{2bh} = \frac{3\times10\,000}{2\times100\times200} = 0{,}75\ \text{MPa}$$
À comparer à $f_{v,d} = f_{v,k}k_{mod}k_{cr}/\gamma_M$ (C24 : $f_{v,k} = 4$ MPa).`,
    { src: [MEMO(3)], data: [FVD] })
  .order(2, 'Remets dans l’ordre la vérification d’une solive bois en flexion.', [
    'Déterminer la classe de service (lieu)', 'Déterminer le k_mod (action de plus courte durée de la combinaison)', 'Calculer k_h et lire γ_M',
    'Calculer f_m,d = f_m,k·k_mod·k_h/γ_M', 'Calculer σ_m,d = 6M/(bh²)', 'Conclure avec le taux de travail σ_m,d/f_m,d',
  ], r`Démarche du partiel 2023 et du TD : CS (maison → 1, garage → 2) → $k_{mod}$ (G + Q cat. A → moyen terme → 0,8 ; neige < 1000 m → 0,9) → $k_h$ (LC h < 600) et $\gamma_M$ (LC 1,25) → $f_{m,d}$ → $\sigma_{m,d}$ → η. On termine toujours par une **conclusion rédigée**.`,
    { src: [PARTIEL(3), TD(32)] })
  .single(2, 'Dans le critère de flexion déviée bois, où s’applique $k_m = 0{,}7$ ?', [
    '*sur le terme de l’autre axe, dans chacun des deux critères',
    'sur les deux termes du même critère',
    'uniquement sur le terme de l’axe fort',
    'sur la résistance f_m,d',
  ], r`On vérifie **deux** critères : $\frac{\sigma_y}{f_y} + k_m\frac{\sigma_z}{f_z} \le 1$ **et** $k_m\frac{\sigma_y}{f_y} + \frac{\sigma_z}{f_z} \le 1$. Le $k_m$ réduit à chaque fois le terme de l'autre axe, car pour un rectangle les contraintes maximales des deux flexions ne s'additionnent pleinement qu'aux angles.`,
    { src: [TD(34)] })
  .num(2, r`Poteau court en C24, CS2, action de moyen terme. Calcule $f_{c,0,d}$ (sans flambement).`, round((21 * 0.8) / 1.3, 2), 'MPa',
    r`Mémo p.4 : $f_{c,0,d} = f_{c,0,k}\,k_{mod}/\gamma_M$ (pas de $k_h$ en compression).
$$f_{c,0,d} = \frac{21\times0{,}8}{1{,}3} = ${t((21 * 0.8) / 1.3, 2)}\ \text{MPa}$$
Le flambement sera traité plus tard ; ici on suppose une pièce courte.`,
    { src: [MEMO(4), MEMO(8)], data: [woodBlock(['C24']), KMOD] })
  .num(2, r`Tirant C24 $70\times105$ (CS2), combinaison avec vent, $k_l = 1{,}074$. Calcule $f_{t,0,d}$.`, round((14.5 * 1.1 * kh('BM', 105)) / 1.3, 2), 'MPa',
    r`Vent → instantané → $k_{mod} = 1{,}1$ ; BM → $\gamma_M = 1{,}3$.
$$f_{t,0,d} = \frac{f_{t,0,k}\,k_{mod}\,k_l}{\gamma_M} = \frac{14{,}5\times1{,}1\times1{,}074}{1{,}3} = 13{,}18\ \text{MPa}$$
(corrigé p.44). Avec la section nette réduite par 2 boulons Ø12 : $\sigma_{t,0,d} = 1{,}68$ MPa → taux 13 %.`,
    { src: [TD(44), MEMO(4)], data: [woodBlock(['C24'])], tol: 1.5 });

// =====================================================================
// 12. Bois – ELS
// =====================================================================
const bels = new Bank('bois-els');
bels
  .single(1, 'Bâtiment courant, élément structural : limite de $W_{inst}(Q)$ ?', ['l/200', '*l/300', 'l/125', 'l/150'],
    r`Critères « selon Calvi » (mémo p.6), bâtiment courant, éléments structuraux : **$W_{inst}(Q) \le l/300$**, $W_{net,fin} \le l/200$, $W_{fin} \le l/125$. Pour les chevrons : $W_{net,fin} \le l/150$ et $W_{fin} \le l/125$.`,
    { src: [MEMO(6)], data: [CALVI], exam: true })
  .single(1, 'Bâtiment courant, élément structural : limite de $W_{net,fin}$ ?', ['l/300', '*l/200', 'l/125', 'l/100'],
    r`Mémo p.6 : $W_{net,fin} \le l/200$ (bâtiment courant, éléments structuraux). $W_{net,fin} = U_{fin,G} + U_{fin,Q} - W_c$ : c'est la flèche finale nette de la contre-flèche. Sans contre-flèche, $W_{net,fin} = W_{fin}$ et c'est l/200 qui gouverne (plus sévère que l/125).`,
    { src: [MEMO(6), TD(40)], data: [CALVI], exam: true })
  .single(1, 'Bâtiment courant, élément structural : limite de $W_{fin}$ ?', ['l/300', 'l/200', '*l/125', 'l/150'],
    r`Mémo p.6 : $W_{fin} \le l/125$ (éléments structuraux et chevrons en bâtiment courant ; l/100 en bâtiment agricole). C'est le critère le moins sévère : quand $W_c = 0$, on vérifie surtout $W_{net,fin} \le l/200$.`,
    { src: [MEMO(6)], data: [CALVI], exam: true })
  .num(1, 'Solive de portée $l = 5{,}5$ m : flèche limite $W_{inst}(Q) = l/300$ ?', round(5500 / 300, 2), 'mm',
    r`$$W_{inst}(Q) = \frac{5500}{300} = 18{,}33\ \text{mm}$$
Et pour la même solive : $W_{net,fin} = l/200 = 27{,}5$ mm ; $W_{fin} = l/125 = 44$ mm. Travailler en mm permet de comparer directement aux flèches calculées.`,
    { src: [MEMO(6), PARTIEL(3)], tags: ['partiel-2023'], exam: true })
  .num(2, r`Partiel 2023 : solive GL24h $100\times250$ ($E_{0,mean} = 11\,500$ MPa), $l = 5{,}5$ m, entraxe 0,6 m, $Q = 2{,}3$ kN/m². Calcule $U_{inst,Q}$.`, round(uQ, 2), 'mm',
    r`$q = 2{,}3\times0{,}6 = 1{,}38$ kN/ml ; $I = bh^3/12 = 100\times250^3/12 = 1{,}302\times10^8$ mm⁴.
$$U_{inst,Q} = \frac{5\,q\,l^4}{384\,E\,I} = \frac{5\times1{,}38\times5500^4}{384\times11\,500\times1{,}302\times10^8} = ${t(uQ, 2)}\ \text{mm}$$
$\le l/300 = 18{,}33$ mm → vérifié (taux ${t((uQ / (5500 / 300)) * 100, 0)} %).`,
    { src: [PARTIEL(3), MEMO(6)], tags: ['partiel-2023'], exam: true, data: [CALVI] })
  .num(2, r`Partiel 2023 : $U_{inst,G} = ${t(uG, 2)}$ mm (G avec poids propre), CS1. Calcule $U_{fin,G}$.`, round(ufG, 2), 'mm',
    r`CS1 → $k_{def} = 0{,}6$.
$$U_{fin,G} = (1 + k_{def})\,U_{inst,G} = 1{,}6\times${t(uG, 2)} = ${t(ufG, 2)}\ \text{mm}$$
Le fluage augmente la flèche des charges permanentes de 60 % en CS1 (80 % en CS2, 200 % en CS3).`,
    { src: [MEMO(6), MEMO(7)], tags: ['partiel-2023'], data: [GAMMA] })
  .num(3, r`Partiel 2023 : $U_{inst,Q} = ${t(uQ, 2)}$ mm (cat. A, $\psi_2 = 0{,}3$), CS1. Calcule $U_{fin,Q}$.`, round(ufQ, 2), 'mm',
    r`$$U_{fin,Q} = (1 + \psi_2\,k_{def})\,U_{inst,Q} = (1 + 0{,}3\times0{,}6)\times${t(uQ, 2)} = 1{,}18\times${t(uQ, 2)} = ${t(ufQ, 2)}\ \text{mm}$$
Seule la partie quasi-permanente de Q ($\psi_2 Q$) flue.`,
    { src: [MEMO(6)], tags: ['partiel-2023'], data: [GAMMA] })
  .num(3, r`Partiel 2023 : $U_{fin,G} = ${t(ufG, 2)}$ mm et $U_{fin,Q} = ${t(ufQ, 2)}$ mm, pas de contre-flèche. Calcule $W_{net,fin}$ et compare à $l/200$.`, round(ufG + ufQ, 1), 'mm',
    r`$$W_{net,fin} = U_{fin,G} + U_{fin,Q} - W_c = ${t(ufG, 2)} + ${t(ufQ, 2)} - 0 = ${t(ufG + ufQ, 1)}\ \text{mm}$$
$\le l/200 = 27{,}5$ mm → vérifié (taux ${t(((ufG + ufQ) / 27.5) * 100, 0)} %). Et $W_{fin} = ${t(ufG + ufQ, 1)} \le l/125 = 44$ mm. Sans le poids propre de la solive on trouverait ≈ 21,7 mm.`,
    { src: [MEMO(6), PARTIEL(3)], tags: ['partiel-2023'], data: [CALVI] })
  .single(2, 'TD garage (neige et vent, CS2) : pourquoi $U_{fin,Q} = U_{inst,Q}$ ?', ['*parce que ψ2 = 0 pour la neige (< 1000 m) et le vent', 'parce que k_def = 0 en CS2', 'parce qu’il n’y a pas de contre-flèche', 'parce que le vent est instantané'],
    r`$U_{fin,Q} = (1 + \psi_2 k_{def})U_{inst,Q}$ : avec **ψ2 = 0** (neige sous 1000 m, vent), le terme de fluage s'annule (corrigé p.38 : « ψ2 de la neige et du vent sont égaux à 0 »). Seule $U_{fin,G} = (1 + 0{,}8)U_{inst,G}$ flue, d'où les combinaisons « 1,80 G + … ».`,
    { src: [TD(38), TD(39)], exam: true })
  .tf(2, 'Sans contre-flèche ($W_c = 0$), $W_{fin} = W_{net,fin}$.', true,
    r`**Vrai.** $W_{net,fin} = U_{fin,G} + U_{fin,Q} - W_c$ et $W_{fin} = U_{fin,G} + U_{fin,Q}$. Si $W_c = 0$ (partiel : « contreflèche : NON »), les deux sont égales ; on retient alors la limite la plus sévère, **l/200** ($W_{net,fin}$) plutôt que l/125 ($W_{fin}$) (corrigé p.40).`,
    { src: [MEMO(6), TD(38)], exam: true })
  .single(2, 'Quel module utilise-t-on pour le calcul des flèches en bois ?', ['*E_0,mean', 'E_0,05', 'E_90,mean', 'G_mean'],
    r`Les flèches se calculent avec le module **moyen** $E_{0,mean}$ (GL24h : 11 500 MPa ; C24 : 11 000 MPa), cf. corrigé TD p.37. $E_{0,05}$ (fractile 5 %) sert aux calculs de stabilité (flambement, déversement).`,
    { src: [TD(37), MEMO(8)], exam: true })
  .num(2, r`TD garage (panne 4 m) : flèches instantanées $U_z = 2{,}059$ mm et $U_y = 2{,}286$ mm. Calcule la flèche globale.`, round(Math.hypot(2.059, 2.286), 2), 'mm',
    r`Les flèches selon y et z sont perpendiculaires : on les combine vectoriellement.
$$U = \sqrt{2{,}059^2 + 2{,}286^2} = 3{,}08\ \text{mm} \le l/300 = 13{,}33\ \text{mm}$$
Taux 23 % (corrigé p.38). Même principe en acier : $\sqrt{13^2 + 3^2}$ (TD p.22).`,
    { src: [TD(38)], tol: 1 })
  .single(2, 'Bâtiment **agricole**, élément structural : limite de $W_{net,fin}$ ?', ['l/200', '*l/150', 'l/125', 'l/100'],
    r`Mémo p.6, bâtiment agricole, éléments structuraux : $W_{inst}(Q) \le l/200$ ; **$W_{net,fin} \le l/150$** ; $W_{fin} \le l/100$. Les critères sont moins sévères qu'en bâtiment courant (l/300 ; l/200 ; l/125).`,
    { src: [MEMO(6)], data: [CALVI] })
  .num(2, 'En classe de service 3, par combien est multipliée la flèche instantanée des charges permanentes pour obtenir $U_{fin,G}$ ?', 3, '',
    r`CS3 → $k_{def} = 2{,}0$ → $U_{fin,G} = (1 + 2)\,U_{inst,G} = 3\,U_{inst,G}$. En CS1 le facteur est 1,6 et en CS2 1,8. Le fluage est donc très pénalisant pour les bois exposés aux intempéries.`,
    { src: [MEMO(7), MEMO(6)], data: [GAMMA], tol: 0 });

export const BOIS_BANKS = [bc, be, bels];
export const BOIS_VALUES = { fmdP, sigP, tauP, fvdP, uQ, uG, ufG, ufQ, wood };
