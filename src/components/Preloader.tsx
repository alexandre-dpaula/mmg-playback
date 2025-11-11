"use client";

import React from "react";

type PreloaderProps = {
  isLoading: boolean;
};

export const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212]" style={{ height: '100dvh', minHeight: '100dvh' }}>
      {/* Imagem ocupa tela toda incluindo barra de status */}
      <img
        src="/preloader.jpg"
        alt="Carregando"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ height: '100dvh' }}
      />
    </div>
  );
};
