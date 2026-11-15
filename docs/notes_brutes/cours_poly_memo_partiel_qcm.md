# Notes brutes de lecture (à fusionner dans NOTES_STAB1.md)

## Partiel_2023_STAB01.pdf (3 p.)
- p.1 Métal : panne de toiture bâtiment industriel, IPE S235 classe 1, catalogue IPE 80–180 (S, Iy, Wely, Wply, iy, Iz, Welz, Wplz, Avz). Charges ELS G+Q = 2,1 kN/ml ; ELU 1,35G+1,5Q = 3,1 kN/ml ; L = 5,50 m, isostatique (A articulé, B appui simple).
  Q1 « Quel chargement pour la flèche ? » cases ELS/ELU. Q2 M_Ed = 11,6 kN·m → vérifier. Q3 V_Ed = 8,4 kN → vérifier.
- p.2 flèche : w = 5pL⁴/(384 E Iy), « F » (sic, = p) G = 0,7 kN/ml, Q = 1,4 kN/ml, E = 210 000 MPa, Iy = 1200 cm⁴ (imposé). Tableau flèches limites (toitures en général L/200 – L/250 …, note a).
  ⚠ Incohérence : aucun IPE du catalogue n'a Iy = 1200 cm⁴ (IPE 120 = 317,8 ; IPE 180 = 1317).
  ⚠ Le profilé n'est pas imposé : il faut le choisir (W_pl,y ≥ M_Ed γM0 / fy).
- p.3 Bois : solive GL24h 100×250, La Rochelle alt. 20 m, intérieur maison, entraxe 600 mm, portée 5,5 m, G = 1,15 kN/m² (hors PP), Q = 2,3 kN/m² cat. A, pas de contreflèche. M_Ed = 11,88 kN·m (5 pts), V_Ed = 8,64 kN (5 pts), flèches selon mémo (6 pts), U = 5QL⁴/(384EIy).
  Vérif : ELU = 1,35×1,15×0,6 + 1,5×2,3×0,6 = 0,9315 + 2,07 = 3,0015 kN/m ; M = 3,0015×5,5²/8 = 11,35 ≠ 11,88 ; avec PP ? 11,88×8/5,5² = 3,142 kN/m ; V = 8,64 → p = 3,142. Différence = 0,14 kN/m = 1,35×PP → PP ≈ 0,104 kN/m (0,1×0,25×4,2 kN/m³ = 0,105 → ρ_mean 420 kg/m³ GL24h). ✓ Le sujet inclut donc le poids propre (ρ_mean = 420 kg/m³).

## QCM_neige_et_vent_A_corrigé.pdf (2 p.) — barème +2 / −1 / 0
Réponses (surlignées) :
1. « Cocher la réponse A » → A
2. Neige dépend de l'altitude → A Vrai
3. s_k correspond à une charge → C au sol
4. Coefficients μi → B coefficients de forme
5. Face qui reçoit le vent → B face au vent
6. Effet du vent principalement → C surfacique
7. Direction de l'action → A normale
8. Efforts réels → A dynamiques
9. v_b,0 fonction de → C du lieu de l'ouvrage
10. cpe et cpi positifs tous deux lorsque → B la paroi subit une pression sur ses deux faces
10 bis (numérotée 10 aussi, p.2) : 20 m², zone F, θ = 0°, toiture 1 versant 34° → tableau Cpe 1 versant (5°,15°,30°,45°,60°,75° × F,G,H × Cpe,10/Cpe,1 × θ=0°/180°).
   Tableau θ = 0° (Cpe,10 / Cpe,1) :
   5° : F −1,7/−2,5 et −0,0/−0,0 ; G −1,2/−2,0 et −0,0 ; H −0,6/−1,2 et −0,0
   15° : F −0,9/−2,0 et +0,2/+0,2 ; G −0,8/−1,5 et +0,2 ; H −0,3/−0,3 et +0,2
   30° : F −0,5/−1,5 et +0,7/+0,7 ; G −0,5/−1,5 et +0,7 ; H −0,2/−0,2 et +0,4/+0,4
   45° : F −0,0/−0,0 et +0,7/+0,7 ; G −0,0 et +0,7 ; H −0,0 et +0,6
   60° : F +0,7/+0,7 ; G +0,7 ; H +0,7      75° : F +0,8 ; G +0,8 ; H +0,8
   θ = 180° : 5° F −2,3/−2,5 G −1,3/−2,0 H −0,8/−1,2 ; 15° F −2,5/−2,8 G −1,3/−2,0 H −0,9/−1,2 ; 30° F −1,1/−2,3 G −0,8/−1,5 H −0,8/−0,8 ; 45° F −0,6/−1,3 G −0,5/−0,5 H −0,7/−0,7 ; 60° F −0,5/−1,0 G −0,5/−0,5 H −0,5/−0,5 ; 75° idem 60°.
   Corrigé : (X − (−0,5))/(41 − 30) = (0,0 − (−0,5))/(45 − 30) → X = −0,13 ; Cpe = −0,13 et +0,7.
   ⚠⚠ ERREUR DU CORRIGÉ : l'angle est 34°, pas 41°. (X+0,5)/(34−30) = 0,5/15 → X = −0,5 + 0,133 = **−0,37**. (−0,13 correspondrait à 41°.) Surface 20 m² ≥ 10 m² → Cpe,10. Bonne réponse : Cpe = −0,37 et +0,7.

