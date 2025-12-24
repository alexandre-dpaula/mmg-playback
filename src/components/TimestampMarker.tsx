import React, { useState, useEffect } from "react";
import { Clock, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TimestampMarkerProps {
  isOpen: boolean;
  onClose: () => void;
  cifraContent: string;
  currentTimestamps: Record<string, number>;
  onSave: (timestamps: Record<string, number>) => Promise<void>;
  getCurrentTime: () => number; // Função para pegar o tempo atual do YouTube
}

export const TimestampMarker: React.FC<TimestampMarkerProps> = ({
  isOpen,
  onClose,
  cifraContent,
  currentTimestamps,
  onSave,
  getCurrentTime,
}) => {
  const [timestamps, setTimestamps] = useState<Record<string, number>>(currentTimestamps);
  const [isSaving, setIsSaving] = useState(false);

  // Extrai as seções da cifra
  const sections = React.useMemo(() => {
    const sectionRegex = /\[([^\]]+)\]/g;
    const found: string[] = [];
    const seen = new Set<string>();
    let match;

    while ((match = sectionRegex.exec(cifraContent)) !== null) {
      const sectionText = match[1].trim();
      const sectionId = normalizeSectionId(sectionText);

      if (sectionId && !seen.has(sectionId)) {
        seen.add(sectionId);
        found.push(sectionId);
      }
    }

    return found;
  }, [cifraContent]);

  // Normaliza o nome da seção para criar um ID
  function normalizeSectionId(sectionText: string): string {
    let rawType = sectionText.toUpperCase().trim();

    if (rawType.startsWith("VERSE") || rawType.startsWith("VERSO")) {
      const num = rawType.replace(/VERSE|VERSO/, "").trim();
      return num ? `V${num}` : "V1";
    }
    if (rawType.startsWith("SOLO")) {
      const num = rawType.replace("SOLO", "").trim();
      return num ? `S${num}` : "S";
    }
    if (rawType.startsWith("CHORUS") || rawType.startsWith("REFRÃO") || rawType.startsWith("REFRAO")) {
      const num = rawType.replace(/CHORUS|REFRÃO|REFRAO/, "").trim();
      return num ? `C${num}` : "C";
    }
    if (rawType.startsWith("PRÉ-REFRÃO") || rawType.startsWith("PRE-CHORUS") || rawType === "PR" || rawType === "PC") {
      return "PR";
    }
    if (rawType.startsWith("PONTE") || rawType.startsWith("PO")) {
      return "PO";
    }
    if (rawType.startsWith("BRIDGE")) {
      const num = rawType.replace("BRIDGE", "").trim();
      return num ? `B${num}` : "B";
    }
    if (rawType.startsWith("INTRO")) return "I";
    if (rawType.startsWith("TURNAROUND") || rawType === "TA") return "TA";
    if (rawType.startsWith("RIFF") || rawType.startsWith("RF")) return "RF";
    if (rawType.startsWith("OUTRO") || rawType === "O") return "O";
    if (rawType.startsWith("INSTRU") || rawType === "IS" || rawType === "IN") return "IS";
    if (rawType.startsWith("INTERL") || rawType === "IT") return "IT";

    // Se não reconhecer, retorna com número de seção genérico
    const match = rawType.match(/(\d+)$/);
    if (match) {
      return `S${match[1]}`;
    }
    return rawType.substring(0, 3).toUpperCase();
  }

  const handleMarkTime = (sectionId: string) => {
    const currentTime = getCurrentTime();
    setTimestamps((prev) => ({
      ...prev,
      [sectionId]: Math.floor(currentTime), // Arredonda para inteiro
    }));
    toast.success(`Marcado ${sectionId} em ${formatTime(currentTime)}`);
  };

  const handleDeleteTime = (sectionId: string) => {
    setTimestamps((prev) => {
      const newTimestamps = { ...prev };
      delete newTimestamps[sectionId];
      return newTimestamps;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(timestamps);
      toast.success("Timestamps salvos com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar timestamps:", error);
      toast.error("Não foi possível salvar os timestamps");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#121212] rounded-2xl flex flex-col shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Marcar Tempos da Música
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Toque a música e clique em "Marcar" quando cada seção começar
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Clock className="h-12 w-12 text-white/20 mb-3" />
              <p className="text-white/60">
                Nenhuma seção encontrada na cifra
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((sectionId) => (
                <div
                  key={sectionId}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-white font-semibold text-lg">
                      [{sectionId}]
                    </h3>
                    {timestamps[sectionId] !== undefined && (
                      <p className="text-[#1DB954] text-sm mt-1">
                        {formatTime(timestamps[sectionId])}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {timestamps[sectionId] !== undefined && (
                      <button
                        onClick={() => handleDeleteTime(sectionId)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <Button
                      onClick={() => handleMarkTime(sectionId)}
                      size="sm"
                      className={`${
                        timestamps[sectionId] !== undefined
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                      }`}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      {timestamps[sectionId] !== undefined ? "Remarcar" : "Marcar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex justify-between gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-white/10 text-white hover:bg-white/20 border-0"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || Object.keys(timestamps).length === 0}
            className="flex-1 bg-[#1DB954] text-black hover:bg-[#1ed760] font-semibold"
          >
            {isSaving ? (
              <>Salvando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Timestamps
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
