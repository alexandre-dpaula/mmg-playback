import React from "react";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { DEFAULT_PLAYLIST, useEventPlaylist } from "@/hooks/useEventPlaylist";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useRefresh } from "@/context/RefreshContext";
import { FooterBrand } from "@/components/FooterBrand";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefresh";
import { toast } from "sonner";
import { Share2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CLOCK_TEXT_COLOR = "rgb(255 255 255 / 16%)";

const Index = () => {
  const { eventId: routeEventId } = useParams<{ eventId: string }>();
  const { refreshKey } = useRefresh();
  const navigate = useNavigate();
  const playlistEventId =
    routeEventId && routeEventId !== "repertorio" ? routeEventId : null;
  const {
    data: playlistData,
    isLoading,
    refetch,
    error,
  } = useEventPlaylist(playlistEventId ?? undefined);

  const { containerRef, isPulling, isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
      toast.success("Playlist atualizada");
    },
    enabled: !!playlistEventId,
  });

  // Atualiza quando refreshKey mudar
  React.useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);
  const title = playlistData?.title ?? DEFAULT_PLAYLIST.title;
  const [filter] = React.useState<"all" | "vocal" | "instrumental">("all");
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const clockInfo = React.useMemo(() => {
    const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
    });
    const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

    const weekdayRaw = weekdayFormatter.format(now);
    const weekday =
      weekdayRaw.charAt(0).toUpperCase() +
      weekdayRaw.slice(1).replace("-feira", "-feira");

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

  const handleSharePlaylist = async () => {
    if (!playlistEventId) return;

    try {
      const { data, error } = await supabase
        .from("event_tracks")
        .select(`
          order_index,
          track:tracks (
            titulo,
            versao,
            tom
          )
        `)
        .eq("event_id", playlistEventId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      const trackLines =
        data
          ?.map((item, index) => {
            // Handle both array and object responses from Supabase
            const track = Array.isArray(item.track) ? item.track[0] : item.track;
            if (!track?.titulo) return null;

            const num = (index + 1).toString().padStart(2, "0");
            const titulo = track.titulo?.trim();
            if (!titulo) return null;
            const versao = track.versao?.trim();
            const tom = track.tom?.trim();
            const versaoText = versao ? ` (${versao})` : "";
            const tomText = tom ? ` - ${tom}` : "";
            return `${num}. ${titulo}${versaoText}${tomText}`;
          })
          .filter(Boolean) ?? [];

      if (!trackLines.length) {
        toast.info("Esta playlist está vazia");
        return;
      }

      const shareMessage = [
        "*REPERTÓRIO*",
        `_${title}_`,
        "",
        ...trackLines,
      ].join("\n");

      const encodedText = encodeURIComponent(shareMessage);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

      if (typeof navigator !== "undefined" && navigator.share) {
        navigator.share({ text: shareMessage }).catch((err) => {
          if (err?.name === "AbortError") return;
          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        });
        return;
      }

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Erro ao compartilhar playlist:", error);
      toast.error("Não foi possível compartilhar esta playlist");
    }
  };

  const renderEmptyState = (title: string, subtitle: string) => (
    <div className="min-h-screen bg-[#121212] text-white pt-20 md:pt-0 pb-8 md:pb-0 overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-6 px-4 sm:px-6 md:px-8 py-12 md:py-16 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-lg shadow-black/30 space-y-3 w-full max-w-sm">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#1DB954] font-semibold">
            Nenhum evento disponível
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
          <p className="text-sm sm:text-base text-white/60">{subtitle}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1DB954] px-6 py-3 text-black font-semibold hover:bg-[#1ed760] transition text-sm sm:text-base"
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

  // Quando terminar de carregar, mostra a página principal
  return (
    <>
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
      />
      <div
        ref={containerRef}
        data-pull-to-refresh
        className="min-h-screen bg-[#121212] text-white pt-20 md:pt-0 pb-32 md:pb-12 overflow-x-hidden overflow-y-auto safari-smooth-scroll"
      >
      {/* Indicador de loading discreto para refreshes */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-transparent via-[#1DB954] to-transparent animate-pulse" />
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </button>

        <header className="text-center space-y-2 sm:space-y-3">
          <div
            className="flex flex-wrap items-baseline justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium tracking-wide"
            style={{ color: CLOCK_TEXT_COLOR }}
          >
            <div className="flex items-baseline gap-1">
              <span className="truncate">{clockInfo.weekday}</span>
              <span>{clockInfo.day}</span>
              <span className="uppercase">{clockInfo.month}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span>{clockInfo.time}</span>
              <span
                className="text-xs font-medium self-start"
                style={{ color: CLOCK_TEXT_COLOR, opacity: 0.8 }}
              >
                {clockInfo.seconds}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-medium mb-4 sm:mb-6 md:mb-10 px-2 break-words">
              {title}
            </h1>
            <button
              onClick={handleSharePlaylist}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition mb-4 sm:mb-6 md:mb-10"
              aria-label="Compartilhar playlist"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>
        <SpotifyPlayer filter={filter} eventId={playlistEventId!} />
      </div>
      </div>
      <FooterBrand />
    </>
  );
};

export default Index;
