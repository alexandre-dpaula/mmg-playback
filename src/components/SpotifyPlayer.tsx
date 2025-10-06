import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Music2, Pause, Play, UploadCloud } from "lucide-react";

type Track = {
  id: string;
  url: string;
  title: string;
  fileName: string;
};

const formatTitle = (name: string) =>
  name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");

const SpotifyPlayer: React.FC = () => {
  const [coverUrl, setCoverUrl] = React.useState<string | null>(null);
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = React.useState<string | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const createdUrlsRef = React.useRef<string[]>([]);
  const coverInputRef = React.useRef<HTMLInputElement | null>(null);
  const audioInputRef = React.useRef<HTMLInputElement | null>(null);

  const currentTrack = React.useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [tracks, currentTrackId],
  );

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
    if (isPlaying) {
      void audioRef.current.play();
    }
  }, [currentTrack, isPlaying]);

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

  const uploadCapa = () => {
    coverInputRef.current?.click();
  };

  const adicionarFaixas = () => {
    audioInputRef.current?.click();
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    if (coverUrl) {
      URL.revokeObjectURL(coverUrl);
    }
    createdUrlsRef.current.push(url);
    setCoverUrl(url);
    event.target.value = "";
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }
    const incoming = Array.from(files).map((file, index) => {
      const url = URL.createObjectURL(file);
      createdUrlsRef.current.push(url);
      return {
        id: `${file.name}-${file.size}-${Date.now()}-${index}`,
        url,
        title: formatTitle(file.name),
        fileName: file.name,
      };
    });
    setTracks((prev) => [
      ...prev,
      ...incoming.filter(
        (item) => !prev.some((track) => track.fileName === item.fileName),
      ),
    ]);
    event.target.value = "";
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
    <section className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-8 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Capa do áudio"
                className="h-44 w-44 rounded-2xl object-cover shadow-[0_20px_45px_-20px_rgba(0,0,0,0.8)]"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-white/10 text-white/60 shadow-inner">
                <Music2 className="h-12 w-12" />
              </div>
            )}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.4em] text-white/60">
                Playlist personalizada
              </span>
              <h2 className="text-4xl font-bold md:text-5xl">
                Vibrações do Spotify
              </h2>
              <p className="max-w-md text-sm text-white/60">
                Carregue uma capa marcante, importe suas músicas favoritas e
                controle a reprodução com o clima clássico do Spotify.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={coverInputRef}
              id="cover-upload"
              accept="image/*"
              type="file"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={uploadCapa}
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload da capa
            </Button>
            <input
              ref={audioInputRef}
              id="audio-upload"
              accept="audio/*"
              type="file"
              multiple
              className="hidden"
              onChange={handleAudioUpload}
            />
            <Button
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={adicionarFaixas}
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Adicionar faixas
            </Button>
            <Button
              onClick={handlePlayPause}
              disabled={!tracks.length}
              className="flex items-center gap-2 rounded-full bg-[#1DB954] px-6 py-5 text-base font-semibold text-black shadow-lg shadow-[#1DB954]/40 transition hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Reproduzir
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="w-full max-w-sm rounded-2xl bg-white/5 p-6 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Agora tocando
              </p>
              <h3 className="text-lg font-semibold">
                {currentTrack?.title ?? "Nenhuma faixa selecionada"}
              </h3>
            </div>
            <span className="rounded-full bg-[#1DB954]/10 px-3 py-1 text-xs font-semibold text-[#1DB954]">
              {tracks.length} {tracks.length === 1 ? "faixa" : "faixas"}
            </span>
          </div>
          <ScrollArea className="h-56 pr-4">
            <ul className="space-y-2">
              {tracks.map((track, index) => (
                <li
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm transition",
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
                    <span className="rounded-full bg-[#1DB954] px-3 py-1 text-xs font-bold text-black">
                      Tocando
                    </span>
                  )}
                </li>
              ))}
              {!tracks.length && (
                <li className="rounded-xl bg-white/5 px-4 py-8 text-center text-sm text-white/50">
                  Adicione suas músicas para iniciar a playlist.
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