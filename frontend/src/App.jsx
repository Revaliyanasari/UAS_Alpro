import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast.jsx';
import { useApplySettings } from './hooks/useApplySettings.js';
import WelcomePage from './features/welcome/WelcomePage.jsx';
import OnboardingPage from './features/onboarding/OnboardingPage.jsx';
import MapPage from './features/map/MapPage.jsx';
import LessonPage from './features/lesson/LessonPage.jsx';
import QuizPage from './features/quiz/QuizPage.jsx';
import NotFoundPage from './features/home/NotFoundPage.jsx';
import CheckerLabPage from './features/lab/CheckerLabPage.jsx';
import CatalogPage from './features/catalog/CatalogPage.jsx';
import SettingsPage from './features/settings/SettingsPage.jsx';
import TataGalleryPage from './features/tata-gallery/TataGalleryPage.jsx';

// Modul Guru dimuat terpisah agar tidak menambah muatan awal untuk siswa.
const TeacherPage = lazy(() => import('./features/teacher/TeacherPage.jsx'));

export default function App() {
  useApplySettings();
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/mulai" element={<OnboardingPage />} />
        <Route path="/peta" element={<MapPage />} />
        <Route path="/belajar/:worldId" element={<LessonPage />} />
        <Route path="/kuis/:worldId" element={<QuizPage />} />
        <Route path="/pengaturan" element={<SettingsPage />} />
        <Route path="/tata" element={<TataGalleryPage />} />
        <Route
          path="/guru"
          element={
            <Suspense fallback={null}>
              <TeacherPage />
            </Suspense>
          }
        />
        <Route path="/lab" element={<CheckerLabPage />} />
        <Route path="/katalog" element={<CatalogPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ToastProvider>
  );
}
