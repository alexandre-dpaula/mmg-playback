/**
 * PÁGINA DE DEMONSTRAÇÃO
 * Mostra todo o ecossistema musical funcionando
 */

import React, { useState } from 'react';
import { IntegratedChordStudy } from './components/IntegratedChordStudy';
import { BookOpen, Music, Zap } from 'lucide-react';

// Exemplos de músicas cifradas
const EXAMPLE_SONGS = {
  adoracao: {
    title: 'Quão Grande É o Meu Deus',
    artist: 'Soraya Moraes',
    content: `G            D
A luz brilhou na escuridão
Em7          C
Teus olhos cheios de glória
G              D
Cobriram a noite escura
Em7         C
Tua voz rugiu

G            D
Quando tudo se mover
Em7          C
Gritarei o Teu nome
G              D
Quando a criação se levantar
Em7         C        G
Cantarei a glória do meu Rei

(REFRÃO)
G
Quão grande é o meu Deus
              D
Cantarei quão grande é o meu Deus
Em7                    C
E todos verão quão grande, quão grande
   G
É o meu Deus`,
    key: 'G',
  },
  louvor: {
    title: 'Oceanos',
    artist: 'Hillsong',
    content: `Bm        A
Tua voz me chama
       G         D
Sobre as águas
       Bm           A             G    D
Onde os meus pés podem falhar
Bm             A
E ali Te encontro
       G         D
No mistério
       Bm        A           G    D
Em oceanos cada vez mais fundos

(REFRÃO)
D
Meu Deus, Tu és fiel
       A
Em todo tempo
       G
Firme até o fim
       Bm
Teu amor
       A        G
É uma âncora para a minh'alma`,
    key: 'D',
  },
  jazz: {
    title: 'Progressão Jazz',
    artist: 'Exemplo Didático',
    content: `Cmaj7        Dm7
Progressão de jazz
G7              Cmaj7
Com acordes de sétima
Am7         D7
Campo harmônico
Gmaj7       Em7    Am7   D7
Turnaround clássico

Fmaj7       Bm7b5    E7
Modal interchange
Am7         Dm7      G7
Cadência II-V-I`,
    key: 'C',
  },
  simples: {
    title: 'Aleluia (Simples)',
    artist: 'Exemplo Básico',
    content: `C          Am
Aleluia, aleluia
F              G
Louvado seja o Senhor
C          Am
Aleluia, aleluia
F       G        C
Para sempre cantarei`,
    key: 'C',
  },
};

export const ChordStudyDemo: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<keyof typeof EXAMPLE_SONGS>('adoracao');
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const currentSong = EXAMPLE_SONGS[selectedSong];
  const displayText = useCustom ? customText : currentSong.content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm">
            <Zap className="w-4 h-4" />
            <span>Sistema Completo de Estudo Musical</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ecossistema Musical Integrado
          </h1>

          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            156 acordes • 780 diagramas CAGED • Parser automático • Transposição em tempo real
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-6 space-y-2">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h3 className="font-semibold">Parser Inteligente</h3>
            <p className="text-sm text-white/60">
              Detecta automaticamente todos os acordes da cifra
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-6 space-y-2">
            <Music className="w-8 h-8 text-purple-400" />
            <h3 className="font-semibold">Transposição Automática</h3>
            <p className="text-sm text-white/60">
              Mude o tom da música com um clique (-12 a +12)
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-6 space-y-2">
            <Zap className="w-8 h-8 text-pink-400" />
            <h3 className="font-semibold">Diagramas CAGED</h3>
            <p className="text-sm text-white/60">
              5 formas diferentes para cada acorde
            </p>
          </div>
        </div>

        {/* Song Selector */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Escolha um exemplo ou cole sua cifra
          </h3>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setUseCustom(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !useCustom
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-white/60 hover:bg-zinc-700'
              }`}
            >
              Exemplos
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                useCustom
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-white/60 hover:bg-zinc-700'
              }`}
            >
              Cifra Personalizada
            </button>
          </div>

          {/* Example selector */}
          {!useCustom && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(EXAMPLE_SONGS) as Array<keyof typeof EXAMPLE_SONGS>).map((key) => {
                const song = EXAMPLE_SONGS[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSong(key)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      selectedSong === key
                        ? 'bg-blue-500/20 border-2 border-blue-500/40'
                        : 'bg-zinc-800 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-sm">{song.title}</div>
                    <div className="text-xs text-white/40 mt-1">{song.artist}</div>
                    {song.key && (
                      <div className="text-xs text-blue-400 mt-1">Tom: {song.key}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom text area */}
          {useCustom && (
            <div>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Cole ou digite sua cifra aqui...&#10;&#10;Exemplo:&#10;C          Am&#10;Aleluia, aleluia&#10;F              G&#10;Louvado seja o Senhor"
                className="w-full h-48 bg-zinc-800 border border-white/10 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500/50"
              />
              <p className="text-xs text-white/40 mt-2">
                Digite os acordes acima das letras. Suporta: C, Cm, C7, Cmaj7, Cm7, C°, C+, Csus4, C6, C9, Cadd9, etc.
              </p>
            </div>
          )}
        </div>

        {/* Main Study Component */}
        {displayText && (
          <IntegratedChordStudy
            text={displayText}
            className="animate-in fade-in duration-300"
          />
        )}

        {/* Info Footer */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-lg p-6 text-center space-y-2">
          <p className="text-sm text-white/60">
            💡 <strong>Dica:</strong> Clique em qualquer acorde da cifra para ver o diagrama de violão
          </p>
          <p className="text-xs text-white/40">
            Use os controles de transposição para mudar o tom • Suporta todos os 156 acordes da biblioteca
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChordStudyDemo;
