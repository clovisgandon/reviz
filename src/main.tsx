import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './index.css';
import { App } from './app/App';
import { db } from './db/db';
import { seedBuiltins } from './db/seed';
import { requestPersistentStorage } from './lib/platform';
import { applyTheme, getThemeMode } from './lib/theme';

applyTheme(getThemeMode());
// Limite le risque qu'iOS efface les données (IndexedDB) de l'appli.
void requestPersistentStorage();
// Installe / met à jour STAB 1 et ses banques de questions (merge par id).
seedBuiltins(db).catch((e) => console.error('Seed impossible', e));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
