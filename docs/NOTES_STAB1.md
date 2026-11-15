# NOTES STAB 1 — base de connaissances pour RéviZ

Synthèse structurée des 13 PDF de `docs/stab1/`, lus en entier (texte + pages image).
Toutes les références de page sont des **numéros de page PDF** (= numéro affiché « x/45 » pour le poly, « x/44 » pour le corrigé TD).

Notes brutes détaillées (page par page) : [notes_brutes/](notes_brutes/) — catalogue des profilés transcrit : [data/profils_poly.json](data/profils_poly.json).

## 0. Inventaire des sources

| Fichier (`docs/stab1/`) | Pages | Contenu | Nature |
|---|---|---|---|
| `STAB1_Cours_2_2022_Masson.pdf` | 87 | Classification des actions, neige EN 1991-1-3, vent EN 1991-1-4, stabilité d'ensemble | diapos (tableaux et cartes en image) |
| `POLY_2026_metal.pdf` | 45 | Construction métallique EC3 : acier, ossature, EC0, ELS, ELU, pieds de poteaux, mixte, catalogues | texte + catalogues en image (p.30–43) |
| `MEMO_STAB_BM_EC3_EC5_2022.pdf` | 8 | Mémo EC3/EC5 : flexion, cisaillement, traction/compression, ELS, coefficients EC5, matériaux | texte + tableaux |
| `QCM_neige_et_vent_A_corrigé.pdf` | 2 | QCM noté +2/−1/0, réponses surlignées | texte |
| `Partiel_2023_STAB01.pdf` | 3 | Partiel métal (panne IPE) + bois (solive GL24h) | texte + tableau |
| `CORRIGE_TD_2024.pdf` | 44 | TD « garage de Dédé » complet (neige, vent, bac acier, G, combinaisons, IPE, tirant, panne bois, tirant bois) | texte + captures logiciel + scans manuscrits |
| `Sujets_de_TD_STAB1_BA_2026-2027.pdf` | 12 | Sujets TD 1 à 6 de béton armé | texte |
| `Correction_TD1_moodle.pdf` | 3 | Corrigé TD1 (matériaux) + tableau des sections d'armatures + conversions | tableur scanné |
| `Correction_TD2_moodle.pdf` | 1 | Corrigé TD2 (enrobages, espacements) + tableau c_min,dur | tableur scanné |
| `Correction_TD3_moodle.pdf` | 1 | Corrigé TD3 (adhérence, ancrages, l_b,rqd) | tableur scanné |
| `Correction_TD4_moodle_Q1_et_Q2.pdf` | 1 | Corrigé TD4 Q1–Q2 (longueur de flambement, raideurs) | tableur scanné |
| `Correction_TD4_moodle_Q3.pdf` | 1 | Corrigé TD4 Q3 (poteaux P0, P1, P2) | tableur scanné |
| `Correction_TD5_moodle.pdf` | 1 | Corrigé TD5 Q1 (flexion simple PT3) | tableur scanné |

> ⚠️ **Le cours magistral de béton armé n'est pas fourni.** Les formules BA ci-dessous viennent des corrigés de TD (qui citent des « diapos » p.67–72) et, à défaut, de l'EC2 standard (signalé « EC2 standard »).
> ⚠️ **Le cours 2 ne développe pas l'EC0** (états limites, combinaisons, ψ) : ces éléments viennent du poly métal ch.3 (p.11–12) et du mémo p.7.
> ⚠️ Il n'existe **pas de « poly bois »** dans les documents, alors que le corrigé TD le cite (« p.13, 15, 19, 21 du poly bois ») : on s'appuie sur le mémo EC3/EC5.

---

## 1. Bases EC0 (thème `ec0`)

