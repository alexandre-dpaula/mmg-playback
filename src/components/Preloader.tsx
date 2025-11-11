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

      {/* Texto sobre a imagem */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-1 drop-shadow-lg">
          MMG
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-1 drop-shadow-lg">
          Playback
        </h2>
        <p className="text-sm sm:text-base md:text-lg italic drop-shadow-lg text-white/60">
          By M2Studio
        </p>
      </div>

      {/* Spinner apenas em desktop (md e acima) */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none mt-64">
        <div className="w-44 h-44 border-4 border-white/10 border-t-[#1DB954] rounded-full animate-spin" />
      </div>
    </div>
  );
};
