
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chrome, Mail, User, Calendar, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

type AuthMode = 'login' | 'signup' | 'guest';

const Auth = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    gender: '',
    dateOfBirth: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestContinue = () => {
    if (formData.fullName && formData.gender && formData.dateOfBirth) {
      // Store guest user data in localStorage
      localStorage.setItem('guestUser', JSON.stringify({
        fullName: formData.fullName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        userType: 'individual'
      }));
      navigate('/dashboard');
    }
  };

  const handleAuthSubmit = () => {
    // This would integrate with actual auth service
    console.log('Auth submitted:', { authMode, formData });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex flex-col">
      <Navigation />
      
      <section className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md ancient-border bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-playfair text-collector-black">
              {authMode === 'guest' ? 'Continue as Guest' : authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-collector-black/70">
              {authMode === 'guest' 
                ? 'Tell us a bit about yourself to get started'
                : authMode === 'login' 
                ? 'Sign in to your account' 
                : 'Create your Collector account'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {authMode === 'guest' ? (
              // Guest Form
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleGuestContinue}
                  className="w-full bg-blue-gradient hover:bg-blue-600 text-white py-3 rounded-xl"
                  disabled={!formData.fullName || !formData.gender || !formData.dateOfBirth}
                >
                  <User className="w-4 h-4 mr-2" />
                  Continue as Guest
                </Button>
              </div>
            ) : (
              // Login/Signup Form
              <div className="space-y-4">
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleAuthSubmit}
                  className="w-full bg-blue-gradient hover:bg-blue-600 text-white py-3 rounded-xl"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-collector-black/50">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full py-3 rounded-xl border-collector-gold/20 hover:bg-collector-orange/5"
                  onClick={handleAuthSubmit}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
              </div>
            )}
            
            {/* Mode Switching */}
            <div className="space-y-3 pt-4 border-t border-collector-gold/20">
              {authMode !== 'guest' && (
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-collector-orange hover:text-collector-orange/80"
                  >
                    {authMode === 'login' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </Button>
                </div>
              )}
              
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setAuthMode(authMode === 'guest' ? 'login' : 'guest')}
                  className="text-collector-black/60 hover:text-collector-black"
                >
                  {authMode === 'guest' 
                    ? "Back to sign in options" 
                    : "Continue without account"
                  }
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <Footer />
    </div>
  );
};

export default Auth;
