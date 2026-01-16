import React from "react";
import { Guitar, Piano } from "lucide-react";
import { DropdownSelect, DropdownOption } from "./ui/DropdownSelect";

export interface InstrumentSelectorProps {
  value: "guitar" | "keyboard";
  onChange: (instrument: "guitar" | "keyboard") => void;
  className?: string;
}

/**
 * InstrumentSelector - Seletor de instrumento para o Modo Estudo
 * Permite escolher entre Violão e Teclado
 * Usa o componente DropdownSelect customizado
 */
export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const instrumentOptions: DropdownOption[] = [
    {
      value: "guitar",
      label: "Violão",
      icon: <Guitar className="w-5 h-5" />,
    },
    {
      value: "keyboard",
      label: "Teclado",
      icon: <Piano className="w-5 h-5" />,
    },
  ];

  return (
    <DropdownSelect
      options={instrumentOptions}
      value={value}
      onChange={(newValue) => onChange(newValue as "guitar" | "keyboard")}
      placeholder="Instrumento"
      className={className}
    />
  );
};

export default InstrumentSelector;