## MEMO_STAB_BM_EC3_EC5_2022.pdf (8 p., Blanchard – Masson 2022)
- p.1 Nuances acier EN 10025-2 : t ≤ 40 mm : S235 fy 235 fu 360 ; S275 275/430 ; S355 355/490 ; S450 440/550. 40<t≤80 : 215/360 ; 255/410 ; 335/470 ; 410/550. Nomenclature EC5 σ_m,y,d, f_m,y,k, d/k ; axes x (fil), y, z, Mx My Mz, Vy Vz, Nt Nc.
- p.2 EC3 flexion : classe 1-2 M_Ed ≤ M_pl,Rd = W_pl,y fy/γM0 ; classe 3 M_el,Rd = W_el,y fy/γM0. EC5 : σ_m,y,d ≤ f_m,y,k kmod kh/γm ; kh BM h<150 : min((150/h)^0,2 ; 1,3) ; LC h<600 : min((600/h)^0,1 ; 1,1) ; LVL h≠300 : min((300/h)^0,12 ; 1,2) ; h = plus grande dimension. Rectangle σ = 6M/(bh²) sinon vM/I.
- p.3 EC3 V_Ed ≤ V_pl,Rd = Avz (fy/√3)/γM0 ; γM0 = 1,00 (France bâtiments). EC5 τ_d ≤ f_v,k kmod kcr/γm ; kcr entre 0,67 et 1, « préférable de prendre 1 » ; τ_d = 3V/(2bh).
- p.4 EC3 N_pl,Rd = A fy/γM0 ; au voisinage des trous N_u,Rd = 0,9 A_net fu/γM2, γM2 = 1,25. EC5 traction // : σ_t,0,d ≤ f_t,0,k kmod kl/γm ; kl idem kh pour BM/LC, LVL : min((3000/L)^0,06 ; 1,1). Compression // : σ_c,0,d ≤ f_c,0,k kmod/γm (+ flambement plus tard).
- p.5 ELS EC3 : wc contre-flèche, w1 perm., w2 long terme perm., w3 variables, wtot = w1+w2+w3, wmax = wtot − wc. w3 = 5ql⁴/384EI ; wmax = 5(g+q1)l⁴/384EI + Σψ0 5qil⁴/384EI. Tableau flèches limites (identique au partiel).
- p.6 ELS EC5 : U_inst,G ; U_inst,Q = 5q1l⁴/384EI + Σψ0(…) ; U_fin,G = (1+kdef)(5gl⁴/384EI) ; U_fin,Q = (1+ψ2 kdef)(5q1l⁴/384EI) + Σ(ψ0+ψ2 kdef)(…). 4 vérifs : W_inst,Q ≥ U_inst,Q ; W_fin ≥ U_fin,G+U_fin,Q ; W_net,fin ≥ U_fin,G+U_fin,Q − Wc ; W2 ≥ U_fin,G+U_fin,Q − U_inst,G.
  Critères « selon Calvi » : bâtiment courant — chevrons : W_net,fin l/150, W_fin l/125 ; éléments structuraux : W_inst(Q) l/300, W_net,fin l/200, W_fin l/125. Agricole : chevrons l/150, l/100 ; éléments structuraux l/200, l/150, l/100.
- p.7 Coefficients EC5 : classes de service (<13 % chauffé =1 ; 13–20 % couvert =2 ; >20 % =3 ; ne pas confondre avec risque biologique). Classes de durée : permanente >10 ans poids propre ; long terme 6 mois–10 ans stockage, équipements fixes ; moyen terme 1 sem–6 mois exploitation, neige > 1000 m ; court terme < 1 sem neige < 1000 m, neige exceptionnelle, charge d'entretien ; instantanée vent, actions accidentelles.
  kmod BM/LC/LVL/CP : CS1 & CS2 0,6/0,7/0,8/0,9/1,1 ; CS3 0,5/0,55/0,65/0,7/0,9. OSB : 1 OSB2 0,3/0,45/0,65/0,85/1,1 ; 1 OSB3+ 0,4/0,5/0,7/0,9/1,1 ; 2 OSB3+ 0,3/0,4/0,55/0,7/0,9. Panneaux de particules EN 312 : 1 part 5&6 0,3/0,45/0,65/0,85/1,1 ; 2 part 5&6 0,2/0,3/0,45/0,6/0,8 ; 1 part 7&8 0,4/0,5/0,7/0,9/1,1 ; 2 part 7&8 0,3/0,4/0,55/0,7/0,9.
  kdef CS1 0,6 ; CS2 0,8 ; CS3 2,0. γm : BM / panneaux particules / fibres / MDF 1,30 ; LC 1,25 ; LVL, CP, OSB 1,20 ; assemblages 1,30 ; combinaisons accidentelles 1,00.
  ψ (bâtiments) ψ0/ψ1/ψ2 : cat A 0,7/0,5/0,3 ; B 0,7/0,5/0,3 ; C 0,7/0,7/0,6 ; D 0,7/0,7/0,6 ; E 1,0/0,9/0,8 ; F 0,7/0,7/0,6 ; G 0,7/0,5/0,3 ; H toits 0/0/0 ; neige Finlande… 0,70/0,50/0,20 ; autres CEN H > 1000 m 0,70/0,50/0,20 ; H ≤ 1000 m 0,50/0,20/0 ; vent 0,6/0,2/0 ; température 0,6/0,5/0.
