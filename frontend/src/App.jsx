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
import IdentityPage from './features/student/IdentityPage.jsx';
import StudentSwitchPage from './features/student/StudentSwitchPage.jsx';
import ProfilePage from './features/student/ProfilePage.jsx';
import { useStudentSession, RequireStudent } from './features/student/session.jsx';
import { useAudioSync } from './audio/index.js';
import DashboardPage from './features/home/DashboardPage.jsx';
import MaterialsPage from './features/learn/MaterialsPage.jsx';
import AssistantPage from './features/assistant/AssistantPage.jsx';
import ProgressPage from './features/progress/ProgressPage.jsx';
import GamesHubPage from './features/games/GamesHubPage.jsx';
import QuizGamePage from './features/games/QuizGamePage.jsx';
import MatchGamePage from './features/games/MatchGamePage.jsx';
import AchievementsPage from './features/achievements/AchievementsPage.jsx';
import LeaderboardPage from './features/leaderboard/LeaderboardPage.jsx';

// Modul Guru dimuat terpisah agar tidak menambah muatan awal untuk siswa.
const TeacherPage = lazy(() => import('./features/teacher/TeacherPage.jsx'));

export default function App() {
  useApplySettings();
  useStudentSession(); // muat progres siswa aktif (progres terpisah per siswa)
  useAudioSync(); // musik per halaman + efek suara (aktif setelah interaksi pertama)
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        {/* Alur: pembuka → identitas → perkenalan → peta → pulau → misi → profil/progres */}
        <Route path="/identitas" element={<IdentityPage />} />
        <Route path="/siswa" element={<StudentSwitchPage />} />
        <Route path="/mulai" element={<RequireStudent><OnboardingPage /></RequireStudent>} />
        <Route path="/peta" element={<RequireStudent><MapPage /></RequireStudent>} />
        <Route path="/belajar/:worldId" element={<RequireStudent><LessonPage /></RequireStudent>} />
        <Route path="/kuis/:worldId" element={<RequireStudent><QuizPage /></RequireStudent>} />
        <Route path="/profil" element={<RequireStudent><ProfilePage /></RequireStudent>} />
        {/* Menu utama (⋮): beranda, belajar, game, prestasi */}
        <Route path="/beranda" element={<RequireStudent><DashboardPage /></RequireStudent>} />
        <Route path="/materi" element={<RequireStudent><MaterialsPage /></RequireStudent>} />
        <Route path="/asisten" element={<RequireStudent><AssistantPage /></RequireStudent>} />
        <Route path="/progres" element={<RequireStudent><ProgressPage /></RequireStudent>} />
        <Route path="/game" element={<RequireStudent><GamesHubPage /></RequireStudent>} />
        <Route path="/game/cepat-tepat" element={<RequireStudent><QuizGamePage key="cepat-tepat" mode="cepat-tepat" /></RequireStudent>} />
        <Route path="/game/latihan" element={<RequireStudent><QuizGamePage key="latihan" mode="latihan" /></RequireStudent>} />
        <Route path="/game/pasangkan" element={<RequireStudent><MatchGamePage /></RequireStudent>} />
        <Route path="/peringkat" element={<RequireStudent><LeaderboardPage /></RequireStudent>} />
        <Route path="/pencapaian" element={<RequireStudent><AchievementsPage /></RequireStudent>} />
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
