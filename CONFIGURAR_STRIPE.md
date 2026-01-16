# 🎯 Configuração do Stripe - SetlistGO

## 📋 Resumo

Integração completa do Stripe para gerenciar assinaturas PRO do SetlistGO.

---

## 1️⃣ Criar Produto e Preço no Stripe Dashboard

### Acessar Stripe Dashboard

**URL:** https://dashboard.stripe.com

### Criar Produto

1. Vá em **Products** → **Add product**
2. Preencha:
   - **Name:** SetlistGO PRO
   - **Description:** Acesso ilimitado a todos os recursos PRO
   - **Image:** Faça upload do logo do SetlistGO (opcional)

### Criar Preço

1. Na mesma página do produto, em **Pricing**:
   - **Price:** R$ 9,98
   - **Billing period:** Monthly (Mensal)
   - **Currency:** BRL (Real Brasileiro)
2. Clique em **Save product**

### Copiar Price ID

Após salvar, você verá um ID como: `price_1AbCdEfGhIjKl`

**Copie este ID!** Você vai precisar dele no código.

---

## 2️⃣ Atualizar Código com Price ID

### Arquivo: `src/lib/stripe.ts`

Abra o arquivo e atualize:

```typescript
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  prices: {
    monthly: 'price_SEU_ID_AQUI', // ← Cole o Price ID aqui
    yearly: 'price_yearly_pro',   // Se criar plano anual
  },
  successUrl: `${window.location.origin}/subscription/success`,
  cancelUrl: `${window.location.origin}/subscription/cancel`,
};
```

---

## 3️⃣ Configurar Webhook no Stripe

### Criar Webhook

1. No Stripe Dashboard, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**

### Configurar Endpoint

**Endpoint URL:**
```
https://[SEU-PROJECT-ID].supabase.co/functions/v1/stripe-webhook
```

Substitua `[SEU-PROJECT-ID]` pelo ID do seu projeto Supabase (`sffebcfgkthjcfnpgjvz`)

**URL completa:**
```
https://sffebcfgkthjcfnpgjvz.supabase.co/functions/v1/stripe-webhook
```

### Eventos para Escutar

Selecione estes eventos:

- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### Copiar Webhook Secret

Após criar, você verá um **Signing secret** como: `whsec_...`

**Este é o `STRIPE_WEBHOOK_SECRET`** que já está no seu `.env`!

---

## 4️⃣ Configurar Variáveis de Ambiente no Supabase

### Acessar Supabase Dashboard

1. Vá em: https://supabase.com/project/sffebcfgkthjcfnpgjvz
2. **Settings** → **Edge Functions** → **Manage secrets**

### Adicionar Secrets

Adicione estas variáveis (pegue os valores do seu arquivo `.env` local):

```bash
STRIPE_SECRET_KEY=sk_test_...

STRIPE_WEBHOOK_SECRET=whsec_...
```

**Nota:** Use as mesmas chaves que estão no seu arquivo `.env` local.

---

## 5️⃣ Aplicar Migration no Supabase

### Via SQL Editor

1. Acesse: https://supabase.com/project/sffebcfgkthjcfnpgjvz/sql
2. Clique em **New query**
3. Copie e cole o conteúdo do arquivo:
   ```
   supabase/migrations/20260116_create_stripe_subscriptions.sql
   ```
4. Clique em **Run**

---

## 6️⃣ Deploy das Edge Functions

### Instalar Supabase CLI (se ainda não tiver)

```bash
npm install -g supabase
```

### Login no Supabase

```bash
supabase login
```

### Deploy das Funções

```bash
cd "/Users/alexandredpaula/dyad-apps/MMG - Ensaio Vocal"

# Deploy stripe-checkout
supabase functions deploy stripe-checkout --project-ref sffebcfgkthjcfnpgjvz

# Deploy stripe-webhook
supabase functions deploy stripe-webhook --project-ref sffebcfgkthjcfnpgjvz --no-verify-jwt
```

**Nota:** `--no-verify-jwt` é necessário para o webhook, pois ele recebe requests do Stripe, não de usuários autenticados.

---

## 7️⃣ Instalar Dependências do Stripe

### Instalar SDK do Stripe

```bash
npm install @stripe/stripe-js stripe
```

### Instalar tipos

```bash
npm install -D @types/stripe
```

---

## 8️⃣ Testar Integração

### Modo Test

O Stripe está em **modo test**. Use cartões de teste:

**Cartão de Sucesso:**
```
Número: 4242 4242 4242 4242
Data: Qualquer data futura (ex: 12/34)
CVC: Qualquer 3 dígitos (ex: 123)
CEP: Qualquer (ex: 12345)
```

**Cartão que Falha:**
```
Número: 4000 0000 0000 0002
```

### Fluxo de Teste

1. Acesse: https://setlistgo.com
2. Tente criar um 2º evento (vai bloquear)
3. Clique em "Assinar PRO"
4. Preencha com dados de teste
5. Complete o pagamento com cartão de teste
6. Verifique se a assinatura aparece no banco de dados

### Verificar no Banco

```sql
SELECT * FROM subscriptions WHERE user_id = '[SEU-USER-ID]';
```

---

## 9️⃣ Configurar Customer Portal (Opcional)

Permite usuários gerenciarem suas assinaturas (cancelar, atualizar cartão, etc.)

### Ativar Portal

1. Stripe Dashboard → **Settings** → **Customer portal**
2. Clique em **Activate**
3. Configure:
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to view invoice history

---

## 🔟 Modo Produção (Quando Estiver Pronto)

### Trocar para Chaves de Produção

1. No Stripe Dashboard, mude de **Test mode** para **Live mode** (toggle no topo)
2. Copie as novas chaves **pk_live_...** e **sk_live_...**
3. Atualize o `.env` e as secrets do Supabase

### Atualizar Webhook

Crie um novo webhook no modo Live com a mesma URL e eventos.

---

## ✅ Checklist de Configuração

- [ ] Produto "SetlistGO PRO" criado no Stripe
- [ ] Preço R$ 9,98/mês criado e Price ID copiado
- [ ] Price ID atualizado em `src/lib/stripe.ts`
- [ ] Webhook configurado no Stripe
- [ ] Secrets configuradas no Supabase
- [ ] Migration aplicada (tabela `subscriptions` criada)
- [ ] Edge Functions deployadas
- [ ] SDK do Stripe instalado (`@stripe/stripe-js`)
- [ ] Teste de pagamento realizado com sucesso
- [ ] Verificado que assinatura aparece no banco

---

## 🚨 Troubleshooting

### Erro: "No such price"
- Verifique se o Price ID em `src/lib/stripe.ts` está correto
- Certifique-se de estar no mesmo modo (test/live)

### Webhook não funciona
- Verifique se a URL está correta
- Verifique se `STRIPE_WEBHOOK_SECRET` está configurado
- Veja os logs no Supabase: **Edge Functions** → **stripe-webhook** → **Logs**

### Assinatura não aparece no banco
- Verifique os logs do webhook
- Confirme que a migration foi aplicada
- Verifique se o `user_id` está sendo passado corretamente

---

## 📚 Documentação

- [Stripe Subscriptions Docs](https://stripe.com/docs/billing/subscriptions/overview)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

**Data:** 2026-01-16
**Status:** ✅ Integração configurada - Aguardando deploy
