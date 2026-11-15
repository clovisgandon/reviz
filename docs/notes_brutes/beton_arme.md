# Notes brutes — Béton armé (sujets TD 1–6 + corrigés moodle)

## Sujets_de_TD_STAB1_BA_2026-2027.pdf (12 p., A. Seigneurin)
- p.1–2 TD1 Caractéristiques des matériaux : Q1 f_cd = 16,6 MPa → f_ck ? classe ? Q2 f_cm. Q3 f_ctk (2 valeurs), f_ctm,fl poutre h = 70 cm. Q4 E_cm et E_c,eff. Q5 C35 à 2, 10, 20 j (CEM 42,5N), courbe. Q6 limite ELS compression C35 en XD/XF/XS. Q7 limite fluage linéaire C25. Q8 parabole-rectangle f_cm = 38 MPa : f_cd, ε_cu2, ε_c2. Q9 rectangle simplifié, F_c(x_u, f_cd). Q10 f_yd = 348 → f_yk. Q11 ε_uk ductile / peu ductile. Q12 E_s. Q13 ε_yd B500. Q14 poutre b = 18 cm, x_u = 10 cm, C20 → F_c puis A_s (B500). Q15 tableau sections n barres. Q16 formulaire. Q17 conversions d'unités.
- p.3–4 TD2 Enrobages : Ex1 pont alternativement humide/sec + chlorures, C45, φ_L ≤ 16, φ_t = 6 (parties A longi, B transv, C retenue). Ex2 poutre intérieure humidité modérée, C30, B500, d_g = 15, 300 × 400, 4HA12, φ_t = 6 → c_nom, e_h, d. Ex3 intérieur sec, C35, B500, d_g = 15, 180 × 380, 3HA20 (9,42 ≥ 9,05 cm²), φ_t 6 → c_nom, e_h, d ; 4 autres solutions ; 3HA16 + 3HA12 en 2 lits. Ex4 A_s ≥ 6 cm² → solutions. Ex5 extérieur humidité modérée + chlorures, f_ck 30, 20 × 45, A_s = 7,6 cm² : 2HA20+1HA14 ; 3HA12+3HA14 ; 4HA12+4HA10 ; 4HA16 ; φ_t 6, d_g 15.
- p.5 TD3 Adhérence – ancrages : Ex1 f_bd : a) dalle 140 mm, C25, HA500, φ8 en partie inférieure ; b) poutre h 450, C30, HA400, φ16 inférieure ; c) poutre h 450, C25, HA400, φ14 en partie SUPÉRIEURE. l_b,rqd pour chaque ; cas b : l_bd avec α_i = 1. Ex2 C20–C35, bonnes conditions, φ < 40 → l_b en fonction de φ. Ex3 ancrages courbes θ = 135° (4HA12, 250 × 300, C25, B500, XC1).
- p.6–7 TD4 Compression – flambement : bâtiment logements (Q = 3 kN/m²), poteaux P0, P1, P2 ; λ : P2 34, P1 36, P0 42 ; C35, B500, XC1 ; N_Ed : P2 420 kN, P1 750 kN, P0 1085 kN ; φ_L = 14 mm ; plan de flambement le plus défavorable 0XZ ; P1 section 20 × 22.
- p.8–9 TD5 Flexion simple : PT3 1) M_u = 150 kN·m, d = 0,40, C25, B500, d' = 0,04 → A_s ; 3HA16 + 3HA14 ? 2) M_u = 175, C30, B400 ; 3HA20 + 3HA16 ? PT5 3) M_u = 432, d = 0,45, C35, B500. 4–5) PT3 en Té. PT2 6) Té M_u = 240, C35, B500 ; 3HA20 + 3HA16. 7) PT3 charge ELU 44,8 kN/m, C50 : G = 21,24 kN/m, Q (bureaux) = 10,75 kN/m, M_u = 377 kN·m ; 6HA25. (PT3 20 × 45.)
- p.10–12 TD6 Flexion simple bureaux : poutre file 3, b = 20, h = 40 cm, poteaux 20 × 20, dalle 20 cm, trame 5 × 5 m ; d = 0,9h → 0,35 m ; d' = 0,1h ; ρ béton 25 kN/m³ ; G2 = 1 kN/m² ; Q = 2,5 kN/m² (cat. B) ; C25/30, d_g = 15, B500B, XC1. M_u = 190 kN·m. 5HA20 ; espacements cadres 8-9-10-11-13-16-20-25-35-40 (suite de Caquot), 2 fois chacun, en commençant par un demi-espacement. Tableau bilan coûts (béton 150 €/m³, acier 1 €/kg).

