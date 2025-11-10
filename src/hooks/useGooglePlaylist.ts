import { useQuery } from "@tanstack/react-query";

export type PlaylistTrack = {
  id: string;
  title: string;
  url: string;
  artist?: string;
  order: number;
  coverUrl?: string;
};

export type PlaylistData = {
  title: string;
  description: string;
  coverUrl: string;
  tracks: PlaylistTrack[];
};

type GoogleSheetTrack = {
  id?: string;
  title?: string;
  artist?: string;
  url?: string;
  driveUrl?: string;
  driveId?: string;
  order?: number;
  coverUrl?: string;
};

type GoogleSheetPayload = {
  playlistTitle?: string;
  playlistDescription?: string;
  coverUrl?: string;
  tracks?: GoogleSheetTrack[];
  values?: string[][];
};

const DEFAULT_PLAYLIST: PlaylistData = {
  title: "Carregando...",
  description: "Carregando...",
  coverUrl: "",
  tracks: [],
};

const DRIVE_FILE_ID_REGEX = /[-\w]{25,}/;

const getScriptUrl = () => import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;

const convertDriveReferenceToDirectUrl = (driveReference?: string) => {
  if (!driveReference) return "";

  // Converte URLs do GitHub de blob para raw
  if (driveReference.includes("github.com") && driveReference.includes("/blob/")) {
    return driveReference
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob/", "/");
  }

  // Se for uma URL HTTP completa que NÃO é do Drive, retorna como está
  if (driveReference.startsWith("http") && !driveReference.includes("drive.google.com")) {
    return driveReference;
  }

  // Se não contém drive.google.com e não parece ser um ID do Drive, retorna como está
  if (!driveReference.includes("drive.google.com") && !DRIVE_FILE_ID_REGEX.test(driveReference)) {
    return driveReference;
  }

  // Apenas processa se for URL do Google Drive
  if (!driveReference.includes("drive.google.com")) {
    return driveReference;
  }

  // Extrai o ID do arquivo do Drive
  let fileId = "";

  if (driveReference.startsWith("http")) {
    const match = driveReference.match(DRIVE_FILE_ID_REGEX);
    if (!match) return driveReference;
    fileId = match[0];
  } else if (DRIVE_FILE_ID_REGEX.test(driveReference)) {
    fileId = driveReference;
  } else {
    return driveReference;
  }

  // Para URLs do Drive, retorna a URL de download direto
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

const normalizeTracks = (payload: GoogleSheetPayload): PlaylistTrack[] => {
  const sortByOrder = (tracks: PlaylistTrack[]) =>
    tracks.sort((a, b) => a.order - b.order);

  if (Array.isArray(payload?.tracks)) {
    return sortByOrder(
      payload.tracks
        .map((track, index) => normalizeTrack(track, index))
        .filter(Boolean) as PlaylistTrack[],
    );
  }

  if (Array.isArray(payload?.values)) {
    const [headerRow, ...rows] = payload.values;
    if (!headerRow) return [];

    const findIndexByKeywords = (keywords: string[]) =>
      headerRow.findIndex((cell) => {
        if (!cell) return false;
        const normalized = cell.toLowerCase();
        return keywords.some((keyword) => normalized.includes(keyword));
      });

    const titleIndex = findIndexByKeywords(["titulo", "título", "nome", "faixa"]);
    const urlIndex = findIndexByKeywords(["url", "link"]);
    const artistIndex = findIndexByKeywords(["voz", "cantor", "artista"]);

    return sortByOrder(
      rows
        .map((row, index) =>
          normalizeTrack(
            {
              title: titleIndex >= 0 ? row[titleIndex] : undefined,
              url: urlIndex >= 0 ? row[urlIndex] : undefined,
              artist: artistIndex >= 0 ? row[artistIndex] : undefined,
              order: index,
            },
            index,
          ),
        )
        .filter(Boolean) as PlaylistTrack[],
    );
  }

  return [];
};

const normalizeTrack = (track: GoogleSheetTrack, index: number): PlaylistTrack | null => {
  const title = track.title?.trim() || `Faixa ${index + 1}`;

  // Tenta obter a URL de diferentes fontes e converte URLs do Drive
  let url = track.url?.trim() ||
            track.driveUrl?.trim() ||
            track.driveId?.trim() ||
            "";

  // Sempre converte a URL do Drive para formato de download direto
  url = convertDriveReferenceToDirectUrl(url);

  if (!url) {
    return null;
  }

  // Processa a coverUrl se existir
  const coverUrl = track.coverUrl?.trim()
    ? convertDriveReferenceToDirectUrl(track.coverUrl.trim())
    : undefined;

  return {
    id: track.id || `${title}-${index}`,
    title,
    url,
    artist: track.artist?.trim() || undefined,
    order: typeof track.order === "number" ? track.order : index,
    coverUrl,
  };
};

const normalizePayload = (payload?: GoogleSheetPayload | null): PlaylistData => {
  if (!payload) {
    return DEFAULT_PLAYLIST;
  }

  const tracks = normalizeTracks(payload);

  // Converte a URL da capa se for do Google Drive
  const coverUrl = payload.coverUrl?.trim() || DEFAULT_PLAYLIST.coverUrl;
  const normalizedCoverUrl = convertDriveReferenceToDirectUrl(coverUrl) || coverUrl;

  return {
    title: payload.playlistTitle?.trim() || DEFAULT_PLAYLIST.title,
    description: payload.playlistDescription?.trim() || DEFAULT_PLAYLIST.description,
    coverUrl: normalizedCoverUrl,
    tracks,
  };
};

const fetchPlaylistFromSheet = async (): Promise<PlaylistData> => {
  const scriptUrl = getScriptUrl();

  if (!scriptUrl) {
    throw new Error("VITE_GOOGLE_APPS_SCRIPT_URL não configurada");
  }

  const response = await fetch(scriptUrl);

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados da planilha: ${response.status}`);
  }

  const rawPayload = (await response.json()) as GoogleSheetPayload;
  return normalizePayload(rawPayload);
};

export const useGooglePlaylist = () =>
  useQuery<PlaylistData, Error>({
    queryKey: ["google-playlist"],
    queryFn: fetchPlaylistFromSheet,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });

export { DEFAULT_PLAYLIST };
