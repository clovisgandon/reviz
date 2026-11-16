import { Bank, SUJBA, BA, BA4, EC, r, t, round } from './helpers';
import { concrete, fyd, fbd, lbrqd, SECTIONS_ACIER, CMIN_DUR, barArea } from '../formulaire/tables';
import type { DataBlock } from '@/lib/types';

const C25 = concrete(25);
const C30 = concrete(30);
const C35 = concrete(35);
const MAT: DataBlock = {
  kind: 'formula',
  title: 'Béton (corrigé TD1)',
  latex: r`f_{cd} = \frac{f_{ck}}{1{,}5} \quad f_{cm} = f_{ck} + 8 \quad f_{ctm} = 0{,}30\,f_{ck}^{2/3} \quad f_{ctk,0,05} = 0{,}7\,f_{ctm} \quad E_{cm} = 22\,000\left(\frac{f_{cm}}{10}\right)^{0,3}`,
};
const ACIER: DataBlock = { kind: 'formula', title: 'Acier', latex: r`f_{yd} = \frac{f_{yk}}{1{,}15} \qquad E_s = 200\,000\ \text{MPa} \qquad \varepsilon_{yd} = \frac{f_{yd}}{E_s}` };
const ANCR: DataBlock = { kind: 'formula', title: 'Adhérence (corrigé TD3)', latex: r`f_{ctd} = \frac{f_{ctk,0,05}}{1{,}5} \quad f_{bd} = 2{,}25\,\eta_1\eta_2\,f_{ctd} \quad l_{b,rqd} = \frac{\varphi}{4}\,\frac{f_{yd}}{f_{bd}}` };
const ENROB: DataBlock = { kind: 'formula', title: 'Enrobage', latex: r`c_{nom} = c_{min} + \Delta c_{dev} \quad c_{min} = \max(c_{min,b}\ ;\ c_{min,dur}\ ;\ 10\ \text{mm}) \quad \Delta c_{dev} = 10\ \text{mm}` };
const FLEX: DataBlock = {
  kind: 'formula',
  title: 'Flexion simple, section rectangulaire',
  latex: r`\mu_{cu} = \frac{M_u}{b\,d^2 f_{cd}} \quad \beta = \frac{1 + \sqrt{1 - 2\mu_{cu}}}{2} \quad A_s = \frac{M_u}{\beta\,d\,f_{yd}} \quad \mu_{cu,yd}(\text{B500}) = 0{,}372`,
};
const POT: DataBlock = {
  kind: 'formula',
  title: 'Poteaux (méthode simplifiée, corrigé TD4)',
  latex: r`\lambda = \frac{l_0}{i} \quad i = \frac{h}{\sqrt{12}} \quad \alpha = \frac{0{,}86}{1 + (\lambda/62)^2}\ (\lambda \le 60) \quad A_{s,min} = \max\left(\frac{0{,}10\,N_{Ed}}{f_{yd}}\ ;\ 0{,}002\,A_c\right)`,
};
const alpha = (l: number) => 0.86 / (1 + (l / 62) ** 2);

