// ASAAS Types & Interfaces
// Description: TypeScript types for ASAAS integration
// Author: SetlistGO™
// Created: 2025-12-24

// =====================================================
// CUSTOMER TYPES
// =====================================================
export interface AsaasCustomer {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
}

export interface AsaasCustomerResponse {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
  dateCreated: string;
}

// =====================================================
// SUBSCRIPTION TYPES
// =====================================================
export type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';
export type SubscriptionCycle = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'OVERDUE' | 'CANCELED' | 'EXPIRED';

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: BillingType;
  value: number;
  nextDueDate: string;
  cycle: SubscriptionCycle;
  description?: string;
  status: SubscriptionStatus;
  dateCreated: string;
  deleted: boolean;
}

export interface CreateSubscriptionRequest {
  billingType: BillingType;
  customer: AsaasCustomer;
  creditCard?: CreditCard;
}

// =====================================================
// PAYMENT TYPES
// =====================================================
export type PaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS';

export interface AsaasPayment {
  id: string;
  customer: string;
  subscription: string;
  installment?: string;
  billingType: BillingType;
  value: number;
  netValue: number;
  originalValue?: number;
  interestValue?: number;
  description?: string;
  dueDate: string;
  originalDueDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  status: PaymentStatus;
  pixQrCodeBase64?: string;
  pixCopyAndPaste?: string;
  deleted: boolean;
}

// =====================================================
// CREDIT CARD TYPES
// =====================================================
export interface CreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone: string;
  mobilePhone?: string;
}

// =====================================================
// DATABASE TYPES (Supabase)
// =====================================================
export interface Subscription {
  id: string;
  user_id: string;
  asaas_subscription_id: string | null;
  asaas_customer_id: string;
  status: 'active' | 'inactive' | 'overdue' | 'canceled';
  amount: number;
  payment_method: BillingType | null;
  next_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string;
  asaas_payment_id: string;
  status: string;
  amount: number;
  payment_method: string;
  payment_date: string | null;
  due_date: string;
  invoice_url: string | null;
  bank_slip_url: string | null;
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  created_at: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================
export interface CreateSubscriptionResponse {
  success: boolean;
  subscription: {
    id: string;
    asaas_subscription_id: string;
    status: string;
    amount: number;
    next_due_date: string;
  };
  payment: {
    id: string;
    status: string;
    due_date: string;
    invoice_url?: string;
    bank_slip_url?: string;
    pix_qr_code?: string;
    pix_copy_paste?: string;
  } | null;
}

export interface ApiError {
  error: string;
  errors?: string[];
  message?: string;
}

// =====================================================
// WEBHOOK EVENT TYPES
// =====================================================
export type WebhookEventType =
  | 'PAYMENT_CREATED'
  | 'PAYMENT_UPDATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_DELETED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_RECEIVED_IN_CASH'
  | 'PAYMENT_CHARGEBACK_REQUESTED'
  | 'PAYMENT_CHARGEBACK_DISPUTE'
  | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
  | 'PAYMENT_DUNNING_RECEIVED'
  | 'PAYMENT_DUNNING_REQUESTED'
  | 'PAYMENT_BANK_SLIP_VIEWED'
  | 'PAYMENT_CHECKOUT_VIEWED';

export interface WebhookEvent {
  event: WebhookEventType;
  payment?: AsaasPayment;
}

// =====================================================
// FORM TYPES
// =====================================================
export interface CustomerFormData {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
}

export interface CreditCardFormData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CheckoutFormData {
  billingType: BillingType;
  customer: CustomerFormData;
  creditCard?: CreditCardFormData;
}

// =====================================================
// UTILITY TYPES
// =====================================================
export interface PaymentMethodOption {
  value: BillingType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}
