import { Bank, COURS, POLY, MEMO, QCMA, TD, EC, PARTIEL, SUJBA, r, t } from './helpers';
import {
  PSI, NEIGE_TABLE, ALTITUDE_TABLE, MU_TABLE, SK, deltaS, mu1, CPE_MURS, CPE_TOIT_PLAT, CPE_1VERSANT, RHO_AIR, VB0,
} from '../formulaire/tables';

// =====================================================================
// 1. Bases EC0
// =====================================================================
const ec0 = new Bank('ec0');
ec0
  .single(1, 'Un état limite de **service** (ELS) concerne…', [
    'la résistance des éléments sous les charges maximales',
    '*le fonctionnement normal, le confort des personnes et l’aspect de la construction',
    'la stabilité en cas d’incendie',
    'uniquement la rupture des assemblages',
  ], r`L'EC0 impose deux familles de vérifications. Les **ELS** garantissent que la structure reste **apte à l'utilisation** prévue : fonctionnement en utilisation normale, confort des personnes, aspect (flèches, vibrations, déplacements). Les **ELU** garantissent la **résistance** à toutes les actions susceptibles de s'exercer (rupture, instabilité). On vérifie donc les flèches à l'ELS et les contraintes à l'ELU.`,
  { src: [POLY(11), POLY(13)], exam: true, hints: { a: 'C’est la définition d’un ELU (résistance).' } })
  .single(1, 'Quelle est la durée indicative d’utilisation de projet d’un **bâtiment courant** ?', ['10 ans', '25 ans', '*50 ans', '100 ans'],
    r`Tableau 3.1 du poly (EC0) : catégorie 1 = 10 ans (structures provisoires) ; catégories 2 et 3 = 25 ans (éléments remplaçables, structures agricoles) ; **catégorie 4 = 50 ans (bâtiments courants)** ; catégorie 5 = 100 ans (bâtiments monumentaux ou stratégiques, ponts). Cette durée sert notamment à choisir la classe structurale pour les enrobages en béton armé.`,
    { src: [POLY(11)], exam: true, hints: { d: '100 ans : bâtiments monumentaux ou stratégiques.' } })
  .single(1, 'Une **structure agricole** a une durée indicative d’utilisation de projet de…', ['10 ans', '*25 ans', '50 ans', '100 ans'],
    r`D'après le tableau 3.1 de l'EC0 reproduit dans le poly, les structures agricoles sont en **catégorie 3 : 25 ans**, comme les éléments structuraux remplaçables (catégorie 2). Les bâtiments courants sont à 50 ans, les structures provisoires à 10 ans et les bâtiments monumentaux à 100 ans.`,
    { src: [POLY(11)], exam: true })
  .single(1, 'La neige « normale » sur une toiture est une action…', ['permanente (G)', '*variable (Q)', 'accidentelle (A)', 'sismique (A_E)'],
    r`Le cours classe les actions en **G** (permanentes : poids propres), **Q** (variables : mobilier, personnes, **vent, neige**), **A** (accidentelles) et **A_E** (sismiques). La neige courante, de période de retour 50 ans, est une action **variable**. Attention : la neige **exceptionnelle** ($s_{Ad}$) et l'accumulation exceptionnelle sont, elles, des actions **accidentelles**.`,
    { src: [COURS(5), COURS(11)], exam: true, hints: { c: 'Seule la neige exceptionnelle (s_Ad) est accidentelle.' } })
  .single(1, 'Le poids des cloisons et du carrelage d’un plancher est une action…', ['*permanente (G)', 'variable (Q)', 'accidentelle (A)', 'd’exploitation (cat. A)'],
    r`Les **poids propres** des éléments de construction (poutres, planchers, cloisons fixes, revêtements, tuiles…) sont des actions **permanentes G** : elles agissent pendant toute la durée de vie avec une intensité quasi constante (cours, diapo « classification des actions »). Les charges d'exploitation (mobilier, personnes) sont variables Q.`,
    { src: [COURS(5)], exam: true })
  .tf(1, 'Le séisme est classé parmi les actions accidentelles **A**.', false,
    r`**Faux.** L'EC0 distingue **quatre** classes : permanentes G, variables Q, accidentelles **A** (choc d'un bateau sur une pile de pont, explosion…) et **sismiques A_E**. Le séisme a sa propre classe et sa propre combinaison : $\sum G_{k,j} + A_{Ed} + \sum \psi_{2,i} Q_{k,i}$.`,
    { src: [COURS(7), COURS(8), POLY(12)], exam: true })
  .single(2, 'Quelle est la combinaison **fondamentale** ELU (situations durables et transitoires) ?', [
    r`$G + Q_1 + \sum \psi_{0,i} Q_i$`,
    r`*$1{,}35\,G_{sup} + 1{,}00\,G_{inf} + 1{,}5\,Q_1 + 1{,}5\sum \psi_{0,i} Q_i$`,
    r`$1{,}5\,G + 1{,}35\,Q_1$`,
    r`$G + A_d + \psi_{2,1} Q_1$`,
  ], r`Poly p.12 : $1{,}35\,G_{k,sup} + 1{,}00\,G_{k,inf} + 1{,}50\,Q_{k,1} + 1{,}50 \sum \psi_{0,i} Q_{k,i}$.
- $Q_{k,1}$ = action variable **dominante** (pleine valeur) ;
- les autres variables sont réduites par $\psi_0$ ;
- $G$ défavorable × 1,35, $G$ favorable × 1,00 (cas du soulèvement par le vent).`,
    { src: [POLY(12)], exam: true, hints: { a: 'C’est la combinaison ELS caractéristique.', d: 'C’est (presque) la combinaison accidentelle.' } })
  .single(2, 'Quelle combinaison utilise-t-on pour vérifier les **flèches** (ELS caractéristique) ?', [
    r`*$\sum G_{k,j} + Q_{k,1} + \sum \psi_{0,i} Q_{k,i}$`,
    r`$1{,}35\,G + 1{,}5\,Q$`,
    r`$\sum G_{k,j} + \sum \psi_{2,i} Q_{k,i}$ uniquement`,
    r`$1{,}35\,G$`,
  ], r`La combinaison **caractéristique** (état limite irréversible) est $\sum G_{k,j} + Q_{k,1} + \sum \psi_{0,i} Q_{k,i}$ : **pas de coefficients 1,35 / 1,5**, qui sont réservés à l'ELU. Au partiel 2023 : « G + Q = 2,1 kN/ml » est le chargement ELS à utiliser pour la flèche, et « 1,35G + 1,5Q = 3,1 kN/ml » sert au moment et au tranchant.`,
    { src: [POLY(12), POLY(13)], exam: true })
  .single(1, 'Le coefficient $\\psi_0$ de la **neige** pour un bâtiment situé à moins de 1000 m vaut…', ['0', '0,2', '*0,5', '0,7'],
    r`Tableau 3.2 du poly : neige (H ≤ 1000 m) **ψ0 = 0,5** et ψ2 = 0 ; vent ψ0 = 0,6 et ψ2 = 0 ; exploitation catégorie A ψ0 = 0,7 et ψ2 = 0,3. Au-dessus de 1000 m, la neige passe à ψ0 = 0,7 et ψ2 = 0,2 (mémo p.7).`,
    { src: [POLY(12), MEMO(7)], data: [PSI], exam: true })
  .single(1, 'Que représente la valeur $\\psi_2 Q_k$ ?', ['la valeur de combinaison', 'la valeur fréquente', '*la valeur quasi-permanente', 'la valeur accidentelle'],
    r`ψ0 donne la **valeur de combinaison** (utilisée pour les actions d'accompagnement), ψ1 la **valeur fréquente**, ψ2 la **valeur quasi-permanente** (part de l'action présente « en permanence »). ψ2 sert notamment pour le fluage du bois ($U_{fin} = (1 + \psi_2 k_{def})U_{inst}$) et dans les combinaisons accidentelle et sismique.`,
    { src: [POLY(12), MEMO(6)], exam: true })
  .num(1, r`Plancher d'habitation : $G = 2{,}0$ kN/m², $Q = 1{,}5$ kN/m² (cat. A, seule action variable). Calcule la charge **ELU**.`, 4.95, 'kN/m²',
    r`Une seule action variable → elle est dominante :
$$p_{ELU} = 1{,}35 \times 2{,}0 + 1{,}5 \times 1{,}5 = 2{,}70 + 2{,}25 = 4{,}95\ \text{kN/m}^2$$
Erreur fréquente : appliquer ψ0 = 0,7 à Q alors qu'il n'y a pas d'autre action variable (ψ0 ne s'applique qu'aux actions d'**accompagnement**).`,
    { src: [POLY(12)], exam: true })
  .num(1, r`Même plancher : $G = 2{,}0$ kN/m², $Q = 1{,}5$ kN/m². Calcule la charge **ELS caractéristique**.`, 3.5, 'kN/m²',
    r`Combinaison caractéristique : $G + Q_1 = 2{,}0 + 1{,}5 = 3{,}5$ kN/m². Pas de coefficients partiels à l'ELS. C'est cette charge qui sert au calcul de la flèche $w_{max}$ ; la flèche $w_3$ se calcule avec Q seul (1,5 kN/m²).`,
    { src: [POLY(12)] })
  .num(2, r`Toiture : $G = 0{,}50$, neige $S = 0{,}60$, vent en pression $W = 0{,}30$ kN/m² (altitude < 1000 m). Calcule $1{,}35G + 1{,}5S + 1{,}5\,\psi_0 W$ (neige dominante).`, 1.845, 'kN/m²',
    r`Neige dominante, vent d'accompagnement avec $\psi_0 = 0{,}6$ :
$$1{,}35\times0{,}50 + 1{,}5\times0{,}60 + 1{,}5\times0{,}6\times0{,}30 = 0{,}675 + 0{,}900 + 0{,}270 = 1{,}845\ \text{kN/m}^2$$
C'est la forme de la combinaison 06 du TD garage ($1{,}35G + 1{,}5S_n + 1{,}5\times0{,}6\,W^+$), qui y était dimensionnante.`,
    { src: [POLY(12), TD(18)], data: [PSI] })
  .num(3, r`Même toiture ($G = 0{,}50$ ; $S = 0{,}60$ ; $W = +0{,}30$ kN/m²). Quelle est la valeur de la combinaison ELU **la plus défavorable** (neige dominante OU vent dominant) ?`, 1.845, 'kN/m²',
    r`On teste les deux actions dominantes possibles :
- neige dominante : $1{,}35\times0{,}5 + 1{,}5\times0{,}6 + 1{,}5\times0{,}6\times0{,}3 = 1{,}845$ ;
- vent dominant : $1{,}35\times0{,}5 + 1{,}5\times0{,}3 + 1{,}5\times0{,}5\times0{,}6 = 0{,}675 + 0{,}45 + 0{,}45 = 1{,}575$.
On retient le maximum : **1,845 kN/m²** (neige dominante). Penser à utiliser $\psi_0 = 0{,}5$ pour la neige d'accompagnement et 0,6 pour le vent.`,
    { src: [POLY(12), TD(18)], data: [PSI] })
  .num(2, r`Soulèvement : toiture légère $G = 0{,}45$ kN/m², vent en dépression $W = -0{,}90$ kN/m². Calcule $1{,}00\,G + 1{,}5\,W$.`, -0.9, 'kN/m²',
    r`Quand le vent soulève, le poids propre est **favorable** : on le prend avec $\gamma_{G,inf} = 1{,}00$ (et non 1,35).
$$1{,}00\times0{,}45 + 1{,}5\times(-0{,}90) = 0{,}45 - 1{,}35 = -0{,}90\ \text{kN/m}^2$$
Le résultat négatif signifie un **soulèvement** net : il faut vérifier les attaches et les éléments sous charge ascendante (TD garage, combinaison 05).`,
    { src: [POLY(12), TD(18)] })
  .single(2, 'Pourquoi prend-on $1{,}00\\,G$ (et non $1{,}35\\,G$) dans la combinaison $1{,}00G + 1{,}5W^-$ ?', [
    'parce que le vent est une action accidentelle',
    '*parce que le poids propre s’oppose au soulèvement : il est favorable',
    'parce que ψ0 du vent vaut 0,6',
    'parce qu’on est à l’ELS',
  ], r`Les coefficients partiels couvrent l'incertitude **dans le sens défavorable**. Si G aide (il retient la toiture contre le soulèvement), le majorer serait dangereux : on prend la valeur basse $G_{k,inf}$ avec $\gamma = 1{,}00$. D'où la combinaison $1{,}35\,G_{k,sup} + 1{,}00\,G_{k,inf} + \dots$ du poly.`,
    { src: [POLY(12)], exam: true })
  .multi(1, 'Coche les actions **variables** (Q).', ['*Neige', '*Vent', '*Charges d’exploitation (mobilier, personnes)', 'Poids propre de la charpente', 'Séisme'],
    r`Les actions variables sont celles dont l'intensité varie dans le temps : **exploitation, neige, vent** (cours p.5 ; poly p.11). Le poids propre est permanent (G) ; le séisme forme une classe à part (A_E). Attention aux pièges : la neige **exceptionnelle** est accidentelle.`,
    { src: [COURS(5), POLY(11)], exam: true })
  .single(3, 'Quelle est la bonne écriture de la combinaison **accidentelle** (EN 1990) ?', [
    r`$1{,}35\,G + A_d + 1{,}5\,Q_1$`,
    r`*$\sum G_{k,j} + A_d + (\psi_{1,1}\ \text{ou}\ \psi_{2,1})\,Q_{k,1} + \sum \psi_{2,i}\,Q_{k,i}$`,
    r`$\sum G_{k,j} + A_d + (\psi_{1,1}\ \text{ou}\ \psi_{2,1})\,Q_{k,1} + 1{,}50\sum \psi_{0,i}\,Q_{k,i}$`,
    r`$G + Q + A_d$`,
  ], r`En situation accidentelle, **pas de coefficient 1,35 ni 1,5** : $\sum G_{k,j} + A_d + (\psi_{1,1}\ \text{ou}\ \psi_{2,1})Q_{k,1} + \sum\psi_{2,i}Q_{k,i}$.
⚠️ Le poly (p.12) écrit « + 1,50 Σψ0,i Qk,i » pour le dernier terme : c'est une **coquille**, l'EN 1990 donne bien $\sum \psi_{2,i} Q_{k,i}$. Exemple : neige exceptionnelle $s_{Ad}$ (accidentelle) + poids propre.`,
    { src: [POLY(12, 'coquille dans le dernier terme'), EC('EN 1990 §6.4.3.3')], hints: { c: 'C’est l’écriture du poly, qui contient une coquille (1,50 Σψ0).' } })
  .order(2, 'Remets dans l’ordre la démarche pour obtenir la charge de calcul d’une panne.', [
    'Recenser les actions (G, Q, neige, vent) et leurs valeurs caractéristiques',
    'Passer en charges linéiques (× entraxe, × cos α pour la neige)',
    'Écrire les combinaisons ELU (chaque action variable dominante tour à tour)',
    'Retenir la combinaison la plus défavorable',
    'En déduire $M_{Ed}$ et $V_{Ed}$',
  ], r`C'est la démarche du TD garage : bilan des charges (p.16), passage en kN/ml avec la largeur de reprise (p.17), liste des combinaisons 01 à 09 (p.18) avec chaque action variable dominante à son tour, choix de la plus défavorable (combinaison 06 = 3,86 kN/ml), puis sollicitations $M_{Ed} = p_uL^2/8$ et $V_{Ed} = p_uL/2$.`,
    { src: [TD(16), TD(17), TD(18)] })
  .single(2, 'Dans la combinaison $1{,}35G + 1{,}5Q_1 + 1{,}5\\sum\\psi_{0,i}Q_i$, que désigne $Q_{k,1}$ ?', [
    'la plus petite action variable',
    '*l’action variable dominante, prise à sa valeur caractéristique complète',
    'l’action accidentelle',
    'toujours la charge d’exploitation',
  ], r`$Q_{k,1}$ est l'action variable **dominante** (non réduite) ; les autres sont des actions d'**accompagnement**, réduites par $\psi_0$. Comme on ne sait pas d'avance laquelle est la plus défavorable, on écrit une combinaison par action dominante possible et on garde la pire (TD garage : neige dominante = combinaison 06, vent dominant = combinaison 08).`,
    { src: [POLY(12), TD(18)], exam: true });

