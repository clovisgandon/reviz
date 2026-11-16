import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '@/features/home/HomePage';
import { SubjectsPage } from '@/features/subjects/SubjectsPage';
import { SubjectPage } from '@/features/subjects/SubjectPage';
import { HistoryPage } from '@/features/history/HistoryPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { QuizSetupPage } from '@/features/quiz/QuizSetupPage';
import { QuizPage } from '@/features/quiz/QuizPage';
import { ResultsPage } from '@/features/results/ResultsPage';
import { FormulairePage } from '@/features/subjects/FormulairePage';
import { TableListPage } from '@/features/table/TableListPage';
import { TableExercisePage } from '@/features/table/TableExercisePage';
import { MockSetupPage } from '@/features/exam/MockSetupPage';
import { MockExamPage } from '@/features/exam/MockExamPage';
import { FlashPage } from '@/features/flash/FlashPage';
import { PageHeader } from '@/components/PageHeader';

/** Routage en mode hash (/#/...) : marche sur GitHub Pages sans configuration serveur. */
export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Écran de question en plein écran : actions principales en bas, sans barre d'onglets. */}
        <Route path="serie/:sessionId" element={<QuizPage />} />
        <Route path="table/:genId" element={<TableExercisePage />} />
        <Route path="partiel/:sessionId" element={<MockExamPage />} />
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="matieres" element={<SubjectsPage />} />
          <Route path="matieres/:subjectId" element={<SubjectPage />} />
          <Route path="matieres/:subjectId/entrainement" element={<QuizSetupPage />} />
          <Route path="matieres/:subjectId/formulaire" element={<FormulairePage />} />
          <Route path="matieres/:subjectId/table" element={<TableListPage />} />
          <Route path="matieres/:subjectId/partiel" element={<MockSetupPage />} />
          <Route path="matieres/:subjectId/flash" element={<FlashPage />} />
          <Route path="resultats/:attemptId" element={<ResultsPage />} />
          <Route path="historique" element={<HistoryPage />} />
          <Route path="reglages" element={<SettingsPage />} />
          <Route path="*" element={<PageHeader title="Page introuvable" back />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
