# 🎸 Sistema de Cifras e Transposição

Sistema completo para parsing, transposição e visualização de cifras musicais com diagramas de violão.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Componentes](#componentes)
- [Services](#services)
- [Hooks](#hooks)
- [Exemplos de Uso](#exemplos-de-uso)
- [API Reference](#api-reference)

---

## 🎯 Visão Geral

O sistema oferece:

- ✅ **156 acordes** com **780 diagramas CAGED**
- ✅ **Parser automático** de cifras
- ✅ **Transposição** de -12 a +12 semitons
- ✅ **Detecção automática** de tonalidade
- ✅ **Visualização interativa** com diagramas
- ✅ **Modo de estudo integrado**

---

## 🧩 Componentes

### IntegratedChordStudy

Componente principal que integra cifra + transposição + diagramas.

```tsx
import { IntegratedChordStudy } from '@/features/study-mode/components/IntegratedChordStudy';

function MinhaPagina() {
  const cifra = `
    G            D
    Quão grande é o meu Deus
    Em7          C
    Cantarei quão grande é o meu Deus
  `;

  return <IntegratedChordStudy text={cifra} />;
}
```

**Props:**
- `text` (string): Texto cifrado
- `onTextChange?` (function): Callback para mudanças no texto
- `className?` (string): Classes CSS adicionais

---

### ChordSheetViewer

Visualizador de cifras com acordes clicáveis.

```tsx
import { ChordSheetViewer } from '@/features/study-mode/components/ChordSheetViewer';

function Viewer() {
  const handleChordClick = (chord: string) => {
    console.log('Acorde clicado:', chord);
  };

  return (
    <ChordSheetViewer
      text={cifra}
      onChordClick={handleChordClick}
    />
  );
}
```

**Props:**
- `text` (string): Texto cifrado
- `onChordClick?` (function): Callback ao clicar em acorde
- `className?` (string): Classes CSS adicionais

---

### TranspositionControls

Controles de transposição com seletor de tonalidade.

```tsx
import { useTransposition } from '@/features/study-mode/hooks/useTransposition';
import { TranspositionControls } from '@/features/study-mode/components/TranspositionControls';

function Controls() {
  const transposition = useTransposition(cifra);

  return <TranspositionControls transposition={transposition} />;
}
```

**Props:**
- `transposition` (UseTranspositionResult): Resultado do hook useTransposition
- `className?` (string): Classes CSS adicionais

---

## ⚙️ Services

### chordParser

Parser de cifras com detecção automática de acordes.

```typescript
import { parseChordSheet, extractUniqueChords, getChordStats } from '@/features/study-mode/services/chordParser';

// Parse completo
const result = parseChordSheet(cifra);
console.log(result.uniqueChords); // ['G', 'D', 'Em7', 'C']
console.log(result.key); // 'G'

// Apenas acordes únicos
const chords = extractUniqueChords(cifra);

// Estatísticas
const stats = getChordStats(cifra);
console.log(stats);
// {
//   totalChords: 8,
//   uniqueChords: 4,
//   detectedKey: 'G',
//   chordLines: 2,
//   lyricLines: 2
// }
```

**Funções:**
- `parseChordSheet(text)`: Parse completo com metadados
- `extractUniqueChords(text)`: Lista de acordes únicos
- `hasValidChords(text)`: Verifica se há cifras válidas
- `getChordStats(text)`: Retorna estatísticas

---

### chordTransposer

Sistema de transposição de acordes e cifras.

```typescript
import {
  transposeChord,
  transposeChordSheet,
  performTransposition,
  getSemitonesBetween
} from '@/features/study-mode/services/chordTransposer';

// Transpor um acorde
const newChord = transposeChord('C', 2); // 'D'

// Transpor cifra completa
const transposed = transposeChordSheet(cifra, 2);

// Transposição completa com metadados
const result = performTransposition(cifra, 2);
console.log(result);
// {
//   originalText: '...',
//   transposedText: '...',
//   semitones: 2,
//   originalKey: 'C',
//   newKey: 'D',
//   label: '+2 semitons (1 tom acima)'
// }

// Diferença entre tonalidades
const diff = getSemitonesBetween('C', 'G'); // 7
```

**Funções:**
- `transposeNote(note, semitones)`: Transpõe uma nota
- `transposeChord(chord, semitones)`: Transpõe um acorde
- `transposeChordSheet(text, semitones)`: Transpõe texto completo
- `performTransposition(text, semitones)`: Transposição com metadados
- `getSemitonesBetween(fromKey, toKey)`: Calcula diferença
- `getAllKeys()`: Lista todas as tonalidades
- `getTranspositionLabel(semitones)`: Label descritivo

---

## 🪝 Hooks

### useChordParser

Hook React para parsing de cifras.

```typescript
import { useChordParser } from '@/features/study-mode/hooks/useChordParser';

function Component() {
  const { lines, uniqueChords, key, hasChords, stats } = useChordParser(cifra);

  return (
    <div>
      <p>Tom: {key}</p>
      <p>Acordes: {uniqueChords.join(', ')}</p>
      <p>Total: {stats.totalChords}</p>
    </div>
  );
}
```

**Retorno:**
- `lines`: Array de linhas parseadas
- `allChords`: Todos os acordes encontrados
- `uniqueChords`: Acordes únicos
- `key`: Tonalidade detectada
- `isEmpty`: Se o texto está vazio
- `hasChords`: Se há acordes válidos
- `stats`: Estatísticas detalhadas

---

### useTransposition

Hook React para transposição de cifras.

```typescript
import { useTransposition } from '@/features/study-mode/hooks/useTransposition';

function Component() {
  const {
    semitones,
    transposedText,
    originalKey,
    currentKey,
    transpose,
    transposeUp,
    transposeDown,
    reset,
    setKey
  } = useTransposition(cifra, { autoDetectKey: true });

  return (
    <div>
      <button onClick={transposeUp}>+</button>
      <span>{semitones}</span>
      <button onClick={transposeDown}>-</button>
      <button onClick={reset}>Reset</button>

      <select onChange={(e) => setKey(e.target.value)}>
        <option value="C">C</option>
        <option value="D">D</option>
        {/* ... */}
      </select>

      <pre>{transposedText}</pre>
    </div>
  );
}
```

**Opções:**
- `initialSemitones`: Transposição inicial (padrão: 0)
- `autoDetectKey`: Detectar tonalidade automaticamente (padrão: true)

**Retorno:**
- `semitones`: Semitons atuais
- `transposedText`: Texto transposto
- `originalKey`: Tonalidade original
- `currentKey`: Tonalidade atual
- `transpose(n)`: Transpõe N semitons
- `transposeUp()`: Transpõe +1 semitom
- `transposeDown()`: Transpõe -1 semitom
- `reset()`: Volta ao original
- `setKey(key)`: Define tonalidade específica
- `result`: Resultado completo com metadados
- `availableKeys`: Lista de tonalidades
- `canTransposeUp`: Pode transpor para cima
- `canTransposeDown`: Pode transpor para baixo

---

## 💡 Exemplos de Uso

### Exemplo 1: Visualizador Simples

```tsx
import { ChordSheetViewer } from '@/features/study-mode/components/ChordSheetViewer';

function SimpleViewer() {
  const cifra = `
    C          Am
    Aleluia, aleluia
    F              G
    Louvado seja o Senhor
  `;

  return <ChordSheetViewer text={cifra} />;
}
```

### Exemplo 2: Com Transposição

```tsx
import { useState } from 'react';
import { useTransposition } from '@/features/study-mode/hooks/useTransposition';
import { ChordSheetViewer } from '@/features/study-mode/components/ChordSheetViewer';

function TransposableViewer() {
  const [cifra] = useState('...');
  const { transposedText, transposeUp, transposeDown, reset } = useTransposition(cifra);

  return (
    <div>
      <div>
        <button onClick={transposeDown}>-</button>
        <button onClick={reset}>Reset</button>
        <button onClick={transposeUp}>+</button>
      </div>
      <ChordSheetViewer text={transposedText} />
    </div>
  );
}
```

### Exemplo 3: Modo Completo

```tsx
import { IntegratedChordStudy } from '@/features/study-mode/components/IntegratedChordStudy';

function FullMode() {
  return <IntegratedChordStudy text={cifra} />;
}
```

### Exemplo 4: Parser Manual

```typescript
import { parseChordSheet } from '@/features/study-mode/services/chordParser';

const cifra = `
  G    D    Em   C
  C7   Fmaj7   Dm7   G7
`;

const result = parseChordSheet(cifra);

console.log('Acordes únicos:', result.uniqueChords);
// ['G', 'D', 'Em', 'C', 'C7', 'Fmaj7', 'Dm7', 'G7']

console.log('Tom detectado:', result.key);
// 'G'

console.log('Total de acordes:', result.allChords.length);
// 8
```

### Exemplo 5: Transposição Programática

```typescript
import { transposeChordSheet } from '@/features/study-mode/services/chordTransposer';

const original = `
  C    Am    F    G
  Dm   G7    C
`;

// Transpor 2 tons acima
const transposed = transposeChordSheet(original, 4);

console.log(transposed);
// E    C#m   A    B
// F#m  B7    E
```

---

## 📚 API Reference

### Tipos TypeScript

```typescript
// Parser
interface ParsedChord {
  original: string;
  normalized: string;
  root: string;
  quality: string;
  position: number;
  line: number;
}

interface ParsedLine {
  type: 'chord' | 'lyric' | 'empty';
  content: string;
  chords?: ParsedChord[];
  lineNumber: number;
}

interface ParseResult {
  lines: ParsedLine[];
  allChords: ParsedChord[];
  uniqueChords: string[];
  key?: string;
}

// Transposição
interface TranspositionResult {
  originalText: string;
  transposedText: string;
  semitones: number;
  originalKey?: string;
  newKey?: string;
  label: string;
}
```

---

## 🎯 Acordes Suportados

O sistema reconhece **156 acordes** em **13 categorias**:

- **Maiores**: C, D, E, F, G, A, B, Db, Eb, F#, Ab, Bb
- **Menores**: Cm, Dm, Em, Fm, Gm, Am, Bm, C#m, Ebm, F#m, Abm, Bbm
- **7ª Dominante**: C7, D7, E7, F7, G7, A7, B7, Db7, Eb7, F#7, Ab7, Bb7
- **7ª Maior**: Cmaj7, Dmaj7, Emaj7, ...
- **7ª Menor**: Cm7, Dm7, Em7, ...
- **Diminutos**: C°, D°, E°, ...
- **Aumentados**: C+, D+, E+, ...
- **Suspensos 2**: Csus2, Dsus2, Esus2, ...
- **Suspensos 4**: Csus4, Dsus4, Esus4, ...
- **Sextas**: C6, D6, E6, ...
- **Sextas Menores**: Cm6, Dm6, Em6, ...
- **Nonas**: C9, D9, E9, ...
- **Add9**: Cadd9, Dadd9, Eadd9, ...

Cada acorde possui **5 diagramas CAGED** diferentes!

---

## 🚀 Performance

- ✅ Build otimizado: ~6s
- ✅ Parsing em tempo real com `useMemo`
- ✅ Cache de acordes em memória
- ✅ Bundle eficiente: 904KB (181KB gzip)

---

## 📝 Notas

- O parser usa regex otimizado para detecção rápida
- A transposição preserva o layout original do texto
- Suporte para acordes com baixo (ex: C/G)
- Normalização automática de enarmônicos (C# ↔ Db)
- Detecção heurística de tonalidade baseada em frequência

---

**Desenvolvido com ❤️ para músicos e estudantes de música**