// =====================================================================
// 2. Charges EC1-1
// =====================================================================
const charges = new Bank('charges');
charges
  .num(1, r`Pannes espacées de **2,588 m**, charges permanentes de toiture $g = 0{,}45$ kN/m². Calcule la charge permanente **linéique** sur une panne courante (hors poids propre).`, 1.16, 'kN/ml',
    r`Charge linéique = charge surfacique × **largeur de reprise** (pour une panne courante : l'entraxe, une demi-travée de chaque côté).
$$g_{lin} = 0{,}45 \times 2{,}588 = 1{,}16\ \text{kN/ml}$$
C'est la valeur du TD garage (p.17), à laquelle on ajoute ensuite le poids propre de la panne.`,
    { src: [TD(17)], exam: true })
  .num(2, r`Neige sur la toiture : $s = 0{,}49$ kN/m² (**projection horizontale**), entraxe des pannes 2,588 m mesuré sur le rampant, pente $\alpha = 15°$. Calcule la charge de neige linéique sur une panne.`, 1.23, 'kN/ml',
    r`La neige est donnée **par m² de surface horizontale**. Une bande de rampant de largeur 2,588 m correspond à une largeur horizontale de $2{,}588\cos15°$ :
$$s_{lin} = 0{,}49 \times 2{,}588 \times \cos 15° = 0{,}49\times2{,}500 = 1{,}23\ \text{kN/ml}$$
(1,27 kN/ml si on oublie le cos α). Le vent, lui, agit déjà perpendiculairement au versant : on ne le projette pas.`,
    { src: [TD(17)], exam: true, tol: 2.5 })
  .num(2, r`La charge de neige linéique verticale sur une panne vaut 1,23 kN/ml, versant à 15°. Quelle est sa composante **perpendiculaire au versant** (axe z de la panne) ?`, 1.19, 'kN/ml',
    r`Une charge verticale $P$ sur une panne inclinée se décompose en $P\cos\alpha$ (perpendiculaire au versant, flexion autour de y) et $P\sin\alpha$ (parallèle au versant, flexion autour de z) :
$$S_{n,z} = 1{,}23 \times \cos 15° = 1{,}19\ \text{kN/ml}$$
C'est la valeur utilisée dans la combinaison 06 du TD garage.`,
    { src: [TD(17), COURS(76)] })
  .num(2, r`Même charge verticale de neige 1,23 kN/ml, versant à 15°. Quelle est sa composante **parallèle au versant** (axe y de la panne) ?`, 0.32, 'kN/ml',
    r`$$S_{n,y} = 1{,}23 \times \sin 15° = 1{,}23\times0{,}259 = 0{,}32\ \text{kN/ml}$$
Cette composante fait fléchir la panne autour de son axe faible z (moment $M_{Ed,z}$) : c'est elle qui impose la vérification en **flexion déviée** et souvent des **liernes** à mi-portée.`,
    { src: [TD(19), COURS(76)], tol: 3 })
  .single(1, 'Toiture inaccessible (cat. H) de pente 15° sans étanchéité : quelle charge d’entretien retenir (AN de l’EC1-1) ?', [
    'q_k = 0,8 kN/m² répartie',
    '*Q_k = 1,5 kN ponctuelle (q_k = 0)',
    'q_k = 1,5 kN/m²',
    'aucune charge d’exploitation',
  ], r`Tableau 6.10 (NF) : toiture de pente < 15 % recevant une étanchéité → $q_k = 0{,}8$ kN/m² et $Q_k = 1{,}5$ kN ; **autres toitures → $q_k = 0$ et $Q_k = 1{,}5$ kN**. 15° correspond à $100\tan15° = 26{,}8\ \%$ > 15 % → charge unique de 1,5 kN placée au milieu de la panne (TD garage p.13).`,
    { src: [TD(13)], exam: true, hints: { a: 'Valable seulement pour une pente < 15 % avec étanchéité.' } })
  .num(1, 'Exprime en pourcentage une pente de toiture de 15°.', 26.8, '%',
    r`Pente en % = $100 \times \tan\alpha = 100\times\tan15° = 26{,}8\ \%$. Piège : comparer directement « 15° » au seuil « 15 % » de l'Annexe nationale ; 15 % ne correspond qu'à 8,5°. Ici la pente dépasse 15 % → toiture « autre » → charge ponctuelle de 1,5 kN.`,
    { src: [TD(13)] })
  .tf(2, 'La charge d’entretien d’une toiture cat. H se cumule avec la neige dans les combinaisons.', false,
    r`**Faux.** L'Annexe nationale précise que les charges d'exploitation des toitures de catégorie H **ne sont pas prises simultanément avec la neige ni avec le vent** (TD garage p.13). La combinaison $1{,}35G + 1{,}5Q$ est étudiée seule (et, la charge étant ponctuelle, elle se compare en moment, pas en kN/ml).`,
    { src: [TD(13), TD(18)], exam: true })
  .single(2, 'Pourquoi multiplie-t-on la neige par $\\cos\\alpha$ pour obtenir la charge par mètre de panne, mais pas les charges permanentes ?', [
    'parce que la neige est une action variable',
    '*parce que la neige est donnée par m² de projection horizontale, les permanentes par m² de rampant',
    'parce que la neige glisse sur le versant',
    'c’est une erreur : il faut aussi projeter G',
  ], r`Les poids de couverture (bac, isolant…) sont donnés **par m² de toiture réelle** (rampant) : $g\times e$ suffit. La neige $s = \mu_1 C_e C_t s_k$ est une charge **par m² de surface horizontale** (comme la neige au sol) : sur une bande de rampant de largeur $e$, la surface horizontale vaut $e\cos\alpha$, d'où $s\,e\cos\alpha$ (TD garage p.17).`,
    { src: [TD(17)] })
  .num(1, r`Complexe de toiture du TD garage : bac acier 0,08 ; chevrons 0,03 ; contre-liteaux 0,01 ; OSB 16 mm 0,11 ; fibre de bois 0,11 ; lambris 0,05 ; divers 0,05 kN/m². Calcule la charge permanente totale.`, 0.44, 'kN/m²',
    r`Somme : $0{,}08 + 0{,}03 + 0{,}01 + 0{,}11 + 0{,}11 + 0{,}05 + 0{,}05 = 0{,}44$ kN/m². Le tableau du corrigé (sortie logiciel) annonce **0,45 kN/m²** car les valeurs affichées sont arrondies : les deux réponses sont acceptées. À cette charge s'ajoute le poids propre de la panne, inconnu tant que le profilé n'est pas choisi.`,
    { src: [TD(14)], tol: 3 })
  .num(2, r`Un IPE 100 pèse 8,1 kg/m. Quelle charge linéique (kN/ml) représente son poids propre ? (prendre $g \approx 10$ m/s²)`, 0.081, 'kN/ml',
    r`$8{,}1\ \text{kg/m} \times 10\ \text{N/kg} = 81\ \text{N/m} = 0{,}081\ \text{kN/ml}$ (valeur du TD garage p.19). Avec $g = 9{,}81$ on trouverait 0,079 kN/ml, accepté aussi. Le poids propre des profilés se lit dans la colonne G (kg/m) du catalogue.`,
    { src: [TD(19), POLY(38)], tol: 3 })
  .num(2, r`Panne en lamellé-collé GL24h de section $120\times280$ mm, $\rho_{mean} = 420$ kg/m³. Calcule son poids propre linéique.`, 0.141, 'kN/ml',
    r`$$pp = b\,h\,\rho\,g = 0{,}12 \times 0{,}28 \times 4{,}2\ \text{kN/m}^3 = 0{,}141\ \text{kN/ml}$$
(420 kg/m³ ≈ 4,2 kN/m³ avec g ≈ 10). C'est le terme « 4,2 × 0,12 × 0,28 » de la combinaison du TD garage (p.32). On utilise $\rho_{mean}$ (masse volumique moyenne), pas $\rho_k$.`,
    { src: [TD(32), MEMO(8)] })
  .num(2, r`Solive GL24h $100\times250$ mm ($\rho_{mean} = 420$ kg/m³). Calcule son poids propre linéique.`, 0.105, 'kN/ml',
    r`$$pp = 0{,}10\times0{,}25\times4{,}2 = 0{,}105\ \text{kN/ml}$$
Au partiel 2023 bois, le moment $M_{Ed} = 11{,}88$ kN·m de l'énoncé correspond à $p = 3{,}142$ kN/m $= 1{,}35(1{,}15\times0{,}6 + 0{,}105) + 1{,}5\times2{,}3\times0{,}6$ : le poids propre est donc inclus.`,
    { src: [PARTIEL(3), MEMO(8)] })
  .num(1, 'Dalle en béton armé de 20 cm d’épaisseur (poids volumique 25 kN/m³). Calcule son poids surfacique.', 5, 'kN/m²',
    r`$g = e \times \gamma_{béton} = 0{,}20\ \text{m} \times 25\ \text{kN/m}^3 = 5{,}0\ \text{kN/m}^2$ (TD6 de béton armé). On ajoute ensuite les surcharges permanentes (cloisons, revêtements, faux plafonds : 1 kN/m² dans ce TD) avant de passer en charge linéique sur la poutre.`,
    { src: [SUJBA(11)] })
  .single(1, 'Un bâtiment de **bureaux** relève de quelle catégorie de charge d’exploitation ?', ['A', '*B', 'C', 'H'],
    r`EC1-1 : catégorie **A** = habitation, **B = bureaux** (q_k = 2,5 kN/m² dans le TD6 BA), C = lieux de réunion, D = commerces, E = stockage, H = toitures inaccessibles sauf entretien. Les ψ des catégories A et B sont identiques : 0,7 / 0,5 / 0,3.`,
    { src: [SUJBA(11), MEMO(7)], exam: true })
  .single(2, 'Quelle largeur de toiture une **panne intermédiaire** reprend-elle ?', [
    'la distance entre portiques',
    '*l’entraxe des pannes (une demi-distance de chaque côté)',
    'la moitié de l’entraxe',
    'toute la longueur du rampant',
  ], r`Chaque panne reprend la bande de couverture comprise entre les **mi-distances** avec ses voisines, soit l'entraxe pour une panne courante (2,588 m dans le TD garage). Une panne de rive ne reprend qu'une demi-largeur (plus l'éventuel débord). La **portée** de la panne, elle, est la distance entre portiques (4 ou 8 m dans le TD).`,
    { src: [TD(16), TD(17)], exam: true })
  .num(1, r`Pression du vent sur un long-pan $W_y = 0{,}57$ kN/m², portiques espacés de $l = 5$ m. Quelle charge linéique $q_w$ un portique courant reçoit-il ?`, 2.85, 'kN/ml',
    r`Poly p.9 (figure 2.4) : le portique reprend la surface d'influence de largeur $l$ (moitié de chaque côté) : $q_w = W_y \times l = 0{,}57\times5 = 2{,}85$ kN/ml. Les lisses transmettent en réalité des efforts ponctuels, que l'on assimile à cette charge répartie.`,
    { src: [POLY(9)] });

