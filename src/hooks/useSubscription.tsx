
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
      console.log('Fetching subscription status for user:', user.id);
      
      // First check the subscribers table directly
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_end, subscription_tier')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError) {
        console.error('Subscriber error:', subscriberError);
      }

      // Also check the profiles table for subscription tier
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      console.log('Subscriber data:', subscriberData);
      console.log('Profile data:', profileData);

      // Determine subscription status
      const isSubscribed = subscriberData?.subscribed || false;
      const subscriptionTier = subscriberData?.subscription_tier || profileData?.subscription_tier || 'Individual';
      const subscriptionEnd = subscriberData?.subscription_end;

      // Validate tier
      const validTier: SubscriptionTier = ['Individual', 'Premium', 'Organization'].includes(subscriptionTier) 
        ? subscriptionTier as SubscriptionTier 
        : 'Individual';

      const subscriptionInfo = {
        tier: validTier,
        subscribed: isSubscribed,
        subscriptionEnd: subscriptionEnd
      };

      console.log('Final subscription info:', subscriptionInfo);
      setSubscription(subscriptionInfo);

    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      // Set default subscription info on error
      setSubscription({
        tier: 'Individual',
        subscribed: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Refresh subscription status with debouncing
  const refreshSubscription = async () => {
    console.log('Refreshing subscription status...');
    setLoading(true);
    
    // Add a small delay to allow webhook processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
