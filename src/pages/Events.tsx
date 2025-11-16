import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Plus, Music, Trash2, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EventFormModal } from "@/components/EventFormModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getSelectedEventId, setSelectedEventId } from "@/lib/preferences";
import { useRefresh } from "@/context/RefreshContext";

type EventItem = {
  id: string;
  name: string;
  date: string;
  trackCount: number;
};

export default function Events() {
  const navigate = useNavigate();
  const { refreshKey } = useRefresh();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(() => getSelectedEventId());
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Atualiza quando refreshKey mudar
  useEffect(() => {
    if (refreshKey > 0) {
      fetchEvents();
    }
  }, [refreshKey]);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
            id,
            name,
            date,
            event_tracks (
              track_id
            )
          `,
        )
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      const mappedEvents =
        data?.map((event) => ({
          id: event.id,
          name: event.name,
          date: event.date,
          trackCount: event.event_tracks?.length ?? 0,
        })) ?? [];

      setEvents(mappedEvents);
      setActiveEventId((current) => {
        if (current && !mappedEvents.some((evt) => evt.id === current)) {
          setSelectedEventId(null);
          return null;
        }
        return current;
      });
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast.error("Não foi possível carregar os eventos");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleEventSelection = (event: EventItem) => {
    setActiveEventId(event.id);
    setSelectedEventId(event.id);
    navigate(`/playlist/${event.id}`);
  };

  const handleEditEvent = (eventId: string) => {
    setOpenMenuId(null);
    setEditingEventId(eventId);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find((evt) => evt.id === eventId);
    if (!event) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar o evento "${event.name}"?`
    );
    if (!confirmed) return;

    try {
      setOpenMenuId(null);
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;

      toast.success("Evento removido");
      if (activeEventId === eventId) {
        setActiveEventId(null);
        setSelectedEventId(null);
      }
      fetchEvents();
    } catch (error) {
      console.error("Erro ao remover evento:", error);
      toast.error("Não foi possível remover o evento");
    }
  };

  const openCreateModal = () => {
    setOpenMenuId(null);
    setEditingEventId(null);
    setIsModalOpen(true);
  };

  const handleShareEvent = async (event: EventItem) => {
    setOpenMenuId(null);
    try {
      const { data, error } = await supabase
        .from("event_tracks")
        .select(
          `
            order_index,
            track:tracks (
              titulo,
              tom
            )
          `,
        )
        .eq("event_id", event.id)
        .order("order_index", { ascending: true });

      if (error) throw error;

      const trackLines =
        data
          ?.filter((item) => item.track?.titulo)
          .map((item) => {
            const title = item.track?.titulo?.trim();
            if (!title) return null;
            const tom = item.track?.tom?.trim();
            return tom ? `• ${title} - ${tom}` : `• ${title}`;
          })
          .filter(Boolean) ?? [];

      if (!trackLines.length) {
        toast.info("Nenhuma música vinculada a este evento.");
        return;
      }

      const shareMessage = ["*REPERTÓRIO*", `_${event.name}_`, "", ...trackLines].join("\n");
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
      console.error("Erro ao compartilhar evento:", error);
      toast.error("Não foi possível compartilhar este evento");
    }
  };

  const handleEventSaved = async (eventId: string) => {
    setIsModalOpen(false);
    setEditingEventId(null);
    setOpenMenuId(null);
    await fetchEvents();
    setActiveEventId(eventId);
    setSelectedEventId(eventId);
    navigate(`/playlist/${eventId}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEventId(null);
    setOpenMenuId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatEventDetails = (event: EventItem) => {
    const details = [];
    if (event.date) {
      details.push(formatDate(event.date));
    }
    details.push(
      `${event.trackCount} ${event.trackCount === 1 ? "música" : "músicas"}`
    );
    return details.join(" • ");
  };

  const activeEvent = useMemo(
    () => events.find((evt) => evt.id === activeEventId) ?? null,
    [events, activeEventId]
  );

  const highlightLabel = activeEvent
    ? "Evento selecionado"
    : events.length
      ? "Selecione um evento"
      : "Nenhum evento cadastrado";
  const highlightTitle = activeEvent
    ? activeEvent.name
    : events.length
      ? "Escolha um evento abaixo"
      : "Adicione seu primeiro evento";
  const highlightSubtitle = activeEvent
    ? formatEventDetails(activeEvent)
    : events.length
      ? "Toque em um card para abrir o repertório na aba Playlist."
      : "Use o botão abaixo para criar e organizar suas músicas.";

  const highlightCardClasses = activeEvent
    ? "rounded-2xl bg-white/5 border border-white/10 text-white p-4 sm:p-5 shadow-lg shadow-black/30"
    : events.length
      ? "rounded-2xl bg-gradient-to-br from-[#1DB954] to-[#169347] text-black p-4 sm:p-5 shadow-lg shadow-[#1DB954]/20 border border-[#1DB954]/40"
      : "rounded-2xl bg-white/5 border border-white/10 text-white p-4 sm:p-5 shadow-lg shadow-black/30";

  const highlightLabelClass = activeEvent
    ? "text-xs uppercase font-semibold tracking-[0.12em] text-white/70"
    : events.length
      ? "text-xs uppercase font-semibold tracking-[0.12em] text-black/70"
      : "text-xs uppercase font-semibold tracking-[0.12em] text-white/70";

  const highlightTitleClass = activeEvent
    ? "text-2xl font-semibold text-[#1DB954]"
    : events.length
      ? "text-2xl font-semibold"
      : "text-2xl font-semibold text-white";

  const highlightSubtitleClass = activeEvent
    ? "text-sm text-white/70"
    : events.length
      ? "text-sm font-medium text-black/80"
      : "text-sm text-white/60";

  const renderEventCard = (event: EventItem, isActive: boolean) => {
    const isMenuEvent = (evt: React.SyntheticEvent) => {
      const target = evt.target as HTMLElement | null;
      return Boolean(target?.closest('[data-event-menu="true"]'));
    };

    const handleCardClick = (evt: React.MouseEvent) => {
      if (isMenuEvent(evt) || openMenuId === event.id) {
        setOpenMenuId(null);
        return;
      }
      handleEventSelection(event);
    };

    const handleCardKeyDown = (evt: React.KeyboardEvent) => {
      if (isMenuEvent(evt) || openMenuId === event.id) {
        setOpenMenuId(null);
        return;
      }
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        handleEventSelection(event);
      }
    };

    return (
      <div
        key={event.id}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className={`group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-px hover:border-[#1DB954]/40 hover:bg-[#1f1f1f] cursor-pointer ${
          isActive ? "border-[#1DB954]/50 bg-[#1DB954]/5" : ""
        }`}
      >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-white/5 to-transparent" />
      <div className="relative z-10 flex-shrink-0 h-12 w-12 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] shadow-inner shadow-black/50">
        <Music className="w-6 h-6" />
      </div>
      <div className="relative z-10 flex-1 text-left min-w-0">
        <h3 className="text-lg font-semibold text-white mb-1 truncate">{event.name}</h3>
        <p className="text-sm text-white/60 truncate">{formatEventDetails(event)}</p>
      </div>
      <div className="relative z-10" data-event-menu="true">
        <DropdownMenu
          open={openMenuId === event.id}
          onOpenChange={(open) => setOpenMenuId(open ? event.id : null)}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition"
              aria-label={`Mais opções para ${event.name}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#1c1c1c] border border-white/10 text-white text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setOpenMenuId(null);
                navigate(`/playlist/${event.id}`);
              }}
            >
              Abrir playlist
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleEditEvent(event.id);
              }}
            >
              Editar evento
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleShareEvent(event);
              }}
            >
              Compartilhar
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleDeleteEvent(event.id);
              }}
            >
              <span className="text-[#1DB954]">Apagar evento</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-16 pb-24 md:pt-0 md:pb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <header className="space-y-2 mb-6 sm:mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1DB954] font-semibold">
            EVENTOS
          </p>
          <h1 className="text-3xl font-bold">Meus Eventos</h1>
          <p className="text-white/60">Organize suas músicas por evento.</p>
        </header>

        <div className="space-y-4">
        <div className={highlightCardClasses}>
          <p className={highlightLabelClass}>{highlightLabel}</p>
          <div className="mt-2 flex flex-col gap-1">
            <h3 className={highlightTitleClass}>{highlightTitle}</h3>
            <p className={highlightSubtitleClass}>{highlightSubtitle}</p>
          </div>
        </div>

        {isLoadingEvents ? (
          <div className="space-y-3">
            <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento ainda</h3>
            <p className="text-white/60 text-sm">
              Crie seu primeiro evento para começar a organizar suas músicas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => renderEventCard(event, activeEvent?.id === event.id))}
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={openCreateModal}
            className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] font-semibold h-12 text-base"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Evento
          </Button>
        </div>

        <EventFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleEventSaved}
          eventId={editingEventId}
        />
        </div>
      </div>
    </div>
  );
}