// =====================================================================
// 13. BA – matériaux (TD1)
// =====================================================================
const bam = new Bank('ba-materiaux');
bam
  .num(1, 'Résistance de calcul en compression $f_{cd}$ d’un béton **C25/30** ?', round(C25.fcd, 2), 'MPa',
    r`$$f_{cd} = \frac{\alpha_{cc}\,f_{ck}}{\gamma_c} = \frac{1\times25}{1{,}5} = 16{,}67\ \text{MPa}$$
C25/30 : $f_{ck} = 25$ MPa sur cylindre (30 sur cube). α_cc = 1 en général ; γ_c = 1,5 (corrigé TD1, TD5).`,
    { src: [BA(1), BA(5)], data: [MAT], exam: true })
  .num(2, 'Un béton a une résistance de calcul $f_{cd} = 16{,}6$ MPa. Quelle est sa résistance caractéristique $f_{ck}$ ?', 24.9, 'MPa',
    r`On inverse $f_{cd} = f_{ck}/\gamma_c$ avec $\gamma_c = 1{,}5$ (et $\alpha_{cc} = 1$) :
$$f_{ck} = 1{,}5\times f_{cd} = 1{,}5\times16{,}6 = 24{,}9\ \text{MPa}$$
Question 1 du TD1. Voir la question suivante pour la classe de ce béton (piège du corrigé).`,
    { src: [BA(1), SUJBA(1)], data: [MAT] })
  .single(2, 'Béton de $f_{ck} = 24{,}9$ MPa : de quelle classe est-il ?', ['C20/25', '*C25/30', 'C30/37', 'C35/45'],
    r`24,9 MPa ≈ 25 MPa → **C25/30** ($f_{cd} = 16{,}67$ MPa ≈ 16,6). ⚠️ Le corrigé moodle affiche « C20 » à côté de 24,90 MPa : c'est une **erreur** (un C20/25 a $f_{ck} = 20$ MPa et $f_{cd} = 13{,}33$ MPa). Le premier nombre de la classe est $f_{ck}$ (cylindre), le second la résistance sur cube.`,
    { src: [BA(1, 'le corrigé indique « C20 » par erreur')], tags: ['corrigé-faux'], hints: { a: 'Erreur du corrigé moodle : un C20 a f_ck = 20 MPa.' } })
  .num(1, 'Résistance moyenne $f_{cm}$ d’un béton **C30/37** ?', 38, 'MPa',
    r`$f_{cm} = f_{ck} + 8 = 30 + 8 = 38$ MPa (corrigé TD1). Réciproquement, la question 8 du TD1 donne $f_{cm} = 38$ MPa → $f_{ck} = 30$ MPa → $f_{cd} = 20$ MPa.`,
    { src: [BA(1)], data: [MAT], exam: true, tol: 0.5 })
  .num(2, 'Résistance moyenne à la traction $f_{ctm}$ d’un **C25/30** ?', round(C25.fctm, 2), 'MPa',
    r`Pour $f_{ck} \le 50$ MPa : $f_{ctm} = 0{,}30\,f_{ck}^{2/3}$.
$$f_{ctm} = 0{,}30\times25^{2/3} = 0{,}30\times8{,}55 = 2{,}56\ \text{MPa}$$
Le béton résiste environ 10 fois moins en traction qu'en compression, d'où les armatures.`,
    { src: [BA(1)], data: [MAT] })
  .num(2, 'Résistance caractéristique à la traction $f_{ctk,0,05}$ d’un **C25/30** ?', round(C25.fctk005, 2), 'MPa',
    r`$$f_{ctk,0,05} = 0{,}7\,f_{ctm} = 0{,}7\times2{,}56 = 1{,}80\ \text{MPa}$$
Fractile 5 % : 5 % des valeurs n'atteignent pas ce seuil. L'autre valeur caractéristique, $f_{ctk,0,95} = 1{,}3\,f_{ctm} = 3{,}33$ MPa, est rarement utilisée. $f_{ctk,0,05}$ sert à l'adhérence ($f_{ctd}$, $f_{bd}$).`,
    { src: [BA(1), BA(3)], data: [MAT], tol: 1.5 })
  .num(2, 'Module d’élasticité instantané $E_{cm}$ d’un **C25/30** ?', round(C25.Ecm, 0), 'MPa',
    r`$f_{cm} = 25 + 8 = 33$ MPa.
$$E_{cm} = 22\,000\left(\frac{33}{10}\right)^{0,3} = 22\,000\times1{,}431 = ${t(C25.Ecm, 0)}\ \text{MPa} \approx 31{,}5\ \text{GPa}$$
(le corrigé, avec $f_{ck} = 24{,}9$, trouve 31 447 MPa). $E_{cm}$ est un module **sécant** entre σ = 0 et σ = 0,4 f_cm.`,
    { src: [BA(1)], data: [MAT] })
  .num(2, r`Module différé $E_{c,eff}$ d'un C25/30 ($E_{cm} = ${t(C25.Ecm, 0)}$ MPa) avec un coefficient de fluage $\varphi = 2$ ?`, round(C25.Ecm / 3, 0), 'MPa',
    r`$$E_{c,eff} = \frac{E_{cm}}{1 + \varphi} = \frac{${t(C25.Ecm, 0)}}{3} = ${t(C25.Ecm / 3, 0)}\ \text{MPa}$$
C'est le module « à long terme », qui tient compte du fluage : les flèches à long terme sont environ 3 fois les flèches instantanées.`,
    { src: [BA(1)] })
  .num(3, 'Béton C35, ciment CEM 42,5N ($s = 0{,}25$). Calcule $\\beta_{cc}$ à **10 jours**.', 0.845, '',
    r`$$\beta_{cc}(t) = \exp\left[s\left(1 - \sqrt{28/t}\right)\right] = \exp\left[0{,}25\,(1 - \sqrt{2{,}8})\right] = \exp(-0{,}168) = 0{,}845$$
Valeurs du corrigé : 0,504 (2 j) ; 0,845 (10 j) ; 0,955 (20 j) ; → 1 à 28 j.`,
    { src: [BA(1)], tol: 1 })
  .num(3, 'C35 (f_cm = 43 MPa), $\\beta_{cc}(10\\ \\text{j}) = 0{,}845$. Calcule $f_{ck}(10\\ \\text{j})$.', 28.34, 'MPa',
    r`$f_{cm}(t) = \beta_{cc}(t)\,f_{cm} = 0{,}845\times43 = 36{,}34$ MPa, puis $f_{ck}(t) = f_{cm}(t) - 8 = 28{,}34$ MPa.
⚠️ Cette relation n'est valable qu'**à partir de 3 jours** (à 2 j, le corrigé barre la valeur 13,67). Conclusion du TD : croissance rapide les premiers jours (la moitié de la résistance en 2 jours), puis ralentissement.`,
    { src: [BA(1)], tol: 1 })
  .num(1, 'Résistance de calcul $f_{yd}$ d’un acier **B500** ?', round(fyd(500), 1), 'MPa',
    r`$$f_{yd} = \frac{f_{yk}}{\gamma_s} = \frac{500}{1{,}15} = 434{,}8\ \text{MPa}$$
(B400 : 348 MPa). On arrondit souvent à 435 MPa. γ_s = 1,15 est le coefficient partiel de l'acier en situation durable ; c'est $f_{yd}$ (et non $f_{yk}$) qui entre dans le calcul des sections d'armatures.`,
    { src: [BA(1), BA(5)], data: [ACIER], exam: true })
  .num(1, 'Un acier a une résistance de calcul $f_{yd} = 348$ MPa. Quelle est sa limite d’élasticité caractéristique $f_{yk}$ ?', 400, 'MPa',
    r`On inverse $f_{yd} = f_{yk}/\gamma_s$ avec $\gamma_s = 1{,}15$ :
$$f_{yk} = 1{,}15\times348 = 400{,}2 \approx 400\ \text{MPa}$$
→ acier **B400** (question 10 du TD1). Un B500 donnerait $f_{yd} = 434{,}8$ MPa.`,
    { src: [BA(1)], data: [ACIER], tol: 0.5 })
  .single(1, 'Module d’élasticité des aciers d’armature $E_s$ ?', ['30 GPa', '*200 GPa', '210 GPa', '500 GPa'],
    r`Pour le béton armé, l'EC2 prend **$E_s = 200$ GPa** (corrigé TD1, question 12). Attention : en construction métallique (EC3), on prend $E = 210\,000$ MPa. Ne pas mélanger les deux.`,
    { src: [BA(1)], exam: true, hints: { c: '210 GPa est la valeur de l’EC3 (charpente), pas de l’EC2.' } })
  .num(2, 'Déformation limite élastique de calcul $\\varepsilon_{yd}$ d’un acier B500 (en ‰) ?', round((fyd(500) / 200000) * 1000, 2), '‰',
    r`$$\varepsilon_{yd} = \frac{f_{yd}}{E_s} = \frac{434{,}8}{200\,000} = 2{,}17\ ‰$$
⚠️ Le corrigé TD1 calcule $f_{yk}/E_s = 2{,}5$ ‰ ; la définition de **calcul** utilise $f_{yd}$. C'est 2,17 ‰ qui intervient dans $\mu_{cu,yd}$.`,
    { src: [BA(1, 'le corrigé utilise f_yk/E_s = 2,5 ‰'), EC()], data: [ACIER], tol: 2 })
  .single(1, 'Déformation ultime du béton $\\varepsilon_{cu2}$ (diagramme parabole-rectangle, $f_{ck} \\le 50$ MPa) ?', ['2 ‰', '*3,5 ‰', '5 ‰', '10 ‰'],
    r`Corrigé TD1 (question 8) : $\varepsilon_{c2} = 2$ ‰ (déformation atteinte quand la contrainte est maximale) et **$\varepsilon_{cu2} = 3{,}5$ ‰** (déformation ultime). Au-delà, le béton est considéré comme écrasé.`,
    { src: [BA(1)], exam: true, hints: { a: '2 ‰ = ε_c2 (contrainte maximale atteinte), pas la déformation ultime.' } })
  .single(1, 'Diagramme rectangulaire simplifié : la zone comprimée a une hauteur de…', [r`$x_u$`, r`*$0{,}8\,x_u$`, r`$0{,}5\,x_u$`, r`$d$`],
    r`Pour les bétons normaux (f_ck ≤ 50 MPa) : **λ = 0,8** et η = 1 → bloc de contrainte $f_{cd}$ sur une hauteur $0{,}8\,x_u$. La résultante vaut $F_c = 0{,}8\,x_u\,b\,f_{cd}$ et s'applique à $0{,}4\,x_u$ de la fibre supérieure.`,
    { src: [BA(1)], exam: true })
  .num(2, 'Poutre en C20, $b = 18$ cm, axe neutre à $x_u = 10$ cm. Calcule la résultante de compression $F_c$ (en MN).', round(0.8 * 0.1 * 0.18 * (20 / 1.5), 3), 'MN',
    r`$f_{cd} = 20/1{,}5 = 13{,}33$ MPa.
$$F_c = 0{,}8\,x_u\,b\,f_{cd} = 0{,}8\times0{,}10\times0{,}18\times13{,}33 = 0{,}192\ \text{MN}$$
⚠️ Le corrigé affiche aussi 0,29 MN, calculé par erreur avec $f_{cd} = 20$ MPa (béton C30 de la question précédente).`,
    { src: [BA(1, 'valeur 0,29 MN erronée dans le corrigé')], tol: 2 })
  .num(3, 'Même poutre : $F_c = 0{,}192$ MN, aciers B500. Section d’acier nécessaire $A_s$ ?', round((0.8 * 0.1 * 0.18 * (20 / 1.5)) / fyd(500) * 1e4, 2), 'cm²',
    r`Équilibre : $F_s = F_c$ avec $F_s = A_s\,f_{yd}$.
$$A_s = \frac{0{,}192}{434{,}8} = 4{,}42\times10^{-4}\ \text{m}^2 = 4{,}42\ \text{cm}^2$$
→ par exemple **3HA14** (4,62 cm²) (corrigé TD1, question 14).`,
    { src: [BA(1)], data: [SECTIONS_ACIER], tol: 2 })
  .num(2, 'Béton C35 en classe XD : contrainte de compression limite à l’ELS (combinaison caractéristique) ?', 21, 'MPa',
    r`EC2 §7.2 (corrigé TD1, question 6) : en classes d'exposition XD, XF ou XS, sous combinaison caractéristique, $\sigma_c \le 0{,}6\,f_{ck} = 0{,}6\times35 = 21$ MPa (pour éviter les fissures longitudinales).`,
    { src: [BA(1), EC('EN 1992-1-1 §7.2')], tol: 0.5 })
  .num(2, 'Béton C25 : contrainte maximale sous charges quasi-permanentes pour que le fluage reste **linéaire** ?', 11.25, 'MPa',
    r`Si $\sigma_c \le 0{,}45\,f_{ck}$ sous charges quasi-permanentes, on admet un fluage linéaire (EN 1992 §3.1.4) : $0{,}45\times25 = 11{,}25$ MPa (corrigé TD1, question 7). Au-delà, le fluage est non linéaire.`,
    { src: [BA(1)], tol: 0.5 })
  .single(1, 'Allongement caractéristique sous charge maximale $\\varepsilon_{uk}$ d’un acier **ductile (classe B)** ?', ['2,5 %', '*5 %', '7,5 %', '10 %'],
    r`Corrigé TD1 (question 11) : classe A (peu ductile, écroui à froid) → $\varepsilon_{uk} = 2{,}5$ % ; **classe B (ductile, laminé à chaud) → 5 %**. Les barres HA courantes sont de classe B (B500B dans le TD6).`,
    { src: [BA(1)], exam: true })
  .num(1, 'Combien de kN/m² vaut 1 MPa ?', 1000, 'kN/m²',
    r`1 MPa = 1 N/mm² = $10^6$ N/m² = **1000 kN/m²** = 10 bar. Tableau du TD1 : 100 000 N/m² = 100 kN/m² = 0,1 MPa = 1 bar. Retenir : 1 kN/m² = 0,001 MPa. Piège classique : comparer une charge en kN/m² à une contrainte en MPa sans convertir.`,
    { src: [BA(1)], tol: 0 })
  .num(1, 'Combien de N·mm vaut 1 kN·m ?', 1e6, 'N·mm',
    r`1 kN·m = 1000 N × 1000 mm = **$10^6$ N·mm**. C'est la conversion clé des calculs de contraintes ($\sigma = 6M/bh^2$ avec M en N·mm et les longueurs en mm → MPa). Et 1 MN·m = 1000 kN·m = $10^9$ N·mm (tableau de conversions du corrigé TD1).`,
    { src: [BA(1)], tol: 0 });

