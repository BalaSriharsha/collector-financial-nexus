
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { currencies } from "@/utils/currency";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    date_of_birth: "",
    gender: "",
    user_type: "individual" as "individual" | "organization",
    country: "USA",
    currency: "USD"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || user.email || "",
            date_of_birth: data.date_of_birth || "",
            gender: data.gender || "",
            user_type: (data.user_type as "individual" | "organization") || "individual",
            country: data.country || "USA",
            currency: data.currency || "USD"
          });
        } else {
          // Set default values if no profile exists
          setProfile(prev => ({
            ...prev,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || ""
          }));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      const profileData = {
        id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        date_of_birth: profile.date_of_birth || null,
        gender: profile.gender || null,
        user_type: profile.user_type,
        country: profile.country,
        currency: profile.currency,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);
        error = result.error;
      } else {
        // Insert new profile
        const result = await supabase
          .from('profiles')
          .insert({
            ...profileData,
            created_at: new Date().toISOString()
          });
        error = result.error;
      }

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (country: string) => {
    const currency = currencies.find(c => c.country === country);
    setProfile(prev => ({
      ...prev,
      country,
      currency: currency?.code || "USD"
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-collector-black/70">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-collector-black/70 hover:text-collector-orange transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Avatar Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile picture and basic info</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-2xl bg-collector-orange text-white">
                  {profile.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium text-lg">{profile.full_name || user.email}</h3>
                <p className="text-sm text-collector-black/60">{profile.user_type === 'individual' ? 'Individual' : 'Organization'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="border-2 border-collector-gold/30 focus:border-collector-orange"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="border-2 border-collector-gold/30 focus:border-collector-orange"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      className="border-2 border-collector-gold/30 focus:border-collector-orange"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profile.gender} onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_type">Account Type</Label>
                  <Select value={profile.user_type} onValueChange={(value: "individual" | "organization") => setProfile(prev => ({ ...prev, user_type: value }))}>
                    <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={profile.country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.country} value={currency.country}>
                            {currency.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={profile.currency} onValueChange={(value) => setProfile(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-blue-gradient hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
