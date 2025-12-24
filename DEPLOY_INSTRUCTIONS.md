# Instruções de Deploy - Timestamps Automáticos

## Passo 1: Executar Migrações no Banco de Dados

Execute estes SQLs **separadamente** no Supabase SQL Editor:

### 1.1 - Adicionar coluna section_timestamps
```sql
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN tracks.section_timestamps IS 'Timestamps das seções da música para auto-scroll sincronizado com áudio. Formato: {"I": 0, "V1": 15, "C": 45}';
```

### 1.2 - Adicionar coluna bpm
```sql
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS bpm INTEGER DEFAULT 120;

COMMENT ON COLUMN tracks.bpm IS 'BPM (Batidas Por Minuto) da música para uso no metrônomo. Valor padrão: 120 BPM';
```

### 1.3 - Verificar se as colunas foram criadas
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tracks'
  AND column_name IN ('section_timestamps', 'bpm');
```

## Passo 2: Deploy da Edge Function (Processar Músicas Antigas)

### 2.1 - Deploy da função
Execute no terminal:
```bash
cd "/Users/alexandredpaula/dyad-apps/MMG - Ensaio Vocal"
npx supabase functions deploy auto-generate-timestamps
```

### 2.2 - Executar a função (processa TODAS as músicas)

**Via cURL** (Terminal):
```bash
curl -X POST 'https://sffebcfgkthjcfnpgjvz.supabase.co/functions/v1/auto-generate-timestamps' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA" \
  -H "Content-Type: application/json"
```

**Ou via Supabase Dashboard**:
1. Vá para Functions > auto-generate-timestamps
2. Clique em "Invoke"
3. Deixe o body vazio `{}`
4. Clique em "Invoke Function"

## Passo 3: Testar

### 3.1 - Verificar timestamps gerados
```sql
SELECT titulo, section_timestamps
FROM tracks
WHERE section_timestamps IS NOT NULL
  AND section_timestamps != '{}'::jsonb
LIMIT 10;
```

### 3.2 - Adicionar uma música nova
1. Abra o app
2. Clique em "Adicionar Música"
3. Cole URL da cifra
4. Salve
5. ✅ Deve aparecer: "X seções detectadas automaticamente!"

## Troubleshooting

### Erro: "coluna já existe"
✅ Normal! Significa que a coluna já foi criada. Pode ignorar.

### Erro: "function not found"
❌ A função não foi deployada. Execute:
```bash
npx supabase functions deploy auto-generate-timestamps
```

### Timestamps não aparecem em músicas novas
1. Verifique se a cifra tem marcadores de seção ([INTRO], [V1], etc.)
2. Verifique o console do navegador para logs
3. Verifique se a URL da cifra está correta

## O Que Acontece Agora

✅ **Músicas novas**: Timestamps gerados automaticamente ao salvar
✅ **Músicas antigas**: Processe uma vez com a Edge Function
✅ **Metrônomo**: Funcionando com Tap Tempo
✅ **Cores na barra**: Mudam conforme a seção
✅ **Auto-scroll**: Sincronizado com o YouTube
✅ **SongMap**: Clique pula para a seção
