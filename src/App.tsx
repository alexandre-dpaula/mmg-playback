import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { clearOldCaches } from "@/lib/preferences";
import Events from "./pages/Events";
import Index from "./pages/Index";
import AddTrackPage from "./pages/AddTrack";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import SettingsAbout from "./pages/SettingsAbout";
import SettingsPrivacy from "./pages/SettingsPrivacy";
import SettingsNotifications from "./pages/SettingsNotifications";
import TrackDetails from "./pages/TrackDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SettingsProfile from "./pages/SettingsProfile";
import Members from "./pages/Members";
import RoleSelection from "./pages/RoleSelection";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RefreshProvider } from "./context/RefreshContext";
import OnboardingChurchWizard from "./pages/OnboardingChurchWizard";
import Dashboard from "./pages/Dashboard";
import StudyModePage from "./features/study-mode/StudyModePage";
import ChordStudyPage from "./features/study-mode/ChordStudyPage";
import StudyCagedView from "./features/study-mode/StudyCagedView";
import ChordLibrary from "./features/study-mode/ChordLibrary";
import ReharmonizationPage from "./pages/ReharmonizationPage";
import ProModePage from "./pages/ProModePage";
import InstrumentTechniquesPage from "./pages/InstrumentTechniquesPage";
import MateusAsatoStudyPage from "./pages/MateusAsatoStudyPage";
import StudiesHub from "./pages/StudiesHub";
import TesteCifras from "./pages/TesteCifras";
import LibrarySearchPage from "./pages/LibrarySearchPage";
import DrumLessonPage from "./pages/DrumLessonPage";
import DrumViradasPage from "./pages/DrumViradasPage";
import DrumFlamPage from "./pages/DrumFlamPage";
import DrumBondadeDeDeusPage from "./pages/DrumBondadeDeDeusPage";
import DrumDominaParadiddleInwardPage from "./pages/DrumDominaParadiddleInwardPage";
import DrumTecnicaChimbalGroovePage from "./pages/DrumTecnicaChimbalGroovePage";
import BassFrasesPage from "./pages/BassFrasesPage";
import BassSlapPage from "./pages/BassSlapPage";
import BassDominandoBracoPage from "./pages/BassDominandoBracoPage";
import KeyboardEmprestimoModalPage from "./pages/KeyboardEmprestimoModalPage";
import KeyboardAcordesPassagemPage from "./pages/KeyboardAcordesPassagemPage";
import KeyboardRearmonizacao251Sub5Page from "./pages/KeyboardRearmonizacao251Sub5Page";
import KeyboardAcordesRelativosPage from "./pages/KeyboardAcordesRelativosPage";
import GuitarVocabularioPage from "./pages/GuitarVocabularioPage";
import GuitarTecnicaMateusAsatoPage from "./pages/GuitarTecnicaMateusAsatoPage";
import GuitarLickMateusAsatoPage from "./pages/GuitarLickMateusAsatoPage";
import GuitarEntendaModosGregosPage from "./pages/GuitarEntendaModosGregosPage";
import VocalTreinoVocalDiarioPage from "./pages/VocalTreinoVocalDiarioPage";
import VocalAquecimentoVocalPage from "./pages/VocalAquecimentoVocalPage";
import VocalTratandoAVozPage from "./pages/VocalTratandoAVozPage";
import VocalCantarEmocaoOuTecnicaPage from "./pages/VocalCantarEmocaoOuTecnicaPage";
import VocalComoComecarACantarPage from "./pages/VocalComoComecarACantarPage";
import VocalExerciciosRespiracaoPage from "./pages/VocalExerciciosRespiracaoPage";
import VocalRegistrosVocaisPage from "./pages/VocalRegistrosVocaisPage";
import CustomLessonPage from "./pages/CustomLessonPage";

const queryClient = new QueryClient();

const LeaderOnlyRoute = () => {
  const { profile, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <p className="text-sm text-white/60">Carregando...</p>
      </div>
    );
  }
  if (profile.role !== "lider") {
    return <Navigate to="/" replace />;
  }
  return <OnboardingChurchWizard />;
};

