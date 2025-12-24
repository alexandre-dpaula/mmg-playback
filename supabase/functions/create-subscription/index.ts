// Edge Function: Create Subscription with ASAAS
// Description: Creates or updates a customer and subscription in ASAAS
// Author: SetlistGO™
// Created: 2025-12-24

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

// =====================================================
// TYPES & INTERFACES
// =====================================================
interface Customer {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
}

interface CreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

interface RequestBody {
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  customer: Customer;
  creditCard?: CreditCard;
}

interface AsaasCustomerResponse {
  id: string;
  name: string;
  email: string;
}

interface AsaasSubscriptionResponse {
  id: string;
  customer: string;
  billingType: string;
  value: number;
  nextDueDate: string;
  status: string;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;

  // Basic CPF validation (you can enhance this)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  return true;
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateCreditCard(card: CreditCard): string[] {
  const errors: string[] = [];

  if (!card.holderName || card.holderName.length < 3) {
    errors.push('Nome do titular inválido');
  }

  const cleanNumber = card.number.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    errors.push('Número do cartão inválido');
  }

  if (!/^\d{2}$/.test(card.expiryMonth) || parseInt(card.expiryMonth) < 1 || parseInt(card.expiryMonth) > 12) {
    errors.push('Mês de expiração inválido');
  }

  if (!/^\d{4}$/.test(card.expiryYear)) {
    errors.push('Ano de expiração inválido');
  }

  if (!/^\d{3,4}$/.test(card.ccv)) {
    errors.push('CVV inválido');
  }

  return errors;
}

