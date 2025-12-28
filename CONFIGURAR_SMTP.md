# ⚙️ Configurar SMTP no Supabase (URGENTE!)

## Status Atual

✅ Edge Function `send-email` foi deployed com sucesso!
❌ **Variáveis SMTP ainda NÃO foram configuradas**

## Passos para Configurar

### 1. Acessar Dashboard do Supabase

Abra este link no navegador:
👉 https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz/settings/functions

### 2. Adicionar Secrets (Variáveis de Ambiente)

Clique em **"Add new secret"** e adicione uma por uma:

#### Secret 1: SMTP_HOST
```
Name: SMTP_HOST
Value: smtp.gmail.com
```

#### Secret 2: SMTP_PORT
```
Name: SMTP_PORT
Value: 587
```

#### Secret 3: SMTP_USER
```
Name: SMTP_USER
Value: contato.setlistgo@gmail.com
```

#### Secret 4: SMTP_PASS
```
Name: SMTP_PASS
Value: xhskmqszkcrlzafk
```

#### Secret 5: SMTP_FROM
```
Name: SMTP_FROM
Value: contato.setlistgo@gmail.com
```

### 3. Salvar

Clique em **"Save"** após adicionar cada secret.

### 4. Testar a Função

1. Vá em: https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz/functions/send-email
2. Clique em **"Run test"**
3. Cole este JSON:

```json
{
  "to": "seu-email@gmail.com",
  "subject": "Teste - SetlistGO™",
  "html": "<h1>Teste de Email</h1><p>Se você recebeu este email, o SMTP está funcionando! 🎉</p>"
}
```

4. Clique em **"Run"**
5. Verifique seu email (pode estar no spam)

## ✅ Checklist

- [ ] Adicionar SMTP_HOST
- [ ] Adicionar SMTP_PORT
- [ ] Adicionar SMTP_USER
- [ ] Adicionar SMTP_PASS
- [ ] Adicionar SMTP_FROM
- [ ] Testar envio de email
- [ ] Verificar recebimento do email

## 🔍 Verificar Logs

Para ver se há erros:
👉 https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz/logs/edge-functions

## 📧 Como Funciona Agora

Quando você adicionar um membro no OnboardingChurchWizard:

1. ✅ Membro é adicionado no banco
2. ✅ Email automático é enviado com template profissional
3. ✅ Membro recebe convite com link para login
4. ✅ Toast de sucesso é exibido

**IMPORTANTE**: O email só será enviado após configurar as variáveis SMTP!