- **Exigences** (poly p.11) : apte à l'utilisation pendant la durée de vie → **ELS** ; résister à toutes les actions en construction et exploitation → **ELU**.
- **ELS** = fonctionnement en utilisation normale, confort des personnes, aspect (poly p.13). Vérifications : flèches verticales, vibrations (non traitées), déplacements horizontaux.
- **Durées indicatives d'utilisation de projet** (poly p.11, table 3.1) : cat.1 = 10 ans (provisoires) ; cat.2 = 25 ans (éléments remplaçables) ; cat.3 = 25 ans (agricoles) ; cat.4 = **50 ans (bâtiments courants)** ; cat.5 = 100 ans (monumentaux, stratégiques).
- **Classification des actions** (cours p.4–8 ; poly p.11) : **G** permanentes (poids propres : poutres, planchers, cloisons, tuiles) ; **Q** variables (mobilier, personnes, vent, neige) ; **A** accidentelles (ex. bateau contre un pont) ; **A_E** sismiques (séisme d'Izmit 1999).
- **Combinaisons** (poly p.12) :
  - ELU durable/transitoire (STR & GEO) : $1{,}35\,G_{k,sup} + 1{,}00\,G_{k,inf} + 1{,}50\,Q_{k,1} + 1{,}50\sum\psi_{0,i}Q_{k,i}$
  - Accidentelle : $\sum G_{k,j} + A_d + (\psi_{1,1}\text{ ou }\psi_{2,1})Q_{k,1} + \sum\psi_{2,i}Q_{k,i}$ — ⚠️ le poly écrit « + 1,50 Σψ0,i Qk,i » : coquille (EN 1990 : Σψ2,i).
  - Sismique : $\sum G_{k,j} + A_{Ed} + \sum\psi_{2,i}Q_{k,i}$
  - ELS caractéristique (irréversible) : $\sum G_{k,j} + Q_{k,1} + \sum\psi_{0,i}Q_{k,i}$
- **Coefficients ψ** (poly p.12 table 3.2 ; mémo p.7 tableau complet) — ψ0 / ψ1 / ψ2 :
  - Exploitation cat. A (habitation) 0,7 / 0,5 / 0,3 ; B (bureaux) 0,7 / 0,5 / 0,3 ; C (réunion) 0,7 / 0,7 / 0,6 ; D (commerces) 0,7 / 0,7 / 0,6 ; E (stockage) 1,0 / 0,9 / 0,8 ; F (véhicules ≤ 30 kN) 0,7 / 0,7 / 0,6 ; G (30–160 kN) 0,7 / 0,5 / 0,3 ; H (toits) 0 / 0 / 0.
  - Neige H ≤ 1000 m : 0,50 / 0,20 / 0 ; H > 1000 m : 0,70 / 0,50 / 0,20. Vent : 0,6 / 0,2 / 0. Température : 0,6 / 0,5 / 0.
- **Méthode du TD** (corrigé TD p.18) : on liste toutes les combinaisons (1,35G ; 1,35G + 1,5Q ; 1,35G + 1,5Sn ; 1,35G + 1,5W+ ; 1,00G + 1,5W− ; 1,35G + 1,5Sn + 1,5×0,6W+ ; 1,35G + 1,5W+ + 1,5×0,5Sn…) et on garde la plus défavorable. G favorable (soulèvement) → **1,00 G**.
- Q de toiture cat. H **non cumulable** avec neige ni vent (corrigé TD p.13, AN EC1-1).

## 2. Charges EC1-1 (thème `charges`)

- **Toitures cat. H** (corrigé TD p.13, AN tableau 6.10 NF) : pente < 15 % avec étanchéité : q_k = 0,8 kN/m², Q_k = 1,5 kN ; autres toitures : q_k = 0, Q_k = 1,5 kN. q_k sur 10 m² (côtés dans un rapport ≤ 2) ; q_k et Q_k non simultanées ; non cumulées avec neige/vent. Pente 15° → 100 tan 15° = 26,8 % > 15 % → charge ponctuelle 1,5 kN au milieu de la panne.
- **Charges permanentes type** (corrigé TD p.14) : bac acier 0,08 ; chevrons 55×75 (e 600) 0,03 ; contre-liteaux 27×45 (e 500) 0,01 ; OSB 16 mm 0,11 ; fibre de bois 220 mm 0,11 ; lambris 0,05 ; divers 0,05 → **0,45 kN/m²**, + poids propre de la panne (inconnu tant que la section n'est pas choisie : c'est « le problème »).
- **Bac acier** (p.13–14) : tableau des portées → portée 2,25 m (0,63 mm) à 2,70 m (0,75 mm) en 2 travées égales ; rampant 5,176 m → appui intermédiaire → 2,588 m → bac 0,75 mm, 6,84 daN/m².
- **Charge linéique = charge surfacique × largeur de reprise (entraxe)** ; la neige (par m² de projection horizontale) est multipliée par **cos α** pour passer au rampant (p.17) ; projection sur l'axe z de la panne × cos α, sur y × sin α (p.17–19).
- Bureaux cat. B : 2,5 kN/m² ; logements : 3 kN/m² dans le TD4 BA ; béton armé 25 kN/m³ (TD6 BA) ; bois GL24h ρ_mean 420 kg/m³ (≈ 4,2 kN/m³) ; acier 7850 kg/m³.

## 3. Neige EC1-3 (thème `neige`)

- s_k = valeur caractéristique de la charge de neige **au sol** ; probabilité annuelle de dépassement 0,02 → période de retour **50 ans** ; action variable, fixe, statique (cours p.11). Neige exceptionnelle et accumulation exceptionnelle (annexe B) → **accidentelles**.
- **Régions** (cours p.12) : A1, A2, B1, B2, C1, C2, D, E. Charente (16) et **Charente-Maritime (17) = A2** ; Deux-Sèvres (79), Vendée (85), Vienne (86) = A1 ; Paris = A1 ; Clermont-Ferrand (63) = A2 (corrigé TD p.3).
- **s_k (≤ 200 m)** (cours p.14–17) : A1 = A2 = 0,45 ; B1 = B2 = 0,55 ; C1 = C2 = 0,65 ; D = 0,90 ; E = 1,40 kN/m².
- **s_Ad** (neige exceptionnelle) : A2 1,00 ; B1 1,00 ; B2 1,35 ; C2 1,35 ; D 1,80 ; A1, C1, E : pas de valeur.
- **Altitude A (m)** : Δs1 (régions A1 à D) : 200–500 m : A/1000 − 0,20 ; 500–1000 m : 1,5A/1000 − 0,45 ; 1000–2000 m : 3,5A/1000 − 2,45. Δs2 (région E) : 1,5A/1000 − 0,30 ; 3,5A/1000 − 1,30 ; 7A/1000 − 4,80.
- **Exemples** (cours p.18 ; TD p.3) : La Rochelle et Paris s_k = 0,45 ; neige accidentelle oui à La Rochelle (1 kN/m²), non à Paris ; Lourdes (500 m, A2) 0,45 + 0,5 − 0,2 = **0,75** ; Gourette (1400 m) 0,45 + 4,9 − 2,45 = **2,9 kN/m²** (≈ 290 kg/m²) ; Clermont (360 m) 0,45 + 0,16 = **0,61 kN/m²**.
- **Formules** (cours p.19) : $s = \mu_i C_e C_t s_k$ (durable/transitoire) ; $s = \mu_i C_e C_t s_{Ad}$ (accidentelle, neige exceptionnelle) ; $s = \mu_i s_k$ (accidentelle, accumulation exceptionnelle). μ = coefficient de **forme** ; C_e exposition ; C_t thermique.
- **C_e** (p.20) : site normal 1,0 ; site protégé 1,25 (abri quasi permanent par les bâtiments voisins). **C_t** (p.21) : 1,0 sauf toitures à forte transmission thermique (> 1 W/m²K, vitrées) où C_t < 1.
- **μ1, μ2** (p.22) : μ1 = 0,8 pour 0 ≤ α ≤ 30° ; 0,8(60 − α)/30 pour 30 < α < 60° ; 0 pour α ≥ 60°. μ2 = 0,8 + 0,8α/30 (0–30°) ; 1,6 (30–60°). μ3 (cylindrique) = 0,2 + 10h/b ≤ 2,0 (graphe p.22), 0 si β > 60°.
- **1 versant** (p.23) : μ1(α) uniforme ; ex. 45° → 0,4. **2 versants** (p.24–25) : cas (i) μ1(α1) / μ1(α2) ; (ii) 0,5μ1(α1) / μ1(α2) ; (iii) μ1(α1) / 0,5μ1(α2). **Versants multiples** (p.26–27) : (i) μ1 partout ; (ii) μ2(ᾱ) dans la noue, ᾱ = (α1 + α2)/2. **Cylindriques** (p.28–29) : (i) 0,8 ; (ii) 0,5μ3 / μ3, l_s entre tangentes à 60°. **Attenantes** (p.30) : μ2 = μ_s + μ_w (glissement + vent).
- **Accumulation au droit d'obstacles (acrotère)** (p.31–32) — accidentelle, s = μ s_k : μ1 = 0,8 ; μ2 = γh/s_k avec 0,8 ≤ μ2 ≤ 2,0 (1,6 entre deux acrotères) ; γ = 2 kN/m³ ; l_s = 2h, 5 m ≤ l_s ≤ 15 m.
- **Application cours** (p.33–39) : La Rochelle, 25 m, toiture plate à arêtes vives, 20 × 50 × 10 m : s = 0,8 × 0,45 = **0,36 kN/m²** ; accidentelle 0,8 × 1 = **0,8 kN/m²** (⚠️ la diapo p.39 écrit « 0,8 × 1 = 0,36 » : coquille) ; pas d'acrotère → pas d'accumulation.
- **TD garage** (p.3) : s = 0,8 × 0,61 = 0,49 kN/m² ; s_Ad × 0,8 = 0,8 kN/m² ; « neige exceptionnelle ≈ 2 chutes successives sans fonte » ; non combinée avec accumulation.

## 4. Vent EC1-4 (thème `vent`)

- Action fonction de la vitesse, de la catégorie et des proportions de la construction, de l'emplacement et de l'orientation de l'élément, de ses dimensions et de la forme de la paroi (cours p.41). Pression → efforts **perpendiculaires** aux parois (p.42), sur faces extérieures **et intérieures**. Faces « au vent » et « sous le vent » (p.43). Effet principalement **surfacique**, efforts en réalité **dynamiques** (QCM).
- **v_b,0** (p.47–48) = vitesse moyenne sur 10 min, à 10 m, rase campagne, période de retour 50 ans ; dépend **du lieu**. Régions : 1 = 22 m/s ; 2 = 24 ; 3 = 26 ; 4 = 28 m/s. Charente-Maritime (littoral) = 3 ; Clermont-Ferrand = 2.
- $v_b = c_{dir}\,c_{season}\,v_{b,0}$, c_dir = c_season = 1 en courant. $q_b = \tfrac12\rho v_b^2$.
  - ⚠️ **ρ incohérent dans le cours** : 1,25 kg/m³ p.47–48 (→ La Rochelle q_b = 42,25 daN/m² = 0,422 kN/m²), puis 1,225 p.58 (→ 0,414 réellement, mais la diapo garde 0,422). Clermont 0,5 × 1,225 × 24² = 0,353 ✓. **Décision appli : ρ = 1,225 kg/m³** (valeur EC) et la correction signale l'écart.
- $q_p(z) = c_e(z)\,q_b$ ; **z = hauteur de la construction, pas l'altitude** (p.55). c_e(z) dépend de la rugosité (catégorie de terrain) et de la topographie (abaque p.54–55, courbes 0, II, IIIa, IIIb, IV, terrain plat).
- **Catégories de terrain** (p.51–53) : **0** mer, zone côtière exposée, lacs ≥ 5 km ; **II** rase campagne, obstacles isolés espacés de plus de 40 fois leur hauteur ; **IIIa** campagne avec haies, vignobles, bocage, habitat dispersé ; **IIIb** zones urbanisées ou industrielles, bocage dense, vergers ; **IV** zones urbaines denses (≥ 15 % de la surface couverte de bâtiments > 15 m), forêts.
- **Exemples** : La Rochelle IIIb h = 10 m : c_e = 1,35 → q_p = 1,35 × 0,422 = **0,570 kN/m²** (p.58) ; Clermont : 1,35 × 0,353 = **0,48** (p.58 ; TD garage z = 8,5 m, q_p = 0,48).
- **Hauteur de référence z_e** (p.57) : h ≤ b → une bande, z_e = h ; b < h ≤ 2b → 2 bandes ; h > 2b → bandes multiples.
- **Pressions** : $w_e = q_p c_{pe}$ ; $w_i = q_p c_{pi}$ ; $p = q_p(c_{pe} - c_{pi})$ ; $c_{p,net} = c_{pe} - c_{pi}$ (p.57–59).
- **C_pe et surface chargée A** (p.61) : $c_{pe} = c_{pe,1}$ si A ≤ 1 m² ; $c_{pe,1} + (c_{pe,10} - c_{pe,1})\log_{10}A$ si 1 < A < 10 m² ; $c_{pe,10}$ si A ≥ 10 m².
- **Murs verticaux** (p.63) : b = largeur au vent, d = profondeur ; **e = min(b ; 2h)** ; si e < d : A sur e/5, B sur 4e/5, C le reste. C_pe,10 (C_pe,1) :
  | h/d | A | B | C | D | E |
  |---|---|---|---|---|---|
  | 5 | −1,2 (−1,4) | −0,8 (−1,1) | −0,5 | +0,8 (+1,0) | −0,7 |
  | 1 | −1,2 (−1,4) | −0,8 (−1,1) | −0,5 | +0,8 (+1,0) | −0,5 |
  | ≤ 0,25 | −1,2 (−1,4) | −0,8 (−1,1) | −0,5 | +0,7 (+1,0) | −0,3 |
  Interpolation linéaire sur h/d ; ex. TD garage h/d = 0,4 → D = +0,72, E = −0,34 (corrigé TD p.9).
- **Toiture plate à arêtes vives** (p.66–68) : F (e/4 × e/10, aux coins), G (bande e/10 entre les F), H (de e/10 à e/2), I (reste). C_pe,10 : F −1,8 ; G −1,2 ; H −0,7 ; I ±0,2.
- **Toiture 1 versant**, direction θ = 0° (QCM p.2) — C_pe,10 / C_pe,1 :
  | α | F | G | H |
  |---|---|---|---|
  | 5° | −1,7/−2,5 et 0,0 | −1,2/−2,0 et 0,0 | −0,6/−1,2 et 0,0 |
  | 15° | −0,9/−2,0 et +0,2 | −0,8/−1,5 et +0,2 | −0,3 et +0,2 |
  | 30° | −0,5/−1,5 et +0,7 | −0,5/−1,5 et +0,7 | −0,2 et +0,4 |
  | 45° | 0,0 et +0,7 | 0,0 et +0,7 | 0,0 et +0,6 |
  | 60° | +0,7 | +0,7 | +0,7 |
  | 75° | +0,8 | +0,8 | +0,8 |
  θ = 180° : 5° F −2,3/−2,5, G −1,3/−2,0, H −0,8/−1,2 ; 15° F −2,5/−2,8, G −1,3/−2,0, H −0,9/−1,2 ; 30° F −1,1/−2,3, G −0,8/−1,5, H −0,8 ; 45° F −0,6/−1,3, G −0,5, H −0,7 ; 60° et 75° F −0,5/−1,0, G −0,5, H −0,5.
- **C_pi** méthode simplifiée (p.70) : bâtiment courant, situation durable, pas de face dominante → le plus sévère de **+0,2** (surpression intérieure) et **−0,3** (dépression intérieure).
- **Exemple cours** 20 × 50 × 10 m (p.64–73) : h < b → 1 bande ; e = min(20 ; 20) = 20 < d = 50 → A (4 m), B (16 m), C (30 m) ; h/d = 0,2 → pas d'interpolation pour E ; toutes surfaces ≥ 10 m² → C_pe,10. C_p,net (C_pi −0,3 / +0,2) : A −0,9/−1,4 ; B −0,5/−1,0 ; C −0,2/−0,7 ; D +1,0/+0,5 ; E 0,0/−0,5 ; F −1,5/−2,0 ; G −0,9/−1,4 ; H −0,4/−0,9 ; I +0,5/0,0 et +0,1/−0,4. Résultats (q_p = 0,570) : murs A–C **−0,80** ; D **+0,57** ; F **−1,14** ; I **+0,29 kN/m²**.
- **QCM corrigé** (p.2) : zone F, θ = 0°, 1 versant à 34°, 20 m² (≥ 10 → C_pe,10), interpolation entre 30° et 45°. ⚠️⚠️ **Le corrigé se trompe** : il interpole avec **41°** au lieu de 34° (« (X + 0,5)/(41 − 30) = 0,5/15 »). Avec 34° : X = −0,5 + 0,5 × 4/15 = **−0,37** ; la valeur positive reste +0,7. Bonne réponse : **C_pe = −0,37 et +0,7** (le prompt et le corrigé donnent −0,13 : à corriger dans l'appli avec explication).
- **TD garage** (p.4–12) : pignon θ = 90° : e = 17 ; A −1,2 ; B −0,8 ; D +0,8 ; E −0,5 ; F, G −1,3 ; H −0,6 ; I −0,5. C_p,net max : A −1,4 → −0,67 ; D +1,1 → +0,53 ; F/G −1,5 → −0,72 ; H −0,8 → −0,38 kN/m². Long-pan θ = 0° : e = 8 ; F −0,9/+0,2 ; G −0,8/+0,2 ; H −0,3/+0,2 ; I −0,4/0 ; J −1,0/0 ; H net ±0,5 → **±0,24 kN/m²**. **Linéarisation** sur la panne (8 m) : (1,7 × (−0,72) + 6,3 × (−0,38))/8 = **−0,45 kN/m²**. Retenu : W− = −0,45 ; W+ = +0,24.
- **Tirant de palée** (TD p.25) : effort d'ensemble sur pignon → C_pi négligés (s'annulent sur D et E) : C_pe,D − C_pe,E = 0,8 + 0,5 = 1,3 ; F = S × 1,3 × q_p.

## 5. Stabilité d'ensemble & conception (thème `stabilite`)

- Halle = boîte de 6 surfaces ; **chaque plan doit être rigide** (effet cadre ou contreventement) (poly p.7).
- Sous-structures : **portiques** (plan YZ, structure principale) ; **pignons** (lisses, bardage, **potelets**) ; **long-pans** (lisses, contreventements verticaux) ; **toiture** (pannes, contreventements transversaux et longitudinaux) (poly p.7–8).
- **Cheminement des charges verticales** : couverture → pannes → traverses → poteaux → fondations (poly p.8 fig. 2.3).
- **Vent sur long-pan (W_Y)** : bardage → lisses → efforts ponctuels sur le portique ; la stabilité vient de l'**encastrement poteaux-traverse** ; q_w = W_y × l (poly p.9).
- **Vent sur pignon (W_X)** : lisses → potelets → fondations et pannes (comprimées) → **poutre au vent** (contreventement transversal de toiture, treillis sur 2 appuis) → **palées de stabilité** (contreventements verticaux de long-pan, treillis en console) → fondations (poly p.9–10 ; cours p.82–85).
- **Poutre au vent** (cours p.84) : membrures = portiques, montants = pannes (sablière, courantes, faîtière), diagonales = croix de contreventement ; efforts : compression dans les pannes, traction dans les diagonales.
- **Palée de stabilité** (cours p.85) : reprend l'effort de la poutre au vent en long-pan ; seule la **diagonale tendue** travaille (l'autre sert pour le vent inverse) ; réactions verticales et horizontales sur les fondations.
- **Entretoises / liernes** (cours p.76–77 ; TD p.22) : reprennent la composante **P sin α** des pannes inclinées ; efforts cumulés P1, 2P1, 3P1… vers l'appui ; réaction d'appui central d'une poutre continue 2 travées : P1 = 0,625 p L sin α. Liernes à L/2 → flèche dans le plan du versant ÷ 2⁴ = 16.
- Pieds de poteaux en général **articulés** (poly p.25).

