
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription status if user is logged in
      if (session?.user) {
        checkSubscriptionStatus();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription status on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        checkSubscriptionStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      await supabase.functions.invoke('check-subscription');
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return { error };
      }
      
      console.log('Sign in successful');
      toast.success('Signed in successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      toast.error(error.message);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success('Account created successfully! Please check your email for verification.');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user?.id);
      
      if (error) {
        toast.error('Failed to update profile');
        return { error };
      }
      
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
      toast.error('Failed to update profile');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