- p.8 Propriétés matériaux (N/mm², kg/m³) :
  C18 : fm 18, ft0 10, ft90 0,4, fc0 18, fc90 2,2, fv 3,4, E0mean 9000, E0,05 6000, E90 300, G 560, ρk 320, ρmean 380
  C24 : 24, 14,5, 0,4, 21, 2,5, 4, 11000, 7400, 370, 690, 350, 420
  C30 : 30, 19, 0,4, 24, 2,7, 4, 12000, 8000, 400, 750, 380, 460
  D30 : 30, 18, 0,6, 24, 5,3, 3,9, 11000, 9200, 730, 690, 530, 640
  GL20h..GL32h : fm 20/22/24/26/28/30/32 ; ft0 16/17,6/19,2/20,8/22,4/24/25,6 ; fc0 = fm ; ft90 0,5 ; fc90 2,5 ; fv 3,5 ; fr 1,2 ; E0mean 8400/10500/11500/12100/12600/13600/14200 ; E0,05 7000/8800/9600/10100/10500/11300/11800 ; E90mean 300, E90,05 250 ; Gmean 650, G05 540 ; Gr 65/54 ; ρk 340/370/385/405/425/430/440 ; ρmean 370/410/420/445/460/480/490.

## STAB1_Cours_2_2022_Masson.pdf (87 p.) — p.1–40
- p.2 Organisation : STAB1 (R3-08), 5 ECTS UE3.3 ; BA = A. Seigneurin (TD) ; Bois & Métal = N. Blanchard, JP. Masson (8 TD). « Partiel le 28/10 ».
- p.3 Plan : EC0 (1 états limites, 2 actions, 3 combinaisons, 4 matériaux, 5 données géométriques, 6 vérification) ; EC1 (1 charges permanentes, 2 exploitation, 3 neige, 4 vent) ; stabilité des structures. (Cours 2 = rappels EC0 + neige + vent + stabilité.)
- p.4–8 Classification des actions : (G) permanentes (poids propres : poutres, planchers, cloisons, tuiles) ; (Q) variables (mobilier, personnes, vent, neige) ; (A) accidentelles (ex. bateau « L'Argonaut » contre le pont de pierre, Bordeaux) ; (A_E) sismiques (séisme d'Izmit 1999).
- p.9 photo effondrement bâtiment agricole sous neige.
- p.10 Neige EN 1991-1-3 : carte Europe des zones climatiques (Alpine, Centre Est, Centre Ouest, Grèce, Péninsule Ibérique, Méditerranée, Norvège, Suède-Finlande, R-U/Irlande).
- p.11 s_k = valeur caractéristique de la charge de neige AU SOL ; variable, statique, fixe ; probabilité de dépassement annuelle 0,02 → période de retour 50 ans. Charge de neige au sol exceptionnelle = chute exceptionnellement rare → action ACCIDENTELLE. Accumulation exceptionnelle = redistribution exceptionnellement rare (annexe B).
- p.12 Carte France régions A1 A2 B1 B2 C1 C2 D E. Départements : 16 Charente A2 ; 17 Charente-Maritime A2 ; 79 Deux-Sèvres A1 ; 85 Vendée A1 ; 86 Vienne A1.
- p.13 Questions : s_k La Rochelle ? Paris ? neige accidentelle ? Lourdes (500 m) et Gourette (1400 m) « même région que La Rochelle » ?
- p.14–17 Tableau s_k (altitude < 200 m) : A1 0,45 ; A2 0,45 ; B1 0,55 ; B2 0,55 ; C1 0,65 ; C2 0,65 ; D 0,90 ; E 1,40 kN/m². s_Ad : A1 — ; A2 1,00 ; B1 1,00 ; B2 1,35 ; C1 — ; C2 1,35 ; D 1,80 ; E —. Δs1 pour A1..D, Δs2 pour E.
  Δs1 : 200–500 m : A/1000 − 0,20 ; 500–1000 m : 1,5A/1000 − 0,45 ; 1000–2000 m : 3,5A/1000 − 2,45.
  Δs2 : 200–500 m : 1,5A/1000 − 0,30 ; 500–1000 m : 3,5A/1000 − 1,30 ; 1000–2000 m : 7A/1000 − 4,80.
- p.18 Réponses : La Rochelle et Paris s_k = 0,45 (A2 et A1) ; neige accidentelle : oui La Rochelle (1 kN/m²), non Paris. Lourdes : 0,45 + 500/1000 − 0,2 = 0,75 kN/m² ; Gourette : 0,45 + 3,5×1400/1000 − 2,45 = 2,9 kN/m² (« ça fait combien en kg ? » → ≈ 290 kg/m²).
- p.19 s = μi Ce Ct sk (durable/transitoire) ; s = μi Ce Ct sAd (accidentelle, neige exceptionnelle) ; s = μi sk (accidentelle, accumulation exceptionnelle, annexe B) — « §3.3 page 16 ». μi coefficient de forme, Ce exposition, Ct thermique.
- p.20 Ce : site protégé (abri quasi permanent par bâtiments voisins empêchant le déplacement de la neige par le vent) 1,25 ; site normal 1,0.
- p.21 Ct ≤ 1 réduit la charge (toitures vitrées, transmittance > 1 W/m²K) ; autres cas Ct = 1,0.
- p.22 Graphe μ1, μ2 (toitures en pente) : μ1 = 0,8 de 0 à 30°, décroît linéairement à 0 à 60° ; μ2 = 0,8 + 0,8α/30 de 0 à 30° puis 1,6 de 30 à 60°. μ3 cylindrique : croît de ~0,2 (h/b=0) à 2,0 à h/b = 0,18, puis 2,0 ; μ3 = 0 pour β > 60°. (EC : μ3 = 0,2 + 10h/b ≤ 2,0.)
- p.23 1 versant : μ1(α) uniforme ; ex. α = 45° → μ1 = 0,4.
- p.24–25 2 versants : cas (i) μ1(α1)/μ1(α2) (« le plus intéressant ! ») ; cas (ii) 0,5μ1(α1)/μ1(α2) ; cas (iii) μ1(α1)/0,5μ1(α2).
- p.26–27 Versants multiples : cas (i) μ1 sur chaque versant ; cas (ii) μ1(α1) en rive et μ2(ᾱ) dans la noue, ᾱ = (α1+α2)/2 ; ex. 45° → μ1 = 0,4, μ2 = 1,6.
- p.28–29 Toitures cylindriques : cas (i) 0,8 ; cas (ii) 0,5μ3 et μ3, triangles sur ls/4 ; ls entre points de tangente à 60°.
- p.30 Toitures attenantes (b1, b2, h) : cas (i) μ1 ; cas (ii) μ2 = μs + μw sur ls (glissement + vent).
- p.31 Accumulation au droit d'obstacles (acrotère) — CHARGE ACCIDENTELLE, s = μi sk : μ1 = 0,8 ; μ2 = γh/sk avec 0,8 ≤ μ2 ≤ 2,0 ; γ = 2 kN/m³ (poids volumique de la neige) ; ls = 2h et 5 m ≤ ls ≤ 15 m.
- p.32 Cas de 2 acrotères : même figure symétrique ; 0,8 ≤ μ2 ≤ 1,6.
- p.33 Application : La Rochelle, altitude 25 m, zone industrielle, toiture plate à arêtes vives, b = 20 m, d = 50 m, h = 10 m, vent longitudinal.
- p.37–39 Réponse : 1) normale s = 0,8 × 0,45 = 0,36 kN/m² (Ce = Ct = 1) ; 2) accidentelle sAd = 1 → s = 0,8 × 1 = 0,8 kN/m² (p.38) — ⚠ p.39 coquille « 0,8 x 1 = 0,36 kN/m² » ; 3) accumulation exceptionnelle : pas d'acrotère → NON.
- p.40 Tempête Amélie 3/11/2019, rafales 163 km/h (toit arraché à Quiberon, station-service détruite en Aquitaine).