## Correction_TD1_moodle.pdf (3 p.)
- f_cd = f_ck/1,5 → f_ck = 1,5 × 16,6 = 24,90 MPa ; le corrigé écrit « C20 » ⚠ ERREUR : f_ck = 24,9 ≈ 25 MPa → **C25/30**.
- f_cm = f_ck + 8 = 32,90 MPa ; f_ctm = 0,3 f_ck^(2/3) (≤ C50/60) = 2,56 MPa ; f_ctk,0,05 = 0,7 f_ctm = 1,79 MPa (5 % des valeurs sous ce seuil) ; f_ctk,0,95 = 1,3 f_ctm = 3,33 MPa (rarement utilisée) ; f_ctm,fl = max((1,6 − h/1000) f_ctm ; f_ctm) : h = 700 → max(2,30 ; 2,56) = 2,56 MPa.
- E_cm = 22 000 (f_cm/10)^0,3 = 31 447 MPa (module sécant : droite entre σ = 0 et σ = 0,4 f_cm) ; E_c,eff = E_cm/(1 + φ) = 10 482 MPa (module différé, φ = 2).
- C35 : f_cm = 43 ; s = 0,25 (CEM 42,5N) ; β_cc(t) = exp[s(1 − (28/t)^½)] : t = 2 j → 0,504 ; 10 j → 0,845 ; 20 j → 0,955 ; β_∞ = e^0,25 = 1,284 (le corrigé : 1,279 à 118 129 j ≈ 324 ans). f_cm(t) = β_cc f_cm : 21,67 / 36,34 / 41,07 MPa ; f_ck(t) = f_cm(t) − 8 : (13,67 non valable < 3 j) / 28,34 / 33,07 MPa. Conclusion : courbe non linéaire, forte croissance les 2 premiers jours (moitié de la résistance), charges de chantier légères possibles après 2 jours ; à 28 j la résistance finale n'est pas atteinte selon ce modèle.
- Q6 C35, XD/XF/XS, combinaison caractéristique : σ_c ≤ 0,6 f_ck = 21,00 MPa (EC2 §7.1/7.2). (Quasi-permanente 0,45 f_ck = 15,75 « pas convaincu ».)
- Q7 C25 : fluage linéaire si σ_c ≤ 0,45 f_ck = 11,25 MPa (sinon non linéaire, EN 1992 §3.1.4).
- Q8 f_cm = 38 → f_ck = 30, f_cd = 20 MPa ; ε_cu2 = 3,5 ‰ (déformation ultime), ε_c2 = 2 ‰ (déformation à la contrainte max).
- Q9 Rectangle simplifié (f_ck ≤ 50) : λ = 0,8 ; η = 1 ; f_cd = α_cc f_ck/γ_c (α_cc = 1) ; F_c = 0,8 x_u b f_cd.
- Q10 f_yd = f_yk/γ_s → f_yk = 348 × 1,15 = 400,2 → 400 MPa.
- Q11 ε_uk : classe A peu ductile (écroui à froid) 2,5 % ; classe B ductile (laminé à chaud) 5 %. Q12 E_s = 200 GPa. Q13 le corrigé : ε = f_yk/E_s = 2,50e-3 (⚠ l'EC2 définit ε_yd = f_yd/E_s = 435/200 000 = 2,17 ‰ ; 2,5 ‰ = f_yk/E_s).
- Q14 C20 (f_cd = 13,33), b = 0,18, x_u = 0,10 : F_c = 0,8 × 0,10 × 0,18 × 13,33 = 0,192 MN → A_s = 0,192/435 = 4,42 cm² → 3HA14. ⚠ Le corrigé affiche aussi 0,29 MN / 6,62 cm² (calcul fait avec f_cd = 20 MPa du C30 de la Q8) puis « 0,19 MN » et « 4,42 cm² — oui pour moi aussi (XJO) ». Valeur retenue : 0,19 MN, 4,42 cm².
- Q15 Tableau des sections (cm²), n = 1 à 10 :
  φ6 : 0,28 0,57 0,85 1,13 1,41 1,70 1,98 2,26 2,54 2,83
  φ8 : 0,50 1,01 1,51 2,01 2,51 3,02 3,52 4,02 4,52 5,03
  φ10 : 0,79 1,57 2,36 3,14 3,93 4,71 5,50 6,28 7,07 7,85
  φ12 : 1,13 2,26 3,39 4,52 5,65 6,79 7,92 9,05 10,18 11,31
  φ14 : 1,54 3,08 4,62 6,16 7,70 9,24 10,78 12,32 13,85 15,39
  φ16 : 2,01 4,02 6,03 8,04 10,05 12,06 14,07 16,08 18,10 20,11
  φ20 : 3,14 6,28 9,42 12,57 15,71 18,85 21,99 25,13 28,27 31,42
  φ25 : 4,91 9,82 14,73 19,63 24,54 29,45 34,36 39,27 44,18 49,09
  φ32 : 8,04 16,08 24,13 32,17 40,21 48,25 56,30 64,34 72,38 80,42
  φ40 : 12,57 25,13 37,70 50,27 62,83 75,40 87,96 100,53 113,10 125,66
- Q16 formulaire : E_c,eff = E_cm/(1+φ) ; E_cm = 22 000 (f_cm/10)^0,3 ; E_cm(t) = (f_cm(t)/f_cm)^0,3 E_cm ; f_yd = f_yk/γ_s ; ε_yd = f_yd/E_s.
- Q17 : 100 000 N/m² = 100 kN/m² = 0,10 MPa = 0,10 N/mm² = 1 bar = 100 000 Pa = 0,10 MN/m² = 1·10⁻⁷ MN/mm². 1 MN·m = 1000 kN·m = 10⁹ N·mm = 1000 MN·mm = 100 000 daN·m = 10⁶ kN·mm.

## Correction_TD2_moodle.pdf (1 p.)
- Tableau 4.4N (exigence c_min,dur en mm, établi pour 50 ans, classe structurale S4 de référence — corriger la classe selon le tableau 4.3NF) :
  colonnes X0 / XC1 / XC2-XC3 / XC4 / XD1-XS1 / XD2-XS2 / XD3-XS3
  S1 : 10 10 10 15 20 25 30 ; S2 : 10 10 15 20 25 30 35 ; S3 : 10 10 20 25 30 35 40 ; S4 : 10 15 25 30 35 40 45 ; S5 : 15 20 30 35 40 45 50 ; S6 : 20 25 35 40 45 50 55.
  Modulations (tableau 4.3NF) : durée 100 ans → +2 ; classe de résistance élevée (ex. ≥ C30/37 en XC1, ≥ C35/45 en XC2/XC3, ≥ C40/50 en XC4, ≥ C40/50 / C45/55 en XD/XS) → −1 ; nature du liant / enrobage compact → −1 (valeurs EC2 AN standard, tableau image peu lisible).
- c_min = max(c_min,b ; c_min,dur + Δc_dur,γ − Δc_dur,st − Δc_dur,add ; 10 mm) ; c_min,b = φ (barre isolée) ; c_nom = c_min + Δc_dev, Δc_dev = 10 mm (AN, tolérances d'exécution EC2 4.4.1.1).
- Espacements : e_h ≥ max(20 mm ; φ_L ; d_g + 5 mm) ; e_v ≥ max(20 mm ; φ_L ; d_g + 5 mm) ; paquets de barres possibles (2 ou 3).
- Ex1 : XD3 (alternance humide/sec + chlorures). A (longi φ16) : c_min,b = 16 ; c_min,dur = 50 (S4 + 2 (100 ans) − 1 (C45) = S5 → XD3 = 50) ; c_min = 50 ; c_nom = 60 mm. B (transv φ6) : c_min,b = 6 ; c_min,dur = 50 ; c_nom = 60 mm. C : on retient c_nom = 60 mm sur les cadres (première armature rencontrée) → longi à 66 mm (le corrigé note « distance horizontale 76 mm » pour A : 60 + 16 ?).
- Ex2 : XC3 (humidité modérée) ; c_min,dur = 20 (S4 − 1 car C30 → S3) ; c_nom = 30 mm ; e_h = 53,33 mm ≥ max(20 ; 12 ; 20) OK ; d = 358 mm (400 − 30 − 6 − 6).
- Ex3 : XC1, C35 → S3 : longi HA20 c_min,b = 20, c_min,dur = 10, c_min = 20, c_nom = 30 ; transv HA6 c_min,b = 6, c_min,dur = 10, c_nom = 20. Pour garantir 30 mm sur les HA20 il faut 30 − 6 = 24 mm sous les cadres → c_nom = 24 mm → cale réelle 25 mm (cales de 5 en 5 mm). e_h = 19 mm < 20 mm → PROBLÈME (trop juste) ; d = 339 mm. Variantes : 3HA20 9,42 ; 2HA25 9,82 ; 3HA16 + 3HA14 10,65 ; 3HA16 + 3HA12 9,42 cm². 3HA16 + 3HA12 : c_min,b 16, c_min,dur 10, c_nom 26 (transv 20) ; e_h,norme 20, e_h réel 30 mm ; d = 338 mm.
- Ex4 : 6 cm² → 4HA14 (6,16) ; 6HA12 (6,78) ; 2HA16 + 2HA14 (7,1) ; 2HA20 (6,28).
- Ex5 : XD1 (chlorures hors eau de mer, humidité modérée), C30 : c_min,dur = 35 ; c_nom = 45 mm ; e_h,norme = 20 mm. 2HA20 + 1HA14 « 9,36 cm² » ⚠ (réel 6,28 + 1,54 = 7,82 cm²) e_h 12 mm NON, d 389 ; 3HA12 + 3HA14 8,01 cm², e_h 18 NON, d 385 ; 4HA12 + 4HA10 7,67 cm², e_h 10 NON, d 385 ; 4HA16 8,04 cm², e_h 46 mm OK, d 385 mm.