## 6. Métal – matériau & profilés (thème `metal-materiau`)

- **Acier** = fer + carbone 0,02 à 2 % ; < 0,008 % → « fer » ; > 2,1 % → fonte ; ↑ carbone → ↑ dureté, ↓ allongement (doux, mi-doux, mi-durs, durs, extra-durs) (poly p.3).
- Production 2019 : 150 Mt/mois dans le monde (moitié Chine) ; France 1,3 Mt/mois ≈ 1 % ; UE ≈ 10 % (poly p.3).
- Atouts : E, f_y, f_u élevés, résilience, **ductilité**, coût modéré (minerai ≈ 5 % de l'écorce). **Recyclage** : 50 % des armatures du béton, **95 %** de la charpente et des bardages. Inconvénients : énergie de fabrication, **corrosion** (peinture, galvanisation, inox), **feu** (flocage, peintures intumescentes) (poly p.3–4). 2 filières : haut-fourneau + convertisseur / ferraille (p.4).
- **Essai de traction** (p.5) : f_u résistance à la traction, f_y limite d'élasticité, A_R allongement après rupture (= (L_R − L0)/L0) ; zones élastique, plastique (palier), écrouissage, striction. Ductilité → évite les ruptures fragiles.
- **Produits** (p.5) : laminés (I, H, U, L, T, plats), profils creux (ronds, carrés, rectangulaires, elliptiques), profils formés à froid (C, Z, Ω).
- **Caractéristiques géométriques** (p.6) : A (cm², traction/compression) ; I (cm⁴, **flèche**) ; W_el (cm³, résistance élastique) ; W_pl (cm³, résistance plastique). Axe **y-y parallèle aux semelles** (forte inertie), z-z perpendiculaire.
- **Nuances** (poly p.44 ; mémo p.1) — f_y / f_u (MPa) pour t ≤ 40 mm : **S235 235/360** ; S275 275/430 ; S355 355/490 ; S450 440/550. 40 < t ≤ 80 mm : 215/360 ; 255/410 ; 335/470 ; 410/550. Désignation : S + f_y de la plus faible épaisseur.
- **Constantes** (p.44) : E = 210 000 MPa ; ν = 0,3 ; G = E/(2(1+ν)) ≈ 80 770 MPa ; ρ = 7850 kg/m³ ; α = 1,2·10⁻⁵ K⁻¹. **γ_M0 = 1,00** (sections) ; **γ_M1 = 1,00** (instabilités) ; **γ_M2 = 1,25** (rupture, section nette).
- **Catalogues** (p.30–43) : HEA/HEB/HEM 100–600, UPN 50–400, IPE 80–500, cornières L35–L200, tubes circulaires → [data/profils_poly.json](data/profils_poly.json). IPE en S235 : classe 1 en flexion.
- **Catalogue du partiel 2023** (IPE 80–180) : valeurs à 2 décimales (ex. IPE 120 I_y 317,8 ; W_pl,y 60,73 ; A_vz 6,31) légèrement différentes du poly (318 ; 60,7) → les deux jeux sont dans le JSON.

## 7. Métal – ELU (thème `metal-elu`)

- **Principe** (poly p.17) : $E_d \le R_d$ ou $E_d/R_d \le 1$ (taux de travail η) ; on vérifie la section la plus sollicitée.
- **Traction** (p.17–18 ; mémo p.4) : $N_{pl,Rd} = A f_y/\gamma_{M0}$ (section brute) ; au droit des trous $N_{u,Rd} = 0{,}9\,A_{net} f_u/\gamma_{M2}$ ; $A_{net} = b t - n\,d_0\,t$. Sections tendues : cornières, T, U, tubes (treillis, contreventements) ; ronds, plats, câbles (contreventements, liernes, tirants).
- **Compression simple** (p.19) : pièce massive (longueur < 6 × plus petite dimension), flambement négligé : $N_{pl,Rd} = A f_y/\gamma_{M0}$.
- **Flexion** (p.19 ; mémo p.2) : classe 1–2 $M_{pl,Rd} = W_{pl} f_y/\gamma_{M0}$ ; classe 3 $M_{el,Rd} = W_{el} f_y/\gamma_{M0}$.
- **Classification** (p.19–22) : voilement local = « flambement » d'une plaque comprimée ; 4 classes (1 la plus performante → 4 la plus fragile, non traitée). ε = √(235/f_y) (1,00 / 0,92 / 0,81 / 0,75 / 0,71). Âme fléchie : c/t ≤ 72ε (cl.1), 83ε (cl.2), 124ε (cl.3) ; âme comprimée 33ε / 38ε / 42ε. Semelle en console comprimée : 9ε / 10ε / 14ε. Tubes : d/t ≤ 50ε² / 70ε² / 90ε². **Classe du profilé = max(classe âme ; classe semelle)** (p.21).
- **Cisaillement** (p.23 ; mémo p.3) : $V_{pl,Rd} = A_{vz}(f_y/\sqrt3)/\gamma_{M0}$ ; A_vz dans le catalogue ou table 5.6 : I/H laminés // âme : A − 2b t_f + (t_w + 2r) t_f ≥ η(h − 2t_f)t_w, **η = 1,2** (≤ S460) ; U : A − 2b t_f + (t_w + r) t_f ; T : 0,9(A − b t_f) ; tube rect. A h/(b+h) ; tube circulaire 2A/π.
- **Interaction M-V** (p.23) : si **V_Ed ≤ 0,5 V_pl,Rd**, on ne réduit pas le moment résistant (cas courant).
- **M + N, flexion déviée** (p.24, table 5.7, classes 1–2) : n = N_Ed/N_pl,Rd ; I/H : a = (A − 2b t_f)/A ≤ 0,5 ; si n ≤ 0,25 et n ≤ 0,5a → M_N,y,Rd = M_pl,y,Rd, sinon M_pl,y,Rd(1 − n)/(1 − 0,5a) ; si n ≤ a → M_N,z,Rd = M_pl,z,Rd, sinon M_pl,z,Rd[1 − ((n − a)/(1 − a))²]. **Flexion biaxiale** : $(M_{y,Ed}/M_{N,y,Rd})^\alpha + (M_{z,Ed}/M_{N,z,Rd})^\beta \le 1$, **I/H : α = 2, β = 5n ≥ 1** (→ β = 1 si N = 0). Plats : α = β = 1,73 + 1,8n³ ; tubes rect. 1,66/(1 − 1,13n²) ≤ 6 ; tubes circulaires α = β = 2.
- **TD garage** (corrigé p.18–21) : IPE S235, combinaison 06 = 3,86 kN/ml ; L = 8 m → W_pl,y ≥ 131,4 cm³ → IPE 180 ; L = 4 m → IPE 100 (39,4 cm³), p_u = 3,94, M_Ed,y = 7,88, M_pl,Rd,y = 9,26 (83 %) ; M_Ed,z = 1,80, M_pl,Rd,z = 2,16 (86 %) ; a = 0,39 ; 0,72 + 0,83 = **1,55 > 1** → IPE 120 : 7,88/14,26 → 0,31 + 1,80/3,20 → 0,43 = **0,74** OK ; V_Ed = 7,92 kN ≤ V_pl,Rd = **85,61 kN**.
- **Tirant TD** (p.25–28) : 6,65 kN / sin 38,56° = 10,67 kN ; A ≥ 0,454 cm² ; rond D10 → 18,5 kN ; **L20×3 (A = 1,12)** → N_pl,Rd = 26,3 kN ; M8, d0 = 9 mm, un seul trou → A_net = 1,12 − 0,9 × 0,3 = 0,85 cm² → **N_u,Rd = 22,03 kN**.

## 8. Métal – ELS (thème `metal-els`)

- **Flèches** (poly p.13 ; mémo p.5) : w_c contre-flèche ; w1 sous charges permanentes ; w2 long terme sous permanentes ; w3 actions variables ; w_tot = w1 + w2 + w3 ; w_max = w_tot − w_c. $w = \frac{5pL^4}{384EI}$ (poutre isostatique, charge uniforme). w_max sous ELS caractéristique G + Q1 + Σψ0Qi ; w3 sous Q seules.
- **Limites (Annexe nationale)** (poly p.14 table 4.1 ; partiel p.2) — w_max / w3 : toitures en général (non accessibles, entretien seul) **L/200 / L/250** ; toitures avec personnel autre qu'entretien L/200 / L/300 ; planchers en général L/200 / L/300 ; planchers et toitures avec cloisons fragiles ou rigides L/250 / L/350 ; planchers supportant des poteaux L/400 / L/500 ; aspect du bâtiment w_max L/250.
- **Déplacements horizontaux** (poly p.14–15 table 4.2) : bâtiment industriel 1 niveau sans pont roulant, parois non fragiles : tête de poteau H/150, différentiel entre 2 portiques H/150 ; lisses L_i/150, montants H_i/150 ; autres 1 niveau : tête H_i/250, différentiel L_i/200 ; industriels multi-niveaux : H_i/200 par étage, H/200 (H ≤ 30 m), H_i/300 (> 30 m) ; autres multi-niveaux : H_i/300, H/300 (H ≤ 10 m), H/(200 + 10H) (10–30 m), H/500 (> 30 m).
- **TD garage IPE 120** (p.22–23) : w_max,z 13,8 mm ; w_max,y 36,7 mm > 20 mm → liernes à L/2 (÷ 16) ; w3 limite L/250 = 16 mm. ⚠️ Coquilles du corrigé : w3,z annoncé 9,9 mm (recalcul 7,8 mm), w3,y 1,1 mm (recalcul 0,11 mm), comparaison faite à 20 mm au lieu de 16 mm.

## 9. Métal – pieds de poteaux & mixte (thème `metal-pieds-mixte`)

- **Pieds de poteaux** (poly p.25) : liaison en général **articulée** (rarement encastrée). N_c (compression) → **platine / plaque d'appui** sur la fondation (répartit la compression sur le béton) ; V (tranchant) → frottement ou **bêche** (chute de profilé I/H soudée sous la platine, « quasiment obligatoire avec l'EC3 ») ; N_t (soulèvement) → **tiges d'ancrage** (scellement droit, courbe — r > 3φ, 1,5φ ≤ L2 ≤ 2φ —, plaque d'ancrage, sommier noyé).
- **Construction mixte** (NF EN 1994 ; poly p.27–28) : béton en compression, acier en traction et cisaillement ; adhérence → contraintes et flèches réduites ; **connecteurs** (goujons soudés, cornières soudées/clouées, butées). Éléments : **poteau mixte** (profilé enrobé ou tube rempli de béton), **dalle mixte / plancher collaborant** (béton sur bac acier nervuré, goujons ; armatures dans l'onde → coupe-feu jusqu'à 2 h), **poutre mixte** (dalle + profilé + connecteurs ; pont mixte sur la Moselle). **Avantages** : poids réduit à charge égale ; portées 12/15/20 m ; meilleure tenue au feu ; délais réduits ; ouvrages d'art 100–300 m économiques.

