# Configuração de Redirect URLs no Supabase

## Acesse: Supabase Dashboard → Authentication → URL Configuration

---

## 1. Site URL (URL Principal)

**Campo:** Site URL

**Valor de Produção:**
```
https://setlistgo.com
```

**Valor de Desenvolvimento (se necessário):**
```
http://localhost:5173
```

---

## 2. Redirect URLs (URLs Permitidas)

**Campo:** Redirect URLs

Adicione TODAS estas URLs (uma por linha):

```
https://setlistgo.com/**
https://setlistgo.com/auth/callback
https://setlistgo.com/role-selection
https://setlistgo.com/waiting-invitation
https://setlistgo.com/reset-password
http://localhost:5173/**
http://localhost:5173/auth/callback
http://localhost:5173/role-selection
http://localhost:5173/waiting-invitation
http://localhost:5173/reset-password
```

**Nota:** O wildcard `/**` permite qualquer path após a URL base, facilitando o desenvolvimento.

---

## 3. Configurações de Email

No mesmo painel (**URL Configuration**), configure:

### Rate Limits
- **Max Frequency:** 1 email a cada 60 segundos (recomendado)
- **Max Emails per Hour:** 5 (para evitar spam)

### Email Settings
- **Enable Confirmations:** ✅ Habilitado
- **Enable Email Change Confirmations:** ✅ Habilitado
- **Secure Email Change:** ✅ Habilitado (envia email para ambos os endereços)

---

## 4. Configuração no Código

Certifique-se que o código da aplicação está usando as redirect URLs corretas.

### Exemplo de Configuração no Supabase Client:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Mais seguro
  }
})
```

### Exemplo de Configuração de Redirect ao Fazer Login:

```typescript
// Ao fazer signup/login
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  }
})

// Ao solicitar recuperação de senha
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
})
```

---

## 5. Testar as Configurações

Após configurar, teste:

1. **Signup:** Cadastre novo usuário e verifique se o email de confirmação chega
2. **Email Confirmation:** Clique no link do email e verifique se redireciona corretamente
3. **Password Reset:** Solicite recuperação de senha e teste o fluxo
4. **Invite:** Envie um convite e teste o aceite

---

## 6. Troubleshooting

### Se o redirect não funcionar:

1. Verifique se a URL está na lista de Redirect URLs permitidas
2. Certifique-se que não há espaços extras nas configurações
3. Verifique se o protocolo (http/https) está correto
4. Limpe o cache do navegador
5. Verifique os logs em: **Supabase Dashboard → Logs → Auth Logs**

### Erro: "Invalid redirect URL"

- A URL de destino não está na lista de Redirect URLs
- Adicione a URL exata ou use wildcard `/**`

### Email não chega:

- Verifique a pasta de spam
- Verifique os logs de email em: **Supabase Dashboard → Logs**
- Configure um provedor de email customizado (SendGrid, Resend, etc.) em produção
