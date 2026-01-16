# 🎸 Sistema de Acordes Automático com Cifra Club

## 📋 Como Funciona

### Fluxo Automático

```
Usuário adiciona música do Cifra Club
           ↓
Edge Function process-cifraclub é chamada
           ↓
1. Extrai conteúdo da cifra
2. Extrai TODOS os acordes únicos (C, Am, F, G, etc.)
3. Para cada acorde:
   ├─ Verifica se JÁ existe no banco
   ├─ Se NÃO existe:
   │  ├─ Busca no Dicionário de Acordes do Cifra Club
   │  ├─ Extrai TODAS as variações (até 5 por acorde)
   │  ├─ Converte para formato CAGED
   │  └─ Salva no banco (chord_diagrams)
   └─ Se JÁ existe: pula
           ↓
Biblioteca de Acordes atualizada automaticamente!
```

## ✨ Vantagens

### 1. **Zero Configuração Manual**
- ✅ Adiciona música → Acordes aparecem automaticamente
- ✅ Não precisa gerar 156 acordes de uma vez
- ✅ Biblioteca cresce organicamente

### 2. **Diagramas Reais**
- ✅ Vêm diretamente do Cifra Club
- ✅ Mesmas posições que músicos já conhecem
- ✅ Múltiplas variações por acorde (até 5!)

### 3. **Performance**
- ✅ Primeira vez: busca do Cifra Club (~1s por acorde)
- ✅ Próximas vezes: **INSTANTÂNEO** (cache local)
- ✅ Reutiliza entre todas as músicas

### 4. **Escalável**
- ✅ Quanto mais músicas, melhor a biblioteca
- ✅ Compartilhado entre todos da igreja
- ✅ Sem limite de acordes

## 🎯 Exemplo Prático

### Adiciona "Como Zaqueu"
```
Cifra contém: C, Am, F, G, Dm
                ↓
Sistema busca diagramas no Cifra Club
                ↓
Salva 5 variações de cada:
  - C: 5 variações (formas C, A, G, E, D)
  - Am: 5 variações
  - F: 5 variações
  - G: 5 variações
  - Dm: 5 variações
                ↓
Total: 25 diagramas salvos!
```

### Adiciona "Tua Graça Me Basta"
```
Cifra contém: C, G, Am, F, Dm7
                ↓
Sistema verifica:
  - C: JÁ EXISTE (reutiliza) ✅
  - G: JÁ EXISTE (reutiliza) ✅
  - Am: JÁ EXISTE (reutiliza) ✅
  - F: JÁ EXISTE (reutiliza) ✅
  - Dm7: NÃO EXISTE → Busca e salva 5 variações
                ↓
Total: +5 novos diagramas
Biblioteca agora tem: 30 diagramas
```

## 📊 Estrutura dos Dados

### Tabela: `chord_diagrams`

```sql
{
  chord_name: "Am7",
  full_name: "A minor 7th",
  quality: "minor7",
  root_note: "A",
  notes: ["A", "C", "E", "G"],

  caged_shapes: {
    C: { name: "Am7 (Forma C)", baseFret: 3, notes: [...], barre: {...} },
    A: { name: "Am7 (Forma A)", baseFret: 5, notes: [...] },
    G: { name: "Am7 (Forma G)", baseFret: 7, notes: [...] },
    E: { name: "Am7 (Forma E)", baseFret: 10, notes: [...] },
    D: { name: "Am7 (Forma D)", baseFret: 12, notes: [...] }
  },

  keyboard_voicings: { root: {...}, firstInversion: {...} },
  generated_by: "cifraclub",
  verified: true
}
```

## 🔧 Arquivos Modificados

### 1. Edge Function
- **`supabase/functions/process-cifraclub/chord-extractor.ts`** (NOVO)
  - Extrai acordes da cifra
  - Busca diagramas no Cifra Club
  - Converte para formato CAGED
  - Salva no banco

- **`supabase/functions/process-cifraclub/index.ts`** (MODIFICADO)
  - Integrado extração automática de acordes
  - Chamado automaticamente ao adicionar música

### 2. Frontend
- **`src/features/study-mode/ChordLibrary.tsx`**
  - Exibe TODAS as variações CAGED em grade
  - Layout igual ao Cifra Club
  - Carregamento instantâneo (cache)

- **`src/features/study-mode/hooks/useChordData.ts`**
  - Busca primeiro da memória (biblioteca local)
  - Depois do banco (Supabase)
  - Fallback: gera por IA

## 🚀 Como Usar

### Adicionar Música
1. Vá em **Músicas** → **Adicionar Música**
2. Cole URL do Cifra Club
3. **Pronto!** Acordes são extraídos e salvos automaticamente

### Ver Biblioteca de Acordes
1. Vá em **Estudos** → **Biblioteca de Acordes**
2. Selecione um tom (C, D, E, etc.)
3. Clique em uma variação (C, Cm, C7, etc.)
4. **Veja todas as 5 formas CAGED!**

## 📈 Estatísticas

### Tempo de Processamento
- **1ª música**: ~5-10s (extrai + busca + salva acordes)
- **2ª música** (acordes repetidos): ~1-2s (apenas cifra)
- **Biblioteca de Acordes**: **INSTANTÂNEO** (< 50ms)

### Armazenamento
- **1 acorde**: ~5 variações = ~2 KB
- **100 acordes**: ~200 KB
- **500 acordes**: ~1 MB

## 🎨 Interface (Mantém nosso design!)

### Layout Atual (PRESERVADO)
```
┌─────────────────────────────────────────┐
│  Biblioteca de Acordes                  │
│  Explore 156 acordes organizados        │
│                                         │
│  Tom: [C] [Db] [D] [Eb] [E] [F] ...    │
│                                         │
│  13 variações:                          │
│  [C] [Cm] [C7] [Cmaj7] [Cm7] ...      │
│                                         │
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │Forma C│ │Forma A│ │Forma G│ ...     │
│  │ [⚫]  │ │  [⚫] │ │  [⚫] │         │
│  │ 🎸   │ │  🎸  │ │  🎸  │         │
│  └───────┘ └───────┘ └───────┘         │
└─────────────────────────────────────────┘
```

## 🔐 Segurança

### RLS Policies
- **Leitura**: Todos autenticados
- **Escrita**: Apenas líderes + Edge Functions
- **Verificação**: Campo `verified` para acordes do Cifra Club

### Validação
- ✅ Acordes duplicados são ignorados
- ✅ Delay de 200ms entre requests (não sobrecarrega Cifra Club)
- ✅ Fallback se Cifra Club estiver indisponível

## 📦 Deploy

```bash
# Deploy da Edge Function
supabase functions deploy process-cifraclub

# Verificar logs
supabase functions logs process-cifraclub
```

## 🎯 Próximos Passos

- [ ] Badge "Novo" para acordes recém-adicionados
- [ ] Contador de uso (acordes mais usados)
- [ ] Sincronização entre membros da igreja
- [ ] Modo offline (IndexedDB)
- [ ] Exportar PDF dos acordes

---

**Sistema 100% Automático e Escalável! 🎵**
