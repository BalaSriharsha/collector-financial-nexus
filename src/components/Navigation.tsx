
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, User, LogOut, Crown, Gem, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSubscriptionClick = () => {
    if (subscription?.tier === 'Individual') {
      navigate('/pricing');
    }
  };

  const navLinks = [
    { to: "/features", label: "Features" },
    { to: "/pricing", label: "Pricing" },
    { to: "/forum", label: "Forum" },
    { to: "/careers", label: "Careers" },
  ];

  const authenticatedLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/groups", label: "Groups" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const getSubscriptionIcon = () => {
    switch (subscription?.tier) {
      case 'Premium':
        return <Crown className="w-3 h-3 text-orange-600" />;
      case 'Organization':
        return <Crown className="w-3 h-3 text-purple-600" />;
      default:
        return <Gem className="w-3 h-3 text-blue-600" />;
    }
  };

  const getSubscriptionColor = () => {
    switch (subscription?.tier) {
      case 'Premium':
        return 'text-orange-600 border-orange-200';
      case 'Organization':
        return 'text-purple-600 border-purple-200';
      default:
        return 'text-blue-600 border-blue-200 cursor-pointer hover:bg-blue-50';
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-collector-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-gradient rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl brand-logo">
                Vittas
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {authenticatedLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium transition-colors duration-200 hover:text-orange-500 ${
                      isActivePath(link.to)
                        ? 'text-collector-orange'
                        : 'text-collector-black/70'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            ) : (
              navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-orange-500 ${
                    isActivePath(link.to)
                      ? 'text-collector-orange'
                      : 'text-collector-black/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {subscription && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs transition-colors duration-200 ${getSubscriptionColor()}`}
                    onClick={handleSubscriptionClick}
                  >
                    {getSubscriptionIcon()}
                    <span className="ml-1">{subscription.tier}</span>
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full hover:bg-navy-500 hover:text-orange-500 transition-colors">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-navy-500 hover:text-orange-500 transition-colors">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="hover:bg-navy-500 hover:text-orange-500 transition-colors">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/auth')}
                  className="text-collector-black/70 hover:text-orange-500 transition-colors"
                >
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/auth')}
                  className="bg-blue-gradient hover:bg-blue-600 text-white transition-colors"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-8 w-8 p-0 hover:bg-navy-500 hover:text-orange-500 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-collector-gold/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* Subscription Badge for mobile */}
                  {subscription && (
                    <div className="px-3 py-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs transition-colors duration-200 ${getSubscriptionColor()}`}
                        onClick={handleSubscriptionClick}
                      >
                        {getSubscriptionIcon()}
                        <span className="ml-1">{subscription.tier} Plan</span>
                      </Badge>
                    </div>
                  )}
                  
                  {authenticatedLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 hover:bg-navy-500 hover:text-orange-500 ${
                        isActivePath(link.to)
                          ? 'text-collector-orange bg-orange-50'
                          : 'text-collector-black/70'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-collector-black/70 hover:bg-navy-500 hover:text-orange-500 rounded-md transition-colors"
                    >
                      <User className="inline mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-collector-black/70 hover:bg-navy-500 hover:text-orange-500 rounded-md transition-colors"
                    >
                      <LogOut className="inline mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 hover:bg-navy-500 hover:text-orange-500 ${
                        isActivePath(link.to)
                          ? 'text-collector-orange bg-orange-50'
                          : 'text-collector-black/70'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-2 px-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/auth');
                      }}
                      className="w-full justify-start text-collector-black/70 hover:bg-navy-500 hover:text-orange-500 transition-colors"
                    >
                      Sign In
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/auth');
                      }}
                      className="w-full bg-blue-gradient hover:bg-blue-600 text-white transition-colors"
                    >
                      Get Started
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
