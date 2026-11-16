# RéviZ 🏗️

Appli de révision perso (PWA) pour iPhone : QCM par thème et par niveau, partiel blanc, contrôle sur table, historique. Première matière livrée : **STAB 1** (IUT La Rochelle, BUT GCCD S3).

Tout reste sur ton téléphone (IndexedDB) : pas de compte, pas de serveur. L'appli marche hors ligne une fois installée.

---

## Utiliser l'appli

### Réviser STAB 1
Onglet **Matières** → **STAB 1**, puis un mode :

| Mode | Pour quoi faire |
|---|---|
| 🎯 Entraînement par thème | choisir des thèmes, un niveau (★ à ★★★) et 10 / 20 / 30 questions, correction après chaque question |
| 🔁 Révision des erreurs | les questions ratées reviennent, puis s'espacent quand tu les réussis (1, 3, 7, 16 jours) |
| 🃏 Flash / Formules | réciter une formule, retourner la carte, dire si tu la savais |
| 📝 Partiel blanc | QCM au barème +2 / −1 / 0, exercices métal et bois (+ béton armé en option), chrono, note /20 |
| 🧮 Contrôle sur table | un calcul pas à pas avec des données tirées au hasard, chaque étape corrigée |
| ⚡ Mort subite | on s'arrête à la première erreur : bats ton record |

Les **sujets officiels** (QCM neige et vent A, partiel 2023) et la **fiche formulaire** sont sur la même page.

> 💡 Ajoute tes PDF de cours dans STAB 1 (section **Documents**) : les « 📖 Source : POLY_2026_metal.pdf p.23 » des corrections deviennent cliquables et ouvrent la bonne page.