const AppRoutes = () => {
  const location = useLocation();
  const showNav =
    location.pathname !== "/login" &&
    location.pathname !== "/register" &&
    location.pathname !== "/role-selection" &&
    location.pathname !== "/waiting-invitation";

  // Esconde navegação na página de cifras (TrackDetails), modo de estudos e dashboard
  const isTrackDetailsPage = location.pathname.includes("/track/");
  const isStudyModePage = location.pathname.includes("/study/");
  const isDashboardPage = location.pathname === "/" || location.pathname === "/dashboard";
  const isLibrarySearchPage = location.pathname === "/cifraclub-search";
  const isProModePage = location.pathname === "/study/pro";

  const mobileNavOffsetClass = showNav && !isTrackDetailsPage && !isStudyModePage && !isDashboardPage && !isLibrarySearchPage
    ? "pt-[calc(60px+1rem+env(safe-area-inset-top,0px))] md:pt-0"
    : "";

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen max-w-screen overflow-x-hidden bg-[#121212]">
      {showNav && !isTrackDetailsPage && !isStudyModePage && !isDashboardPage && !isLibrarySearchPage && <Sidebar />}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 overflow-hidden md:overflow-y-auto">
        {showNav && !isTrackDetailsPage && !isStudyModePage && !isDashboardPage && !isLibrarySearchPage && <MobileNav />}
        <main className={`flex-1 overflow-y-auto w-full ${mobileNavOffsetClass}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/studies" element={<StudiesHub />} />
                  <Route path="/study/caged" element={<StudyCagedView />} />
                  <Route path="/study/library" element={<ChordLibrary />} />
                  <Route path="/study/reharmonization" element={<ReharmonizationPage />} />
                  <Route path="/study/pro" element={<ProModePage />} />
                  <Route path="/study/pro/:instrumentId" element={<InstrumentTechniquesPage />} />
                  <Route path="/study/pro/:instrumentId/:lessonId" element={<CustomLessonPage />} />
                  <Route path="/study/pro/mateus-asato/domine-o-braco" element={<MateusAsatoStudyPage />} />
                  <Route path="/study/pro/drums/tribal" element={<DrumLessonPage />} />
                  <Route path="/study/pro/drums/viradas" element={<DrumViradasPage />} />
                  <Route path="/study/pro/drums/flam" element={<DrumFlamPage />} />
                  <Route path="/study/pro/drums/bondade-de-deus" element={<DrumBondadeDeDeusPage />} />
                  <Route path="/study/pro/drums/domina-paradiddle-inward" element={<DrumDominaParadiddleInwardPage />} />
                  <Route path="/study/pro/drums/tecnica-chimbal-groove" element={<DrumTecnicaChimbalGroovePage />} />
                  <Route path="/study/pro/bass/frases-efesios-6" element={<BassFrasesPage />} />
                  <Route path="/study/pro/bass/slap-groove" element={<BassSlapPage />} />
                  <Route path="/study/pro/bass/dominando-braco-baixo" element={<BassDominandoBracoPage />} />
                  <Route path="/study/pro/guitar/vocabulario-guitarra" element={<GuitarVocabularioPage />} />
                  <Route path="/study/pro/guitar/tecnica-mateus-asato" element={<GuitarTecnicaMateusAsatoPage />} />
                  <Route path="/study/pro/guitar/lick-mateus-asato" element={<GuitarLickMateusAsatoPage />} />
                  <Route path="/study/pro/guitar/entenda-modos-gregos" element={<GuitarEntendaModosGregosPage />} />
                  <Route path="/study/pro/keyboard/emprestimo-modal" element={<KeyboardEmprestimoModalPage />} />
                  <Route path="/study/pro/keyboard/acordes-passagem" element={<KeyboardAcordesPassagemPage />} />
                  <Route path="/study/pro/keyboard/rearmonizacao-251-sub5" element={<KeyboardRearmonizacao251Sub5Page />} />
                  <Route path="/study/pro/keyboard/acordes-relativos" element={<KeyboardAcordesRelativosPage />} />
                  <Route path="/study/pro/vocal/treino-vocal-diario" element={<VocalTreinoVocalDiarioPage />} />
                  <Route path="/study/pro/vocal/aquecimento-vocal" element={<VocalAquecimentoVocalPage />} />
                  <Route path="/study/pro/vocal/tratando-a-voz" element={<VocalTratandoAVozPage />} />
                  <Route path="/study/pro/vocal/cantar-emocao-ou-tecnica" element={<VocalCantarEmocaoOuTecnicaPage />} />
                  <Route path="/study/pro/vocal/como-comecar-a-cantar" element={<VocalComoComecarACantarPage />} />
                  <Route path="/study/pro/vocal/exercicios-respiracao" element={<VocalExerciciosRespiracaoPage />} />
                  <Route path="/study/pro/vocal/registros-vocais" element={<VocalRegistrosVocaisPage />} />
                  <Route path="/teste-cifras" element={<TesteCifras />} />
                  <Route path="/cifraclub-search" element={<LibrarySearchPage />} />
                  <Route path="/playlist/:eventId" element={<Index />} />
                  <Route
                    path="/playlist/:eventId/track/:trackId"
                    element={<TrackDetails />}
                  />
                  <Route path="/study/:songId" element={<StudyModePage />} />
                  <Route path="/chord-study/:chordName" element={<ChordStudyPage />} />
                  <Route path="/add" element={<AddTrackPage />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/profile" element={<SettingsProfile />} />
                  <Route path="/settings/about" element={<SettingsAbout />} />
                  <Route path="/settings/privacy" element={<SettingsPrivacy />} />
                  <Route
                    path="/settings/notifications"
                    element={<SettingsNotifications />}
                  />
                  <Route
                    path="/onboarding/igreja"
                    element={<LeaderOnlyRoute />}
                  />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    clearOldCaches();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RefreshProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </RefreshProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
