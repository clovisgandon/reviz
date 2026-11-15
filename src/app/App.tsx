import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '@/features/home/HomePage';
import { SubjectsPage } from '@/features/subjects/SubjectsPage';
import { SubjectPage } from '@/features/subjects/SubjectPage';
import { HistoryPage } from '@/features/history/HistoryPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { PageHeader } from '@/components/PageHeader';

/** Routage en mode hash (/#/...) : marche sur GitHub Pages sans configuration serveur. */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="matieres" element={<SubjectsPage />} />
          <Route path="matieres/:subjectId" element={<SubjectPage />} />
          <Route path="historique" element={<HistoryPage />} />
          <Route path="reglages" element={<SettingsPage />} />
          <Route path="*" element={<PageHeader title="Page introuvable" back />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
