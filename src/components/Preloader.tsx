"use client";

import React from "react";

type PreloaderProps = {
  isLoading: boolean;
};

export const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212]">
      <div className="relative flex flex-col items-center gap-6">
        {/* Imagem de preloader */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <img
            src="/preloader.jpg"
            alt="Carregando"
            className="w-full h-full object-contain rounded-2xl"
          />
          {/* Spinner overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 border-4 border-white/10 border-t-[#1DB954] rounded-full animate-spin" />
          </div>
        </div>

        {/* Texto de carregamento */}
        <div className="text-center space-y-2">
          <p className="text-white text-lg sm:text-xl font-semibold">
            Carregando playlist...
          </p>
          <p className="text-white/60 text-sm sm:text-base">
            Aguarde enquanto sincronizamos com o Google Sheets
          </p>
        </div>

        {/* Pontos animados */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};
