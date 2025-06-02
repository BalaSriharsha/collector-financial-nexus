
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Users, PieChart, Shield, Smartphone, Cloud, Calendar } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Document Sanctum",
      description: "Secure storage for all your financial documents with advanced search and categorization.",
      color: "text-collector-orange"
    },
    {
      icon: TrendingUp,
      title: "Prosperity Insights",
      description: "Real-time analytics and beautiful visualizations to track your financial growth.",
      color: "text-collector-blue"
    },
    {
      icon: Users,
      title: "Expense Sharing",
      description: "Split expenses with individuals or organizations with transparent tracking.",
      color: "text-collector-gold"
    },
    {
      icon: PieChart,
      title: "Budget Planning",
      description: "Smart budgeting tools with automatic categorization and spending alerts.",
      color: "text-collector-orange"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Enterprise-grade encryption to keep your financial data safe and private.",
      color: "text-collector-blue"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access your financial empire from anywhere with our responsive design.",
      color: "text-collector-gold"
    },
    {
      icon: Cloud,
      title: "Cloud Sync",
      description: "Automatic backup and synchronization across all your devices.",
      color: "text-collector-orange"
    },
    {
      icon: Calendar,
      title: "Multi-Period Views",
      description: "Track your finances by day, week, month, quarter, or year.",
      color: "text-collector-blue"
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-playfair font-bold text-collector-black mb-6">
              Powerful Features for
              <span className="gradient-text block">Financial Mastery</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto">
              Discover the tools that make Vittas the ultimate financial management platform for both individuals and organizations.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center`}>
                    <feature.icon className={`w-6 sm:w-8 h-6 sm:h-8 text-white`} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-playfair text-collector-black">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm sm:text-base text-gray-700">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:p-12 border-2 border-slate-300">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-collector-black mb-4">
              Ready to Master Your Finances?
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial lives with Vittas's powerful features.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-playfair rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Start Your Journey
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
