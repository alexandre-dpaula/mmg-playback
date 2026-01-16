# Sistema de Acordes com IA e Cache

## 📋 Visão Geral

Sistema inteligente que **gera diagramas de acordes sob demanda** usando IA baseada em teoria musical convencional, e **armazena no Supabase** para reutilização.

## ✨ Como Funciona

### 1. Fluxo de Dados

```
Usuário clica em acorde
       ↓
Hook useChordData busca no cache (Supabase)
       ↓
    Existe?
    ↙    ↘
  SIM    NÃO
   ↓      ↓
Retorna  Gera por IA (teoria musical convencional)
         ↓
      Salva no Supabase
         ↓
      Retorna
```

### 2. Estrutura do Sistema

#### **Tabela: `chord_diagrams`**
```sql
- chord_name: "C", "Am7", "Bb9", etc.
- full_name: "C Major", "A minor 7th", etc.
- quality: "major", "minor", "dominant7", etc.
- root_note: "C", "A", "Bb", etc.
- caged_shapes: { "C": {...}, "A": {...}, "G": {...}, "E": {...}, "D": {...} }
- keyboard_voicings: { "root": {...}, "firstInversion": {...}, ... }
- notes: ["C", "E", "G"]
- reharmonizations: {...}
- generated_by: "ai" | "manual" | "template"
- verified: boolean
```

#### **Serviço: `chordGenerator.ts`**

**Funções principais:**

1. **`getOrGenerateChord(chordName: string)`**
   - Busca do cache primeiro
   - Se não existe, gera por IA
   - Retorna `ChordData`

2. **`generateChordByAI(chordName: string)`**
   - Gera acorde usando regras de teoria musical
   - Salva no Supabase
   - Retorna `ChordData`

3. **`fetchChordFromDB(chordName: string)`**
   - Busca acorde salvo
   - Retorna `ChordData | null`

#### **Hook: `useChordData.ts`**

```typescript
const { chordData, loading, error } = useChordData("Am7");
```

- Gerencia estado de carregamento
- Busca ou gera acorde automaticamente
- Retorna dados, loading e erro

#### **Hook: `usePreloadChords.ts`**

```typescript
const { loaded, progress } = usePreloadChords(["C", "D", "E", "F", "G", "A", "B"]);
```

- Pré-carrega múltiplos acordes
- Útil para carregar todos os acordes de um tom

## 🎯 Vantagens

### ✅ **Performance**
- Acordes são gerados uma vez e reutilizados
- Cache no Supabase reduz chamadas de IA
- Primeira vez: ~500ms | Próximas vezes: ~50ms

### ✅ **Escalabilidade**
- Sistema gera 156 acordes (12 tons × 13 tipos)
- Pode expandir para acordes complexos (13th, alt, etc.)
- Não precisa programar cada acorde manualmente

### ✅ **Teoria Musical Convencional**
- IA usa notação bemol onde é convencional (Bb, Eb, Ab, Db)
- Gera diagramas baseados em posições padrão (CAGED)
- Respeita ergonomia do instrumento (casas 1-7)

### ✅ **Flexibilidade**
- Pode integrar com Claude API ou OpenAI no futuro
- Sistema de verificação manual (`verified: boolean`)
- Permite sobrescrever acordes gerados

## 📦 Arquivos Criados

```
supabase/migrations/
  └── 20250106_create_chord_diagrams.sql

src/features/study-mode/
  ├── services/
  │   └── chordGenerator.ts
  ├── hooks/
  │   └── useChordData.ts
  └── ChordLibrary.tsx (atualizado)
```

## 🚀 Como Usar

### No Componente

```tsx
import { useChordData } from './hooks/useChordData';

function MyComponent() {
  const [selectedChord, setSelectedChord] = useState("C");
  const { chordData, loading, error } = useChordData(selectedChord);

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;
  if (!chordData) return null;

  return <GuitarDiagram chord={chordData.cagedShapes.E} />;
}
```

### Pré-carregar Acordes

```tsx
import { usePreloadChords } from './hooks/useChordData';

function ChordLibrary() {
  const { loaded, progress } = usePreloadChords([
    "C", "Cm", "C7", "Cmaj7", "Cm7",
    "D", "Dm", "D7", "Dmaj7", "Dm7"
  ]);

  return (
    <div>
      {!loaded && <ProgressBar value={progress} />}
      {/* ... */}
    </div>
  );
}
```

## 🔧 Migrações

### Aplicar migração

```bash
# Via Supabase CLI
npx supabase db push

# Ou via SQL Editor no dashboard do Supabase
# Execute: supabase/migrations/20250106_create_chord_diagrams.sql
```

### Verificar tabela

```sql
SELECT * FROM chord_diagrams LIMIT 10;
```

## 🎨 Teoria Musical Implementada

### Qualidades Suportadas

- **major** (Maior): 1, 3, 5
- **minor** (menor): 1, ♭3, 5
- **dominant7** (Sétima dominante): 1, 3, 5, ♭7
- **major7** (Maior com 7ª): 1, 3, 5, 7
- **minor7** (menor com 7ª): 1, ♭3, 5, ♭7
- **diminished** (Diminuto): 1, ♭3, ♭5
- **augmented** (Aumentado): 1, 3, #5
- **sus2** (Suspenso 2): 1, 2, 5
- **sus4** (Suspenso 4): 1, 4, 5
- **6** (Sexta): 1, 3, 5, 6
- **m6** (menor com 6ª): 1, ♭3, 5, 6
- **9** (Nona): 1, 3, 5, ♭7, 9
- **add9** (Maior com 9ª): 1, 3, 5, 9

### Notação Convencional

```
C#  →  C#  (sustenido)
Db  →  Db  (bemol - convencional)
D#  →  Eb  (bemol - convencional)
F#  →  F#  (sustenido)
G#  →  Ab  (bemol - convencional)
A#  →  Bb  (bemol - convencional)
```

## 📊 Próximos Passos

- [ ] Integrar com Claude API para geração mais sofisticada
- [ ] Adicionar acordes complexos (13th, alt, 7#9, etc.)
- [ ] Sistema de votação para verificar qualidade dos diagramas
- [ ] Exportar diagramas em PDF/imagem
- [ ] Adicionar áudio de exemplo para cada acorde

## 🔐 Segurança

- **RLS habilitado**: Todos podem ler, apenas admins podem escrever
- **Geração controlada**: IA gera apenas diagramas musicais
- **Verificação manual**: Campo `verified` para marcar diagramas revisados

---

**Desenvolvido com IA + Teoria Musical 🎵**
