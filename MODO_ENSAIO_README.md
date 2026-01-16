# 🎓 MODO ENSAIO / ESTUDOS - Documentação

## 📋 Visão Geral

O **Modo Ensaio / Estudos** é uma nova feature do SetlistGO™ que permite aos músicos estudarem acordes, posições no braço do violão/teclado e explorarem sugestões harmônicas.

---

## 🎯 Funcionalidades Implementadas

### 1. Dashboard Pós-Login
- **Arquivo:** [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx)
- Dois cards principais:
  - 🎤 **Eventos** → Navega para `/events`
  - 🎓 **Ensaios / Estudos** → Navega para `/studies`
- Design responsivo para tablet
- Gradientes visuais e hover effects

### 2. Integração com Músicas
- **Arquivo:** [src/pages/TrackDetails.tsx](src/pages/TrackDetails.tsx)
- Botão 🎓 **Ensaio** adicionado na barra superior
- Navega para `/study/:songId`
- Ícone `GraduationCap` com cor azul

### 3. Página de Estudos por Música
- **Arquivo:** [src/features/study-mode/StudyModePage.tsx](src/features/study-mode/StudyModePage.tsx)
- Lista horizontal de acordes da música
- Seleção de instrumento (Violão/Teclado)
- Diagramas interativos
- Sugestões harmônicas

---

## 🗂️ Estrutura de Arquivos

