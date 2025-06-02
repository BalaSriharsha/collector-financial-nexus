
import { useState, useEffect, useCallback } from 'react';
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

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setSubscription({
        tier: 'Individual',
        subscribed: false
      });
      return;
    }

    try {
      console.log('Fetching subscription status for user:', user.id);
      
      // First get the profile data (this is the primary source of truth for subscription tier)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      // Then check the subscribers table for additional subscription details
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_end, subscription_tier')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError) {
        console.error('Subscriber error:', subscriberError);
        // Don't throw here, just log - subscriber data is supplementary
      }

      console.log('Profile data:', profileData);
      console.log('Subscriber data:', subscriberData);

      // Use profile data as primary source, subscriber data as supplementary
      const subscriptionTier = profileData?.subscription_tier || 'Individual';
      const isSubscribed = subscriberData?.subscribed || (subscriptionTier !== 'Individual');
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
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Refresh subscription status - with minimal delay to allow for webhook processing
  const refreshSubscription = useCallback(async () => {
    console.log('Refreshing subscription status...');
    setLoading(true);
    
    // Small delay to allow webhook processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await fetchSubscription();
  }, [fetchSubscription]);

  const canAccess = useCallback((feature: string) => {
    if (!subscription) return false;

    const features = {
      'analytics': ['Premium', 'Organization'],
      'export': ['Premium', 'Organization'],
      'unlimited-storage': ['Premium', 'Organization'],
      'multi-user': ['Organization'],
      'api-access': ['Organization']
    };

    return features[feature as keyof typeof features]?.includes(subscription.tier) || false;
  }, [subscription]);

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
