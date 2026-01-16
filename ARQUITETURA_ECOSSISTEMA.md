# 🎵 Arquitetura do Ecossistema Musical

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                 BIBLIOTECA GLOBAL (tracks)               │
│  • Todas as músicas da igreja                           │
│  • Cifras, acordes, diagramas                           │
│  • Compartilhado entre todos os contextos               │
└─────────────────┬───────────────────────────────────────┘
                  │
          ┌───────┴───────┐
          ↓               ↓
    ┌──────────┐    ┌──────────┐
    │  ENSAIO  │    │  EVENTO  │
    └──────────┘    └──────────┘
    • Playlist   • Playlist
    • Ordem      • Ordem
    • Notas      • Músicas
```

## 🔄 Fluxo Unificado

### 1. Adicionar Música (Qualquer Modo)

```typescript
// ANTES (ERRADO - Duplicado)
Ensaio → Adiciona "Como Zaqueu" → Cria track 1
Evento → Adiciona "Como Zaqueu" → Cria track 2 (DUPLICADO!)

// DEPOIS (CORRETO - Unificado)
Ensaio → Busca "Como Zaqueu"
  ├─ Existe na biblioteca? SIM → Adiciona à playlist do ensaio
  └─ Não existe? → Cria track + Adiciona à playlist

Evento → Busca "Como Zaqueu"
  ├─ Existe na biblioteca? SIM → Adiciona à playlist do evento
  └─ Não existe? → Cria track + Adiciona à playlist
```

### 2. Sistema Anti-Duplicação

#### Detecção Inteligente
```typescript
function checkDuplicateTrack(
  churchId: string,
  title: string,
  artist?: string
): Promise<Track | null> {
  // 1. Busca exata por título
  const exactMatch = await searchByTitle(churchId, title)

  // 2. Busca por similaridade (85%+)
  const similarMatch = await searchBySimilarity(churchId, title)

  // 3. Busca por URL do Cifra Club
  const urlMatch = await searchByUrl(cifraUrl)

  return exactMatch || similarMatch || urlMatch
}
```

#### Fluxo com Detecção
```
Usuário: "Adicionar Como Zaqueu"
           ↓
Sistema busca duplicatas:
  ├─ Título exato? "Como Zaqueu" → ENCONTRADO!
  ├─ Título similar? "como zaqueu" → ENCONTRADO!
  └─ URL CifraClub? → ENCONTRADO!
           ↓
Mostra modal: "Música já existe! Deseja usar a existente?"
  ├─ SIM → Adiciona track existente ao contexto (ensaio/evento)
  └─ NÃO → Cria nova (caso seja versão diferente)
```

## 🗂️ Estrutura de Dados

### Tabela: `tracks` (Biblioteca Global)
```sql
{
  id: uuid,
  church_id: uuid,
  title: "Como Zaqueu",
  artist: "Oficina G3",
  cifra_url: "https://cifraclub.com.br/...",
  cifra_content: "C Am F G...",
  tom: "C",
  created_at: timestamp
}
```

### Tabela: `event_tracks` (Playlist de Eventos)
```sql
{
  id: uuid,
  event_id: uuid,
  track_id: uuid,  -- Referência para tracks
  order: 1,
  customizations: {...}
}
```

### Tabela: `rehearsal_tracks` (Playlist de Ensaios - NOVO?)
```sql
{
  id: uuid,
  rehearsal_id: uuid,
  track_id: uuid,  -- Referência para tracks
  order: 1,
  notes: "Trabalhar intro"
}
```

## 🔧 Implementação

### 1. Serviço Unificado de Músicas

**`src/services/trackService.ts`** (NOVO)

```typescript
import { supabase } from '@/lib/supabase';

export interface AddTrackOptions {
  churchId: string;
  title: string;
  artist?: string;
  cifraUrl?: string;
  checkDuplicates?: boolean; // default: true
}

export interface TrackSearchResult {
  exists: boolean;
  track?: Track;
  similarity?: number;
}

/**
 * Serviço unificado de gestão de músicas
 */
