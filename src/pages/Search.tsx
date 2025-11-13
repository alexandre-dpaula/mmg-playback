import React from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-24">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <header className="space-y-2 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1DB954]">
            Buscar
          </p>
          <h1 className="text-3xl font-semibold">Buscar Músicas</h1>
          <p className="text-white/70">
            Encontre rapidamente a música que você procura.
          </p>
        </header>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            type="text"
            placeholder="Digite o nome da música..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>

        {searchQuery && (
          <div className="mt-8">
            <p className="text-white/70 text-sm">
              Buscando por: <strong>{searchQuery}</strong>
            </p>
            {/* Aqui você pode adicionar a lógica de busca */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
