import React, { useState } from "react";
import { HelpCircle, X, Calendar, Music, ListMusic, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";

export const HelpButton: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoAnimate, setAutoAnimate] = useState(true);

  // Animação automática alternando entre expandido e colapsado
  React.useEffect(() => {
    if (!autoAnimate) return;

    const interval = setInterval(() => {
      setIsExpanded((prev) => !prev);
    }, 3000); // Alterna a cada 3 segundos

    return () => clearInterval(interval);
  }, [autoAnimate]);

  const handleClick = () => {
    setAutoAnimate(false); // Para a animação automática
    setIsExpanded(false); // Colapsa para mostrar apenas o ícone
    setIsOpen(true); // Abre o modal
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    // Reativa a animação automática quando fecha o modal
    setAutoAnimate(true);
    setIsExpanded(true);
  };

  const steps = [
    {
      icon: Calendar,
      title: "1. Criar Evento",
      description: "Toque em 'Novo Evento' e dê um nome (ex: Culto de Domingo, Ensaio).",
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: Music,
      title: "2. Adicionar Músicas",
      description: "Selecione o evento e toque no '+' para adicionar músicas ao repertório.",
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      icon: ListMusic,
      title: "3. Organizar Repertório",
      description: "Arraste as músicas para organizar a ordem de apresentação.",
      color: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      icon: Play,
      title: "4. Ensaiar!",
      description: "Toque na música para ver cifra, letra, PAD e metrônomo.",
      color: "from-green-500 to-green-600",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
    },
  ];

  // Detecta se está na página de eventos (criar/editar evento)
  const isEventsPage = location.pathname === '/events' || location.pathname.startsWith('/events/');

  return (
    <>
      {/* Botão Flutuante - Esconde na página de eventos */}
      {autoAnimate && !isEventsPage && (
        <button
          onClick={handleClick}
          className={`
            fixed bottom-16 right-4 z-40
            h-10 rounded-full
            bg-gradient-to-br from-[#1DB954] to-[#169347]
            text-black font-semibold
            shadow-md shadow-[#1DB954]/30
            hover:scale-105 hover:shadow-lg hover:shadow-[#1DB954]/40
            active:scale-95
            flex items-center justify-center gap-1.5
            border border-white/20
            animate-bounce-slow
            overflow-hidden
            ${isExpanded ? 'w-auto px-3' : 'w-10'}
          `}
          style={{
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label="Ajuda e instruções"
        >
          <span
            className={`
              whitespace-nowrap text-xs
              ${isExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}
            `}
            style={{
              transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            COMO USAR
          </span>
          <HelpCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
        </button>
      )}

      {/* Modal de Instruções */}
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg w-full bg-gradient-to-b from-[#1a1a1a] to-black border border-white/10 p-0 gap-0 max-h-[85vh] flex flex-col">
          <DialogTitle className="sr-only">Como Usar o App</DialogTitle>
          {/* Header */}
          <div className="relative overflow-hidden flex-shrink-0">
            {/* Background decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/20 via-transparent to-purple-500/10" />

            <div className="relative flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white mb-0.5">
                  Como Usar
                </h2>
                <p className="text-xs text-white/60">
                  Siga os passos abaixo para começar
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {/* Content - SCROLLABLE */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto space-y-4 flex-1">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="
                    group relative
                    bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10
                    hover:bg-white/10 hover:border-white/20
                    transition-all duration-300
                  "
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Brilho animado */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-start gap-3">
                    {/* Ícone */}
                    <div
                      className={`
                        flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${step.iconBg}
                        flex items-center justify-center
                        shadow-inner shadow-black/20
                      `}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${step.iconColor}`} strokeWidth={2} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Indicador de progresso */}
                  <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 to-white/5 rounded-full" />
                </div>
              );
            })}

            {/* Footer com dica extra */}
            <div className="bg-gradient-to-br from-[#1DB954]/10 to-purple-500/10 rounded-xl p-3 border border-[#1DB954]/20">
              <p className="text-xs text-white/60 text-center leading-relaxed">
                <span className="text-[#1DB954] font-semibold">Dica:</span> Toque e segure nos cards para ver mais opções como editar, compartilhar e apagar.
              </p>
            </div>
          </div>

          {/* Footer Button - FIXED */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <button
              onClick={handleCloseModal}
              className="
                w-full h-12 rounded-lg
                bg-gradient-to-r from-[#1DB954] to-[#169347]
                text-black font-bold text-sm
                hover:from-[#1ed760] hover:to-[#1DB954]
                transition-all duration-200
                active:scale-95
              "
            >
              Entendi!
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