// =====================================================================
// 3. Neige EC1-3
// =====================================================================
const neige = new Bank('neige');
neige
  .tf(1, 'La charge de neige dépend de l’altitude de la construction.', true,
    r`**Vrai.** La valeur $s_k$ du tableau correspond à une altitude inférieure à 200 m ; au-dessus, on ajoute $\Delta s$ selon l'altitude $A$ :
- 200–500 m : $\Delta s_1 = A/1000 - 0{,}20$
- 500–1000 m : $\Delta s_1 = 1{,}5A/1000 - 0{,}45$
- 1000–2000 m : $\Delta s_1 = 3{,}5A/1000 - 2{,}45$

Exemple : Lourdes (500 m) → $0{,}45 + 0{,}30 = 0{,}75$ kN/m².`,
    { id: 'stab1-neige-qcmA-002', src: [QCMA(1, 'question 2'), COURS(17)], tags: ['qcm-A'], exam: true })
  .single(1, 'La valeur caractéristique de la neige $s_k$ est une valeur qui correspond à une charge…', [
    'à une altitude conventionnelle européenne',
    'à une altitude aléatoire',
    '*au sol',
    'sur une toiture plane à moins de 10 m de haut',
  ], r`$s_k$ est la **charge de neige au sol** de période de retour 50 ans (probabilité annuelle de dépassement 0,02). On passe à la charge **sur la toiture** avec $s = \mu_i\,C_e\,C_t\,s_k$, où le coefficient de forme $\mu_i$ tient compte de la pente et de la forme de la toiture (QCM neige et vent A, question 3).`,
    { id: 'stab1-neige-qcmA-003', src: [QCMA(1, 'question 3'), COURS(11)], tags: ['qcm-A'], exam: true, hints: { d: 'La toiture intervient via μ, pas dans la définition de s_k.' } })
  .single(1, 'Les coefficients $\\mu_i$ destinés à prendre en compte les dispositions des toitures sont appelés…', [
    'coefficients d’exposition', '*coefficients de forme', 'coefficients d’influence', 'coefficients de situation',
  ], r`Dans $s = \mu_i\,C_e\,C_t\,s_k$ : $\mu_i$ = **coefficient de forme** (pente, versants, noues, obstacles), $C_e$ = coefficient d'**exposition** (1,0 site normal, 1,25 site protégé), $C_t$ = coefficient **thermique** (1,0 sauf toitures très déperditives). Question 4 du QCM neige et vent A.`,
    { id: 'stab1-neige-qcmA-004', src: [QCMA(1, 'question 4'), COURS(19)], tags: ['qcm-A'], exam: true, hints: { a: 'C’est C_e, pas μ.' } })
  .num(2, r`Garage à Clermont-Ferrand (région **A2**), altitude **360 m**. Calcule la valeur caractéristique $s_k$ de la charge de neige au sol.`, 0.61, 'kN/m²',
    r`$$\Delta s_1 = \frac{360}{1000} - 0{,}20 = 0{,}16\ \text{kN/m}^2$$
$$s_k = 0{,}45 + 0{,}16 = 0{,}61\ \text{kN/m}^2$$
C'est la valeur **au sol**. Sur une toiture à 15° : $s = \mu_1 C_e C_t s_k = 0{,}8 \times 1 \times 1 \times 0{,}61 = 0{,}49$ kN/m².

**Piège** : ajouter $\Delta s$ sans retirer 0,20 (→ 0,81), ou oublier l'altitude (→ 0,45).`,
    { id: 'stab1-neige-sk-001', src: [TD(3), COURS(17)], tags: ['td-garage'], exam: true, data: [NEIGE_TABLE, ALTITUDE_TABLE] })
  .single(1, 'Dans quelle région de neige se trouve la **Charente-Maritime** (17) ?', ['A1', '*A2', 'B1', 'C2'],
    r`Carte du cours (p.12) : Charente (16) et **Charente-Maritime (17) = A2** ; Deux-Sèvres, Vendée et Vienne = A1. En A2 : $s_k = 0{,}45$ kN/m² et il existe une neige exceptionnelle $s_{Ad} = 1{,}00$ kN/m² (accidentelle). En A1, pas de neige exceptionnelle.`,
    { src: [COURS(12), COURS(18)], exam: true, data: [NEIGE_TABLE] })
  .num(1, 'Valeur caractéristique de la neige au sol $s_k$ à **La Rochelle** (altitude ≈ 20 m) ?', 0.45, 'kN/m²',
    r`La Rochelle est en région **A2** et sous 200 m d'altitude → pas de majoration $\Delta s$ : $s_k = 0{,}45$ kN/m² (cours p.18). La neige exceptionnelle y vaut $s_{Ad} = 1{,}00$ kN/m² (action accidentelle). Paris (A1) a aussi $s_k = 0{,}45$ mais pas de $s_{Ad}$.`,
    { src: [COURS(18)], exam: true, data: [NEIGE_TABLE] })
  .tf(1, 'À Paris (région A1), il faut considérer une charge de neige exceptionnelle $s_{Ad}$.', false,
    r`**Faux.** Le tableau du cours ne donne pas de $s_{Ad}$ pour les régions **A1, C1 et E**. À Paris (A1) il n'y a donc pas de neige exceptionnelle à étudier ; à La Rochelle (A2) il faut l'étudier : $s_{Ad} = 1{,}00$ kN/m² en combinaison accidentelle (cours p.18).`,
    { src: [COURS(16), COURS(18)], exam: true, data: [NEIGE_TABLE] })
  .num(2, r`Lourdes : région A2, altitude **500 m**. Calcule $s_k$.`, 0.75, 'kN/m²',
    r`500 m est la borne haute de la tranche 200–500 m : $\Delta s_1 = A/1000 - 0{,}20 = 0{,}50 - 0{,}20 = 0{,}30$ kN/m² (même résultat avec la formule suivante : $1{,}5\times0{,}5 - 0{,}45 = 0{,}30$).
$$s_k = 0{,}45 + 0{,}30 = 0{,}75\ \text{kN/m}^2$$
(exemple du cours p.18).`,
    { src: [COURS(18)], data: [NEIGE_TABLE, ALTITUDE_TABLE] })
  .num(3, r`Gourette : « même région que La Rochelle » (A2), altitude **1400 m**. Calcule $s_k$.`, 2.9, 'kN/m²',
    r`Tranche 1000–2000 m : $\Delta s_1 = 3{,}5A/1000 - 2{,}45 = 3{,}5\times1{,}4 - 2{,}45 = 4{,}90 - 2{,}45 = 2{,}45$ kN/m².
$$s_k = 0{,}45 + 2{,}45 = 2{,}90\ \text{kN/m}^2 \approx 290\ \text{kg/m}^2$$
Au-dessus de 1000 m, la neige passe aussi en **moyen terme** pour le bois ($k_{mod}$ 0,8 au lieu de 0,9) et ψ0 = 0,7.`,
    { src: [COURS(18)], data: [NEIGE_TABLE, ALTITUDE_TABLE] })
  .single(1, 'À quelle période de retour correspond la valeur caractéristique $s_k$ ?', ['10 ans', '*50 ans', '100 ans', '1000 ans'],
    r`Cours p.11 : $s_k$ a une **probabilité annuelle de dépassement de 0,02**, soit une période de retour de $1/0{,}02 = 50$ ans. C'est la même convention que pour la vitesse de référence du vent $v_{b,0}$. La neige exceptionnelle correspond à une chute « exceptionnellement rare » → action accidentelle.`,
    { src: [COURS(11)], exam: true })
  .single(1, 'La charge de neige **exceptionnelle** $s_{Ad}$ est considérée comme une action…', ['permanente', 'variable', '*accidentelle', 'sismique'],
    r`Cours p.11 et p.19 : la charge de neige au sol exceptionnelle et l'accumulation exceptionnelle (annexe B) sont des actions **accidentelles**. On les combine en situation accidentelle ($s = \mu_i C_e C_t s_{Ad}$), sans coefficients 1,35/1,5, et on ne cumule pas neige exceptionnelle et accumulation (TD garage p.3).`,
    { src: [COURS(11), COURS(19), TD(3)], exam: true })
  .num(1, 'Toiture à 2 versants inclinés à 20°. Valeur de $\\mu_1$ ?', 0.8, '',
    r`Pour $0° \le \alpha \le 30°$ : $\mu_1 = 0{,}8$ (graphe du cours p.22). Le coefficient ne diminue qu'à partir de 30° (la neige commence à glisser) et s'annule à 60°.`,
    { src: [COURS(22)], data: [MU_TABLE], exam: true })
  .num(2, 'Toiture à 1 versant inclinée à **45°**. Valeur de $\\mu_1$ ?', 0.4, '',
    r`Pour $30° < \alpha < 60°$ : $\mu_1 = 0{,}8\,\dfrac{60 - \alpha}{30} = 0{,}8 \times \dfrac{15}{30} = 0{,}4$ (exemple du cours p.23). La charge sur la toiture est alors deux fois plus faible qu'au sol × 0,8.`,
    { src: [COURS(22), COURS(23)], data: [MU_TABLE] })
  .num(2, 'Toiture inclinée à **40°**. Valeur de $\\mu_1$ ?', round3(mu1(40)), '',
    r`$$\mu_1 = 0{,}8\,\frac{60 - 40}{30} = 0{,}8 \times 0{,}667 = 0{,}533$$
Interpolation linéaire entre 0,8 (30°) et 0 (60°). Erreur fréquente : garder 0,8 au-delà de 30°.`,
    { src: [COURS(22)], data: [MU_TABLE] })
  .num(2, 'La Rochelle, toiture plate à arêtes vives, site normal : charge de neige **normale** sur la toiture $s$ ?', 0.36, 'kN/m²',
    r`$$s = \mu_1\,C_e\,C_t\,s_k = 0{,}8 \times 1{,}0 \times 1{,}0 \times 0{,}45 = 0{,}36\ \text{kN/m}^2$$
(application du cours p.37). Toiture plate → $\alpha = 0$ → $\mu_1 = 0{,}8$ ; site normal $C_e = 1$ ; $C_t = 1$.`,
    { src: [COURS(33), COURS(37)], exam: true, data: [NEIGE_TABLE] })
  .num(2, 'Même toiture plate à La Rochelle : charge de neige **accidentelle** (neige exceptionnelle) sur la toiture ?', 0.8, 'kN/m²',
    r`$$s = \mu_1\,C_e\,C_t\,s_{Ad} = 0{,}8 \times 1 \times 1 \times 1{,}00 = 0{,}80\ \text{kN/m}^2$$
⚠️ Une diapo du cours (p.39) écrit « 0,8 × 1 = 0,36 kN/m² » : c'est une **coquille** (copier-coller de la ligne précédente). La bonne valeur est 0,8 kN/m², comme sur la diapo p.38.`,
    { src: [COURS(38), COURS(39, 'coquille 0,36 au lieu de 0,8')], data: [NEIGE_TABLE] })
  .single(1, 'Valeur de $C_e$ pour un **site protégé** (abri quasi permanent par les bâtiments voisins) ?', ['0,8', '1,0', '*1,25', '1,5'],
    r`Cours p.20 : $C_e = 1{,}25$ en site **protégé** (le vent ne peut pas emporter la neige, elle s'accumule) ; $C_e = 1{,}0$ en site normal. Un site protégé **augmente** donc la charge. $C_t$ (thermique) vaut 1,0 dans les cas courants.`,
    { src: [COURS(20)], exam: true })
  .single(2, 'L’accumulation de neige au pied d’un acrotère se calcule avec…', [
    r`$s = \mu_i C_e C_t s_k$ en situation durable`,
    r`*$s = \mu_i\,s_k$, en situation accidentelle`,
    r`$s = 1{,}35\,\mu_i\,s_k$`,
    'elle est négligée par l’Eurocode',
  ], r`Cours p.19 et p.31 : l'accumulation exceptionnelle au droit d'un obstacle (annexe B) est une **charge accidentelle** : $s = \mu_i\,s_k$ avec $\mu_1 = 0{,}8$ et $\mu_2 = \gamma h/s_k$ borné entre 0,8 et 2,0 ($\gamma = 2$ kN/m³). Dans l'exemple de La Rochelle, il n'y a pas d'acrotère → pas d'accumulation.`,
    { src: [COURS(19), COURS(31)], exam: true })
  .num(3, r`Acrotère de hauteur $h = 0{,}6$ m, $s_k = 0{,}45$ kN/m², poids volumique de la neige $\gamma = 2$ kN/m³. Valeur de $\mu_2$ à retenir ?`, 2.0, '',
    r`$$\mu_2 = \frac{\gamma h}{s_k} = \frac{2\times0{,}6}{0{,}45} = 2{,}67$$
mais le cours borne : $0{,}8 \le \mu_2 \le 2{,}0$ (1,6 entre deux acrotères) → on retient **$\mu_2 = 2{,}0$**. La charge accidentelle au pied de l'acrotère vaut alors $2{,}0\times0{,}45 = 0{,}90$ kN/m².`,
    { src: [COURS(31)] })
  .num(3, 'Acrotère de hauteur $h = 1{,}5$ m : longueur d’accumulation $l_s$ à retenir ?', 5, 'm',
    r`Cours p.31 : $l_s = 2h = 3$ m, avec la condition $5\ \text{m} \le l_s \le 15\ \text{m}$ → on retient **$l_s = 5$ m**. La charge varie linéairement de $\mu_2 s_k$ au pied de l'obstacle à $\mu_1 s_k$ à la distance $l_s$.`,
    { src: [COURS(31)] })
  .single(2, 'Pour une toiture à 2 versants, quel cas de charge le cours qualifie-t-il de « plus intéressant » (le plus courant à étudier) ?', [
    r`*cas (i) : $\mu_1(\alpha_1)$ et $\mu_1(\alpha_2)$ sur les deux versants`,
    r`cas (ii) : $0{,}5\mu_1(\alpha_1)$ et $\mu_1(\alpha_2)$`,
    r`cas (iii) : $\mu_1(\alpha_1)$ et $0{,}5\mu_1(\alpha_2)$`,
    r`$\mu_2$ sur toute la toiture`,
  ], r`Cours p.24-25 : trois cas pour 2 versants. Le cas (i), **neige non déplacée** ($\mu_1$ sur chaque versant), est le plus défavorable pour les pannes et les portiques symétriques. Les cas (ii) et (iii) (neige déplacée par le vent, un versant à moitié) servent pour les effets dissymétriques. $\mu_2$ concerne les noues des versants multiples.`,
    { src: [COURS(24), COURS(25)] });

