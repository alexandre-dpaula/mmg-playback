import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Music2, Pause, Play, UploadCloud } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

type Track = {
  id: string;
  url: string;
  title: string;
  fileName: string;
};

const formatTitle = (name: string) =>
  name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");

const convertDriveUrl = (url: string) => {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=preview&id=${match[1]}`;
  }
  return url;
};

const SpotifyPlayer: React.FC = () => {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = React.useState<string | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [sheetUrl, setSheetUrl] = React.useState("");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const createdUrlsRef = React.useRef<string[]>([]);

  const currentTrack = React.useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [tracks, currentTrackId],
  );

  const loadTracks = async () => {
    const { data, error } = await supabase.from('tracks').select('*');
    if (error) {
      console.error('Erro ao carregar faixas:', error);
      return;
    }
    setTracks(data.map(track => ({
      id: track.id,
      url: track.url,
      title: track.title,
      fileName: track.file_name,
    })));
  };

  React.useEffect(() => {
    loadTracks();
  }, []);

  React.useEffect(() => {
    if (!tracks.length) {
      setCurrentTrackId(null);
      setIsPlaying(false);
    } else if (!currentTrackId) {
      setCurrentTrackId(tracks[0].id);
    }
  }, [tracks, currentTrackId]);

  React.useEffect(
    () => () => {
      createdUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  React.useEffect(() => {
    if (!audioRef.current || !currentTrack) {
      return;
    }
    audioRef.current.src = currentTrack.url;
  }, [currentTrack]);

  React.useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    if (!currentTrack) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      return;
    }
    if (isPlaying) {
      void audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const adicionarFaixas = async () => {
    if (!sheetUrl) {
      alert("Por favor, insira a URL do arquivo JSON das faixas.");
      return;
    }
    try {
      const response = await fetch(sheetUrl);
      const jsonData = await response.json();
      const newTracks = jsonData
        .filter((track: any) => track.title && track.url)
        .map((track: any) => ({
          title: track.title,
          file_name: track.title,
          url: convertDriveUrl(track.url),
        }));
      if (newTracks.length > 0) {
        const { error } = await supabase.from('tracks').insert(newTracks);
        if (error) {
          console.error('Erro ao salvar faixas:', error);
          alert('Erro ao salvar faixas no banco de dados.');
          return;
        }
        await loadTracks(); // Recarregar as faixas após inserir
        alert('Faixas carregadas e salvas com sucesso!');
      } else {
        alert('Nenhuma faixa válida encontrada no JSON.');
      }
    } catch (error) {
      console.error("Erro ao buscar JSON:", error);
      alert("Erro ao acessar o arquivo JSON. Verifique a URL e se o arquivo é público.");
    }
  };

  const handlePlayPause = () => {
    if (!tracks.length) {
      return;
    }
    if (!currentTrack) {
      setCurrentTrackId(tracks[0].id);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((state) => !state);
  };

  const handleSelectTrack = (id: string) => {
    if (id === currentTrackId) {
      setIsPlaying(true);
      return;
    }
    setCurrentTrackId(id);
    setIsPlaying(true);
  };

  const playNextTrack = () => {
    if (!currentTrack) {
      return;
    }
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id,
    );
    const next = tracks[currentIndex + 1];
    if (next) {
      setCurrentTrackId(next.id);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-4 sm:p-6 md:p-8 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-row items-center gap-6">
            <img
              src="https://i.pinimg.com/736x/ec/9b/b2/ec9bb2fde5e3cbba195ee0db0e3d2576.jpg"
              alt="Capa do áudio"
              className="h-32 w-32 sm:h-44 sm:w-44 rounded-2xl object-cover shadow-[0_20px_45px_-20px_rgba(0,0,0,0.8)]"
            />
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/60">
                Playlist — Festa dos Tabernáculos
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Vamos Ensaiar!
              </h2>
            </div>
          </div>
          <p className="max-w-md text-sm text-white/60">
            Arranjos vocais com controle e reprodução para estudo do Ministério de Música.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="URL do arquivo JSON das faixas"
              className="bg-white/10 text-white placeholder-white/50 rounded-md px-3 py-2 w-full sm:w-auto"
            />
            <Button
              className="bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
              onClick={adicionarFaixas}
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Carregar faixas do JSON
            </Button>
            <Button
              onClick={handlePlayPause}
              disabled={!tracks.length}
              className="flex items-center justify-center gap-2 rounded-full bg-[#1DB954] px-4 py-3 sm:px-6 sm:py-5 text-sm sm:text-base font-semibold text-black shadow-lg shadow-[#1DB954]/40 transition hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 w-full sm:w-auto"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  Reproduzir
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="w-full max-w-sm rounded-2xl bg-white/5 p-4 sm:p-6 backdrop-blur">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Agora tocando
              </p>
              <h3 className="text-base sm:text-lg font-semibold">
                {currentTrack?.title ?? "Nenhuma faixa selecionada"}
              </h3>
            </div>
            <span className="rounded-full bg-[#1DB954]/10 px-2 py-1 sm:px-3 sm:py-1 text-xs font-semibold text-[#1DB954] self-start sm:self-auto">
              {tracks.length} {tracks.length === 1 ? "faixa" : "faixas"}
            </span>
          </div>
          <ScrollArea className="h-48 sm:h-56 pr-4">
            <ul className="space-y-2">
              {tracks.map((track, index) => (
                <li
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm transition",
                    currentTrackId === track.id
                      ? "bg-[#1DB954]/20 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <div>
                    <p className="font-semibold">{track.title}</p>
                    <span className="text-xs text-white/50">
                      Faixa {index + 1}
                    </span>
                  </div>
                  {currentTrackId === track.id && (
                    <span className="rounded-full bg-[#1DB954] px-2 py-1 sm:px-3 sm:py-1 text-xs font-bold text-black">
                      Tocando
                    </span>
                  )}
                </li>
              ))}
              {!tracks.length && (
                <li className="rounded-xl bg-white/5 px-3 py-6 sm:px-4 sm:py-8 text-center text-sm text-white/50">
                  Carregue faixas do JSON para iniciar a playlist.
                </li>
              )}
            </ul>
          </ScrollArea>
        </div>
      </div>
      <audio ref={audioRef} hidden onEnded={playNextTrack} />
    </section>
  );
};

export default SpotifyPlayer;