// =====================================================================
// 14. BA – enrobages & dispositions (TD2)
// =====================================================================
const enr = new Bank('ba-enrobage');
enr
  .num(1, 'Marge pour tolérances d’exécution $\\Delta c_{dev}$ (Annexe nationale) ?', 10, 'mm',
    r`$c_{nom} = c_{min} + \Delta c_{dev}$ avec **$\Delta c_{dev} = 10$ mm** (valeur recommandée par l'Annexe nationale, EC2 §4.4.1.3). Elle couvre les imprécisions de pose des armatures.`,
    { src: [BA(2)], data: [ENROB], exam: true, tol: 0 })
  .single(1, 'Enrobage minimal vis-à-vis de l’**adhérence** $c_{min,b}$ pour une barre isolée ?', ['10 mm', '*le diamètre de la barre φ', '2φ', 'd_g + 5 mm'],
    r`Pour une barre isolée : **$c_{min,b} = \varphi$** (corrigé TD2 : « c_min,b > diamètre de la barre »). Ex. HA16 → 16 mm, cadre HA6 → 6 mm. On retient ensuite $c_{min} = \max(c_{min,b} ; c_{min,dur} ; 10\ \text{mm})$.`,
    { src: [BA(2)], data: [ENROB], exam: true })
  .single(1, 'Pile de pont soumise à des cycles humidification/séchage et à des projections de sels de déverglaçage : classe d’exposition ?', ['XC4', 'XD1', '*XD3', 'XS3'],
    r`XD = corrosion par les **chlorures autres que l'eau de mer** (sels de déverglaçage). **XD3 = alternativement humide et sec** (éléments de ponts, parkings). XC4 = carbonatation en alternance humide/sec sans chlorures ; XS = eau de mer (corrigé TD2, exercice 1).`,
    { src: [BA(2), SUJBA(3)], exam: true, hints: { d: 'XS concerne l’eau de mer, pas les sels de déverglaçage.' } })
  .single(1, 'Poutre à l’intérieur d’un bâtiment à **air sec** : classe d’exposition ?', ['X0', '*XC1', 'XC3', 'XD1'],
    r`**XC1** = sec ou humide en permanence (intérieur de bâtiment à faible humidité). XC3 = humidité modérée (intérieur humide, extérieur abrité). X0 = aucun risque (béton non armé). Corrigé TD2, exercice 3 ; TD4 et TD5 sont aussi en XC1.`,
    { src: [BA(2)], exam: true })
  .single(1, 'Poutre à l’intérieur d’un bâtiment à **humidité modérée** : classe d’exposition ?', ['XC1', 'XC2', '*XC3', 'XC4'],
    r`Humidité modérée (intérieur humide, ou extérieur abrité de la pluie) → **XC3** (corrigé TD2, exercice 2). XC2 = humide, rarement sec (fondations) ; XC4 = alternance humide/sec (extérieur exposé).`,
    { src: [BA(2)], exam: true })
  .num(2, 'Classe structurale **S4**, exposition **XC1** : valeur de $c_{min,dur}$ ?', 15, 'mm',
    r`Tableau 4.4N, ligne S4 : X0 10 ; **XC1 15** ; XC2/XC3 25 ; XC4 30 ; XD1 35 ; XD2 40 ; XD3 45 mm. S4 est la classe de référence pour 50 ans (corrigé TD5 : C25, XC1 → 15 mm).`,
    { src: [BA(2), BA(5)], data: [CMIN_DUR], tol: 0 })
  .num(2, 'TD2 ex.1 : pont XD3, béton C45, durée de 100 ans, barres longitudinales φ16. Enrobage nominal $c_{nom}$ ?', 60, 'mm',
    r`Classe structurale : S4 + 2 (100 ans) − 1 (béton C45, résistance élevée) = **S5** → XD3 : $c_{min,dur} = 50$ mm.
$c_{min} = \max(16\ ;\ 50\ ;\ 10) = 50$ mm → $c_{nom} = 50 + 10 = 60$ mm.
La durabilité gouverne largement l'adhérence en milieu agressif.`,
    { src: [BA(2)], data: [CMIN_DUR, ENROB] })
  .num(2, 'TD2 ex.2 : poutre XC3, C30, armatures 4HA12, cadres φ6. Enrobage nominal $c_{nom}$ ?', 30, 'mm',
    r`C30 en XC3 → réduction d'une classe : S4 − 1 = **S3** → $c_{min,dur} = 20$ mm. Barre HA12 : $c_{min,b} = 12$ mm.
$c_{min} = \max(12\ ;\ 20\ ;\ 10) = 20$ mm → $c_{nom} = 20 + 10 = 30$ mm (corrigé TD2).`,
    { src: [BA(2)], data: [CMIN_DUR, ENROB] })
  .num(2, 'TD2 ex.2 : poutre de hauteur 400 mm, $c_{nom} = 30$ mm (sur les cadres φ6), barres HA12. Hauteur utile $d$ ?', 358, 'mm',
    r`$$d = h - c_{nom} - \varphi_t - \varphi_L/2 = 400 - 30 - 6 - 6 = 358\ \text{mm}$$
d est la distance entre la fibre la plus comprimée et le centre de gravité des aciers tendus.`,
    { src: [BA(2)], tol: 0.5 })
  .num(3, 'TD2 ex.3 : XC1, C35, barres HA20 ($c_{nom} = 30$ mm) et cadres HA6 ($c_{nom} = 20$ mm). Quelle épaisseur de cale faut-il réellement prévoir sous les cadres ?', 25, 'mm',
    r`Pour garantir 30 mm sur les HA20, il faut au moins $30 - 6 = 24$ mm sous les cadres (≥ 20 mm requis pour les cadres eux-mêmes). Les cales existent de 5 en 5 mm → **25 mm** (corrigé TD2). L'enrobage nominal est mesuré jusqu'à la **première armature rencontrée** (le cadre).`,
    { src: [BA(2)], tol: 0 })
  .single(2, 'Granulat maximal $d_g = 15$ mm, barres HA12 : espacement horizontal minimal entre barres ?', ['12 mm', '15 mm', '*20 mm', '25 mm'],
    r`$e_h \ge \max(20\ \text{mm}\ ;\ \varphi_L\ ;\ d_g + 5\ \text{mm}) = \max(20\ ;\ 12\ ;\ 20) = 20$ mm (corrigé TD2). L'espacement doit laisser passer le béton (granulats) et assurer l'adhérence.`,
    { src: [BA(2)], exam: true })
  .num(2, 'Granulat maximal $d_g = 25$ mm, barres HA20 : espacement horizontal minimal $e_h$ ?', 30, 'mm',
    r`$e_h \ge \max(20\ \text{mm}\ ;\ \varphi_L\ ;\ d_g + 5\ \text{mm})$ :
$$e_h \ge \max(20\ ;\ 20\ ;\ 25 + 5) = 30\ \text{mm}$$
Ici c'est la taille du **granulat** qui gouverne : le béton doit pouvoir passer entre les barres pour bien les enrober.`,
    { src: [BA(2)], tol: 0 })
  .single(2, 'Pour une durée d’utilisation de projet de **100 ans**, la classe structurale…', ['diminue de 1', 'ne change pas', '*augmente de 2', 'augmente de 1'],
    r`Tableau 4.3NF : durée de 100 ans → **+2 classes** (S4 → S6 en partant de la référence). Une résistance de béton élevée ou un enrobage compact peuvent faire baisser d'une classe. Pont du TD2 : S4 + 2 − 1 = S5.`,
    { src: [BA(2)], data: [CMIN_DUR] })
  .num(3, 'TD2 ex.5 : poutre extérieure, humidité modérée et chlorures (XD1), $f_{ck} = 30$ MPa. Enrobage nominal ?', 45, 'mm',
    r`XD1 en S4 (pas de réduction pour un C30 en XD1) → $c_{min,dur} = 35$ mm ; $c_{min} = \max(\varphi\ ;\ 35\ ;\ 10) = 35$ mm → $c_{nom} = 35 + 10 = 45$ mm (corrigé TD2, exercice 5).`,
    { src: [BA(2)], data: [CMIN_DUR, ENROB], tol: 0 })
  .single(2, 'TD2 ex.5 (b = 20 cm, c_nom = 45 mm, cadres φ6, d_g = 15, besoin 7,6 cm²) : quelle solution respecte l’espacement minimal ?', ['2HA20 + 1HA14 sur un lit', '3HA12 + 3HA14 sur un lit', '4HA12 + 4HA10', '*4HA16 (8,04 cm²)'],
    r`Le corrigé calcule les espacements : 2HA20 + 1HA14 → 12 mm ; 3HA12 + 3HA14 → 18 mm ; 4HA12 + 4HA10 → 10 mm ; **4HA16 → 46 mm ≥ 20 mm** (disposé en 2 lits), d = 385 mm. ⚠️ Le corrigé annonce 9,36 cm² pour 2HA20 + 1HA14 : en réalité 6,28 + 1,54 = 7,82 cm².`,
    { src: [BA(2)], data: [SECTIONS_ACIER] })
  .num(2, 'Section d’acier de **3HA20** ?', round(barArea(20, 3), 2), 'cm²',
    r`$$A_s = 3\times\frac{\pi\times20^2}{4} = 3\times314{,}2 = 942\ \text{mm}^2 = 9{,}42\ \text{cm}^2$$
À lire dans le tableau des sections (corrigé TD1). Retenir : HA10 0,79 ; HA12 1,13 ; HA14 1,54 ; HA16 2,01 ; HA20 3,14 ; HA25 4,91 cm² par barre.`,
    { src: [BA(1), BA(2)], data: [SECTIONS_ACIER], exam: true })
  .multi(2, 'Il faut au moins **6 cm²** d’acier. Coche les solutions qui conviennent.', ['*4HA14', '*2HA20', '*6HA12', '3HA14', '5HA12'],
    r`4HA14 = 6,16 ✓ ; 2HA20 = 6,28 ✓ ; 6HA12 = 6,79 ✓ ; 3HA14 = 4,62 ✗ ; 5HA12 = 5,65 ✗ (corrigé TD2, exercice 4, qui propose aussi 2HA16 + 2HA14 = 7,1 cm²). On choisit ensuite selon la largeur de la poutre (espacements).`,
    { src: [BA(2)], data: [SECTIONS_ACIER] })
  .num(2, 'Poutre $h = 450$ mm, $c_{nom} = 25$ mm, cadres φ6, aciers en 2 lits (HA16 + HA14), centre de gravité pris entre les lits. Hauteur utile réelle $d$ (corrigé TD5) ?', 403, 'mm',
    r`Le corrigé TD5 calcule $d_{réel} = 450 - 25 - 6 - 16 = 403$ mm (centre de gravité au niveau du contact entre le lit de HA16 et le lit supérieur) ≥ $d_{calcul} = 400$ mm → OK. Approximation courante : $d \approx 0{,}9h = 405$ mm.`,
    { src: [BA(5)], tol: 0.5 });