## Cours Masson p.41–60 (vent)
- p.41 L'action du vent dépend : de sa vitesse ; de la catégorie de la construction et de ses proportions d'ensemble ; de l'emplacement de l'élément et de son orientation / vent ; des dimensions de l'élément et de la forme de la paroi.
- p.42 S'applique sur parois extérieures ET (porosité) intérieures. S'exerce sous forme de pression → efforts PERPENDICULAIRES aux surfaces. Schéma « au vent » / turbulences.
- p.43 Direction moyenne supposée horizontale → surfaces « au vent » et « sous le vent ».
- p.44–45 Bâtiment en dépression ou surpression intérieure, indépendamment du vent extérieur ; actions intérieures fonction de la perméabilité, de l'orientation des ouvertures, de leur importance.
- p.46 Exemple La Rochelle, zone industrielle, catégorie IIIb, pente < 3° (terrain plat), b = 20, d = 50, h = 10 m, vent longitudinal.
- p.47 q_b = ½ρ v_b² ; v_b,0 = valeur moyenne sur 10 min, à 10 m au-dessus du sol en rase campagne, probabilité annuelle 0,02 (retour 50 ans). « ρ = 1,25 kg/m³ » sur cette diapo. v_b = c_dir c_season v_b,0 ; c_dir (direction peu fréquente) et c_season (construction temporaire), cas courants = 1.
- p.48 Carte zones vent : 1 = 22 m/s (80 km/h) ; 2 = 24 (88) ; 3 = 26 (93) ; 4 = 28 (101). Charente-Maritime (côtière) zone 3 : q_b = ½ × 1,25 × 26² = 42,25 daN/m² = 0,422 kN/m².
  (Zone 1 = Sud-Ouest intérieur + vallée du Rhône/Alpes ; zone 3 = littoral Bretagne-Vendée-Charente, Nord, Languedoc ; zone 4 = Corse partiellement.)
- p.49 v_b,0 = 26 m/s ; v_b = 1·1·26 = 26 m/s.
- p.50 q_p(z) = c_e(z)·q_b ; c_e(z) coefficient d'exposition : rugosité du terrain + topographie.
- p.51–53 Catégories de terrain : 0 mer / zone côtière exposée, lacs/plans d'eau parcourus sur ≥ 5 km ; II rase campagne, obstacles isolés séparés de plus de 40 fois leur hauteur ; IIIa campagne avec haies, bocage, vignoble, habitat dispersé ; IIIb zones habitées ou industrielles, bocage dense, vergers ; IV zones urbaines (≥ 15 % surface couverte de bâtiments de hauteur moyenne > 15 m), forêts.
- p.54–55 Abaque c_e(z) terrain plat (orographie = 1), z de 0 à ~25 m, courbes IV, IIIb, IIIa, II, 0 (c_e de 1,3 à 4). « ⚠ z n'est pas l'altitude, c'est la hauteur de la construction ! »
- p.56 Outil Meteodyn (La Rochelle, h = 20 m : q_p = 871 Pa, 136 km/h).
- p.57 w_e = q_p(z_e)·c_pe ; w_i = q_p(z_i)·c_pi ; p_r = w_e − w_i. Hauteur de référence z_e : h < b → z_e = h (1 bande) ; b < h < 2b → 2 bandes (z_e = b en bas, h en haut) ; h > 2b → bandes b, b + (b−2h)/n… n = entier sup. de (h−2b)/b.
- p.58 Exemple : h = 10 < b = 20 → une seule bande, z_e = h = 10 m. q_b = 0,5 × 1,225 × 26² = « 0,422 » kN/m² ; c_e = 1,35 (IIIb, 10 m, abaque) ; q_p = 1,35 × 0,422 = 0,570 kN/m². Clermont-Ferrand v_b = 24 : q_b = 0,5 × 1,225 × 24² = 0,353 ; q_p = 1,35 × 0,353 = 0,48 kN/m².
  ⚠ Incohérence ρ : 0,5 × 1,225 × 26² = 0,414 kN/m² (0,422 correspond à ρ = 1,25 de la p.47-48) ; pour Clermont 0,353 correspond bien à ρ = 1,225. → Dans l'appli : ρ = 1,225 (valeur EC/AN), et signaler que le cours affiche 0,422 (ρ = 1,25) pour La Rochelle ; tolérance des QCM numériques pour accepter 0,414 et 0,422 quand c'est l'objet.
