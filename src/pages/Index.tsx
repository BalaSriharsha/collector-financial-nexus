
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
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-collector-orange/10 text-collector-orange border-collector-orange/20">
            The Ultimate Financial Management Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-collector-black mb-6">
            Take Control of Your
            <span className="gradient-text block">Financial Future</span>
          </h1>
          
          <p className="text-xl text-collector-black/70 mb-8 max-w-2xl mx-auto">
            Track expenses, manage budgets, share costs with friends, and generate professional invoices all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-gradient hover:bg-blue-600 text-white px-8 py-3">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="border-collector-orange text-collector-orange hover:bg-collector-orange hover:text-white px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-collector-black mb-4">
              Everything You Need to Manage Money
            </h2>
            <p className="text-lg text-collector-black/70 max-w-2xl mx-auto">
              Whether you're an individual or organization, our platform provides all the tools you need for comprehensive financial management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="ancient-border hover-lift bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <DollarSign className="w-12 h-12 text-collector-orange mb-4" />
                <CardTitle className="text-xl">Expense Tracking</CardTitle>
                <CardDescription>
                  Monitor your spending with intelligent categorization and real-time insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="ancient-border hover-lift bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-collector-blue mb-4" />
                <CardTitle className="text-xl">Budget Management</CardTitle>
                <CardDescription>
                  Set and track budgets across different categories with smart alerts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="ancient-border hover-lift bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle className="text-xl">Expense Sharing</CardTitle>
                <CardDescription>
                  Split bills and track shared expenses with friends and colleagues.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="ancient-border hover-lift bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Receipt className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl">Invoice Generation</CardTitle>
                <CardDescription>
                  Create professional invoices with automated tracking and follow-ups.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="ancient-border hover-lift bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-indigo-600 mb-4" />
                <CardTitle className="text-xl">Financial Reports</CardTitle>
                <CardDescription>
                  Generate detailed reports and insights to understand your financial health.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="ancient-border hover-lift bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Shield className="w-12 h-12 text-red-600 mb-4" />
                <CardTitle className="text-xl">Secure & Private</CardTitle>
                <CardDescription>
                  Bank-grade security with end-to-end encryption for your financial data.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-collector-black mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-collector-black/70">
              Whether you're managing personal finances or organizational expenses, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="ancient-border hover-lift bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="text-center">
                <User className="w-16 h-16 text-collector-blue mx-auto mb-4" />
                <CardTitle className="text-2xl">Individual Users</CardTitle>
                <CardDescription className="text-base">
                  Perfect for personal financial management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Personal expense tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Budget planning and monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Split bills with friends</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Financial goal tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="ancient-border hover-lift bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="text-center">
                <Building className="w-16 h-16 text-collector-orange mx-auto mb-4" />
                <CardTitle className="text-2xl">Organizations</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive business financial management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Team expense management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Professional invoice generation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Department budget allocation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Financial reporting and analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-collector-black mb-6">
            Ready to Transform Your Financial Management?
          </h2>
          <p className="text-lg text-collector-black/70 mb-8">
            Join thousands of users who have already taken control of their finances with our platform.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-orange-gradient hover:bg-orange-600 text-white px-8 py-4">
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
