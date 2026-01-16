# 🚨 URGENTE: Configurar Redirect URL no Supabase

## Problema Atual

O login com Google está funcionando, mas o redirect está indo para:
```
https://setlistgo.vercel.app/#access_token=...
```

Em vez de:
```
https://setlistgo.com/#access_token=...
```

---

## ✅ Solução: Configurar Site URL no Supabase

### 1. Acesse o Supabase Dashboard

**URL:** https://supabase.com/dashboard

**Caminho:** Seu Projeto → **Authentication** → **URL Configuration**

---

### 2. Site URL (Campo Principal)

**Encontre o campo:** `Site URL`

**Altere de:**
```
https://setlistgo.vercel.app
```

**Para:**
```
https://setlistgo.com
```

---

### 3. Redirect URLs (Adicionar URLs Permitidas)

**Encontre o campo:** `Redirect URLs`

**Adicione estas URLs (uma por linha):**

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

**Nota:** Mantemos `setlistgo.vercel.app/**` temporariamente para não quebrar se alguém ainda usar o link antigo.

---

### 4. Salvar Alterações

Clique no botão **Save** na parte inferior da página.

**⏱️ Importante:** As mudanças podem levar de alguns segundos até 5 minutos para propagar.

---

## 🧪 Testar Após Configuração

1. Limpe o cache do navegador (Ctrl+Shift+Del ou Cmd+Shift+Del)
2. Acesse: https://setlistgo.com
3. Tente fazer login com Google novamente
4. Verifique se o redirect agora vai para `setlistgo.com` (verifique a barra de endereços)

---

## 📸 Onde Encontrar no Dashboard

```
Supabase Dashboard
  └── [Seu Projeto]
      └── Authentication (ícone de cadeado no menu lateral)
          └── URL Configuration (aba no topo)
              ├── Site URL ← ALTERAR AQUI
              └── Redirect URLs ← ADICIONAR AQUI
```

---

## 🔍 Checklist

- [ ] Site URL alterada para `https://setlistgo.com`
- [ ] Redirect URLs adicionadas (incluindo wildcards `/**`)
- [ ] Alterações salvas
- [ ] Aguardado 1-2 minutos para propagação
- [ ] Cache do navegador limpo
- [ ] Testado login novamente

---

## ❓ Dúvidas?

Se ainda redirecionar para `.vercel.app`:
1. Verifique se salvou as alterações
2. Aguarde mais 5 minutos
3. Tente em modo anônimo/privado do navegador
4. Verifique se não há erros nos logs: **Supabase Dashboard → Logs → Auth Logs**
