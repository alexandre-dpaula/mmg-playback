# Configuração do Supabase - Processamento de Cifras do CifraClub

## 📋 Visão Geral

Este projeto usa Supabase Edge Functions e triggers SQL para processar automaticamente URLs do CifraClub quando uma faixa é adicionada ao banco de dados.

## 🚀 Passos para Configuração

### 1. Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Ou usando npm
npm install -g supabase
```

### 2. Fazer Login no Supabase

```bash
supabase login
```

### 3. Linkar com seu Projeto

```bash
# Obtenha o Project Ref no dashboard do Supabase (Settings > General)
supabase link --project-ref SEU_PROJECT_REF
```

### 4. Adicionar Coluna `cifra_content` na Tabela

Execute a migration SQL no Supabase Dashboard ou via CLI:

```sql
-- Adicionar coluna para armazenar conteúdo extraído
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS cifra_content TEXT;
```

### 5. Habilitar Extensão `pg_net` (Opcional - para triggers assíncronos)

No Supabase Dashboard > Database > Extensions:
- Procure por `pg_net`
- Clique em "Enable"

**Alternativa sem `pg_net`**: Use webhooks do Supabase (Database > Webhooks)

### 6. Deploy da Edge Function

```bash
cd supabase/functions
supabase functions deploy process-cifraclub
```

### 7. Configurar Variáveis de Ambiente na Edge Function

No Supabase Dashboard > Edge Functions > process-cifraclub > Settings:

Ou via CLI:
```bash
supabase secrets set SUPABASE_URL=https://seu-projeto.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### 8. Opção A: Usar Trigger SQL (Requer pg_net)

Execute o SQL em `migrations/add_cifra_processing.sql` no SQL Editor do Supabase Dashboard.

**Antes de executar**, configure os settings:

```sql
-- Configurar URLs (execute uma vez)
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://seu-projeto.supabase.co';
ALTER DATABASE postgres SET app.settings.service_role_key = 'sua_service_role_key';
```

### 8. Opção B: Usar Webhook (Recomendado - mais simples)

1. Vá em **Database > Webhooks** no Dashboard
2. Clique em **Create a new webhook**
3. Configure:
   - **Name**: `process-cifraclub-webhook`
   - **Table**: `tracks`
   - **Events**: `INSERT`, `UPDATE`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://seu-projeto.supabase.co/functions/v1/process-cifraclub`
   - **HTTP Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer SUA_SERVICE_ROLE_KEY
     ```
   - **HTTP Params** (payload):
     ```json
     {
       "trackId": "{{ record.id }}",
       "cifraUrl": "{{ record.cifra_url }}"
     }
     ```
   - **Conditions**: `record.cifra_url LIKE '%cifraclub.com%'`

4. Salve e teste

## 🔍 Como Funciona

```
1. Usuário adiciona faixa com URL do CifraClub
   ↓
2. Dados salvos na tabela 'tracks'
   ↓
3. Trigger/Webhook detecta URL do CifraClub
   ↓
4. Chama Edge Function 'process-cifraclub'
   ↓
5. Edge Function:
   - Busca HTML da página do CifraClub
   - Extrai conteúdo da cifra (letra + acordes)
   - Salva em 'cifra_content'
   ↓
6. Conteúdo fica disponível na coluna 'cifra_content'
```

## 📊 Estrutura da Tabela

```sql
tracks (
  id UUID PRIMARY KEY,
  evento TEXT,
  titulo TEXT NOT NULL,
  tag TEXT,
  tom TEXT,
  versao TEXT,
  cifra_url TEXT,           -- URL do CifraClub ou Google Docs
  cifra_content TEXT,        -- Conteúdo extraído (NEW!)
  audio_url TEXT,
  created_at TIMESTAMPTZ
)
```

## 🧪 Testar

```bash
# Testar Edge Function localmente
supabase functions serve process-cifraclub

# Em outro terminal, testar chamada
curl -i --location --request POST 'http://localhost:54321/functions/v1/process-cifraclub' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --header 'Content-Type: application/json' \
  --data '{"trackId":"123","cifraUrl":"https://www.cifraclub.com.br/exemplo/"}'
```

## 🎯 Consultar Conteúdo Extraído

```sql
-- Ver cifra extraída
SELECT titulo, cifra_url, cifra_content
FROM tracks
WHERE cifra_content IS NOT NULL;
```

## 🔧 Troubleshooting

### Edge Function não está sendo chamada
- Verifique se o webhook/trigger está configurado corretamente
- Confira os logs: `supabase functions logs process-cifraclub`

### Erro de CORS
- Certifique-se de que os headers CORS estão corretos na Edge Function

### Conteúdo não está sendo extraído
- Teste a URL do CifraClub manualmente
- Verifique os logs da Edge Function
- O CifraClub pode ter mudado a estrutura HTML

## 📝 Notas

- O processamento é **assíncrono** - pode levar alguns segundos
- URLs de outros sites (Google Docs) não serão processadas
- O conteúdo original da URL é mantido em `cifra_url`
- Para re-processar, faça UPDATE na coluna `cifra_url`

## 🔗 Links Úteis

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks)
- [pg_net Extension](https://supabase.com/docs/guides/database/extensions/pg_net)
