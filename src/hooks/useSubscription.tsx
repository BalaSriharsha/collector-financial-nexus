
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
      setSubscription({
        tier: 'Individual',
        subscribed: false
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching subscription status for user:', user.id);
      
      // Call the manage-subscription function to get the latest status
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'get_status' }
      });
      
      if (error) {
        console.error('Error from manage-subscription function:', error);
        // Fallback to direct database query
        await fetchSubscriptionFallback();
        return;
      }

      console.log('Subscription data from function:', data);

      if (data) {
        setSubscription({
          tier: (data.subscription_tier as SubscriptionTier) || 'Individual',
          subscribed: data.subscribed || false,
          subscriptionEnd: data.subscription_end
        });
      } else {
        // If no data returned, use fallback
        await fetchSubscriptionFallback();
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      await fetchSubscriptionFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionFallback = async () => {
    if (!user) return;

    try {
      console.log('Using fallback subscription fetch');
      
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      // Get subscriber data
      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_end, subscription_tier')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError) {
        console.error('Subscriber error:', subscriberError);
      }

      console.log('Profile data:', profile);
      console.log('Subscriber data:', subscriber);

      const tierFromSubscriber = subscriber?.subscription_tier;
      const tierFromProfile = profile?.subscription_tier;
      const finalTier = (tierFromSubscriber || tierFromProfile) as string;
      
      // Ensure the tier is one of the allowed values
      const validTier: SubscriptionTier = ['Individual', 'Premium', 'Organization'].includes(finalTier) 
        ? finalTier as SubscriptionTier 
        : 'Individual';

      const subscriptionInfo = {
        tier: validTier,
        subscribed: subscriber?.subscribed || false,
        subscriptionEnd: subscriber?.subscription_end
      };

      console.log('Final subscription info:', subscriptionInfo);
      setSubscription(subscriptionInfo);
    } catch (fallbackError: any) {
      console.error('Error in fallback subscription fetch:', fallbackError);
      setSubscription({
        tier: 'Individual',
        subscribed: false
      });
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Refresh subscription status with timeout protection
  const refreshSubscription = async (forceRefresh = false) => {
    console.log('Refreshing subscription status...', forceRefresh ? '(forced)' : '');
    
    // Don't set loading to true if we already have subscription data
    if (!subscription || forceRefresh) {
      setLoading(true);
    }
    
    if (forceRefresh) {
      // Add longer delay for payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      // Add a small delay to allow webhook processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
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
