import { lazy, Suspense, type ComponentType } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '@/features/home/HomePage';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UpdateBanner } from '@/components/UpdateBanner';

/** Écran chargé à la demande (tout est précaché : ça marche aussi hors ligne). */
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => load().then((m) => ({ default: m[name] })));
}

const SubjectsPage = page(() => import('@/features/subjects/SubjectsPage'), 'SubjectsPage');
const SubjectPage = page(() => import('@/features/subjects/SubjectPage'), 'SubjectPage');
const SubjectEditPage = page(() => import('@/features/subjects/SubjectEditPage'), 'SubjectEditPage');
const FormulairePage = page(() => import('@/features/subjects/FormulairePage'), 'FormulairePage');
const HistoryPage = page(() => import('@/features/history/HistoryPage'), 'HistoryPage');
const SettingsPage = page(() => import('@/features/settings/SettingsPage'), 'SettingsPage');
const QuizSetupPage = page(() => import('@/features/quiz/QuizSetupPage'), 'QuizSetupPage');
const QuizPage = page(() => import('@/features/quiz/QuizPage'), 'QuizPage');
const ResultsPage = page(() => import('@/features/results/ResultsPage'), 'ResultsPage');
const TableListPage = page(() => import('@/features/table/TableListPage'), 'TableListPage');
const TableExercisePage = page(() => import('@/features/table/TableExercisePage'), 'TableExercisePage');
const MockSetupPage = page(() => import('@/features/exam/MockSetupPage'), 'MockSetupPage');
const MockExamPage = page(() => import('@/features/exam/MockExamPage'), 'MockExamPage');
const FlashPage = page(() => import('@/features/flash/FlashPage'), 'FlashPage');
const DocumentViewerPage = page(() => import('@/features/documents/DocumentViewerPage'), 'DocumentViewerPage');
const ImportPage = page(() => import('@/features/generation/ImportPage'), 'ImportPage');
const GeneratePage = page(() => import('@/features/generation/GeneratePage'), 'GeneratePage');
const BankPage = page(() => import('@/features/generation/BankPage'), 'BankPage');
const QuestionEditPage = page(() => import('@/features/generation/BankPage'), 'QuestionEditPage');

// Écrans plein écran : la bannière de mise à jour ne doit pas couvrir leurs boutons (ni interrompre un partiel).
const FULLSCREEN = /^\/(serie|partiel|table|document)\//;

function Shell() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
        <Routes>
          {/* Écran de question en plein écran : actions principales en bas, sans barre d'onglets. */}
          <Route path="serie/:sessionId" element={<QuizPage />} />
          <Route path="table/:genId" element={<TableExercisePage />} />
          <Route path="partiel/:sessionId" element={<MockExamPage />} />
          <Route path="document/:docId" element={<DocumentViewerPage />} />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="matieres" element={<SubjectsPage />} />
            <Route path="matieres/nouvelle" element={<SubjectEditPage />} />
            <Route path="matieres/:subjectId" element={<SubjectPage />} />
            <Route path="matieres/:subjectId/modifier" element={<SubjectEditPage />} />
            <Route path="matieres/:subjectId/entrainement" element={<QuizSetupPage />} />
            <Route path="matieres/:subjectId/formulaire" element={<FormulairePage />} />
            <Route path="matieres/:subjectId/table" element={<TableListPage />} />
            <Route path="matieres/:subjectId/partiel" element={<MockSetupPage />} />
            <Route path="matieres/:subjectId/flash" element={<FlashPage />} />
            <Route path="matieres/:subjectId/importer" element={<ImportPage />} />
            <Route path="matieres/:subjectId/generer" element={<GeneratePage />} />
            <Route path="matieres/:subjectId/questions" element={<BankPage />} />
            <Route path="matieres/:subjectId/question/:questionId" element={<QuestionEditPage />} />
            <Route path="resultats/:attemptId" element={<ResultsPage />} />
            <Route path="historique" element={<HistoryPage />} />
            <Route path="reglages" element={<SettingsPage />} />
            <Route path="*" element={<PageHeader title="Page introuvable" back />} />
          </Route>
        </Routes>
      </Suspense>
      {/* Toujours monté : le service worker est enregistré quel que soit l'écran d'arrivée. */}
      <UpdateBanner hidden={FULLSCREEN.test(pathname)} />
    </ErrorBoundary>
  );
}

/** Routage en mode hash (/#/...) : marche sur GitHub Pages sans configuration serveur. */
export function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
