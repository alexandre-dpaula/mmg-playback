// Edge Function: ASAAS Webhook Handler
// Description: Processes ASAAS webhook events for payment updates
// Author: SetlistGO™
// Created: 2025-12-24

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

// =====================================================
// TYPES & INTERFACES
// =====================================================
interface WebhookEvent {
  event: string;
  payment?: {
    id: string;
    customer: string;
    subscription: string;
    billingType: string;
    value: number;
    netValue: number;
    status: string;
    dueDate: string;
    paymentDate?: string;
    invoiceUrl?: string;
    bankSlipUrl?: string;
    pixQrCodeBase64?: string;
    pixCopyAndPaste?: string;
  };
}

// =====================================================
// EVENT HANDLERS
// =====================================================
async function handlePaymentCreated(event: WebhookEvent, supabaseClient: any) {
  console.log('[WEBHOOK] Processing PAYMENT_CREATED');

  const payment = event.payment;
  if (!payment) {
    console.error('[WEBHOOK] Payment data missing');
    return;
  }

  try {
    // Find subscription by ASAAS subscription ID
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('id')
      .eq('asaas_subscription_id', payment.subscription)
      .single();

    if (!subscription) {
      console.error('[WEBHOOK] Subscription not found:', payment.subscription);
      return;
    }

    // Insert payment record
    const { error } = await supabaseClient
      .from('payments')
      .insert({
        subscription_id: subscription.id,
        asaas_payment_id: payment.id,
        status: payment.status,
        amount: payment.value,
        payment_method: payment.billingType,
        due_date: payment.dueDate,
        invoice_url: payment.invoiceUrl,
        bank_slip_url: payment.bankSlipUrl,
        pix_qr_code: payment.pixQrCodeBase64,
        pix_copy_paste: payment.pixCopyAndPaste,
      });

    if (error) {
      console.error('[WEBHOOK] Failed to insert payment:', error);
    } else {
      console.log('[WEBHOOK] Payment created:', payment.id);
    }
  } catch (error) {
    console.error('[WEBHOOK] Error processing PAYMENT_CREATED:', error);
  }
}

async function handlePaymentConfirmed(event: WebhookEvent, supabaseClient: any) {
  console.log('[WEBHOOK] Processing PAYMENT_CONFIRMED');

  const payment = event.payment;
  if (!payment) return;

  try {
    // Update payment status
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        status: payment.status,
        payment_date: payment.paymentDate || new Date().toISOString(),
      })
      .eq('asaas_payment_id', payment.id);

    if (paymentError) {
      console.error('[WEBHOOK] Failed to update payment:', paymentError);
    }

    // Find and update subscription
    const { data: subscriptionData } = await supabaseClient
      .from('payments')
      .select('subscription_id')
      .eq('asaas_payment_id', payment.id)
      .single();

    if (subscriptionData) {
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
        })
        .eq('id', subscriptionData.subscription_id);

      if (subscriptionError) {
        console.error('[WEBHOOK] Failed to update subscription:', subscriptionError);
      } else {
        console.log('[WEBHOOK] Subscription activated');
      }
    }
  } catch (error) {
    console.error('[WEBHOOK] Error processing PAYMENT_CONFIRMED:', error);
  }
}

async function handlePaymentReceived(event: WebhookEvent, supabaseClient: any) {
  console.log('[WEBHOOK] Processing PAYMENT_RECEIVED');

  const payment = event.payment;
  if (!payment) return;

  try {
    // Update payment status
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        status: 'RECEIVED',
        payment_date: payment.paymentDate || new Date().toISOString(),
      })
      .eq('asaas_payment_id', payment.id);

    if (paymentError) {
      console.error('[WEBHOOK] Failed to update payment:', paymentError);
    }

    // Activate subscription
    const { data: subscriptionData } = await supabaseClient
      .from('payments')
      .select('subscription_id')
      .eq('asaas_payment_id', payment.id)
      .single();

    if (subscriptionData) {
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
        })
        .eq('id', subscriptionData.subscription_id);

      if (subscriptionError) {
        console.error('[WEBHOOK] Failed to activate subscription:', subscriptionError);
      } else {
        console.log('[WEBHOOK] Subscription activated (payment received)');
      }
    }
  } catch (error) {
    console.error('[WEBHOOK] Error processing PAYMENT_RECEIVED:', error);
  }
}

