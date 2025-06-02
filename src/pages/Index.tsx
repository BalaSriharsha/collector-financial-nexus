
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, DollarSign, Shield, Users, Zap, Receipt, TrendingUp, Building, User, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Don't render the homepage if user is logged in (already redirecting)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-collector-orange/10 text-collector-orange border-collector-orange/20">
            The Ultimate Financial Management Platform
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-playfair font-bold text-collector-black mb-6">
            Take Control of Your
            <span className="gradient-text block">Financial Future</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Track expenses, manage budgets, share costs with friends, and generate professional invoices all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 px-8 py-3 w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="border-collector-orange text-collector-orange hover:bg-collector-orange hover:text-white px-8 py-3 w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-collector-black mb-4">
              Everything You Need to Manage Money
            </h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              Whether you're an individual or organization, our platform provides all the tools you need for comprehensive financial management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <DollarSign className="w-10 sm:w-12 h-10 sm:h-12 text-collector-orange mb-4" />
                <CardTitle className="text-lg sm:text-xl text-collector-black">Expense Tracking</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-700">
                  Monitor your spending with intelligent categorization and real-time insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <BarChart3 className="w-10 sm:w-12 h-10 sm:h-12 text-collector-blue mb-4" />
                <CardTitle className="text-lg sm:text-xl text-collector-black">Budget Management</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-700">
                  Set and track budgets across different categories with smart alerts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <Users className="w-10 sm:w-12 h-10 sm:h-12 text-green-600 mb-4" />
                <CardTitle className="text-lg sm:text-xl text-collector-black">Expense Sharing</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-700">
                  Split bills and track shared expenses with friends and colleagues.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <Receipt className="w-10 sm:w-12 h-10 sm:h-12 text-purple-600 mb-4" />
                <CardTitle className="text-lg sm:text-xl text-collector-black">Invoice Generation</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-700">
                  Create professional invoices with automated tracking and follow-ups.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <TrendingUp className="w-10 sm:w-12 h-10 sm:h-12 text-indigo-600 mb-4" />
                <CardTitle className="text-lg sm:text-xl text-collector-black">Financial Reports</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-700">
                  Generate detailed reports and insights to understand your financial health.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <Shield className="w-10 sm:w-12 h-10 sm:h-12 text-red-600 mb-4" />
                <CardTitle className="text-lg sm:text-xl text-collector-black">Secure & Private</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-700">
                  Bank-grade security with end-to-end encryption for your financial data.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-12 sm:py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-collector-black mb-4">
              Built for Everyone
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              Whether you're managing personal finances or organizational expenses, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="text-center pb-4">
                <User className="w-12 sm:w-16 h-12 sm:h-16 text-collector-blue mx-auto mb-4" />
                <CardTitle className="text-xl sm:text-2xl text-collector-black">Individual Users</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-700">
                  Perfect for personal financial management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Personal expense tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Budget planning and monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Split bills with friends</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Financial goal tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="text-center pb-4">
                <Building className="w-12 sm:w-16 h-12 sm:h-16 text-collector-orange mx-auto mb-4" />
                <CardTitle className="text-xl sm:text-2xl text-collector-black">Organizations</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-700">
                  Comprehensive business financial management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Team expense management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Professional invoice generation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Department budget allocation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Financial reporting and analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-collector-black mb-6">
            Ready to Transform Your Financial Management?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-8">
            Join thousands of users who have already taken control of their finances with our platform.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 hover:border-orange-600 px-8 py-4 w-full sm:w-auto">
              Start Your Journey Today
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
