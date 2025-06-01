
import { useState, useEffect, useRef } from 'react';
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
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription({
        tier: 'Individual',
        subscribed: false
      });
      setLoading(false);
      return;
    }

    // Prevent concurrent fetches and rate limiting
    const now = Date.now();
    if (fetchingRef.current || (now - lastFetchRef.current < 5000)) {
      console.log('Skipping fetch - too recent or already fetching');
      return;
    }

    fetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      console.log('Fetching subscription status for user:', user.id);
      
      // Try to get subscription status from database first (faster)
      const { data: dbSubscription, error: dbError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!dbError && dbSubscription) {
        console.log('Found subscription in database:', dbSubscription);
        const subscriptionInfo = {
          tier: (dbSubscription.subscription_tier as SubscriptionTier) || 'Individual',
          subscribed: dbSubscription.subscribed || false,
          subscriptionEnd: dbSubscription.subscription_end
        };
        setSubscription(subscriptionInfo);
        setLoading(false);
        fetchingRef.current = false;
        retryCountRef.current = 0;
        return;
      }

      // If no database record or error, try the manage-subscription function
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`Trying manage-subscription function (attempt ${retryCountRef.current})`);
        
        const { data, error } = await supabase.functions.invoke('manage-subscription', {
          body: { action: 'get_status' }
        });
        
        if (error) {
          console.error('Error from manage-subscription function:', error);
          throw error;
        }

        console.log('Subscription data from function:', data);

        if (data) {
          const subscriptionInfo = {
            tier: (data.subscription_tier as SubscriptionTier) || 'Individual',
            subscribed: data.subscribed || false,
            subscriptionEnd: data.subscription_end
          };
          setSubscription(subscriptionInfo);
        } else {
          // Set default if no data
          setSubscription({
            tier: 'Individual',
            subscribed: false
          });
        }
      } else {
        console.log('Max retries reached, using default subscription');
        setSubscription({
          tier: 'Individual',
          subscribed: false
        });
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      
      // Set default subscription on error to prevent loading state
      setSubscription({
        tier: 'Individual',
        subscribed: false
      });
      
      // Only show error toast if it's not a network issue and we haven't exceeded retries
      if (retryCountRef.current >= maxRetries) {
        toast.error('Unable to load subscription status. Please refresh the page.');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    // Reset retry counter when user changes
    retryCountRef.current = 0;
    fetchSubscription();
  }, [user]);

  // Refresh subscription status with proper debouncing
  const refreshSubscription = async (forceRefresh = false) => {
    console.log('Refreshing subscription status...', forceRefresh ? '(forced)' : '');
    
    // Check rate limiting - increase minimum time between calls
    const now = Date.now();
    if (!forceRefresh && (now - lastFetchRef.current < 10000)) {
      console.log('Rate limited - skipping refresh');
      return;
    }
    
    // Reset retry counter on forced refresh
    if (forceRefresh) {
      retryCountRef.current = 0;
      // Add longer delay for payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
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
      await refreshSubscription(true);
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
