# 📧 Sistema de Email Implementado - SetlistGO™

## ✅ O Que Foi Feito

### 1. Edge Function de Envio de Email
**Arquivo**: `supabase/functions/send-email/index.ts`

- ✅ Conexão SMTP com Gmail configurada
- ✅ Suporte a TLS (porta 587)
- ✅ Tratamento de erros robusto
- ✅ CORS habilitado para requisições do frontend
- ✅ **DEPLOYED** com sucesso no Supabase

### 2. Biblioteca de Email (Frontend)
**Arquivo**: `src/lib/email.ts`

Funções implementadas:
- ✅ `sendInviteMemberEmail()` - Convite para membros
- ✅ `sendEmailConfirmation()` - Confirmação de cadastro
- ✅ `sendPasswordReset()` - Recuperação de senha
- ✅ `sendSubscriptionConfirmed()` - Assinatura confirmada
- ✅ `sendPaymentReminder()` - Lembrete de pagamento
- ✅ `sendSubscriptionCancelled()` - Assinatura cancelada

**Recursos**:
- Carrega templates HTML automaticamente
- Substitui variáveis dinâmicas
- Integração com Supabase Edge Functions
- TypeScript tipado

### 3. Integração com OnboardingChurchWizard
**Arquivo**: `src/pages/OnboardingChurchWizard.tsx`

**Quando**: Ao adicionar um membro à igreja
**O que acontece**:
1. Membro é adicionado ao banco de dados
2. Email profissional é enviado automaticamente
3. Toast de sucesso é exibido
4. Se o email falhar, não bloqueia o cadastro

**Dados do email**:
- Nome do líder que convidou
- Nome da igreja
- Papel do membro (Vocal, Instrumental, Multimídia)
- Link para login
- Data de expiração (7 dias)

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
```
supabase/functions/send-email/index.ts    (Edge Function SMTP)
src/lib/email.ts                           (Biblioteca de envio)
DEPLOY_EMAIL_FUNCTION.md                   (Guia de deploy)
CONFIGURAR_SMTP.md                         (Guia de configuração)
EMAIL_IMPLEMENTADO.md                      (Este arquivo)
.env.example                               (Exemplo de variáveis)
```

### Arquivos Modificados
```
src/pages/OnboardingChurchWizard.tsx       (Envio de email ao adicionar membro)
```

## 📧 Templates de Email Disponíveis

Todos os templates em `email-templates/`:

| Template | Status | Uso |
|----------|--------|-----|
| `invite-member.html` | ✅ Implementado | Convite para membros |
| `email-confirmation.html` | ✅ Pronto | Confirmação de cadastro |
| `password-reset.html` | ✅ Pronto | Recuperação de senha |
| `subscription-confirmed.html` | ✅ Pronto | Assinatura confirmada |
| `payment-reminder.html` | ✅ Pronto | Lembrete de pagamento |
| `subscription-cancelled.html` | ✅ Pronto | Cancelamento |

## ⚙️ Configuração SMTP

### Credenciais do Gmail
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato.setlistgo@gmail.com
SMTP_PASS=xhskmqszkcrlzafk (senha de app)
SMTP_FROM=contato.setlistgo@gmail.com
```

### ⚠️ PRÓXIMO PASSO OBRIGATÓRIO

**Você PRECISA configurar as variáveis SMTP no Supabase!**

1. Abra: https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz/settings/functions
2. Adicione cada variável SMTP como "Secret"
3. Teste a função de envio

**Veja o passo a passo completo em**: `CONFIGURAR_SMTP.md`

## 🧪 Como Testar

### Teste 1: Email de Convite
1. Vá em `/onboarding/igreja`
2. Adicione um membro com um email válido
3. Verifique se o email chegou (pode estar no spam)

### Teste 2: Teste Direto da Edge Function
```bash
curl -X POST https://sffebcfgkthjcfnpgjvz.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@gmail.com",
    "subject": "Teste",
    "html": "<h1>Funcionou!</h1>"
  }'
```

## 📊 Fluxo de Envio de Email

```
┌─────────────────────────────────────┐
│  User adiciona membro na UI         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  handleAddMember()                  │
│  - Valida dados                     │
│  - Insere no banco                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  sendInviteMemberEmail()            │
│  - Carrega template HTML            │
│  - Substitui variáveis              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Supabase Edge Function             │
│  supabase/functions/send-email      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  SmtpClient (Deno)                  │
│  - Conecta via TLS                  │
│  - Autentica no Gmail               │
│  - Envia email                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Gmail SMTP Server                  │
│  smtp.gmail.com:587                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Email entregue ao destinatário     │
│  (com template profissional)        │
└─────────────────────────────────────┘
```

## 🎨 Design do Email

- **Tema**: Preto (#000000) com detalhes verdes (#1DB954)
- **Responsivo**: Mobile, Tablet e Desktop
- **Compatível**: Gmail, Outlook, Apple Mail, etc.
- **Elementos**:
  - Logo SetlistGO™
  - Card com informações da igreja
  - Botão CTA verde
  - Link alternativo
  - Footer com suporte

## 🔐 Segurança

- ✅ Autenticação via Supabase Auth
- ✅ Variáveis sensíveis em secrets
- ✅ CORS configurado
- ✅ SMTP via TLS
- ✅ Senha de app do Gmail (não senha normal)

## 📝 Próximas Implementações Sugeridas

1. **Email de boas-vindas** após primeiro login
2. **Email de confirmação** ao criar conta
3. **Email de reset de senha** (integrar com Supabase Auth)
4. **Emails de assinatura** (quando integrar com Asaas)
5. **Email digest semanal** com próximos eventos
6. **Email de lembrete** 1 dia antes do evento

## 🐛 Troubleshooting

### Email não enviado
- [ ] Verificar se variáveis SMTP estão configuradas no Supabase
- [ ] Verificar logs da Edge Function
- [ ] Testar credenciais SMTP manualmente

### Email vai para spam
- [ ] Configurar SPF record no domínio
- [ ] Configurar DKIM
- [ ] Usar domínio próprio (não @gmail.com)

### Erro de autenticação
- [ ] Verificar senha de app do Gmail
- [ ] Confirmar que autenticação de 2 fatores está ativa
- [ ] Regenerar senha de app

## 📞 Suporte

Qualquer dúvida sobre o sistema de emails:
- Consulte `DEPLOY_EMAIL_FUNCTION.md` para deploy
- Consulte `CONFIGURAR_SMTP.md` para configuração
- Verifique `email-templates/README.md` para detalhes dos templates

---

**Status**: ✅ Sistema implementado e deployed
**Pendente**: ⚠️ Configurar variáveis SMTP no dashboard (veja CONFIGURAR_SMTP.md)
