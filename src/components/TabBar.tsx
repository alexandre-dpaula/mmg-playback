import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, Settings, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSelectedEventId,
  onSelectedEventChange,
  SELECTED_EVENT_STORAGE_KEY,
} from "@/lib/preferences";
import { useRefresh } from "@/context/RefreshContext";

export const TabBar: React.FC = () => {
  const location = useLocation();
  const [playlistPath, setPlaylistPath] = React.useState("/playlist/repertorio");
  const { triggerRefresh } = useRefresh();

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

  const tabs = [
    {
      name: "Início",
      icon: Home,
      path: "/",
      isActive: location.pathname === "/",
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
      name: "Playlist",
      icon: Music2,
      path: playlistPath,
      isActive: location.pathname.startsWith("/playlist"),
    },
    {
      name: "Config",
      icon: Settings,
      path: "/settings",
      isActive: location.pathname === "/settings",
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t border-white/10"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              to={tab.path!}
              onClick={() => triggerRefresh()}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                tab.isActive
                  ? "bg-[#1DB954]/20"
                  : "hover:bg-white/10 active:scale-95"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  tab.isActive ? "text-[#1DB954]" : "text-white/70"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  tab.isActive ? "text-[#1DB954]" : "text-white/70"
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
