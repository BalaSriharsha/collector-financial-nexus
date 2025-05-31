import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, TrendingUp, PieChart, FileText, Coins } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [userType, setUserType] = useState<'individual' | 'organization' | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard && userType) {
    return <Dashboard userType={userType} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 lg:py-16 flex-1">
        <div className="text-center mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-collector-black mb-4 lg:mb-6 leading-tight">
            Master Your
            <span className="gradient-text block">Financial Empire</span>
          </h2>
          <p className="text-lg lg:text-xl text-collector-black/70 max-w-2xl mx-auto font-inter leading-relaxed px-4">
            Where traditional wisdom meets cutting-edge technology. Manage your finances with the precision of ancient merchants and the power of modern tools.
          </p>
        </div>

        {/* User Type Selection */}
        {!userType && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto animate-fade-in">
            <Card 
              className="ancient-border hover-lift cursor-pointer group bg-white/80 backdrop-blur-sm"
              onClick={() => setUserType('individual')}
            >
              <CardHeader className="text-center pb-6 lg:pb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <CardTitle className="text-xl lg:text-2xl font-playfair text-collector-black">
                  Individual
                </CardTitle>
                <CardDescription className="text-base lg:text-lg text-collector-black/70">
                  Personal financial mastery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div className="flex items-center space-x-3 text-collector-black/80">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-collector-orange flex-shrink-0" />
                  <span className="text-sm lg:text-base">Income & Expenditure Tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-collector-black/80">
                  <PieChart className="w-4 h-4 lg:w-5 lg:h-5 text-collector-gold flex-shrink-0" />
                  <span className="text-sm lg:text-base">Budget Planning & Savings</span>
                </div>
                <div className="flex items-center space-x-3 text-collector-black/80">
                  <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-collector-blue flex-shrink-0" />
                  <span className="text-sm lg:text-base">Document Management</span>
                </div>
                <div className="flex items-center space-x-3 text-collector-black/80">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-collector-orange flex-shrink-0" />
                  <span className="text-sm lg:text-base">Expense Sharing</span>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="ancient-border hover-lift cursor-pointer group bg-white/80 backdrop-blur-sm"
              onClick={() => setUserType('organization')}
            >
              <CardHeader className="text-center pb-6 lg:pb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <CardTitle className="text-xl lg:text-2xl font-playfair text-collector-black">
                  Organization
                </CardTitle>
                <CardDescription className="text-base lg:text-lg text-collector-black/70">
                  Enterprise financial control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div className="flex items-center space-x-3 text-collector-black/80">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-collector-orange flex-shrink-0" />
                  <span className="text-sm lg:text-base">Revenue & Expense Management</span>
                </div>
                <div className="flex items-center space-x-3 text-collector-black/80">
                  <PieChart className="w-4 h-4 lg:w-5 lg:h-5 text-collector-gold flex-shrink-0" />
                  <span className="text-sm lg:text-base">Profit/Loss Analysis</span>
                </div>
                <div className="flex items-center space-x-3 text-collector-black/80">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-collector-blue flex-shrink-0" />
                  <span className="text-sm lg:text-base">Payroll Management</span>
                </div>
                <div className="flex items-center space-x-3 text-collector-black/80">
                  <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-collector-orange flex-shrink-0" />
                  <span className="text-sm lg:text-base">Financial Documentation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Proceed Button */}
        {userType && !showDashboard && (
          <div className="text-center mt-8 lg:mt-12 animate-fade-in">
            <Button 
              onClick={() => setShowDashboard(true)}
              className="bg-blue-gradient hover:bg-blue-600 text-white px-8 lg:px-12 py-3 lg:py-4 text-base lg:text-lg font-playfair rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              Enter Your Financial Realm
            </Button>
          </div>
        )}
      </section>

      {/* Features Preview */}
      <section className="max-w-7xl mx-auto px-4 py-12 lg:py-16 border-t border-collector-gold/20">
        <div className="text-center mb-8 lg:mb-12">
          <h3 className="text-3xl lg:text-4xl font-playfair font-bold text-collector-black mb-4">
            Ancient Wisdom, <span className="gradient-text">Modern Tools</span>
          </h3>
          <p className="text-base lg:text-lg text-collector-black/70 max-w-2xl mx-auto">
            Every transaction tells a story. Every document holds wisdom. Let Collector be your financial chronicler.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <h4 className="text-lg lg:text-xl font-playfair font-semibold text-collector-black mb-2">
              Document Sanctum
            </h4>
            <p className="text-collector-black/70 text-sm lg:text-base">
              Store invoices, receipts, and financial documents with the security of an ancient vault.
            </p>
          </div>
          
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <h4 className="text-lg lg:text-xl font-playfair font-semibold text-collector-black mb-2">
              Prosperity Insights
            </h4>
            <p className="text-collector-black/70 text-sm lg:text-base">
              Visualize your financial journey with elegant charts and timeless wisdom.
            </p>
          </div>
          
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '2s' }}>
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <h4 className="text-lg lg:text-xl font-playfair font-semibold text-collector-black mb-2">
              Shared Ledgers
            </h4>
            <p className="text-collector-black/70 text-sm lg:text-base">
              Split expenses and share financial responsibilities with the grace of ancient guilds.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
