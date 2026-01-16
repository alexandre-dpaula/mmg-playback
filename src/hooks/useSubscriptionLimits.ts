/**
 * Hook: useSubscriptionLimits
 * Gerencia limitações de recursos baseado no plano do usuário
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface SubscriptionLimits {
  canCreateEvents: boolean;
  canCreateTracks: boolean;
  canAccessRehearsalMode: boolean;
  maxEvents: number;
  maxTracksPerEvent: number;
  eventCount: number;
  trackCount: number;
  isLoading: boolean;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_price_id: string;
}

export function useSubscriptionLimits() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<SubscriptionLimits>({
    canCreateEvents: true,
    canCreateTracks: true,
    canAccessRehearsalMode: false,
    maxEvents: 1, // Free: 1 evento
    maxTracksPerEvent: 1, // Free: 1 música por evento
    eventCount: 0,
    trackCount: 0,
    isLoading: true,
  });

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing';

  useEffect(() => {
    if (!user) {
      setLimits((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchSubscriptionAndLimits = async () => {
      try {
        // 1. Buscar assinatura ativa
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .gt('current_period_end', new Date().toISOString())
          .single();

        if (subError && subError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subError);
        }

        setSubscription(subData);

        // 2. Contar eventos do usuário
        const { count: eventCount, error: eventError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id);

        if (eventError) {
          console.error('Error counting events:', eventError);
        }

        // 3. Contar músicas totais do usuário (em todos os eventos)
        const { count: trackCount, error: trackError } = await supabase
          .from('event_tracks')
          .select('*, events!inner(created_by)', { count: 'exact', head: true })
          .eq('events.created_by', user.id);

        if (trackError) {
          console.error('Error counting tracks:', trackError);
        }

        // 4. Definir limites baseado no plano
        const isProUser = !!subData && (subData.status === 'active' || subData.status === 'trialing');

        if (isProUser) {
          // PRO: Sem limites
          setLimits({
            canCreateEvents: true,
            canCreateTracks: true,
            canAccessRehearsalMode: true,
            maxEvents: Infinity,
            maxTracksPerEvent: Infinity,
            eventCount: eventCount || 0,
            trackCount: trackCount || 0,
            isLoading: false,
          });
        } else {
          // FREE: Limitado
          const currentEventCount = eventCount || 0;
          const currentTrackCount = trackCount || 0;

          setLimits({
            canCreateEvents: currentEventCount < 1,
            canCreateTracks: currentTrackCount < 1,
            canAccessRehearsalMode: false,
            maxEvents: 1,
            maxTracksPerEvent: 1,
            eventCount: currentEventCount,
            trackCount: currentTrackCount,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error in fetchSubscriptionAndLimits:', error);
        setLimits((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchSubscriptionAndLimits();

    // Subscribe to subscription changes
    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscriptionAndLimits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    ...limits,
    subscription,
    isPro,
    hasReachedEventLimit: limits.eventCount >= limits.maxEvents && !isPro,
    hasReachedTrackLimit: limits.trackCount >= limits.maxTracksPerEvent && !isPro,
  };
}
