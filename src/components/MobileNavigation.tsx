
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Home, Users, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MobileNavigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActivePath = (path: string) => location.pathname === path;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/groups', label: 'Groups', icon: Users },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-300/20 dark:border-slate-700/20 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.to);
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-2 px-4 text-xs transition-colors duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="flex flex-col items-center py-2 px-4 text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span>Sign Out</span>
        </Button>
      </div>
    </nav>
  );
};

export default MobileNavigation;
