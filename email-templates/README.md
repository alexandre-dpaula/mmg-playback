# 📧 Templates de Email - SetlistGO™

Templates HTML profissionais e responsivos para todas as comunicações por email da plataforma SetlistGO™.

## 📁 Estrutura de Arquivos

```
email-templates/
├── base-template.html              # Template base (não usar diretamente)
├── invite-member.html              # Convite para membros
├── email-confirmation.html         # Confirmação de email
├── password-reset.html             # Recuperação de senha
├── subscription-confirmed.html     # Assinatura confirmada
├── payment-reminder.html           # Lembrete de vencimento
├── subscription-cancelled.html     # Assinatura cancelada
└── README.md                       # Esta documentação
```

---

## 🎨 Design System

### Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| **Preto** | `#000000` | Background principal |
| **Cinza Escuro** | `#121212` | Background do card |
| **Cinza Médio** | `#181818` | Background de info boxes |
| **Verde (Spotify)** | `#1DB954` | Botões primários, destaque |
| **Branco** | `#FFFFFF` | Texto principal |
| **Cinza Claro** | `#B3B3B3` | Texto secundário |
| **Amarelo** | `#FFC107` | Avisos |
| **Vermelho** | `#EF4444` | Erros/Cancelamentos |

### Tipografia

- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif
- **Títulos**: 28px-32px, weight 700
- **Subtítulos**: 16-18px, weight 600
- **Corpo**: 14-16px, weight 400
- **Small**: 12px

### Espaçamento

- **Padding externo**: 40px
- **Padding cards**: 24-40px
- **Margin bottom**: 16-32px

---

## 📄 Templates Disponíveis

### 1. **Convite para Membros** (`invite-member.html`)

**Quando usar**: Quando um líder convida um membro para sua igreja.

**Variáveis**:
```
{{INVITER_NAME}}        - Nome do líder que enviou o convite
{{CHURCH_NAME}}         - Nome da igreja
{{ROLE_NAME}}           - Papel (Vocal, Instrumental, Multimídia)
{{INVITE_LINK}}         - Link para aceitar o convite
{{EXPIRY_DATE}}         - Data de expiração do convite
{{RECIPIENT_EMAIL}}     - Email do destinatário
```

**Exemplo de uso**:
```javascript
const emailHtml = inviteMemberTemplate
  .replace('{{INVITER_NAME}}', 'João Silva')
  .replace('{{CHURCH_NAME}}', 'Igreja Batista Central')
  .replace('{{ROLE_NAME}}', 'Vocal')
  .replace('{{INVITE_LINK}}', 'https://app.setlistgo.com/invite/abc123')
  .replace('{{EXPIRY_DATE}}', '31 de dezembro de 2025')
  .replace('{{RECIPIENT_EMAIL}}', 'maria@email.com');
```

---

### 2. **Confirmação de Email** (`email-confirmation.html`)

**Quando usar**: Após cadastro de novo usuário.

**Variáveis**:
```
{{USER_NAME}}           - Nome do usuário
{{CONFIRMATION_LINK}}   - Link para confirmar email
{{RECIPIENT_EMAIL}}     - Email do destinatário
```

**Exemplo de uso**:
```javascript
const emailHtml = emailConfirmationTemplate
  .replace('{{USER_NAME}}', 'Maria Santos')
  .replace('{{CONFIRMATION_LINK}}', 'https://app.setlistgo.com/confirm/xyz789')
  .replace('{{RECIPIENT_EMAIL}}', 'maria@email.com');
```

---

### 3. **Recuperação de Senha** (`password-reset.html`)

**Quando usar**: Quando usuário solicita reset de senha.

**Variáveis**:
```
{{RESET_LINK}}          - Link para redefinir senha
{{EXPIRY_TIME}}         - Tempo de expiração (ex: "1 hora")
{{RECIPIENT_EMAIL}}     - Email do destinatário
```