// Variantes calculées : s_k selon la région et l'altitude
for (const [region, alt] of [['B1', 300], ['C2', 700], ['D', 150], ['E', 400]] as const) {
  const sk0 = SK[region].sk;
  const ds = deltaS(alt, region);
  const sk = sk0 + ds;
  const formula = alt <= 200 ? 'pas de majoration (altitude ≤ 200 m)' : region === 'E'
    ? (alt <= 500 ? r`$\Delta s_2 = 1{,}5A/1000 - 0{,}30$` : r`$\Delta s_2 = 3{,}5A/1000 - 1{,}30$`)
    : (alt <= 500 ? r`$\Delta s_1 = A/1000 - 0{,}20$` : r`$\Delta s_1 = 1{,}5A/1000 - 0{,}45$`);
  neige.num(2, r`Construction en région **${region}**, altitude **${alt} m**. Calcule $s_k$.`, round3(sk), 'kN/m²',
    r`Valeur de base (≤ 200 m) en ${region} : $s_{k,0} = ${t(sk0)}$ kN/m².
Majoration : ${formula} → $\Delta s = ${t(ds, 3)}$ kN/m².
$$s_k = ${t(sk0)} + ${t(ds, 3)} = ${t(sk, 3)}\ \text{kN/m}^2$$
${region === 'E' ? 'Attention : la région E utilise la formule $\\Delta s_2$, plus sévère.' : 'Les régions A1 à D utilisent $\\Delta s_1$ ; seule la région E utilise $\\Delta s_2$.'}`,
    { src: [COURS(14), COURS(17)], data: [NEIGE_TABLE, ALTITUDE_TABLE] });
}
{
  const sk = 0.55 + deltaS(250, 'B2');
  const m = mu1(35);
  neige.num(3, r`Toiture à 1 versant inclinée à **35°**, région **B2**, altitude **250 m**, site normal. Calcule la charge de neige sur la toiture $s$.`, round3(m * sk), 'kN/m²',
    r`1. $s_k = 0{,}55 + (250/1000 - 0{,}20) = 0{,}55 + 0{,}05 = 0{,}60$ kN/m².
2. $\mu_1 = 0{,}8\,(60 - 35)/30 = 0{,}667$ (on est au-delà de 30°).
3. $s = \mu_1 C_e C_t s_k = 0{,}667\times1\times1\times0{,}60 = ${t(m * sk, 3)}$ kN/m².
Pièges : garder 0,8 pour μ1, ou oublier la majoration d'altitude.`,
    { src: [COURS(17), COURS(22)], data: [NEIGE_TABLE, ALTITUDE_TABLE, MU_TABLE] });
}

