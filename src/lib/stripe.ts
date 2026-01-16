/**
 * Stripe Configuration
 * Configuração do Stripe para processamento de pagamentos
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
      console.error('VITE_STRIPE_PUBLISHABLE_KEY não está configurada');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(key);
  }

  return stripePromise;
};

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  // Preços dos planos (IDs dos Price Objects no Stripe)
  prices: {
    monthly: 'price_monthly_pro', // Substitua pelo ID real do Stripe
    yearly: 'price_yearly_pro',   // Substitua pelo ID real do Stripe
  },
  // URLs de retorno
  successUrl: `${window.location.origin}/subscription/success`,
  cancelUrl: `${window.location.origin}/subscription/cancel`,
};
