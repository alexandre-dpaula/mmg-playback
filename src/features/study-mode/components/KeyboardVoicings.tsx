import React, { useState } from "react";
import { KeyboardChord } from "../types";
import { KeyboardDiagram } from "./KeyboardDiagram";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

interface VoicingOption {
  name: string;
  description: string;
  chord: KeyboardChord;
}

interface KeyboardVoicingsProps {
  voicings: {
    root: KeyboardChord;
    firstInversion?: KeyboardChord;
    secondInversion?: KeyboardChord;
    thirdInversion?: KeyboardChord;
    openVoicing?: KeyboardChord;
  };
  chordName: string;
  className?: string;
}

/**
 * Componente para navegar entre inversões e voicings de teclado
 * Permite explorar: posição fundamental, inversões, voicing aberto
 */
export const KeyboardVoicings: React.FC<KeyboardVoicingsProps> = ({
  voicings,
  chordName,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // Monta lista de voicings disponíveis
  const availableVoicings: VoicingOption[] = [];

  if (voicings.root) {
    availableVoicings.push({
      name: "Posição Fundamental",
      description: "Notas na ordem natural: raiz, terça, quinta",
      chord: voicings.root,
    });
  }

  if (voicings.firstInversion) {
    availableVoicings.push({
      name: "1ª Inversão",
      description: "Terça no baixo",
      chord: voicings.firstInversion,
    });
  }

  if (voicings.secondInversion) {
    availableVoicings.push({
      name: "2ª Inversão",
      description: "Quinta no baixo",
      chord: voicings.secondInversion,
    });
  }

  if (voicings.thirdInversion) {
    availableVoicings.push({
      name: "3ª Inversão",
      description: "Sétima no baixo",
      chord: voicings.thirdInversion,
    });
  }

  if (voicings.openVoicing) {
    availableVoicings.push({
      name: "Voicing Aberto",
      description: "Notas com maior espaçamento (intervalos maiores que uma oitava)",
      chord: voicings.openVoicing,
    });
  }

  if (availableVoicings.length === 0) {
    return (
      <div className="text-center text-white/60 py-12">
        <p>Nenhum voicing disponível para este acorde</p>
      </div>
    );
  }

  const currentVoicing = availableVoicings[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? availableVoicings.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === availableVoicings.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{chordName} - Teclado</h3>
          <p className="text-sm text-white/60 mt-1">{currentVoicing.name}</p>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
        >
          <Info className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Info sobre inversões */}
      {showInfo && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-sm text-white/80">
          <p className="font-semibold mb-2">Inversões e Voicings</p>
          <p className="mb-2">
            <strong>Inversões:</strong> Reorganizam as notas do acorde mantendo as mesmas notas,
            mas mudando qual está no baixo.
          </p>
          <p>
            <strong>Voicing Aberto:</strong> Espaça as notas além de uma oitava, criando
            uma sonoridade mais rica e profissional.
          </p>
        </div>
      )}

      {/* Descrição do voicing atual */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-sm text-white/70">{currentVoicing.description}</p>
      </div>

      {/* Diagrama do teclado */}
      <div className="bg-black/20 rounded-xl p-6 border border-white/10">
        <KeyboardDiagram
          chord={currentVoicing.chord}
          voicingName={currentVoicing.name}
          showLabels
          highlightRoot
        />
      </div>

      {/* Navegação entre voicings */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all"
          aria-label="Voicing anterior"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Indicadores */}
        <div className="flex items-center gap-2">
          {availableVoicings.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-purple-500"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all"
          aria-label="Próximo voicing"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Info da posição */}
      <div className="text-center text-sm text-white/50">
        <span>Voicing {currentIndex + 1} de {availableVoicings.length}</span>
      </div>
    </div>
  );
};
