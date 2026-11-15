# DECISIONS — RéviZ

Choix faits en autonomie, à relire. Le plus récent en bas de chaque section.

## Étape 1 — Lecture des sources (2026-11-15)

- **Emplacement des PDF** : les 13 fichiers ont été trouvés dans `Downloads\STAB\` et copiés dans `docs/stab1/` sous les noms du prompt (espaces → `_`). Le mémo est renommé `MEMO_STAB_BM_EC3_EC5_2022.pdf` (le « & » du nom original posait problème) ; dans l'appli, la source affichée gardera le nom long `MEMO - STAB - BM - Justification des éléments simples aux EUROCODES 3 & 5 2022.pdf`.
- **PDF hors de Git** : `docs/stab1/*.pdf` est dans `.gitignore`. Ce sont des documents de cours de l'IUT ; avec GitHub Pages sur un dépôt public ils deviendraient publics. Les explications citeront le nom du fichier et la page ; la copie dans `public/docs/stab1/` (visionneuse) sera optionnelle et documentée dans le README.
- **Numérotation des pages** : partout = numéro de page du PDF (pour le poly et le corrigé TD, il coïncide avec le « x/45 » / « x/44 » imprimé).
- **Masse volumique de l'air** : le cours utilise ρ = 1,25 (p.47) puis 1,225 kg/m³ (p.58). Retenu : **1,225** (EC) ; les questions sur La Rochelle acceptent 0,414 et 0,422 kN/m² et l'explication signale l'écart.
- **QCM neige et vent A, question C_pe à 34°** : le corrigé officiel interpole à 41° (→ −0,13). Retenu : **−0,37 et +0,7** ; le sujet fixe garde la question telle quelle mais la correction explique l'erreur du corrigé.
- **Partiel 2023, flèche métal** : on garde I_y = 1200 cm⁴ de l'énoncé pour la réponse « officielle » et on montre le calcul avec I_y réel (IPE 120 = 317,8 cm⁴ → ne passe pas ; **IPE 140 suffit**, contrairement à « IPE 160 » écrit dans le prompt).
- **Partiel 2023, bois** : M_Ed = 11,88 kN·m inclut le poids propre (ρ_mean GL24h = 420 kg/m³) ; flèches recalculées avec le poids propre (U_inst,Q = 10,98 mm ; W_net,fin = 23,1 mm).
- **Coquilles des corrigés** : listées dans `docs/NOTES_STAB1.md` §20 ; les questions utilisent la valeur correcte et le disent dans l'explication.

## Formules BA non trouvées dans les documents (cours BA absent)

Les corrigés de TD donnent les valeurs mais pas toujours la formule. Formules prises dans l'**EC2 standard / AN française** et marquées `note: "valeur EC standard, non trouvée dans le cours"` dans les sources :

- Flexion simple : α_yd = 3,5/(3,5 + 1000 ε_yd), μ_cu,yd = 0,8 α_yd (1 − 0,4 α_yd), α_u = 1,25(1 − √(1 − 2μ)), z = d(1 − 0,4α_u), β = (1 + √(1 − 2μ))/2 (cohérentes avec les valeurs du corrigé TD5).
- Section minimale A_s,min = max(0,26 f_ctm/f_yk · b d ; 0,0013 b d), A_s,max = 0,04 A_c.
- Poteaux, méthode simplifiée : N_Rd = α k_h k_s (b h f_cd + A_s f_yd), α = 0,86/(1 + (λ/62)²) (λ ≤ 60) ou (32/λ)^1,3, k_h = (0,75 + 0,5h)(1 − 6ρδ), k_s ; A_s,min = max(0,10 N_Ed/f_yd ; 0,002 A_c) ; s_cl,t,max = min(20 φ_L ; b ; 400).
- Longueur de flambement d'un poteau contreventé l_0 = 0,5 l √((1 + k1/(0,45 + k1))(1 + k2/(0,45 + k2))).
- Ancrages : l_b,min = max(0,3 l_b,rqd ; 10φ ; 100 mm) ; mandrins 4φ (φ ≤ 16) / 7φ (φ > 16).
- Modulations de classe structurale (tableau 4.3NF) et définitions des classes d'exposition XC/XD/XS/XF.
- Diagramme parabole-rectangle (ε_c2 = 2 ‰, ε_cu2 = 3,5 ‰) et rectangle simplifié (λ = 0,8, η = 1) : cités dans le corrigé TD1, sans référence de cours.

## Étape 2 — Squelette (2026-11-15)

- **Versions figées** (exactes, pas de `^`) : Vite 5.4, React 18.3, TypeScript 5.6, Tailwind **3.4** (config JS classique, plus simple que la v4), vite-plugin-pwa 0.21, Dexie 4.0, React Router 6.28 (HashRouter), Vitest 2.1.
- **Base GitHub Pages** : `vite.config.ts` lit `VITE_BASE` ; le workflow le fixe à `/<nom-du-repo>/` automatiquement → rien à modifier si le dépôt est renommé. En local et sur Netlify/Vercel : `/`.
- **Service worker** en mode `prompt` : l'utilisateur choisit quand recharger (bannière « Nouvelle version dispo → Recharger »), pour ne jamais couper un partiel blanc en cours. Vérification de mise à jour toutes les heures.
- **Précache** : JS, CSS, HTML, icônes, polices KaTeX woff2 et JSON → hors ligne complet (vérifié : appli rechargée serveur arrêté).
- **Thème** : stocké en `localStorage` (petit réglage d'affichage, lu avant le premier rendu pour éviter le flash) ; tous les autres réglages sont dans IndexedDB (table `settings`).
- **Seed** : `seedBuiltins` installe STAB 1 et fusionne les banques intégrées par `id` à chaque nouvelle `BUILTIN_VERSION`, sans toucher à l'historique ni aux questions perso (testé avec fake-indexeddb).
- **Icônes** : générées par `npm run icons` (SVG → PNG avec sharp) ; l'icône Apple n'a pas de coins arrondis (iOS les ajoute).
- **Identité Git** : configurée localement au dépôt (nom + e-mail de l'étudiant) car aucune identité globale n'existait.

## Reste à faire (étapes suivantes)

Voir le plan du prompt §12 : squelette Vite/React/PWA, moteur QCM, banque STAB 1, générateurs, partiel blanc, matières perso, finitions, vérification.