## 10. Bois – matériau & coefficients (thème `bois-coef`)

- Matériaux : BM (bois massif, C18…D30), LC/BLC (lamellé-collé GL20h…GL32h), LVL, CP, OSB, panneaux de particules (mémo p.7–8).
- **Classes de service** (mémo p.7) : **1** humidité < 13 % (local chauffé) ; **2** 13–20 % (couvert, non chauffé — ex. garage) ; **3** > 20 % (extérieur). Ne pas confondre avec les classes de risque biologique.
- **Classes de durée** (mémo p.7) : permanente > 10 ans (poids propre) ; long terme 6 mois–10 ans (stockage, équipements fixes) ; moyen terme 1 semaine–6 mois (**exploitation**, neige > 1000 m) ; court terme < 1 semaine (**neige < 1000 m**, neige exceptionnelle, charge d'entretien) ; instantanée (**vent**, actions accidentelles).
- **k_mod** BM/LC/LVL/CP (perm. / LT / MT / CT / inst.) : CS1 et CS2 **0,6 / 0,7 / 0,8 / 0,9 / 1,1** ; CS3 0,5 / 0,55 / 0,65 / 0,7 / 0,9. OSB2 (CS1) 0,3/0,45/0,65/0,85/1,1 ; OSB3-4 CS1 0,4/0,5/0,7/0,9/1,1 ; CS2 0,3/0,4/0,55/0,7/0,9. Particules 5&6 CS1 0,3/0,45/0,65/0,85/1,1 ; CS2 0,2/0,3/0,45/0,6/0,8 ; 7&8 CS1 0,4/0,5/0,7/0,9/1,1 ; CS2 0,3/0,4/0,55/0,7/0,9.
- **k_mod d'une combinaison = celui de l'action de plus courte durée** (corrigé TD p.30).
- **k_def** : CS1 0,6 ; CS2 0,8 ; CS3 2,0. **γ_M** : BM 1,30 ; LC 1,25 ; LVL/CP/OSB 1,20 ; assemblages 1,30 ; combinaisons accidentelles 1,00 (mémo p.7).
- **k_h** (mémo p.2) : BM si h < 150 mm : min((150/h)^0,2 ; 1,3) ; LC si h < 600 mm : min((600/h)^0,1 ; 1,1) ; LVL si h ≠ 300 : min((300/h)^0,12 ; 1,2) ; h = plus grande dimension de la section. **k_l** (traction, mémo p.4) : idem BM et LC ; LVL : min((3000/L)^0,06 ; 1,1). **k_cr** entre 0,67 et 1, « préférable de prendre 1 » (mémo p.3). **k_m** = 0,7 (rectangulaire BM/LC/LVL), 1 sinon.
- **Propriétés** (mémo p.8, N/mm² et kg/m³) : C18 f_m 18, f_t,0 10, f_c,0 18, f_v 3,4, E_0,mean 9000, E_0,05 6000, ρ_k 320, ρ_mean 380 ; C24 24 / 14,5 / 21 / 4,0 / 11 000 / 7400 / 350 / 420 ; C30 30 / 19 / 24 / 4,0 / 12 000 / 8000 / 380 / 460 ; D30 30 / 18 / 24 / 3,9 / 11 000 / 9200 / 530 / 640. GL20h…GL32h : f_m 20/22/24/26/28/30/32 ; f_t,0 16/17,6/19,2/20,8/22,4/24/25,6 ; f_c,0 = f_m ; f_v 3,5 ; E_0,mean 8400/10 500/11 500/12 100/12 600/13 600/14 200 ; E_0,05 7000/8800/9600/10 100/10 500/11 300/11 800 ; ρ_k 340/370/385/405/425/430/440 ; ρ_mean 370/410/420/445/460/480/490.
  ⚠️ C24 f_t,0,k = 14,5 MPa (le corrigé TD p.44 précise que « 14 MPa du poly » est une ancienne valeur).

## 11. Bois – ELU (thème `bois-elu`)

- **Flexion** (mémo p.2) : $\sigma_{m,y,d} \le f_{m,y,d} = f_{m,k}\,k_{mod}\,k_h/\gamma_M$ ; rectangle $\sigma_{m,d} = 6M/(bh^2)$, sinon vM/I.
- **Cisaillement** (mémo p.3) : $\tau_d = 3V/(2bh) \le f_{v,d} = f_{v,k}\,k_{mod}\,k_{cr}/\gamma_M$, k_cr = 1.
- **Traction //** (mémo p.4) : $\sigma_{t,0,d} = N/A \le f_{t,0,k}\,k_{mod}\,k_l/\gamma_M$. **Compression //** : $\sigma_{c,0,d} \le f_{c,0,k}\,k_{mod}/\gamma_M$ (flambement plus tard).
- **Flexion déviée** (corrigé TD p.34) : $\frac{\sigma_{m,y,d}}{f_{m,y,d}} + k_m\frac{\sigma_{m,z,d}}{f_{m,z,d}} \le 1$ et $k_m\frac{\sigma_{m,y,d}}{f_{m,y,d}} + \frac{\sigma_{m,z,d}}{f_{m,z,d}} \le 1$.
- **Combinaison dimensionnante** (corrigé TD p.30) : on divise chaque charge ELU par son k_mod ; la plus grande est dimensionnante. TD garage : 1,35G 1,57/0,6 = 2,61 ; **1,35G + 1,5Sn 3,41/0,9 = 3,78** ; 1,35G + 1,5W+ 2,50/1,1 ; 1,35G + 1,5Sn + 0,9W+ 3,97/1,1 = 3,61 ; 1,35G + 1,5W+ + 0,75Sn 3,42/1,1 = 3,11.
- **Partiel 2023** (GL24h 100 × 250, La Rochelle, intérieur maison → CS1 ; G + Q cat. A → moyen terme k_mod = 0,8 ; γ_M = 1,25 ; k_h = (600/250)^0,1 = 1,09) : f_m,d = 24 × 0,8 × 1,09/1,25 = **16,75 MPa** ; σ = 6 × 11,88·10⁶/(100 × 250²) = **11,40 MPa → 68 %** ; τ = 3 × 8640/(2 × 100 × 250) = **0,52 MPa**, f_v,d = 3,5 × 0,8/1,25 = **2,24 MPa → 23 %**. (Le M_Ed = 11,88 kN·m de l'énoncé inclut le poids propre : p = 3,142 kN/m = 1,35 × (1,15 × 0,6 + 0,105) + 1,5 × 2,3 × 0,6 avec ρ_mean 420 kg/m³.)
- **TD garage panne GL24h 120 × 280, L = 8 m** (p.31–35) : 3,48 kN/ml (z) ; f_m,d = 24 × 0,9 × 1,08/1,25 = **18,65 MPa** ; M_y = 27,84 → σ = 17,75 (95 %) ; M_z = 7,44 → σ = 11,07 (60 %) ; flexion déviée 137 % / 126 % → 2 pannes de 4 m (σ_y 4,44 → 24 %, σ_z 2,77 → 15 % ; le corrigé inverse les deux) ; τ = 0,32 / 2,52 MPa = 13 %.
- **Tirant bois TD** (p.43–44) : C24 70 × 105, k_l = (150/105)^0,2 = 1,074, vent → k_mod 1,1, γ_M 1,3 → f_t,0,d = **13,18 MPa** ; 2 boulons Ø12 → σ = 1,68 MPa (13 %).

## 12. Bois – ELS (thème `bois-els`)

- (mémo p.6) $U_{inst,G} = \frac{5gl^4}{384EI}$ ; $U_{inst,Q} = \frac{5q_1l^4}{384EI} + \sum\psi_0\frac{5q_il^4}{384EI}$ ; $U_{fin,G} = (1 + k_{def})U_{inst,G}$ ; $U_{fin,Q} = (1 + \psi_2k_{def})\frac{5q_1l^4}{384EI} + \sum(\psi_0 + \psi_2k_{def})\frac{5q_il^4}{384EI}$.
- Vérifications : $W_{inst}(Q) \ge U_{inst,Q}$ ; $W_{fin} \ge U_{fin,G} + U_{fin,Q}$ ; $W_{net,fin} \ge U_{fin,G} + U_{fin,Q} - W_c$ ; (W2 ≥ U_fin,G + U_fin,Q − U_inst,G).
- **Critères « selon Calvi »** (mémo p.6) : bâtiment courant — éléments structuraux : W_inst(Q) **l/300**, W_net,fin **l/200**, W_fin **l/125** ; chevrons : W_net,fin l/150, W_fin l/125. Bâtiment agricole — éléments structuraux : l/200 ; l/150 ; l/100 ; chevrons : l/150, l/100.
- E utilisé : E_0,mean (GL24h 11 500 MPa).
- **Partiel 2023 recalculé** (U = 5ql⁴/384EI, I = 100 × 250³/12 = 1,302·10⁸ mm⁴, l = 5500 mm → 7,96 mm par kN/m) : q = 2,3 × 0,6 = 1,38 kN/m → **U_inst,Q = 10,98 mm ≤ l/300 = 18,33 mm (60 %)** ; g = 1,15 × 0,6 + PP 0,105 = 0,795 kN/m → U_inst,G = 6,33 mm ; CS1 k_def = 0,6 ; ψ2 = 0,3 → U_fin,G = 10,13 ; U_fin,Q = 1,18 × 10,98 = 12,96 → **W_fin = W_net,fin = 23,1 mm** ≤ l/125 = 44 mm (52 %) et ≤ l/200 = 27,5 mm (**84 %**). (Sans poids propre : 21,7 mm, 79 %.)
- **TD garage** (p.36–40) : inst. S + 0,6W+ → √(2,059² + 2,286²) = 3,07 mm ≤ 13,33 mm (23 %) ; fin : CS2 k_def = 0,8, ψ2 neige/vent = 0 → « 1,80 G » ; 1,80G + S + 0,6W+ → √(5,04² + 6,642²) = 8,34 mm ≤ l/200 = 20 mm (42 %). W_c = 0 → W_fin = W_net,fin (net,fin plus défavorable).

## 13. BA – matériaux (TD1, thème `ba-materiaux`)

- $f_{cd} = \alpha_{cc}f_{ck}/\gamma_c$, α_cc = 1, γ_c = 1,5 ; $f_{cm} = f_{ck} + 8$ ; $f_{ctm} = 0{,}30 f_{ck}^{2/3}$ (≤ C50/60) ; $f_{ctk,0,05} = 0{,}7 f_{ctm}$ ; $f_{ctk,0,95} = 1{,}3 f_{ctm}$ ; $f_{ctm,fl} = \max((1{,}6 - h/1000)f_{ctm} ; f_{ctm})$ ; $E_{cm} = 22\,000(f_{cm}/10)^{0,3}$ MPa (module sécant, entre 0 et 0,4 f_cm) ; $E_{c,eff} = E_{cm}/(1 + \varphi)$, φ = 2 (module différé) ; $\beta_{cc}(t) = \exp[s(1 - (28/t)^{1/2})]$, s = 0,25 (CEM 42,5N) ; f_cm(t) = β_cc(t) f_cm ; f_ck(t) = f_cm(t) − 8 (valable de 3 à 28 j).
- Acier : $f_{yd} = f_{yk}/1{,}15$ (B500 → 435 MPa ; B400 → 348 MPa) ; E_s = 200 000 MPa ; ε_uk classe A (peu ductile, écroui à froid) 2,5 %, classe B (ductile, laminé à chaud) 5 % ; $\varepsilon_{yd} = f_{yd}/E_s$ = 2,17 ‰ (B500) — le corrigé écrit f_yk/E_s = 2,5 ‰.
- Diagramme parabole-rectangle : ε_c2 = 2 ‰ (contrainte max), ε_cu2 = 3,5 ‰ (ultime). Rectangle simplifié (f_ck ≤ 50) : λ = 0,8, η = 1 → $F_c = 0{,}8\,x_u\,b\,f_{cd}$.
- Limites ELS : σ_c ≤ 0,6 f_ck sous combinaison caractéristique en XD, XF, XS (C35 → 21 MPa) ; fluage linéaire si σ_c ≤ 0,45 f_ck sous quasi-permanente (C25 → 11,25 MPa).
- **Corrigé TD1** : f_cd = 16,6 → **f_ck = 24,9 ≈ 25 MPa → C25/30** (⚠️ le corrigé affiche « C20 » : erreur) ; f_cm 32,9 ; f_ctm 2,56 ; f_ctk,0,05 1,79 ; f_ctk,0,95 3,33 ; f_ctm,fl (h = 700) = max(2,30 ; 2,56) = 2,56 ; E_cm 31 447 ; E_c,eff 10 482 MPa. C35 : β_cc = 0,504 (2 j), 0,845 (10 j), 0,955 (20 j) ; f_cm(t) 21,67 / 36,34 / 41,07 ; f_ck(t) — / 28,34 / 33,07 MPa. f_cm = 38 → f_ck 30, f_cd 20 MPa. f_yd 348 → f_yk 400. Q14 (C20, b = 18 cm, x_u = 10 cm) : F_c = 0,8 × 0,10 × 0,18 × 13,33 = **0,192 MN** → A_s = 0,192/435 = **4,42 cm²** → 3HA14 (⚠️ le corrigé affiche aussi 0,29 MN / 6,62 cm² calculés avec f_cd = 20 MPa par erreur).
- **Tableau des sections d'armatures** (TD1 p.3) — cm², n = 1…10 : voir notes brutes ; φ6 0,28 … φ40 12,57 par barre (section = nπφ²/4).
- **Conversions** (TD1 p.3) : 100 000 N/m² = 100 kN/m² = 0,1 MPa = 0,1 N/mm² = 1 bar = 0,1 MN/m² = 10⁻⁷ MN/mm² ; 1 MN·m = 1000 kN·m = 10⁹ N·mm = 1000 MN·mm = 10⁵ daN·m = 10⁶ kN·mm.

## 14. BA – enrobages & dispositions (TD2, thème `ba-enrobage`)

- $c_{nom} = c_{min} + \Delta c_{dev}$, **Δc_dev = 10 mm** ; $c_{min} = \max(c_{min,b} ; c_{min,dur} ; 10\text{ mm})$ ; c_min,b = φ de la barre (barre isolée, d_g ≤ 32 mm).
- **c_min,dur** (tableau 4.4N, classe structurale de référence **S4** pour 50 ans) — X0 / XC1 / XC2-XC3 / XC4 / XD1-XS1 / XD2-XS2 / XD3-XS3 : S1 10 10 10 15 20 25 30 ; S2 10 10 15 20 25 30 35 ; S3 10 10 20 25 30 35 40 ; **S4 10 15 25 30 35 40 45** ; S5 15 20 30 35 40 45 50 ; S6 20 25 35 40 45 50 55. Modulations (tableau 4.3NF) : **+2 classes pour 100 ans** ; **−1 si béton de résistance élevée** (corrigés : C30 en XC3 → −1 ; C35 en XC1 → −1 ; C45 en XD3 → −1 ; C25 en XC1 → pas de réduction ; C30 en XD1 → pas de réduction) ; −1 enrobage compact (non utilisé).
- **Classes d'exposition** : X0 aucun risque ; XC1 sec ou humide en permanence (intérieur sec) ; XC2 humide, rarement sec ; XC3 humidité modérée (intérieur humidité modérée, extérieur abrité) ; XC4 alternance humide/sec ; XD1 humidité modérée + chlorures (hors eau de mer) ; XD2 humide, rarement sec + chlorures ; **XD3 alternance humide/sec + chlorures (ponts, parkings)** ; XS (eau de mer) ; XF (gel). (EC2 standard + corrigé TD2.)
- **Espacements** : $e_h \ge \max(20\text{ mm} ; \varphi_L ; d_g + 5\text{ mm})$ ; e_v idem ; paquets de 2–3 barres possibles.
- Hauteur utile $d = h - c_{nom} - \varphi_t - \varphi_L/2$ (1 lit) ; enrobage nominal = distance à la première armature rencontrée (le cadre) ; cales de 5 en 5 mm.
- **Corrigé TD2** : Ex1 pont XD3, C45, 100 ans → S4 + 2 − 1 = S5 → c_min,dur = 50 → c_nom = 60 mm (longi et cadres). Ex2 XC3, C30 → S3 → 20 → c_nom 30 ; e_h 53,3 mm OK ; d = 358 mm. Ex3 XC1, C35 → S3 → longi HA20 : c_min = 20, c_nom 30 ; cadres HA6 c_nom 20 → il faut 30 − 6 = 24 mm sous cadres → cale 25 mm ; **e_h = 19 mm < 20 mm → problème** ; d = 339 mm ; variantes 2HA25 9,82 ; 3HA16+3HA14 10,65 ; 3HA16+3HA12 9,42 (c_nom 26, e_h réel 30 mm, d 338). Ex4 ≥ 6 cm² : 4HA14 6,16 ; 6HA12 6,78 ; 2HA16+2HA14 7,1 ; 2HA20 6,28. Ex5 XD1, C30, 20 × 45 : c_min,dur 35 → c_nom 45 ; 2HA20+1HA14 (⚠️ « 9,36 » dans le corrigé, réel 7,82 cm²) e_h 12 NON ; 3HA12+3HA14 8,01 e_h 18 NON ; 4HA12+4HA10 7,67 e_h 10 NON ; **4HA16 8,04, e_h 46 OK, d 385**.

## 15. BA – adhérence & ancrages (TD3, thème `ba-ancrage`)

- $f_{bd} = 2{,}25\,\eta_1\eta_2\,f_{ctd}$ ; $f_{ctd} = \alpha_{ct}f_{ctk,0,05}/\gamma_c$ (α_ct = 1, γ_c = 1,5) ; η1 = 1 bonnes conditions, **0,7 conditions médiocres** (barres en partie supérieure d'éléments de h > 250 mm) ; η2 = 1 si φ ≤ 32 mm.
- $l_{b,rqd} = \frac{\varphi}{4}\frac{\sigma_{sd}}{f_{bd}}$ (σ_sd = f_yd) ; $l_{bd} = \alpha_1\ldots\alpha_5\,l_{b,rqd} \ge l_{b,min}$, l_b,min = max(0,3 l_b,rqd ; 10φ ; 100 mm) (barres tendues).
- **Corrigé TD3** : a) dalle C25, HA500, φ8 inférieur : f_ctm 2,56, f_ctk 1,80, f_ctd 1,20, **f_bd 2,69 MPa, l_b,rqd 323 mm**. b) poutre C30, HA400, φ16 inférieur : f_ctd 1,35, **f_bd 3,04, l_b,rqd 457 mm**, l_b,min 160 mm, l_bd = 457 mm (α_i = 1). c) poutre h 450, C25, HA400, φ14 **supérieur** (η1 = 0,7) : **f_bd 1,89, l_b,rqd 646 mm**.
- Ex2 (B500, bonnes conditions) : f_bd C20 2,32 ; C25 2,69 ; C30 3,04 ; C35 3,37 MPa → **l_b,rqd ≈ 46,8φ (C20) ; 40,4φ (C25) ; 35,7φ (C30) ; 32,2φ (C35)** ; formule simple l_b,rqd ≈ 103,5 φ/f_ctm ≈ 345 φ f_ck^(−2/3).
- Ex3 ancrage courbe 135° (C25, B500, XC1, HA12, cadres HA6) : f_bd 2,69 ; l_b,rqd 484 mm ; c_min,dur 15 ; c_nom 25 mm ; mandrin φ_m,min = 4φ (φ ≤ 16) ou 7φ (φ > 16) → 48 mm → mandrin réel 50 mm (série de Renard 16, 20, 25, 32, 40, 50, 63…) ; longueur développée l_bd = L1 + L2 + L3, L3 ≥ 5φ ; L2 = (φ_m + φ)/2 × θ (arc) ; L1 = a − c_nom − φ_t − φ_m/2 (corrigé : L1 188, L2 58,9, L3 237,4 mm ; l_b,min 145 mm).

