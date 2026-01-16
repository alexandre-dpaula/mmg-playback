# 📋 Guia de Migração para o Ecossistema Unificado

## ✅ O Que Foi Feito

### Componentes Migrados

#### 1. QuickAddTrackModal.tsx ✅

**Antes:** Criava músicas diretamente sem verificação de duplicatas
**Depois:** Usa `useAddTrack` hook com detecção automática de duplicatas

**Mudanças Principais:**

```typescript
// ANTES - Importação direta
const { data: newTrack, error } = await supabase
  .from("tracks")
  .insert({
    titulo: cifraData.title,
    tag: cifraData.artist,
    tom: cifraData.key || null,
    cifra_content: cifraData.cifra || null,
  })
  .select()
  .single();

// DEPOIS - Hook unificado com detecção de duplicatas
const { addTrack, confirmUseExisting, confirmCreateNew } = useAddTrack({
  onSuccess: () => navigate(`/playlist/${eventId}`),
});

await addTrack({
  title: cifraData.title,
  artist: cifraData.artist,
  cifraUrl: url,
  context: 'event',
  contextId: eventId,
  order: nextOrderIndex + 1,
});

// Modal de duplicata aparece automaticamente se necessário!
<DuplicateTrackDialog
  open={!!duplicateFound}
  onConfirmUseExisting={confirmUseExisting}
  onConfirmCreateNew={confirmCreateNew}
/>
```

**Arquivo:** [src/components/QuickAddTrackModal.tsx](src/components/QuickAddTrackModal.tsx:1)

---

## 🔄 Componentes Pendentes de Migração

### 1. AddTrack.tsx (Página Principal de Adicionar Música) ✅ MIGRADO

**Localização:** [src/pages/AddTrack.tsx](src/pages/AddTrack.tsx:1)

**Status:** ✅ COMPLETO

**Mudanças Realizadas:**
- ✅ Adicionado hook `useAddTrack`
- ✅ Função `handleSubmit()` migrada completamente
- ✅ Função `maybeAddTrackToCurrentEvent()` removida (hook já faz isso)
- ✅ Modal `DuplicateTrackDialog` adicionado
- ✅ Detecção automática de duplicatas funcionando

**Código Antigo Removido:**

```typescript
// ADICIONAR ao componente AddTrackPage
import { useAddTrack } from '@/hooks/useAddTrack';
import { DuplicateTrackDialog } from '@/components/DuplicateTrackDialog';
import { useAuth } from '@/context/AuthContext';

const {
  addTrack,
  confirmUseExisting,
  confirmCreateNew,
  cancelDuplicate,
  duplicateFound,
  pendingTrack,
} = useAddTrack({
  onSuccess: () => {
    toast.success("Música adicionada com sucesso!");
    navigate('/events');
  },
});

// SUBSTITUIR handleSubmit
const handleSubmit = async (values: FormValues) => {
  const selectedEventId = getSelectedEventId();

  // Busca o maior order_index
  const { data: maxOrderData } = await supabase
    .from("event_tracks")
    .select("order_index")
    .eq("event_id", selectedEventId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrderIndex = maxOrderData?.[0]?.order_index ?? -1;

  // Usa hook unificado
  await addTrack({
    title: values.title.trim(),
    artist: values.tag?.trim(), // Se tiver campo de artista
    cifraUrl: values.pauta?.trim() || undefined,
    context: 'event',
    contextId: selectedEventId,
    order: nextOrderIndex + 1,
  });
};

// ADICIONAR modal ao JSX
<DuplicateTrackDialog
  open={!!duplicateFound}
  onOpenChange={(open) => !open && cancelDuplicate()}
  searchResult={duplicateFound!}
  newTrackTitle={pendingTrack?.title || ''}
  onConfirmUseExisting={confirmUseExisting}
  onConfirmCreateNew={confirmCreateNew}
/>
```

**IMPORTANTE:**
- Remover a função `maybeAddTrackToCurrentEvent()` (hook já faz isso)
- Remover chamada direta para `addTrackToSupabase()` (substituir por `addTrack()`)
- Manter processamento do Cifra Club (já integrado ao TrackService)

---

### 2. Search.tsx ✅ NÃO REQUER MIGRAÇÃO

**Localização:** [src/pages/Search.tsx](src/pages/Search.tsx:1)

**Status:** ✅ VERIFICADO

**Conclusão:**
- ✅ O componente **NÃO cria** novas músicas
- ✅ Apenas adiciona músicas **existentes** ao evento (linha 133)
- ✅ Não precisa de migração para o hook unificado
- ✅ Comportamento atual está correto

---

## 🎯 Checklist de Migração

### Para Cada Componente que Adiciona Músicas:

- [ ] **1. Importar dependências**
  ```typescript
  import { useAddTrack } from '@/hooks/useAddTrack';
  import { DuplicateTrackDialog } from '@/components/DuplicateTrackDialog';
  import { useAuth } from '@/context/AuthContext'; // Para church_id
  ```

- [ ] **2. Adicionar hook no componente**
  ```typescript
  const {
    addTrack,
    confirmUseExisting,
    confirmCreateNew,
    cancelDuplicate,
    duplicateFound,
    pendingTrack,
  } = useAddTrack({
    onSuccess: () => {
      // Callback de sucesso
    },
  });
  ```

- [ ] **3. Substituir lógica de criação**
  ```typescript
  // REMOVER inserção direta
  // await supabase.from("tracks").insert(...)

  // ADICIONAR
  await addTrack({
    title: ...,
    artist: ...,
    cifraUrl: ...,
    context: 'event' | 'rehearsal',
    contextId: eventId,
    order: nextOrderIndex + 1,
  });
  ```

