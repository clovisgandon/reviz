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

## Étape 3 — Moteur QCM (2026-11-16)

- **Notation** : `multi` en tout-ou-rien ; `order` = ordre exact ; `numeric` = tolérance relative (celle de la question, sinon le réglage, 2 % par défaut), saisie acceptant la virgule et les espaces. Entraînement : 1 pt / 0 / 0. Barème du partiel (+2/−1/0) prévu dans l'état de série (`scoring`) pour l'étape 6. Note /20 bornée à [0 ; 20] même si le total est négatif.
- **Tirage** : priorité aux questions jamais vues, puis mélange ; seed reproductible. Choix de réponse mélangés une fois par série (sauf Vrai/Faux).
- **Séries sauvegardées** à chaque réponse dans la table `sessions` → le bouton « Continuer » de l'accueil reprend la dernière série ; quitter (✕) ne perd rien.
- **Écran de question** hors de la barre d'onglets (plein écran, boutons Valider / Je ne sais pas en bas pour le pouce).
- **Correction** : repliée si juste, dépliée si faux ; bonne réponse en vert (✅ + texte), ta réponse fausse en rouge (❌ + texte), explication du distracteur choisi (`wrongChoiceHints`), sources. La source n'est pas encore cliquable (visionneuse PDF à l'étape 7).
- **Rendu Markdown + KaTeX maison** (pas de dépendance Markdown, pas de HTML brut) : paragraphes, listes, gras/italique, code, `$…$`, `$$…$$`.
- **Mise à jour des banques** : la version des contenus intégrés est une empreinte du JSON (plus besoin d'incrémenter un numéro à la main).
- **Mode « Mort subite »** branché dès maintenant (toutes les questions mélangées, arrêt à la première erreur ou « Je ne sais pas »). Le record sera affiché à l'étape 6.
- **8 questions réelles** (5 types) servent de test ; ce sont les premières de la banque de l'étape 4 (dont la question C_pe à 34° avec la correction de l'erreur du corrigé).

## Étape 4 — Banque STAB 1 (2026-11-16)