## 16. BA – compression / poteaux / flambement (TD4, thème `ba-poteaux`)

- **Longueur de flambement** (corrigé TD4 Q2, poteau contreventé) : $l_0 = 0{,}5\,l\sqrt{\left(1 + \frac{k_1}{0{,}45 + k_1}\right)\left(1 + \frac{k_2}{0{,}45 + k_2}\right)}$, k = raideur du poteau / raideur des poutres (inertie fissurée I/1,5) ; 0,5 l ≤ l_0 ≤ l. Élancement $\lambda = l_0/i$, $i = \sqrt{I/A_c}$ (= h/√12 pour un rectangle, h dans le plan de flambement). P1 (20 × 22) : autour de X l_0 = 1,75 m, i = 6,35 cm, λ = 27,6 ; autour de Y l_0 = 2,04 m, i = 5,77 cm, **λ = 35,3** → flambement dans le plan 0XZ (le sujet impose λ = 36).
- **Méthode simplifiée (règles professionnelles / Thonier)** (corrigé TD4 Q3) : $N_{Rd} = \alpha\,k_h\,k_s\,[b h f_{cd} + A_s f_{yd}]$ ; $\alpha = \frac{0{,}86}{1 + (\lambda/62)^2}$ si λ ≤ 60 ; $(32/\lambda)^{1,3}$ si 60 < λ ≤ 120 ; $k_h = (0{,}75 + 0{,}5h)(1 - 6\rho\delta)$ si h < 0,50 m (sinon 1), ρ = A_s/(bh), δ = d'/h ; $k_s = 1{,}6 - 0{,}6 f_{yk}/500$ si f_yk > 500 et λ > 40, sinon 1. (Valeurs « EC2 AN / règles pro », non présentes dans le cours fourni.)
- **Dispositions** : φ_L ≥ 8 mm (HA8 minimum) ; $A_{s,min} = \max(0{,}10 N_{Ed}/f_{yd} ; 0{,}002 A_c)$ ; A_s,max = 4 % A_c (hors recouvrement) ; ρ « entre 2 et 3 % si acier de résistance » (remarque du corrigé) ; $s_{cl,t,max} = \min(20\varphi_{L,min} ; b ; 400\text{ mm})$, × 0,6 en zone de recouvrement ; recouvrement l_r ≈ 0,7 l_b,rqd (corrigé : 0,7 × 451 = 316 mm pour HA14 en C35).
- **Corrigé TD4 Q3** (C35, B500, XC1, b = 0,22, h = 0,20, φ_L 14, φ_t 6) : c_nom = 20 mm sous cadres → **d' = 20 + 6 + 7 = 33 mm, δ = 0,165**. k_h ≈ 0,8075 (approché). P2 (λ 34, N_Ed 420 kN) : α = 0,661 ; A_s < 0 → pas d'acier de résistance ; A_s,min = max(0,966 ; 0,88) = 0,966 cm² → **4HA8** (2,01 cm²) ; s_cl,t,max = min(160 ; 200 ; 400) = 160 mm. P1 (λ 36, 750 kN) : α = 0,643 ; A_s ≈ 8,6 cm² (9,6 avec k_h approché) → **6HA14 = 9,24 cm²**, ρ 2,1 % ; s_cl,t,max = 200 mm. P0 (λ 42, 1085 kN) : α = 0,589 ; A_s ≈ 28,8–29,8 cm², ρ = 6,8 % → **section de béton insuffisante** (4HA32 = 32,17 cm² hors règles).

