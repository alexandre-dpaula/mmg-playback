# 🎯 CONFIGURAR NO PROJETO CORRETO DO SUPABASE

## ⚠️ Projeto Correto

Seu app está usando o projeto Supabase:

**Project ID:** `sffebcfgkthjcfnpgjvz`

**URL:** https://sffebcfgkthjcfnpgjvz.supabase.co

---

## 🔍 Como Identificar o Projeto Correto

1. Acesse: https://supabase.com/dashboard
2. Procure o projeto com **Project Ref: `sffebcfgkthjcfnpgjvz`**
3. Ou procure pelo nome do projeto que contém este ID na URL

**⚠️ NÃO configure no projeto "stageONE" se ele tiver outro ID!**

---

## ✅ Passos para Configurar

### 1. Acesse o Projeto Correto

**URL direta:**
```
https://supabase.com/project/sffebcfgkthjcfnpgjvz
```

Ou navegue manualmente:
1. https://supabase.com/dashboard
2. Clique no projeto que tem o ID `sffebcfgkthjcfnpgjvz`

---

### 2. Vá em Authentication → URL Configuration

**Caminho:**
```
Dashboard → [Projeto sffebcfgkthjcfnpgjvz] → Authentication → URL Configuration
```

---

### 3. Configure Site URL

**Campo:** Site URL

**Altere para:**
```
https://setlistgo.com
```

---

### 4. Configure Redirect URLs

**Campo:** Redirect URLs

**Adicione todas estas URLs (uma por linha):**

```
https://setlistgo.com/**
https://setlistgo.com/auth/callback
https://setlistgo.com/role-selection
https://setlistgo.com/waiting-invitation
https://setlistgo.com/reset-password
https://setlistgo.vercel.app/**
http://localhost:8080/**
http://localhost:8080/auth/callback
```

---

### 5. Salvar

Clique em **Save** no final da página.

---

## 🧪 Testar

1. Aguarde 1-2 minutos
2. Limpe o cache do navegador
3. Acesse: https://setlistgo.com
4. Faça login com Google
5. Verifique se o redirect agora vai para `setlistgo.com`

---

## 🔍 Verificar Projeto Atual no Dashboard

Se você não sabe qual é o projeto correto:

1. Vá em: https://supabase.com/dashboard
2. Para cada projeto, clique em **Settings** → **API**
3. Procure aquele que tem:
   - **Project URL:** `https://sffebcfgkthjcfnpgjvz.supabase.co`
   - **Project API Keys:** Deve ter a key que começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6...`

Esse é o projeto correto!

---

## 📋 Checklist

- [ ] Identifiquei o projeto com ID `sffebcfgkthjcfnpgjvz`
- [ ] Acessei Authentication → URL Configuration
- [ ] Site URL alterada para `https://setlistgo.com`
- [ ] Redirect URLs adicionadas
- [ ] Cliquei em Save
- [ ] Aguardei 1-2 minutos
- [ ] Limpei cache do navegador
- [ ] Testei login novamente

---

## 💡 Dica

Se você tem múltiplos projetos Supabase, sempre verifique o **Project ID** ou **Project Ref** nas configurações do projeto antes de fazer alterações.
