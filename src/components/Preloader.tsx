"use client";

import React from "react";

const IMAGE_SCALE = 1.05; // leve overscan para garantir cobertura total

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

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    width: "100vw",
    minWidth: "100dvw",
    height: "100vh",
    minHeight: "100dvh",
    zIndex: 9999,
    overflow: "hidden",
    margin: 0,
    padding: 0,
    backgroundColor: "#121212",
  };

  const imageStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    transform: `scale(${IMAGE_SCALE})`,
    transformOrigin: "center",
    margin: 0,
    padding: 0,
  };

  return (
    <div
      className="fixed bg-[#121212]"
      style={containerStyle}
    >
      {/* Expande além dos limites, inclusive as safe areas dos PWAs */}
      <img
        src="/preloader.jpg"
        alt="Carregando"
        style={imageStyle}
      />
    </div>
  );
};
