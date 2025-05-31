
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Chrome, Mail, User, Calendar, Users, Building2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

type AuthMode = 'login' | 'signup' | 'guest' | 'signup-org';

const Auth = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    userType: 'individual',
    organizationName: '',
    organizationDescription: '',
    organizationSize: '',
    organizationIndustry: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestContinue = () => {
    if (formData.fullName && formData.gender && formData.dateOfBirth) {
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
    console.log('Auth submitted:', { authMode, formData });
    // Store user data and redirect to dashboard
    if (authMode === 'login') {
      localStorage.setItem('user', JSON.stringify({
        email: formData.email,
        userType: 'individual'
      }));
    } else if (authMode === 'signup') {
      localStorage.setItem('user', JSON.stringify({
        email: formData.email,
        fullName: formData.fullName,
        userType: formData.userType
      }));
    } else if (authMode === 'signup-org') {
      localStorage.setItem('user', JSON.stringify({
        email: formData.email,
        fullName: formData.fullName,
        userType: 'organization',
        organizationName: formData.organizationName,
        organizationDescription: formData.organizationDescription,
        organizationSize: formData.organizationSize,
        organizationIndustry: formData.organizationIndustry
      }));
    }
    navigate('/dashboard');
  };

  const handleSignupUserType = (userType: string) => {
    setFormData(prev => ({ ...prev, userType }));
    if (userType === 'organization') {
      setAuthMode('signup-org');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex flex-col">
      <Navigation />
      
      <section className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-2 border-collector-gold/30 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-playfair text-collector-black">
              {authMode === 'guest' ? 'Continue as Guest' : 
               authMode === 'login' ? 'Welcome Back' : 
               authMode === 'signup-org' ? 'Create Organization Account' :
               'Create Account'}
            </CardTitle>
            <CardDescription className="text-collector-black/70">
              {authMode === 'guest' 
                ? 'Tell us a bit about yourself to get started'
                : authMode === 'login' 
                ? 'Sign in to your account' 
                : authMode === 'signup-org'
                ? 'Set up your organization account'
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
                    className="border-2 border-collector-gold/20 focus:border-collector-orange"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="border-2 border-collector-gold/20 focus:border-collector-orange">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-collector-gold/20 bg-white">
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
                    className="border-2 border-collector-gold/20 focus:border-collector-orange"
                  />
                </div>
                
                <Button 
                  onClick={handleGuestContinue}
                  className="w-full bg-blue-gradient hover:bg-blue-600 text-white py-3 rounded-xl border-2 border-transparent hover:border-blue-300"
                  disabled={!formData.fullName || !formData.gender || !formData.dateOfBirth}
                >
                  <User className="w-4 h-4 mr-2" />
                  Continue as Guest
                </Button>
              </div>
            ) : authMode === 'signup' ? (
              // User Type Selection for Signup
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-sm text-collector-black/70 mb-4">What type of account would you like to create?</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSignupUserType('individual')}
                    className="p-6 h-auto border-2 border-collector-gold/30 hover:border-collector-orange hover:bg-collector-orange/5"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-8 h-8 text-collector-orange" />
                      <div className="text-left">
                        <p className="font-semibold text-collector-black">Individual</p>
                        <p className="text-sm text-collector-black/60">Personal financial management</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSignupUserType('organization')}
                    className="p-6 h-auto border-2 border-collector-gold/30 hover:border-collector-blue hover:bg-collector-blue/5"
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-8 h-8 text-collector-blue" />
                      <div className="text-left">
                        <p className="font-semibold text-collector-black">Organization</p>
                        <p className="text-sm text-collector-black/60">Business financial management</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            ) : authMode === 'signup-org' ? (
              // Organization Signup Form
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Your Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="border-2 border-collector-gold/20 focus:border-collector-orange"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="border-2 border-collector-gold/20 focus:border-collector-orange"
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
                    className="border-2 border-collector-gold/20 focus:border-collector-orange"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Enter your organization name"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="border-2 border-collector-gold/20 focus:border-collector-orange"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationSize">Organization Size</Label>
                  <Select value={formData.organizationSize} onValueChange={(value) => handleInputChange('organizationSize', value)}>
                    <SelectTrigger className="border-2 border-collector-gold/20 focus:border-collector-orange">
                      <SelectValue placeholder="Select organization size" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-collector-gold/20 bg-white">
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationIndustry">Industry</Label>
                  <Input
                    id="organizationIndustry"
                    type="text"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={formData.organizationIndustry}
                    onChange={(e) => handleInputChange('organizationIndustry', e.target.value)}
                    className="border-2 border-collector-gold/20 focus:border-collector-orange"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationDescription">Description</Label>
                  <Textarea
                    id="organizationDescription"
                    placeholder="Brief description of your organization (optional)"
                    value={formData.organizationDescription}
                    onChange={(e) => handleInputChange('organizationDescription', e.target.value)}
                    className="border-2 border-collector-gold/20 focus:border-collector-orange min-h-[80px]"
                  />
                </div>
                
                <Button 
                  onClick={handleAuthSubmit}
                  className="w-full bg-blue-gradient hover:bg-blue-600 text-white py-3 rounded-xl border-2 border-transparent hover:border-blue-300"
                  disabled={!formData.fullName || !formData.email || !formData.password || !formData.organizationName}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Create Organization Account
                </Button>
              </div>
            ) : (
              // Login/Individual Signup Form
              <div className="space-y-4">
                {authMode === 'login' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="border-2 border-collector-gold/20 focus:border-collector-orange"
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
                        className="border-2 border-collector-gold/20 focus:border-collector-orange"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleAuthSubmit}
                      className="w-full bg-blue-gradient hover:bg-blue-600 text-white py-3 rounded-xl border-2 border-transparent hover:border-blue-300"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </>
                )}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-collector-gold/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-collector-black/50">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full py-3 rounded-xl border-2 border-collector-gold/30 hover:bg-collector-orange/5 hover:border-collector-orange"
                  onClick={handleAuthSubmit}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
              </div>
            )}
            
            {/* Mode Switching */}
            <div className="space-y-3 pt-4 border-t border-collector-gold/20">
              {authMode !== 'guest' && authMode !== 'signup' && authMode !== 'signup-org' && (
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setAuthMode('signup')}
                    className="text-collector-orange hover:text-collector-orange/80 border-b border-transparent hover:border-collector-orange"
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              )}
              
              {(authMode === 'signup' || authMode === 'signup-org') && (
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setAuthMode('login')}
                    className="text-collector-orange hover:text-collector-orange/80 border-b border-transparent hover:border-collector-orange"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              )}
              
              {authMode === 'signup-org' && (
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setAuthMode('signup')}
                    className="text-collector-black/60 hover:text-collector-black border-b border-transparent hover:border-collector-black/30"
                  >
                    Back to account type selection
                  </Button>
                </div>
              )}
              
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setAuthMode(authMode === 'guest' ? 'login' : 'guest')}
                  className="text-collector-black/60 hover:text-collector-black border-b border-transparent hover:border-collector-black/30"
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
