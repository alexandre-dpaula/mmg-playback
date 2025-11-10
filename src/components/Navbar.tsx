import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  filter: "all" | "vocal" | "instrumental";
  onFilterChange: (filter: "all" | "vocal" | "instrumental") => void;
};

export const Navbar: React.FC<NavbarProps> = ({ filter, onFilterChange }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo MMG */}
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-white">MMG</h2>
          </div>

          {/* Menu de Filtros - Centro */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button
              onClick={() => onFilterChange("all")}
              className={cn(
                "px-4 py-2 text-sm rounded-full transition",
                filter === "all"
                  ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Todos
            </Button>
            <Button
              onClick={() => onFilterChange("vocal")}
              className={cn(
                "px-4 py-2 text-sm rounded-full transition",
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
                "px-4 py-2 text-sm rounded-full transition",
                filter === "instrumental"
                  ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Instrumental
            </Button>
          </div>

          {/* Imagem de Perfil */}
          <div className="flex items-center gap-3">
            <img
              src="/perfil.jpg"
              alt="Perfil"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
