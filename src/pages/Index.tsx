import React from "react";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Navbar } from "@/components/Navbar";
import { DEFAULT_PLAYLIST, useEventPlaylist } from "@/hooks/useEventPlaylist";
import { Preloader } from "@/components/Preloader";
import { Link, useParams } from "react-router-dom";

const CLOCK_TEXT_COLOR = "rgb(255 255 255 / 16%)";

const Index = () => {
  const { eventId: routeEventId } = useParams<{ eventId: string }>();
  const playlistEventId =
    routeEventId && routeEventId !== "repertorio" ? routeEventId : null;
  const { data: playlistData, isLoading, refetch, error } = useEventPlaylist(
    playlistEventId ?? undefined
  );
  const title = playlistData?.title ?? DEFAULT_PLAYLIST.title;
  const description = playlistData?.description ?? DEFAULT_PLAYLIST.description;
  const [filter, setFilter] = React.useState<"all" | "vocal" | "instrumental">("all");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullStartY, setPullStartY] = React.useState(0);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [showPreloader, setShowPreloader] = React.useState(() => {
    // Mostra preloader apenas na primeira visita da sessão
    const hasVisited = sessionStorage.getItem('hasVisited');
    return !hasVisited;
  });
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const clockInfo = React.useMemo(() => {
    const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
    const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

    const weekdayRaw = weekdayFormatter.format(now);
    const weekday =
      weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1).replace("-feira", "-feira");

    const day = now.getDate().toString().padStart(2, "0");
    const month = monthFormatter.format(now).replace(".", "").toUpperCase();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    return {
      weekday,
      day,
      month,
      time: `${hours}:${minutes}`,
      seconds,
    };
  }, [now]);

  // Marca que já visitou na primeira renderização
  React.useEffect(() => {
    if (!sessionStorage.getItem('hasVisited')) {
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  // Pull to refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - pullStartY;
      if (distance > 0) {
        setPullDistance(Math.min(distance, 100));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await refetch();
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
    setPullDistance(0);
    setPullStartY(0);
  };

  const renderEmptyState = (title: string, subtitle: string) => (
    <div
      className="min-h-screen bg-[#121212] text-white pb-24"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Navbar filter={filter} onFilterChange={setFilter} />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/30 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[#1DB954] font-semibold">
            Nenhum evento disponível
          </p>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-white/60">{subtitle}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1DB954] px-6 py-3 text-black font-semibold hover:bg-[#1ed760] transition"
        >
          Voltar para eventos
        </Link>
      </div>
    </div>
  );

  if (!playlistEventId) {
    return renderEmptyState(
      "Selecione um evento para acessar o repertório",
      "Abra a aba de eventos e escolha um evento com músicas cadastradas."
    );
  }

  if (error && !isLoading) {
    return renderEmptyState(
      "Evento não encontrado",
      "Talvez ele tenha sido removido. Selecione outro evento na aba principal."
    );
  }

  // Se está carregando E é a primeira visita, mostra o preloader
  if (isLoading && showPreloader) {
    return <Preloader isLoading={true} />;
  }

  // Quando terminar de carregar, mostra a página principal
  return (
    <div
      className="min-h-screen bg-[#121212] text-white pb-24"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Navbar filter={filter} onFilterChange={setFilter} />

      {/* Indicador de loading discreto para refreshes */}
      {isLoading && !showPreloader && (
        <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-transparent via-[#1DB954] to-transparent animate-pulse" />
      )}

      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed left-0 right-0 flex justify-center items-center transition-all z-40"
          style={{
            top: `calc(env(safe-area-inset-top) + ${Math.min(pullDistance, 80)}px)`,
            opacity: Math.min(pullDistance / 60, 1)
          }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
            <svg
              className={`w-6 h-6 text-[#1DB954] ${isRefreshing || pullDistance > 60 ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}

      <div
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8 md:gap-12 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12"
        style={{
          paddingTop: 'calc(80px + env(safe-area-inset-top) + 1.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
          transform: `translateY(${pullDistance * 0.5}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        <header className="text-center space-y-1">
          <div
            className="flex flex-wrap items-baseline justify-center gap-3 text-[14px] font-medium tracking-wide"
            style={{ color: CLOCK_TEXT_COLOR }}
          >
            <div className="flex items-baseline gap-1">
              <span>{clockInfo.weekday}</span>
              <span>{clockInfo.day}</span>
              <span className="uppercase">{clockInfo.month}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span>{clockInfo.time}</span>
              <span className="text-[12px] font-medium self-start" style={{ color: CLOCK_TEXT_COLOR, opacity: 0.8 }}>
                {clockInfo.seconds}
              </span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-10">
            {title}
          </h1>
        </header>
        <SpotifyPlayer filter={filter} eventId={playlistEventId!} />
        <div className="text-center pb-8">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;
