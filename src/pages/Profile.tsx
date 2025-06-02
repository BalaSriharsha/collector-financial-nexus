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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { User, CreditCard, Trash2, Crown, Gem, Palette, Monitor, Moon, Sun, Loader2 } from "lucide-react";
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
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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
      } catch (error: unknown) {
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
    if (tier === 'Organization') {
      toast.info('Organization plan is coming soon! Stay tuned for updates.');
      return;
    }
    
    setSubscriptionLoading(true);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    setTimeout(() => {
      setProgress(100);
      setShowRazorpayCheckout(tier);
      setShowUpgradeOptions(false);
      setSubscriptionLoading(false);
      clearInterval(progressInterval);
    }, 2000);
  };

  const handlePaymentSuccess = async () => {
    setShowRazorpayCheckout(null);
    await refreshSubscription();
    toast.success('Subscription updated successfully!');
    // Stay on profile page - no need to redirect since we're already here
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete user profile and related data
      const { error } = await supabase.auth.admin.deleteUser(user!.id);
      
      if (error) throw error;
      
      toast.success('Account deleted successfully');
      await signOut();
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Unable to load profile. Please try again.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Show loading overlay when subscription is being processed
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Processing Subscription
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Please wait while we prepare your upgrade...
                </p>
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-slate-500">{progress}% complete</p>
                </div>
              </div>
            </div>
          </div>
          {/* Disabled content behind overlay */}
          <div className="opacity-30 pointer-events-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-slate-800 dark:text-slate-100">
                  Profile Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  Manage your account information and preferences
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">
                  {profile.user_type === 'individual' ? 'Individual' : 'Organization'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <div className="space-y-6">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-collector-orange" />
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Personal Information</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                      Update your personal details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          defaultValue={profile.full_name || ""}
                          disabled
                          className="border-slate-300 focus:border-collector-orange text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                        <Input
                          id="email"
                          value={profile.email || ""}
                          disabled
                          className="bg-gray-50 text-sm dark:bg-slate-600 dark:text-slate-300"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency</Label>
                          <Select name="currency" defaultValue={profile.currency || "INR"} disabled>
                            <SelectTrigger className="border-slate-300 focus:border-collector-orange text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
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
                          <Label htmlFor="country" className="text-sm font-medium text-slate-700 dark:text-slate-300">Country</Label>
                          <Select name="country" defaultValue={profile.country || "IND"} disabled>
                            <SelectTrigger className="border-slate-300 focus:border-collector-orange text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
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
                        disabled
                        className="w-full bg-blue-600 text-white dark:bg-blue-500 text-sm cursor-not-allowed"
                      >
                        Updating...
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-collector-orange" />
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Theme Settings</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                      Customize your app appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme Mode</Label>
                      <Select value={mode} onValueChange={() => {}} disabled>
                        <SelectTrigger className="border-slate-300 focus:border-collector-orange text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
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
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme Style</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Compact Theme (Excel-like)</span>
                        <Switch
                          checked={style === 'compact'}
                          onCheckedChange={() => {}}
                          disabled
                        />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Enable for a more compact, Excel-style interface
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription and Danger Zone */}
              <div className="space-y-6">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-collector-orange" />
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Subscription</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionCard onUpgrade={() => {}} />
                    
                    {subscription?.tier !== 'Individual' && (
                      <div className="mt-4 space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => {}}
                          className="w-full text-sm dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                          disabled
                        >
                          Cancel Subscription
                        </Button>
                        {subscription?.tier === 'Premium' && (
                          <Button
                            onClick={() => {}}
                            disabled
                            className="w-full bg-gray-400 text-white cursor-not-allowed text-sm relative"
                          >
                            <Gem className="w-4 h-4 mr-2" />
                            Organization Plan - Coming Soon
                            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs">
                              Soon
                            </Badge>
                          </Button>
                        )}
                      </div>
                    )}

                    {showUpgradeOptions && subscription?.tier === 'Individual' && (
                      <div className="mt-4 space-y-2">
                        <Button
                          onClick={() => {}}
                          disabled
                          className="w-full bg-orange-600 text-white border-2 border-orange-600 dark:bg-orange-500 dark:border-orange-500 text-sm cursor-not-allowed"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium - ₹749/month
                        </Button>
                        <Button
                          onClick={() => {}}
                          disabled
                          className="w-full bg-gray-400 text-white cursor-not-allowed text-sm relative"
                        >
                          <Gem className="w-4 h-4 mr-2" />
                          Organization Plan - Coming Soon
                          <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs">
                            Soon
                          </Badge>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowUpgradeOptions(false)}
                          className="w-full text-sm dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <CardTitle className="text-lg text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                      Irreversible actions for your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full text-sm" disabled>
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
                          <AlertDialogCancel disabled>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                            disabled
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
      </div>
    );
  }

  // Show Razorpay checkout if user is upgrading
  if (showRazorpayCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-slate-800 dark:text-slate-100 mb-2">
              Upgrade to {showRazorpayCheckout}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
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
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-slate-800 dark:text-slate-100">
              Profile Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Manage your account information and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">
              {profile.user_type === 'individual' ? 'Individual' : 'Organization'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-collector-orange" />
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Personal Information</CardTitle>
                </div>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  Update your personal details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={profile.full_name || ""}
                      className="border-slate-300 focus:border-collector-orange text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                    <Input
                      id="email"
                      value={profile.email || ""}
                      disabled
                      className="bg-gray-50 text-sm dark:bg-slate-600 dark:text-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency</Label>
                      <Select name="currency" defaultValue={profile.currency || "INR"}>
                        <SelectTrigger className="border-slate-300 focus:border-collector-orange text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
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
                      <Label htmlFor="country" className="text-sm font-medium text-slate-700 dark:text-slate-300">Country</Label>
                      <Select name="country" defaultValue={profile.country || "IND"}>
                        <SelectTrigger className="border-slate-300 focus:border-collector-orange text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-sm"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-collector-orange" />
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Theme Settings</CardTitle>
                </div>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  Customize your app appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme Mode</Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger className="border-slate-300 focus:border-collector-orange text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
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
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme Style</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Compact Theme (Excel-like)</span>
                    <Switch
                      checked={style === 'compact'}
                      onCheckedChange={(checked) => setStyle(checked ? 'compact' : 'default')}
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Enable for a more compact, Excel-style interface
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription and Danger Zone */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-collector-orange" />
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Subscription</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <SubscriptionCard onUpgrade={() => setShowUpgradeOptions(true)} />
                
                {subscription?.tier !== 'Individual' && (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => manageSubscription()}
                      className="w-full text-sm dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancel Subscription
                    </Button>
                    {subscription?.tier === 'Premium' && (
                      <Button
                        onClick={() => handleUpgrade('Organization')}
                        disabled
                        className="w-full bg-gray-400 text-white cursor-not-allowed text-sm relative"
                      >
                        <Gem className="w-4 h-4 mr-2" />
                        Organization Plan - Coming Soon
                        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs">
                          Soon
                        </Badge>
                      </Button>
                    )}
                  </div>
                )}

                {showUpgradeOptions && subscription?.tier === 'Individual' && (
                  <div className="mt-4 space-y-2">
                    <Button
                      onClick={() => handleUpgrade('Premium')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white border-2 border-orange-600 hover:border-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 dark:border-orange-500 dark:hover:border-orange-600 text-sm"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium - ₹749/month
                    </Button>
                    <Button
                      onClick={() => handleUpgrade('Organization')}
                      disabled
                      className="w-full bg-gray-400 text-white cursor-not-allowed text-sm relative"
                    >
                      <Gem className="w-4 h-4 mr-2" />
                      Organization Plan - Coming Soon
                      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs">
                        Soon
                      </Badge>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowUpgradeOptions(false)}
                      className="w-full text-sm dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-700 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <CardTitle className="text-lg text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                </div>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
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
