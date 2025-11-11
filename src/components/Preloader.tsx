"use client";

import React from "react";

type PreloaderProps = {
  isLoading: boolean;
};

export const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212]">
      {/* Imagem ocupa tela toda */}
      <img
        src="/preloader.jpg"
        alt="Carregando"
        className="w-full h-full object-cover"
      />

      {/* Spinner apenas em desktop (md e acima) */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center">
        <div className="w-44 h-44 border-4 border-white/10 border-t-[#1DB954] rounded-full animate-spin" />
      </div>
    </div>
  );
};
