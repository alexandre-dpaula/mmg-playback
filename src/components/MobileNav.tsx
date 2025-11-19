import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Plus,
  Settings,
  Music2,
  Menu,
  X,
  LogOut,
  Building2,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSelectedEventId,
  onSelectedEventChange,
  SELECTED_EVENT_STORAGE_KEY,
} from "@/lib/preferences";
import { useRefresh } from "@/context/RefreshContext";
import { supabase } from "@/lib/supabase";
import { useAuth, UserRole } from "@/context/AuthContext";

const ROLE_TAG_STYLES: Record<
  UserRole,
  { label: string; className: string }
> = {
  lider: {
    label: "Líder",
    className:
      "bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30",
  },
  vocal: {
    label: "Vocal",
    className: "bg-purple-500/15 text-purple-300 border border-purple-400/30",
  },
  instrumental: {
    label: "Instrumental",
    className: "bg-sky-500/15 text-sky-300 border border-sky-400/30",
  },
  member: {
    label: "Membro",
    className: "bg-white/10 text-white/70 border border-white/20",
  },
};

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [playlistPath, setPlaylistPath] = React.useState(
    "/playlist/repertorio"
  );
  const { triggerRefresh } = useRefresh();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);
  const showFallbackAvatar = avatarError || !profile.avatarUrl;

  const roleTag =
    ROLE_TAG_STYLES[profile.role] ??
    ROLE_TAG_STYLES.member;

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

  const baseTabs = [
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
  const tabs =
    profile.role === "lider"
      ? [
          ...baseTabs,
          {
            name: "Minha Igreja",
            icon: Building2,
            path: "/onboarding/igreja",
            isActive: location.pathname.startsWith("/onboarding"),
          },
        ]
      : baseTabs;

  const handleNavClick = () => {
    triggerRefresh();
    setIsMenuOpen(false);
  };

  const barHeight = 60;
  const safeAreaTop = "env(safe-area-inset-top, 0px)";
  const combinedHeight = `calc(${barHeight}px + ${safeAreaTop})`;
  const overlayHeight = `calc(100vh - ${barHeight}px - ${safeAreaTop})`;

  return (
    <>
      {/* Top Bar Mobile - Fixed positioning com altura fixa */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/10"
        style={{
          paddingTop: safeAreaTop,
          height: combinedHeight,
        }}
      >
        <div
          className="flex items-center justify-between px-3 sm:px-4 py-2"
          style={{ height: `${barHeight}px` }}
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {showFallbackAvatar ? (
              <div className="w-9 h-9 rounded-full ring-2 ring-[#1DB954]/30 flex-shrink-0 bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center shadow-inner shadow-black/50">
                <UserIcon className="w-4 h-4" />
              </div>
            ) : (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#1DB954]/30 flex-shrink-0"
                onError={() => setAvatarError(true)}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-white truncate">
                  {profile.name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase",
                    roleTag.className
                  )}
                >
                  {roleTag.label}
                </span>
              </div>
              <p
                className={cn(
                  "text-[10px] truncate",
                  profile.churchName ? "text-white/60" : "text-white/40"
                )}
              >
                {profile.churchName ?? "Sem igreja vinculada"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition text-white flex-shrink-0 ml-2"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Overlay Mobile - Começa abaixo do top bar */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 bottom-0 z-40 bg-black/50 backdrop-blur-sm"
          style={{ top: combinedHeight }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-full sm:w-64 max-w-xs bg-[#0a0a0a] border-l border-white/10 overflow-y-auto"
            style={{ height: overlayHeight }}
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
    </>
  );
};