// =====================================================================
// 15. BA – adhérence & ancrages (TD3)
// =====================================================================
const anc = new Bank('ba-ancrage');
anc
  .single(1, 'Contrainte ultime d’adhérence $f_{bd}$ :', [r`*$2{,}25\,\eta_1\,\eta_2\,f_{ctd}$`, r`$0{,}7\,f_{ctm}$`, r`$f_{ck}/1{,}5$`, r`$2{,}25\,f_{cd}$`],
    r`Corrigé TD3 (EC2 §8.4.2) : $f_{bd} = 2{,}25\,\eta_1\,\eta_2\,f_{ctd}$ avec $f_{ctd} = f_{ctk,0,05}/\gamma_c$ ; η1 = 1 en bonnes conditions d'adhérence, 0,7 sinon ; η2 = 1 pour φ ≤ 32 mm.`,
    { src: [BA(3)], data: [ANCR], exam: true })
  .single(1, 'Valeur de $\\eta_1$ en conditions d’adhérence **médiocres** ?', ['1,0', '*0,7', '0,5', '1,4'],
    r`η1 = 1 si les conditions d'adhérence sont **bonnes**, **0,7** dans les autres cas, par exemple des barres en partie supérieure d'un élément de hauteur > 250 mm (bulles et ressuage sous les barres hautes). Corrigé TD3, cas 1-c.`,
    { src: [BA(3)], exam: true })
  .num(2, 'Résistance de calcul en traction $f_{ctd}$ d’un **C25/30** ?', round(C25.fctd, 2), 'MPa',
    r`$f_{ctm} = 2{,}56$ MPa → $f_{ctk,0,05} = 0{,}7\times2{,}56 = 1{,}80$ MPa →
$$f_{ctd} = \frac{f_{ctk,0,05}}{1{,}5} = 1{,}20\ \text{MPa}$$
(corrigé TD3).`,
    { src: [BA(3)], data: [MAT, ANCR], tol: 1.5 })
  .num(2, 'Dalle en C25/30, barres en partie inférieure (bonnes conditions). Calcule $f_{bd}$.', round(fbd(25), 2), 'MPa',
    r`$f_{ctd} = 0{,}7\times2{,}56/1{,}5 = 1{,}20$ MPa, puis :
$$f_{bd} = 2{,}25\times1\times1\times1{,}20 = 2{,}69\ \text{MPa}$$
(corrigé TD3, cas 1-a). Barres en partie inférieure → η1 = 1 ; φ ≤ 32 mm → η2 = 1.`,
    { src: [BA(3)], data: [ANCR], exam: true, tol: 1.5 })
  .num(2, 'Dalle C25/30, HA8 en B500, bonnes conditions ($f_{bd} = 2{,}69$ MPa). Longueur d’ancrage de référence $l_{b,rqd}$ ?', round(lbrqd(8, 25, 500), 0), 'mm',
    r`$$l_{b,rqd} = \frac{\varphi}{4}\,\frac{f_{yd}}{f_{bd}} = \frac{8}{4}\times\frac{434{,}8}{2{,}69} = 323\ \text{mm}$$
(corrigé TD3). C'est aussi la « longueur de scellement droit » pour une barre utilisée à $f_{yd}$.`,
    { src: [BA(3)], data: [ANCR], tol: 1.5 })
  .num(2, 'Poutre en C30/37, barres en partie inférieure. Calcule $f_{bd}$.', round(fbd(30), 2), 'MPa',
    r`$f_{ctm} = 0{,}3\times30^{2/3} = 2{,}90$ ; $f_{ctk} = 2{,}03$ ; $f_{ctd} = 1{,}35$ MPa.
$$f_{bd} = 2{,}25\times1{,}35 = 3{,}04\ \text{MPa}$$
(corrigé TD3, cas 1-b).`,
    { src: [BA(3)], data: [MAT, ANCR], tol: 1.5 })
  .num(3, 'Poutre C30/37, HA16 en **B400**, partie inférieure ($f_{bd} = 3{,}04$ MPa). Calcule $l_{b,rqd}$.', round(lbrqd(16, 30, 400), 0), 'mm',
    r`$f_{yd} = 400/1{,}15 = 347{,}8$ MPa.
$$l_{b,rqd} = \frac{16}{4}\times\frac{347{,}8}{3{,}04} = 457\ \text{mm}$$
Avec tous les $\alpha_i = 1$ : $l_{bd} = l_{b,rqd} = 457$ mm ≥ $l_{b,min}$ = 160 mm (corrigé TD3).`,
    { src: [BA(3)], data: [ANCR], tol: 1.5 })
  .num(3, 'Poutre de 450 mm en C25/30, HA14 en **B400** placés en **partie supérieure**. Calcule $l_{b,rqd}$.', round(lbrqd(14, 25, 400, 0.7), 0), 'mm',
    r`Partie supérieure avec h > 250 mm → conditions médiocres → η1 = 0,7 : $f_{bd} = 2{,}25\times0{,}7\times1{,}20 = 1{,}89$ MPa.
$$l_{b,rqd} = \frac{14}{4}\times\frac{347{,}8}{1{,}89} = 646\ \text{mm}$$
(corrigé TD3, cas 1-c). Sans η1, on trouverait 452 mm : erreur de 30 % côté insécurité.`,
    { src: [BA(3)], data: [ANCR], tol: 1.5 })
  .num(2, r`Barre tendue HA16 avec $l_{b,rqd} = 457$ mm : calcule $l_{b,min} = \max(0{,}3\,l_{b,rqd}\ ;\ 10\varphi\ ;\ 100\ \text{mm})$.`, 160, 'mm',
    r`$\max(0{,}3\times457 = 137\ ;\ 10\times16 = 160\ ;\ 100) = 160$ mm (corrigé TD3 : $L_{b,min} = 160$ mm). La longueur d'ancrage de calcul $l_{bd} = \alpha_1\cdots\alpha_5\,l_{b,rqd}$ ne peut pas descendre sous $l_{b,min}$.`,
    { src: [BA(3), EC('EN 1992-1-1 §8.4.4')], tol: 0 })
  .single(2, 'Béton C25/30, acier B500, bonnes conditions : longueur d’ancrage de référence approximative ?', [r`$30\varphi$`, r`$35{,}7\varphi$`, r`*$40{,}4\varphi$`, r`$46{,}8\varphi$`],
    r`Corrigé TD3, exercice 2 (B500, bonnes conditions) : $l_{b,rqd} \approx 46{,}8\varphi$ (C20) ; **40,4φ (C25)** ; 35,7φ (C30) ; 32,2φ (C35). Formule simple : $l_{b,rqd} \approx 103{,}5\,\varphi/f_{ctm}$. Plus le béton est résistant, plus l'ancrage est court.`,
    { src: [BA(3)], exam: true, hints: { d: '46,8φ correspond au C20.' } })
  .num(2, 'C25/30, HA12 en B500, bonnes conditions. Calcule $l_{b,rqd}$.', round(lbrqd(12, 25, 500), 0), 'mm',
    r`$$l_{b,rqd} = \frac{12}{4}\times\frac{434{,}8}{2{,}69} = 484\ \text{mm} \approx 40{,}4\times12$$
(corrigé TD3, exercice 3). Pour un ancrage courbe, cette longueur est la longueur **développée** $L_1 + L_2 + L_3$.`,
    { src: [BA(3)], data: [ANCR], tol: 1.5 })
  .single(2, 'Dans quel cas les conditions d’adhérence sont-elles « médiocres » ?', [
    '*barres en partie supérieure d’un élément de plus de 250 mm de hauteur',
    'barres en partie inférieure d’une dalle',
    'barres de diamètre ≤ 32 mm',
    'béton de classe C25',
  ], r`Corrigé TD3 (figure EC2) : les barres situées dans la **partie haute** d'un élément de hauteur > 250 mm (zone hachurée sur la figure) sont en conditions médiocres (η1 = 0,7), car le béton y est moins compact (ressuage). En partie basse : bonnes conditions.`,
    { src: [BA(3)], exam: true })
  .num(2, 'Diamètre minimal du mandrin de cintrage pour une barre HA12 ($\\varphi \\le 16$ mm) ?', 48, 'mm',
    r`EC2 : $\varphi_{m,min} = 4\varphi$ si φ ≤ 16 mm, $7\varphi$ si φ > 16 mm → $4\times12 = 48$ mm. On choisit ensuite un mandrin réel dans la série de Renard (16, 20, 25, 32, 40, **50**, 63…) → 50 mm (corrigé TD3, exercice 3).`,
    { src: [BA(3)], tol: 0 })
  .single(2, 'Que signifie l’indice « rqd » de $l_{b,rqd}$ ?', ['réduit', '*required (requise)', 'radial', 'recouvrement'],
    r`Corrigé TD3 : b = « bond » (adhérence) et **rqd = « required »** (exigée, nécessaire). $l_{b,rqd}$ est la longueur d'ancrage de **référence** ; la longueur de calcul $l_{bd}$ l'affecte des coefficients α1 à α5.`,
    { src: [BA(3)] })
  .num(3, 'Poteau C35, HA14 en B500 : $l_{b,rqd} = 451$ mm. Longueur de recouvrement retenue dans le corrigé TD4 ($l_r = 0{,}7\,l_{b,rqd}$) ?', 316, 'mm',
    r`$$l_r = 0{,}7\times451 = 316\ \text{mm}$$
(corrigé TD4 Q3, recouvrement des barres du poteau P1 sur celles du poteau inférieur). $l_{b,rqd} = (14/4)\times434{,}8/3{,}37 = 451$ mm pour un C35 ($f_{bd} = 3{,}37$ MPa).`,
    { src: [BA4(true)], tol: 1.5 });

