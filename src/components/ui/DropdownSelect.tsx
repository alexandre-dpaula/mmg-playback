import React, { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface DropdownSelectProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * DropdownSelect - Componente de seleção customizado premium
 * Visual moderno com gradientes, blur e animações suaves
 * Ideal para apps musicais e interfaces premium
 */
export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Encontra a opção selecionada
  const selectedOption = options.find((opt) => opt.value === value);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fecha dropdown ao pressionar ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Botão Principal */}
      <button
        type="button"
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleDropdown}
        className={`
          group relative w-auto
          flex items-center justify-center gap-2
          p-2.5 rounded-full
          bg-gradient-to-br from-zinc-900/90 to-black/90
          border-2 border-white/20
          backdrop-blur-xl
          text-white font-semibold text-sm
          transition-all duration-300 ease-out
          hover:border-white/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]
          focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/60
          active:scale-[0.98]
          ${isOpen ? "border-purple-400/60 shadow-[0_0_40px_rgba(139,92,246,0.5)]" : ""}
        `}
      >
        {/* Ícone */}
        {selectedOption?.icon && (
          <div className="flex-shrink-0 text-white/80 group-hover:text-white transition-colors">
            {selectedOption.icon}
          </div>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-white/60 transition-all duration-300 ${
            isOpen ? "rotate-180 text-purple-400" : "group-hover:text-white/80"
          }`}
        />

        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Opções"
          className="absolute top-full right-0 mt-2 w-full min-w-[220px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="relative">
            {/* Background com blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-2xl rounded-2xl border-2 border-white/20 shadow-2xl shadow-purple-500/20" />

            {/* Opções */}
            <div className="relative py-2 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {options.map((option, index) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      group/option w-full
                      flex items-center gap-3
                      px-5 py-3
                      text-left text-base font-medium
                      transition-all duration-200
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-white border-l-4 border-purple-400"
                          : "text-white/70 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                      }
                      ${index === 0 ? "rounded-t-2xl" : ""}
                      ${index === options.length - 1 ? "rounded-b-2xl" : ""}
                    `}
                  >
                    {/* Ícone */}
                    {option.icon && (
                      <div
                        className={`flex-shrink-0 transition-all duration-200 ${
                          isSelected
                            ? "text-purple-400 scale-110"
                            : "text-white/60 group-hover/option:text-white/90 group-hover/option:scale-105"
                        }`}
                      >
                        {option.icon}
                      </div>
                    )}

                    {/* Label */}
                    <span className="flex-1">{option.label}</span>

                    {/* Checkmark para item selecionado */}
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-purple-400 animate-in zoom-in duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
