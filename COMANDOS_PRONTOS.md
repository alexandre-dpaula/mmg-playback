# 📋 COMANDOS PRONTOS - Copie e Cole

Use este arquivo para fazer o deploy rapidamente. Basta copiar e colar cada comando.

---

## 🗄️ PARTE 1: SQLs no Supabase

Abra o **Supabase SQL Editor** e execute **um por vez**:

### SQL 1: Adicionar coluna section_timestamps

```sql
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;
```

✅ Execute e aguarde: **Success. No rows returned**

---

### SQL 2: Adicionar comentário

```sql
COMMENT ON COLUMN tracks.section_timestamps IS 'Timestamps das seções para auto-scroll sincronizado';
```

✅ Execute e aguarde: **Success**

---

### SQL 3: Adicionar coluna bpm

```sql
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS bpm INTEGER DEFAULT 120;
```

✅ Execute e aguarde: **Success. No rows returned**

---

### SQL 4: Adicionar comentário BPM

```sql
COMMENT ON COLUMN tracks.bpm IS 'BPM da música para uso no metrônomo';
```

✅ Execute e aguarde: **Success**

---

### SQL 5: Verificar se funcionou

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

Se aparecer **2 linhas** = ✅ **SUCESSO!**

---

## 🚀 PARTE 2: Deploy da Edge Function

Abra o **Terminal** e execute:

### Comando 1: Deploy

```bash
cd "/Users/alexandredpaula/dyad-apps/MMG - Ensaio Vocal"
npx supabase functions deploy auto-generate-timestamps
```

**Resultado esperado:**
```
Deploying auto-generate-timestamps...
✓ Deployed function auto-generate-timestamps
```

---

## 🔄 PARTE 3: Processar Músicas Antigas

### Opção A: Via Terminal (Recomendado)

Copie e cole no terminal:

```bash
curl -X POST 'https://sffebcfgkthjcfnpgjvz.supabase.co/functions/v1/auto-generate-timestamps' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA" \
  -H "Content-Type: application/json"
```

**Resultado esperado:**
```json
{
  "success": true,
  "processed": 42,
  "results": [
    { "id": "...", "titulo": "Sublime", "status": "success", "sections": 6 },
    { "id": "...", "titulo": "Outra Música", "status": "success", "sections": 4 },
    ...
  ]
}
```

---

### Opção B: Via Supabase Dashboard

Se preferir usar a interface:

1. Vá para: **Functions** > `auto-generate-timestamps`
2. Clique em: **Invoke**
3. No body, deixe vazio: `{}`
4. Clique em: **Invoke Function**
5. Aguarde o resultado aparecer

---

## ✅ PARTE 4: Verificar se Funcionou

Execute no **Supabase SQL Editor**:

```sql
SELECT titulo, section_timestamps
FROM tracks
WHERE section_timestamps IS NOT NULL
  AND section_timestamps != '{}'::jsonb
LIMIT 10;
```

**Resultado esperado:**
```
titulo          | section_timestamps
----------------|--------------------------------------------------
Sublime         | {"I": 0, "V1": 15, "PR": 45, "R1": 60, ...}
Outra Música    | {"I": 0, "V1": 12, "R1": 38, ...}
...
```

Se aparecer **várias músicas** com timestamps = ✅ **FUNCIONOU!**

---

## 🧪 PARTE 5: Testar Música Nova

1. Abra o app
2. Clique em **Adicionar Música**
3. Cole esta URL de teste:
   ```
   https://www.cifraclub.com.br/u2/one/
   ```
4. Preencha:
   - Título: `One`
   - Artista: `U2`
5. Clique em **Salvar**

**Resultado esperado:**
```
✅ 4 seções detectadas automaticamente!
```

---

## 📊 PARTE 6: Ver Timestamps da Música Teste

Execute no **Supabase SQL Editor**:

```sql
SELECT titulo, section_timestamps
FROM tracks
WHERE titulo = 'One';
```

**Resultado esperado:**
```json
{
  "I": 0,
  "V1": 20,
  "PR": 80,
  "R": 120
}
```

---

## 🎵 PARTE 7: Testar Metrônomo

1. Abra qualquer música no app
2. Veja o botão no topo: **TAP 120 BPM**
3. Clique para ligar → Deve tocar som
4. Clique 3x rápido → BPM ajusta automaticamente
5. Aguarde 2s e clique → Desliga

---

## 🎨 PARTE 8: Testar SongMap

1. Abra uma música com timestamps
2. Veja o SongMap colorido:
   ```
   ┌─┬──┬──┬─┐
   │I│V1│PR│R│
   └─┴──┴──┴─┘
   ```
3. Clique em qualquer seção → Deve pular e mostrar:
   ```
   ✅ Pulou para Verso 1 (0:15)
   ```

---

## ❓ Se Der Erro

### Erro: "coluna já existe"
✅ **Normal!** Pode ignorar, a coluna já foi criada.

### Erro: "function not found"
Execute novamente o deploy:
```bash
npx supabase functions deploy auto-generate-timestamps
```

### Erro: "Authorization required"
Verifique se o `Authorization Bearer` está correto no curl.

### Erro: "No sections found"
A cifra não tem marcadores `[INTRO]`, `[V1]`, etc. Escolha outra música.

---

## 🎉 Pronto!

Se todos os passos funcionaram:

✅ **Banco de dados** atualizado
✅ **Edge Function** deployada
✅ **Músicas antigas** processadas
✅ **Músicas novas** geram timestamps automaticamente
✅ **SongMap** funcionando
✅ **Auto-scroll** sincronizado
✅ **Metrônomo** com Tap Tempo

**Tudo automático!** 🚀

---

## 📖 Precisa de Ajuda?

Consulte os guias completos:
- **[COMO_FAZER_DEPLOY.md](COMO_FAZER_DEPLOY.md)** - Passo a passo detalhado
- **[COMO_FUNCIONA_AUTOMATICO.md](COMO_FUNCIONA_AUTOMATICO.md)** - Como funciona
- **[RESUMO_FINAL.md](RESUMO_FINAL.md)** - Visão geral completa