**Exemplo de uso**:
```javascript
const emailHtml = passwordResetTemplate
  .replace('{{RESET_LINK}}', 'https://app.setlistgo.com/reset/token123')
  .replace('{{EXPIRY_TIME}}', '1 hora')
  .replace('{{RECIPIENT_EMAIL}}', 'usuario@email.com');
```

---

### 4. **Assinatura Confirmada** (`subscription-confirmed.html`)

**Quando usar**: Após confirmação de pagamento.

**Variáveis**:
```
{{AMOUNT}}              - Valor pago (ex: "9,98")
{{PAYMENT_DATE}}        - Data do pagamento
{{NEXT_DUE_DATE}}       - Próximo vencimento
{{PAYMENT_METHOD}}      - Forma de pagamento (PIX, Boleto, Cartão)
{{APP_LINK}}            - Link para acessar a plataforma
{{RECIPIENT_EMAIL}}     - Email do destinatário
```

**Exemplo de uso**:
```javascript
const emailHtml = subscriptionConfirmedTemplate
  .replace('{{AMOUNT}}', '9,98')
  .replace('{{PAYMENT_DATE}}', '24/12/2025')
  .replace('{{NEXT_DUE_DATE}}', '24/01/2026')
  .replace('{{PAYMENT_METHOD}}', 'PIX')
  .replace('{{APP_LINK}}', 'https://app.setlistgo.com')
  .replace('{{RECIPIENT_EMAIL}}', 'cliente@email.com');
```

---

### 5. **Lembrete de Pagamento** (`payment-reminder.html`)

**Quando usar**: 3-5 dias antes do vencimento.

**Variáveis**:
```
{{USER_NAME}}           - Nome do usuário
{{DAYS_UNTIL_DUE}}      - Dias até vencimento (ex: "3")
{{AMOUNT}}              - Valor a pagar
{{DUE_DATE}}            - Data de vencimento
{{PAYMENT_METHOD}}      - Forma de pagamento
{{PAYMENT_LINK}}        - Link para pagar
{{INVOICE_LINK}}        - Link para boleto/PIX
{{RECIPIENT_EMAIL}}     - Email do destinatário
```

**Exemplo de uso**:
```javascript
const emailHtml = paymentReminderTemplate
  .replace('{{USER_NAME}}', 'João Silva')
  .replace('{{DAYS_UNTIL_DUE}}', '3')
  .replace('{{AMOUNT}}', '9,98')
  .replace('{{DUE_DATE}}', '27/12/2025')
  .replace('{{PAYMENT_METHOD}}', 'Boleto')
  .replace('{{PAYMENT_LINK}}', 'https://pay.setlistgo.com/xyz')
  .replace('{{INVOICE_LINK}}', 'https://invoice.setlistgo.com/xyz')
  .replace('{{RECIPIENT_EMAIL}}', 'cliente@email.com');
```

---

### 6. **Assinatura Cancelada** (`subscription-cancelled.html`)

**Quando usar**: Após cancelamento de assinatura.

**Variáveis**:
```
{{CANCELLATION_DATE}}   - Data do cancelamento
{{ACCESS_UNTIL_DATE}}   - Até quando terá acesso
{{REACTIVATE_LINK}}     - Link para reativar
{{FEEDBACK_LINK}}       - Link para feedback
{{RECIPIENT_EMAIL}}     - Email do destinatário
```

**Exemplo de uso**:
```javascript
const emailHtml = subscriptionCancelledTemplate
  .replace('{{CANCELLATION_DATE}}', '24/12/2025')
  .replace('{{ACCESS_UNTIL_DATE}}', '31/12/2025')
  .replace('{{REACTIVATE_LINK}}', 'https://app.setlistgo.com/reactivate')
  .replace('{{FEEDBACK_LINK}}', 'https://feedback.setlistgo.com')
  .replace('{{RECIPIENT_EMAIL}}', 'cliente@email.com');
```

---

## 🔧 Integração

### Com Supabase Edge Functions

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { readFileSync } from "node:fs"