## 17. BA – flexion simple (TD5, TD6, thème `ba-flexion`)

- Section rectangulaire, rectangle simplifié : $\mu_{cu} = \frac{M_u}{b d^2 f_{cd}}$ ; $\alpha_{yd} = \frac{3{,}5}{3{,}5 + 1000\varepsilon_{yd}}$ ; $\mu_{cu,yd} = 0{,}8\,\alpha_{yd}(1 - 0{,}4\alpha_{yd})$ (B500 : **0,372**) ; si μ_cu ≤ μ_cu,yd → pas d'aciers comprimés, σ_s = f_yd ; $\alpha_u = 1{,}25(1 - \sqrt{1 - 2\mu_{cu}})$ ; $z = d(1 - 0{,}4\alpha_u)$ ; $\beta = z/d = (1 + \sqrt{1 - 2\mu_{cu}})/2$ ; $A_s = \frac{M_u}{\beta d f_{yd}}$. (Formules EC2 standard, cohérentes avec les valeurs du corrigé TD5.)
- **Section minimale** (non-fragilité) $A_{s,min} = \max(0{,}26\frac{f_{ctm}}{f_{yk}}bd ; 0{,}0013\,bd)$ ; $A_{s,max} = 0{,}04 A_c$.
- **Corrigé TD5 Q1 (PT3)** : M_u = 150 kN·m, b 0,20, h 0,45, d 0,40, C25, B500 : f_cd 16,67 ; **μ_cu = 0,281 < μ_cu,yd = 0,372** → pas d'aciers comprimés ; **β = 0,831** ; **A_s = 10,38 cm²** ; A_CNF 1,07 cm² ; A_%mini 1,04 cm² ; A_max 36 cm². 3HA16 + 3HA14 = 10,6 cm² OK. Enrobage XC1 C25 → S4 → c_min,dur 15 ; longi HA16 c_nom 26 ; cadres c_nom 25 → **c_nom = 25 mm** ; **e_h = 35 mm** ≥ max(20 ; 16 ; 20) OK ; d_réel = 450 − 25 − 6 − 16 = **403 mm** ≥ 400 OK.
- TD5 autres questions (sans corrigé fourni) : PT3 Q2 M_u 175, C30, B400 ; PT5 M_u 432, d 0,45, C35 ; sections en Té ; PT2 Té M_u 240 ; PT3 Q7 C50, g 21,24, q 10,75, M_u 377 kN·m.
- **TD6** (sans corrigé fourni) : poutre bureaux 20 × 40, d = 0,35, C25/30, B500B, XC1, M_u = 190 kN·m ; espacements de cadres selon la **suite de Caquot** 8-9-10-11-13-16-20-25-35-40 (×2, en commençant par un demi-espacement).

