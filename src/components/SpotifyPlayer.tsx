import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Music2, Pause, Play, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

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
  const coverInputRef = React.useRef<HTMLInputElement | null>(null);
  const audioInputRef = React.useRef<HTMLInputElement | null>(null);

  const currentTrack = React.useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [tracks, currentTrackId],
  );

  // Carregar dados persistidos ao montar o componente
  React.useEffect(() => {
    const loadPersistedData = async () => {
      try {
        // Carregar capa
        const { data: coverData, error: coverError } = await supabase
          .from('covers')
          .select('url')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (coverData && !coverError) {
          setCoverUrl(coverData.url);
        }

        // Carregar faixas
        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .order('created_at', { ascending: true });

        if (tracksData && !tracksError) {
          setTracks(tracksData.map(track => ({
            id: track.id,
            url: track.url,
            title: track.title,
            fileName: track.file_name,
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar dados persistidos:', error);
      }
    };

    loadPersistedData();
  }, []);

  React.useEffect(() => {
    if (!tracks.length) {
      setCurrentTrackId(null);
      setIsPlaying(false);
    } else if (!currentTrackId) {
      setCurrentTrackId(tracks[0].id);
    }
  }, [tracks, currentTrackId]);

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

  const uploadCapa = () => {
    coverInputRef.current?.click();
  };

  const adicionarFaixas = () => {
    audioInputRef.current?.click();
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const fileName = `cover-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      // Salvar no banco
      const { error: dbError } = await supabase
        .from('covers')
        .insert({ url: publicUrl.publicUrl });

      if (dbError) throw dbError;

      setCoverUrl(publicUrl.publicUrl);
      showSuccess('Capa salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar capa:', error);
      showError('Erro ao salvar capa.');
    }

    event.target.value = "";
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    try {
      const uploadedTracks: Track[] = [];

      for (const file of Array.from(files)) {
        const fileName = `track-${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, file);

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);

        const trackData = {
          title: formatTitle(file.name),
          file_name: file.name,
          url: publicUrl.publicUrl,
        };

        const { data: dbData, error: dbError } = await supabase
          .from('tracks')
          .insert(trackData)
          .select()
          .single();

        if (dbError) throw dbError;

        uploadedTracks.push({
          id: dbData.id,
          url: dbData.url,
          title: dbData.title,
          fileName: dbData.file_name,
        });
      }

      setTracks(prev => [...prev, ...uploadedTracks]);
      showSuccess(`${uploadedTracks.length} faixa(s) salva(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar faixas:', error);
      showError('Erro ao salvar faixas.');
    }

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
                Playlist — Festa dos Tabernáculos
              </span>
              <h2 className="text-4xl font-bold md:text-5xl">
                Celebre em harmonia!
              </h2>
              <p className="max-w-md text-sm text-white/60">
                Arranjos vocais com controle e reprodução para estudo do Ministério de Música.
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