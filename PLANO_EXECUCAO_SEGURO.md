# 🔐 PLANO DE EXECUÇÃO SEGURO - ATUALIZAÇÃO RLS

## ⚠️ LEIA TUDO ANTES DE EXECUTAR

---

## 📋 ARQUIVOS CRIADOS

1. **CONSULTAR_RLS_ATUAL.sql** - Ver políticas atuais (não modifica nada)
2. **BACKUP_RLS_ATUAL.sql** - Gerar backup das políticas (não modifica nada)
3. **RLS_SEGURO_FINAL.sql** - Script de atualização (MODIFICA as políticas)
4. **ROLLBACK_RLS_EMERGENCIA.sql** - Desfazer mudanças se der problema

---

## ✅ PASSO A PASSO SEGURO

### **PASSO 1: CONSULTAR ESTADO ATUAL** ⏱️ 1 min

1. Abra o Supabase SQL Editor
2. Execute o arquivo: `CONSULTAR_RLS_ATUAL.sql`
3. **COPIE E SALVE** toda a saída em um arquivo de texto
4. Confirme que você vê políticas nas tabelas:
   - `users_app`
   - `profiles`
   - `events`
   - `notifications`

**✋ NÃO CONTINUE se não ver políticas ativas!**

---

### **PASSO 2: FAZER BACKUP** ⏱️ 2 min

1. Execute o arquivo: `BACKUP_RLS_ATUAL.sql`
2. **COPIE TODA a saída** (especialmente a coluna `restore_script`)
3. **SALVE em um arquivo**: `backup-rls-{DATA-ATUAL}.txt`
4. Guarde este arquivo em local seguro

**Este é seu plano B se algo der errado!**

---

### **PASSO 3: TESTAR EM HORÁRIO SEGURO** ⏱️ Planejamento

**Escolha um momento adequado:**
- ✅ Quando você tiver 15-30 minutos disponíveis
- ✅ Quando poucos usuários estiverem usando o sistema
- ✅ Quando você puder testar imediatamente após aplicar
- ❌ NÃO faça durante horário de pico de uso
- ❌ NÃO faça se precisar sair logo depois

---

### **PASSO 4: EXECUTAR ATUALIZAÇÃO** ⏱️ 2 min

1. Abra uma aba no navegador com o app funcionando
2. Faça login como usuário normal
3. Anote o que você consegue ver ANTES:
   - Quantos eventos aparecem?
   - Quantas notificações?
   - Qual church_id você está usando?

4. No Supabase SQL Editor, execute: `RLS_SEGURO_FINAL.sql`
5. **AGUARDE a confirmação** de sucesso

---

### **PASSO 5: TESTAR IMEDIATAMENTE** ⏱️ 5 min

**No app (recarregue a página):**

✅ **Checklist de testes:**
- [ ] Consegue fazer login?
- [ ] Consegue ver eventos da sua igreja?
- [ ] Consegue criar novo evento?
- [ ] Consegue editar evento existente?
- [ ] Consegue adicionar música a um evento?
- [ ] Consegue ver notificações?
- [ ] Badge de notificação aparece?
- [ ] Consegue ver membros da igreja?
- [ ] Avatar aparece corretamente?

**Se QUALQUER item falhar:**
1. Vá para o PASSO 6 (Rollback)
2. NÃO tente consertar agora
3. Primeiro restaure o funcionamento

---

### **PASSO 6: ROLLBACK (se necessário)** ⏱️ 1 min

**Se algo não funcionar:**

1. Execute imediatamente: `ROLLBACK_RLS_EMERGENCIA.sql`
2. Recarregue o app
3. Teste novamente o checklist
4. Me avise do problema para investigarmos

**Você terá voltado ao estado anterior (funcionando)**

---

### **PASSO 7: VERIFICAR SEGURANÇA** ⏱️ 2 min

**Se tudo funcionou:**

A última query do `RLS_SEGURO_FINAL.sql` mostra:

```
tablename | policyname | operacao | nivel_seguranca
```

**Verifique que aparece:**
- 🔒 SEGURO (isolamento por igreja) - Para events, tracks, notifications
- 🔒 SEGURO (isolamento por usuário) - Para users_app, profiles
- ⚠️ PERMISSIVO - Apenas em places específicos documentados

---

## 🎯 O QUE MUDA NA PRÁTICA?

### **ANTES (Políticas Permissivas):**
```sql
-- Qualquer usuário autenticado via TUDO
USING (true)
```

**Problema:** Igreja A poderia ver dados da Igreja B

### **DEPOIS (Políticas Seguras):**
```sql
-- Só vê dados da própria igreja
USING (
  church_id IN (
    SELECT church_id FROM users_app WHERE auth_user_id = auth.uid()
  )
)
```

**Benefício:** Igreja A só vê Igreja A, Igreja B só vê Igreja B

---

## 🚨 SINAIS DE PROBLEMA

**Execute ROLLBACK imediatamente se:**

- ❌ App mostra tela branca após login
- ❌ Console mostra erros "row-level security policy"
- ❌ Eventos desaparecem (quando deveriam estar visíveis)
- ❌ Notificações não carregam
- ❌ Não consegue criar/editar eventos

---

## ✅ SINAIS DE SUCESSO

**Está tudo OK se:**

- ✅ Login funciona normalmente
- ✅ Você vê os mesmos eventos de antes
- ✅ Você vê as mesmas notificações de antes
- ✅ Consegue criar/editar/deletar eventos
- ✅ Badge de notificação funciona
- ✅ Não há erros no console

---

## 📞 PRECISA DE AJUDA?

**Durante a execução:**

1. Se tiver dúvida EM QUALQUER PASSO, pare e me pergunte
2. Se algo der errado, execute ROLLBACK primeiro
3. Depois me avise para investigarmos juntos

**Não tente "consertar na hora" - primeiro restaure!**

---

## 🎬 PRONTO PARA COMEÇAR?

**Confirme que você tem:**

- [ ] 15-30 minutos disponíveis
- [ ] Poucos usuários usando o sistema agora
- [ ] Acesso ao Supabase SQL Editor
- [ ] Uma aba do app aberta para testar
- [ ] Leu todo este documento

**Se marcou todos, vamos começar pelo PASSO 1!**

---

## 📝 NOTAS IMPORTANTES

1. **Este processo é REVERSÍVEL** - Você pode voltar atrás
2. **Não há risco de perda de dados** - Só mudamos políticas de acesso
3. **O backup é sua segurança** - Guarde bem o arquivo gerado no PASSO 2
4. **Teste imediatamente** - Não deixe para testar depois
5. **Rollback é rápido** - 1 minuto para restaurar se necessário

---

Alguma dúvida antes de começar?
