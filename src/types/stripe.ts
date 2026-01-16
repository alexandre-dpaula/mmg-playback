/**
 * Stripe Types
 * Tipos TypeScript para integração com Stripe
 */

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export type SubscriptionInterval = 'month' | 'year';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: SubscriptionInterval;
  priceId: string; // Stripe Price ID
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl?: string;
}

export interface CreatePortalSessionResponse {
  url: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}
