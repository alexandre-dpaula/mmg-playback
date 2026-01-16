# CORREÇÃO URGENTE - Falha de Segurança em Events

## PROBLEMA IDENTIFICADO

**CRÍTICO:** Usuários estão vendo eventos de outras igrejas!

### Causa Raiz
A tabela `events` não possui a coluna `church_id`, que é essencial para isolar eventos por organização/igreja.

### Impacto
- ✗ Vazamento de dados entre organizações
- ✗ Usuários veem eventos que não deveriam ver
- ✗ Possível edição de eventos de outras igrejas
- ✗ Quebra de privacidade e multi-tenancy

## SOLUÇÃO - PASSO A PASSO

### PASSO 1: Fazer Backup (IMPORTANTE!)

```bash
# No terminal do Supabase Dashboard > SQL Editor
# Execute ANTES de qualquer alteração:

-- Backup da tabela events
CREATE TABLE events_backup_20260112 AS
SELECT * FROM public.events;

-- Backup da tabela event_tracks
CREATE TABLE event_tracks_backup_20260112 AS
SELECT * FROM public.event_tracks;
```

### PASSO 2: Diagnóstico Inicial

1. Acesse: **Supabase Dashboard** > **SQL Editor**
2. Abra o arquivo: `DIAGNOSTICO_SEGURANCA_EVENTS.sql`
3. Execute todas as queries
4. **Anote os resultados** - especialmente:
   - Quantos eventos existem sem church_id
   - Quantas igrejas existem no sistema
   - Quais usuários pertencem a quais igrejas

### PASSO 3: Aplicar Correção

1. Ainda no **SQL Editor**
2. Abra o arquivo: `CORRECAO_URGENTE_EVENTS_CHURCH_ID.sql`
3. **LEIA TODO O ARQUIVO** antes de executar
4. Ajuste a linha 27-29 conforme necessário:

```sql
-- Opção A: Associar eventos à primeira igreja (seguro para teste)
UPDATE public.events
SET church_id = (SELECT id FROM public.churches LIMIT 1)
WHERE church_id IS NULL;

-- Opção B: Associar eventos à igreja específica
UPDATE public.events
SET church_id = 'ID_DA_IGREJA_AQUI'
WHERE church_id IS NULL;

-- Opção C: Deletar eventos órfãos (CUIDADO! Perda de dados)
-- DELETE FROM public.events WHERE church_id IS NULL;
```

5. Execute o SQL completo
6. Verifique se não houve erros

### PASSO 4: Validação

1. Execute novamente: `DIAGNOSTICO_SEGURANCA_EVENTS.sql`
2. Verifique:
   - ✓ Coluna `church_id` existe e é NOT NULL
   - ✓ Nenhum evento sem church_id (COUNT = 0)
   - ✓ RLS está ativado (rowsecurity = true)
   - ✓ 4 políticas RLS ativas (select, insert, update, delete)

### PASSO 5: Teste Manual

1. **Faça login com Usuário A** (da Igreja X)
2. Navegue para a página de eventos
3. **Anote quais eventos aparecem**
4. Faça logout

5. **Faça login com Usuário B** (da Igreja Y)
6. Navegue para a página de eventos
7. **Verifique:** Usuário B NÃO deve ver eventos da Igreja X
8. **Verifique:** Usuário B só vê eventos da Igreja Y

### PASSO 6: Teste de Criação

1. Como Usuário A, **crie um novo evento**
2. Verifique que o evento foi criado com `church_id` correto
3. Como Usuário B, **verifique que NÃO vê o evento do Usuário A**

## COMANDOS RÁPIDOS

### Diagnóstico Rápido
```sql
-- Ver se church_id existe
SELECT column_name FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'church_id';

-- Ver eventos sem igreja
SELECT COUNT(*) FROM public.events WHERE church_id IS NULL;

-- Ver se RLS está ativo
SELECT rowsecurity FROM pg_tables WHERE tablename = 'events';
```

### Rollback de Emergência (se algo der errado)
```sql
-- Restaurar tabelas do backup
DROP TABLE public.events CASCADE;
CREATE TABLE public.events AS SELECT * FROM events_backup_20260112;

DROP TABLE public.event_tracks CASCADE;
CREATE TABLE public.event_tracks AS SELECT * FROM event_tracks_backup_20260112;

-- Recriar foreign keys
ALTER TABLE public.event_tracks
ADD CONSTRAINT event_tracks_event_id_fkey
FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
```

## PREVENÇÃO FUTURA

### Checklist de Segurança para Novas Tabelas

Sempre que criar uma tabela multi-tenant:

- [ ] Adicionar coluna `church_id UUID NOT NULL`
- [ ] Criar foreign key para `churches(id)`
- [ ] Criar índice: `CREATE INDEX idx_[tabela]_church_id`
- [ ] Ativar RLS: `ALTER TABLE [tabela] ENABLE ROW LEVEL SECURITY`
- [ ] Criar política SELECT com `church_id = get_user_church_id()`
- [ ] Criar política INSERT com `WITH CHECK (church_id = get_user_church_id())`
- [ ] Criar política UPDATE com filtro de church_id
- [ ] Criar política DELETE (geralmente apenas líderes)
- [ ] Testar isolamento entre igrejas

### Template de Política RLS
```sql
-- SELECT: Ver apenas da própria igreja
CREATE POLICY "[tabela]_select"
  ON public.[tabela]
  FOR SELECT
  USING (church_id = public.get_user_church_id());

-- INSERT: Criar apenas na própria igreja
CREATE POLICY "[tabela]_insert"
  ON public.[tabela]
  FOR INSERT
  WITH CHECK (church_id = public.get_user_church_id());

-- UPDATE: Editar apenas da própria igreja
CREATE POLICY "[tabela]_update"
  ON public.[tabela]
  FOR UPDATE
  USING (church_id = public.get_user_church_id())
  WITH CHECK (church_id = public.get_user_church_id());

-- DELETE: Apenas líderes da própria igreja
CREATE POLICY "[tabela]_delete"
  ON public.[tabela]
  FOR DELETE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );
```

## MONITORAMENTO CONTÍNUO

Execute periodicamente para garantir segurança:

```sql
-- Ver todas as tabelas sem RLS (PERIGO!)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;

-- Ver tabelas sem church_id (potencial problema)
SELECT table_name
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_name = t.table_name
      AND c.column_name = 'church_id'
  )
  AND table_name NOT IN ('churches', 'users_app', 'subscriptions', 'payments');
```

## SUPORTE

Se encontrar problemas:

1. **NÃO EXECUTE** mais SQL até entender o problema
2. Verifique os logs de erro
3. Execute o diagnóstico completo
4. Se necessário, use o rollback de emergência
5. Documente o erro encontrado

---

**Data:** 2026-01-12
**Prioridade:** CRÍTICA
**Status:** Aguardando Aplicação
**Próximo Passo:** Executar PASSO 1 (Backup)