// =====================================================================
// 16. BA – poteaux (TD4)
// =====================================================================
const pot = new Bank('ba-poteaux');
pot
  .single(1, 'Élancement d’un poteau $\\lambda$ :', [r`*$l_0/i$ avec $i = \sqrt{I/A}$`, r`$l_0/h$`, r`$i/l_0$`, r`$l_0\,i$`],
    r`Corrigé TD4 : « L'élancement λ d'une pièce comprimée de section constante est le rapport de sa longueur de flambement $l_0$ au rayon de giration $i$ de la section droite du béton seul (non fissurée), calculé dans le plan de flambement. » Rectangle : $i = h/\sqrt{12}$.`,
    { src: [BA4(false)], data: [POT], exam: true })
  .num(2, 'Rayon de giration d’un poteau rectangulaire de dimension $h = 0{,}20$ m dans le plan de flambement ?', round((0.2 / Math.sqrt(12)) * 1000, 1), 'mm',
    r`$$i = \sqrt{\frac{I}{A}} = \sqrt{\frac{bh^3/12}{bh}} = \frac{h}{\sqrt{12}} = \frac{200}{3{,}464} = 57{,}7\ \text{mm}$$
(corrigé TD4 : 5,77·10⁻² m pour le poteau P1 autour de Y).`,
    { src: [BA4(false)], data: [POT], tol: 1 })
  .num(2, 'Poteau P2 : $\\lambda = 34$. Calcule le coefficient $\\alpha$.', round(alpha(34), 3), '',
    r`$\lambda \le 60$ :
$$\alpha = \frac{0{,}86}{1 + (\lambda/62)^2} = \frac{0{,}86}{1 + (34/62)^2} = \frac{0{,}86}{1{,}301} = 0{,}661$$
(corrigé TD4 Q3). α réduit la capacité portante pour tenir compte du flambement.`,
    { src: [BA4(true)], data: [POT], exam: true, tol: 1 })
  .num(2, 'Poteau P1 : $\\lambda = 36$. Calcule $\\alpha$.', round(alpha(36), 3), '',
    r`$\lambda = 36 \le 60$ :
$$\alpha = \frac{0{,}86}{1 + (36/62)^2} = \frac{0{,}86}{1{,}337} = 0{,}643$$
(corrigé TD4 Q3). Plus le poteau est élancé, plus α diminue, donc plus la charge admissible baisse.`,
    { src: [BA4(true)], data: [POT], tol: 1 })
  .num(2, 'Poteau P0 : $\\lambda = 42$. Calcule $\\alpha$.', round(alpha(42), 3), '',
    r`$$\alpha = \frac{0{,}86}{1 + (42/62)^2} = \frac{0{,}86}{1{,}459} = 0{,}589$$
(corrigé TD4 Q3). Pour $60 < \lambda \le 120$, on utiliserait $\alpha = (32/\lambda)^{1,3}$.`,
    { src: [BA4(true)], data: [POT], tol: 1 })
  .num(2, 'Poteau P1 : longueur de flambement $l_0 = 2{,}04$ m, rayon de giration $i = 5{,}77$ cm. Élancement ?', round(2.04 / 0.0577, 1), '',
    r`$$\lambda = \frac{l_0}{i} = \frac{2{,}04}{0{,}0577} = 35{,}4$$
(corrigé TD4 Q2 : 35,3). Autour de l'autre axe : $l_0 = 1{,}75$ m, $i = 6{,}35$ cm → λ = 27,6. On retient le plus grand → flambement dans le plan 0XZ (le sujet impose λ = 36).`,
    { src: [BA4(false)], data: [POT], tol: 1.5 })
  .num(2, 'Poteau P2 ($22\\times20$ cm, $N_{Ed} = 420$ kN, B500) : calcule $A_{s,min} = \\max(0{,}10N_{Ed}/f_{yd}\\ ;\\ 0{,}002A_c)$.', round(Math.max((0.1 * 420e3) / fyd(500), 0.002 * 220 * 200) / 100, 3), 'cm²',
    r`$0{,}10\times420\,000/434{,}8 = 96{,}6$ mm² ; $0{,}002\times220\times200 = 88$ mm².
$$A_{s,min} = \max(96{,}6\ ;\ 88) = 96{,}6\ \text{mm}^2 = 0{,}966\ \text{cm}^2$$
(corrigé TD4 Q3). Le calcul de résistance ne demandant pas d'acier, on place le minimum… mais au moins 4 barres HA8.`,
    { src: [BA4(true), EC('EN 1992-1-1 §9.5.2')], data: [POT], tol: 1.5 })
  .single(1, 'Diamètre minimal des armatures longitudinales d’un poteau ?', ['6 mm', '*8 mm', '10 mm', '12 mm'],
    r`Corrigé TD4 : « les aciers mini sont des **HA8** pour les poteaux » (EC2 §9.5.2 : φ_L,min = 8 mm). Pour P2, A_s,min = 0,97 cm² serait couvert par moins de 4HA8, mais on met au minimum **4HA8** (une barre par angle).`,
    { src: [BA4(true)], exam: true })
  .num(2, r`Poteau de largeur $b = 200$ mm, armatures longitudinales HA14. Espacement maximal des cadres $s_{cl,t,max} = \min(20\varphi_L\ ;\ b\ ;\ 400\ \text{mm})$ ?`, 200, 'mm',
    r`$\min(20\times14 = 280\ ;\ 200\ ;\ 400) = 200$ mm (corrigé TD4, poteau P1). Pour P2 (HA8) : $\min(160 ; 200 ; 400) = 160$ mm, réduit à $0{,}6\times160 = 96$ mm dans les zones de recouvrement.`,
    { src: [BA4(true)], tol: 0 })
  .single(2, 'TD4, poteau P2 ($N_{Ed} = 420$ kN, C35, 22 × 20 cm) : quel ferraillage longitudinal retient le corrigé ?', ['aucun acier', '*4HA8 (section minimale)', '6HA14', '4HA32'],
    r`L'équation donne $A_s < 0$ : le béton seul suffit, **pas d'acier de résistance**. On place la section minimale : $A_{s,min} = 0{,}97$ cm² et au moins 4 barres HA8 → **4HA8 = 2,01 cm²** (ρ = 0,5 %).`,
    { src: [BA4(true)], exam: true })
  .single(2, 'TD4, poteau P1 ($N_{Ed} = 750$ kN, λ = 36) : quel ferraillage retient le corrigé ?', ['4HA8', '4HA12', '*6HA14 (9,24 cm²)', '4HA32'],
    r`Le calcul donne $A_s \approx 8{,}6$ cm² (9,6 avec la valeur approchée de $k_h$) > $A_{s,min} = 1{,}73$ cm² → **6HA14 = 9,24 cm²**, ρ = 2,1 % (entre 2 et 3 % pour un acier de résistance). Cadres espacés au plus de 200 mm.`,
    { src: [BA4(true)], data: [SECTIONS_ACIER] })
  .single(3, 'TD4, poteau P0 ($N_{Ed} = 1085$ kN, λ = 42, 22 × 20 cm) : conclusion du corrigé ?', ['4HA8 suffisent', '6HA14 suffisent', '*A_s ≈ 30 cm² (ρ ≈ 6,8 %) : section de béton insuffisante, il faut agrandir le poteau', 'le poteau ne flambe pas'],
    r`Le calcul donne $A_s \approx 29{,}8$ cm², soit ρ = 6,8 % de la section : c'est **beaucoup trop** (le corrigé : « il faut rester entre 2 et 3 % ») et au-delà de la limite de 4 %. Il faut augmenter la section de béton du poteau (ou la classe de béton) plutôt que d'ajouter de l'acier.`,
    { src: [BA4(true)] })
  .num(2, 'Poteau du TD4 : $c_{nom} = 20$ mm sous les cadres φ6, barres longitudinales HA14. Distance $d\'$ du centre des barres au parement ?', 33, 'mm',
    r`$$d' = c_{nom} + \varphi_t + \varphi_L/2 = 20 + 6 + 7 = 33\ \text{mm}$$
puis $\delta = d'/h = 33/200 = 0{,}165$ (intervient dans $k_h$). Le corrigé garde 20 mm sous les cadres car 24 − 6 = 18 mm serait insuffisant pour les cadres eux-mêmes.`,
    { src: [BA4(true)], tol: 0 })
  .num(3, r`Poteau contreventé de hauteur $l = 3$ m, raideurs relatives aux extrémités $k_1 = k_2 = 0{,}1$. Longueur de flambement $l_0 = 0{,}5\,l\sqrt{(1 + \frac{k_1}{0{,}45 + k_1})(1 + \frac{k_2}{0{,}45 + k_2})}$ ?`, round(1.5 * (1 + 0.1 / 0.55), 3), 'm',
    r`$1 + \dfrac{0{,}1}{0{,}55} = 1{,}182$ ; avec $k_1 = k_2$ la racine vaut 1,182.
$$l_0 = 0{,}5\times3\times1{,}182 = 1{,}77\ \text{m}$$
Bornes : $0{,}5\,l \le l_0 \le l$ (encastrement parfait → 0,5l ; articulations → l). Formule du corrigé TD4 Q2.`,
    { src: [BA4(false), EC('EN 1992-1-1 §5.8.3.2')], tol: 1.5 })
  .single(2, 'Dans le calcul des raideurs pour $l_0$ (TD4), pourquoi divise-t-on l’inertie des poutres par 1,5 ?', ['pour tenir compte du fluage', '*parce que l’élément est fissuré : on néglige le béton tendu', 'par sécurité vis-à-vis du feu', 'parce que les poutres sont en T'],
    r`Corrigé TD4 Q2 : « l'élément étant fissuré, on ne prend pas en compte le béton tendu dans le calcul d'inertie : $I_f = I/1{,}5$ ». Une poutre fissurée est plus souple, elle retient moins la rotation du poteau, ce qui augmente $l_0$.`,
    { src: [BA4(false)] });