// Question 1 du QCM A (piège d'attention, à garder en tête de sujet).
neige.single(1, 'Cocher la réponse A.', ['*A', 'B', 'C', 'D'],
  r`Première question du QCM neige et vent A : c'est un **piège d'attention**. Il suffit de lire la consigne et de cocher A : +2 points « gratuits ». Avec le barème +2 / −1 / 0, une erreur d'inattention coûte 3 points d'écart. Lis toujours chaque énoncé jusqu'au bout avant de cocher.`,
  { id: 'stab1-qcmA-001', src: [QCMA(1, 'question 1')], tags: ['qcm-A', 'piège', 'ordre-fixe'], exam: true, themes: ['neige', 'vent'] });

// =====================================================================
// 4. Vent EC1-4
// =====================================================================
const vent = new Bank('vent');
const qb = (vb: number) => (0.5 * RHO_AIR * vb * vb) / 1000;
vent
  .single(1, 'Dans $q_p(z) = c_e(z)\\cdot q_b$, que représente $z$ ?', [
    'L’altitude du terrain par rapport au niveau de la mer',
    '*La hauteur de la construction au-dessus du sol',
    'La profondeur des fondations',
    'La distance à la côte',
  ], r`Le cours insiste : **z n'est pas l'altitude, c'est la hauteur de la construction** (diapo de l'abaque $c_e(z)$). L'altitude intervient pour la neige ($\Delta s$), pas pour le vent. Pour un bâtiment avec $h \le b$, on prend une seule bande de pression et $z_e = h$.

Exemple du cours : La Rochelle, catégorie IIIb, $h = 10$ m → $c_e = 1{,}35$ lu sur l'abaque.`,
    { id: 'stab1-vent-qp-001', src: [COURS(55, 'diapo « Pression dynamique de pointe qp(z) »'), COURS(57)], tags: ['piège'], exam: true, hints: { a: 'Piège classique : l’altitude sert pour la neige (Δs), pas pour q_p.' } })
  .num(3, r`Toiture à **un versant** inclinée à $\alpha = 34°$, vent $\theta = 0°$. Pour une surface de $20\ \text{m}^2$ en **zone F**, quelle est la valeur **négative** de $c_{pe}$ ? (interpole si nécessaire)`, -0.37, '',
    r`1. $A = 20\ \text{m}^2 \ge 10\ \text{m}^2$ → on lit les $c_{pe,10}$.
2. Zone F : $-0{,}5$ à $30°$ et $0{,}0$ à $45°$ → interpolation linéaire sur l'angle :
$$c_{pe} = -0{,}5 + \frac{34-30}{45-30}\,\big(0 - (-0{,}5)\big) = -0{,}5 + 0{,}133 = -0{,}37$$
3. La valeur positive vaut $+0{,}7$ à 30° comme à 45° : pas d'interpolation.

⚠️ **Le corrigé officiel du QCM donne −0,13** : il a interpolé avec 41° au lieu de 34°. Avec le bon angle, on trouve bien **−0,37** (et +0,7).`,
    { id: 'stab1-vent-cpe-001', tol: 3, src: [QCMA(2, 'le corrigé se trompe d’angle (41° au lieu de 34°)'), COURS(61)], tags: ['qcm-A', 'interpolation', 'corrigé-faux'], exam: true,
      data: [CPE_1VERSANT, { kind: 'formula', title: 'Surface chargée', latex: r`A \ge 10\ \text{m}^2 \Rightarrow c_{pe} = c_{pe,10}` }] })
  .multi(1, 'Méthode simplifiée (bâtiment courant, pas de face dominante) : quelles valeurs de $c_{pi}$ faut-il envisager ? Coche toutes les bonnes réponses.', [
    r`*$c_{pi} = +0{,}2$ (intérieur en surpression)`,
    r`*$c_{pi} = -0{,}3$ (intérieur en dépression)`,
    r`$c_{pi} = +0{,}8$`,
    r`$c_{pi} = 0$ : on néglige la pression intérieure`,
  ], r`Pour les bâtiments courants en situation durable, on ne considère pas de face dominante et on retient **la valeur la plus sévère entre $+0{,}2$ (surpression) et $-0{,}3$ (dépression)**. On fait donc les deux calculs de $p = q_p\,(c_{pe} - c_{pi})$ et on garde le plus défavorable pour chaque paroi.

Exemple du cours (zone F, $c_{pe} = -1{,}8$) : $c_{p,net} = -1{,}8 - 0{,}2 = -2{,}0$ (le plus défavorable) ou $-1{,}8 + 0{,}3 = -1{,}5$.`,
    { id: 'stab1-vent-cpi-001', src: [COURS(70), COURS(72)], exam: true,
      hints: { c: '+0,8 est un c_pe de face au vent (zone D), pas un c_pi.', d: 'On ne néglige la pression intérieure que pour un effort d’ensemble où elle s’annule sur deux faces opposées (tirant du TD garage).' } })
  .single(1, 'Comment appelle-t-on une face qui reçoit le vent ?', ['face alfa', '*face au vent', 'face sous le vent', 'face Victor'],
    r`La direction moyenne du vent est supposée horizontale : la paroi frappée est la face **au vent** (zone D, $c_{pe}$ positif), la paroi opposée est la face **sous le vent** (zone E, dépression). Question 5 du QCM neige et vent A.`,
    { id: 'stab1-vent-qcmA-005', src: [QCMA(1, 'question 5'), COURS(43)], tags: ['qcm-A'], exam: true })
  .single(1, 'L’effet du vent sur une structure est principalement…', ['linéique', 'ponctuel', '*surfacique', 'volumique'],
    r`Le vent s'exerce sous forme de **pression** sur les parois ($w = q_p\,c_p$ en kN/m²) : c'est une action **surfacique**. On la transforme ensuite en charge linéique sur les lisses, pannes ou portiques en multipliant par la largeur de reprise. Question 6 du QCM A.`,
    { id: 'stab1-vent-qcmA-006', src: [QCMA(1, 'question 6'), COURS(42)], tags: ['qcm-A'], exam: true })
  .single(1, 'La direction de l’action du vent sur une paroi est majoritairement…', ['*normale', 'tangente', 'quelconque'],
    r`Cours p.42 : le vent s'exerce sous forme de pression, ce qui engendre des **efforts perpendiculaires (normaux) aux surfaces**. Les frottements tangentiels existent mais sont négligeables pour les bâtiments courants. Question 7 du QCM A.`,
    { id: 'stab1-vent-qcmA-007', src: [QCMA(1, 'question 7'), COURS(42)], tags: ['qcm-A'], exam: true })
  .single(1, 'Le vent engendre, en réalité, des efforts…', ['*dynamiques', 'statiques'],
    r`Le vent est turbulent (rafales) : ses efforts sont en réalité **dynamiques**. L'Eurocode les remplace par une pression statique équivalente ($q_p$, pression dynamique **de pointe**, qui intègre les rafales via $c_e$). Question 8 du QCM A.`,
    { id: 'stab1-vent-qcmA-008', src: [QCMA(1, 'question 8'), COURS(42)], tags: ['qcm-A'], exam: true })
  .single(1, 'La valeur de base de la vitesse de référence ($v_{b,0}$) est fonction…', [
    'de l’existence ou non de masques aux alentours', 'de la hauteur z', '*du lieu de l’ouvrage',
  ], r`$v_{b,0}$ se lit sur la **carte des régions de vent** (1 = 22, 2 = 24, 3 = 26, 4 = 28 m/s) : elle ne dépend que du **lieu**. Les masques et la rugosité interviennent via la catégorie de terrain dans $c_e(z)$, et la hauteur z aussi via $c_e(z)$. Question 9 du QCM A.`,
    { id: 'stab1-vent-qcmA-009', src: [QCMA(1, 'question 9'), COURS(47), COURS(48)], tags: ['qcm-A'], exam: true, hints: { b: 'La hauteur z intervient dans c_e(z), pas dans v_b,0.' } })
  .single(2, '$c_{pe}$ et $c_{pi}$ sont positifs tous deux lorsque…', [
    'la face reçoit le vent',
    '*la paroi subit une pression sur ses deux faces',
    'la paroi subit une dépression sur chaque face',
    'les actions intérieure et extérieure vont « de l’extérieur vers l’intérieur »',
    'les actions intérieure et extérieure vont « de l’intérieur vers l’extérieur »',
  ], r`Convention : un coefficient **positif = pression** (l'air pousse **vers la paroi**), négatif = dépression (succion). $c_{pe} > 0$ : pression sur la face extérieure ; $c_{pi} > 0$ : pression sur la face intérieure. Les deux positifs = **pression sur les deux faces** (les actions sont alors de sens opposés et se retranchent : $c_{p,net} = c_{pe} - c_{pi}$). Question 10 du QCM A.`,
    { id: 'stab1-vent-qcmA-010', src: [QCMA(1, 'question 10'), COURS(57)], tags: ['qcm-A'], exam: true,
      hints: { a: 'Une face au vent a c_pe > 0 mais c_pi peut être négatif.', d: 'c_pi > 0 pousse de l’intérieur vers l’extérieur : les deux actions ne vont pas dans le même sens.' } })
  .num(1, r`La Rochelle, région de vent **3**. Calcule la pression dynamique de référence $q_b$ (prendre $\rho = 1{,}225$ kg/m³, $c_{dir} = c_{season} = 1$).`, round3(qb(26)), 'kN/m²',
    r`$v_b = c_{dir}\,c_{season}\,v_{b,0} = 26$ m/s.
$$q_b = \tfrac12\,\rho\,v_b^2 = 0{,}5\times1{,}225\times26^2 = 414\ \text{N/m}^2 = 0{,}414\ \text{kN/m}^2$$
⚠️ Le cours affiche **0,422 kN/m²** car une diapo (p.47-48) utilise $\rho = 1{,}25$. Les deux valeurs sont acceptées ici (écart 2 %).`,
    { src: [COURS(48), COURS(58, 'ρ = 1,25 sur certaines diapos')], tol: 2.5 })
  .num(1, r`Clermont-Ferrand, région de vent **2**. Calcule $q_b$ ($\rho = 1{,}225$ kg/m³).`, round3(qb(24)), 'kN/m²',
    r`$$q_b = 0{,}5\times1{,}225\times24^2 = 352{,}8\ \text{N/m}^2 = 0{,}353\ \text{kN/m}^2$$
Puis, en catégorie IIIb à 8,5–10 m ($c_e \approx 1{,}35$) : $q_p = 1{,}35\times0{,}353 = 0{,}48$ kN/m², valeur du TD garage.`,
    { src: [COURS(58), TD(3)], exam: true })
  .num(2, r`La Rochelle : $q_b = 0{,}422$ kN/m² (valeur du cours), catégorie IIIb, $h = 10$ m, $c_e(10) = 1{,}35$ lu sur l'abaque. Calcule $q_p$.`, 0.57, 'kN/m²',
    r`$$q_p(z) = c_e(z)\,q_b = 1{,}35\times0{,}422 = 0{,}570\ \text{kN/m}^2$$
(avec $q_b = 0{,}414$ on trouve 0,559, accepté). $c_e$ intègre la rugosité du terrain (IIIb = zone industrielle) et la topographie (terrain plat). z = **hauteur** du bâtiment (10 m), pas l'altitude.`,
    { src: [COURS(58)], exam: true, tol: 2.5 })
  .single(1, 'Bâtiment dans une **zone industrielle**. Catégorie de terrain ?', ['0', 'II', 'IIIa', '*IIIb', 'IV'],
    r`Cours p.51-53 : **0** = mer, côte exposée, lacs ; **II** = rase campagne ; **IIIa** = campagne avec haies, vignobles, habitat dispersé ; **IIIb = zones urbanisées ou industrielles, bocage dense, vergers** ; **IV** = zones urbaines denses (≥ 15 % de bâtiments de plus de 15 m), forêts. C'est la catégorie de l'exemple de La Rochelle.`,
    { src: [COURS(52), COURS(53)], exam: true })
  .single(1, 'Construction en bord de mer, face au large. Catégorie de terrain ?', ['*0', 'II', 'IIIb', 'IV'],
    r`La catégorie **0** correspond à la mer ou une zone côtière exposée aux vents de mer, et aux lacs et plans d'eau parcourus par le vent sur au moins 5 km (cours p.52). C'est la rugosité la plus faible → $c_e(z)$ le plus élevé → pression la plus forte.`,
    { src: [COURS(52)], exam: true })
  .num(1, r`Bâtiment $b = 20$ m (face au vent), $d = 50$ m, $h = 10$ m. Calcule $e$ pour le zonage des parois.`, 20, 'm',
    r`$$e = \min(b\ ;\ 2h) = \min(20\ ;\ 20) = 20\ \text{m}$$
$e < d = 50$ m → trois zones A, B, C sur les parois parallèles au vent : A sur $e/5 = 4$ m, B sur $4e/5 = 16$ m, C sur le reste (30 m) (exemple du cours p.64-65). b est **la largeur exposée au vent**.`,
    { src: [COURS(63), COURS(64)], data: [CPE_MURS], exam: true })
  .num(2, r`TD garage, vent sur le long-pan : $b = 8$ m, $d = 21$ m, $h = 8{,}5$ m. Calcule $e$.`, 8, 'm',
    r`$e = \min(b\ ;\ 2h) = \min(8\ ;\ 17) = 8$ m. Comme $e < d$, on a les zones A ($e/5 = 1{,}6$ m), B ($4e/5 = 6{,}4$ m) et C (13 m), comme sur la sortie logiciel du corrigé (p.5, p.9). En toiture, les bandes F/G font $e/10 = 0{,}8$ m.`,
    { src: [TD(9), TD(5)], data: [CPE_MURS] })
  .num(2, r`Bâtiment $b = 20$ m, $h = 10$ m, $d = 50$ m. Largeur de la zone **A** sur les parois latérales ?`, 4, 'm',
    r`$e = \min(20\ ;\ 20) = 20$ m < d. La zone A s'étend sur $e/5 = 4$ m depuis l'angle au vent, B sur $4e/5 = 16$ m, C sur $50 - 20 = 30$ m (cours p.65). La zone A est la plus dépressionnaire ($c_{pe,10} = -1{,}2$) car l'écoulement décolle à l'angle.`,
    { src: [COURS(63), COURS(65)], data: [CPE_MURS] })
  .num(2, r`Paroi au vent (zone D) d'un bâtiment avec $h/d = 0{,}4$. Calcule $c_{pe,10}$ par interpolation.`, 0.72, '',
    r`Tableau : D = +0,7 pour $h/d \le 0{,}25$ et +0,8 pour $h/d = 1$.
$$c_{pe,D} = 0{,}7 + (0{,}8 - 0{,}7)\,\frac{0{,}4 - 0{,}25}{1 - 0{,}25} = 0{,}7 + 0{,}02 = 0{,}72$$
De même pour E : $-0{,}3 + (-0{,}2)\times0{,}2 = -0{,}34$ (TD garage, vent sur long-pan, p.9).`,
    { src: [TD(9), COURS(63)], data: [CPE_MURS] })
  .num(2, r`Toiture plate (zone F, $c_{pe,10} = -1{,}8$), $q_p = 0{,}570$ kN/m². Calcule la pression nette **la plus défavorable** avec $c_{pi} = +0{,}2$ ou $-0{,}3$.`, -1.14, 'kN/m²',
    r`$$c_{p,net} = c_{pe} - c_{pi} = -1{,}8 - 0{,}2 = -2{,}0\quad(\text{ou } -1{,}8 + 0{,}3 = -1{,}5)$$
On retient $-2{,}0$ : $p = q_p\,c_{p,net} = 0{,}570\times(-2{,}0) = -1{,}14$ kN/m² (dépression, exemple du cours p.73). La surpression intérieure aggrave la dépression extérieure en toiture.`,
    { src: [COURS(72), COURS(73)], data: [CPE_TOIT_PLAT], exam: true })
  .num(2, r`Paroi au vent (zone D, $c_{pe} = +0{,}7$), $q_p = 0{,}570$ kN/m². Pression nette la plus défavorable ?`, 0.57, 'kN/m²',
    r`Pour une paroi en pression, le cas le pire est l'intérieur en **dépression** : $c_{p,net} = 0{,}7 - (-0{,}3) = 1{,}0$.
$$p = 0{,}570\times1{,}0 = +0{,}57\ \text{kN/m}^2$$
(cours p.73 : « + 0,57 kN/m² (surpression) »). Avec $c_{pi} = +0{,}2$ on n'aurait que $0{,}5\times0{,}57 = 0{,}29$.`,
    { src: [COURS(72), COURS(73)], data: [CPE_MURS] })
  .num(3, r`TD garage, vent sur pignon : sur la panne de 8 m, la zone F/G ($p = -0{,}72$ kN/m²) occupe 1,7 m et la zone H ($p = -0{,}38$) occupe 6,3 m. Calcule la pression **linéarisée** (moyenne pondérée) sur la panne.`, -0.45, 'kN/m²',
    r`On remplace les deux zones par une pression uniforme équivalente :
$$p = \frac{1{,}7\times(-0{,}72) + 6{,}3\times(-0{,}38)}{8} = \frac{-1{,}224 - 2{,}394}{8} = -0{,}45\ \text{kN/m}^2$$
C'est la dépression $W^-$ retenue pour les pannes (corrigé p.12). En surpression, on retient +0,24 kN/m² (vent sur long-pan, zone H).`,
    { src: [TD(12)], tol: 3 })
  .num(3, r`Zone F d'une toiture 1 versant à 5° ($c_{pe,10} = -1{,}7$ ; $c_{pe,1} = -2{,}5$). Surface chargée $A = 5$ m². Calcule $c_{pe}$.`, -1.94, '',
    r`Pour $1 < A < 10$ m² : $c_{pe} = c_{pe,1} + (c_{pe,10} - c_{pe,1})\log_{10}A$ (cours p.61).
$$c_{pe} = -2{,}5 + (-1{,}7 + 2{,}5)\times\log_{10}5 = -2{,}5 + 0{,}8\times0{,}699 = -1{,}94$$
Les petites surfaces (fixations, éléments de bardage) subissent des pointes plus fortes, d'où $c_{pe,1}$.`,
    { src: [COURS(61)], data: [CPE_1VERSANT] })
  .single(2, 'Bâtiment de hauteur $h = 10$ m et de largeur au vent $b = 20$ m : comment découper la hauteur pour $z_e$ ?', [
    r`*une seule bande, $z_e = h = 10$ m`,
    r`deux bandes : $z_e = b$ en bas, $z_e = h$ en haut`,
    r`des bandes de 1 m`,
    r`$z_e$ = altitude du site`,
  ], r`Cours p.57 : si $h \le b$ → **une seule bande**, $z_e = h$ ; si $b < h \le 2b$ → deux bandes ; si $h > 2b$ → plusieurs bandes. Ici $10 < 20$ → $z_e = 10$ m, et c'est à cette hauteur qu'on lit $c_e(z_e)$ sur l'abaque (exemple du cours p.58).`,
    { src: [COURS(57), COURS(58)], exam: true })
  .num(2, r`Région de vent **4**. Calcule $q_b$ ($\rho = 1{,}225$ kg/m³).`, round3(qb(28)), 'kN/m²',
    r`$v_{b,0} = 28$ m/s (région 4) :
$$q_b = 0{,}5\times1{,}225\times28^2 = 480\ \text{N/m}^2 = 0{,}480\ \text{kN/m}^2$$
Retenir les vitesses : 22 / 24 / 26 / 28 m/s pour les régions 1 à 4 (80 / 88 / 93 / 101 km/h).`,
    { src: [COURS(48)] });

