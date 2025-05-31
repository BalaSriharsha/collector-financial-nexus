
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coins, Menu, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "Forum", path: "/forum" },
    { name: "Careers", path: "/careers" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name && !user?.email) return "U";
    
    const name = user.user_metadata?.full_name || user.email;
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-collector-gold/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 lg:py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-blue-gradient rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Coins className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h1 className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
              Collector
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {!user && navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-all duration-300 hover:text-collector-orange relative group ${
                  location.pathname === item.path
                    ? "text-collector-orange"
                    : "text-collector-black/70"
                }`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-collector-orange transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button className="bg-blue-gradient hover:bg-blue-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-300">
                    Dashboard
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full p-0 hover:bg-transparent">
                      <Avatar className="w-10 h-10 border-2 border-collector-gold/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <AvatarImage 
                          src={user.user_metadata?.avatar_url} 
                          alt={user.user_metadata?.full_name || user.email} 
                        />
                        <AvatarFallback className="bg-blue-gradient text-white font-medium">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border-collector-gold/20">
                    <div className="px-3 py-2 border-b border-collector-gold/10">
                      <p className="text-sm font-medium text-collector-black">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-collector-black/60">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center w-full px-3 py-2 text-sm hover:bg-collector-orange/5">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-collector-gold/10" />
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                className="bg-blue-gradient hover:bg-blue-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-300"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started
              </Button>
            )}
          </div>

          {/* Modern Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden relative w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-collector-gold/20 shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="relative w-5 h-5">
              <span className={`absolute block h-0.5 w-5 bg-collector-black/80 transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`}></span>
              <span className={`absolute block h-0.5 w-5 bg-collector-black/80 transform transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute block h-0.5 w-5 bg-collector-black/80 transform transition-all duration-300 ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`}></span>
            </div>
          </Button>
        </div>

        {/* Modern Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 space-y-1 bg-white/95 backdrop-blur-md rounded-2xl mx-2 mb-4 shadow-xl border-2 border-collector-gold/10">
            {!user && navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-6 py-3 text-base font-medium transition-all duration-300 hover:bg-collector-orange/5 hover:text-collector-orange rounded-xl mx-2 group border border-transparent hover:border-collector-orange/20 ${
                  location.pathname === item.path
                    ? "text-collector-orange bg-collector-orange/5 border-collector-orange/20"
                    : "text-collector-black/70"
                }`}
                onClick={() => setIsOpen(false)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="flex items-center justify-between">
                  {item.name}
                  <span className="w-2 h-2 bg-collector-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </span>
              </Link>
            ))}
            
            <div className="px-2 pt-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-collector-orange/5 rounded-xl border border-collector-orange/20">
                    <Avatar className="w-10 h-10 border-2 border-collector-gold/20">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url} 
                        alt={user.user_metadata?.full_name || user.email} 
                      />
                      <AvatarFallback className="bg-blue-gradient text-white font-medium text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-collector-black truncate">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-collector-black/60 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="bg-blue-gradient hover:bg-blue-600 text-white w-full py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-transparent hover:border-blue-300">
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="outline"
                      className="w-full py-3 rounded-xl border-2 border-collector-gold/30 text-collector-black hover:bg-collector-orange/5"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    variant="outline"
                    className="w-full py-3 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  className="bg-blue-gradient hover:bg-blue-600 text-white w-full py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-transparent hover:border-blue-300"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/auth';
                  }}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
