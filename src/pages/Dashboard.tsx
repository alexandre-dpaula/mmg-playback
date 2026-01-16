import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Bell, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BrandLogo } from "@/components/BrandLogo";

interface Track {
  id: string;
  titulo: string;
  tag?: string;
  referencia?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [avatarError, setAvatarError] = useState(false);
  const showFallbackAvatar = avatarError || !profile.avatarUrl;
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  // Reset avatar error quando avatarUrl mudar
  useEffect(() => {
    setAvatarError(false);
  }, [profile.avatarUrl]);

  // Detecta qual card está visível
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.clientWidth;
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentCardIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);


  const loadTracks = async () => {
    if (!profile.churchId) return;

    const { data, error } = await supabase
      .from("tracks")
      .select("id, titulo, tag, referencia")
      .eq("church_id", profile.churchId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setTracks(data);
    }
  };

  const getYouTubeThumbnail = (url?: string) => {
    if (!url) return "/placeholder-music.jpg";
    try {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
      if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } catch (e) {
      console.error(e);
    }
    return "/placeholder-music.jpg";
  };

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Header com Logo e Perfil */}
      <header className="px-6 py-4 bg-black">
        <div className="flex items-center justify-between">
          <BrandLogo showIcon />
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/settings/profile")}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all"
            >
              {showFallbackAvatar ? (
                <div className="w-full h-full rounded-full bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
              ) : (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 flex flex-col overflow-hidden">
        {/* Saudação - Responsiva com tamanhos crescentes */}
        <div className="mb-3 md:text-center md:max-w-3xl md:mx-auto lg:max-w-4xl">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1 transition-all">
            Olá, {profile.name}
          </h1>
          <p className="text-white/60 text-sm md:text-base lg:text-lg transition-all">
            Escolha seu modo e comece a ensaiar
          </p>
        </div>

        {/* Cards dos Modos - Um card por vez */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden gap-3">
          <div ref={scrollContainerRef} className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory">
            <div className="flex pb-4">
              {/* MODO EVENTO */}
              <div className="flex flex-col gap-2 snap-center flex-shrink-0 w-full items-center justify-center">
                <button
                  onClick={() => navigate("/events")}
                  className="group relative aspect-[650/1000] w-[320px] md:w-[360px] lg:w-[400px] rounded-2xl overflow-hidden bg-zinc-900 transition-all duration-300 md:hover:scale-105 hover:shadow-2xl"
                >
                {/* Imagem de fundo */}
                <div className="absolute inset-0">
                  <img
                    src="/eventos.jpg"
                    alt="Modo Evento"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/95" />
                </div>

                {/* Conteúdo */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  {/* Header com Badge Acessar */}
                  <div className="flex items-center justify-end">
                    <div className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold border border-white/20">
                      Acessar
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div>
                    {/* Título grande */}
                    <h3 className="font-black leading-none mb-2">
                      <span className="text-sm md:text-base font-normal tracking-wide block mb-1 transition-all">MODO</span>
                      <span className="text-5xl md:text-6xl lg:text-7xl tracking-tight transition-all">EVENTO</span>
                    </h3>
                    {/* Descrição dentro do card */}
                    <p className="text-xs md:text-sm text-white/60 leading-tight">
                      Gerencie cultos, ensaios e setlists completas da sua equipe
                    </p>
                  </div>
                </div>
              </button>
              </div>

              {/* MODO ENSAIO */}
              <div className="flex flex-col gap-2 snap-center flex-shrink-0 w-full items-center justify-center">
                <button
                  onClick={() => navigate("/studies")}
                  className="group relative aspect-[650/1000] w-[320px] md:w-[360px] lg:w-[400px] rounded-2xl overflow-hidden bg-zinc-900 transition-all duration-300 md:hover:scale-105 hover:shadow-2xl"
                >
                {/* Imagem de fundo */}
                <div className="absolute inset-0">
                  <img
                    src="/estudos.jpg"
                    alt="Modo Ensaio"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/95" />
                </div>

                {/* Conteúdo */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  {/* Header com Badge Acessar */}
                  <div className="flex items-center justify-end">
                    <div className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold border border-white/20">
                      Acessar
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div>
                    {/* Título grande */}
                    <h3 className="font-black leading-none mb-2">
                      <span className="text-sm md:text-base font-normal tracking-wide block mb-1 transition-all">MODO</span>
                      <span className="text-5xl md:text-6xl lg:text-7xl tracking-tight transition-all">ENSAIO</span>
                    </h3>
                    {/* Descrição dentro do card */}
                    <p className="text-xs md:text-sm text-white/60 leading-tight">
                      Aprenda posições de acordes, diagramas e sugestões harmônicas
                    </p>
                  </div>
                </div>
                </button>
                </div>
            </div>
          </div>

          {/* Indicadores de navegação - Barras modernas */}
          <div className="flex gap-2 items-center justify-center">
            {[0, 1].map((index) => (
              <button
                key={index}
                onClick={() => {
                  const container = scrollContainerRef.current;
                  if (container) {
                    container.scrollTo({
                      left: index * container.clientWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="group relative"
                aria-label={`Ver card ${index + 1}`}
              >
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentCardIndex === index
                      ? 'w-8 bg-white'
                      : 'w-8 bg-white/30 group-hover:bg-white/50'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
