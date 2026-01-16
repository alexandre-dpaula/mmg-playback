# Configuração do Domínio setlistgo.com no Supabase

## 🎯 Ações Necessárias no Supabase Dashboard

Acesse: **Supabase Dashboard → Authentication → URL Configuration**

---

## 1. Site URL (URL Principal)

**Campo:** Site URL

**Valor:**
```
https://setlistgo.com
```

---

## 2. Redirect URLs (URLs Permitidas para OAuth)

**Campo:** Redirect URLs

Adicione TODAS estas URLs (uma por linha):

```
https://setlistgo.com/**
https://setlistgo.com/auth/callback
https://setlistgo.com/role-selection
https://setlistgo.com/waiting-invitation
https://setlistgo.com/reset-password
http://localhost:8080/**
http://localhost:8080/auth/callback
http://localhost:8080/role-selection
http://localhost:8080/waiting-invitation
http://localhost:8080/reset-password
```

**⚠️ IMPORTANTE:** O wildcard `/**` permite qualquer path após a URL base.

---

## 3. Verificar Configurações de OAuth Providers

### Google OAuth
- Acesse: **Authentication → Providers → Google**
- Verifique se o **Authorized redirect URIs** no Google Cloud Console inclui:
  ```
  https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback
  ```

### Apple OAuth (se configurado)
- Acesse: **Authentication → Providers → Apple**
- Verifique as configurações de Return URLs

---

## 4. Email Templates (Opcional mas Recomendado)

Atualize os templates de email para usar o novo domínio:

### Confirm Signup Template
```html
<h2>Confirme seu email</h2>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
```

### Reset Password Template
```html
<h2>Recuperação de Senha</h2>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
```

### Magic Link Template
```html
<h2>Login Mágico</h2>
<p>Clique no link abaixo para fazer login:</p>
<p><a href="{{ .ConfirmationURL }}">Fazer Login</a></p>
```

---

## 5. CORS Configuration (se necessário)

Se você tiver configurações customizadas de CORS:

- Acesse: **Settings → API**
- Adicione `https://setlistgo.com` nas origens permitidas

---

## 6. Testar Após Configuração

Após fazer as alterações, teste:

1. ✅ Login com Google OAuth
2. ✅ Signup de novo usuário
3. ✅ Confirmação de email
4. ✅ Recuperação de senha
5. ✅ Logout e login novamente

---

## 7. Limpar Cache

Após atualizar:

1. Limpe o cache do navegador
2. Teste em modo anônimo/privado
3. Verifique os logs em: **Supabase Dashboard → Logs → Auth Logs**

---

## ✅ Checklist de Configuração

- [ ] Site URL atualizada para `https://setlistgo.com`
- [ ] Redirect URLs adicionadas (produção + localhost)
- [ ] Google OAuth redirect URI verificado
- [ ] Templates de email atualizados (opcional)
- [ ] CORS configurado (se necessário)
- [ ] Testes de autenticação realizados
- [ ] Cache do navegador limpo

---

## 🚨 Troubleshooting

### Erro: "Invalid redirect URL"
- Verifique se a URL exata está na lista de Redirect URLs
- Certifique-se que não há espaços extras
- Verifique o protocolo (http vs https)

### OAuth não funciona
- Verifique as configurações no Google Cloud Console
- Confirme que o callback URI está correto
- Verifique os logs de Auth no Supabase

### Email não chega
- Verifique a pasta de spam
- Configure um provedor de email customizado (SendGrid, Resend)
- Verifique os logs de Email no Supabase