// =====================================================================
// 17. BA – flexion simple (TD5, TD6)
// =====================================================================
const fl = new Bank('ba-flexion');
const mu5 = 0.15 / (0.2 * 0.4 ** 2 * C25.fcd);
const beta5 = (1 + Math.sqrt(1 - 2 * mu5)) / 2;
const As5 = 0.15 / (beta5 * 0.4 * fyd(500)) * 1e4;
const epsyd = fyd(500) / 200000;
const ayd = 3.5 / (3.5 + 1000 * epsyd);
const muyd = 0.8 * ayd * (1 - 0.4 * ayd);
// TD5 Q2 (B400, C30)
const mu52 = 0.175 / (0.2 * 0.16 * C30.fcd);
const beta52 = (1 + Math.sqrt(1 - 2 * mu52)) / 2;
const As52 = (0.175 / (beta52 * 0.4 * fyd(400))) * 1e4;
fl
  .num(2, r`TD5, poutre PT3 : $M_u = 150$ kN·m, $b = 0{,}20$ m, $d = 0{,}40$ m, C25/30. Calcule le moment réduit $\mu_{cu}$.`, round(mu5, 3), '',
    r`$f_{cd} = 25/1{,}5 = 16{,}67$ MPa.
$$\mu_{cu} = \frac{M_u}{b\,d^2 f_{cd}} = \frac{0{,}150}{0{,}20\times0{,}40^2\times16{,}67} = 0{,}281$$
Unités cohérentes : MN·m, m et MPa (= MN/m²).`,
    { src: [BA(5)], data: [FLEX], exam: true, tol: 1 })
  .num(2, 'Moment réduit limite $\\mu_{cu,yd}$ pour un acier **B500** ?', round(muyd, 3), '',
    r`$\varepsilon_{yd} = 434{,}8/200\,000 = 2{,}17$ ‰ ; $\alpha_{yd} = \dfrac{3{,}5}{3{,}5 + 2{,}17} = 0{,}617$.
$$\mu_{cu,yd} = 0{,}8\,\alpha_{yd}\,(1 - 0{,}4\,\alpha_{yd}) = 0{,}8\times0{,}617\times0{,}753 = 0{,}372$$
(corrigé TD5 : 0,3717). Au-delà, les aciers tendus ne travaillent plus à $f_{yd}$ → aciers comprimés ou section en Té.`,
    { src: [BA(5), EC()], data: [FLEX], tol: 1 })
  .single(2, '$\\mu_{cu} = 0{,}281 < \\mu_{cu,yd} = 0{,}372$ : que conclure ?', ['*pas d’aciers comprimés nécessaires ; les aciers tendus travaillent à f_yd', 'il faut des aciers comprimés', 'la section est trop grande', 'il faut passer en section en Té'],
    r`Si $\mu_{cu} \le \mu_{cu,yd}$, l'axe neutre est assez haut pour que l'acier tendu dépasse $\varepsilon_{yd}$ : il travaille à $\sigma_s = f_{yd}$ et **aucun acier comprimé n'est nécessaire** (corrigé TD5 : « OK »). Sinon, on ajoute des aciers comprimés (avec $d'$) ou on profite de la table de compression (Té).`,
    { src: [BA(5)], exam: true })
  .num(2, 'Pour $\\mu_{cu} = 0{,}281$, calcule le bras de levier relatif $\\beta = z/d$.', round(beta5, 3), '',
    r`$$\beta = \frac{1 + \sqrt{1 - 2\mu_{cu}}}{2} = \frac{1 + \sqrt{0{,}4375}}{2} = \frac{1 + 0{,}661}{2} = 0{,}831$$
(corrigé TD5). Équivalent : $\alpha_u = 1{,}25(1 - \sqrt{1 - 2\mu}) = 0{,}423$ et $\beta = 1 - 0{,}4\,\alpha_u$.`,
    { src: [BA(5), EC()], data: [FLEX], tol: 1 })
  .num(2, 'TD5 PT3 : $M_u = 150$ kN·m, $\\beta = 0{,}831$, $d = 0{,}40$ m, B500. Section d’acier tendu $A_s$ ?', round(As5, 2), 'cm²',
    r`$$A_s = \frac{M_u}{\beta\,d\,f_{yd}} = \frac{0{,}150}{0{,}831\times0{,}40\times434{,}8} = 1{,}038\times10^{-3}\ \text{m}^2 = 10{,}38\ \text{cm}^2$$
(corrigé TD5). On choisit par exemple 3HA16 + 3HA14 = 10,65 cm².`,
    { src: [BA(5)], data: [FLEX, SECTIONS_ACIER], exam: true, tol: 1.5 })
  .num(2, 'TD5 PT3 : section minimale (non-fragilité) $A_{s,min} = 0{,}26\\,\\frac{f_{ctm}}{f_{yk}}\\,b\\,d$ avec C25/30, B500, $b = 0{,}20$, $d = 0{,}40$ m ?', round((0.26 * C25.fctm / 500) * 0.2 * 0.4 * 1e4, 2), 'cm²',
    r`$$A_{s,min} = 0{,}26\times\frac{2{,}56}{500}\times0{,}20\times0{,}40 = 1{,}07\times10^{-4}\ \text{m}^2 = 1{,}07\ \text{cm}^2$$
à comparer aussi à $0{,}0013\,b\,d = 1{,}04$ cm² (corrigé TD5 : A_CNF = 1,07 cm²). Largement couvert par 10,38 cm².`,
    { src: [BA(5), EC('EN 1992-1-1 §9.2.1.1')], tol: 2 })
  .num(1, 'Section maximale d’armatures $A_{s,max} = 0{,}04\\,A_c$ pour une poutre $20\\times45$ cm ?', 36, 'cm²',
    r`$A_c = 20\times45 = 900$ cm² :
$$A_{s,max} = 0{,}04\times900 = 36\ \text{cm}^2$$
(corrigé TD5). Au-delà, le bétonnage devient impossible (barres trop serrées) et la section est mal conçue : il faut l'agrandir.`,
    { src: [BA(5), EC('EN 1992-1-1 §9.2.1.1')], tol: 0 })
  .single(2, 'Il faut $A_s = 10{,}38$ cm². Le choix **3HA16 + 3HA14** convient-il en section ?', ['*oui : 6,03 + 4,62 = 10,65 cm² ≥ 10,38', 'non : 9,24 cm² < 10,38', 'non : il faut 4HA20', 'oui mais seulement en B400'],
    r`3HA16 = 6,03 cm² et 3HA14 = 4,62 cm² → **10,65 cm² ≥ 10,38** ✓ (corrigé TD5, question 1.2). On vérifie ensuite l'enrobage ($c_{nom} = 25$ mm), l'espacement ($e_h \ge 20$ mm) et que $d_{réel} = 403 \ge d_{calcul} = 400$ mm.`,
    { src: [BA(5)], data: [SECTIONS_ACIER], exam: true })
  .num(3, r`TD5 question 2 : $M_u = 175$ kN·m, $b = 0{,}20$ m, $d = 0{,}40$ m, **C30**, **B400** (pas d'aciers comprimés). Calcule $A_s$.`, round(As52, 2), 'cm²',
    r`$f_{cd} = 20$ MPa ; $\mu_{cu} = \dfrac{0{,}175}{0{,}2\times0{,}16\times20} = ${t(mu52, 3)}$.
B400 : $\varepsilon_{yd} = 1{,}74$ ‰ → $\alpha_{yd} = 0{,}668$ → $\mu_{cu,yd} = 0{,}392$ > μ → pas d'aciers comprimés.
$\beta = (1 + \sqrt{1 - 2\times${t(mu52, 3)}})/2 = ${t(beta52, 3)}$.
$$A_s = \frac{0{,}175}{${t(beta52, 3)}\times0{,}40\times347{,}8} = ${t(As52, 2)}\ \text{cm}^2$$
(pas de corrigé fourni : valeur calculée avec la méthode du TD5). Le sujet propose 3HA20 + 3HA16 = 15,45 cm² ✓.`,
    { src: [SUJBA(8), EC('corrigé non fourni, calcul selon la méthode du TD5')], data: [FLEX, SECTIONS_ACIER], tol: 1.5 })
  .single(3, r`TD5 poutre PT5 : $M_u = 432$ kN·m, $b = 0{,}22$ m, $d = 0{,}45$ m, C35, B500. Conclusion du calcul de $\mu_{cu}$ ?`, [
    r`$\mu_{cu} = 0{,}21$ : pas d'aciers comprimés`,
    r`*$\mu_{cu} \approx 0{,}42 > 0{,}372$ : il faut des aciers comprimés (ou une section en Té)`,
    r`$\mu_{cu} = 0{,}372$ exactement`,
    'la poutre ne peut pas être calculée',
  ], r`$f_{cd} = 35/1{,}5 = 23{,}33$ MPa.
$$\mu_{cu} = \frac{0{,}432}{0{,}22\times0{,}45^2\times23{,}33} = 0{,}416 > \mu_{cu,yd} = 0{,}372$$
Les aciers tendus ne travailleraient plus à $f_{yd}$ : on ajoute des **aciers comprimés** (à $d' = 0{,}04$ m) ou on augmente la section (pas de corrigé fourni pour cette question).`,
    { src: [SUJBA(8), EC('corrigé non fourni')], data: [FLEX] })
  .num(2, 'TD5 PT3 : $\\beta = 0{,}831$ et $d = 0{,}40$ m. Bras de levier $z$ ?', round(beta5 * 0.4, 3), 'm',
    r`$$z = \beta\,d = 0{,}831\times0{,}40 = 0{,}332\ \text{m}$$
z est la distance entre la résultante de compression du béton (à $0{,}4\,x_u$ de la fibre supérieure) et les aciers tendus : $M_u = F_s\,z = A_s\,f_{yd}\,z$.`,
    { src: [BA(5)], data: [FLEX], tol: 1 })
  .num(2, 'Pour $\\mu_{cu} = 0{,}281$, calcule la position relative de l’axe neutre $\\alpha_u = 1{,}25(1 - \\sqrt{1 - 2\\mu_{cu}})$.', round(1.25 * (1 - Math.sqrt(1 - 2 * mu5)), 3), '',
    r`$$\alpha_u = 1{,}25\times(1 - \sqrt{1 - 0{,}5625}) = 1{,}25\times(1 - 0{,}661) = 0{,}423$$
$x_u = \alpha_u\,d = 0{,}169$ m. Comme $\alpha_u < \alpha_{yd} = 0{,}617$, l'acier tendu est plastifié (ε_s > ε_yd).`,
    { src: [EC('relation EC2 standard, cohérente avec le corrigé TD5')], data: [FLEX], tol: 1.5 })
  .order(2, 'Remets dans l’ordre le calcul d’une section rectangulaire en flexion simple (TD5).', [
    r`Calculer $f_{cd}$ et $f_{yd}$`,
    r`Calculer $\mu_{cu} = M_u/(b d^2 f_{cd})$`,
    r`Comparer à $\mu_{cu,yd}$ (0,372 en B500)`,
    r`Calculer $\beta = (1 + \sqrt{1 - 2\mu_{cu}})/2$`,
    r`Calculer $A_s = M_u/(\beta d f_{yd})$`,
    'Vérifier A_s,min et A_s,max, choisir les barres, vérifier enrobage, e_h et d réel',
  ], r`C'est l'enchaînement du corrigé TD5 (poutre PT3) : $f_{cd} = 16{,}67$ → $\mu_{cu} = 0{,}281$ → < 0,372 OK → $\beta = 0{,}831$ → $A_s = 10{,}38$ cm² → $A_{CNF} = 1{,}07$, $A_{max} = 36$ → 3HA16 + 3HA14, $c_{nom} = 25$ mm, $e_h$ OK, $d_{réel} = 403$ mm.`,
    { src: [BA(5)] })
  .single(3, r`TD6 : poutre $b = 0{,}20$ m, $d = 0{,}35$ m, C25/30, $M_u = 190$ kN·m, calculée en section rectangulaire. Que trouve-t-on ?`, [
    r`$\mu_{cu} \approx 0{,}28$ : section rectangulaire suffisante`,
    r`*$\mu_{cu} \approx 0{,}47 > 0{,}372$ : il faut des aciers comprimés ou étudier la poutre en Té`,
    r`$\mu_{cu} \approx 0{,}10$`,
    r`$\mu_{cu} < 0$`,
  ], r`$$\mu_{cu} = \frac{0{,}190}{0{,}20\times0{,}35^2\times16{,}67} = 0{,}465 > 0{,}372$$
Le sujet le prévoit : « si vous trouvez μ_cu > μ_cu,yd, ne faites pas le calcul avec des aciers comprimés et passez à la question suivante » → étude en **section en Té** (la dalle de 20 cm sert de table de compression). Pas de corrigé fourni.`,
    { src: [SUJBA(12), EC('corrigé non fourni')], data: [FLEX] })
  .single(2, 'TD6 : comment place-t-on les cadres le long de la poutre (suite de Caquot 8-9-10-11-13-16-20-25-35-40 cm) ?', [
    '*en commençant par un demi-espacement à l’appui, puis chaque espacement de la suite répété 2 fois',
    'avec un espacement constant de 20 cm',
    'en commençant par 40 cm à l’appui',
    'un seul cadre à chaque appui',
  ], r`Sujet TD6 : « vous prendrez 2 fois chaque espacement dans la suite 8-9-10-11-13-16-20-25-35-40 sachant que vous devez commencer par un **demi-espacement** ». Les cadres sont resserrés près des appuis, là où l'effort tranchant est maximal, puis s'écartent vers mi-portée.`,
    { src: [SUJBA(12)] });

export const BA_BANKS = [bam, enr, anc, pot, fl];
export { C35, epsyd };