serve(async (req) => {
  const template = readFileSync('./email-templates/invite-member.html', 'utf-8');

  const emailHtml = template
    .replace('{{INVITER_NAME}}', 'João Silva')
    .replace('{{CHURCH_NAME}}', 'Igreja Batista')
    // ... mais variáveis

  // Enviar via Resend, SendGrid, etc.
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'SetlistGO™ <noreply@setlistgo.com>',
      to: 'destinatario@email.com',
      subject: 'Você foi convidado!',
      html: emailHtml
    })
  });

  return new Response(JSON.stringify({ success: true }));
});
```

### Com Node.js / Express

```javascript
const fs = require('fs');
const nodemailer = require('nodemailer');

function sendInviteEmail(data) {
  const template = fs.readFileSync('./email-templates/invite-member.html', 'utf-8');

  const emailHtml = template
    .replace('{{INVITER_NAME}}', data.inviterName)
    .replace('{{CHURCH_NAME}}', data.churchName)
    .replace('{{ROLE_NAME}}', data.roleName)
    .replace('{{INVITE_LINK}}', data.inviteLink)
    .replace('{{EXPIRY_DATE}}', data.expiryDate)
    .replace('{{RECIPIENT_EMAIL}}', data.recipientEmail);

  const transporter = nodemailer.createTransport({
    // configuração SMTP
  });

  return transporter.sendMail({
    from: 'SetlistGO™ <noreply@setlistgo.com>',
    to: data.recipientEmail,
    subject: `Você foi convidado para ${data.churchName}!`,
    html: emailHtml
  });
}
```

---

## ✅ Compatibilidade

Todos os templates são testados e compatíveis com:

- ✅ Gmail (Desktop & Mobile)
- ✅ Outlook (2013, 2016, 2019, 365)
- ✅ Apple Mail (macOS & iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird
- ✅ Samsung Email
- ✅ Spark

---

## 📱 Responsividade

Todos os templates são **100% responsivos** e se adaptam a:

- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

**Media Queries aplicadas**:
```css
@media only screen and (max-width: 600px) {
  .email-container { width: 100% !important; }
  .p-40 { padding: 20px !important; }
  .btn { display: block !important; width: 100% !important; }
}
```

---

## 🚀 Melhores Práticas

### ✅ DO

- Use inline CSS para máxima compatibilidade
- Teste em múltiplos clientes de email
- Mantenha largura máxima de 600px
- Use tabelas para layout (compatibilidade Outlook)
- Sempre inclua texto alternativo para imagens
- Use cores de alto contraste

### ❌ DON'T

- Não use JavaScript
- Não use web fonts externas (usar system fonts)
- Não use vídeos embutidos
- Não use background images complexas
- Não use position: absolute/fixed

---

## 🔐 Segurança

- ⚠️ **Nunca** inclua dados sensíveis no email
- ⚠️ **Sempre** use HTTPS para links
- ⚠️ **Valide** tokens de convite no backend
- ⚠️ **Expire** links após uso ou tempo limite

---

## 📝 Changelog

### v1.0.0 (24/12/2025)
- ✅ Template base criado
- ✅ Template de convite para membros
- ✅ Template de confirmação de email
- ✅ Template de recuperação de senha
- ✅ Template de assinatura confirmada
- ✅ Template de lembrete de pagamento
- ✅ Template de assinatura cancelada

---

## 🤝 Contribuindo

Para adicionar novos templates:

1. Use o `base-template.html` como referência
2. Substitua `{{CONTENT}}` com seu conteúdo
3. Mantenha o design system
4. Teste em múltiplos clientes
5. Documente as variáveis neste README

---

## 📞 Suporte

Dúvidas ou problemas com os templates?

- 📧 Email: suporte@setlistgo.com
- 💬 Discord: [Link do servidor]
- 📚 Docs: [Link da documentação]

---

**Desenvolvido com 💚 pela equipe SetlistGO™**
