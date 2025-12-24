# Guia: Timestamps Automáticos

## ✅ Implementado!

Agora **TODAS as músicas** têm timestamps gerados automaticamente!

## Como Funciona

### 1. Músicas Novas 🆕
Quando você **adicionar uma nova música** com URL da cifra:
- ✅ O sistema detecta automaticamente as seções ([INTRO], [V1], [R1], etc.)
- ✅ Gera timestamps proporcionais ao tamanho de cada seção
- ✅ Salva no banco de dados automaticamente
- ✅ **Notificação**: "X seções detectadas automaticamente!"

### 2. Músicas Existentes 🔄
Para processar **todas as músicas que já existem** no banco:

#### Opção A: Via Supabase Edge Function (Recomendado)

1. **Deploy da função**:
```bash
cd "/Users/alexandredpaula/dyad-apps/MMG - Ensaio Vocal"
npx supabase functions deploy auto-generate-timestamps
```

2. **Execute a função** (no terminal ou Postman):
```bash
curl -X POST 'https://sffebcfgkthjcfnpgjvz.supabase.co/functions/v1/auto-generate-timestamps' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA" \
  -H "Content-Type: application/json"
```

3. **Resultado**: Todas as músicas com cifra serão processadas automaticamente!

#### Opção B: Via SQL (Manual)
Execute este SQL no Supabase SQL Editor para processar manualmente:

```sql
-- Exemplo: Processar uma música específica
UPDATE tracks
SET section_timestamps = '{
  "I": 0,
  "V1": 15,
  "PR": 45,
  "R1": 60,
  "V2": 90,
  "R2": 120
}'::jsonb
WHERE id = 'id-da-musica';
```

## Algoritmo de Geração

### Como os Timestamps São Calculados

1. **Detecta seções** na cifra ([INTRO], [V1], [REFRÃO], etc.)
2. **Conta linhas** de cada seção (mais linhas = seção mais longa)
3. **Estima duração total** baseado no tamanho da cifra:
   - Menos de 50 linhas → 2 minutos (120s)
   - 50-100 linhas → 3 minutos (180s)
   - 100-150 linhas → 4 minutos (240s)
   - 150-200 linhas → 5 minutos (300s)
   - Mais de 200 linhas → 6 minutos (360s)
4. **Distribui proporcionalmente** o tempo entre as seções

### Exemplo Prático

**Cifra com**:
- [INTRO] - 4 linhas
- [V1] - 8 linhas
- [R1] - 6 linhas
- [V2] - 8 linhas
- [R2] - 6 linhas
**Total**: 32 linhas → Estimativa: 2 minutos (120s)

**Timestamps Gerados**:
- I: 0s (começo)
- V1: 15s (4/32 × 120 = 15s)
- R1: 45s (12/32 × 120 = 45s)
- V2: 68s ((12+6)/32 × 120 = 68s)
- R2: 98s ((12+6+8)/32 × 120 = 98s)

## Seções Suportadas

O sistema reconhece automaticamente:

| Código | Nome Completo | Cor na Barra |
|--------|---------------|--------------|
| I | Intro | Amarelo |
| V1, V2, V3 | Versos | Azul claro |
| PR | Pré-Refrão | Verde |
| R, R1, R2 | Refrão | Laranja |
| S | Solo | Vermelho |
| PO | Ponte | Verde |
| B | Bridge | Roxo |
| IS | Instrumental | Roxo |
| O | Outro/Final | Azul |
| TA | Turnaround | Amarelo |
| TG | Tag | Vermelho |
| IT | Interlúdio | Roxo |
| RF | Refrão Final | Vermelho |

## Arquivos Criados

1. **[src/utils/timestampGenerator.ts](src/utils/timestampGenerator.ts)**
   - Função `autoGenerateTimestamps(cifraContent)` - Gera timestamps automaticamente
   - Função `estimateDuration(cifraContent)` - Estima duração da música
   - Função `normalizeSectionType(rawType)` - Normaliza nomes de seções

2. **[supabase/functions/auto-generate-timestamps/index.ts](supabase/functions/auto-generate-timestamps/index.ts)**
   - Edge Function para processar todas as músicas existentes
   - Atualiza timestamps de músicas que não têm

3. **[src/components/TrackFormModal.tsx](src/components/TrackFormModal.tsx)** (Modificado)
   - Gera timestamps automaticamente ao criar/editar música
   - Mostra notificação com número de seções detectadas

## Testando

### 1. Adicionar Nova Música
1. Clique em "Adicionar Música"
2. Cole a URL da cifra do CifraClub
3. Preencha os dados
4. Clique em "Salvar"
5. ✅ Você verá: "X seções detectadas automaticamente!"

### 2. Processar Músicas Existentes
```bash
# Deploy da função
npx supabase functions deploy auto-generate-timestamps

# Execute a função
curl -X POST 'https://sffebcfgkthjcfnpgjvz.supabase.co/functions/v1/auto-generate-timestamps' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA"
```

### 3. Verificar Resultado
```sql
-- Ver todas as músicas com timestamps
SELECT id, titulo, section_timestamps
FROM tracks
WHERE section_timestamps IS NOT NULL
AND section_timestamps != '{}'::jsonb;

-- Ver uma música específica
SELECT titulo, section_timestamps
FROM tracks
WHERE titulo = 'Nome da Música';
```

## Vantagens

✅ **Automático** - Não precisa fazer nada manual
✅ **Inteligente** - Detecta seções da cifra automaticamente
✅ **Proporcional** - Distribui tempo baseado no tamanho real das seções
✅ **Retroativo** - Pode processar músicas antigas
✅ **Não-destrutivo** - Não quebra nada se falhar

## Limitações

⚠️ **Estimativa** - Os tempos são aproximados, não exatos
⚠️ **Requer seções** - A cifra precisa ter marcadores ([INTRO], [V1], etc.)
⚠️ **Sem áudio** - Não analisa o áudio real (seria muito complexo)

## Melhorando a Precisão

Para timestamps mais precisos, você ainda pode:
1. **Editar manualmente** no SQL
2. **Futuro**: Interface visual para ajustar timestamps (pode ser implementada)

## Build

✅ Build concluído com sucesso: **built in 2.40s**

## Próximos Passos

1. **Execute as migrações**:
```sql
-- Adicionar coluna section_timestamps
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;

-- Adicionar coluna bpm
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS bpm INTEGER DEFAULT 120;
```

2. **Deploy da função** (opcional, para processar músicas antigas):
```bash
npx supabase functions deploy auto-generate-timestamps
```

3. **Teste adicionando uma música nova** e veja a mágica acontecer! ✨