- p.59 Action résultante : pression nette combinée de la manière la plus défavorable ; p_r = q_p(z)(c_pe − c_pi) ; « (C_pe − C_pi) est appelé C_p,net ».
- p.60 Exemple Cpe : toiture plate, rives à arêtes vives, bâtiment sans face dominante.

## Cours Masson p.61–80
- p.61 c_pe dépend de la surface chargée A : c_pe,1 (1 m²), c_pe,10 (10 m²). c_pe = c_pe,1 si A ≤ 1 m² ; c_pe = c_pe,1 + (c_pe,10 − c_pe,1) log10(A) si 1 < A < 10 m² ; c_pe = c_pe,10 si A ≥ 10 m². Valeurs données pour parois verticales rectangulaires, toitures plates, 1 versant, 2 versants, 4 versants, multiples, voûtes/dômes ; zones + hauteur de référence z_e.
- p.62 Schémas zones : murs A B C (parallèles au vent), D (au vent), E (sous le vent) ; toiture F G H I (+ J pour 2 versants).
- p.63 Murs verticaux bâtiments rectangulaires : b = largeur présentée au vent, d = longueur dans le sens du vent ; e = min(b ; 2h). Pour e < d : A sur e/5, B sur 4e/5, C le reste.
  Tableau (Cpe,10 / Cpe,1) : h/d = 5 : A −1,2/−1,4 ; B −0,8/−1,1 ; C −0,5 ; D +0,8/+1,0 ; E −0,7. h/d = 1 : A −1,2/−1,4 ; B −0,8/−1,1 ; C −0,5 ; D +0,8/+1,0 ; E −0,5. h/d ≤ 0,25 : A −1,2/−1,4 ; B −0,8/−1,1 ; C −0,5 ; D +0,7/+1,0 ; E −0,3. (Interpolation linéaire sur h/d.)