- [ ] **4. Adicionar modal de duplicata ao JSX**
  ```typescript
  <DuplicateTrackDialog
    open={!!duplicateFound}
    onOpenChange={(open) => !open && cancelDuplicate()}
    searchResult={duplicateFound!}
    newTrackTitle={pendingTrack?.title || ''}
    onConfirmUseExisting={confirmUseExisting}
    onConfirmCreateNew={confirmCreateNew}
  />
  ```

- [ ] **5. Remover código redundante**
  - Remover funções que adicionam a event_tracks manualmente
  - Remover verificações de duplicatas antigas (se houver)
  - Remover código de transposição manual (hook já faz)

- [ ] **6. Testar fluxo completo**
  - Adicionar música nova → deve criar
  - Adicionar música existente → deve mostrar modal
  - Escolher "Usar Existente" → deve reutilizar
  - Escolher "Criar Nova" → deve criar nova versão

---

## 🔍 Como Encontrar Componentes que Adicionam Músicas

### Comando 1: Buscar inserções em `tracks`
```bash
grep -r "from.*tracks.*insert" src/ --include="*.tsx" --include="*.ts"
```

### Comando 2: Buscar inserções em `event_tracks`
```bash
grep -r "from.*event_tracks.*insert" src/ --include="*.tsx" --include="*.ts"
```

### Comando 3: Buscar função `addTrackToSupabase`
```bash
grep -r "addTrackToSupabase" src/ --include="*.tsx" --include="*.ts"
```

**Resultados Esperados:**
- ✅ `QuickAddTrackModal.tsx` - MIGRADO
- ⏳ `AddTrack.tsx` - PENDENTE
- ⏳ `Search.tsx` - VERIFICAR
- ⏳ Outros componentes encontrados

---

## 🧪 Testes Recomendados

### Cenário 1: Música Nova

1. Vá em **Adicionar Música**
2. Cole URL do Cifra Club: `https://www.cifraclub.com.br/oficina-g3/como-zaqueu/`
3. Clique em **Importar**
4. **Resultado Esperado:**
   - Música é criada
   - Música é adicionada ao evento
   - Nenhum modal de duplicata aparece

### Cenário 2: Música Duplicada por URL

1. Tente adicionar a mesma URL novamente
2. **Resultado Esperado:**
   - Modal aparece: "Música Já Existe na Biblioteca"
   - Mostra: "URL do Cifra Club idêntica (100%)"
   - Opções: [Criar Nova] [Usar Existente]

3. Clique em **Usar Existente**
4. **Resultado Esperado:**
   - Música existente é adicionada ao evento
   - Toast: "Música adicionada ao evento!"
   - Não cria duplicata no banco

### Cenário 3: Música com Título Similar

1. Adicione música: "Como Zaqueu"
2. Tente adicionar: "como zaqueu" (minúsculas)
3. **Resultado Esperado:**
   - Modal aparece
   - Mostra: "Título idêntico (100%)" ou "Título 95% similar"
   - Permite escolher

### Cenário 4: Forçar Duplicata

1. Modal de duplicata aparece
2. Clique em **Criar Nova Música**
3. **Resultado Esperado:**
   - Nova música é criada mesmo sendo similar
   - Útil para versões diferentes da mesma música

---

## 📊 Benefícios da Migração

### Antes ❌
- Músicas duplicadas (mesma URL → 2 tracks)
- Sem verificação de similaridade
- Código repetido em múltiplos lugares
- Difícil manutenção

### Depois ✅
- Sistema anti-duplicação automático
- Detecção por URL, título exato e similaridade
- Código centralizado (DRY)
- Fácil manutenção
- Experiência do usuário melhorada

---

## 🚨 Problemas Comuns e Soluções

### Problema: "currentChurch is undefined"
**Causa:** Hook `useAuth()` não está retornando `currentChurch`
**Solução:** Verificar se `useAuth` exporta `currentChurch.id`

```typescript
const { currentChurch } = useAuth();

if (!currentChurch?.id) {
  toast.error("Igreja não identificada");
  return;
}
```

### Problema: Modal de duplicata não aparece
**Causa:** `DuplicateTrackDialog` não foi adicionado ao JSX
**Solução:** Adicionar componente dentro do `return()` do componente

### Problema: Música não é adicionada ao evento
**Causa:** `context` ou `contextId` incorretos
**Solução:** Verificar se está passando:
```typescript
context: 'event',  // ou 'rehearsal'
contextId: eventId, // UUID válido do evento
```

### Problema: Erro "title is required"
**Causa:** Campo `title` vazio ou undefined
**Solução:** Garantir que `title.trim()` não está vazio antes de chamar `addTrack()`

---

## 📝 Ordem de Migração Recomendada

1. ✅ **QuickAddTrackModal** - COMPLETO
2. ⏳ **AddTrack.tsx** - PRÓXIMO (página principal)
3. ⏳ **Search.tsx** - VERIFICAR se adiciona músicas
4. ⏳ Outros componentes encontrados via grep

---

## 🎉 Quando Estiver Completo

- [ ] Todos os componentes migrados
- [ ] Testes manuais passando
- [ ] Nenhum código antigo de inserção direta
- [ ] Documentação atualizada
- [ ] Marcar tarefa no [ARQUITETURA_ECOSSISTEMA.md](ARQUITETURA_ECOSSISTEMA.md)

**Resultado Final:** Sistema 100% unificado sem duplicatas! 🚀