---

## 18. Partiel 2023 (sujet fixe)

**Métal** (p.1–2) : panne de toiture de bâtiment industriel, IPE S235 classe 1, catalogue IPE 80–180 fourni ; G + Q = 2,1 kN/ml (ELS), 1,35G + 1,5Q = 3,1 kN/ml (ELU), L = 5,50 m isostatique.
1. Chargement pour la flèche → **ELS**.
2. M_Ed = 11,6 kN·m : W_pl,y ≥ 11,6·10⁶/235 = 49 362 mm³ = **49,4 cm³** → **IPE 120** (60,73) ; M_pl,Rd = 60,73·10³ × 235 = **14,27 kN·m** ; η = 81 %.
3. V_Ed = 8,4 kN : V_pl,Rd = 631 × 235/√3 = **85,6 kN** ; η = 10 % ; V_Ed ≤ 0,5 V_pl,Rd.
4. Flèches (G = 0,7 ; Q = 1,4 kN/ml ; E = 210 000 ; **I_y = 1200 cm⁴ imposé**) : w_max(G + Q = 2,1) = **9,93 mm ≤ L/200 = 27,5 mm** ; w3(Q = 1,4) = **6,62 mm ≤ L/250 = 22 mm**.
   ⚠️ **Incohérence de l'énoncé** : aucun IPE du catalogue n'a I_y = 1200 cm⁴ (IPE 120 : 317,8). Avec 317,8 cm⁴ : w_max = 37,5 mm > 27,5 et w3 = 25,0 mm > 22 → **ne passe pas** ; IPE 140 (541,2 cm⁴) : w_max = 22,0 mm ≤ 27,5 ✓, w3 = 14,7 mm ≤ 22 ✓ → **c'est l'IPE 140 qui suffit** (⚠️ le prompt indique IPE 160 : inexact, l'IPE 160 marche aussi mais n'est pas le plus petit).

