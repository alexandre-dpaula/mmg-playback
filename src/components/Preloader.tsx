"use client";

import React from "react";

type PreloaderProps = {
  isLoading: boolean;
};

export const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  // Bloqueia scroll do body quando preloader está ativo
  React.useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#121212]"
      style={{
        height: '100dvh',
        minHeight: '100dvh',
        width: '100vw',
        minWidth: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Imagem ocupa tela toda incluindo barra de status */}
      <img
        src="/preloader.jpg"
        alt="Carregando"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          height: '100%',
          width: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
};
