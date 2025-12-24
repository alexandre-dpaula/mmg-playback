# 🚀 Como Fazer Deploy - Passo a Passo

## ✅ O Que Foi Implementado

Agora **TODAS as músicas** (novas e antigas) terão:
- ✅ **Timestamps automáticos** (auto-scroll sincronizado)
- ✅ **Barra de progresso colorida** (muda conforme a seção)
- ✅ **SongMap interativo** (clique para pular seções)
- ✅ **Metrônomo com Tap Tempo**
- ✅ **Notificações com nomes completos** ("Verso 1" ao invés de "V1")

## 📋 Passo 1: Executar SQLs no Banco

Abra o **Supabase SQL Editor** e execute **cada SQL separadamente**:

### 1.1 - Adicionar coluna `section_timestamps`

```sql
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;
```

Clique em **RUN** ▶️

### 1.2 - Adicionar comentário na coluna

```sql
COMMENT ON COLUMN tracks.section_timestamps IS 'Timestamps das seções para auto-scroll sincronizado';
```

Clique em **RUN** ▶️

### 1.3 - Adicionar coluna `bpm`

```sql
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS bpm INTEGER DEFAULT 120;
```

Clique em **RUN** ▶️

### 1.4 - Adicionar comentário na coluna BPM

```sql
COMMENT ON COLUMN tracks.bpm IS 'BPM da música para uso no metrônomo';
```

Clique em **RUN** ▶️

### 1.5 - Verificar se funcionou

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tracks'
  AND column_name IN ('section_timestamps', 'bpm');
```

**Resultado esperado:**
```
column_name         | data_type | column_default
--------------------|-----------|-----------------
section_timestamps  | jsonb     | '{}'::jsonb
bpm                 | integer   | 120
```

Se aparecer essas 2 linhas = ✅ **Sucesso!**

---

## 📋 Passo 2: Deploy da Edge Function (Processar Músicas Antigas)

### 2.1 - Fazer deploy da função

No terminal, execute:

```bash
cd "/Users/alexandredpaula/dyad-apps/MMG - Ensaio Vocal"
npx supabase functions deploy auto-generate-timestamps
```

### 2.2 - Executar a função (processa TODAS as músicas existentes)

**Opção A - Via Terminal (recomendado):**

```bash
curl -X POST 'https://sffebcfgkthjcfnpgjvz.supabase.co/functions/v1/auto-generate-timestamps' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA" \
  -H "Content-Type: application/json"
```

**Opção B - Via Supabase Dashboard:**

1. Vá para **Functions** > `auto-generate-timestamps`
2. Clique em **Invoke**
3. Deixe o body vazio: `{}`
4. Clique em **Invoke Function**

**Resultado esperado:**

```json
{
  "success": true,
  "processed": 42,
  "results": [
    { "id": "...", "titulo": "Nome da Música", "status": "success", "sections": 6 },
    ...
  ]
}
```

---

## 📋 Passo 3: Testar

### 3.1 - Verificar músicas processadas

No Supabase SQL Editor:

```sql
SELECT titulo, section_timestamps
FROM tracks
WHERE section_timestamps IS NOT NULL
  AND section_timestamps != '{}'::jsonb
LIMIT 10;
```

Você verá algo como:

```
titulo          | section_timestamps
----------------|--------------------------------------------------
Sublime         | {"I": 0, "V1": 15, "PR": 45, "R1": 60, ...}
Outra Música    | {"I": 0, "V1": 12, "R1": 38, "V2": 68, ...}
```

### 3.2 - Adicionar uma música nova

1. Abra o app
2. Clique em **Adicionar Música**
3. Cole uma URL de cifra do CifraClub
4. Preencha os dados
5. Clique em **Salvar**

✅ **Você verá:** "6 seções detectadas automaticamente!" (ou o número correto)

### 3.3 - Abrir uma música e testar

1. Abra qualquer música
2. ✅ Veja o **metrônomo** no topo (TAP 120 BPM)
3. ✅ Clique no **SongMap** para pular seções
4. ✅ Veja a **barra mudar de cor** conforme a seção
5. ✅ Veja o **auto-scroll** sincronizado com o YouTube

---

## ❓ Troubleshooting

### ❌ Erro: "coluna já existe"

✅ **Normal!** Significa que a coluna já foi criada antes. Pode ignorar.

### ❌ Erro: "function not found"

Execute o deploy novamente:

```bash
npx supabase functions deploy auto-generate-timestamps
```

### ❌ Timestamps não aparecem em músicas novas

1. Verifique se a cifra tem marcadores de seção (`[INTRO]`, `[V1]`, etc.)
2. Abra o **Console do navegador** (F12) e veja os logs
3. Verifique se a URL da cifra está correta

### ❌ Metrônomo não toca som

1. Certifique-se de que o navegador permite reprodução de áudio
2. Teste em modo **Incógnito**
3. Verifique se o volume do dispositivo está ligado

---

## 🎉 Pronto!

Agora você tem:

- ✅ **Timestamps automáticos** em TODAS as músicas
- ✅ **Auto-scroll** sincronizado com YouTube
- ✅ **SongMap** interativo com cores
- ✅ **Metrônomo** com Tap Tempo
- ✅ **Notificações** com nomes completos das seções

**Não precisa fazer SQL manualmente nunca mais!** 🚀