- p.64 Exemple (§7.2.2) : h < b (10 < 50, sic) → pas de bandes ; e = min(20 ; 20) = 20 ; e < d (20 < 50) → 3 zones A B C sur paroi // au vent (long-pan) ; h/d = 0,2 → pas d'interpolation pour E. Toute la paroi : S > 10 m² → Cpe,10.
- p.65 Résultat : D +0,7 ; A −1,2 (4 m) ; B −0,8 (16 m) ; C −0,5 (30 m) ; E −0,3.
- p.66–67 Toiture terrasse (§7.2.3), rives à arêtes vives, e = 20 : F (e/4 = 5 m × e/10 = 2 m, aux deux coins), G (10 m × 2 m), H (bande de e/10 à e/2 → 8 m), I (reste, 40 m). Cpe,10 : F −1,8 ; G −1,2 ; H −0,7 ; I ±0,2.
- p.68 Tableau récap Cpe : A −1,2 ; B −0,8 ; C −0,5 ; D +0,7 ; E −0,3 ; F −1,8 ; G −1,2 ; H −0,7 ; I ±0,2.
- p.70 C_pi méthode simplifiée (bâtiments courants, situation durable ou transitoire, pas de face dominante) : valeur la plus sévère entre c_pi = +0,2 (intérieur en surpression) et c_pi = −0,3 (intérieur en dépression).
- p.72 C_p,net (Cpi = −0,3 / +0,2) : A −0,9/−1,4 ; B −0,5/−1,0 ; C −0,2/−0,7 ; D +1,0/+0,5 ; E 0,0/−0,5 ; F −1,5/−2,0 ; G −0,9/−1,4 ; H −0,4/−0,9 ; I (+0,2 → +0,5 / 0,0 ; −0,2 → +0,1 / −0,4).
- p.73 p_r = q_p(C_pe − C_pi), q_p = 0,570 : murs A–C −0,80 kN/m² (dépression, −1,4 × 0,57) ; D +0,57 (surpression, 1,0 × 0,57) ; E / ; toiture F −1,14 (−2,0 × 0,57) ; I +0,29 (+0,5 × 0,57).
- p.74–75 Stabilité des structures : vue 3D d'un bâtiment bois (portiques, pannes, contreventements en croix de St-André en toiture et en long-pan, potelets/pignons).
- p.76–77 ENTRETOISES : panne inclinée α, charge P → P cos α (⊥ versant) et P sin α (// versant). Les entretoises (liernes) reprennent la composante P sin α et la cumulent vers le faîtage / l'appui : P1, 2P1, 3P1, 4P1 … ; réaction d'appui intermédiaire d'une poutre continue 2 travées : P1 = 0,625 p L sin α (puis P1/2 en rive).
- p.78–80 Vent sur long-pan → portique (traverse + poteaux), schéma statique du portique articulé en pied.

## Cours Masson p.81–87
- p.81 Vent sur pignon → file de long-pan : poteaux, panne sablière, croix de contreventement (palée) dans une travée.
- p.82–83 Vent sur pignon : efforts en tête des potelets de pignon (flèches) → repris par la POUTRE AU VENT (treillis en toiture, en rouge) → appuis aux deux long-pans → palées.
- p.84 POUTRE AU VENT : action du vent perpendiculaire au pignon ; treillis formé par les portiques (membrures), les pannes (montants : panne sablière, pannes, panne faîtière) et les diagonales de contreventement (CV acier) ; étude RdM d'une poutre à treillis → efforts dans les pannes (compression) et dans les contreventements (traction).
- p.85 PALÉE DE STABILITÉ : la poutre au vent en toiture apporte un effort en long-pan qui doit être repris par une ou plusieurs palées de stabilité, influant sur les fondations. Palée = 2 poteaux (portiques) + panne sablière + diagonales CV acier ; seule la diagonale TENDUE travaille (« traction dans la diagonale »), l'autre est pour le vent inverse ; réactions verticales (soulèvement/compression) et horizontale en pied.
- p.86 Exemple : salle de sports (arcs lamellé-collé).
- p.87 Page de fin « ST1 – Structures Stabilité – Eurocodes 0 et 1 ».
- ⚠ Le cours 2 ne détaille PAS EC0 (états limites, combinaisons, ψ) au-delà de la classification G/Q/A/AE : ces éléments viennent du poly métal ch.3 et du mémo p.7 (ψ).

## POLY_2026_metal.pdf (45 p., JP Masson) — numérotation x/45 = page PDF
- p.2 Sommaire : ch.1 acier p.3 ; ch.2 concevoir une ossature p.7 ; ch.3 principes de calcul p.11 ; ch.4 ELS p.13 ; ch.5 ELU p.17 ; ch.6 pieds de poteaux p.25 ; ch.7 mixte p.27 ; ch.8 profilés p.29 ; ch.9 données techniques p.44 ; biblio p.45.
- p.3 Acier = fer + carbone 0,02 % à 2 % (en masse). < 0,008 % → « fer » (malléable) ; > 2,1 % → fonte. ↑ carbone → ↑ dureté, ↓ allongement à la rupture (aciers doux, mi-doux, mi-durs, durs, extra-durs). Production 2019 : 150 Mt/mois dans le monde (moitié Chine) ; France 1,3 Mt/mois ≈ 1 % ; UE ≈ 10 %. Intérêts : E, fy, fu élevés, résilience, ductilité ; coût modéré (minerai ≈ 5 % de l'écorce, réduction simple : filière fonte). (Ordres de grandeur laissés en blanc dans le poly : E = 210 000 MPa, fy 235–460, fu 360–550.)
- p.4 Recyclable (filière ferraille) : béton armé 50 % des armatures recyclées ; structure métallique et bardages 95 %. Inconvénients : grande énergie de fabrication ; corrosion (peinture, galvanisation, inox) ; mauvaise tenue au feu (flocage, peintures intumescentes). Figure 1.1 : 2 filières (haut-fourneau + convertisseur à l'oxygène → coulée continue → laminage à chaud ; et filière ferraille/four électrique).
- p.5 fu résistance limite à la traction, fy limite d'élasticité minimale, A_R allongement après rupture [%] → caractérisent la nuance ; essai de traction : zones élastique, plastique (palier), écrouissage, striction ; A = (L_R − L0)/L0. Ductilité = éviter ruptures fragiles. Produits : sidérurgiques (I, H, U, L, T, plats) ; profils creux (tubes ronds, carrés, rectangulaires, elliptiques) ; profils formés à froid (C, Z, Ω).
- p.6 Table 1.1 : A (cm²) traction-compression ; I (cm⁴) flèche ; W_el (cm³) résistance élastique ; W_pl (cm³) résistance plastique. Axes : Y-Y parallèle aux semelles, Z-Z perpendiculaire (axes principaux). « On travaillera avec I_y ».
- p.7 Avantages CM : chantier réduit, appuis ponctuels (liberté d'aménagement, allègement, fondations ponctuelles), rapidité de montage, environnement (déchets, modularité, déconstruction-recyclage). Halle = boîte de 6 surfaces ; stabilité : chaque direction rigide dans son plan par effet cadre ou contreventement. Sous-structures : portiques (plan YZ) ; charpentes de pignon (YZ : lisses, bardage, potelets) ;
- p.8 façades long-pan (XZ : lisses, contreventements verticaux) ; toiture (XY : pannes, contreventements transversaux et longitudinaux). Cheminement des charges : du point d'application aux fondations. Verticales : G, Q, neige, pont roulant ; horizontales : vent, pont roulant, séisme. Fig 2.3 : couverture → pannes → traverses → poteaux → fondations.
- p.9 Vent W_Y sur long-pan : bardage → lisses → efforts ponctuels sur le portique ; c'est l'ENCASTREMENT poteaux-traverse qui assure la stabilité du portique ; q_w = W_y·l (kN/m) (l = entraxe des portiques). Vent W_X sur pignon : lisses → potelets → fondations ET pannes (comprimées) → contreventement transversal de toiture (poutre à treillis sur 2 appuis = poutre au vent) → 2 contreventements verticaux de long-pan (poutres treillis en console) = PALÉES DE STABILITÉ (stabilité longitudinale).
- p.10 Fig 2.5 cheminement W_X.
- p.11 Ch.3 : EC3 = NF EN 1993. EC0 (EN 1990) : apte à l'utilisation (ELS) ; résister à toutes les actions (ELU). Table 3.1 durées d'utilisation de projet : cat.1 10 ans provisoires ; cat.2 25 ans éléments remplaçables ; cat.3 25 ans agricoles ; cat.4 50 ans bâtiments courants ; cat.5 100 ans monumentaux ou stratégiques. Actions (EC1) : permanentes, variables (exploitation, neige, vent), sismiques, accidentelles.
- p.12 ELU durables/transitoires (STR & GEO) : 1,35 G_k,sup + 1,00 G_k,inf + 1,50 Q_k,1 + 1,50 Σ ψ0,i Q_k,i. Accidentelles : Σ G_k,j + A_d + (ψ1,1 ou ψ2,1) Q_k,1 « + 1,50 Σ ψ0,i Q_k,i » ⚠ coquille du poly : l'EN 1990 donne + Σ ψ2,i Q_k,i. Sismiques : Σ G_k,j + A_Ed + Σ ψ2,i Q_k,i. ELS caractéristique (irréversible) : Σ G_k,j + Q_k,1 + Σ ψ0,i Q_k,i. ψ0 = valeur de combinaison (« caractéristique » dans le poly), ψ2 = quasi-permanente. Table 3.2 : cat A 0,7 / 0,3 ; neige H ≤ 1000 m 0,5 / 0 ; vent 0,6 / 0.
- p.13 ELS = fonctionnement en utilisation normale, confort, aspect. Vérifs : flèches verticales, vibrations (non traitées), déplacements horizontaux. wc, w1, w2, w3, wtot = w1+w2+w3, wmax (avec contreflèche).
- p.14 Table 4.1 flèches limites (Annexe Nationale) = tableau du partiel. Table 4.2 déplacements horizontaux : bâtiment industriel 1 niveau sans pont roulant, parois non fragiles : tête de poteau H/150 ; différentiel entre 2 portiques H/150 ; supports de bardage : lisses Li/150, montants Hi/150 ; autres bâtiments 1 niveau sans pont roulant : tête de poteau Hi/250 ;
- p.15 … différentiel Li/200 ; industriels plusieurs niveaux : entre étages Hi/200, ensemble H ≤ 30 m H/200, H > 30 m Hi/300 ; autres plusieurs niveaux : entre étages Hi/300 ; ensemble H ≤ 10 m H/300 ; 10 < H ≤ 30 m H/(200+10H) ; H > 30 m H/500.
- p.16 page vide.
- p.17 Ch.5 : Ed ≤ Rd ou Ed/Rd ≤ 1 (vérifier la section la plus sollicitée). Traction hors assemblages γM0 = 1,00. Table 5.5 : cornière, Té, U laminés, tubes → treillis légers, contreventements ; sections pleines (ronds, carrés, plats), câbles → contreventements, liernes, tirants.
- p.18 N_Ed ≤ N_pl,Rd = A fy/γM0 (section brute) ; au voisinage des trous N_Ed ≤ N_u,Rd = 0,9 A_net fu/γM2, γM2 = 1,25 (bâtiments, France). « Ces 2 critères se déterminent aux ELU ! » A_net = b×t − n×(d×t) (rangées parallèles, fig 5.1 n = 3).
- p.19 Compression simple : pièce massive (longueur < 6 × plus petite dimension), on néglige le flambement : N_Ed ≤ N_pl,Rd = A fy/γM0. Flexion pure : classe 1-2 M_pl,Rd = W_pl fy/γM0 ; classe 3 M_el,Rd = W_el fy/γM0 ; la classe est en général dans le catalogue. Classification (voilement local = « flambement » d'une plaque comprimée) : 4 classes, 1 la plus performante → 4 la plus fragile.
- p.20 Table 5.2 âme (parois internes) : classe 1 : fléchie c/t ≤ 72ε ; comprimée c/t ≤ 33ε ; fléchie+comprimée α > 0,5 : c/t ≤ 396ε/(13α−1), α ≤ 0,5 : 36ε/α. Classe 2 : 83ε ; 38ε ; 456ε/(13α−1) ; 41,5ε/α. Classe 3 : 124ε ; 42ε ; ψ > −1 : 42ε/(0,67+0,33ψ) ; ψ ≤ −1 : 62ε(1−ψ)√(−ψ). ε = √(235/fy) : 235 → 1,00 ; 275 → 0,92 ; 355 → 0,81 ; 420 → 0,75 ; 460 → 0,71. Flexion composée : α = ½(1 + N_u/N_plw), N_plw = A_âme fy.
- p.21 Table 5.3 semelles en console : classe 1 comprimée c/t ≤ 9ε (fléchie-comprimée : extrémité comprimée 9ε/α, tendue 9ε/(α√α)) ; classe 2 10ε (10ε/α ; 10ε/(α√α)) ; classe 3 14ε (21ε√kσ). « La classe du profilé est donnée par le MAXIMUM de la classe de l'âme ou de la semelle » (ex. âme classe 2 + semelle classe 1 → profilé classe 2). Classe 4 non traitée.
- p.22 Table 5.4 : cornières (classe 3 si h/t ≤ 15ε et (b+h)/(2t) ≤ 11,5ε) ; tubes circulaires d/t ≤ 50ε² (cl.1), 70ε² (cl.2), 90ε² (cl.3). ε² : 1,00 / 0,85 / 0,66 / 0,56 / 0,51.
- p.23 V_Ed ≤ V_pl,Rd = A_vz (fy/√3)/γM0 ; A_vz dans le catalogue, sinon Table 5.6 : I ou H laminés, effort // âme : A_v = A − 2b t_f + (t_w + 2r) t_f, au minimum η (h − 2t_f) t_w ; U laminés : A − 2b t_f + (t_w + r) t_f ; T laminés : 0,9(A − b t_f) ; I/H/caissons soudés // âme : η Σh_w t_w ; ⊥ âme : A − Σh_w t_w ; tubes rect. // hauteur : A h/(b+h) ; // largeur : A b/(b+h) ; tubes circulaires : 2A/π. η = 1,2 jusqu'à S460, 1 au-delà. « Si V_Ed ≤ 0,5 V_pl,Rd on ne tient pas compte de son action » sur le moment résistant ; dans la plupart des cas vérifié.
- p.24 §5.7 Flexion + effort normal / flexion bi-axiale : M_Ed ≤ M_N,Rd. Table 5.7 (classe 1-2, sans trous) n = N_Ed/N_pl,Rd :
  plats : M_N,y,Rd = M_pl,y,Rd(1 − n²), idem z ; α = β = 1,73 + 1,8n³.
  I ou H laminés / PRS à semelles égales : a = (A − 2b t_f)/A ≤ 0,5 ; si n ≤ 0,25 et n ≤ 0,5a → M_N,y,Rd = M_pl,y,Rd, sinon M_pl,y,Rd(1−n)/(1−0,5a) ; z : si n ≤ a → M_N,z,Rd = M_pl,z,Rd, sinon M_pl,z,Rd[1 − ((n−a)/(1−a))²] ; flexion biaxiale (M_y,Ed/M_N,y,Rd)^α + (M_z,Ed/M_N,z,Rd)^β ≤ 1 avec α = 2, β = 5n et β ≥ 1 (→ β = 1 si N = 0).
  tubes/caissons rect. : M_pl(1−n)/(1−0,5a_w) ; α = β = 1,66/(1 − 1,13n²) ≤ 6 ; tubes circulaires (n > 0,15) : 1,04(1 − n^1,7) ; α = β = 2. Classes 3-4 : EN 1993-1-1 §6.2.9.2-3.
- p.25 Ch.6 pieds de poteaux : liaison en général ARTICULATION (rarement encastrement) avec le support béton. N_c (compression) → plaque d'appui (platine) sur la semelle béton ; V → frottement platine/béton ou cisaillement d'une BÊCHE ; N_t (traction/soulèvement) → TIGES D'ANCRAGE. Platine = répartit la compression sur le béton. Tiges : scellement droit, courbe (crosse r > 3φ, 1,5φ ≤ L2 ≤ 2φ), avec plaque d'ancrage d'extrémité, ou sur sommier noyé. Bêche « quasiment obligatoire avec l'EC3 » : chute de profilé I ou H de faible hauteur soudée sous la platine.
- p.26 vide.
- p.27 Ch.7 mixte (NF EN 1994) : béton → compression ; acier → traction et efforts tranchants ; adhérence → réduit contraintes max et flèches ; connecteurs (goujons soudés, cornières soudées/clouées, butées) ; très compétitive vs tout béton / tout acier. Poteau mixte : section acier totalement/partiellement enrobée, ou tube rempli de béton. Dalle mixte = plancher collaborant (béton coulé sur bacs acier nervurés minces, connexion par goujons soudés ; armatures dans l'onde pour coupe-feu jusqu'à 2 h).
- p.28 Poutre mixte : dalle béton + profilé acier liés par connecteurs (pont mixte sur la Moselle). Avantages : 1) réduction du poids à chargement égal ; 2) portées 12, 15 ou 20 m (parkings, bureaux sans poteaux) ; 3) ↑ résistance au feu ; 4) ↓ délais ; 5) ouvrages d'art 100 à 300 m économiques.
- p.29 titre ch.8. p.30 HEA/HEB/HEM (+AA, C) 100 à 200 : dimensions (G kg/m, h, b, tw, tf, r, A ×10² mm², hi, d, Ø boulon, pmin, pmax, AL, AG). Ex. HE 100 A : 16,7 kg/m, h 96, b 100, tw 5, tf 8, r 12, A 21,2 cm² ; HE 100 B : 20,4 ; 100 ; 100 ; 6 ; 10 ; 12 ; 26,0 ; HE 120 A 19,9 ; 114 ; 120 ; 5 ; 8 ; 12 ; 25,3 ; HE 120 B 26,7 ; 120 ; 120 ; 6,5 ; 11 ; 12 ; 34,0 ; HE 140 A 24,7 ; 133 ; 140 ; 5,5 ; 8,5 ; 12 ; 31,4 ; HE 140 B 33,7 ; 140 ; 140 ; 7 ; 12 ; 12 ; 43,0 ; HE 160 A 30,4 ; 152 ; 160 ; 6 ; 9 ; 15 ; 38,8 ; HE 160 B 42,6 ; 160 ; 160 ; 8 ; 13 ; 15 ; 54,3 ; HE 180 A 35,5 ; 171 ; 180 ; 6 ; 9,5 ; 15 ; 45,3 ; HE 180 B 51,2 ; 180 ; 180 ; 8,5 ; 14 ; 15 ; 65,3 ; HE 200 A 42,3 ; 190 ; 200 ; 6,5 ; 10 ; 18 ; 53,8 ; HE 200 B 61,3 ; 200 ; 200 ; 9 ; 15 ; 18 ; 78,1 ; HE 100 M 41,8 kg/m A 53,2 ; HE 200 M 103 kg/m A 131,3.
- p.31-43 catalogues transcrits dans docs/data/profils_poly.json (IPE 80-500, HEA/HEB 100-600, UPN 50-300, cornieres L35-L200, tubes circulaires). Pas d'IPE 550/600 dans le poly. Cornière L20x3 (TD garage) absente du poly.
- p.44 Ch.9 : nuances = mémo p.1 (S235 235/360 ; S275 275/430 ; S355 355/490 ; S450 440/550 ; 40<t<=80 : 215/360, 255/410, 335/470, 410/550). E = 210 000 MPa ; nu = 0,3 ; G = E/(2(1+nu)) ; rho = 7850 kg/m3 ; alpha = 1,2e-5 /K. gammaM0 = 1,00 (résistance des sections), gammaM1 = 1,00 (instabilités), gammaM2 = 1,25 (rupture des sections).
- p.45 bibliographie.
