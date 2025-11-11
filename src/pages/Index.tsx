import React from "react";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Navbar } from "@/components/Navbar";
import { DEFAULT_PLAYLIST, useGooglePlaylist } from "@/hooks/useGooglePlaylist";
import { SplashScreen } from "@/components/SplashScreen";
import { Preloader } from "@/components/Preloader";

const Index = () => {
  const { data: playlistData, isLoading } = useGooglePlaylist();
  const title = playlistData?.title ?? DEFAULT_PLAYLIST.title;
  const description = playlistData?.description ?? DEFAULT_PLAYLIST.description;
  const [filter, setFilter] = React.useState<"all" | "vocal" | "instrumental">("all");
  const [showSplash, setShowSplash] = React.useState(true);
  const [splashCompleted, setSplashCompleted] = React.useState(false);

  // Detecta se é mobile
  const isMobile = React.useMemo(() => {
    const mobile = window.innerWidth < 768;
    console.log("isMobile detectado:", mobile, "largura:", window.innerWidth);
    return mobile;
  }, []);

  React.useEffect(() => {
    console.log("Estado atual - showSplash:", showSplash, "splashCompleted:", splashCompleted, "isMobile:", isMobile);
  }, [showSplash, splashCompleted, isMobile]);

  const handleSplashComplete = () => {
    console.log("handleSplashComplete chamado");
    setSplashCompleted(true);
    // Pequeno delay para transição suave
    setTimeout(() => {
      console.log("Ocultando splash");
      setShowSplash(false);
    }, 300);
  };

  // No mobile, mostra splash primeiro, depois preloader
  // No desktop, pula o splash e vai direto para o preloader
  const shouldShowSplash = isMobile && showSplash;
  const shouldShowPreloader = isMobile
    ? (splashCompleted && isLoading)
    : isLoading;

  console.log("shouldShowSplash:", shouldShowSplash, "shouldShowPreloader:", shouldShowPreloader);

  return (
    <>
      {shouldShowSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {shouldShowPreloader && <Preloader isLoading={true} />}

      <div className="min-h-screen bg-[#121212] text-white">
        <Navbar filter={filter} onFilterChange={setFilter} />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8 md:gap-12 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
          <header className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              {title}
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-white/60">
              {description}
            </p>
          </header>
          <SpotifyPlayer filter={filter} />
          <div className="text-center pb-4 sm:pb-0">
            <MadeWithDyad />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