### Ajouter une autre matière
1. **Matières** → **+ Nouvelle matière** : nom, icône, couleur, thèmes, barème.
2. Dans la matière, **+ Ajouter des documents** (PDF, photos, texte : depuis l'app Fichiers).
3. Ensuite, pour avoir des questions, trois façons :
   - **Gratuit** : **Importer du JSON / copier le prompt** → *Copier le prompt* → colle-le dans Claude (claude.ai) en joignant tes documents → copie la réponse de Claude → recolle-la dans l'appli → *Vérifier* → relis → *Ajouter à la banque*.
   - **Avec une clé API** : **Générer des QCM avec l'IA** (voir ci-dessous) : l'appli envoie elle-même tes documents et te montre le coût estimé avant.
   - **À la main** : **Écrire une question**.

Une matière perso a tous les modes sauf le contrôle sur table (qui demande des calculs programmés).

### Clé API Anthropic (optionnel)
1. Crée un compte sur <https://console.anthropic.com>, ajoute un moyen de paiement, puis **API Keys** → **Create Key**.
2. Dans l'appli : **Réglages** → **Génération IA** → colle la clé → **Enregistrer** → **Tester la clé** (le test ne coûte rien).
3. La clé reste sur ton téléphone. Elle n'est jamais mise dans les sauvegardes. Chaque génération est facturée sur ton compte Anthropic (le bouton **Estimer le coût** l'affiche avant l'envoi ; il dépend surtout du nombre de pages envoyées).

### Sauvegarder (important)
**Réglages** → **Sauvegarde** → **Exporter** → *Enregistrer dans Fichiers* (ou iCloud Drive). Coche « Inclure les fichiers des documents » si tu veux aussi garder tes PDF dans la sauvegarde. Un rappel s'affiche sur l'accueil si tu n'as pas sauvegardé depuis 7 jours.

Pour restaurer (nouveau téléphone, appli réinstallée) : **Importer** → choisis le fichier → **Fusionner** (ajoute sans rien effacer) ou **Remplacer** (repart de la sauvegarde).

### En cas de souci
- **« Nouvelle version disponible »** : touche *Recharger*. Elle ne s'affiche jamais pendant une série ou un partiel.
- **Un écran affiche « Oups, cet écran a planté »** : touche *Recharger*. Tes données ne sont pas touchées.
- **Mes données ont disparu** : iOS efface le stockage d'un site ouvert dans Safari mais peu utilisé, et celui d'une appli supprimée de l'écran d'accueil. Installe l'appli sur l'écran d'accueil (Réglages doit afficher « Stockage persistant : oui ») et exporte régulièrement.
- **La génération IA échoue** : le message dit pourquoi (clé refusée, limite atteinte, documents trop lourds…). Le mode gratuit (copier le prompt) marche toujours.
- **Une question est fausse** : *Signaler une erreur* sous la correction ; la liste est dans Réglages.

---

## Mettre l'appli en ligne (pas à pas, débutant)

### 1. Créer un compte et un dépôt GitHub
1. Crée un compte sur <https://github.com> si tu n'en as pas.
2. En haut à droite : **+** → **New repository**.
3. Nom : `reviz` (ou ce que tu veux). Laisse **Public** si ton offre GitHub ne permet pas Pages sur un dépôt privé (offre gratuite : Pages = dépôt public).
4. Ne coche rien d'autre → **Create repository**.

> ℹ️ Tes PDF de cours ne sont **pas** envoyés sur GitHub (ils sont exclus par `.gitignore`). Le dépôt public ne contient que le code et les questions.

### 2. Pousser le code
Dans un terminal ouvert dans le dossier `reviz` :

```bash
git remote add origin https://github.com/TON-PSEUDO/reviz.git
```

```bash
git push -u origin main
```

GitHub te demandera de te connecter la première fois (fenêtre du navigateur).

### 3. Activer GitHub Pages
1. Sur la page du dépôt : **Settings** → **Pages** (menu de gauche).
2. **Source** : choisis **GitHub Actions**.
3. Va dans l'onglet **Actions** : le workflow « Déployer sur GitHub Pages » tourne (2–3 min). S'il ne s'est pas lancé, clique dessus puis **Run workflow**.

### 4. Récupérer l'URL
Quand le workflow est vert, l'URL apparaît dans **Settings → Pages** : `https://TON-PSEUDO.github.io/reviz/`.

À chaque `git push` sur `main`, l'appli est reconstruite et mise à jour automatiquement (une bannière « Nouvelle version dispo → Recharger » s'affiche dans l'appli).

### 5. Installer sur l'iPhone
1. Ouvre l'URL dans **Safari** (pas Chrome : seul Safari sait installer une PWA sur iOS).
2. Touche **Partager** (carré avec une flèche vers le haut).
3. **Sur l'écran d'accueil** → **Ajouter**.
4. Ouvre RéviZ depuis son icône : plein écran, hors ligne.

> 💾 Pense à **exporter tes données** de temps en temps (Réglages) : si tu supprimes l'appli de l'écran d'accueil, iOS efface aussi son stockage.

### Alternative : Netlify ou Vercel (sans GitHub)
```bash
npm install
```

```bash
npm run build
```

Puis glisse-dépose le dossier `dist/` sur <https://app.netlify.com/drop> (ou importe le projet sur Vercel). L'appli est servie à la racine, rien à configurer.

---

## Développement

```bash
npm install
```

```bash
npm run dev
```

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur local (http://localhost:5173) |
| `npm run build` | build de production dans `dist/` |
| `npm test` | tests Vitest (générateurs de calcul, seed, banques, import, sauvegarde) |
| `npm run icons` | régénère les icônes PNG depuis le SVG |
| `npm run bank` | recompile la banque STAB 1 (`src/subjects/stab1/bank/*.ts` → `questions/*.json`, `flashcards.json`, `exams.json`) |
| `npm run audit:questions` | audit des banques (schéma, ids, explications, sources, répartition) |

### Modifier ou ajouter une question STAB 1
Les questions s'écrivent dans `src/subjects/stab1/bank/` (un fichier par bloc : `actions.ts`, `metal.ts`, `bois.ts`, `ba.ts`). Ajoute toujours **à la fin** d'un thème (les ids sont numérotés dans l'ordre), puis lance `npm run bank` et `npm run audit:questions`. L'appli met à jour les questions au prochain lancement sans toucher à l'historique.

Stack : Vite + React 18 + TypeScript strict, Tailwind, vite-plugin-pwa (Workbox), Dexie (IndexedDB), KaTeX, pdf.js, zod, React Router (hash), Vitest.

### Ajouter un contrôle sur table à une autre matière
Crée `src/subjects/<id>/generators/` sur le modèle de `src/subjects/stab1/generators/` (un générateur = tirage des données, énoncé, blocs Données, étapes de calcul), puis ajoute-le à `GENERATORS_BY_SUBJECT`. Le mode apparaît tout seul dans la matière.

Documents : `docs/NOTES_STAB1.md` (synthèse du cours), `DECISIONS.md` (choix faits).
