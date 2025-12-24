# 💳 ASAAS Integration - SetlistGO™

Sistema completo de assinatura mensal com ASAAS para o SetlistGO™.

## 📋 Índice

- [Arquivos Criados](#arquivos-criados)
- [Setup do Supabase](#setup-do-supabase)
- [Configuração das Edge Functions](#configuração-das-edge-functions)
- [Configuração do ASAAS](#configuração-do-asaas)
- [Como Usar](#como-usar)
- [Testes](#testes)
- [Deploy](#deploy)

---

## 📁 Arquivos Criados

### Backend (Supabase)
```
supabase/
├── migrations/
│   └── 20251224_create_subscription_tables.sql
└── functions/
    ├── create-subscription/
    │   └── index.ts
    └── asaas-webhook/
        └── index.ts
```

### Frontend (React)
```
src/
├── types/
│   └── asaas.ts
├── hooks/
│   └── useSubscription.ts
└── components/
    └── subscription/
        ├── CheckoutDialog.tsx
        ├── PaymentMethodSelector.tsx
        ├── PixPayment.tsx
        ├── BoletoPayment.tsx
        └── CreditCardForm.tsx
```

---

## 🗄️ Setup do Supabase

### 1. Executar Migration

```bash
# Via Supabase CLI
npx supabase migration up

# Ou via Dashboard:
# 1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/database/migrations
# 2. Cole o conteúdo do arquivo: supabase/migrations/20251224_create_subscription_tables.sql
# 3. Execute
```

### 2. Verificar Tabelas Criadas

```sql
-- Deve retornar as tabelas:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('subscriptions', 'payments');
```

---

## 🔧 Configuração das Edge Functions

### 1. Deploy das Edge Functions

```bash
# Deploy create-subscription
npx supabase functions deploy create-subscription

# Deploy asaas-webhook
npx supabase functions deploy asaas-webhook
```

### 2. Configurar Secrets (Variáveis de Ambiente)

```bash
# ASAAS API Key (Sandbox)
npx supabase secrets set ASAAS_API_KEY=your_asaas_sandbox_api_key

# (Opcional) Webhook Token para validação
npx supabase secrets set ASAAS_WEBHOOK_TOKEN=your_custom_token
```

### 3. Testar Edge Functions

```bash
# Teste create-subscription
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-subscription' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "billingType": "PIX",
    "customer": {
      "name": "João Silva",
      "email": "joao@example.com",
      "cpfCnpj": "12345678900",
      "mobilePhone": "11999999999"
    }
  }'

# Teste webhook (simular evento do ASAAS)
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/asaas-webhook' \
  -H 'Content-Type: application/json' \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pay_test123",
      "subscription": "sub_test123",
      "status": "CONFIRMED",
      "value": 9.98
    }
  }'
```

---

## 💰 Configuração do ASAAS

### 1. Criar Conta Sandbox

1. Acesse: https://sandbox.asaas.com
2. Crie uma conta de testes
3. Acesse: **Integrações** → **API Key**
4. Copie sua API Key

### 2. Configurar Webhook

1. No painel ASAAS: **Integrações** → **Webhooks**
2. URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/asaas-webhook`
3. Eventos para ativar:
   - ✅ PAYMENT_CREATED
   - ✅ PAYMENT_CONFIRMED
   - ✅ PAYMENT_RECEIVED
   - ✅ PAYMENT_OVERDUE
   - ✅ PAYMENT_DELETED
   - ✅ PAYMENT_REFUNDED
   - ✅ PAYMENT_CHARGEBACK_REQUESTED

4. Salvar

### 3. Valores de Teste (Sandbox)

**PIX:**
- Qualquer valor funciona
- Aprovação automática após ~2 minutos

**Boleto:**
- Qualquer valor funciona
- Use o número de teste fornecido pelo ASAAS

**Cartão de Crédito:**
- **Aprovado**: `5162306219378829` (CVV: qualquer)
- **Negado**: `5162306219378837`
- Validade: qualquer data futura

---

## 🚀 Como Usar

### 1. Importar Componente

```typescript
import { CheckoutDialog } from '@/components/subscription/CheckoutDialog';
import { useSubscription } from '@/hooks/useSubscription';
```

### 2. Usar no Componente

```typescript
function MyComponent() {
  const [showCheckout, setShowCheckout] = useState(false);
  const { hasActiveSubscription, subscription } = useSubscription();

  return (
    <>
      {!hasActiveSubscription && (
        <button onClick={() => setShowCheckout(true)}>
          Assinar PRO - R$ 9,98/mês
        </button>
      )}

      {hasActiveSubscription && (
        <div>Você tem acesso PRO até {subscription?.next_due_date}</div>
      )}

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
      />
    </>
  );
}
```

### 3. Verificar Acesso PRO

```typescript
import { useHasProAccess } from '@/hooks/useSubscription';

function ProtectedFeature() {
  const hasProAccess = useHasProAccess();

  if (!hasProAccess) {
    return <div>Assine o PRO para acessar esta funcionalidade</div>;
  }

  return <div>Feature PRO liberada!</div>;
}
```

---

## 🧪 Testes

### Fluxo Completo de Teste (PIX)

1. Abrir CheckoutDialog
2. Preencher dados do cliente
3. Selecionar PIX
4. Copiar código PIX
5. Aguardar ~2 minutos (sandbox)
6. Verificar status em `subscriptions` table

### Fluxo Completo de Teste (Cartão)

1. Abrir CheckoutDialog
2. Preencher dados do cliente
3. Selecionar Cartão de Crédito
4. Usar cartão de teste: `5162306219378829`
5. Aprovação imediata
6. Verificar status em `subscriptions` table

### Consultas SQL para Debug

```sql
-- Ver todas as assinaturas
SELECT * FROM subscriptions ORDER BY created_at DESC;

-- Ver todos os pagamentos
SELECT * FROM payments ORDER BY created_at DESC;

-- Ver assinatura de um usuário específico
SELECT * FROM subscriptions WHERE user_id = 'USER_UUID';

-- Ver pagamentos de uma assinatura
SELECT * FROM payments WHERE subscription_id = 'SUBSCRIPTION_UUID';
```

---

## 🌐 Deploy

### 1. Variáveis de Ambiente (.env)

```env
# Supabase (já configurado)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ASAAS (não expor no frontend!)
# Estas variáveis são usadas APENAS nas Edge Functions
# Configure via: npx supabase secrets set
```

### 2. Deploy Frontend (Vercel)

```bash
# Build e deploy
npm run build
vercel --prod
```

### 3. Migrar para Produção ASAAS

1. Criar conta real no ASAAS
2. Obter API Key de produção
3. Atualizar secret:
```bash
npx supabase secrets set ASAAS_API_KEY=your_production_api_key
```
4. Configurar webhook de produção

---

## 📊 Fluxo de Dados

```
┌─────────────┐
│   Cliente   │
│  (Frontend) │
└──────┬──────┘
       │ 1. Preenche dados
       │
       ▼
┌──────────────────┐
│ CheckoutDialog   │
│ (React Component)│
└──────┬───────────┘
       │ 2. Envia request
       │
       ▼
┌─────────────────────────┐
│ create-subscription     │
│ (Edge Function)         │
├─────────────────────────┤
│ - Valida dados          │
│ - Cria customer ASAAS   │
│ - Cria subscription     │
│ - Salva no Supabase     │
└──────┬──────────────────┘
       │ 3. Retorna resultado
       │
       ▼
┌──────────────────┐
│ Frontend exibe:  │
│ - QR Code PIX    │
│ - Boleto         │
│ - Confirmação CC │
└──────────────────┘
       │
       │ 4. Cliente paga
       │
       ▼
┌─────────────────┐
│     ASAAS       │
│ (Processa $$$)  │
└──────┬──────────┘
       │ 5. Envia webhook
       │
       ▼
┌─────────────────────┐
│ asaas-webhook       │
│ (Edge Function)     │
├─────────────────────┤
│ - Atualiza payments │
│ - Ativa subscription│
└─────────────────────┘
```

---

## 🔒 Segurança

- ✅ Nunca expor ASAAS_API_KEY no frontend
- ✅ Usar Supabase RLS para proteger dados
- ✅ Validar webhook signature (se ASAAS fornecer)
- ✅ Sanitizar todos os inputs
- ✅ Rate limiting nas Edge Functions (built-in Supabase)

---

## 🐛 Troubleshooting

### "ASAAS_API_KEY not configured"
```bash
npx supabase secrets set ASAAS_API_KEY=your_key
```

### "Subscription não aparece após pagamento"
- Verificar logs da Edge Function asaas-webhook
- Confirmar que webhook está configurado no ASAAS
- Verificar se evento foi enviado (painel ASAAS → Webhooks → Logs)

### "PIX não gera QR Code"
- Sandbox pode levar até 2 minutos
- Verificar resposta da API ASAAS
- Consultar payment criado: `SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;`

---

## 📞 Suporte

- ASAAS Docs: https://docs.asaas.com
- Supabase Docs: https://supabase.com/docs
- SetlistGO™ Issues: [GitHub]

---

**Implementado por:** Claude Sonnet 4.5
**Data:** 2025-12-24
**Versão:** 1.0.0
