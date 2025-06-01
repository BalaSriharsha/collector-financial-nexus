
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SubscriptionTier = 'Individual' | 'Premium' | 'Organization';

interface SubscriptionInfo {
  tier: SubscriptionTier;
  subscribed: boolean;
  subscriptionEnd?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // First try to get fresh data from the manage-subscription function
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'get_status' }
      });
      
      if (error) {
        console.error('Error from manage-subscription function:', error);
        throw error;
      }

      setSubscription({
        tier: (data.subscription_tier as SubscriptionTier) || 'Individual',
        subscribed: data.subscribed || false,
        subscriptionEnd: data.subscription_end
      });
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      // Fallback to database query
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_end, subscription_tier')
          .eq('user_id', user.id)
          .maybeSingle();

        setSubscription({
          tier: (subscriber?.subscription_tier || profile?.subscription_tier as SubscriptionTier) || 'Individual',
          subscribed: subscriber?.subscribed || false,
          subscriptionEnd: subscriber?.subscription_end
        });
      } catch (fallbackError: any) {
        console.error('Error in fallback subscription fetch:', fallbackError);
        setSubscription({
          tier: 'Individual',
          subscribed: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Refresh subscription status (useful after checkout)
  const refreshSubscription = async () => {
    setLoading(true);
    await fetchSubscription();
  };

  const canAccess = (feature: string) => {
    if (!subscription) return false;

    const features = {
      'expense-sharing': ['Premium', 'Organization'],
      'analytics': ['Premium', 'Organization'],
      'export': ['Premium', 'Organization'],
      'unlimited-storage': ['Premium', 'Organization'],
      'multi-user': ['Organization'],
      'api-access': ['Organization']
    };

    return features[feature as keyof typeof features]?.includes(subscription.tier) || false;
  };

  const manageSubscription = async () => {
    if (!user) {
      toast.error('Please log in to manage your subscription');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'cancel' }
      });
      
      if (error) throw error;

      toast.success('Subscription cancelled successfully');
      await refreshSubscription();
    } catch (error: any) {
      console.error('Error managing subscription:', error);
      toast.error(error.message || 'Failed to manage subscription');
    }
  };

  return {
    subscription,
    loading,
    canAccess,
    refreshSubscription,
    manageSubscription
  };
};
