"use client";

import React from "react";

type SplashScreenProps = {
  onComplete: () => void;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      video.play().catch((error) => {
        console.error("Erro ao reproduzir vídeo splash:", error);
        // Se não conseguir reproduzir, pula o splash após um tempo
        setTimeout(onComplete, 1000);
      });
    };

    const handleEnded = () => {
      onComplete();
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        preload="auto"
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
