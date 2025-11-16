import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TabBar } from "@/components/TabBar";
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
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const hideTabBar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Events />} />
          <Route path="/playlist/:eventId" element={<Index />} />
          <Route path="/playlist/:eventId/track/:trackId" element={<TrackDetails />} />
          <Route path="/add" element={<AddTrackPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<SettingsProfile />} />
          <Route path="/settings/about" element={<SettingsAbout />} />
          <Route path="/settings/privacy" element={<SettingsPrivacy />} />
          <Route path="/settings/notifications" element={<SettingsNotifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideTabBar && <TabBar />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