// =====================================================================
// 5. Stabilité d'ensemble
// =====================================================================
const stab = new Bank('stabilite');
stab
  .single(1, 'Le vent sur le **pignon** est repris en toiture par…', ['les lisses de bardage', '*la poutre au vent (contreventement transversal de toiture)', 'les palées de stabilité directement', 'les liernes'],
    r`Cheminement (poly p.9) : bardage → lisses → **potelets** → fondations et pannes → **poutre au vent** (treillis horizontal en toiture formé par les pannes, les portiques et des diagonales) → **palées de stabilité** de long-pan → fondations. La poutre au vent est une poutre à treillis sur 2 appuis, les palées sont ses appuis.`,
    { src: [POLY(9), COURS(84)], exam: true })
  .single(1, 'Quel est le rôle d’une **palée de stabilité** ?', [
    'reprendre la neige sur la toiture',
    '*ramener aux fondations l’effort horizontal longitudinal (poutre au vent) dans le plan du long-pan',
    'supporter le bardage',
    'empêcher la panne de déverser',
  ], r`Cours p.85 : « La poutre au vent en toiture apporte un effort en long-pan qui doit être repris par une ou plusieurs **palées de stabilité** influant sur les fondations. » Ce sont des contreventements verticaux de façade (croix de Saint-André), comportant des poutres treillis en console qui assurent la stabilité **longitudinale** du bâtiment.`,
    { src: [COURS(85), POLY(9)], exam: true })
  .single(1, 'Dans une croix de contreventement (palée) en ronds ou cornières fines, quelle diagonale travaille sous un vent donné ?', [
    '*la diagonale tendue',
    'la diagonale comprimée',
    'les deux, à parts égales',
    'aucune : c’est le poteau qui reprend tout',
  ], r`Les diagonales minces flambent sous un faible effort de compression : on ne compte que la **diagonale tendue** (cours p.85 : « traction dans la diagonale »). L'autre diagonale sert lorsque le vent souffle dans l'autre sens. C'est pourquoi on dimensionne ces barres en **traction** ($N_{pl,Rd}$, $N_{u,Rd}$) comme le tirant du TD garage.`,
    { src: [COURS(85), TD(26)], exam: true })
  .single(1, 'Qu’est-ce qui assure la stabilité d’un portique sous un vent soufflant sur le long-pan ?', [
    '*l’encastrement entre poteaux et traverse (effet cadre)',
    'la poutre au vent',
    'les liernes',
    'les pieds de poteaux articulés',
  ], r`Poly p.9 : « C'est l'**encastrement des poteaux avec la traverse** qui assure la stabilité du portique et permet la transmission des charges à la fondation. » Les pieds étant en général articulés, c'est l'effet cadre (nœuds rigides en tête) qui reprend l'effort transversal.`,
    { src: [POLY(9)], exam: true })
  .order(2, 'Remets dans l’ordre le cheminement d’une charge **verticale** (neige) jusqu’au sol.', [
    'Couverture (bac acier)', 'Pannes', 'Traverses des portiques', 'Poteaux', 'Fondations',
  ], r`Poly p.8 (figure 2.3) : la couverture porte entre pannes, les pannes portent entre portiques et chargent les **traverses**, qui descendent aux **poteaux**, puis aux **fondations**. Le « cheminement des charges » consiste à suivre la charge de son point d'application jusqu'au sol, en passant par toutes les attaches.`,
    { src: [POLY(8)] })
  .order(2, 'Remets dans l’ordre le cheminement de l’effort du **vent sur pignon**.', [
    'Bardage du pignon', 'Lisses de bardage', 'Potelets', 'Pannes (comprimées)', 'Poutre au vent en toiture', 'Palées de stabilité de long-pan',
  ], r`Poly p.9 : « les forces sont transmises par les lisses aux potelets, les potelets les transmettent aux fondations et aux pannes, les pannes (comprimées) les transmettent alors au contreventement transversal de toiture (poutre au vent), […] dont les 2 appuis sont réalisés par les 2 contreventements verticaux de façade long-pan » = palées de stabilité.`,
    { src: [POLY(9), POLY(10)] })
  .single(2, 'Sur une toiture en pente, les **liernes** (ou entretoises) reprennent principalement…', [
    r`la composante $P\cos\alpha$ des charges`,
    r`*la composante $P\sin\alpha$ des charges, parallèle au versant`,
    'le vent sur le pignon',
    'le poids propre des portiques',
  ], r`Cours p.76-77 : une charge verticale P sur une panne inclinée donne $P\cos\alpha$ (⊥ versant) et $P\sin\alpha$ (// versant). La panne est faible autour de z : les liernes créent des appuis intermédiaires pour cette composante et cumulent les efforts ($P_1$, $2P_1$, $3P_1$…) jusqu'au faîtage ou à un point fixe. Dans le TD garage, elles divisent la flèche en y par 16.`,
    { src: [COURS(76), COURS(77), TD(22)], exam: true })
  .num(2, r`Panne continue sur 2 travées reliée par une lierne : $p = 3$ kN/ml, $L = 4$ m, pente $\alpha = 15°$. Effort repris par la lierne : $P_1 = 0{,}625\,p\,L\sin\alpha$.`, 1.94, 'kN',
    r`$$P_1 = 0{,}625\times3\times4\times\sin15° = 7{,}5\times0{,}2588 = 1{,}94\ \text{kN}$$
0,625 pL est la réaction d'appui central d'une poutre continue à 2 travées égales (5pL/8). La lierne voisine reprend $2P_1$, etc., jusqu'à l'ancrage (cours p.77).`,
    { src: [COURS(77)] })
  .tf(1, 'Les pieds de poteaux d’une halle métallique sont en général **articulés**.', true,
    r`**Vrai.** Poly p.25 : les pieds de poteaux réalisent « en général une **articulation**, rarement un encastrement ». Conséquence : la stabilité transversale vient de l'effet cadre en tête (encastrement poteau-traverse) et la stabilité longitudinale des palées. Une articulation simplifie les fondations (pas de moment).`,
    { src: [POLY(25)], exam: true })
  .multi(2, 'Coche les éléments qui appartiennent à la **charpente de pignon**.', ['*Lisses de bardage', '*Potelets', '*Bardage', 'Pannes', 'Palées de stabilité'],
    r`Poly p.7 : les charpentes de pignon sont parallèles au plan des portiques et comprennent **lisses, bardage, potelets**. Les pannes appartiennent à la toiture, les palées de stabilité aux façades de **long-pan** (contreventements verticaux).`,
    { src: [POLY(7), POLY(8)] })
  .single(2, 'Dans la poutre au vent (treillis de toiture), comment travaillent les **pannes** ?', ['en traction', '*en compression (montants du treillis)', 'en torsion', 'elles ne participent pas'],
    r`Les pannes servent de **montants** au treillis horizontal et transmettent l'effort des potelets : elles sont **comprimées** (poly p.9 : « les pannes (comprimées) les transmettent alors au contreventement transversal »). Les diagonales (croix) travaillent en traction (cours p.84). Une panne doit donc aussi être vérifiée en flexion + compression.`,
    { src: [POLY(9), COURS(84)] })
  .single(1, 'Pour qu’une halle (boîte de 6 faces) soit stable, il faut que…', [
    'tous les assemblages soient soudés',
    '*chacun des plans soit rigide dans son plan, par effet cadre ou par contreventement',
    'les pieds de poteaux soient encastrés',
    'la toiture soit en béton',
  ], r`Poly p.7 : « Pour assurer la stabilité de cette boîte, il est nécessaire que chacune des 3 directions soit **rigide dans son plan**, par **effet cadre ou par contreventement**. » On décompose ensuite l'ossature en sous-structures planes : portiques, pignons, long-pans, toiture.`,
    { src: [POLY(7)], exam: true })
  .num(2, r`La flèche d'une panne dans le plan du versant vaut 36,7 mm sur 4 m. On ajoute une lierne à mi-portée : quelle flèche obtient-on ?`, 2.29, 'mm',
    r`La flèche d'une poutre isostatique sous charge répartie varie en $L^4$ ($w = 5pL^4/384EI$). Avec une lierne à L/2, la portée est divisée par 2 → flèche divisée par $2^4 = 16$ :
$$w = 36{,}7/16 = 2{,}29\ \text{mm}$$
(TD garage p.22 : de 0,0367 m à ≈ 0,003 m, ce qui rend la flèche acceptable).`,
    { src: [TD(22)], tol: 3 });

function round3(x: number) {
  return +x.toFixed(3);
}

export const ACTIONS_BANKS = [ec0, charges, neige, vent, stab];
export { round3, VB0 };
