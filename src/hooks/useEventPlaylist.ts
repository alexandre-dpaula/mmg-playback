import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type PlaylistTrack = {
  id: string;
  title: string;
  url?: string;
  artist?: string;
  tag?: string;
  versao?: string;
  order: number;
  coverUrl?: string;
  tom?: string;
  cifra?: string;
  pauta?: string;
  cifraContent?: string;
};

export type PlaylistData = {
  eventId: string;
  title: string;
  description: string;
  coverUrl: string;
  tracks: PlaylistTrack[];
  eventDate?: string;
};

const DEFAULT_PLAYLIST: PlaylistData = {
  eventId: "",
  title: "Selecione um evento",
  description: "",
  coverUrl: "",
  tracks: [],
};

type EventTracksResponse = {
  id: string;
  name: string;
  date: string;
  event_tracks: {
    order_index: number | null;
    custom_key: string | null;
    custom_capo: number | null;
    custom_cifra_content: string | null;
    custom_notes: string | null;
    track: {
      id: string;
      titulo: string;
      tag: string | null;
      versao: string | null;
      tom: string | null;
      cifra_url: string | null;
      cifra_content: string | null;
      artist_photo: string | null;
      audio_url: string | null;
    } | null;
  }[];
};

const mapTrackRow = (
  eventTrackItem: EventTracksResponse["event_tracks"][number],
  orderIndex: number,
): PlaylistTrack => {
  const row = eventTrackItem.track!;
  const cifraUrl = row.cifra_url || undefined;

  // Lógica de prioridade: customizações do evento sobrescrevem dados globais
  return {
    id: row.id,
    title: row.titulo,
    artist: row.tag || undefined,
    tag: row.tag || undefined,
    versao: row.versao || undefined,
    order: orderIndex,
    coverUrl: row.artist_photo || undefined,
    tom: eventTrackItem.custom_key || row.tom || undefined, // Prioridade: custom > global
    cifra: cifraUrl,
    pauta: cifraUrl,
    cifraContent: eventTrackItem.custom_cifra_content || row.cifra_content || undefined, // Prioridade: custom > global
    url: row.audio_url || undefined,
  };
};

const fetchPlaylistFromSupabase = async (eventId: string): Promise<PlaylistData> => {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
        id,
        name,
        date,
        event_tracks (
          order_index,
          custom_key,
          custom_capo,
          custom_cifra_content,
          custom_notes,
          track:tracks (
            id,
            titulo,
            tag,
            versao,
            tom,
            cifra_url,
            cifra_content,
            artist_photo,
            audio_url
          )
        )
      `,
    )
    .eq("id", eventId)
    .single<EventTracksResponse>();

  if (error) {
    throw error;
  }

  const orderedTracks = (data.event_tracks || [])
    .filter((item) => item.track)
    .sort((a, b) => {
      const orderA = a.order_index ?? 0;
      const orderB = b.order_index ?? 0;
      return orderA - orderB;
    })
    .map((item, index) => mapTrackRow(item, item.order_index ?? index));

  return {
    eventId: data.id,
    title: data.name,
    description: `Evento em ${new Intl.DateTimeFormat("pt-BR").format(new Date(data.date))}`,
    coverUrl: orderedTracks[0]?.coverUrl || "",
    tracks: orderedTracks,
    eventDate: data.date,
  };
};

export const useEventPlaylist = (eventId?: string) =>
  useQuery<PlaylistData, Error>({
    queryKey: ["playlist", eventId],
    queryFn: () => fetchPlaylistFromSupabase(eventId!),
    enabled: Boolean(eventId),
    staleTime: 0, // Sempre considera os dados stale
    gcTime: 5 * 60 * 1000, // Mantém em cache por 5 minutos para navegação rápida
    refetchOnWindowFocus: true, // Atualiza quando volta para a página
    refetchOnMount: true, // Atualiza quando monta o componente
    retry: 1,
  });

export { DEFAULT_PLAYLIST };
