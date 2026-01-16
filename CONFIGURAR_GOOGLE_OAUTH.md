# Configuração Google OAuth para setlistgo.com

## 🎯 Ações no Google Cloud Console

### URL Atual
Você está em: **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID**

---

## 1️⃣ Remover URI de Redirecionamento Antigo

Na seção **URIs de redirecionamento autorizados**, você tem:
```
https://sffebcfgkthjcfnpgjvz.supabase.co/auth/v1/callback
```

**Ação:** Clique no ícone de **lixeira** ao lado desta URL para removê-la (se for um domínio antigo ou de teste).

**Nota:** Se este é o seu projeto Supabase atual, **MANTENHA** esta URL! Ela é essencial para o OAuth funcionar.

---

## 2️⃣ Adicionar Origens JavaScript Autorizadas

Clique no botão **+ Adicionar URI** na seção **Origens JavaScript autorizadas**.

Adicione as seguintes URLs:

### Produção
```
https://setlistgo.com
```

### Desenvolvimento (opcional, se você testa localmente)
```
http://localhost:8080
```

---

## 3️⃣ Verificar URIs de Redirecionamento

Na seção **URIs de redirecionamento autorizados**, certifique-se de ter:

```
https://sffebcfgkthjcfnpgjvz.supabase.co/auth/v1/callback
```

**IMPORTANTE:** Esta URL deve corresponder ao seu projeto Supabase. Se você não tem certeza, verifique no Supabase Dashboard:
- **Supabase Dashboard → Settings → API → Configuration**
- Procure por: **URL** (exemplo: `https://[project-ref].supabase.co`)

O callback URI sempre será: `https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback`

---

## 4️⃣ Salvar as Alterações

Clique no botão **Salvar** no canto inferior esquerdo.

**Nota:** Pode levar de 5 minutos a algumas horas para as configurações entrarem em vigor.

---

## ✅ Configuração Final Esperada

### Origens JavaScript autorizadas
- `https://setlistgo.com`
- `http://localhost:8080` (opcional, para dev)

### URIs de redirecionamento autorizados
- `https://sffebcfgkthjcfnpgjvz.supabase.co/auth/v1/callback`

---

## 🧪 Testar Após Configuração

1. Acesse: https://setlistgo.com
2. Tente fazer login com Google
3. Verifique se o redirect funciona corretamente

Se houver erro, aguarde 5-10 minutos e tente novamente (propagação da configuração).

---

## 🚨 Troubleshooting

### Erro: "Error 400: redirect_uri_mismatch"
**Causa:** A URI de callback não está na lista de URIs autorizados.

**Solução:**
1. Verifique se a URL do Supabase está correta
2. Copie exatamente do Supabase Dashboard
3. Aguarde 5-10 minutos após salvar

### Erro: "origin_mismatch"
**Causa:** A origem JavaScript não está autorizada.

**Solução:**
1. Adicione `https://setlistgo.com` nas Origens JavaScript
2. Salve e aguarde alguns minutos

---

## 📋 Checklist

- [ ] Origens JavaScript incluem `https://setlistgo.com`
- [ ] URI de redirecionamento do Supabase está correta
- [ ] Alterações salvas
- [ ] Aguardado 5-10 minutos para propagação
- [ ] Testado login com Google em https://setlistgo.com

---

## 📚 Referência

- [Documentação Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
