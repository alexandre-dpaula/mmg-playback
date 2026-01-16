# ✅ Solução: Usar Scraper do Cifra Club

## Descoberta Importante

Já existe um **scraper totalmente funcional** do Cifra Club no projeto:

**Arquivo:** `src/features/study-mode/services/cifraClubScraper.ts`

### Funcionalidades Implementadas:

1. ✅ **fetchCifraClubChord(chordName)** - Busca variações de um acorde
2. ✅ **Conversão automática** - Converte formato Cifra Club → nosso formato
3. ✅ **Detecção de pestanas** - Identifica barré automaticamente
4. ✅ **Cache/Preload** - Pré-carrega acordes para uso offline
5. ✅ **Normalização** - Converte maj7, m7, dim, aug, etc.

---

## Solução Proposta

### Usar o scraper para gerar biblioteca correta

Em vez de transpor acordes (método atual - ERRADO), vamos:

1. **Buscar no Cifra Club** via scraper
2. **Mapear para formas CAGED**
3. **Salvar no banco de dados** (chord_diagrams)
4. **Cachear para uso offline**

---

## Implementação

### Script de Geração de Acordes

Criar um script que:

```typescript
// scripts/generate-chords-from-cifraclub.ts

import { preloadCifraClubChords } from '../src/features/study-mode/services/cifraClubScraper';
import { supabase } from '../src/lib/supabase';

// Lista dos 156 acordes que queremos
const CHORD_NAMES = [
  // Maiores (12)
  'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',

  // Menores (12)
  'Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm',

  // Dominante 7ª (12)
  'C7', 'C#7', 'D7', 'Eb7', 'E7', 'F7', 'F#7', 'G7', 'Ab7', 'A7', 'Bb7', 'B7',

  // Major 7ª (12)
  'Cmaj7', 'C#maj7', 'Dmaj7', 'Ebmaj7', 'Emaj7', 'Fmaj7', 'F#maj7', 'Gmaj7', 'Abmaj7', 'Amaj7', 'Bbmaj7', 'Bmaj7',

  // Minor 7ª (12)
  'Cm7', 'C#m7', 'Dm7', 'Ebm7', 'Em7', 'Fm7', 'F#m7', 'Gm7', 'Abm7', 'Am7', 'Bbm7', 'Bm7',

  // Diminutos (12)
  'Cdim', 'C#dim', 'Ddim', 'Ebdim', 'Edim', 'Fdim', 'F#dim', 'Gdim', 'Abdim', 'Adim', 'Bbdim', 'Bdim',

  // Aumentados (12)
  'Caug', 'C#aug', 'Daug', 'Ebaug', 'Eaug', 'Faug', 'F#aug', 'Gaug', 'Abaug', 'Aaug', 'Bbaug', 'Baug',

  // Sus2 (12)
  'Csus2', 'C#sus2', 'Dsus2', 'Ebsus2', 'Esus2', 'Fsus2', 'F#sus2', 'Gsus2', 'Absus2', 'Asus2', 'Bbsus2', 'Bsus2',

  // Sus4 (12)
  'Csus4', 'C#sus4', 'Dsus4', 'Ebsus4', 'Esus4', 'Fsus4', 'F#sus4', 'Gsus4', 'Absus4', 'Asus4', 'Bbsus4', 'Bsus4',

  // 6ª (12)
  'C6', 'C#6', 'D6', 'Eb6', 'E6', 'F6', 'F#6', 'G6', 'Ab6', 'A6', 'Bb6', 'B6',

  // Minor 6ª (12)
  'Cm6', 'C#m6', 'Dm6', 'Ebm6', 'Em6', 'Fm6', 'F#m6', 'Gm6', 'Abm6', 'Am6', 'Bbm6', 'Bm6',

  // 9ª (12)
  'C9', 'C#9', 'D9', 'Eb9', 'E9', 'F9', 'F#9', 'G9', 'Ab9', 'A9', 'Bb9', 'B9',

  // Add9 (12)
  'Cadd9', 'C#add9', 'Dadd9', 'Ebadd9', 'Eadd9', 'Fadd9', 'F#add9', 'Gadd9', 'Abadd9', 'Aadd9', 'Bbadd9', 'Badd9',
];

async function generateChords() {
  console.log('🎸 Gerando biblioteca de acordes do Cifra Club...\n');

  const chordCache = await preloadCifraClubChords(CHORD_NAMES);

  console.log('\n📊 Salvando no banco de dados...\n');

  for (const [chordName, variations] of chordCache.entries()) {
    // Mapeia variações para formas CAGED
    const cagedShapes = mapVariationsToCAGED(variations);

    // Salva no Supabase
    const { error } = await supabase
      .from('chord_diagrams')
      .upsert({
        chord_name: chordName,
        full_name: getFullChordName(chordName),
        quality: getChordQuality(chordName),
        root_note: getRootNote(chordName),
        caged_shapes: cagedShapes,
        notes: getChordNotes(chordName),
        generated_by: 'cifraclub-scraper',
        verified: false,
      });

    if (error) {
      console.error(`❌ Erro ao salvar ${chordName}:`, error);
    } else {
      console.log(`✅ ${chordName} salvo com ${Object.keys(cagedShapes).length} variações`);
    }
  }

  console.log('\n🎉 Concluído!');
}

// Mapeia variações do Cifra Club para formas CAGED
function mapVariationsToCAGED(variations: GuitarChord[]) {
  const shapes: Record<string, GuitarChord> = {};

  // Heurística para mapear variações para formas CAGED
  // Baseado na posição no braço e padrão de dedos

  variations.forEach((variation, index) => {
    const cagedLetter = inferCAGEDShape(variation);
    if (cagedLetter && !shapes[cagedLetter]) {
      shapes[cagedLetter] = variation;
    }
  });

  return shapes;
}

// Infere qual letra CAGED baseado na posição e padrão
function inferCAGEDShape(chord: GuitarChord): string | null {
  const baseFret = chord.baseFret;

  // Regras heurísticas (simplificadas):
  // - Forma C: geralmente casa 3-5 com 5ª corda como raiz
  // - Forma A: geralmente casa 5-7 com 5ª corda como raiz + pestana
  // - Forma G: geralmente casa 3 com 6ª corda como raiz + pestana
  // - Forma E: geralmente casa 0 (open) ou pestana completa 6 cordas
  // - Forma D: geralmente casa 0 (open) ou 4ª corda como raiz

  if (baseFret === 1 && !chord.barre) {
    return 'D'; // Open position
  }

  if (chord.barre && chord.barre.toString === 6) {
    return 'E'; // Pestana completa
  }

  if (chord.barre && chord.barre.fromString === 5) {
    return 'A'; // Pestana estilo A
  }

  if (baseFret >= 3 && baseFret <= 5) {
    return 'C';
  }

  if (baseFret >= 6) {
    return 'G';
  }

  return null;
}

generateChords();
```

