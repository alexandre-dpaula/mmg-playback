import React from "react";
import { cn } from "@/lib/utils";

type NavbarProps = {
  filter: "all" | "vocal" | "instrumental";
  onFilterChange: (filter: "all" | "vocal" | "instrumental") => void;
};

export const Navbar: React.FC<NavbarProps> = ({ filter, onFilterChange }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Menu de Filtros */}
          <div className="flex gap-6">
            <button
              onClick={() => onFilterChange("all")}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                filter === "all" ? "text-white" : "text-white/60"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => onFilterChange("vocal")}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                filter === "vocal" ? "text-white" : "text-white/60"
              )}
            >
              Vocal
            </button>
            <button
              onClick={() => onFilterChange("instrumental")}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                filter === "instrumental" ? "text-white" : "text-white/60"
              )}
            >
              Instrumental
            </button>
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
