
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionInfo {
  tier: 'Individual' | 'Premium' | 'Organization';
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
      // Use the check-subscription function to get the latest status
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;

      setSubscription({
        tier: data.subscription_tier || 'Individual',
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
          .select('subscribed, subscription_end')
          .eq('user_id', user.id)
          .maybeSingle();

        setSubscription({
          tier: (profile?.subscription_tier as 'Individual' | 'Premium' | 'Organization') || 'Individual',
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
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;

      // Open customer portal in new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast.error(error.message || 'Failed to open customer portal');
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