---

## Vantagens dessa Solução

### 1. ✅ Padrão Universal Garantido
- Usa exatamente os mesmos diagramas do Cifra Club
- Músicos reconhecem imediatamente

### 2. ✅ Automatização Total
- Busca todas as 156 variações automaticamente
- Não precisa definir manualmente

### 3. ✅ Sempre Atualizado
- Pode re-gerar a qualquer momento
- Incorpora melhorias do Cifra Club

### 4. ✅ Offline-Ready
- Cache no banco de dados
- Funciona sem internet depois de carregado

### 5. ✅ Verificação Humana
- Campo `verified: false` permite revisão manual
- Líderes podem corrigir se necessário

---

## Mapeamento CAGED

### Estratégia de Identificação

O Cifra Club retorna múltiplas variações (normalmente 3-5 por acorde).

**Como mapear para C-A-G-E-D:**

1. **Análise de posição:**
   - Casa base + padrão de dedos
   - Corda raiz (6ª, 5ª ou 4ª)

2. **Detecção de pestana:**
   - Pestana completa (6 cordas) = Forma E
   - Pestana parcial (5ª-1ª) = Forma A
   - Sem pestana + baixo = Forma D/C/G

3. **Ordenação por região:**
   - Casas 0-2: Formas abertas (D, E, C, G, A originais)
   - Casas 3-5: Forma C
   - Casas 5-7: Forma A
   - Casas 7-10: Forma G
   - Casas 10-12: Forma E

---

## Exemplo: Acorde D

### Resposta do Cifra Club:

```json
{
  "chord": "D",
  "variations": [
    {
      "id": 1,
      "name": "D (principal)",
      "frets": "xx0232",
      "fingers": "000132",
      "baseFret": 1
    },
    {
      "id": 2,
      "name": "D (5ª casa)",
      "frets": "x57775",
      "fingers": "013331",
      "baseFret": 5
    },
    {
      "id": 3,
      "name": "D (10ª casa)",
      "frets": "xACACA",
      "fingers": "013121",
      "baseFret": 10
    }
  ]
}
```

### Mapeamento para CAGED:

```typescript
{
  D: { // Forma D (open)
    baseFret: 1,
    notes: [
      { string: 6, fret: -1 },
      { string: 5, fret: -1 },
      { string: 4, fret: 0 },
      { string: 3, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 3 },
      { string: 1, fret: 2, finger: 2 },
    ]
  },
  A: { // Forma A (5ª casa)
    baseFret: 5,
    notes: [...],
    barre: { fret: 5, fromString: 1, toString: 5 }
  },
  G: { // Forma G (10ª casa)
    baseFret: 10,
    notes: [...],
  }
}
```

---

## Próximos Passos

### 1. ⏳ Criar script de geração
```bash
npm run generate-chords
```

### 2. ⏳ Executar uma vez para popular o banco
```bash
npm run generate-chords -- --execute
```

### 3. ⏳ Integrar com `useChordData` hook
Já está integrado! O hook já busca do banco `chord_diagrams`.

### 4. ⏳ (Opcional) Revisão manual
Líderes podem marcar acordes como `verified: true` após conferir.

---

## Status

- ✅ Scraper do Cifra Club **JÁ EXISTE**
- ✅ Tabela `chord_diagrams` **JÁ EXISTE**
- ✅ Hook `useChordData` **JÁ EXISTE**
- ⏳ Script de geração em lote **PRECISA CRIAR**
- ⏳ Mapeamento CAGED automático **PRECISA IMPLEMENTAR**

---

**Conclusão:** Temos TODAS as ferramentas necessárias! Só falta criar o script de geração em lote que usa o scraper existente para popular a biblioteca com os 156 acordes do Cifra Club.