async function handlePaymentOverdue(event: WebhookEvent, supabaseClient: any) {
  console.log('[WEBHOOK] Processing PAYMENT_OVERDUE');

  const payment = event.payment;
  if (!payment) return;

  try {
    // Update payment status
    await supabaseClient
      .from('payments')
      .update({ status: 'OVERDUE' })
      .eq('asaas_payment_id', payment.id);

    // Mark subscription as overdue
    const { data: subscriptionData } = await supabaseClient
      .from('payments')
      .select('subscription_id')
      .eq('asaas_payment_id', payment.id)
      .single();

    if (subscriptionData) {
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'overdue' })
        .eq('id', subscriptionData.subscription_id);

      console.log('[WEBHOOK] Subscription marked as overdue');
    }
  } catch (error) {
    console.error('[WEBHOOK] Error processing PAYMENT_OVERDUE:', error);
  }
}

async function handlePaymentDeleted(event: WebhookEvent, supabaseClient: any) {
  console.log('[WEBHOOK] Processing PAYMENT_DELETED');

  const payment = event.payment;
  if (!payment) return;

  try {
    // Update payment status
    await supabaseClient
      .from('payments')
      .update({ status: 'DELETED' })
      .eq('asaas_payment_id', payment.id);

    console.log('[WEBHOOK] Payment marked as deleted');
  } catch (error) {
    console.error('[WEBHOOK] Error processing PAYMENT_DELETED:', error);
  }
}

async function handlePaymentRefunded(event: WebhookEvent, supabaseClient: any) {
  console.log('[WEBHOOK] Processing PAYMENT_REFUNDED');

  const payment = event.payment;
  if (!payment) return;

  try {
    // Update payment status
    await supabaseClient
      .from('payments')
      .update({ status: 'REFUNDED' })
      .eq('asaas_payment_id', payment.id);

    console.log('[WEBHOOK] Payment marked as refunded');
  } catch (error) {
    console.error('[WEBHOOK] Error processing PAYMENT_REFUNDED:', error);
  }
}

async function handlePaymentChargeback(event: WebhookEvent, supabaseClient: any) {
  console.log('[WEBHOOK] Processing PAYMENT_CHARGEBACK_REQUESTED');

  const payment = event.payment;
  if (!payment) return;

  try {
    // Update payment status
    await supabaseClient
      .from('payments')
      .update({ status: 'CHARGEBACK' })
      .eq('asaas_payment_id', payment.id);

    // Mark subscription as inactive
    const { data: subscriptionData } = await supabaseClient
      .from('payments')
      .select('subscription_id')
      .eq('asaas_payment_id', payment.id)
      .single();

    if (subscriptionData) {
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'inactive' })
        .eq('id', subscriptionData.subscription_id);

      console.log('[WEBHOOK] Subscription deactivated due to chargeback');
    }
  } catch (error) {
    console.error('[WEBHOOK] Error processing PAYMENT_CHARGEBACK:', error);
  }
}

// =====================================================
// MAIN HANDLER
// =====================================================
serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
  };

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN');

    // Optional: Validate webhook token (if ASAAS provides one)
    if (ASAAS_WEBHOOK_TOKEN) {
      const webhookToken = req.headers.get('asaas-access-token');
      if (webhookToken !== ASAAS_WEBHOOK_TOKEN) {
        console.error('[WEBHOOK] Invalid webhook token');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse webhook event
    const event: WebhookEvent = await req.json();
    console.log('[WEBHOOK] Received event:', event.event);

    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Route event to appropriate handler
    switch (event.event) {
      case 'PAYMENT_CREATED':
        await handlePaymentCreated(event, supabaseClient);
        break;

      case 'PAYMENT_CONFIRMED':
        await handlePaymentConfirmed(event, supabaseClient);
        break;

      case 'PAYMENT_RECEIVED':
        await handlePaymentReceived(event, supabaseClient);
        break;

      case 'PAYMENT_OVERDUE':
        await handlePaymentOverdue(event, supabaseClient);
        break;

      case 'PAYMENT_DELETED':
        await handlePaymentDeleted(event, supabaseClient);
        break;

      case 'PAYMENT_REFUNDED':
        await handlePaymentRefunded(event, supabaseClient);
        break;

      case 'PAYMENT_CHARGEBACK_REQUESTED':
      case 'PAYMENT_CHARGEBACK_DISPUTE':
        await handlePaymentChargeback(event, supabaseClient);
        break;

      default:
        console.log('[WEBHOOK] Unhandled event type:', event.event);
    }

    // Always return success to ASAAS (even if our processing failed)
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[WEBHOOK] Error:', error);

    // Still return 200 to avoid ASAAS retrying failed webhooks endlessly
    return new Response(
      JSON.stringify({ error: 'Internal error', message: error instanceof Error ? error.message : 'Unknown' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
