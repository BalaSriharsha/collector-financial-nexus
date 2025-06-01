
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

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        // First check profiles table for subscription tier
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Check subscribers table for additional info
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
      } catch (error: any) {
        console.error('Error fetching subscription:', error);
        // Default to Individual if error
        setSubscription({
          tier: 'Individual',
          subscribed: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

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

  const updateSubscription = async (newTier: 'Individual' | 'Premium' | 'Organization') => {
    if (!user) return { error: new Error('No user found') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: newTier })
        .eq('id', user.id);

      if (error) throw error;

      setSubscription(prev => prev ? { ...prev, tier: newTier } : null);
      toast.success('Subscription updated successfully!');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  return {
    subscription,
    loading,
    canAccess,
    updateSubscription
  };
};
