
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, User, LogOut, Crown, Gem, Coins } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Don't render navigation on mobile
  if (isMobile) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSubscriptionClick = () => {
    if (subscription?.tier === 'Individual') {
      navigate('/pricing');
    }
  };

  const navLinks: { to: string; label: string }[] = [];

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
        return 'text-blue-600 border-blue-200 cursor-pointer hover-navy';
    }
  };

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-300/20 dark:border-slate-700/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-800 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl brand-logo">
                Vittas
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActivePath(link.to)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
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
                  className="text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white transition-colors"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
