import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Music2, Pause, Play, UploadCloud, Plus, X, Trash2, Upload } from "lucide-react";
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

const convertUrl = (url: string) => {
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }
  return url;
};

const SpotifyPlayer: React.FC = () => {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = React.useState<string | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [singleUrl, setSingleUrl] = React.useState("");
  const [csvUrl, setCsvUrl] = React.useState("");
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
    console.log('Setting audio src to:', currentTrack.url);
    audioRef.current.src = currentTrack.url;
    audioRef.current.load();
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

  const adicionarFaixaUnica = async () => {
    if (!singleUrl) {
      alert("Por favor, insira a URL da faixa.");
      return;
    }
    const convertedUrl = convertUrl(singleUrl);
    console.log('Original URL:', singleUrl);
    console.log('Converted URL:', convertedUrl);
    
    // Validate URL accessibility
    try {
      const response = await fetch(convertedUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao validar URL:', error);
      alert('Erro: A URL fornecida não é acessível ou não existe. Verifique se o arquivo existe e é público.');
      return;
    }
    
    const title = formatTitle(singleUrl);
    const newTrack = {
      title: title,
      file_name: title,
      url: convertedUrl,
    };
    const { error } = await supabase.from('tracks').insert(newTrack);
    if (error) {
      console.error('Erro ao salvar faixa:', error);
      alert('Erro ao salvar faixa no banco de dados.');
      return;
    }
    await loadTracks();
    setSingleUrl("");
    alert('Faixa adicionada com sucesso!');
  };

  const carregarDoCSV = async () => {
    if (!csvUrl) {
      alert("Por favor, insira a URL do arquivo CSV.");
      return;
    }
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        complete: async (results) => {
          const data = results.data as { title?: string; url?: string }[];
          const validTracks = [];
          for (const row of data) {
            if (row.title && row.url) {
              const convertedUrl = convertUrl(row.url);
              try {
                const res = await fetch(convertedUrl, { method: 'HEAD' });
                if (res.ok) {
                  validTracks.push({
                    title: row.title,
                    file_name: row.title,
                    url: convertedUrl,
                  });
                } else {
                  console.warn(`URL inválida: ${convertedUrl}`);
                }
              } catch (error) {
                console.warn(`Erro ao validar URL: ${convertedUrl}`, error);
              }
            }
          }
          if (validTracks.length === 0) {
            alert('Nenhuma faixa válida encontrada no CSV.');
            return;
          }
          const { error } = await supabase.from('tracks').insert(validTracks);
          if (error) {
            console.error('Erro ao salvar faixas do CSV:', error);
            alert('Erro ao salvar faixas do CSV.');
            return;
          }
          await loadTracks();
          setCsvUrl("");
          alert(`${validTracks.length} faixa(s) adicionada(s) com sucesso!`);
        },
        error: (error) => {
          console.error('Erro ao analisar CSV:', error);
          alert('Erro ao analisar o arquivo CSV.');
        },
      });
    } catch (error) {
      console.error('Erro ao carregar CSV:', error);
      alert('Erro ao carregar o arquivo CSV.');
    }
  };

  const deleteTrack = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta faixa?')) return;
    const { error } = await supabase.from('tracks').delete().eq('id', id);
    if (error) {
      console.error('Erro ao remover faixa:', error);
      alert('Erro ao remover faixa.');
      return;
    }
    await loadTracks();
    if (currentTrackId === id) {
      setCurrentTrackId(null);
      setIsPlaying(false);
    }
  };

  const clearPlaylist = async () => {
    if (!confirm('Tem certeza que deseja limpar toda a playlist? Todas as faixas serão removidas.')) return;
    const { error } = await supabase.from('tracks').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (error) {
      console.error('Erro ao limpar playlist:', error);
      alert('Erro ao limpar playlist.');
      return;
    }
    await loadTracks();
    setCurrentTrackId(null);
    setIsPlaying(false);
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

  const handleAudioError = () => {
    console.error('Audio error for URL:', currentTrack?.url);
    alert(`Erro ao carregar a faixa "${currentTrack?.title}". Verifique se a URL é válida, o arquivo é acessível e é um arquivo de áudio suportado (ex: MP3). Se o repositório no Github for privado, torne-o público ou use um serviço de hospedagem alternativo como Dropbox, Google Drive ou um servidor próprio.`);
    setIsPlaying(false);
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
            {tracks.length > 0 && (
              <Button
                onClick={clearPlaylist}
                variant="outline"
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Limpar playlist
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <input
              type="text"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              placeholder="URL do áudio (ex: Github)"
              className="bg-white/10 text-white placeholder-white/50 rounded-md px-3 py-2 w-full sm:w-auto"
            />
            <Button
              className="bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
              onClick={adicionarFaixaUnica}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar faixa
            </Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <input
              type="text"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
              placeholder="URL do arquivo CSV"
              className="bg-white/10 text-white placeholder-white/50 rounded-md px-3 py-2 w-full sm:w-auto"
            />
            <Button
              className="bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
              onClick={carregarDoCSV}
            >
              <Upload className="mr-2 h-4 w-4" />
              Carregar do CSV
            </Button>
          </div>
        </div>
        <div className="w-full max-w-sm rounded-2xl bg-white/5 p-4 sm:p-6 backdrop-blur">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Agora tocando: {currentTrack?.title ?? "Nenhuma faixa selecionada"}
              </p>
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
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm transition",
                    currentTrackId === track.id
                      ? "bg-[#1DB954]/20 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <div className="flex-1" onClick={() => handleSelectTrack(track.id)}>
                    <p className="font-semibold">{track.title}</p>
                    <span className="text-xs text-white/50">
                      Faixa {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentTrackId === track.id && (
                      <span className="rounded-full bg-[#1DB954] px-2 py-1 sm:px-3 sm:py-1 text-xs font-bold text-black">
                        Tocando
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrack(track.id);
                      }}
                      className="h-6 w-6 p-0 text-white/50 hover:text-red-400 hover:bg-red-400/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {!tracks.length && (
                <li className="rounded-xl bg-white/5 px-3 py-6 sm:px-4 sm:py-8 text-center text-sm text-white/50">
                  Adicione faixas para iniciar a playlist.
                </li>
              )}
            </ul>
          </ScrollArea>
        </div>
      </div>
      <audio ref={audioRef} hidden onEnded={playNextTrack} onError={handleAudioError} />
    </section>
  );
};

export default SpotifyPlayer;