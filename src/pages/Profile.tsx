
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, CreditCard, Trash2, Crown, Gem, Palette, Monitor, Moon, Sun } from "lucide-react";
import Navigation from "@/components/Navigation";
import SubscriptionCard from "@/components/SubscriptionCard";
import RazorpayCheckout from "@/components/RazorpayCheckout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  currency: string | null;
  country: string | null;
  user_type: string | null;
  subscription_tier: string | null;
}

const Profile = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { subscription, manageSubscription, refreshSubscription } = useSubscription();
  const { mode, style, setMode, setStyle } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState<'Premium' | 'Organization' | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const profileData = {
      full_name: formData.get('full_name') as string,
      currency: formData.get('currency') as string,
      country: formData.get('country') as string,
    };

    const { error } = await updateProfile(profileData);
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
    }
    
    setLoading(false);
  };

  const handleUpgrade = (tier: 'Premium' | 'Organization') => {
    setShowRazorpayCheckout(tier);
    setShowUpgradeOptions(false);
  };

  const handlePaymentSuccess = async () => {
    setShowRazorpayCheckout(null);
    await refreshSubscription();
    toast.success('Subscription updated successfully!');
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete user profile and related data
      const { error } = await supabase.auth.admin.deleteUser(user!.id);
      
      if (error) throw error;
      
      toast.success('Account deleted successfully');
      await signOut();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-collector-black/70">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Unable to load profile. Please try again.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Show Razorpay checkout if user is upgrading
  if (showRazorpayCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowRazorpayCheckout(null)}
              className="mb-4"
            >
              ← Back to Profile
            </Button>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-collector-black mb-2">
              Upgrade to {showRazorpayCheckout}
            </h1>
            <p className="text-collector-black/70">
              Complete your subscription upgrade with secure Razorpay payment
            </p>
          </div>
          <div className="flex justify-center">
            <RazorpayCheckout
              planType={showRazorpayCheckout}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-collector-black">
              Profile Settings
            </h1>
            <p className="text-collector-black/70 text-sm sm:text-base">
              Manage your account information and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {profile.user_type === 'individual' ? 'Individual' : 'Organization'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="space-y-6">
            <Card className="shadow-sm border-collector-gold/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-collector-orange" />
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Update your personal details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={profile.full_name || ""}
                      className="border-collector-gold/30 focus:border-collector-orange text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      value={profile.email || ""}
                      disabled
                      className="bg-gray-50 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                      <Select name="currency" defaultValue={profile.currency || "INR"}>
                        <SelectTrigger className="border-collector-gold/30 focus:border-collector-orange text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                      <Select name="country" defaultValue={profile.country || "IND"}>
                        <SelectTrigger className="border-collector-gold/30 focus:border-collector-orange text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IND">India</SelectItem>
                          <SelectItem value="USA">United States</SelectItem>
                          <SelectItem value="CAN">Canada</SelectItem>
                          <SelectItem value="GBR">United Kingdom</SelectItem>
                          <SelectItem value="DEU">Germany</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className="shadow-sm border-collector-gold/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-collector-orange" />
                  <CardTitle className="text-lg">Theme Settings</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Customize your app appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Theme Mode</Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger className="border-collector-gold/30 focus:border-collector-orange text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Theme Style</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compact Theme (Excel-like)</span>
                    <Switch
                      checked={style === 'compact'}
                      onCheckedChange={(checked) => setStyle(checked ? 'compact' : 'default')}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enable for a more compact, Excel-style interface
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription and Danger Zone */}
          <div className="space-y-6">
            <Card className="shadow-sm border-collector-gold/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-collector-orange" />
                  <CardTitle className="text-lg">Subscription</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <SubscriptionCard onUpgrade={() => setShowUpgradeOptions(true)} />
                
                {subscription?.tier !== 'Individual' && (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => manageSubscription()}
                      className="w-full text-sm"
                    >
                      Cancel Subscription
                    </Button>
                    {subscription?.tier === 'Premium' && (
                      <Button
                        onClick={() => handleUpgrade('Organization')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Organization - ₹2,249/month
                      </Button>
                    )}
                  </div>
                )}

                {showUpgradeOptions && subscription?.tier === 'Individual' && (
                  <div className="mt-4 space-y-2">
                    <Button
                      onClick={() => handleUpgrade('Premium')}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium - ₹749/month
                    </Button>
                    <Button
                      onClick={() => handleUpgrade('Organization')}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm"
                    >
                      <Gem className="w-4 h-4 mr-2" />
                      Upgrade to Organization - ₹2,249/month
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowUpgradeOptions(false)}
                      className="w-full text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="shadow-sm border-red-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full text-sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
