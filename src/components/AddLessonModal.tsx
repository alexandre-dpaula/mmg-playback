import React, { useState } from "react";
import { X, Plus, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

type AddLessonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: {
    youtubeUrl: string;
    title: string;
    tag: string;
  }) => Promise<void>;
};

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [artist, setArtist] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Função para buscar dados do YouTube
  const fetchYouTubeData = async (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
    if (!youtubeRegex.test(url)) {
      return;
    }

    setIsFetching(true);

    try {
      // Extrai o ID do vídeo
      const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
      };

      const videoId = getYouTubeId(url);
      if (!videoId) return;

      // Busca dados do vídeo
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();

      // Preenche os campos automaticamente
      setTitle(data.title || "");
      setArtist(data.author_name || "");

      // Extrai uma tag sugerida do título de forma inteligente
      const extractTag = (title: string) => {
        const titleLower = title.toLowerCase();

        // Palavras-chave para identificar o tipo de conteúdo
        const keywords = {
          'TÉCNICA': ['técnica', 'técnicas', 'como fazer', 'tutorial'],
          'EXERCÍCIO': ['exercício', 'exercícios', 'treino', 'treinamento', 'prática', 'praticar'],
          'LICK': ['lick', 'licks', 'frase', 'frases'],
          'TEORIA': ['teoria', 'harmonia', 'escala', 'escalas', 'acorde', 'acordes', 'campo harmônico'],
          'FUNDAMENTOS': ['fundamentos', 'básico', 'iniciante', 'começar', 'aprender'],
          'AVANÇADO': ['avançado', 'profissional', 'expert', 'master'],
          'IMPROVISAÇÃO': ['improviso', 'improvisação', 'improvisar', 'solo'],
          'RITMO': ['ritmo', 'groove', 'levada', 'batida'],
          'MELODIA': ['melodia', 'melódico', 'melódica'],
          'REARMONIZAÇÃO': ['rearmonização', 'rearmonizar', 'substituição'],
          'VOCAL': ['vocal', 'canto', 'voz', 'cantar'],
          'RESPIRAÇÃO': ['respiração', 'respirar', 'diafragma'],
          'AQUECIMENTO': ['aquecimento', 'aquecer'],
          'VIRADA': ['virada', 'viradas', 'fill'],
          'SLAP': ['slap', 'tapping'],
          'CORDAS': ['cordas', 'encordoamento'],
          'AFINAÇÃO': ['afinação', 'afinar'],
        };

        // Procura por palavras-chave no título
        for (const [tag, words] of Object.entries(keywords)) {
          if (words.some(word => titleLower.includes(word))) {
            return tag;
          }
        }

        // Se não encontrar palavra-chave, pega a primeira palavra significativa
        const titleWords = title.split(" ");
        const ignoredWords = ['a', 'o', 'de', 'da', 'do', 'para', 'em', 'no', 'na', 'com', 'como', 'the', 'of', 'to', 'in', 'for'];

        for (const word of titleWords) {
          const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '');
          if (cleanWord.length > 2 && !ignoredWords.includes(cleanWord)) {
            return word.toUpperCase();
          }
        }

        return titleWords[0]?.toUpperCase() || "AULA";
      };

      const suggestedTag = extractTag(data.title || "");
      setTag(suggestedTag);

    } catch (error) {
      console.error("Erro ao buscar dados do YouTube:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Busca dados quando a URL é alterada
  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url);
    if (url.trim()) {
      fetchYouTubeData(url.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!youtubeUrl.trim() || !title.trim() || !tag.trim()) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    // Valida se é uma URL válida do YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
    if (!youtubeRegex.test(youtubeUrl)) {
      alert("Por favor, insira uma URL válida do YouTube");
      return;
    }

    setIsLoading(true);

    try {
      await onSave({
        youtubeUrl: youtubeUrl.trim(),
        title: title.trim(),
        tag: tag.trim(),
      });

      // Limpa o formulário
      setYoutubeUrl("");
      setTitle("");
      setTag("");
      setArtist("");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      alert("Erro ao salvar aula. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4CB4FF]/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#4CB4FF]" />
            </div>
            <h2 className="text-xl font-bold text-white">Adicionar Aula</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* URL do YouTube */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              URL do YouTube
            </label>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[#0A0A0A] text-white placeholder-white/40 rounded-lg pl-11 pr-4 py-3 border border-white/10 focus:border-[#4CB4FF]/50 focus:outline-none transition-colors"
                required
                disabled={isFetching}
              />
              {isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#4CB4FF]/30 border-t-[#4CB4FF] rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-white/50 mt-1.5">
              Cole o link completo do vídeo do YouTube
            </p>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Título da Aula
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: TREINO VOCAL DIÁRIO"
              className="w-full bg-[#0A0A0A] text-white placeholder-white/40 rounded-lg px-4 py-3 border border-white/10 focus:border-[#4CB4FF]/50 focus:outline-none transition-colors"
              required
              disabled={isFetching}
            />
            <p className="text-xs text-white/50 mt-1.5">
              {isFetching ? "Buscando informações do vídeo..." : "Editável após buscar do YouTube"}
            </p>
          </div>

          {/* Artista/Canal */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Artista/Canal
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Ex: Cifra Club"
              className="w-full bg-[#0A0A0A] text-white placeholder-white/40 rounded-lg px-4 py-3 border border-white/10 focus:border-[#4CB4FF]/50 focus:outline-none transition-colors"
              required
              disabled={isFetching}
            />
            <p className="text-xs text-white/50 mt-1.5">
              {isFetching ? "Buscando nome do canal..." : "Preenchido automaticamente do YouTube"}
            </p>
          </div>

          {/* Tag/Técnica */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Tag/Técnica
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex: EXERCÍCIO, TÉCNICA, FUNDAMENTOS"
              className="w-full bg-[#0A0A0A] text-white placeholder-white/40 rounded-lg px-4 py-3 border border-white/10 focus:border-[#4CB4FF]/50 focus:outline-none transition-colors"
              required
              disabled={isFetching}
            />
            <p className="text-xs text-white/50 mt-1.5">
              Uma palavra-chave que identifica o tipo de conteúdo
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#4CB4FF] to-[#60A5FA] text-black font-semibold hover:from-[#60A5FA] hover:to-[#4CB4FF] transition-all"
            >
              {isLoading ? "Salvando..." : "Adicionar Aula"}
            </Button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="px-6 pb-6">
          <div className="bg-[#4CB4FF]/5 border border-[#4CB4FF]/20 rounded-lg p-3">
            <p className="text-xs text-white/60 leading-relaxed">
              <strong className="text-[#4CB4FF]">Dica:</strong> Suas aulas personalizadas
              ficarão disponíveis apenas neste navegador. Para compartilhar com outros
              usuários, entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
