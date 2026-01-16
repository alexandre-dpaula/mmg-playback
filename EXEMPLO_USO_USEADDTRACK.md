# 🎵 Como Usar o Hook useAddTrack

## Exemplo Completo: Adicionar Música em um Evento

```typescript
import { useState } from 'react';
import { useAddTrack } from '@/hooks/useAddTrack';
import { DuplicateTrackDialog } from '@/components/DuplicateTrackDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EventAddTrackForm({ eventId }: { eventId: string }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [cifraUrl, setCifraUrl] = useState('');

  const {
    addTrack,
    confirmUseExisting,
    confirmCreateNew,
    cancelDuplicate,
    loading,
    duplicateFound,
    pendingTrack,
  } = useAddTrack({
    onSuccess: () => {
      console.log('Música adicionada com sucesso!');
      // Limpa formulário
      setTitle('');
      setArtist('');
      setCifraUrl('');
      // Atualiza lista de músicas
      refetch();
    },
    onError: (error) => {
      console.error('Erro ao adicionar música:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Digite o título da música');
      return;
    }

    // Chama o hook - ele detecta duplicatas automaticamente!
    await addTrack({
      title: title.trim(),
      artist: artist.trim() || undefined,
      cifraUrl: cifraUrl.trim() || undefined,
      context: 'event', // ou 'rehearsal' para ensaio
      contextId: eventId,
    });
  };

  return (
    <>
      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Título da música"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          placeholder="Artista (opcional)"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />

        <Input
          placeholder="URL do Cifra Club (opcional)"
          value={cifraUrl}
          onChange={(e) => setCifraUrl(e.target.value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Adicionando...' : 'Adicionar Música'}
        </Button>
      </form>

      {/* Modal de Duplicata (aparece automaticamente quando necessário) */}
      <DuplicateTrackDialog
        open={!!duplicateFound}
        onOpenChange={(open) => {
          if (!open) cancelDuplicate();
        }}
        searchResult={duplicateFound!}
        newTrackTitle={pendingTrack?.title || ''}
        onConfirmUseExisting={confirmUseExisting}
        onConfirmCreateNew={confirmCreateNew}
      />
    </>
  );
}
```

## Exemplo: Adicionar Música em um Ensaio

```typescript
import { useAddTrack } from '@/hooks/useAddTrack';
import { DuplicateTrackDialog } from '@/components/DuplicateTrackDialog';

export function RehearsalAddTrackForm({ rehearsalId }: { rehearsalId: string }) {
  const {
    addTrack,
    confirmUseExisting,
    confirmCreateNew,
    cancelDuplicate,
    loading,
    duplicateFound,
    pendingTrack,
  } = useAddTrack();

  const handleQuickAdd = async (title: string, artist: string) => {
    await addTrack({
      title,
      artist,
      context: 'rehearsal', // Modo ensaio
      contextId: rehearsalId,
    });
  };

  return (
    <div>
      {/* Botões de ação rápida */}
      <Button onClick={() => handleQuickAdd('Como Zaqueu', 'Oficina G3')}>
        Adicionar "Como Zaqueu"
      </Button>

      {/* Modal aparece automaticamente se duplicata for detectada */}
      <DuplicateTrackDialog
        open={!!duplicateFound}
        onOpenChange={(open) => !open && cancelDuplicate()}
        searchResult={duplicateFound!}
        newTrackTitle={pendingTrack?.title || ''}
        onConfirmUseExisting={confirmUseExisting}
        onConfirmCreateNew={confirmCreateNew}
      />
    </div>
  );
}
```

## Fluxo Automático

### 1. Usuário Adiciona Música

```typescript
await addTrack({
  title: 'Como Zaqueu',
  artist: 'Oficina G3',
  cifraUrl: 'https://www.cifraclub.com.br/oficina-g3/como-zaqueu/',
  context: 'event',
  contextId: 'abc-123',
});
```

### 2. Hook Busca Duplicatas

```
useAddTrack → TrackService.findExisting()
  ├─ Busca por URL: ✅ ENCONTROU!
  ├─ Similaridade: 100%
  └─ Match Type: 'exact-url'
```

### 3. Modal Aparece Automaticamente

```
DuplicateTrackDialog exibe:
  - Você está adicionando: "Como Zaqueu"
  - Música existente: "Como Zaqueu" (URL do Cifra Club idêntica)
  - Opções:
    [Criar Nova Música] [Usar Música Existente]
```

### 4. Usuário Escolhe

**Opção A: Usar Música Existente**
```typescript
confirmUseExisting()
  → Adiciona track existente ao evento
  → Toast: "✅ Música adicionada ao evento!"
  → Modal fecha
  → onSuccess() é chamado
```

**Opção B: Criar Nova Música**
```typescript
confirmCreateNew()
  → Cria novo track (ignora duplicata)
  → Adiciona ao evento
  → Toast: "✅ Música adicionada com sucesso!"
  → Modal fecha
  → onSuccess() é chamado
```

## Vantagens do Sistema

### ✅ Unificado
- **Mesmo hook** funciona para eventos E ensaios
- Apenas muda o parâmetro `context`

### ✅ Inteligente
- Detecta duplicatas automaticamente
- 3 métodos: URL, título exato, similaridade
- Mostra modal apenas quando necessário

### ✅ Transparente
- Usuário sempre sabe o que está acontecendo
- Comparação visual clara
- Opção de forçar duplicata se realmente quiser

### ✅ Eficiente
- Reutiliza músicas existentes
- Evita duplicatas na biblioteca
- Biblioteca cresce organicamente

## Estados do Hook

```typescript
{
  addTrack: (params) => Promise<void>,           // Inicia processo
  confirmUseExisting: () => Promise<void>,       // Usa música existente
  confirmCreateNew: () => Promise<void>,         // Cria nova música
  cancelDuplicate: () => void,                   // Cancela modal
  loading: boolean,                              // Estado de loading
  duplicateFound: TrackSearchResult | null,      // Duplicata encontrada
  pendingTrack: AddTrackParams | null,           // Música aguardando decisão
}
```

## Integração com QuickAddTrackModal

```typescript
// src/components/QuickAddTrackModal.tsx

import { useAddTrack } from '@/hooks/useAddTrack';
import { DuplicateTrackDialog } from '@/components/DuplicateTrackDialog';

export function QuickAddTrackModal({ eventId, open, onOpenChange }) {
  const [title, setTitle] = useState('');

  const {
    addTrack,
    confirmUseExisting,
    confirmCreateNew,
    cancelDuplicate,
    loading,
    duplicateFound,
    pendingTrack,
  } = useAddTrack({
    onSuccess: () => {
      onOpenChange(false); // Fecha modal principal
      setTitle('');        // Limpa campo
    },
  });

  const handleSubmit = async () => {
    await addTrack({
      title,
      context: 'event',
      contextId: eventId,
    });
  };

  return (
    <>
      {/* Modal principal de adicionar */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome da música"
          />
          <Button onClick={handleSubmit} disabled={loading}>
            Adicionar
          </Button>
        </DialogContent>
      </Dialog>

      {/* Modal de duplicata (abre por cima se necessário) */}
      <DuplicateTrackDialog
        open={!!duplicateFound}
        onOpenChange={(open) => !open && cancelDuplicate()}
        searchResult={duplicateFound!}
        newTrackTitle={pendingTrack?.title || ''}
        onConfirmUseExisting={confirmUseExisting}
        onConfirmCreateNew={confirmCreateNew}
      />
    </>
  );
}
```

---

**Ecossistema Unificado Completo! 🚀**
