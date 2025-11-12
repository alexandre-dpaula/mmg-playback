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
      className="fixed bg-[#121212]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh', // Dynamic viewport height para mobile
        maxHeight: '100dvh',
        minHeight: '100dvh',
        zIndex: 9999,
        overflow: 'hidden',
        margin: 0,
        padding: 0
      }}
    >
      {/* Imagem ocupa tela toda do dispositivo real */}
      <img
        src="/preloader.jpg"
        alt="Carregando"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          maxHeight: '100dvh',
          minHeight: '100dvh',
          objectFit: 'cover',
          objectPosition: 'center',
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
};