**Bois** (p.3) : voir §11 et §12 (moment 5 pts, tranchant 5 pts, flèches 6 pts).

## 19. QCM neige et vent A (sujet fixe, barème +2 / −1 / 0)

| # | Question | Réponse |
|---|---|---|
| 1 | Cocher la réponse A | **A** |
| 2 | La charge de neige dépend de l'altitude | **A Vrai** |
| 3 | s_k correspond à une charge… | **C au sol** |
| 4 | Les μ_i s'appellent… | **B coefficients de forme** |
| 5 | Face qui reçoit le vent | **B face au vent** |
| 6 | Effet du vent principalement | **C surfacique** |
| 7 | Direction de l'action sur une paroi | **A normale** |
| 8 | Le vent engendre en réalité des efforts | **A dynamiques** |
| 9 | v_b,0 est fonction… | **C du lieu de l'ouvrage** |
| 10 | c_pe et c_pi tous deux positifs lorsque… | **B la paroi subit une pression sur ses deux faces** |
| 10 bis | Zone F, θ = 0°, 34°, 20 m² : C_pe ? | **−0,37 et +0,7** (corrigé : −0,13, erreur d'angle) |

> Remarque : dans le sujet, la convention de signe correcte est « pression = vers la paroi » ; c_pi > 0 = surpression intérieure qui pousse vers l'extérieur, d'où la réponse B (pression sur les deux faces).

## 20. Errata relevés dans les documents (à expliquer dans les questions)

1. **QCM A** : interpolation à 41° au lieu de 34° → C_pe = −0,37 (pas −0,13).
2. **Cours p.39** : « 0,8 × 1 = 0,36 kN/m² » → 0,8 kN/m².
3. **Cours p.47/58** : ρ = 1,25 puis 1,225 ; q_b La Rochelle 0,422 (ρ = 1,25) vs 0,414 (ρ = 1,225).
4. **Poly p.12** : combinaison accidentelle « + 1,50 Σψ0,i Qk,i » → + Σψ2,i Qk,i.
5. **Partiel 2023** : I_y = 1200 cm⁴ incohérent avec le catalogue ; IPE 120 non vérifié en flèche avec ses vraies caractéristiques ; IPE 140 suffit.
6. **Corrigé TD garage** : W− = « −0,52 » × 2,588 (−0,45 retenu) ; lignes M_N,Rd de l'IPE 120 recopiées de l'IPE 100 ; w3 surestimé et comparé à L/200 au lieu de L/250 ; σ_y/σ_z inversés pour les pannes de 4 m ; tirant bois divisé par 13,3 au lieu de 13,18.
7. **Corrigé TD1** : f_ck = 24,9 MPa classé « C20 » → C25/30 ; Q14 0,29 MN calculé avec f_cd du C30 → 0,19 MN ; ε_yd = f_yk/E_s au lieu de f_yd/E_s.
8. **Corrigé TD2** : 2HA20 + 1HA14 = 7,82 cm² (pas 9,36).
9. **Espacements e_h des corrigés TD2 Ex3 (19 mm) et TD5 (35 mm)** : la formule $e_h = (b - 2c_{nom} - 2\varphi_t - n\varphi_L)/(n-1)$ donne 29 mm et 45 mm. Les corrigés semblent retirer 20 mm de plus (méthode non expliquée). L'appli utilise la formule et signale l'écart ; les conclusions (TD2 Ex3 « trop juste », TD5 « OK ») restent à confirmer avec l'enseignant.

## 21. Écarts avec les valeurs du prompt initial (vérifiés sur les documents)

- Toutes les valeurs de s_k, s_Ad, Δs, μ1, C_e, v_b,0, ψ, γ_M, k_mod, k_def, GL24h, BA TD1–TD5 citées dans le prompt **sont confirmées** par les documents.
- QCM : le prompt reprend −0,13 du corrigé → faux (−0,37).
- Partiel métal : le prompt annonce « il faudrait un IPE 160 » → l'IPE 140 suffit.
- Partiel bois flèches (à refaire) : U_inst,Q = 10,98 mm (60 %), W_net,fin = 23,1 mm (84 %).
- Le prompt mentionne un tableau du mémo « p.7 » pour k_mod (✓) et « p.8 » pour GL (✓).
