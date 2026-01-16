# Aplicar Migrações Pendentes

## Problema Identificado

Você mencionou que:
1. **Não está apagando eventos** - pode ser problema de RLS
2. **Não está salvando equipes** - tabela `event_members` pode não existir ou RLS bloqueando

## Solução: Aplicar Migrações

Execute os comandos abaixo para aplicar as migrações pendentes no Supabase:

### 1. Migração de Event Members (Equipes)

```bash
psql "postgresql://postgres.cxzknfpbtqicfngpjyvz:MeuMinisterioGospel_SenhaSeguinha123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" -f supabase/migrations/20251229_create_event_members.sql
```

### 2. Verificar se a tabela foi criada

```bash
psql "postgresql://postgres.cxzknfpbtqicfngpjyvz:MeuMinisterioGospel_SenhaSeguinha123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" -c "\d event_members"
```

### 3. Verificar RLS de Events (para deletar)

```bash
psql "postgresql://postgres.cxzknfpbtqicfngpjyvz:MeuMinisterioGospel_SenhaSeguinha123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" -c "SELECT policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'events';"
```

## O que cada migração faz:

### event_members (Equipes)
- Cria tabela `event_members` para armazenar membros da equipe de cada evento
- Relaciona evento + perfil + papel (vocal/instrumental/multimedia)
- RLS permite que líderes/admins adicionem/removam membros
- ON DELETE CASCADE: quando evento é deletado, membros também são

### RLS de Events
- Permite que líderes/admins DELETEM eventos da sua igreja
- Se não tiver política DELETE, eventos não podem ser apagados

## Como saber se funcionou:

1. **Equipes**: Tente adicionar membros a um evento
2. **Deletar**: Tente apagar um evento pelo menu "..."

## Se ainda não funcionar:

Verifique no console do navegador se há erros como:
- "relation event_members does not exist" → Migração não aplicada
- "permission denied" ou "RLS" → Problema de políticas RLS
- "violates foreign key constraint" → Dados inconsistentes

Me mostre o erro exato que aparece no console para eu ajudar!
