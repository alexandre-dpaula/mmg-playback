import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, Share2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGooglePlaylist } from "@/hooks/useGooglePlaylist";

export const TabBar: React.FC = () => {
  const location = useLocation();
  const { data: playlistData } = useGooglePlaylist();

  const shareMessage = React.useMemo(() => {
    const tracks = (playlistData?.tracks ?? []).filter((track) => {
      const pauta = track.pauta?.trim();
      return Boolean(pauta && /^https?:\/\//i.test(pauta));
    });

    if (!tracks.length) {
      return "";
    }

    const trackLines = tracks
      .map((track) => {
        const title = track.title?.trim();
        if (!title) return null;
        const tom = track.tom?.trim();
        return tom ? `• ${title} - ${tom}` : `• ${title}`;
      })
      .filter(Boolean) as string[];

    if (!trackLines.length) {
      return "";
    }

    return ["*REPERTÓRIO*", "_Culto Poder da Palavra_", "", ...trackLines].join("\n");
  }, [playlistData]);

  const handleShareClick = React.useCallback(() => {
    if (!shareMessage) return;

    const encodedText = encodeURIComponent(shareMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ text: shareMessage })
        .catch((error) => {
          if (error?.name === "AbortError") {
            return;
          }
          if (typeof window !== "undefined") {
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
          }
        });
      return;
    }

    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }, [shareMessage]);

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
      name: "Compartilhar",
      icon: Share2,
      onClick: handleShareClick,
      disabled: !shareMessage,
      isActive: false,
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

          if (tab.onClick) {
            return (
              <button
                key={tab.name}
                onClick={tab.onClick}
                disabled={tab.disabled}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                  tab.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-white/10 active:scale-95"
                )}
              >
                <Icon className="h-5 w-5 text-white/70" />
                <span className="text-[10px] font-medium text-white/70">
                  {tab.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.name}
              to={tab.path!}
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
