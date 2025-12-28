# 🐛 Debug: Erro ao Criar Evento Pessoal

## Problema Reportado

Usuário: `dpaulax@gmail.com` (sem igreja)
Erro: "Erro ao salvar evento"
Situação: Tentando criar evento pessoal marcando checkbox "Evento pessoal (somente eu vejo)"

## Verificações Necessárias

### 1. Verificar se a migration foi executada

Execute no Supabase SQL Editor:

```sql
-- Verificar se igreja "Sem igreja" existe
SELECT id, name
FROM churches
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Se retornar vazio, execute o arquivo:
-- APLICAR_EVENTOS_PESSOAIS_COMPLETO.sql
```

### 2. Verificar RLS policies

```sql
-- Ver políticas de events
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'events'
ORDER BY policyname;

-- Deve retornar:
-- events_delete | DELETE
-- events_insert | INSERT
-- events_select | SELECT
-- events_update | UPDATE
```

### 3. Verificar dados do usuário

```sql
-- Ver church_id do usuário
SELECT
  email,
  church_id,
  CASE
    WHEN church_id IS NULL THEN '✅ Sem igreja (pode criar eventos pessoais)'
    ELSE '⚠️ Tem igreja: ' || church_id::text
  END as status
FROM users_app
WHERE email = 'dpaulax@gmail.com';
```

### 4. Ver erro completo no console

No navegador:
1. Abra DevTools (F12)
2. Aba **Console**
3. Tente criar evento novamente
4. Procure por mensagens com ❌ ou "Erro"
5. Copie o erro completo

### 5. Ver logs da política RLS

```sql
-- Habilitar logs detalhados
SET client_min_messages = 'debug5';

-- Tentar inserir como teste (substitua o user_id)
INSERT INTO events (
  name,
  date,
  church_id,
  created_by
) VALUES (
  'Teste Evento Pessoal',
  '2025-12-26',
  '00000000-0000-0000-0000-000000000000',
  'SEU_AUTH_USER_ID_AQUI'
);
```

## Possíveis Causas

### Causa 1: Migration não executada
**Sintoma**: Igreja "Sem igreja" não existe no banco

**Solução**:
```bash
# Execute o arquivo SQL
npx supabase db execute --file APLICAR_EVENTOS_PESSOAIS_COMPLETO.sql
```

### Causa 2: Função `get_user_church_id()` retorna NULL
**Sintoma**: RLS bloqueia porque não encontra church_id do usuário

**Solução**: Verificar função helper
```sql
SELECT public.get_user_church_id();
-- Deve retornar NULL para usuário sem igreja
```

### Causa 3: `created_by` não está sendo setado corretamente
**Sintoma**: RLS bloqueia porque created_by não é auth.uid()

**Debug no código**:
```typescript
// Em EventFormModal.tsx linha 292
console.log("🔍 User ID:", user.id);
console.log("🔍 Church ID:", churchId);
console.log("🔍 Created By:", user.id);
```

### Causa 4: RLS está muito restritivo
**Sintoma**: Política WITH CHECK está rejeitando insert

**Teste temporário** (CUIDADO - apenas para debug):
```sql
-- TEMPORARIAMENTE desabilitar RLS para testar
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Tentar criar evento
-- Se funcionar, o problema é RLS

-- REABILITAR imediatamente
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

## Solução Rápida

Se o erro persistir, execute este SQL para corrigir as policies:

```sql
-- Dropar e recriar policy INSERT mais permissiva
DROP POLICY IF EXISTS "events_insert" ON public.events;

CREATE POLICY "events_insert"
  ON public.events
  FOR INSERT
  WITH CHECK (
    -- Qualquer usuário autenticado pode criar evento
    (auth.uid() IS NOT NULL)
    AND
    (
      -- Eventos da igreja (se tiver church_id)
      (church_id = public.get_user_church_id() AND church_id IS NOT NULL)
      OR
      -- Eventos pessoais (igreja especial)
      (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())
    )
  );
```

## Como Debugar no App

1. Abra o app no navegador
2. F12 → Console
3. Adicione logs antes de salvar evento
4. Veja exatamente qual erro o Supabase retorna

## Próximos Passos

1. ✅ Executar migration se ainda não foi
2. ✅ Verificar logs do console do navegador
3. ✅ Testar criação de evento com RLS temporariamente desabilitado
4. ✅ Reportar erro exato aqui para análise
