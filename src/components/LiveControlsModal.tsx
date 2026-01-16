import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { PadControls } from "./PadControls";
import { MetronomeControls } from "./MetronomeControls";

interface LiveControlsModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Props do PAD
  isPadPlaying: boolean;
  onPadToggle: () => void;
  currentPadKey: string | null;
  onPadKeyChange: (key: string) => void;

  // Props do Metrônomo
  isMetronomePlaying: boolean;
  onMetronomeToggle: () => void;
  metronomeBpm: number;
  onBpmChange: (bpm: number) => void;
}

export const LiveControlsModal: React.FC<LiveControlsModalProps> = ({
  isOpen,
  onClose,
  isPadPlaying,
  onPadToggle,
  currentPadKey,
  onPadKeyChange,
  isMetronomePlaying,
  onMetronomeToggle,
  metronomeBpm,
  onBpmChange,
}) => {
  const [activeTab, setActiveTab] = useState<"pad" | "metronome">("pad");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full bg-gradient-to-b from-[#1a1a1a] to-black border border-white/10 p-0 gap-0">
        <DialogTitle className="sr-only">Controles Ao Vivo - PAD e Metrônomo</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Ao Vivo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("pad")}
            className={`flex-1 py-3 text-sm font-semibold uppercase transition-all ${
              activeTab === "pad"
                ? "text-[#1DB954] border-b-2 border-[#1DB954]"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            PAD
          </button>
          <button
            onClick={() => setActiveTab("metronome")}
            className={`flex-1 py-3 text-sm font-semibold uppercase transition-all ${
              activeTab === "metronome"
                ? "text-[#1DB954] border-b-2 border-[#1DB954]"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Metrônomo
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {activeTab === "pad" ? (
            <PadControls
              isPadPlaying={isPadPlaying}
              onPadToggle={onPadToggle}
              currentPadKey={currentPadKey}
              onPadKeyChange={onPadKeyChange}
            />
          ) : (
            <MetronomeControls
              isMetronomePlaying={isMetronomePlaying}
              onMetronomeToggle={onMetronomeToggle}
              metronomeBpm={metronomeBpm}
              onBpmChange={onBpmChange}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