// =====================================================
// ASAAS API FUNCTIONS
// =====================================================
async function createOrUpdateAsaasCustomer(
  customer: Customer,
  apiKey: string
): Promise<AsaasCustomerResponse> {
  console.log('[ASAAS] Creating/updating customer:', customer.email);

  // First, try to find existing customer
  const searchResponse = await fetch(
    `https://sandbox.asaas.com/api/v3/customers?email=${encodeURIComponent(customer.email)}`,
    {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!searchResponse.ok) {
    throw new Error(`Failed to search customer: ${await searchResponse.text()}`);
  }

  const searchData = await searchResponse.json();

  // If customer exists, return it
  if (searchData.data && searchData.data.length > 0) {
    console.log('[ASAAS] Customer found:', searchData.data[0].id);
    return searchData.data[0];
  }

  // Create new customer
  const createResponse = await fetch('https://sandbox.asaas.com/api/v3/customers', {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: customer.name,
      email: customer.email,
      cpfCnpj: customer.cpfCnpj.replace(/\D/g, ''),
      mobilePhone: customer.mobilePhone.replace(/\D/g, ''),
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error('[ASAAS] Failed to create customer:', errorText);
    throw new Error(`Failed to create customer: ${errorText}`);
  }

  const customerData = await createResponse.json();
  console.log('[ASAAS] Customer created:', customerData.id);

  return customerData;
}

async function createAsaasSubscription(
  customerId: string,
  billingType: string,
  creditCard: CreditCard | undefined,
  apiKey: string
): Promise<AsaasSubscriptionResponse> {
  console.log('[ASAAS] Creating subscription for customer:', customerId);

  const subscriptionData: any = {
    customer: customerId,
    billingType: billingType,
    value: 9.98,
    nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    cycle: 'MONTHLY',
    description: 'SetlistGO™ - Assinatura Mensal',
  };

  // If credit card, add credit card info
  if (billingType === 'CREDIT_CARD' && creditCard) {
    subscriptionData.creditCard = {
      holderName: creditCard.holderName,
      number: creditCard.number.replace(/\s/g, ''),
      expiryMonth: creditCard.expiryMonth,
      expiryYear: creditCard.expiryYear,
      ccv: creditCard.ccv,
    };
    subscriptionData.creditCardHolderInfo = {
      name: creditCard.holderName,
      cpfCnpj: '', // Will use customer's CPF
    };
  }

  const response = await fetch('https://sandbox.asaas.com/api/v3/subscriptions', {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscriptionData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ASAAS] Failed to create subscription:', errorText);
    throw new Error(`Failed to create subscription: ${errorText}`);
  }

  const subscription = await response.json();
  console.log('[ASAAS] Subscription created:', subscription.id);

  return subscription;
}

async function getFirstPayment(subscriptionId: string, apiKey: string): Promise<any> {
  console.log('[ASAAS] Fetching first payment for subscription:', subscriptionId);

  const response = await fetch(
    `https://sandbox.asaas.com/api/v3/payments?subscription=${subscriptionId}&limit=1`,
    {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error('[ASAAS] Failed to fetch payment');
    return null;
  }

  const data = await response.json();

  if (data.data && data.data.length > 0) {
    console.log('[ASAAS] Payment found:', data.data[0].id);
    return data.data[0];
  }

  return null;
}

// =====================================================
// MAIN HANDLER
// =====================================================
serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!ASAAS_API_KEY) {
      throw new Error('ASAAS_API_KEY not configured');
    }

    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();

    // Validate request
    const errors: string[] = [];

    if (!body.billingType || !['PIX', 'BOLETO', 'CREDIT_CARD'].includes(body.billingType)) {
      errors.push('billingType inválido');
    }

    if (!body.customer) {
      errors.push('customer é obrigatório');
    } else {
      if (!body.customer.name || body.customer.name.length < 3) {
        errors.push('Nome inválido');
      }
      if (!validateEmail(body.customer.email)) {
        errors.push('Email inválido');
      }
      if (!validateCPF(body.customer.cpfCnpj)) {
        errors.push('CPF inválido');
      }
      if (!validatePhone(body.customer.mobilePhone)) {
        errors.push('Telefone inválido');
      }
    }

    if (body.billingType === 'CREDIT_CARD') {
      if (!body.creditCard) {
        errors.push('Dados do cartão são obrigatórios');
      } else {
        errors.push(...validateCreditCard(body.creditCard));
      }
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create/update ASAAS customer
    const asaasCustomer = await createOrUpdateAsaasCustomer(body.customer, ASAAS_API_KEY);

    // Create ASAAS subscription
    const asaasSubscription = await createAsaasSubscription(
      asaasCustomer.id,
      body.billingType,
      body.creditCard,
      ASAAS_API_KEY
    );

    // Get first payment (for PIX/Boleto details)
    const firstPayment = await getFirstPayment(asaasSubscription.id, ASAAS_API_KEY);

    // Determine subscription status
    // For credit card: check if payment is CONFIRMED or RECEIVED
    // For PIX/Boleto: wait for webhook
    let subscriptionStatus = 'inactive';
    if (body.billingType === 'CREDIT_CARD' && firstPayment) {
      if (firstPayment.status === 'CONFIRMED' || firstPayment.status === 'RECEIVED') {
        subscriptionStatus = 'active';
      }
    }

    // Save to Supabase
    const { data: subscription, error: dbError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        asaas_subscription_id: asaasSubscription.id,
        asaas_customer_id: asaasCustomer.id,
        status: subscriptionStatus,
        amount: asaasSubscription.value,
        payment_method: body.billingType,
        next_due_date: asaasSubscription.nextDueDate,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[DB] Failed to save subscription:', dbError);
      throw new Error('Failed to save subscription');
    }

    // Save first payment if exists
    if (firstPayment) {
      await supabaseClient.from('payments').insert({
        subscription_id: subscription.id,
        asaas_payment_id: firstPayment.id,
        status: firstPayment.status,
        amount: firstPayment.value,
        payment_method: firstPayment.billingType,
        due_date: firstPayment.dueDate,
        invoice_url: firstPayment.invoiceUrl,
        bank_slip_url: firstPayment.bankSlipUrl,
        pix_qr_code: firstPayment.pixQrCodeBase64,
        pix_copy_paste: firstPayment.pixCopyAndPaste,
      });
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          asaas_subscription_id: asaasSubscription.id,
          status: subscription.status,
          amount: subscription.amount,
          next_due_date: subscription.next_due_date,
        },
        payment: firstPayment ? {
          id: firstPayment.id,
          status: firstPayment.status,
          due_date: firstPayment.dueDate,
          invoice_url: firstPayment.invoiceUrl,
          bank_slip_url: firstPayment.bankSlipUrl,
          pix_qr_code: firstPayment.pixQrCodeBase64,
          pix_copy_paste: firstPayment.pixCopyAndPaste,
        } : null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[ERROR]', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
