// Custom Hook: useSubscription
// Description: Manages subscription state and operations with ASAAS
// Author: SetlistGO™
// Created: 2025-12-24

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  Subscription,
  Payment,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  ApiError,
} from '@/types/asaas';

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Fetches current user's subscription from Supabase
 */
async function fetchSubscription(): Promise<Subscription | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[useSubscription] Error fetching subscription:', error);
    throw error;
  }

  return data;
}

/**
 * Fetches payment history for current subscription
 */
async function fetchPaymentHistory(): Promise<Payment[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // First get the subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!subscription) {
    return [];
  }

  // Then get payments
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('subscription_id', subscription.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[useSubscription] Error fetching payments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Creates a new subscription via Edge Function
 */
async function createSubscription(
  request: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-subscription`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || error.error || 'Failed to create subscription');
  }

  const data: CreateSubscriptionResponse = await response.json();
  return data;
}

/**
 * Cancels current subscription
 */
async function cancelSubscription(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('user_id', user.id);

  if (error) {
    console.error('[useSubscription] Error canceling subscription:', error);
    throw error;
  }

  // TODO: Also call ASAAS API to cancel subscription there
  // This would require an Edge Function
}

// =====================================================
// CUSTOM HOOK
// =====================================================

export function useSubscription() {
  const queryClient = useQueryClient();

  // Query: Fetch subscription status
  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Query: Fetch payment history
  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPaymentHistory,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: !!subscriptionQuery.data, // Only fetch if subscription exists
  });

  // Mutation: Create subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  // Mutation: Cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  return {
    // Subscription data
    subscription: subscriptionQuery.data,
    isLoadingSubscription: subscriptionQuery.isLoading,
    subscriptionError: subscriptionQuery.error,

    // Payment history
    payments: paymentsQuery.data || [],
    isLoadingPayments: paymentsQuery.isLoading,
    paymentsError: paymentsQuery.error,

    // Mutations
    createSubscription: createSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    createSubscriptionError: createSubscriptionMutation.error,

    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCancelingSubscription: cancelSubscriptionMutation.isPending,
    cancelSubscriptionError: cancelSubscriptionMutation.error,

    // Helpers
    hasActiveSubscription: subscriptionQuery.data?.status === 'active',
    isSubscriptionOverdue: subscriptionQuery.data?.status === 'overdue',
    refetchSubscription: subscriptionQuery.refetch,
    refetchPayments: paymentsQuery.refetch,
  };
}

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook to check if user has access to PRO features
 */
export function useHasProAccess(): boolean {
  const { subscription } = useSubscription();
  return subscription?.status === 'active';
}

/**
 * Hook to get next payment date
 */
export function useNextPaymentDate(): Date | null {
  const { subscription } = useSubscription();

  if (!subscription?.next_due_date) {
    return null;
  }

  return new Date(subscription.next_due_date);
}

/**
 * Hook to get days until next payment
 */
export function useDaysUntilPayment(): number | null {
  const nextDate = useNextPaymentDate();

  if (!nextDate) {
    return null;
  }

  const today = new Date();
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
