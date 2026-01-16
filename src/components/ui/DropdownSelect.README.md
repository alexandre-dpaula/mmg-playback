# DropdownSelect - Componente de Seleção Premium

## 📋 Visão Geral

`DropdownSelect` é um componente de dropdown customizado e reutilizável criado para o **SetlistGO™**. Oferece uma experiência visual moderna e premium, ideal para apps musicais e interfaces dark mode.

## ✨ Características

- ✅ **Não usa `<select>` nativo** - Controle total do visual
- ✅ **Visual premium** com gradientes, blur e animações suaves
- ✅ **Totalmente tipado** com TypeScript
- ✅ **Acessível** com roles ARIA corretos
- ✅ **Responsivo** e otimizado para mobile
- ✅ **Customizável** com ícones e estilos
- ✅ **Fecha ao clicar fora** ou pressionar ESC
- ✅ **Animações fluidas** (200-300ms)

## 🎨 Visual

### Botão Principal
- Formato pill (rounded-full)
- Gradiente de fundo (zinc-900 → black)
- Borda com glow no hover
- Backdrop blur
- Ícone + Label + Chevron
- Escala suave no active (scale-98%)

### Dropdown Panel
- Gradiente de fundo com backdrop-blur
- Borda com glow roxo
- Opção selecionada com destaque visual
- Checkmark animado no item selecionado
- Hover suave em cada opção
- Scroll suave com scrollbar customizada

## 🚀 Instalação

O componente já está criado em:
```
src/components/ui/DropdownSelect.tsx
```

## 📖 Como Usar

### Uso Básico

```tsx
import { DropdownSelect, DropdownOption } from "@/components/ui/DropdownSelect";
import { Guitar, Piano } from "lucide-react";

const options: DropdownOption[] = [
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

function MyComponent() {
  const [selected, setSelected] = useState("guitar");

  return (
    <DropdownSelect
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Selecione um instrumento"
    />
  );
}
```

### Exemplo Completo: InstrumentSelector

Veja o arquivo `src/components/InstrumentSelector.tsx` para um exemplo real de uso.

```tsx
import { InstrumentSelector } from "@/components/InstrumentSelector";

function StudiesHub() {
  const [instrument, setInstrument] = useState<"guitar" | "keyboard">("guitar");

  return (
    <InstrumentSelector
      value={instrument}
      onChange={setInstrument}
    />
  );
}
```

## 🔧 Props

### DropdownSelectProps

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `options` | `DropdownOption[]` | ✅ | - | Array de opções |
| `value` | `string` | ✅ | - | Valor selecionado |
| `onChange` | `(value: string) => void` | ✅ | - | Callback ao mudar |
| `placeholder` | `string` | ❌ | `"Selecione..."` | Texto quando nenhum valor |
| `className` | `string` | ❌ | `""` | Classes CSS adicionais |

### DropdownOption

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `value` | `string` | ✅ | Valor único da opção |
| `label` | `string` | ✅ | Texto exibido |
| `icon` | `ReactNode` | ❌ | Ícone (geralmente Lucide) |

## 🎯 Casos de Uso

### 1. Seletor de Instrumento
```tsx
const instruments: DropdownOption[] = [
  { value: "guitar", label: "Violão", icon: <Guitar /> },
  { value: "piano", label: "Piano", icon: <Piano /> },
  { value: "drums", label: "Bateria", icon: <Drum /> },
];
```

### 2. Seletor de Tom
```tsx
const keys: DropdownOption[] = [
  { value: "C", label: "Dó (C)" },
  { value: "D", label: "Ré (D)" },
  { value: "E", label: "Mi (E)" },
  // ...
];
```

### 3. Seletor de Acorde
```tsx
const chords: DropdownOption[] = [
  { value: "C", label: "C - Dó Maior" },
  { value: "Cm", label: "Cm - Dó Menor" },
  { value: "C7", label: "C7 - Dó com Sétima" },
  // ...
];
```

### 4. Seletor de Campo Harmônico
```tsx
const fields: DropdownOption[] = [
  { value: "major", label: "Campo Harmônico Maior" },
  { value: "minor", label: "Campo Harmônico Menor" },
  { value: "mixolydian", label: "Modo Mixolídio" },
  // ...
];
```

## ⌨️ Acessibilidade

- **role="button"** no botão principal
- **role="listbox"** no painel de opções
- **role="option"** em cada item
- **aria-haspopup="listbox"** no botão
- **aria-expanded** indica se está aberto
- **aria-selected** indica item selecionado
- **Teclado**: ESC fecha o dropdown
- **Foco visual** com ring roxo

## 🎨 Customização

### Alterar Cores

Edite as classes Tailwind no arquivo `DropdownSelect.tsx`:

```tsx
// Botão principal - linha ~70
className="... border-purple-400/60 ..."

// Item selecionado - linha ~145
className="... from-purple-600/30 to-purple-500/20 ..."
```

### Alterar Tamanho

```tsx
// Botão principal
className="... px-5 py-3.5 ..." // Ajuste padding

// Dropdown
className="... max-h-[280px] ..." // Altura máxima
```

### Adicionar Efeitos

```tsx
// Adicione mais camadas de gradiente
<div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-20 blur-2xl -z-30" />
```

## 🔄 Animações

- **Entrada do dropdown**: `fade-in` + `slide-in-from-top-2`
- **Chevron**: rotação 180° quando aberto
- **Checkmark**: `zoom-in` quando aparece
- **Hover**: escala + cores suaves
- **Active**: `scale-[0.98]`

## 📱 Responsividade

- **min-w-[220px]**: largura mínima do botão
- **w-full**: ocupa largura disponível
- **max-h-[280px]**: scroll no dropdown
- **Scrollbar customizada**: thin, thumb branca/10

## 🐛 Troubleshooting

### Dropdown não fecha ao clicar fora
Verifique se o `dropdownRef` está sendo aplicado corretamente no container principal.

### Ícones não aparecem
Certifique-se de que está passando um ReactNode válido (ex: `<Guitar className="w-5 h-5" />`).

### Estilos não aplicados
Verifique se o Tailwind está configurado para incluir os arquivos do componente:

```js
// tailwind.config.js
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
]
```

## 📦 Dependências

- `react` ^18.0.0
- `lucide-react` (para ícones)
- `tailwindcss` (para estilos)

## 🚀 Próximos Passos

- [ ] Adicionar suporte a busca/filtro nas opções
- [ ] Adicionar navegação por teclado (setas)
- [ ] Adicionar suporte a múltipla seleção
- [ ] Adicionar variantes de tamanho (sm, md, lg)
- [ ] Adicionar temas (light, dark, purple, blue)

## 📄 Licença

Componente criado para uso interno no **SetlistGO™**.

---

**Desenvolvido com ❤️ para músicos e equipes de louvor**
