import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Plus, Settings, Music2, LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSelectedEventId,
  onSelectedEventChange,
  SELECTED_EVENT_STORAGE_KEY,
} from "@/lib/preferences";
import { useRefresh } from "@/context/RefreshContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlistPath, setPlaylistPath] = React.useState("/playlist/repertorio");
  const { triggerRefresh } = useRefresh();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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
    {
      name: "Configurações",
      icon: Settings,
      path: "/settings",
      isActive: location.pathname.startsWith("/settings"),
    },
  ];

  return (
    <div
      className={cn(
        "hidden md:flex flex-col bg-[#0a0a0a] border-r border-white/10 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">MMG</h1>
              <p className="text-xs text-white/60">Ensaio Vocal</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition text-white/70 hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                to={tab.path}
                onClick={() => triggerRefresh()}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
                  tab.isActive
                    ? "bg-[#1DB954]/20 text-[#1DB954]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    tab.isActive ? "text-[#1DB954]" : "text-white/70 group-hover:text-white"
                  )}
                />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">{tab.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-3">
        {user && (
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 mb-2",
            isCollapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-black" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-[10px] text-white/60 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition w-full",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};
