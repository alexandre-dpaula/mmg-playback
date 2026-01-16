# ✅ Configuração Completa do Domínio setlistgo.com

## 📋 Resumo das Alterações Realizadas no Código

### 1. Arquivos Atualizados
- ✅ [index.html](index.html) - Meta tags Open Graph e Twitter
- ✅ [src/context/AuthContext.tsx](src/context/AuthContext.tsx) - URL de redirect OAuth
- ✅ [CONFIGURAR_REDIRECT_URLS.md](CONFIGURAR_REDIRECT_URLS.md) - Documentação
- ✅ [TEMPLATES_EMAIL_SUPABASE.md](TEMPLATES_EMAIL_SUPABASE.md) - Documentação

### 2. Mudanças Específicas

#### index.html
```html
<!-- ANTES -->
<meta property="og:url" content="https://mmgplayback.com/" />
<meta property="twitter:url" content="https://mmgplayback.com/" />

<!-- DEPOIS -->
<meta property="og:url" content="https://setlistgo.com/" />
<meta property="twitter:url" content="https://setlistgo.com/" />
<meta property="og:image" content="https://setlistgo.com/metadados.jpg" />
<meta property="twitter:image" content="https://setlistgo.com/metadados.jpg" />
```

#### AuthContext.tsx
```typescript
// ANTES
const redirectUrl = isLocalhost
  ? window.location.origin
  : 'https://setlistgo.vercel.app';

// DEPOIS
const redirectUrl = isLocalhost
  ? window.location.origin
  : 'https://setlistgo.com';
```

---

## 🎯 Próximos Passos: Configuração no Supabase

### Acesse o Supabase Dashboard

**URL:** https://supabase.com/dashboard

**Caminho:** Seu Projeto → Authentication → URL Configuration

---

### 1️⃣ Site URL

**Campo:** Site URL

**Valor:**
```
https://setlistgo.com
```

---

### 2️⃣ Redirect URLs

**Campo:** Redirect URLs

**Adicione estas URLs (copie e cole):**

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

---

### 3️⃣ Atualizar Google OAuth (se configurado)

Se você usa login com Google:

1. Acesse: [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em: **APIs & Services → Credentials**
3. Edite seu **OAuth 2.0 Client ID**
4. Em **Authorized redirect URIs**, adicione:
   ```
   https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback
   ```
5. Adicione também o domínio em **Authorized JavaScript origins**:
   ```
   https://setlistgo.com
   ```

---

### 4️⃣ Verificar Apple OAuth (se configurado)

Se você usa Sign in with Apple:

1. Acesse: [Apple Developer](https://developer.apple.com/)
2. Vá em: **Certificates, Identifiers & Profiles → Identifiers**
3. Edite seu **Services ID**
4. Em **Return URLs**, adicione:
   ```
   https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback
   ```

---

## 🧪 Testes Necessários

Após fazer as configurações, teste:

### Autenticação
- [ ] Login com Google OAuth
- [ ] Login com Apple (se configurado)
- [ ] Cadastro de novo usuário
- [ ] Confirmação de email
- [ ] Recuperação de senha
- [ ] Logout

### SEO e Compartilhamento
- [ ] Compartilhar no WhatsApp e verificar preview
- [ ] Compartilhar no Facebook e verificar preview
- [ ] Compartilhar no Twitter/X e verificar preview
- [ ] Verificar Open Graph com: https://www.opengraph.xyz/
- [ ] Verificar Twitter Card com: https://cards-dev.twitter.com/validator

### PWA
- [ ] Instalar como PWA no mobile
- [ ] Verificar ícone da aplicação
- [ ] Testar funcionamento offline (service worker)

---

## 🔧 Configurações Opcionais

### Email Customizado

Para produção, é recomendado usar um provedor de email dedicado:

**Supabase Dashboard → Project Settings → Auth → Email**

Provedores recomendados:
- **Resend** (https://resend.com) - Moderno e fácil de usar
- **SendGrid** (https://sendgrid.com) - Robusto e escalável
- **AWS SES** - Custo-efetivo para grande volume

### Analytics

Configure analytics para rastrear o uso:
- Google Analytics
- Plausible (privacidade focada)
- Vercel Analytics (já vem integrado)

---

## 📊 Deploy e Propagação

### Vercel

O domínio já está configurado no Vercel. Para fazer deploy:

```bash
# Commitar as mudanças
git add .
git commit -m "chore: atualiza domínio para setlistgo.com"
git push

# Vercel fará deploy automaticamente
```

### DNS Propagation

Após configurar o DNS, pode levar de alguns minutos até 48 horas para propagar globalmente.

Verifique a propagação em: https://www.whatsmydns.net/

---

## 🚨 Troubleshooting

### "Invalid redirect URL" no login
**Solução:** Verifique se a URL exata está na lista de Redirect URLs no Supabase

### Preview social não atualiza
**Solução:**
- Limpe o cache do LinkedIn: https://www.linkedin.com/post-inspector/
- Limpe o cache do Facebook: https://developers.facebook.com/tools/debug/

### PWA não instala
**Solução:**
- Verifique se está usando HTTPS
- Verifique o manifest.json
- Teste em modo anônimo

### Email não chega
**Solução:**
- Verifique spam
- Configure provedor de email dedicado
- Verifique os logs em Supabase Dashboard → Logs

---

## ✅ Checklist Final

### Código
- [x] Meta tags atualizadas no index.html
- [x] Redirect URL atualizada no AuthContext
- [x] Documentação atualizada

### Supabase
- [ ] Site URL configurada
- [ ] Redirect URLs adicionadas
- [ ] Google OAuth verificado
- [ ] Apple OAuth verificado (se aplicável)

### Testes
- [ ] Login funcionando
- [ ] Signup funcionando
- [ ] Recuperação de senha funcionando
- [ ] Preview social correto
- [ ] PWA instalando corretamente

### Deploy
- [ ] Código commitado
- [ ] Deploy no Vercel realizado
- [ ] DNS propagado

---

## 📚 Referências

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

**Data de Configuração:** 2026-01-16
**Domínio:** https://setlistgo.com
**Status:** ✅ Código atualizado - Aguardando configuração Supabase
