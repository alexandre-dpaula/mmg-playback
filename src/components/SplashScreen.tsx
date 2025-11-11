"use client";

import React from "react";

type SplashScreenProps = {
  onComplete: () => void;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Timeout para pular splash se demorar muito (5 segundos)
    const timeout = setTimeout(() => {
      console.log("Timeout: pulando splash screen");
      onComplete();
    }, 5000);

    const handleLoadedData = () => {
      console.log("Vídeo carregado com sucesso");
      setIsVideoLoaded(true);
    };

    const handleCanPlay = () => {
      console.log("Vídeo pronto para reproduzir");
      // Tenta reproduzir o vídeo
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Vídeo reproduzindo");
          })
          .catch((error) => {
            console.error("Erro ao reproduzir vídeo splash:", error);
            setHasError(true);
            // Se não conseguir reproduzir, pula o splash
            setTimeout(onComplete, 500);
          });
      }
    };

    const handleEnded = () => {
      console.log("Vídeo finalizado");
      clearTimeout(timeout);
      onComplete();
    };

    const handleError = (e: Event) => {
      console.error("Erro ao carregar vídeo splash:", e);
      setHasError(true);
      clearTimeout(timeout);
      // Se houver erro, pula o splash após 500ms
      setTimeout(onComplete, 500);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Tenta carregar o vídeo
    video.load();

    return () => {
      clearTimeout(timeout);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
        preload="auto"
        webkit-playsinline="true"
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>
      {!isVideoLoaded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Carregando...</p>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4">
          <p className="text-white/60 text-sm">Carregando aplicativo...</p>
        </div>
      )}
    </div>
  );
};
