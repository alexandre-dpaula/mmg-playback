import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { User as UserIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

type NavbarProps = {
  filter: "all" | "vocal" | "instrumental";
  onFilterChange: (filter: "all" | "vocal" | "instrumental") => void;
};

export const Navbar: React.FC<NavbarProps> = ({ filter, onFilterChange }) => {
  const { profile } = useAuth();
  const [avatarError, setAvatarError] = React.useState(false);
  const showFallbackAvatar = avatarError || !profile.avatarUrl;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212] border-b border-white/10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 sm:gap-4">
          {/* Logo SetlistGO™ */}
          <div className="flex items-center flex-shrink-0">
            <BrandLogo className="text-white drop-shadow-sm" />
          </div>

          {/* Select para filtros - mobile */}
          <div className="flex sm:hidden flex-1 justify-center max-w-[180px]">
            <Select
              value={filter}
              onValueChange={(value) =>
                onFilterChange(value as "all" | "vocal" | "instrumental")
              }
            >
              <SelectTrigger className="w-full h-10 bg-white/10 border-white/20 text-white text-sm font-medium rounded-lg">
                <SelectValue placeholder="Filtro" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                <SelectItem value="all" className="text-sm py-3">
                  Cifras
                </SelectItem>
                <SelectItem value="vocal" className="text-sm py-3">
                  Vocal
                </SelectItem>
                <SelectItem value="instrumental" className="text-sm py-3">
                  Instrumental
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Menu de Filtros - Centro */}
          <div className="hidden sm:flex gap-1 sm:gap-1.5 md:gap-2 flex-1 justify-center max-w-md">
            <Button
              onClick={() => onFilterChange("all")}
              className={cn(
                "px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 text-[10px] sm:text-xs md:text-sm rounded-full transition",
                filter === "all"
                  ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Cifras
            </Button>
            <Button
              onClick={() => onFilterChange("vocal")}
              className={cn(
                "px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 text-[10px] sm:text-xs md:text-sm rounded-full transition",
                filter === "vocal"
                  ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Vocal
            </Button>
            <Button
              onClick={() => onFilterChange("instrumental")}
              className={cn(
                "px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 text-[10px] sm:text-xs md:text-sm rounded-full transition whitespace-nowrap",
                filter === "instrumental"
                  ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              <span className="hidden xs:inline">Instrumental</span>
              <span className="xs:hidden">Inst.</span>
            </Button>
          </div>

          {/* Perfil */}
          <div className="flex items-center flex-shrink-0">
            {showFallbackAvatar ? (
              <div className="h-11 w-11 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full ring-2 ring-white/10 bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] shadow-inner shadow-black/50">
                <UserIcon className="w-5 h-5" />
              </div>
            ) : (
              <img
                key={profile.avatarUrl}
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-11 w-11 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full object-cover ring-2 ring-white/10"
                crossOrigin="anonymous"
                onError={() => setAvatarError(true)}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
