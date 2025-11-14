import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TabBar } from "@/components/TabBar";
import Events from "./pages/Events";
import Index from "./pages/Index";
import AddTrackPage from "./pages/AddTrack";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import SettingsAbout from "./pages/SettingsAbout";
import TrackDetails from "./pages/TrackDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/playlist/:eventId" element={<Index />} />
          <Route path="/playlist/:eventId/track/:trackId" element={<TrackDetails />} />
          <Route path="/add" element={<AddTrackPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/about" element={<SettingsAbout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <TabBar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
