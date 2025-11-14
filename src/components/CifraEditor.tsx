import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Save } from "lucide-react";
import { updateCifraContent } from "@/lib/supabase";
import { toast } from "sonner";

type CifraEditorProps = {
  cifraUrl: string;
  initialContent: string;
  onClose: () => void;
  onSave: (newContent: string) => void;
};

export const CifraEditor: React.FC<CifraEditorProps> = ({
  cifraUrl,
  initialContent,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("O conteúdo não pode estar vazio");
      return;
    }

    setIsSaving(true);

    try {
      await updateCifraContent(cifraUrl, content);
      toast.success("Cifra atualizada com sucesso!");
      onSave(content); // Atualiza o conteúdo no componente pai
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar cifra";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-[#121212] rounded-2xl flex flex-col shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Editar Cifra</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 p-4 sm:p-5 overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full bg-black/40 text-white font-mono text-base sm:text-lg p-4 sm:p-6 rounded-lg border border-white/20 focus:border-[#1DB954] focus:outline-none resize-none leading-relaxed"
            placeholder="Cole ou edite o conteúdo da cifra aqui..."
            disabled={isSaving}
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={isSaving || content === initialContent}
            className="bg-[#1DB954] text-black hover:bg-[#1ed760] font-semibold px-8 sm:px-12 py-2.5 sm:py-3 text-base sm:text-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
