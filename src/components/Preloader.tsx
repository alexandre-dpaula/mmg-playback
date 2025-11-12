"use client";

import React from "react";

const SAFE_AREA_TOP = "env(safe-area-inset-top, 0px)";
const SAFE_AREA_BOTTOM = "env(safe-area-inset-bottom, 0px)";
const SAFE_AREA_LEFT = "env(safe-area-inset-left, 0px)";
const SAFE_AREA_RIGHT = "env(safe-area-inset-right, 0px)";
const IMAGE_OVERSCAN = 20; // pixels extras para garantir cobertura total

const expandWithSafeArea = (inset: string) =>
  `calc(-${IMAGE_OVERSCAN}px - ${inset})`;

const calcSizeWithSafeArea = (safeAreaA: string, safeAreaB: string) =>
  `calc(100% + ${IMAGE_OVERSCAN * 2}px + ${safeAreaA} + ${safeAreaB})`;

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
    top: expandWithSafeArea(SAFE_AREA_TOP),
    bottom: expandWithSafeArea(SAFE_AREA_BOTTOM),
    left: expandWithSafeArea(SAFE_AREA_LEFT),
    right: expandWithSafeArea(SAFE_AREA_RIGHT),
    objectFit: "cover",
    objectPosition: "center",
    width: calcSizeWithSafeArea(SAFE_AREA_LEFT, SAFE_AREA_RIGHT),
    height: calcSizeWithSafeArea(SAFE_AREA_TOP, SAFE_AREA_BOTTOM),
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