```
src/
├── pages/
│   ├── Dashboard.tsx                    # Dashboard pós-login
│   └── TrackDetails.tsx                 # Integração do botão Ensaio
│
├── features/study-mode/
│   ├── StudyModePage.tsx                # Página principal de estudos
│   ├── types.ts                         # Tipos TypeScript
│   │
│   ├── components/
│   │   ├── GuitarChordDiagram.tsx       # Diagrama de violão (SVG)
│   │   ├── KeyboardChordDiagram.tsx     # Diagrama de teclado (SVG)
│   │   ├── ChordVariationCarousel.tsx   # Carrossel de variações
│   │   └── HarmonicSuggestions.tsx      # Sugestões de reharmonização
│   │
│   └── hooks/
│       ├── useChordShapes.ts            # Query para shapes
│       ├── useChordRelations.ts         # Query para relações harmônicas
│       └── useSongChords.ts             # Query para acordes da música
│
└── App.tsx                              # Rotas configuradas

supabase/migrations/
└── 20260103_create_study_mode_tables.sql  # Schema do banco de dados
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Criadas

#### 1. `chord_shapes`
Armazena shapes de acordes (posições) para violão e teclado.

```sql
CREATE TABLE chord_shapes (
  id UUID PRIMARY KEY,
  chord_name TEXT NOT NULL,           -- Ex: "C", "Am7", "G/B"
  instrument TEXT NOT NULL,            -- "guitar" | "keyboard"
  variation_name TEXT NOT NULL,        -- Ex: "Posição Aberta", "Barre 3ª casa"
  shape_data JSONB NOT NULL,           -- Dados do shape (frets, notes, etc)
  church_id UUID REFERENCES churches(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**shape_data para violão:**
```json
{
  "frets": ["x", 3, 2, 0, 1, 0],
  "base_fret": 1,
  "fingers": [null, 3, 2, null, 1, null],
  "barres": [{"fret": 1, "fromString": 0, "toString": 5}]
}
```

**shape_data para teclado:**
```json
{
  "notes": ["C", "E", "G"],
  "octaves": [4, 4, 4],
  "voicing_type": "closed",
  "inversion": 0
}
```

#### 2. `song_chords`
Lista de acordes usados em cada música.

```sql
CREATE TABLE song_chords (
  id UUID PRIMARY KEY,
  song_id UUID REFERENCES tracks(id),
  chord_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  church_id UUID REFERENCES churches(id),
  created_at TIMESTAMP
);
```

#### 3. `chord_relations`
Relações harmônicas para sugestões de reharmonização.

```sql
CREATE TABLE chord_relations (
  id UUID PRIMARY KEY,
  chord_from TEXT NOT NULL,
  chord_to TEXT NOT NULL,
  relation_type TEXT NOT NULL,  -- "substitute" | "parallel" | "relative" | "dominant" | "altered_bass"
  church_id UUID REFERENCES churches(id),
  created_at TIMESTAMP
);
```

### RLS (Row Level Security)
- ✅ Todas as tabelas têm RLS ativado
- ✅ Isolamento por `church_id` (multi-tenant)
- ✅ Políticas para SELECT, INSERT, UPDATE, DELETE

### Seed Data
- ✅ Shapes básicos de violão (C, G, Am, F, D)
- ✅ Relações harmônicas comuns (C → Am, G → G7, etc)
- ✅ Podem ser compartilhados globalmente (`church_id = NULL`)

---

## 🎸 Componentes

### GuitarChordDiagram.tsx
Renderiza um diagrama SVG do braço de violão.

**Props:**
```typescript
interface GuitarChordDiagramProps {
  chordName: string;
  shapeData: GuitarShapeData;
  className?: string;
}
```

**Recursos:**
- 6 cordas verticais
- 5 trastes horizontais
- Pestanas (barres) renderizadas
- Símbolos `x` (mute) e `o` (corda solta)
- Números dos dedos (1, 2, 3, 4)
- Indicação da casa base

### KeyboardChordDiagram.tsx
Renderiza um diagrama SVG de teclado (piano).

**Props:**
```typescript
interface KeyboardChordDiagramProps {
  chordName: string;
  shapeData: KeyboardShapeData;
  className?: string;
}
```

**Recursos:**
- 2 oitavas (C4 a B5)
- Teclas brancas e pretas
- Destaque das notas ativas
- Labels de voicing e inversão

### ChordVariationCarousel.tsx
Carrossel para navegar entre variações de um acorde.

**Recursos:**
- Navegação com setas (← →)
- Indicadores de página (dots)
- Filtra por instrumento selecionado
- Responsivo

### HarmonicSuggestions.tsx
Mostra acordes relacionados para reharmonização.

**Recursos:**
- Agrupa sugestões por tipo de relação
- Cores diferentes por tipo (substituta, relativa, dominante, etc)
- Clique para selecionar acorde sugerido
- Dica explicativa

---

## 🔌 Hooks de Dados

### useChordShapes
Busca shapes de um acorde específico.

```typescript
const { data: shapes, isLoading } = useChordShapes("C");
```

### useChordRelations
Busca relações harmônicas de um acorde.

```typescript
const { data: relations, isLoading } = useChordRelations("C");
```

### useSongChords
Busca os acordes de uma música.

```typescript
const { data: chords, isLoading } = useSongChords(songId);
```

---

## 🛣️ Rotas Configuradas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/dashboard` | Dashboard | Dashboard pós-login com cards |
| `/events` | Events | Lista de eventos (já existia) |
| `/study/:songId` | StudyModePage | Modo de estudos de uma música |

**Navegação oculta:**
- Sidebar e MobileNav são ocultados nas rotas `/track/*` e `/study/*`

---

## 🎨 UX & Design

### Cores
- **Violão:** Verde/Azul
- **Teclado:** Azul
- **Ensaios:** Gradiente azul
- **Eventos:** Gradiente roxo

### Ícones (Lucide React)
- 🎓 `GraduationCap` - Modo Ensaio
- 🎸 `Guitar` - Violão
- 🎹 `Piano` - Teclado
- 💡 `Lightbulb` - Sugestões harmônicas
- ⬅️ `ArrowLeft` - Voltar
- ⬅️➡️ `ChevronLeft`, `ChevronRight` - Navegação

### Responsividade
- Grid layout: `grid-cols-1 lg:grid-cols-2`
- Cards com `hover:scale-[1.02]`
- SVGs responsivos com `viewBox`

---

## 🚀 Como Usar

### 1. Executar Migration SQL
```bash
# No Supabase SQL Editor, execute:
supabase/migrations/20260103_create_study_mode_tables.sql
```

Isso criará:
- 3 tabelas (`chord_shapes`, `song_chords`, `chord_relations`)
- Políticas RLS
- Seed data com shapes básicos

### 2. Acessar Modo Ensaio

**Opção A: Via Dashboard**
1. Faça login
2. Clique no card "Ensaios / Estudos"
3. (Ainda não implementado: lista de músicas para estudar)

**Opção B: Via Música**
1. Abra uma música (TrackDetails)
2. Clique no botão 🎓 no canto superior direito
3. Você será levado para `/study/:songId`

### 3. Estudar Acordes
1. Selecione instrumento (Violão ou Teclado)
2. Clique em um acorde na lista horizontal
3. Veja diagramas e variações
4. Explore sugestões harmônicas

---

## 🔮 Próximos Passos (Futuro)

### Funcionalidades Sugeridas

1. **Lista de Músicas no `/studies`**
   - Mostrar todas as músicas com acordes cadastrados
   - Busca por nome ou acorde
   - Filtro por tag

2. **Importação Automática de Acordes**
   - Parsear cifras do CifraClub
   - Extrair acordes automaticamente
   - Salvar em `song_chords`

3. **Editor de Shapes**
   - Interface para criar/editar shapes
   - Salvar shapes personalizados por igreja
   - Importar shapes de biblioteca pública

4. **Audio Playback**
   - Tocar som do acorde
   - MIDI synth para teclado
   - Samples de violão

5. **Quiz de Acordes**
   - Modo de treino
   - Identificação auditiva
   - Gamificação

6. **Progressões Harmônicas**
   - Criar progressões personalizadas
   - Sugestões baseadas em teoria musical
   - Loop de progressão com metrônomo

7. **Premium Features**
   - Shapes avançados (jazz voicings, extended chords)
   - Análise harmônica automática
   - Sugestões de reharmonização IA

---

## 📚 Referências Técnicas

### Bibliotecas Usadas
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching
- **React Router** - Routing
- **Supabase** - Backend (PostgreSQL + Auth + RLS)
- **Lucide React** - Icons
- **TailwindCSS** - Styling

### Padrões de Código
- ✅ Componentes funcionais com hooks
- ✅ Props interfaces tipadas
- ✅ Query keys consistentes
- ✅ SVG inline para performance
- ✅ Comentários JSDoc
- ✅ Nomes descritivos

### Performance
- Query caching com TanStack Query
- SVG renderizado client-side (leve)
- Lazy loading (pode ser adicionado)
- Imagens otimizadas

---

## ✅ Checklist de Implementação

- [x] Dashboard pós-login
- [x] Estrutura de pastas
- [x] Tabelas no Supabase
- [x] RLS policies
- [x] Seed data
- [x] GuitarChordDiagram
- [x] KeyboardChordDiagram
- [x] ChordVariationCarousel
- [x] HarmonicSuggestions
- [x] StudyModePage
- [x] Hooks de dados
- [x] Rotas configuradas
- [x] Integração com TrackDetails
- [x] Tipos TypeScript
- [x] Documentação

---

## 🐛 Troubleshooting

### Erro: "Nenhuma variação disponível"
**Causa:** Não há shapes cadastrados para o acorde.
**Solução:** Execute o SQL de seed data ou cadastre shapes manualmente.

### Erro: "Esta música ainda não possui acordes cadastrados"
**Causa:** A tabela `song_chords` está vazia para esta música.
**Solução:** Implemente extração automática de acordes ou cadastre manualmente.

### RLS bloqueando queries
**Causa:** Usuário não tem `church_id` ou policies não foram aplicadas.
**Solução:** Verifique RLS policies no Supabase SQL Editor.

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Revise esta documentação
2. Verifique os comentários no código
3. Consulte a documentação do Supabase RLS
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização:** 2026-01-03
**Versão:** 1.0.0