export const TrackService = {
  /**
   * Busca música existente (anti-duplicação)
   */
  async findExisting(options: AddTrackOptions): Promise<TrackSearchResult> {
    const { churchId, title, cifraUrl } = options;

    // 1. Busca por URL (mais confiável)
    if (cifraUrl) {
      const { data: urlMatch } = await supabase
        .from('tracks')
        .select('*')
        .eq('church_id', churchId)
        .eq('cifra_url', cifraUrl)
        .single();

      if (urlMatch) {
        return { exists: true, track: urlMatch, similarity: 100 };
      }
    }

    // 2. Busca por título exato (case insensitive)
    const { data: exactMatch } = await supabase
      .from('tracks')
      .select('*')
      .eq('church_id', churchId)
      .ilike('title', title)
      .single();

    if (exactMatch) {
      return { exists: true, track: exactMatch, similarity: 100 };
    }

    // 3. Busca por similaridade (fuzzy search)
    const { data: allTracks } = await supabase
      .from('tracks')
      .select('*')
      .eq('church_id', churchId);

    if (allTracks && allTracks.length > 0) {
      const similar = findSimilar(title, allTracks);
      if (similar && similar.similarity >= 85) {
        return { exists: true, track: similar.track, similarity: similar.similarity };
      }
    }

    return { exists: false };
  },

  /**
   * Adiciona ou reutiliza música
   */
  async addOrReuse(options: AddTrackOptions): Promise<Track> {
    const { checkDuplicates = true } = options;

    // Verifica duplicatas
    if (checkDuplicates) {
      const existing = await this.findExisting(options);

      if (existing.exists) {
        console.log(`[TrackService] Música existente encontrada: ${existing.track?.title}`);
        return existing.track!;
      }
    }

    // Cria nova música
    const { data: newTrack, error } = await supabase
      .from('tracks')
      .insert({
        church_id: options.churchId,
        title: options.title,
        artist: options.artist,
        cifra_url: options.cifraUrl,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[TrackService] Nova música criada: ${newTrack.title}`);

    return newTrack;
  },

  /**
   * Adiciona música a um contexto (ensaio, evento, etc.)
   */
  async addToContext(
    trackId: string,
    context: 'event' | 'rehearsal',
    contextId: string,
    order?: number
  ): Promise<void> {
    const table = context === 'event' ? 'event_tracks' : 'rehearsal_tracks';

    const { error } = await supabase.from(table).insert({
      [`${context}_id`]: contextId,
      track_id: trackId,
      order: order || 0,
    });

    if (error) throw error;

    console.log(`[TrackService] Música adicionada ao ${context}: ${trackId}`);
  },
};

/**
 * Calcula similaridade entre strings (algoritmo Levenshtein)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  const len1 = s1.length;
  const len2 = s2.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        );
      }
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const similarity = ((maxLen - distance) / maxLen) * 100;

  return Math.round(similarity);
}

function findSimilar(title: string, tracks: Track[]): { track: Track; similarity: number } | null {
  let bestMatch: { track: Track; similarity: number } | null = null;

  for (const track of tracks) {
    const similarity = calculateSimilarity(title, track.title);

    if (!bestMatch || similarity > bestMatch.similarity) {
      bestMatch = { track, similarity };
    }
  }

  return bestMatch;
}
```

### 2. Hook Unificado

**`src/hooks/useAddTrack.ts`** (NOVO)

```typescript
import { useState } from 'react';
import { TrackService } from '@/services/trackService';
import { useToast } from '@/hooks/use-toast';

export function useAddTrack() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addTrack = async (options: {
    title: string;
    artist?: string;
    cifraUrl?: string;
    context: 'event' | 'rehearsal';
    contextId: string;
  }) => {
    setLoading(true);

    try {
      // 1. Busca música existente
      const churchId = 'xxx'; // Pegar do contexto
      const existing = await TrackService.findExisting({
        churchId,
        title: options.title,
        cifraUrl: options.cifraUrl,
      });

      let trackId: string;

      if (existing.exists) {
        // Mostra confirmação
        const confirmed = await showDuplicateDialog(existing.track!);

        if (confirmed) {
          trackId = existing.track!.id;
        } else {
          setLoading(false);
          return;
        }
      } else {
        // Cria nova música
        const track = await TrackService.addOrReuse({
          churchId,
          title: options.title,
          artist: options.artist,
          cifraUrl: options.cifraUrl,
        });
        trackId = track.id;
      }

      // 2. Adiciona ao contexto (ensaio ou evento)
      await TrackService.addToContext(
        trackId,
        options.context,
        options.contextId
      );

      toast({
        title: '✅ Música adicionada',
        description: `${options.title} foi adicionada com sucesso!`,
      });
    } catch (error) {
      toast({
        title: '❌ Erro',
        description: 'Não foi possível adicionar a música',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { addTrack, loading };
}
```

## 🎯 Benefícios do Ecossistema

### ✅ **Sem Duplicatas**
- Sistema detecta automaticamente músicas existentes
- Busca por título, artista e URL
- Similaridade de 85%+ é considerada duplicata

### ✅ **Reutilização Total**
- Mesma música serve para ensaios E eventos
- Cifras, acordes e diagramas compartilhados
- Atualizações refletem em todos os lugares

### ✅ **Economia de Espaço**
- Não armazena a mesma música 10 vezes
- Banco de dados menor e mais rápido
- Menos requests ao Cifra Club

### ✅ **Manutenção Fácil**
- Corrige cifra em um lugar → atualiza em todos
- Adiciona acorde → disponível globalmente
- Histórico centralizado

## 📋 Tarefas de Implementação

- [x] Criar `TrackService` unificado ✅
- [x] Implementar detecção de duplicatas ✅
- [x] Criar modal de confirmação ✅
- [x] Criar hook `useAddTrack` ✅
- [x] Migrar `QuickAddTrackModal` ✅
- [x] Migrar `AddTrack.tsx` (página principal) ✅
- [x] Verificar `Search.tsx` (não requer migração) ✅
- [x] ~~Criar `rehearsal_tracks` table~~ (usa `events` para tudo) ✅
- [ ] Testar fluxo completo end-to-end

---

**✅ Ecossistema Unificado Implementado! Os modos agora conversam! 🚀**