- **Écriture en TypeScript, livraison en JSON** : les questions sont rédigées dans `src/subjects/stab1/bank/*.ts` (fonctions `single`, `multi`, `tf`, `num`, `order`) et compilées par `npm run bank` en `questions/<thème>.json` (format §7, validé par zod). Avantage : les **valeurs numériques sont calculées par le code** à partir des tableaux du cours (`formulaire/tables.ts`) au lieu d'être tapées à la main → pas d'erreur d'arithmétique, et l'explication affiche les mêmes nombres.
- **Ids stables** `stab1-<thème>-<n°>` dans l'ordre d'écriture ; les 8 questions de l'étape 3 gardent leurs ids. Un id automatique déjà pris reçoit le suffixe « b ». Règle : toujours ajouter en fin de thème.
- **Niveaux** : 29 questions calculatoires à plusieurs étapes sont classées ★★★ via une liste (`LEVEL3` dans `bank/helpers.ts`) pour atteindre 37 / 43 / 20 %.
- **Contenu** : 314 questions (13 à 27 par thème), 152 « style examen », 67 cartes Flash ; tous les blocs Données nécessaires (catalogue, k_mod, neige, c_pe, flèches limites, sections d'acier, c_min,dur) sont joints aux questions. Sources = fichier + page ; valeurs hors cours marquées « valeur EC standard, non trouvée dans le cours ».
- **Sujets officiels** : « QCM neige et vent – A » (11 questions dans l'ordre, propositions non mélangées, +2/−1/0, chrono 15 min, correction à la fin) et « Partiel 2023 » (20 questions taguées `partiel-2023`, correction immédiate en attendant le contrôle sur table de l'étape 5). Les sujets sont résolus dans `exams.json`.
- **Nouvelle erreur trouvée** dans le corrigé TD garage (p.20) : flexion déviée IPE 120 = 0,87 et non 0,74 (voir NOTES §20).
- **Questions TD5 Q2/Q3 et TD6** : pas de corrigé fourni → valeurs calculées avec la méthode du TD5, signalées comme telles.
- **Fiche formulaire** consultable depuis la page de la matière (formules KaTeX + tableaux + catalogues complets).
- **Chargement différé** des banques JSON (chunks séparés, précachés) : bundle principal 607 kB (194 kB gzip).
- L'audit tourne aussi dans la GitHub Action avant chaque déploiement.

## Étape 5 — Contrôle sur table (2026-11-16)

- **16 générateurs** (`src/subjects/stab1/generators/`) : A1 neige, A2 vent, A3 combinaisons ; M1 panne IPE, M2 tirant, M3 flexion déviée, M4 traction/compression ; B1 solive, B2 combinaison dimensionnante, B3 tirant bois, B4 flexion déviée bois ; BA1 matériaux, BA2 enrobage, BA3 ancrage, BA4 flexion simple, BA5 poteau.
- **Architecture** : un générateur = tirage de paramètres (seed reproductible, `?seed=` dans l'URL) + énoncé + blocs Données + liste d'étapes. Chaque étape calcule sa valeur attendue à partir des étapes précédentes ; `solve()` déroule la chaîne. Pour une autre matière : créer `subjects/<id>/generators` et l'ajouter à `GENERATORS_BY_SUBJECT`.
- **Propagation d'erreur** : par défaut la suite utilise la bonne valeur ; case « continuer avec ma valeur » pour suivre son propre calcul.
- **Barème** : 1 point par étape, −0,5 si l'indice (formule) a été affiché, 0 si faux ou « Je ne sais pas » ; note /20 enregistrée dans l'historique (mode `table`) avec la seed pour refaire le même sujet.
- **Cas officiels** jouables (« 📄 ») et testés par Vitest à 1 % près : partiel 2023 métal (avec I_y imposé, puis avec la vraie inertie) et bois, TD garage (tirant, flexion déviée, panne bois, tirant bois, combinaisons, neige), cours (vent La Rochelle, neige toit plat), TD1 à TD5 de BA. 200 tirages aléatoires par générateur sont aussi testés (pas de valeur invalide).
- **Partiel 2023 métal** : M_Ed est recalculé (3,1 × 5,5²/8 = 11,72 kN·m) ; la tolérance de 2 % accepte aussi le 11,6 de l'énoncé.
- **Poteaux (BA5)** : A_s calculé avec la vraie équation du 2e degré (k_h dépend de A_s), qui donne les 8,56 cm² que le corrigé TD4 annonce comme solution exacte ; le corrigé affiche aussi 9,6 cm² avec un k_h approché.
- **Cornières L25×3 et L30×3** (M2) : aires catalogue standard, absentes du poly (signalé dans le bloc Données).
- **A3** : le soulèvement est calculé avec le W⁻ = −0,45 kN/m² retenu par le corrigé (le corrigé, lui, utilise −0,52 par erreur et trouve −0,905).

## Étape 6 — Partiel blanc, répétition espacée, statistiques (2026-11-16)

- **Répétition espacée** (`lib/srs.ts`) : Leitner à 5 boîtes, intervalles 0 / 1 / 3 / 7 / 16 jours. Une réponse fausse renvoie en boîte 1 (à revoir tout de suite), une juste fait monter d'une boîte. Mis à jour à la fin de chaque série, partiel blanc compris. « Révision de mes erreurs » (accueil et page matière) = jusqu'à 20 questions dues, les boîtes basses d'abord.
- **Partiel blanc** : 10 questions de QCM (la question « cocher A » en premier, puis un plan par thème) + exercice métal M1 + exercice bois B1, + un exercice BA tiré parmi BA2 à BA5 si l'option est cochée. Barème /20 : QCM 6, métal 5, bois 5, BA 4 ; sans BA : 8 / 6 / 6. Le QCM est noté +2/−1/0 (réglable), ramené à son poids, plancher 0 ; chaque exercice = étapes justes / étapes × poids. Le tout sur une seule page comme sur table, sauvegarde automatique, chrono (90 min par défaut) qui rend la copie à la fin.
- **Partiel 2023 original** jouable : QCM A + cas officiels M1 et B1, poids 8 / 6 / 6.
- **Correction** : note par partie, comparaison avec le partiel précédent et la moyenne, courbe des notes, corrigé pas à pas de chaque exercice (même vue que le contrôle sur table).
- **Flash** : choix des thèmes, carte à retourner, « Je savais / Je ne savais pas » ; une carte ratée revient une fois à la fin ; seul le premier passage compte dans l'historique.
- **Mort subite** : le record (nombre de bonnes réponses d'affilée) est affiché sur la page matière.
- **Graphiques** faits main en SVG (pas de bibliothèque) : courbe des notes /20, barres des questions par jour, carte de réussite par thème (une seule teinte, valeur écrite dans chaque case, gris = pas travaillé). Une série par graphique, donc pas de légende ; info-bulle au toucher. Filtres période / matière / mode sur une rangée au-dessus.
- **Réglages** : durée du partiel blanc et option béton armé par défaut.

## Reste à faire (étapes suivantes)

Étape 7 : matières personnalisées (documents, lecteur PDF, import JSON, prompt à copier, génération par IA). Étape 8 : finitions, export / import, hors ligne. Étape 9 : vérification finale.
