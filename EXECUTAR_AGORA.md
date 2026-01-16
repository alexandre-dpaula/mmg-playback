# 🚀 EXECUTAR AGORA - CORRIGIR RLS PERMISSIVO

## ⚠️ PRIORIDADE ALTA: Igreja A vendo dados da Igreja B

---

## 📋 PASSO A PASSO RÁPIDO (15 minutos)

### **PASSO 1: Abrir Supabase** ⏱️ 1 min

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **MMGPlayback**
3. Clique em **SQL Editor** no menu lateral

---

### **PASSO 2: Backup Rápido** ⏱️ 2 min

1. Copie e cole este SQL no editor:

```sql
-- BACKUP RÁPIDO - Copie a saída e guarde
SELECT
  tablename,
  policyname,
  cmd::text,
  qual::text as condicao_atual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('events', 'tracks', 'notifications', 'users_app', 'profiles')
ORDER BY tablename;
```

2. Clique em **RUN**
3. **COPIE toda a saída** e salve em um arquivo de texto
4. ✅ Agora você tem o backup!

---

### **PASSO 3: Testar App ANTES** ⏱️ 2 min

1. Abra o app em outra aba: http://localhost:5173 (ou produção)
2. Faça login
3. **Anote o que você vê AGORA:**
   - [ ] Quantos eventos aparecem? ______
   - [ ] Notificação badge aparece? ______
   - [ ] Consegue adicionar música? ______

---

### **PASSO 4: EXECUTAR RLS_SEGURO_FINAL.sql** ⏱️ 2 min

1. No SQL Editor do Supabase
2. **Copie TODO o conteúdo** do arquivo `RLS_SEGURO_FINAL.sql`
3. Cole no editor
4. Clique em **RUN**
5. **AGUARDE** a execução completar

**✅ Sucesso se aparecer:**
- Mensagens "DROP POLICY" (removendo antigas)
- Mensagens "CREATE POLICY" (criando novas)
- Tabela final com colunas: tablename, policyname, operacao, nivel_seguranca

**🚨 Se der erro:** Copie a mensagem de erro completa e me mostre

---

### **PASSO 5: TESTAR APP DEPOIS** ⏱️ 5 min

1. **RECARREGUE** a página do app (F5 ou Cmd+R)
2. Teste o checklist:

#### ✅ Checklist Obrigatório:

- [ ] **Login funciona?**
  - Se NÃO → Vá para PASSO 6 (Rollback)

- [ ] **Vê os mesmos eventos de antes?**
  - Se NÃO → Vá para PASSO 6 (Rollback)

- [ ] **Badge de notificação aparece?**
  - Se NÃO → Vá para PASSO 6 (Rollback)

- [ ] **Consegue criar novo evento?**
  - Se NÃO → Vá para PASSO 6 (Rollback)

- [ ] **Consegue adicionar música a evento?**
  - Se NÃO → Vá para PASSO 6 (Rollback)

- [ ] **Console sem erros de RLS?** (F12 → Console)
  - Se tem erros → Vá para PASSO 6 (Rollback)

---

### **PASSO 6: ROLLBACK (se necessário)** ⏱️ 1 min

**⚠️ EXECUTE APENAS SE ALGO NO PASSO 5 FALHOU**

1. No SQL Editor do Supabase
2. Copie TODO o conteúdo de `ROLLBACK_RLS_EMERGENCIA.sql`
3. Cole e execute
4. Recarregue o app
5. Me avise do problema

---

### **PASSO 7: VERIFICAR SEGURANÇA** ⏱️ 1 min

**✅ SE TUDO FUNCIONOU no Passo 5:**

Procure na saída do SQL a tabela de verificação.

**Deve mostrar:**

| tablename | policyname | operacao | nivel_seguranca |
|-----------|------------|----------|-----------------|
| events | events_select_policy | SELECT | 🔒 SEGURO (isolamento por igreja) |
| events | events_insert_policy | INSERT | 🔒 SEGURO (isolamento por igreja) |
| tracks | tracks_select_policy | SELECT | 🔒 SEGURO (isolamento por igreja) |
| users_app | users_app_select_policy | SELECT | ⚠️ PERMISSIVO (todos autenticados) |
| profiles | profiles_select_policy | SELECT | ⚠️ PERMISSIVO (todos autenticados) |

**✅ É NORMAL** `users_app` e `profiles` serem permissivos para leitura (para @ mentions, convites, etc)

**🔒 CRÍTICO** que `events`, `tracks`, `notifications` sejam "SEGURO (isolamento por igreja)"

---

## 🎯 RESULTADO ESPERADO

### **ANTES:**
```
Igreja "Graça e Paz" → Vê TODOS os eventos (inclusive de outras igrejas)
Igreja "Nova Vida" → Vê TODOS os eventos (inclusive de outras igrejas)
❌ PROBLEMA!
```

### **DEPOIS:**
```
Igreja "Graça e Paz" → Vê APENAS eventos da "Graça e Paz"
Igreja "Nova Vida" → Vê APENAS eventos da "Nova Vida"
✅ ISOLADO!
```

---

## 📞 PRECISA DE AJUDA?

**Durante execução:**
- Tire print de qualquer erro
- Não tente consertar sozinho
- Execute ROLLBACK primeiro, depois me avise

**Tudo certo:**
- Me mostre a tabela de verificação final
- Confirme que todas as funcionalidades funcionam

---

## 🚀 PRONTO PARA COMEÇAR?

Quando estiver pronto:
1. Abra o Supabase SQL Editor
2. Comece pelo PASSO 2 (Backup)
3. Siga cada passo na ordem
4. Me avise ao completar ou se tiver problema

**Boa sorte! Estou aqui para ajudar.** 💪
