import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Plus, Settings, Music2, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSelectedEventId,
  onSelectedEventChange,
  SELECTED_EVENT_STORAGE_KEY,
} from "@/lib/preferences";
import { useRefresh } from "@/context/RefreshContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [playlistPath, setPlaylistPath] = React.useState("/playlist/repertorio");
  const { triggerRefresh } = useRefresh();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const updatePath = () => {
      const stored = getSelectedEventId();
      setPlaylistPath(stored ? `/playlist/${stored}` : "/playlist/repertorio");
    };
    updatePath();
    const unsubscribe = onSelectedEventChange(updatePath);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SELECTED_EVENT_STORAGE_KEY) {
        updatePath();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const tabs = [
    {
      name: "Eventos",
      icon: Home,
      path: "/",
      isActive: location.pathname === "/",
    },
    {
      name: "Playlist",
      icon: Music2,
      path: playlistPath,
      isActive: location.pathname.startsWith("/playlist"),
    },
    {
      name: "Buscar",
      icon: Search,
      path: "/search",
      isActive: location.pathname === "/search",
    },
    {
      name: "Adicionar",
      icon: Plus,
      path: "/add",
      isActive: location.pathname === "/add",
    },
  ];

  const handleNavClick = () => {
    triggerRefresh();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#1DB954]/30 flex-shrink-0"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.src !== "/perfil.jpg") {
                  img.src = "/perfil.jpg";
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-white truncate">{profile.name}</h1>
              <p className="text-xs text-white/60 capitalize truncate">{profile.role}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition text-white flex-shrink-0"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Overlay Mobile */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute top-[57px] right-0 w-64 h-[calc(100vh-57px)] bg-[#0a0a0a] border-l border-white/10 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.name}
                    to={tab.path}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                      tab.isActive
                        ? "bg-[#1DB954]/20 text-[#1DB954]"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </Link>
                );
              })}
              <Link
                to="/settings"
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  location.pathname.startsWith("/settings")
                    ? "bg-[#1DB954]/20 text-[#1DB954]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Configurações</span>
              </Link>
            </nav>

            {/* Logout Section */}
            <div className="border-t border-white/10 p-4 mt-4">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition w-full"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Quick Nav Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                to={tab.path}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px]",
                  tab.isActive
                    ? "text-[#1DB954]"
                    : "text-white/60 active:scale-95"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
