import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NavbarProps = {
  filter: "all" | "vocal" | "instrumental";
  onFilterChange: (filter: "all" | "vocal" | "instrumental") => void;
};

export const Navbar: React.FC<NavbarProps> = ({ filter, onFilterChange }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-white/10">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo MMG */}
          <div className="flex items-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="MMG"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain"
            />
          </div>

          {/* Select para filtros - mobile */}
          <div className="flex sm:hidden flex-1 justify-center max-w-[180px]">
            <Select
              value={filter}
              onValueChange={(value) =>
                onFilterChange(value as "all" | "vocal" | "instrumental")
              }
            >
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-xs">
                <SelectValue placeholder="Filtro" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                <SelectItem value="all" className="text-xs">
                  Cifras
                </SelectItem>
                <SelectItem value="vocal" className="text-xs">
                  Vocal
                </SelectItem>
                <SelectItem value="instrumental" className="text-xs">
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

          {/* Imagem de Perfil */}
          <div className="flex items-center flex-shrink-0">
            <img
              src="/perfil.jpg"
              alt="Perfil"
              className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full object-cover ring-2 ring-white/10"
              onError={(e) => {
                console.error('Erro ao carregar imagem de perfil:', e);
                e.currentTarget.src = "https://ui-avatars.com/api/?name=MMG&background=1DB954&color=000&size=200";
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
