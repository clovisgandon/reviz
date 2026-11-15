# RéviZ 🏗️

Appli de révision perso (PWA) pour iPhone : QCM par thème et par niveau, partiel blanc, contrôle sur table, historique. Première matière livrée : **STAB 1** (IUT La Rochelle, BUT GCCD S3).

Tout reste sur ton téléphone (IndexedDB) : pas de compte, pas de serveur. L'appli marche hors ligne une fois installée.

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
| `npm test` | tests Vitest (générateurs de calcul, seed, banques) |
| `npm run icons` | régénère les icônes PNG depuis le SVG |
| `npm run audit:questions` | audit des banques de questions (à partir de l'étape 4) |

Stack : Vite + React 18 + TypeScript strict, Tailwind, vite-plugin-pwa (Workbox), Dexie (IndexedDB), KaTeX, React Router (hash), Vitest.

Documents : `docs/NOTES_STAB1.md` (synthèse du cours), `DECISIONS.md` (choix faits).
